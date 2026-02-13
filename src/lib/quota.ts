import { prisma } from "./prisma";

/**
 * Get current month string in YYYY-MM format
 */
function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get effective quota for user
 * FREE: 2 lifetime (not per month)
 * BASIC: 150/month
 * PRO: 500/month
 */
function getEffectiveQuota(user: {
    plan: string;
    monthlyQuota: number;
    lifetimeQuota: number;
    customQuota: number | null;
    isBanned: boolean;
}): { limit: number; isLifetime: boolean } {
    if (user.isBanned) return { limit: 0, isLifetime: false };
    if (user.customQuota !== null) return { limit: user.customQuota, isLifetime: false };

    if (user.plan === "FREE") {
        return { limit: user.lifetimeQuota, isLifetime: true };
    }

    return { limit: user.monthlyQuota, isLifetime: false };
}

export async function checkQuota(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    isBanned: boolean;
    banReason?: string | null;
    isLifetime: boolean;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: {
            plan: true,
            monthlyQuota: true,
            lifetimeQuota: true,
            customQuota: true,
            isBanned: true,
            banReason: true,
        },
    });

    if (!user) {
        return { allowed: false, remaining: 0, limit: 0, used: 0, isBanned: false, isLifetime: false };
    }

    if (user.isBanned) {
        return {
            allowed: false,
            remaining: 0,
            limit: 0,
            used: 0,
            isBanned: true,
            banReason: user.banReason,
            isLifetime: false,
        };
    }

    const { limit, isLifetime } = getEffectiveQuota(user);

    let used: number;

    if (isLifetime) {
        // FREE plan: count ALL generations ever
        const totalCount = await prisma.generation.count({
            where: {
                userId,
                status: { in: ["COMPLETED", "PROCESSING"] },
                deletedAt: null,
            },
        });
        used = totalCount;
    } else {
        // Paid plan: count THIS month
        const month = getCurrentMonth();
        const usage = await prisma.monthlyUsage.findUnique({
            where: { userId_month: { userId, month } },
        });
        used = usage?.count ?? 0;
    }

    const remaining = Math.max(0, limit - used);

    return {
        allowed: remaining > 0,
        remaining,
        limit,
        used,
        isBanned: false,
        isLifetime,
    };
}

export async function incrementUsage(userId: string): Promise<void> {
    const month = getCurrentMonth();

    await prisma.monthlyUsage.upsert({
        where: { userId_month: { userId, month } },
        update: { count: { increment: 1 } },
        create: { userId, month, count: 1 },
    });
}
