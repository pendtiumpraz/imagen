import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check, Crown, Zap, Sparkles, CreditCard, Star } from "lucide-react";
import { PLAN_LIMITS, PAYMENT_INFO, formatPrice } from "@/lib/utils";
import { checkQuota } from "@/lib/quota";
import { CouponRedeemer } from "@/components/dashboard/CouponRedeemer";

export default async function SubscriptionPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true, monthlyQuota: true, customQuota: true, bonusQuota: true },
    });

    const currentPlan = user?.plan || "FREE";
    const quota = await checkQuota(session.user.id);

    // Get active subscription for expiry display
    const activeSub = currentPlan !== "FREE" ? await prisma.subscription.findFirst({
        where: { userId: session.user.id, isActive: true, endDate: { gte: new Date() } },
        orderBy: { endDate: "desc" },
    }) : null;

    const plans = [
        { key: "FREE", icon: Sparkles },
        { key: "BASIC", icon: Zap },
        { key: "PRO", icon: Crown },
    ];

    return (
        <>
            <div className="sub-current">
                <p className="sub-current-label">Paket saat ini</p>
                <div className="sub-current-plan">
                    {PLAN_LIMITS[currentPlan]?.name || "Trial"}
                </div>
                <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
                    Kuota: {quota.remaining} sisa dari {quota.limit} {quota.isLifetime ? "seumur hidup" : "per bulan"}
                    {(user?.bonusQuota ?? 0) > 0 && (
                        <span style={{ color: "var(--primary-400)", marginLeft: "6px" }}>
                            (+{user?.bonusQuota} bonus)
                        </span>
                    )}
                </p>
                {currentPlan !== "FREE" && (
                    <p style={{ fontSize: "12px", marginTop: "4px", color: activeSub ? "var(--surface-400)" : "var(--error)" }}>
                        {activeSub
                            ? `Berlaku sampai: ${new Date(activeSub.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
                            : "⚠️ Langganan expired! Silakan perpanjang untuk melanjutkan generate."
                        }
                    </p>
                )}
            </div>

            {/* PROMO RAMADHAN Banner */}
            <div style={{
                background: "linear-gradient(135deg, rgba(13,159,102,0.15), rgba(212,168,83,0.15))",
                border: "2px solid rgba(212,168,83,0.3)",
                borderRadius: "16px",
                padding: "20px 24px",
                marginBottom: "24px",
                textAlign: "center",
            }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌙✨</div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-400)" }}>
                    PROMO RAMADHAN 1447H
                </h3>
                <p style={{ fontSize: "13px", color: "var(--surface-300)", marginTop: "4px" }}>
                    Dapatkan hingga <strong style={{ color: "var(--primary-400)" }}>3x lipat kuota</strong> dengan harga spesial!
                </p>
            </div>

            <div className="pricing-grid">
                {plans.map((p) => {
                    const plan = PLAN_LIMITS[p.key];
                    const isCurrent = currentPlan === p.key;
                    const isPromo = plan.monthly > plan.originalMonthly;
                    return (
                        <div
                            key={p.key}
                            className={`pricing-card ${isCurrent ? "pricing-card-featured" : ""}`}
                        >
                            {isCurrent && (
                                <div className="pricing-popular">
                                    <span className="badge badge-primary">Aktif</span>
                                </div>
                            )}
                            {isPromo && !isCurrent && (
                                <div className="pricing-popular">
                                    <span className="badge badge-accent">
                                        <Star size={12} style={{ marginRight: "4px" }} />
                                        {plan.namePromo}
                                    </span>
                                </div>
                            )}
                            <p className="pricing-name">{plan.name}</p>
                            <div className="pricing-price">
                                {plan.price === 0 ? (
                                    "Gratis"
                                ) : (
                                    <>
                                        <span className="currency">Rp</span>{" "}
                                        {formatPrice(plan.price).replace("Rp", "").trim()}
                                    </>
                                )}
                            </div>
                            <p className="pricing-period">
                                {plan.isLifetime ? "Seumur hidup" : "per bulan"}
                            </p>

                            {/* Show promo crossed-out quota */}
                            {isPromo && (
                                <div style={{
                                    margin: "12px 0",
                                    padding: "12px",
                                    background: "rgba(212,168,83,0.08)",
                                    borderRadius: "10px",
                                    textAlign: "center",
                                }}>
                                    <div style={{
                                        textDecoration: "line-through",
                                        color: "var(--surface-400)",
                                        fontSize: "14px",
                                    }}>
                                        {plan.originalMonthly} gambar/bulan
                                    </div>
                                    <div style={{
                                        fontSize: "20px",
                                        fontWeight: 800,
                                        color: "var(--primary-400)",
                                        marginTop: "4px",
                                    }}>
                                        {plan.monthly} gambar/bulan 🔥
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--accent-400)", fontWeight: 600 }}>
                                        {Math.round(plan.monthly / plan.originalMonthly)}x LIPAT!
                                    </div>
                                </div>
                            )}

                            <ul className="pricing-features">
                                {plan.features.map((f) => (
                                    <li key={f} className="pricing-feature">
                                        <Check size={16} className="pricing-feature-icon" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button className="btn btn-ghost" style={{ width: "100%" }} disabled>
                                    Paket Aktif
                                </button>
                            ) : plan.price > 0 ? (
                                <Link
                                    href={`/payment?plan=${p.key}`}
                                    className="btn btn-primary"
                                    style={{ width: "100%", textDecoration: "none" }}
                                >
                                    <CreditCard size={16} />
                                    Pilih & Bayar
                                </Link>
                            ) : (
                                <button className="btn btn-ghost" style={{ width: "100%" }} disabled>
                                    Paket Default
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Payment info */}
            <div style={{
                marginTop: "32px",
                padding: "24px",
                background: "var(--dark-700)",
                borderRadius: "16px",
                border: "1px solid var(--dark-500)",
            }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CreditCard size={18} /> Informasi Pembayaran
                </h3>
                <div style={{
                    padding: "16px",
                    background: "var(--dark-600)",
                    borderRadius: "12px",
                    marginBottom: "12px",
                }}>
                    <div style={{ fontSize: "13px", color: "var(--surface-300)", marginBottom: "4px" }}>
                        Transfer ke:
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary-400)" }}>
                        {PAYMENT_INFO.bankName}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "1px", margin: "4px 0" }}>
                        {PAYMENT_INFO.accountNumber}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>
                        a.n. {PAYMENT_INFO.accountHolder}
                    </div>
                </div>
                <p style={{ fontSize: "12px", color: "var(--surface-400)", lineHeight: 1.6 }}>
                    🕌 {PAYMENT_INFO.description}
                </p>
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <Link
                        href="/payment"
                        className="btn btn-accent"
                        style={{ textDecoration: "none" }}
                    >
                        📋 Konfirmasi Pembayaran
                    </Link>
                </div>
            </div>

            {/* Coupon Redemption */}
            <CouponRedeemer />
        </>
    );
}
