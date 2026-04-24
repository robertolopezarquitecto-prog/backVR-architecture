import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Viewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111); // Fondo gris muy oscuro para ver que renderiza
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 0.1); // Mover mínima distancia para que OrbitControls funcione

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Esfera para la imagen 360 - Corregir efecto espejo escalando negativamente
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Voltear la geometría para corregir el espejo
        this.material = new THREE.MeshBasicMaterial({
            color: 0xffffff // Color base blanco
        });
        this.sphere = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.sphere);

        // OrbitControls optimizados para vista interior
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.rotateSpeed = -0.4; // Velocidad negativa para rotación natural
        this.controls.target.set(0, 0, 0); // Mirar al centro de la esfera
        this.controls.update();

        this.initEventListeners();
        this.animate();
    }

    async loadTexture(url) {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous'); // Vital para CORS en GCS
        
        return new Promise((resolve, reject) => {
            loader.load(url, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace; // Color correcto para renders
                this.material.map = texture;
                this.material.needsUpdate = true;
                resolve();
            }, 
            (xhr) => {
                if (xhr.lengthComputable) {
                    const percent = (xhr.loaded / xhr.total) * 100;
                    console.log(`Cargando render: ${percent.toFixed(2)}%`);
                }
            }, 
            (err) => {
                console.error('Error cargando textura 360:', err);
                reject(err);
            });
        });
    }

    initEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        this.renderer.setAnimationLoop(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        });
    }
}
