import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { SceneConfig } from "@/types/scene";

export class Viewer {
  private scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private sphere: THREE.Mesh;
  private material: THREE.MeshBasicMaterial;
  private textureLoader: THREE.TextureLoader;
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0.1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.textureLoader = new THREE.TextureLoader();

    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.sphere = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.sphere);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.rotateSpeed = -0.4;
    this.controls.enableDamping = true;

    this.animate();
  }

  public async loadScene(scene: SceneConfig) {
    console.log("Viewer: Iniciando carga progresiva...");

    // 1. CARGA RÁPIDA (LOW)
    // Intentamos cargar la versión ligera primero para que el usuario no espere
    try {
      await this.fetchTexture(scene.urlLow);
      console.log("Viewer: Versión Low cargada");
    } catch (error) {
      console.warn("Viewer: No se pudo cargar versión Low, intentando High...", error);
    }

    // 2. CARGA DE ALTA CALIDAD (HIGH/MEDIUM)
    // Se hace en paralelo o después para mejorar la nitidez
    const urlHigh = scene.urlHigh;
    this.fetchTexture(urlHigh)
      .then(() => {
        console.log("Viewer: Versión High cargada y aplicada");
      })
      .catch((err) => console.error("Viewer: Error en versión High", err));
  }

  private fetchTexture(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          this.material.map = texture;
          this.material.needsUpdate = true;
          resolve();
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  private animate() {
    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  public dispose() {
    this.renderer.dispose();
    this.material.dispose();
    this.sphere.geometry.dispose();
    this.controls.dispose();
  }
}
