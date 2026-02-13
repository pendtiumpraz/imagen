import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import os from "os";

/**
 * Get the upload directory.
 * - On Vercel (serverless): use os.tmpdir() (/tmp)
 * - Locally: use public/uploads for easier access
 */
function getUploadDir() {
    if (process.env.VERCEL) {
        return join(os.tmpdir(), "uploads");
    }
    return join(process.cwd(), "public", "uploads");
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipe file tidak didukung. Gunakan PNG, JPG, atau WEBP" },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Ukuran file maksimal 10MB" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";
        const filename = `${crypto.randomUUID()}.${safeExt}`;

        // Write to upload directory
        const uploadDir = getUploadDir();
        await mkdir(uploadDir, { recursive: true });
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Build the public URL
        // On Vercel: serve via /api/upload/serve?file=filename
        // Locally: serve via /uploads/filename
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const url = process.env.VERCEL
            ? `${appUrl}/api/upload/serve?file=${filename}`
            : `${appUrl}/uploads/${filename}`;

        return NextResponse.json({ url, filename });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Gagal upload file" },
            { status: 500 }
        );
    }
}
