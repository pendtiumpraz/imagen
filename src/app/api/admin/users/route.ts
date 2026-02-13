import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const users = await prisma.user.findMany({
            where: {
                deletedAt: null,
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } },
                        ],
                    }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                monthlyQuota: true,
                customQuota: true,
                isBanned: true,
                banReason: true,
                createdAt: true,
                _count: { select: { generations: true } },
            },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Admin users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
