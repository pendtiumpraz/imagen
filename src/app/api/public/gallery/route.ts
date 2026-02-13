import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GenerationCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") || "12")));
        const category = searchParams.get("category") as GenerationCategory | null;

        const where = {
            status: "COMPLETED" as const,
            isPublic: true,
            deletedAt: null,
            resultImageUrl: { not: null },
            ...(category ? { category } : {}),
        };

        const items = await prisma.generation.findMany({
            where,
            select: {
                id: true,
                resultImageUrl: true,
                category: true,
                prompt: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        });

        return NextResponse.json({ items });
    } catch (error) {
        console.error("Public gallery error:", error);
        return NextResponse.json({ items: [] });
    }
}
