import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar siempre como test.png para simplificar el MVP
    const filename = "test.png";
    const tempDir = join(process.cwd(), "public", "temp");

    // Crear directorio si falta
    await mkdir(tempDir, { recursive: true });

    const path = join(tempDir, filename);
    await writeFile(path, buffer);

    // Retornamos la ruta relativa que Next.js sirve desde public
    return NextResponse.json({ success: true, url: `/temp/${filename}` });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
