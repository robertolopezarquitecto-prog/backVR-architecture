"use client";

import { useEffect, useRef, useState } from "react";
import { useTelemetry } from "@/hooks/use-telemetry";
import { TelemetryService } from "@/lib/firebase/telemetry";
import { HotspotManager } from "@/lib/three/HotspotManager";
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

export default function VRViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const hotspotRef = useRef<HotspotManager | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState("salon");
  const [gyroAllowed, setGyroAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { recordSessionStart, recordSceneChange } = useTelemetry();

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

    // Scene Loading Logic
    loadScene("salon");

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
    const scene = SCENES[sceneId];
    if (!scene || !viewerRef.current || !hotspotRef.current) return;

    setIsLoading(true);
    setCurrentSceneId(sceneId);

    // Update Telemetry
    TelemetryService.getInstance().setScene(sceneId);
    recordSceneChange(sceneId);

    // Load 3D Scene
    await viewerRef.current.loadScene(scene);

    // Update Portals
    hotspotRef.current.clear();
    scene.portals.forEach((p) => {
      hotspotRef.current?.addHotspot(p.id, p.position, p.label, (targetId) => {
        loadScene(targetId);
      });
    });

    setIsLoading(false);
  };

  const handleGyroRequest = async () => {
    if (viewerRef.current) {
      const granted = await viewerRef.current.requestGyroPermission();
      setGyroAllowed(granted);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div id="viewer-container" ref={containerRef} className="w-full h-screen cursor-grab active:cursor-grabbing" />

      {/* UI Overlays */}
      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-white font-light tracking-widest text-xl uppercase opacity-80">backVR</h1>
        <p className="text-blue-400 text-xs font-mono mt-1">{SCENES[currentSceneId]?.name}</p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
        {!gyroAllowed && (
          <button
            onClick={handleGyroRequest}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-sm hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            Activar Giroscopio
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white mt-4 font-light tracking-widest uppercase text-xs">Cargando Espacio</span>
        </div>
      )}

      {/* Logger Status */}
      <div className="absolute top-6 right-6 z-20 pointer-events-none">
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-3 py-1 rounded text-[10px] font-mono">
          LOGGER MODE: ACTIVE
        </div>
      </div>
    </div>
  );
}
