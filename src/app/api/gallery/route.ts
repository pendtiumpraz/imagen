import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GenerationCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
        const category = searchParams.get("category") as GenerationCategory | null;

        const where = {
            userId: session.user.id,
            deletedAt: null,
            ...(category ? { category } : {}),
        };

        const [items, total] = await Promise.all([
            prisma.generation.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    category: true,
                    status: true,
                    prompt: true,
                    resultImageUrl: true,
                    aspectRatio: true,
                    isPublic: true,
                    createdAt: true,
                },
            }),
            prisma.generation.count({ where }),
        ]);

        return NextResponse.json({
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Gallery error:", error);
        return NextResponse.json(
            { error: "Gagal memuat gallery" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        // Soft delete - only own items
        await prisma.generation.updateMany({
            where: { id, userId: session.user.id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Gagal menghapus" },
            { status: 500 }
        );
    }
}
