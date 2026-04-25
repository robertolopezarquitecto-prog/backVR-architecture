import { Viewer } from './Viewer';
import { HotspotManager } from './HotspotManager';
import { Telemetry } from './Telemetry';
import { SCENES } from './scenes';
import './style.css';

class App {
    constructor() {
        this.viewer = new Viewer('viewer-container');
        this.hotspots = new HotspotManager(this.viewer);
        this.telemetry = new Telemetry(this.viewer);
        
        this.init();
    }

    async init() {
        // Cargar escena inicial (Salón)
        await this.loadScene('salon');
        
        this.initUI();
        this.update();
    }

    async loadScene(sceneId) {
        const sceneData = SCENES[sceneId];
        if (!sceneData) return;

        console.log('Cargando escena:', sceneData.name);
        
        // Mostrar pantalla de carga
        const loader = document.getElementById('loading-screen');
        loader.style.display = 'flex';
        loader.style.opacity = '1';

        try {
            // 1. Cargar textura
            await this.viewer.loadTexture(sceneData.url);
            
            // 2. Limpiar y añadir nuevos hotspots
            this.hotspots.clear();
            sceneData.portals.forEach(p => {
                this.hotspots.addPortal(p.position, p.id, p.label);
            });

            // 3. Actualizar telemetría
            this.telemetry.setScene(sceneId);

            // 4. Iniciar telemetría si no está iniciada
            this.telemetry.start();

            // Ocultar pantalla de carga
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 500);

        } catch (err) {
            console.error('Error cargando la escena:', err);
            // Si falla (ej. no existe el render de la cocina), mostrar aviso
            alert(`No se pudo cargar la imagen de ${sceneData.name}. Asegúrate de que el archivo existe en el bucket.`);
        }
    }

    initUI() {
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Escuchar clics en portales
        window.addEventListener('portal-click', (e) => {
            this.loadScene(e.detail);
        });
    }

    update() {
        requestAnimationFrame(() => this.update());
        this.hotspots.updateHotspotPositions();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App();
});
