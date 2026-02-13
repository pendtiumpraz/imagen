import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check, Crown, Zap, Sparkles } from "lucide-react";
import { PLAN_LIMITS, formatPrice } from "@/lib/utils";

export default async function SubscriptionPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true, dailyQuota: true, customQuota: true },
    });

    const currentPlan = user?.plan || "FREE";

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
                    {PLAN_LIMITS[currentPlan]?.name || "Free"}
                </div>
                <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
                    Kuota harian: {user?.customQuota ?? user?.dailyQuota ?? 10} generasi/hari
                </p>
            </div>

            <div className="pricing-grid">
                {plans.map((p) => {
                    const plan = PLAN_LIMITS[p.key];
                    const isCurrent = currentPlan === p.key;
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
                                {plan.price === 0 ? "Selamanya" : "per bulan"}
                            </p>
                            <ul className="pricing-features">
                                {plan.features.map((f) => (
                                    <li key={f} className="pricing-feature">
                                        <Check size={16} className="pricing-feature-icon" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`btn ${isCurrent ? "btn-ghost" : "btn-primary"}`}
                                style={{ width: "100%" }}
                                disabled={isCurrent}
                            >
                                {isCurrent ? "Paket Aktif" : "Pilih Paket"}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    marginTop: "32px",
                    padding: "24px",
                    background: "var(--dark-700)",
                    borderRadius: "16px",
                    border: "1px solid var(--dark-500)",
                    textAlign: "center",
                }}
            >
                <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)" }}>
                    Untuk upgrade paket, silakan hubungi admin via WhatsApp atau email.
                </p>
            </div>
        </>
    );
}
