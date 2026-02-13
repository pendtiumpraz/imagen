import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/utils";

function formatStat(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
    return num.toString();
}

export async function Hero() {
    const [totalGenerations, totalUsers] = await Promise.all([
        prisma.generation.count({
            where: { deletedAt: null, status: "COMPLETED" },
        }),
        prisma.user.count({
            where: { deletedAt: null },
        }),
    ]);

    const totalCategories = CATEGORIES.length;

    return (
        <section className="hero-section">
            <div className="hero-bg" />
            <div className="hero-pattern" />
            <div className="hero-content">
                <div className="hero-badge">
                    <Sparkles size={16} />
                    Powered by AI — Buat Poster dalam Hitungan Detik
                </div>
                <h1 className="hero-title">
                    Buat Poster <span className="gradient-text">Dakwah &amp; Jualan</span>{" "}
                    Profesional dengan AI
                </h1>
                <p className="hero-subtitle">
                    Generate poster kajian, dakwah Islam, dan konten jualan berkualitas
                    tinggi menggunakan kecerdasan buatan. Tanpa skill desain, langsung
                    jadi!
                </p>
                <div className="hero-actions">
                    <Link href="/register" className="btn btn-accent btn-lg">
                        <Zap size={20} />
                        Mulai Gratis Sekarang
                    </Link>
                    <a href="#features" className="btn btn-ghost btn-lg">
                        Pelajari Lebih Lanjut
                    </a>
                </div>
                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-value">{formatStat(totalGenerations)}</div>
                        <div className="hero-stat-label">Poster Dibuat</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{formatStat(totalUsers)}</div>
                        <div className="hero-stat-label">Pengguna Aktif</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{totalCategories}</div>
                        <div className="hero-stat-label">Kategori Poster</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
