import { SceneController, Scene } from './SceneController';

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
const controller = new SceneController(container, SCENES);

// Carga inicial
controller.init('hall');