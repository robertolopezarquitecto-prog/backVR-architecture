import { HotspotManager } from './HotspotManager';

interface Scene {
  id: string;
  imageUrl: string;
  hotspots: { x: number; y: number; targetSceneId: string; label: string }[];
}

const SCENES: Record<string, Scene> = {
  'hall': {
    id: 'hall',
    imageUrl: 'assets/hall.jpg',
    hotspots: [
      { x: 50, y: 60, targetSceneId: 'cocina', label: 'Ir a la Cocina' }
    ]
  },
  'cocina': {
    id: 'cocina',
    imageUrl: 'assets/cocina.jpg',
    hotspots: [
      { x: 20, y: 70, targetSceneId: 'hall', label: 'Volver al Hall' }
    ]
  }
};

const container = document.getElementById('viewer-container')!;
const manager = new HotspotManager(container, (sceneId) => loadScene(sceneId));

function loadScene(sceneId: string) {
  const scene = SCENES[sceneId];
  if (!scene) return;

  console.log(`Cargando escena: ${scene.id}`);
  // Aquí cambiarías el fondo de tu visor VR (Three.js, Panellum, etc.)
  // document.body.style.backgroundImage = `url(${scene.imageUrl})`;

  manager.clear();
  scene.hotspots.forEach(h => manager.addHotspot(h.x, h.y, h.targetSceneId, h.label));
}

// Carga inicial
loadScene('hall');