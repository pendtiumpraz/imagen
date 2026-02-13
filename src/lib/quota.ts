import { prisma } from "./prisma";

/**
 * Get current month string in YYYY-MM format
 */
function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Check if user has an active (non-expired) subscription
 */
async function hasActiveSubscription(userId: string): Promise<boolean> {
    const now = new Date();
    const activeSub = await prisma.subscription.findFirst({
        where: {
            userId,
            isActive: true,
            endDate: { gte: now },
        },
    });
    return !!activeSub;
}

/**
 * Get effective quota for user
 * FREE: 2 lifetime (not per month)
 * BASIC: 150/month + bonusQuota
 * PRO: 500/month + bonusQuota
 * If paid plan but subscription expired → quota = 0
 */
function getEffectiveQuota(user: {
    plan: string;
    monthlyQuota: number;
    lifetimeQuota: number;
    customQuota: number | null;
    bonusQuota: number;
    isBanned: boolean;
}, subscriptionActive: boolean): { limit: number; isLifetime: boolean; expired: boolean } {
    if (user.isBanned) return { limit: 0, isLifetime: false, expired: false };
    if (user.customQuota !== null) return { limit: user.customQuota + user.bonusQuota, isLifetime: false, expired: false };

    if (user.plan === "FREE") {
        return { limit: user.lifetimeQuota + user.bonusQuota, isLifetime: true, expired: false };
    }

    // Paid plan — check subscription expiry
    if (!subscriptionActive) {
        // Subscription expired! Only bonusQuota remains (from coupons)
        return { limit: user.bonusQuota, isLifetime: false, expired: true };
    }

    return { limit: user.monthlyQuota + user.bonusQuota, isLifetime: false, expired: false };
}

export async function checkQuota(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    isBanned: boolean;
    banReason?: string | null;
    isLifetime: boolean;
    expired: boolean;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: {
            plan: true,
            monthlyQuota: true,
            lifetimeQuota: true,
            customQuota: true,
            bonusQuota: true,
            isBanned: true,
            banReason: true,
        },
    });

    if (!user) {
        return { allowed: false, remaining: 0, limit: 0, used: 0, isBanned: false, isLifetime: false, expired: false };
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
            expired: false,
        };
    }

    // Check subscription status for paid plans
    const subscriptionActive = user.plan === "FREE" ? true : await hasActiveSubscription(userId);
    const { limit, isLifetime, expired } = getEffectiveQuota(user, subscriptionActive);

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
        expired,
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
