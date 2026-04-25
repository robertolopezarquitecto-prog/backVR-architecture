import * as THREE from 'three';

export class HotspotManager {
    constructor(viewer) {
        this.viewer = viewer;
        this.hotspots = [];
    }

    addPortal(position, targetSceneId, label = 'Portal') {
        const div = document.createElement('div');
        div.className = 'hotspot';
        div.innerHTML = `
            <div class="hotspot-inner"></div>
            <div class="hotspot-label">${label}</div>
        `;
        
        // Convertir posición simple {x, y, z} a Vector3 y escalar para que esté lejos de la cámara
        const posVector = new THREE.Vector3(position.x, position.y, position.z);
        
        const hotspot = {
            element: div,
            position: posVector.normalize().multiplyScalar(400),
            targetSceneId: targetSceneId
        };

        div.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Navegando a:', targetSceneId);
            window.dispatchEvent(new CustomEvent('portal-click', { detail: targetSceneId }));
        });

        document.getElementById('viewer-container').appendChild(div);
        this.hotspots.push(hotspot);
        this.updateHotspotPositions();
    }

    updateHotspotPositions() {
        this.hotspots.forEach(h => {
            const vector = h.position.clone().project(this.viewer.camera);
            
            // Si está detrás de la cámara (z > 1), ocultar
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

    clear() {
        this.hotspots.forEach(h => h.element.remove());
        this.hotspots = [];
    }
}
