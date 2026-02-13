import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [payments, stats] = await Promise.all([
            prisma.paymentConfirmation.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, plan: true },
                    },
                },
            }),
            // Aggregate stats
            Promise.all([
                prisma.paymentConfirmation.count({ where: { status: "PENDING" } }),
                prisma.paymentConfirmation.count({ where: { status: "APPROVED" } }),
                prisma.paymentConfirmation.count({ where: { status: "REJECTED" } }),
                prisma.paymentConfirmation.count(),
            ]).then(([pending, approved, rejected, total]) => ({
                pending, approved, rejected, total,
            })),
        ]);

        return NextResponse.json({ payments, stats });
    } catch (error) {
        console.error("Admin payments error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// Admin approve/reject payment
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { paymentId, action, adminNotes } = await req.json();

        if (!paymentId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const payment = await prisma.paymentConfirmation.findUnique({
            where: { id: paymentId },
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        const status = action === "approve" ? "APPROVED" : "REJECTED";

        // Update payment status
        await prisma.paymentConfirmation.update({
            where: { id: paymentId },
            data: {
                status,
                adminNotes: adminNotes || (action === "approve" ? "Approved by admin" : "Rejected by admin"),
                reviewedAt: new Date(),
                reviewedBy: session.user.id,
            },
        });

        // If approved, upgrade user
        if (action === "approve") {
            const quotaMap: Record<string, number> = { BASIC: 150, PRO: 500 };
            await prisma.user.update({
                where: { id: payment.userId },
                data: {
                    plan: payment.plan,
                    monthlyQuota: quotaMap[payment.plan] || 150,
                },
            });

            // Check for existing active subscription to handle renewal
            const now = new Date();
            const existingSub = await prisma.subscription.findFirst({
                where: { userId: payment.userId, isActive: true, endDate: { gte: now } },
                orderBy: { endDate: "desc" },
            });

            if (existingSub) {
                // Renewal: extend from current endDate (so no days are lost)
                const newEndDate = new Date(existingSub.endDate);
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                await prisma.subscription.update({
                    where: { id: existingSub.id },
                    data: { endDate: newEndDate, plan: payment.plan, price: payment.amount },
                });
            } else {
                // New subscription: start from now
                const endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() + 1);
                await prisma.subscription.create({
                    data: {
                        userId: payment.userId,
                        plan: payment.plan,
                        price: payment.amount,
                        startDate: now,
                        endDate,
                        isActive: true,
                    },
                });
            }
        }

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error("Admin payment update error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
