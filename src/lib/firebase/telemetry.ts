import { serverTimestamp } from "firebase/firestore";
import type { TelemetryData } from "@/types/telemetry";
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
    this.sessionId = globalThis.crypto.randomUUID();
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public start(sceneId: string) {
    this.currentSceneId = sceneId;
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
    console.log("Telemetry started:", this.sessionId);
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId) clearTimeout(this.timerId);
  }

  public setScene(sceneId: string) {
    this.currentSceneId = sceneId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getCurrentSceneId(): string {
    return this.currentSceneId;
  }

  private async loop() {
    if (!this.isRunning) return;

    // Note: The actual camera direction will be passed from the Viewer
    // This is a placeholder for the logic. In implementation, we trigger this from the viewer's update loop or an event.

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

  // sendBeacon for closing tab (simplified for Firestore)
  // Firestore SDK doesn't support sendBeacon directly, so we use a fallback if needed
  // or just ensure we flush data.
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
