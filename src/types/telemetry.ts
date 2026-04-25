/** Firestore payload shape for the `telemetry` collection. */
export interface TelemetryData {
  session_id: string;
  timestamp: unknown;
  event_type: "GAZE_FOCUS" | "SESSION_START" | "SESSION_END" | "SCENE_CHANGE";
  scene_id: string;
  parameters: {
    movement_type: "gyro" | "touch";
    gaze: { x: number; y: number; z: number };
  };
}
