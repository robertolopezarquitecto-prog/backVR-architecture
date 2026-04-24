import * as THREE from 'three';

export class HotspotManager {
    constructor(viewer) {
        this.viewer = viewer;
        this.hotspots = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    addPortal(position, targetSceneId) {
        const div = document.createElement('div');
        div.className = 'hotspot';
        div.innerHTML = '<div class="hotspot-inner"></div>';
        
        const hotspot = {
            element: div,
            position: position.clone().normalize().multiplyScalar(400),
            targetSceneId: targetSceneId
        };

        div.addEventListener('click', () => {
            console.log('Navegando a:', targetSceneId);
            // Disparar evento de navegación
            window.dispatchEvent(new CustomEvent('portal-click', { detail: targetSceneId }));
        });

        document.body.appendChild(div);
        this.hotspots.push(hotspot);
        this.updateHotspotPositions();
    }

    updateHotspotPositions() {
        this.hotspots.forEach(h => {
            const vector = h.position.clone().project(this.viewer.camera);
            
            // Si está detrás de la cámara, ocultar
            if (vector.z > 1) {
                h.element.style.display = 'none';
            } else {
                h.element.style.display = 'flex';
                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
                h.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            }
        });
    }

    clear() {
        this.hotspots.forEach(h => h.element.remove());
        this.hotspots = [];
    }
}
