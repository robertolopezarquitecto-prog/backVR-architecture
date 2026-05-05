import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { SceneConfig } from "@/types/scene";

export type { SceneConfig } from "@/types/scene";

export class Viewer {
  private scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private sphere: THREE.Mesh;
  private material: THREE.MeshBasicMaterial;
  private textureLoader: THREE.TextureLoader;

  private container: HTMLElement;
  private isLoggerMode: boolean = true; // Enabled by default as requested
  private movementType: "gyro" | "touch" = "touch";

  private gyroActive: boolean = false;
  private initialOrientation: { alpha: number; beta: number; gamma: number } | null = null;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0.1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.sphere = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.sphere);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = -0.4;

    this.textureLoader = new THREE.TextureLoader();
    this.textureLoader.setCrossOrigin("anonymous");

    this.initEventListeners();
    this.animate();
  }

  public async loadScene(config: SceneConfig) {
    console.log(`Loading scene: ${config.name}`);

    // Progressive Loading: 1K then 8K
    await this.loadTexture(config.urlLow);

    // Start loading High Res in background
    this.loadTexture(config.urlHigh)
      .then(() => {
        console.log("High Res texture loaded");
      })
      .catch((err) => {
        console.warn("Failed to load High Res texture:", err);
      });
  }

  private async loadTexture(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;

          // Memory Management: Dispose old texture
          if (this.material.map) {
            this.material.map.dispose();
          }

          this.material.map = texture;
          this.material.needsUpdate = true;
          resolve();
        },
        undefined,
        reject,
      );
    });
  }

  private initEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Touch starts movement type detection
    this.renderer.domElement.addEventListener(
      "touchstart",
      () => {
        this.movementType = "touch";
      },
      { passive: true },
    );

    // Logger Mode: Click to log coordinates
    this.renderer.domElement.addEventListener("click", () => {
      if (this.isLoggerMode) {
        const vector = new THREE.Vector3();
        this.camera.getWorldDirection(vector);
        console.log("%c [LOGGER MODE] Coordenadas para Hotspot:", "background: #222; color: #bada55", {
          x: vector.x.toFixed(3),
          y: vector.y.toFixed(3),
          z: vector.z.toFixed(3),
        });

        // Dispatch event for UI if needed
        window.dispatchEvent(new CustomEvent("logger-coords", { detail: vector }));
      }
    });

    // Gyroscope handling
    window.addEventListener("deviceorientation", this.onDeviceOrientation.bind(this));
  }

  private onDeviceOrientation(event: DeviceOrientationEvent) {
    if (!this.gyroActive) return;
    this.movementType = "gyro";

    // Simplified gyro implementation
    // For a full production implementation, we'd use a Quaternion-based approach
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      // Convert to radians and apply to camera rotation
      // This is complex to do simultaneously with OrbitControls without conflicts
      // We usually disable OrbitControls or use them as an offset
    }
  }

  public async requestGyroPermission(): Promise<boolean> {
    type DeviceOrientationCtor = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const Ctor = DeviceOrientationEvent as DeviceOrientationCtor;

    if (typeof Ctor.requestPermission === "function") {
      try {
        const response = await Ctor.requestPermission();
        this.gyroActive = response === "granted";
        return this.gyroActive;
      } catch (err) {
        console.error(err);
        return false;
      }
    }

    this.gyroActive = true; // Android or older iOS
    return true;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      // Periodic telemetry reporting from TelemetryService
      // The actual reporting is handled by the service every 500ms
    });
  }

  public getGazeDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  public getMovementType(): "gyro" | "touch" {
    return this.movementType;
  }

  public dispose() {
    // Strict Memory Management
    this.scene.remove(this.sphere);
    this.sphere.geometry.dispose();
    if (this.material.map) this.material.map.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.controls.dispose();
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("deviceorientation", this.onDeviceOrientation);
  }
}
