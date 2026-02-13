import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import os from "os";

/**
 * Serve uploaded files from /tmp on Vercel.
 * GET /api/upload/serve?file=filename.png
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filename = searchParams.get("file");

        if (!filename) {
            return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
        }

        // Sanitize filename to prevent path traversal
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "");
        if (safeName !== filename || filename.includes("..")) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }

        // Try /tmp first (Vercel), then public/uploads (local)
        let filepath = join(os.tmpdir(), "uploads", safeName);
        try {
            await stat(filepath);
        } catch {
            filepath = join(process.cwd(), "public", "uploads", safeName);
            await stat(filepath); // will throw if not found
        }

        const file = await readFile(filepath);

        // Determine content type from extension
        const ext = safeName.split(".").pop()?.toLowerCase();
        const contentTypes: Record<string, string> = {
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            webp: "image/webp",
        };
        const contentType = contentTypes[ext || ""] || "application/octet-stream";

        return new NextResponse(file, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=300",
            },
        });
    } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
