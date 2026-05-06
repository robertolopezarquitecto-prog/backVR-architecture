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
  private deviceOrientation: DeviceOrientationEvent | null = null;
  private screenOrientation: number = 0;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0.1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.textureLoader = new THREE.TextureLoader();
    this.textureLoader.setCrossOrigin("anonymous");

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

    this.initEventListeners();
    this.animate();
  }

  public async loadScene(scene: SceneConfig) {
    return new Promise<void>((resolve, reject) => {
      this.textureLoader.load(
        scene.urlHigh,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
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

    const onScreenOrientationChangeEvent = () => {
      // @ts-expect-error - window.orientation is deprecated but still required for iOS Safari
      this.screenOrientation =
        window.orientation !== undefined ? Number(window.orientation) : window.screen?.orientation?.angle || 0;
    };
    window.addEventListener("orientationchange", onScreenOrientationChangeEvent);
    onScreenOrientationChangeEvent();

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
    this.deviceOrientation = event;
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
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
    const zee = new THREE.Vector3(0, 0, 1);

    this.renderer.setAnimationLoop(() => {
      if (this.gyroActive && this.deviceOrientation) {
        this.controls.enabled = false;

        const alpha = this.deviceOrientation.alpha ? THREE.MathUtils.degToRad(this.deviceOrientation.alpha) : 0;
        const beta = this.deviceOrientation.beta ? THREE.MathUtils.degToRad(this.deviceOrientation.beta) : 0;
        const gamma = this.deviceOrientation.gamma ? THREE.MathUtils.degToRad(this.deviceOrientation.gamma) : 0;
        const orient = this.screenOrientation ? THREE.MathUtils.degToRad(this.screenOrientation) : 0;

        euler.set(beta, alpha, -gamma, "YXZ"); // 'ZXY' for the device, but 'YXZ' for us
        this.camera.quaternion.setFromEuler(euler);
        this.camera.quaternion.multiply(q1);
        this.camera.quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
      } else {
        this.controls.enabled = true;
        this.controls.update();
      }

      this.renderer.render(this.scene, this.camera);
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
    this.renderer.dispose();
    this.material.dispose();
    this.sphere.geometry.dispose();
    this.controls.dispose();
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("deviceorientation", this.onDeviceOrientation);
    window.removeEventListener("orientationchange", () => {});
  }
}
