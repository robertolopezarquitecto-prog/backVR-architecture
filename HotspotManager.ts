export class HotspotManager {
  private container: HTMLElement;
  private onNavigate: (sceneId: string) => void;

  constructor(container: HTMLElement, onNavigate: (sceneId: string) => void) {
    this.container = container;
    this.onNavigate = onNavigate;
  }

  addHotspot(x: number, y: number, sceneId: string) {
    const div = document.createElement('div');
    div.className = 'hotspot-point';
    
    // Estilos críticos que sugirió el nuevo Ant
    div.style.position = 'absolute';
    div.style.left = `${x}%`;
    div.style.top = `${y}%`;
    div.style.width = '40px'; // Un poco más grande para que sea fácil de pulsar
    div.style.height = '40px';
    div.style.borderRadius = '50%';
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    div.style.border = '2px solid white';
    div.style.cursor = 'pointer';
    div.style.pointerEvents = 'auto'; // ¡ESTO ES LO MÁS IMPORTANTE!
    div.style.zIndex = '1000';

    // El evento de clic que nos llevará a la cocina
    div.addEventListener('click', (e) => {
      e.stopPropagation(); // Para que el clic no se pierda
      console.log("¡Click detectado en hotspot!", sceneId);
      this.onNavigate(sceneId);
    });

    this.container.appendChild(div);
  }

  clear() {
    this.container.innerHTML = '';
  }
}