import { logEvent, setUserId } from "firebase/analytics";
import { serverTimestamp } from "firebase/firestore";
import type { TelemetryData } from "@/types/telemetry";
import { analytics } from "./config";
import { appendTelemetryDoc } from "./telemetry-api";

export type { TelemetryData } from "@/types/telemetry";

export class TelemetryService {
  private static instance: TelemetryService;
  private sessionId: string;
  private currentSceneId: string = "start";
  private interval: number = 500;
  private isRunning: boolean = false;
  private timerId: NodeJS.Timeout | null = null;

  private constructor() {
    // Intentamos recuperar la sesión del almacenamiento del navegador
    const savedSessionId = typeof window !== "undefined" ? sessionStorage.getItem("vr_session_id") : null;

    if (savedSessionId) {
      this.sessionId = savedSessionId;
    } else {
      this.sessionId = typeof window !== "undefined" ? window.crypto.randomUUID() : "server-side";
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vr_session_id", this.sessionId);
      }
    }

    // Configuramos el User ID en GA4 para seguimiento cruzado
    if (analytics) {
      setUserId(analytics, this.sessionId);
    }
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * GA4 Tracking function requested by user
   */
  public trackVRInteraction(eventType: string, details: Record<string, unknown>) {
    if (!analytics) return;

    const eventParams = {
      session_id: this.sessionId,
      scene_id: this.currentSceneId,
      ...details,
    };

    logEvent(analytics, eventType, eventParams);
    console.log(`[GA4 EVENT] ${eventType}:`, eventParams);
  }

  public start(sceneId: string) {
    this.currentSceneId = sceneId;
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();

    // Track initial scene view
    this.trackVRInteraction("scene_view", { scene_name: sceneId });
    console.log("Telemetry started:", this.sessionId);
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.trackVRInteraction("session_end", {});
  }

  public setScene(sceneId: string) {
    if (this.currentSceneId !== sceneId) {
      this.currentSceneId = sceneId;
      this.trackVRInteraction("scene_view", { scene_name: sceneId });
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getCurrentSceneId(): string {
    return this.currentSceneId;
  }

  private async loop() {
    if (!this.isRunning) return;
    this.timerId = setTimeout(() => this.loop(), this.interval);
  }

  public async logGaze(gaze: { x: number; y: number; z: number }, movementType: "gyro" | "touch") {
    const data: TelemetryData = {
      session_id: this.sessionId,
      timestamp: serverTimestamp(),
      event_type: "GAZE_FOCUS",
      scene_id: this.currentSceneId,
      parameters: {
        movement_type: movementType,
        gaze: gaze,
      },
    };

    try {
      await appendTelemetryDoc(data);
    } catch (e) {
      console.warn("Telemetry error:", e);
    }
  }

  public async logSessionEnd() {
    const data: TelemetryData = {
      session_id: this.sessionId,
      timestamp: serverTimestamp(),
      event_type: "SESSION_END",
      scene_id: this.currentSceneId,
      parameters: {
        movement_type: "touch",
        gaze: { x: 0, y: 0, z: 0 },
      },
    };

    try {
      await appendTelemetryDoc(data);
    } catch (e) {
      console.warn("Telemetry session end error:", e);
    }
  }
}
