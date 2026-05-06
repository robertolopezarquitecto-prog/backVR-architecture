import { addDoc, collection } from "firebase/firestore";
import type { TelemetryData } from "@/types/telemetry";
import { db } from "./config";

const TELEMETRY_COLLECTION = "telemetry";

export async function appendTelemetryDoc(data: TelemetryData): Promise<void> {
  try {
    await addDoc(collection(db, TELEMETRY_COLLECTION), data);
  } catch (error) {
    console.error("[FIRESTORE ERROR] Falló el envío de telemetría:", error);
    throw error;
  }
}
