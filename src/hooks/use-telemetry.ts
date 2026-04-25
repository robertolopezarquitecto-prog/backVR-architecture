"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { serverTimestamp } from "firebase/firestore";
import { TelemetryService } from "@/lib/firebase/telemetry";
import { appendTelemetryDoc } from "@/lib/firebase/telemetry-api";
import type { TelemetryData } from "@/types/telemetry";

const neutralParams = (): TelemetryData["parameters"] => ({
  movement_type: "touch",
  gaze: { x: 0, y: 0, z: 1 },
});

/**
 * Discrete Firestore telemetry (session start, scene changes) via TanStack Query mutations.
 * High-frequency gaze samples stay on {@link TelemetryService.logGaze} (direct writes) to avoid mutation churn.
 */
export function useTelemetry() {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: TelemetryData) => appendTelemetryDoc(data),
  });

  const recordSessionStart = useCallback(
    (sceneId: string) => {
      const svc = TelemetryService.getInstance();
      mutate({
        session_id: svc.getSessionId(),
        timestamp: serverTimestamp(),
        event_type: "SESSION_START",
        scene_id: sceneId,
        parameters: neutralParams(),
      });
    },
    [mutate],
  );

  const recordSceneChange = useCallback(
    (sceneId: string) => {
      const svc = TelemetryService.getInstance();
      mutate({
        session_id: svc.getSessionId(),
        timestamp: serverTimestamp(),
        event_type: "SCENE_CHANGE",
        scene_id: sceneId,
        parameters: neutralParams(),
      });
    },
    [mutate],
  );

  return {
    recordSessionStart,
    recordSceneChange,
    isRecordingStructured: isPending,
    recordingError: error,
  };
}
