import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const updateData: Record<string, unknown> = {};

        if (body.customQuota !== undefined) {
            updateData.customQuota = body.customQuota === null ? null : parseInt(body.customQuota);
        }

        if (body.isBanned !== undefined) {
            updateData.isBanned = body.isBanned;
        }

        if (body.banReason !== undefined) {
            updateData.banReason = body.banReason;
        }

        if (body.password) {
            if (body.password.length < 6) {
                return NextResponse.json(
                    { error: "Password minimal 6 karakter" },
                    { status: 400 }
                );
            }
            updateData.password = await bcrypt.hash(body.password, 12);
        }

        if (body.plan) {
            updateData.plan = body.plan;
            // Update daily quota based on plan
            const quotaMap: Record<string, number> = {
                FREE: 10,
                BASIC: 50,
                PRO: 200,
            };
            updateData.dailyQuota = quotaMap[body.plan] || 10;
        }

        if (body.role) {
            updateData.role = body.role;
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin user update error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Soft delete
        await prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin user delete error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
