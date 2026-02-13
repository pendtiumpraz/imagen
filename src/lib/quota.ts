import { prisma } from "./prisma";
import { getEffectiveQuota } from "./utils";

export async function checkQuota(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    isBanned: boolean;
    banReason?: string | null;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: {
            dailyQuota: true,
            customQuota: true,
            isBanned: true,
            banReason: true,
        },
    });

    if (!user) {
        return { allowed: false, remaining: 0, limit: 0, used: 0, isBanned: false };
    }

    if (user.isBanned) {
        return {
            allowed: false,
            remaining: 0,
            limit: 0,
            used: 0,
            isBanned: true,
            banReason: user.banReason,
        };
    }

    const limit = getEffectiveQuota(user);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await prisma.dailyUsage.findUnique({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
    });

    const used = usage?.count ?? 0;
    const remaining = Math.max(0, limit - used);

    return {
        allowed: remaining > 0,
        remaining,
        limit,
        used,
        isBanned: false,
    };
}

export async function incrementUsage(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyUsage.upsert({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
        update: {
            count: { increment: 1 },
        },
        create: {
            userId,
            date: today,
            count: 1,
        },
    });
}
