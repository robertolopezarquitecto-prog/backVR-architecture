import * as THREE from 'three';

export interface Hotspot {
    id: string;
    element: HTMLElement;
    position: THREE.Vector3;
    label: string;
}

export class HotspotManager {
    private hotspots: Hotspot[] = [];
    private camera: THREE.Camera;
    private container: HTMLElement;

    constructor(camera: THREE.Camera, container: HTMLElement) {
        this.camera = camera;
        this.container = container;
    }

    public addHotspot(id: string, position: { x: number; y: number; z: number }, label: string, onClick: (id: string) => void) {
        const div = document.createElement('div');
        div.className = 'hotspot group absolute cursor-pointer z-10 transition-all duration-300';
        div.innerHTML = `
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-transform">
                <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div class="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                ${label}
            </div>
        `;

        div.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(id);
        });

        this.container.appendChild(div);
        
        this.hotspots.push({
            id,
            element: div,
            position: new THREE.Vector3(position.x, position.y, position.z).normalize().multiplyScalar(400),
            label
        });
    }

    public updatePositions() {
        this.hotspots.forEach(h => {
            const vector = h.position.clone().project(this.camera);
            
            if (vector.z > 1) {
                h.element.style.opacity = '0';
                h.element.style.pointerEvents = 'none';
            } else {
                h.element.style.opacity = '1';
                h.element.style.pointerEvents = 'auto';
                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
                h.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            }
        });
    }

    public clear() {
        this.hotspots.forEach(h => h.element.remove());
        this.hotspots = [];
    }

    public dispose() {
        this.clear();
    }
}
