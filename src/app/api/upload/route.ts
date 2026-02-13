import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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

        // Generate unique filename preserving extension
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";
        const filename = `${crypto.randomUUID()}.${safeExt}`;

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Write file
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Get the public URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const url = `${appUrl}/uploads/${filename}`;

        // Create temp file record (expires in 5 minutes)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await prisma.tempFile.create({
            data: {
                filename,
                originalName: file.name,
                mimeType: file.type,
                url,
                expiresAt,
            },
        });

        return NextResponse.json({ url, filename, expiresAt });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Gagal upload file" },
            { status: 500 }
        );
    }
}
