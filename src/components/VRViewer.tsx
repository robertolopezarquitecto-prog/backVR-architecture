"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useTelemetry } from "@/hooks/use-telemetry";
import { db } from "@/lib/firebase/config";
import { TelemetryService } from "@/lib/firebase/telemetry";
import { Viewer } from "@/lib/three/Viewer";
import type { SceneConfig } from "@/types/scene";

const SCENES: Record<string, SceneConfig> = {
  salon: {
    id: "salon",
    name: "Salón Principal",
    urlLow: "https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render_low.png", // Placeholder for low res
    urlHigh: "https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render.png",
    portals: [{ id: "cocina", position: { x: 0.707, y: -0.1, z: -0.707 }, label: "Ir a Cocina" }],
  },
  cocina: {
    id: "cocina",
    name: "Cocina Americana",
    urlLow: "https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render-cocina_low.png", // Placeholder
    urlHigh: "https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render-cocina.png",
    portals: [{ id: "salon", position: { x: -0.707, y: -0.1, z: 0.707 }, label: "Volver al Salón" }],
  },
};

type VRViewerProps = {
  mode?: "backoffice" | "player";
  initialSceneUrl?: string;
  sceneName?: string;
};

export default function VRViewer({ mode = "backoffice", initialSceneUrl, sceneName }: VRViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const hotspotRef = useRef<HotspotManager | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState("salon");
  const [localSceneName, setLocalSceneName] = useState<string | null>(null);
  const [gyroAllowed, setGyroAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [tunnelUrl, setTunnelUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { recordSessionStart, recordSceneChange } = useTelemetry();

  useEffect(() => {
    // Intentar autodetectar el túnel si no es localhost
    if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
      setTunnelUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (mode === "backoffice") {
      const q = query(collection(db, "scenes"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const loadedScenes = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            urlLow: data.urlLow,
            urlHigh: data.urlHigh,
            portals: data.portals || [],
          };
        }) as SceneConfig[];
        setScenes(loadedScenes);
      });
    }
  }, [mode]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Viewer
    const viewer = new Viewer(containerRef.current.id);
    viewerRef.current = viewer;

    // Initialize Hotspots
    const hotspots = new HotspotManager(viewer.camera, containerRef.current);
    hotspotRef.current = hotspots;

    // Start Telemetry
    const telemetry = TelemetryService.getInstance();
    telemetry.start(currentSceneId);
    recordSessionStart("salon");

    // Telemetry Loop (500ms)
    const telemetryInterval = setInterval(() => {
      if (viewerRef.current) {
        const gaze = viewerRef.current.getGazeDirection();
        const movementType = viewerRef.current.getMovementType();
        telemetry.logGaze({ x: gaze.x, y: gaze.y, z: gaze.z }, movementType);
      }
    }, 500);

    // Initial Scene Load
    if (mode === "player" && initialSceneUrl) {
      setCurrentSceneId("player");
      setLocalSceneName(sceneName || "Recorrido");
      const tempScene: SceneConfig = {
        id: "player",
        name: sceneName || "Recorrido",
        urlLow: initialSceneUrl,
        urlHigh: initialSceneUrl,
        portals: [],
      };
      viewerRef.current
        .loadScene(tempScene)
        .then(() => setIsLoading(false))
        .catch(console.error);
    } else {
      loadScene("salon").catch((err) => console.error("Error loading initial scene:", err));
    }

    // Animation loop for hotspots
    const animate = () => {
      hotspots.updatePositions();
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);

    // Before unload: Log session end
    window.onbeforeunload = () => {
      telemetry.logSessionEnd();
    };

    return () => {
      clearInterval(telemetryInterval);
      cancelAnimationFrame(animId);
      viewer.dispose();
      hotspots.dispose();
      telemetry.stop();
    };
  }, [recordSessionStart]);

  const loadScene = async (sceneId: string) => {
    let scene = SCENES[sceneId];

    // Si no está en las constantes, buscar en las subidas dinámicamente
    if (!scene) {
      scene = scenes.find((s) => s.id === sceneId) as SceneConfig;
    }

    if (!scene || !viewerRef.current || !hotspotRef.current) return;

    setIsLoading(true);
    setCurrentSceneId(sceneId);

    try {
      // Update Telemetry
      TelemetryService.getInstance().setScene(sceneId);
      recordSceneChange(sceneId);

      // Load 3D Scene
      await viewerRef.current.loadScene(scene);

      // Update Portals
      hotspotRef.current.clear();
      (scene.portals || []).forEach((p) => {
        hotspotRef.current?.addHotspot(p.id, p.position, p.label, (targetId) => {
          // Tracking GA4
          TelemetryService.getInstance().trackVRInteraction("hotspot_click", {
            from_scene: sceneId,
            to_scene: targetId,
            label: p.label,
          });

          // eslint-disable-next-line sonarjs/no-nested-functions
          loadScene(targetId).catch((err) => console.error("Error navigating to scene:", err));
        });
      });
    } catch (err) {
      console.error("Failed to load scene:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalImage = async (file: File) => {
    if (!viewerRef.current || !hotspotRef.current) return;
    const objectUrl = URL.createObjectURL(file);
    setIsLoading(true);
    setCurrentSceneId("local");
    setLocalSceneName(file.name);
    setShareLink(null);

    TelemetryService.getInstance().setScene("local");

    const tempScene: SceneConfig = {
      id: "local",
      name: file.name,
      urlLow: objectUrl,
      urlHigh: objectUrl,
      portals: [],
    };

    try {
      hotspotRef.current.clear();
      await viewerRef.current.loadScene(tempScene);

      // Upload to server to generate shareable link
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success && typeof window !== "undefined") {
        const base = tunnelUrl || window.location.origin;
        setShareLink(`${base}/tour?id=${data.scene.id}&name=${encodeURIComponent(file.name)}`);

        // Cambiar a la escena recién subida
        loadScene(data.scene.id);
      }
    } catch (err) {
      console.error("Failed to load local scene:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadLocalImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGyroRequest = async () => {
    if (viewerRef.current) {
      const granted = await viewerRef.current.requestGyroPermission();
      setGyroAllowed(granted);

      // Tracking GA4
      TelemetryService.getInstance().trackVRInteraction("gyroscope_toggle", {
        status: granted ? "granted" : "denied",
      });
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden"
      onDrop={mode === "backoffice" ? handleDrop : undefined}
      onDragOver={mode === "backoffice" ? handleDragOver : undefined}
    >
      <div id="viewer-container" ref={containerRef} className="w-full h-screen cursor-grab active:cursor-grabbing" />

      {/* Sidebar de Escenas (Backoffice) */}
      {mode === "backoffice" && (
        <div className="absolute top-0 left-0 w-64 h-full bg-black/80 backdrop-blur-xl border-r border-white/10 z-30 p-6 flex flex-col gap-6 animate-in slide-in-from-left duration-500">
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-bold text-lg tracking-tight">Escenas del Tour</h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Gestión de Recorrido</p>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
            {/* Escenas precargadas */}
            {Object.values(SCENES).map((scene) => (
              <button
                key={scene.id}
                onClick={() => loadScene(scene.id)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left border ${
                  currentSceneId === scene.id
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${currentSceneId === scene.id ? "bg-blue-400 animate-pulse" : "bg-white/20"}`}
                />
                <span className="text-xs font-medium truncate">{scene.name}</span>
              </button>
            ))}

            <div className="h-px bg-white/10 my-2" />
            <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-1">Subidas Recientemente</p>

            {/* Escenas dinámicas de Firestore */}
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => loadScene(scene.id)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left border ${
                  currentSceneId === scene.id
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${currentSceneId === scene.id ? "bg-blue-400 animate-pulse" : "bg-white/20"}`}
                />
                <span className="text-xs font-medium truncate">{scene.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-auto bg-white text-black font-bold py-3 rounded-xl text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir Escena
          </button>
        </div>
      )}

      {/* Info Badge (Player) */}
      {mode === "player" && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white text-sm font-medium tracking-wide">
            {localSceneName || "Cargando recorrido..."}
          </div>
        </div>
      )}

      {/* UI Overlays */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white mt-4 font-light tracking-widest uppercase text-xs">Cargando Espacio</span>
        </div>
      )}

      {!gyroAllowed && mode === "player" && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
          <button
            onClick={handleGyroRequest}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-white/20 transition-all flex items-center gap-2 group"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-12 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Activar Giroscopio (Móvil)
          </button>
        </div>
      )}

      {/* Logger Status & Local Upload */}
      {mode === "backoffice" && (
        <div className="absolute top-6 right-6 flex flex-col gap-3 items-end z-20">
          <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded text-[10px] font-mono pointer-events-none">
            LOGGER MODE: ACTIVE
          </div>

          <div className="flex flex-col gap-1 w-full max-w-[200px]">
            <label className="text-white/50 text-[9px] uppercase tracking-wider font-bold">URL del Túnel</label>
            <input
              type="text"
              placeholder="https://...loca.lt"
              value={tunnelUrl}
              onChange={(e) => setTunnelUrl(e.target.value)}
              className="bg-black/50 border border-white/20 rounded px-2 py-1 text-[10px] text-white focus:border-blue-500 outline-none w-full"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-black/50 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded text-xs hover:bg-white/20 hover:border-white/50 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Subir Render Local
          </button>

          {shareLink && (
            <div className="bg-black/80 backdrop-blur-md border border-blue-500/50 p-4 rounded-lg mt-2 flex flex-col gap-2 max-w-xs animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="text-blue-400 text-xs font-semibold">Enlace Público (Player)</span>
              <input
                type="text"
                readOnly
                value={shareLink}
                className="bg-black text-[10px] text-white p-2 rounded border border-white/20 w-full font-mono focus:outline-none"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareLink)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded transition-colors"
              >
                Copiar Enlace
              </button>
              <p className="text-[9px] text-white/40 italic mt-1 leading-tight">
                * Recuerda pulsar "Click to Continue" en el móvil si aparece el aviso de localtunnel.
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                loadLocalImage(e.target.files[0]);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
