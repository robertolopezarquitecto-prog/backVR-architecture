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
        // Cargar escena inicial (Placeholder)
        // Usaremos una imagen de prueba por ahora
        const testImage = 'https://threejs.org/examples/textures/2294472375_b9a84c5c3d_o.jpg';
        
        try {
            await this.viewer.loadTexture(testImage);
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 500);

            // Iniciar telemetría
            this.telemetry.start();

            // Ejemplo de Hotspot (Portal)
            this.hotspots.addPortal({ x: 1, y: 0, z: -1 }, 'cocina');
            
            this.animate();
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

        // Eventos de navegación entre escenas
        window.addEventListener('portal-click', (e) => {
            const sceneId = e.detail;
            console.log('Cambiando a escena:', sceneId);
            this.telemetry.setScene(sceneId);
            // Aquí cargaríamos la nueva textura del bucket de GCS
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.hotspots.updateHotspotPositions();
    }
}

new App();
