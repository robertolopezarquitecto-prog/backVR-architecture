"use client";

import { useEffect, useRef, useState } from "react";
import { addDoc, collection, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { HotspotManager } from "@/lib/three/HotspotManager";
import { Viewer } from "@/lib/three/Viewer";
import type { SceneConfig } from "@/types/scene";

export default function VRViewer({ mode = "backoffice" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const hotspotRef = useRef<HotspotManager | null>(null);

  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [dbStatus, setDbStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const v = new Viewer(containerRef.current.id);
    viewerRef.current = v;
    hotspotRef.current = new HotspotManager(v.camera, containerRef.current);
    const animate = () => {
      hotspotRef.current?.updatePositions();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    setIsEngineReady(true);
    return () => v.dispose();
  }, []);

  useEffect(() => {
    if (!isEngineReady) return;
    const q = query(collection(db, "scenes"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setDbStatus("connected");
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || { seconds: Date.now() / 1000 },
        })) as SceneConfig[];

        data.sort((a, b) => {
          const timeA = (a.createdAt as { seconds?: number })?.seconds || 0;
          const timeB = (b.createdAt as { seconds?: number })?.seconds || 0;
          return timeB - timeA;
        });

        setScenes(data);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setDbStatus("error");
      },
    );
    return () => unsubscribe();
  }, [isEngineReady]);

  const loadScene = async (scene: SceneConfig) => {
    if (!viewerRef.current) return;
    setIsLoading(true);
    try {
      await viewerRef.current.loadScene(scene);
      setCurrentSceneId(scene.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onUpload = async (file: File) => {
    if (!viewerRef.current) return;
    setIsUploading(true);
    const localUrl = URL.createObjectURL(file);
    try {
      viewerRef.current.loadScene({ id: "temp", name: file.name, urlLow: localUrl, urlHigh: localUrl, portals: [] });

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        const docRef = await addDoc(collection(db, "scenes"), {
          name: data.name,
          urlHigh: data.urls.high,
          urlMedium: data.urls.medium,
          urlLow: data.urls.low,
          portals: [],
          createdAt: serverTimestamp(),
        });

        const base = tunnelUrl || window.location.origin;
        setShareLink(`${base}/tour?id=${docRef.id}&name=${encodeURIComponent(file.name)}`);
        setCurrentSceneId(docRef.id);
      }
    } catch (e) {
      console.error(e);
      alert("Error al guardar: " + (e as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  let statusText = "Sincronizando...";
  if (isUploading) {
    statusText = "Subiendo...";
  } else if (dbStatus === "connected") {
    statusText = `En línea (${scenes.length})`;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      <div id="viewer-container" ref={containerRef} className="w-full h-screen" />

      {mode === "backoffice" && (
        <div className="absolute top-0 left-0 w-72 h-full bg-black/90 backdrop-blur-3xl border-r border-white/5 z-30 p-8 flex flex-col gap-8">
          <div>
            <h1 className="text-white font-black text-2xl italic tracking-tighter leading-none">
              back<span className="text-blue-500">VR</span>
            </h1>
            <p className="text-white/30 text-[9px] uppercase font-bold mt-1 tracking-widest">by backESTUDIO</p>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${dbStatus === "connected" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-yellow-500 animate-pulse"} ${isUploading ? "animate-ping" : ""}`}
                />
                <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest">{statusText}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            <p className="text-white/20 text-[9px] uppercase font-bold tracking-widest px-2 mb-2">Escenas</p>
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => loadScene(s)}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${currentSceneId === s.id ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"}`}
              >
                <div className={`w-1 h-1 rounded-full ${currentSceneId === s.id ? "bg-white" : "bg-white/20"}`} />
                <span className="text-[11px] font-semibold truncate">{s.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-auto bg-white text-black font-bold py-4 rounded-2xl text-[11px] hover:bg-blue-500 hover:text-white transition-all uppercase tracking-tighter"
          >
            Subir Render 8K
          </button>
        </div>
      )}

      {isLoading && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/50 text-[9px] uppercase font-bold tracking-widest">Cargando</span>
        </div>
      )}

      {mode === "backoffice" && (
        <div className="absolute top-8 right-8 flex flex-col gap-4 items-end z-20">
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 w-60 backdrop-blur-md">
            <label className="text-white/20 text-[8px] uppercase font-bold block mb-2 px-1">Enlace Cliente</label>
            <input
              type="text"
              placeholder="URL Túnel..."
              value={tunnelUrl}
              onChange={(e) => setTunnelUrl(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white outline-none w-full"
            />
          </div>
          {shareLink && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                alert("¡Link copiado!");
              }}
              className="bg-blue-600 text-white text-[10px] font-black py-4 px-8 rounded-2xl shadow-2xl hover:bg-blue-500 transition-all uppercase tracking-widest"
            >
              Copiar Enlace
            </button>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
      />

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
}
