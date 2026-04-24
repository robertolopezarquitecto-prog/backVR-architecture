import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Viewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Sphere for 360 image
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert sphere
        this.material = new THREE.MeshBasicMaterial();
        this.sphere = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.sphere);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.rotateSpeed = -0.5;

        this.initEventListeners();
        this.animate();
    }

    async loadTexture(url) {
        const loader = new THREE.TextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, (texture) => {
                this.material.map = texture;
                this.material.needsUpdate = true;
                resolve();
            }, undefined, reject);
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
