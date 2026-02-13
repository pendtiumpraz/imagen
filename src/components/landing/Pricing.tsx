import Link from "next/link";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import { PLAN_LIMITS, formatPrice } from "@/lib/utils";

export function Pricing() {
    const plans = [
        {
            key: "FREE",
            icon: Sparkles,
            popular: false,
        },
        {
            key: "BASIC",
            icon: Zap,
            popular: true,
        },
        {
            key: "PRO",
            icon: Crown,
            popular: false,
        },
    ];

    return (
        <section id="pricing" className="section">
            <div className="section-inner">
                <div className="section-header">
                    <p className="section-eyebrow">Harga</p>
                    <h2 className="section-title">Pilih Paket yang Sesuai</h2>
                    <p className="section-desc">
                        Mulai gratis, upgrade kapan saja untuk lebih banyak generasi per
                        hari
                    </p>
                </div>

                <div className="pricing-grid">
                    {plans.map((p) => {
                        const plan = PLAN_LIMITS[p.key];
                        return (
                            <div
                                key={p.key}
                                className={`pricing-card ${p.popular ? "pricing-card-featured" : ""
                                    }`}
                            >
                                {p.popular && (
                                    <div className="pricing-popular">
                                        <span className="badge badge-accent">Populer</span>
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
                                    {plan.price === 0
                                        ? "Selamanya"
                                        : "per bulan"}
                                </p>
                                <ul className="pricing-features">
                                    {plan.features.map((f) => (
                                        <li key={f} className="pricing-feature">
                                            <Check
                                                size={16}
                                                className="pricing-feature-icon"
                                            />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/register"
                                    className={`btn ${p.popular ? "btn-primary" : "btn-ghost"
                                        }`}
                                    style={{ width: "100%" }}
                                >
                                    {plan.price === 0
                                        ? "Mulai Gratis"
                                        : "Pilih Paket"}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
