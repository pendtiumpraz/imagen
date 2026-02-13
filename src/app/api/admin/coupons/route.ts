import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all coupons
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { redemptions: true } },
            },
        });

        return NextResponse.json({ coupons });
    } catch (error) {
        console.error("Coupons list error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Create new coupon
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code, type, value, maxUses, expiresAt, description } = await req.json();

        if (!code || !type || !value || !expiresAt) {
            return NextResponse.json({ error: "Code, type, value, dan tanggal expire wajib diisi" }, { status: 400 });
        }

        // Ensure code is uppercase, no spaces
        const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "");

        // Check for duplicate
        const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
        if (existing) {
            return NextResponse.json({ error: "Kode kupon sudah ada" }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: cleanCode,
                type,
                value: parseInt(value),
                maxUses: parseInt(maxUses) || 100,
                expiresAt: new Date(expiresAt),
                description: description || null,
            },
        });

        return NextResponse.json({ coupon });
    } catch (error) {
        console.error("Coupon create error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
