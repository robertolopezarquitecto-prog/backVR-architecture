import { HotspotManager } from './HotspotManager';

export interface Scene {
  id: string;
  imageUrl: string;
  hotspots: { x: number; y: number; targetSceneId: string; label: string }[];
}

export class SceneController {
  private container: HTMLElement;
  private manager: HotspotManager;
  private scenes: Record<string, Scene>;

  constructor(container: HTMLElement, scenes: Record<string, Scene>) {
    this.container = container;
    this.scenes = scenes;
    // El manager ahora llamará a nuestra función con transición
    this.manager = new HotspotManager(container, (id) => this.loadSceneWithTransition(id));
  }

  /**
   * Ejecuta la lógica de transición "Walk-through"
   */
  async loadSceneWithTransition(sceneId: string) {
    const scene = this.scenes[sceneId];
    if (!scene) return;

    // 1. Zoom suave hacia adelante (Simula caminar)
    this.container.classList.add('scene-exit');
    
    // Esperamos 600ms (duración de la transición CSS)
    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Cambio de imagen de fondo y limpieza de hotspots antiguos
    this.container.style.backgroundImage = `url(${scene.imageUrl})`;
    this.manager.clear();

    // 3. Preparar la entrada: la nueva escena aparece ligeramente ampliada
    this.container.classList.remove('scene-exit');
    this.container.classList.add('scene-enter-start');
    
    // Reflow técnico para que el navegador aplique el estado inicial sin transición
    void this.container.offsetWidth;

    // 4. Animación de llegada: Escala 1.1 -> 1.0 (Zoom out suave)
    this.container.classList.remove('scene-enter-start');
    this.container.classList.add('scene-enter-active');

    // Renderizar los nuevos puntos de interés
    scene.hotspots.forEach(h => this.manager.addHotspot(h.x, h.y, h.targetSceneId, h.label));

    // Limpiar clases temporales tras la animación
    setTimeout(() => {
      this.container.classList.remove('scene-enter-active');
    }, 600);
  }

  // Carga inicial sin transición agresiva
  init(initialSceneId: string) {
    const scene = this.scenes[initialSceneId];
    if (scene) this.loadSceneWithTransition(initialSceneId);
  }
}