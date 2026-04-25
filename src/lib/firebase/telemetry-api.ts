import { addDoc, collection } from "firebase/firestore";
import type { TelemetryData } from "@/types/telemetry";
import { db } from "./config";

const TELEMETRY_COLLECTION = "telemetry";

export async function appendTelemetryDoc(data: TelemetryData): Promise<void> {
  await addDoc(collection(db, TELEMETRY_COLLECTION), data);
}
