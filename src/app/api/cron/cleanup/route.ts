import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function POST() {
    try {
        // Find expired temp files
        const expired = await prisma.tempFile.findMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });

        let deletedCount = 0;

        for (const file of expired) {
            try {
                // Delete physical file
                const filepath = join(process.cwd(), "public", "uploads", file.filename);
                await unlink(filepath).catch(() => {
                    /* file may not exist */
                });

                // Delete DB record
                await prisma.tempFile.delete({
                    where: { id: file.id },
                });

                deletedCount++;
            } catch {
                // Continue with other files
            }
        }

        return NextResponse.json({
            success: true,
            deleted: deletedCount,
            total: expired.length,
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
}

// Also support GET for easy cron job setup
export async function GET() {
    return POST();
}
