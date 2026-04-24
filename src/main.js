import { Viewer } from './Viewer';
import { HotspotManager } from './HotspotManager';
import { Telemetry } from './Telemetry';
import './style.css';

class App {
    constructor() {
        this.viewer = new Viewer('viewer-container');
        this.hotspots = new HotspotManager(this.viewer);
        this.telemetry = new Telemetry(this.viewer);
        
        this.init();
    }

    async init() {
        // Cargar escena inicial desde Google Cloud Storage
        const testImage = 'https://storage.googleapis.com/backvr-architecture-storage/renders/mi_primer_render.png';
        
        try {
            console.log('Iniciando carga de textura:', testImage);
            await this.viewer.loadTexture(testImage);
            console.log('Textura cargada con éxito');
            
            // Ocultar pantalla de carga
            const loader = document.getElementById('loading-screen');
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);

            // Iniciar telemetría y hotspots
            this.telemetry.start();
            this.hotspots.addPortal({ x: 1, y: 0, z: -1 }, 'cocina');
            
            // Iniciar ciclo de actualización de hotspots
            this.update();
        } catch (err) {
            console.error('Error cargando la experiencia:', err);
        }

        this.initUI();
    }

    initUI() {
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        window.addEventListener('portal-click', (e) => {
            console.log('Cambiando a escena:', e.detail);
            this.telemetry.setScene(e.detail);
        });
    }

    update() {
        requestAnimationFrame(() => this.update());
        this.hotspots.updateHotspotPositions();
    }
}

// Iniciar aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
