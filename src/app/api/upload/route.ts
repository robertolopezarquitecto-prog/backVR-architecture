import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import { db } from "@/lib/firebase/config";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generamos un nombre único pero mantenemos la extensión original
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    const filename = `${timestamp}-${cleanFileName}`;

    const tempDir = join(process.cwd(), "public", "temp");
    await mkdir(tempDir, { recursive: true });

    const path = join(tempDir, filename);
    await writeFile(path, buffer);

    const relativeUrl = `/temp/${filename}`;

    // PERSISTENCIA EN FIRESTORE: Guardamos la escena en la colección "scenes"
    const sceneData = {
      name: file.name,
      urlHigh: relativeUrl,
      urlLow: relativeUrl, // Para el MVP usamos la misma
      createdAt: serverTimestamp(),
      type: "uploaded",
    };

    const docRef = await addDoc(collection(db, "scenes"), sceneData);

    return NextResponse.json({
      success: true,
      scene: {
        id: docRef.id,
        ...sceneData,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
