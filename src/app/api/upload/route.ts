import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as unknown as File;
    if (!file) return NextResponse.json({ success: false });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    const filename = `${timestamp}_${cleanName}`;

    const tempDir = join(process.cwd(), "public", "temp");
    await mkdir(tempDir, { recursive: true });

    const path = join(tempDir, filename);
    await writeFile(path, buffer);

    // Devolvemos solo los datos para que el FRONTEND los guarde en Firestore
    return NextResponse.json({
      success: true,
      urls: {
        high: `/temp/${filename}`,
        medium: `/temp/${filename}`,
        low: `/temp/${filename}`,
      },
      name: file.name,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
