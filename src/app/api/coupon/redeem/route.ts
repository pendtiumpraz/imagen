import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: User redeems a coupon code
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { code } = await req.json();

        if (!code?.trim()) {
            return NextResponse.json({ error: "Kode kupon tidak boleh kosong" }, { status: 400 });
        }

        const cleanCode = code.trim().toUpperCase();

        // Find coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code: cleanCode },
            include: { _count: { select: { redemptions: true } } },
        });

        if (!coupon) {
            return NextResponse.json({ error: "Kode kupon tidak ditemukan" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Kupon sudah tidak aktif" }, { status: 400 });
        }

        if (new Date() > coupon.expiresAt) {
            return NextResponse.json({ error: "Kupon sudah kadaluarsa" }, { status: 400 });
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: "Kupon sudah habis dipakai (kuota pengguna tercapai)" }, { status: 400 });
        }

        // Check if user already redeemed
        const existingRedemption = await prisma.couponRedemption.findUnique({
            where: { userId_couponId: { userId, couponId: coupon.id } },
        });

        if (existingRedemption) {
            return NextResponse.json({ error: "Anda sudah pernah menggunakan kupon ini" }, { status: 400 });
        }

        // Process redemption based on type
        let message = "";

        if (coupon.type === "EXTRA_QUOTA") {
            // Add bonus quota to user
            await prisma.user.update({
                where: { id: userId },
                data: { bonusQuota: { increment: coupon.value } },
            });
            message = `Berhasil! Anda mendapat ${coupon.value} bonus generate tambahan.`;
        } else if (coupon.type === "DISCOUNT") {
            // Store discount for next payment — just show the info
            message = `Kupon diskon ${coupon.value}% berhasil diaktifkan! Gunakan saat pembayaran.`;
        } else if (coupon.type === "QUOTA_BOOST") {
            // Boost monthly quota
            await prisma.user.update({
                where: { id: userId },
                data: { monthlyQuota: { increment: coupon.value } },
            });
            message = `Berhasil! Quota bulanan Anda bertambah ${coupon.value} generate.`;
        }

        // Record redemption
        await prisma.couponRedemption.create({
            data: { userId, couponId: coupon.id },
        });

        // Increment used count
        await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
        });

        return NextResponse.json({
            success: true,
            message,
            couponType: coupon.type,
            value: coupon.value,
        });
    } catch (error) {
        console.error("Coupon redeem error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
