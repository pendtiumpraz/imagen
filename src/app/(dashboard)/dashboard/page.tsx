import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wand2, Images, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { checkQuota } from "@/lib/quota";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            isBanned: true,
            banReason: true,
            plan: true,
        },
    });

    if (!user) redirect("/login");

    const quota = await checkQuota(session.user.id);

    const [totalGenerations, recentGenerations] = await Promise.all([
        prisma.generation.count({
            where: { userId: session.user.id, deletedAt: null },
        }),
        prisma.generation.findMany({
            where: {
                userId: session.user.id,
                deletedAt: null,
                status: "COMPLETED",
                resultImageUrl: { not: null },
            },
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
                id: true,
                resultImageUrl: true,
                category: true,
                prompt: true,
                createdAt: true,
            },
        }),
    ]);

    const usagePercent = quota.limit > 0 ? (quota.used / quota.limit) * 100 : 100;
    const quotaLabel = quota.isLifetime ? "Kuota Seumur Hidup" : "Kuota Bulan Ini";
    const usedLabel = quota.isLifetime ? "total sepanjang waktu" : "bulan ini";

    return (
        <>
            {user.isBanned && (
                <div className="banned-banner">
                    <AlertTriangle size={24} className="banned-banner-icon" />
                    <div className="banned-banner-text">
                        <div className="banned-banner-title">Akun Anda Diblokir</div>
                        <div className="banned-banner-desc">
                            {user.banReason || "Hubungi admin untuk informasi lebih lanjut."}
                        </div>
                    </div>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Sisa Kuota</span>
                        <div
                            className="stat-card-icon"
                            style={{ background: "rgba(13,159,102,0.12)", color: "var(--primary-400)" }}
                        >
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{quota.remaining}</div>
                    <div className="stat-card-change" style={{ color: "var(--surface-300)" }}>
                        dari {quota.limit} {quota.isLifetime ? "seumur hidup" : "per bulan"}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Digunakan</span>
                        <div
                            className="stat-card-icon"
                            style={{ background: "rgba(59,130,246,0.12)", color: "var(--info)" }}
                        >
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{quota.used}</div>
                    <div className="stat-card-change" style={{ color: "var(--surface-300)" }}>
                        generasi {usedLabel}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Generasi</span>
                        <div
                            className="stat-card-icon"
                            style={{ background: "rgba(212,168,83,0.12)", color: "var(--accent-400)" }}
                        >
                            <Images size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{totalGenerations}</div>
                    <div className="stat-card-change" style={{ color: "var(--surface-300)" }}>
                        sepanjang waktu
                    </div>
                </div>
            </div>

            <div className="quota-section">
                <div className="quota-header">
                    <span className="quota-label">{quotaLabel}</span>
                    <span className="quota-count">
                        {quota.used} / {quota.limit}
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className={`progress-fill ${usagePercent > 90
                            ? "progress-fill-danger"
                            : usagePercent > 70
                                ? "progress-fill-warning"
                                : ""
                            }`}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                    />
                </div>
                {user.plan === "FREE" && (
                    <div style={{ marginTop: "8px", fontSize: "12px", textAlign: "center" }}>
                        <Link href="/subscription" style={{ color: "var(--primary-400)", textDecoration: "underline" }}>
                            🌙 Upgrade ke Paket Berbayar untuk lebih banyak kuota!
                        </Link>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
                    Aksi Cepat
                </h2>
            </div>

            <div className="category-grid" style={{ marginBottom: "48px" }}>
                <Link href="/generate" className="category-card">
                    <div className="category-card-icon">
                        <Wand2 size={22} />
                    </div>
                    <div className="category-card-name">Generate Poster Baru</div>
                    <div className="category-card-desc">
                        Pilih kategori dan mulai generate poster AI
                    </div>
                </Link>
                <Link href="/gallery" className="category-card">
                    <div className="category-card-icon" style={{ background: "rgba(212,168,83,0.12)", color: "var(--accent-400)" }}>
                        <Images size={22} />
                    </div>
                    <div className="category-card-name">Lihat Gallery</div>
                    <div className="category-card-desc">
                        Semua poster yang pernah Anda generate
                    </div>
                </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
                    Terbaru
                </h2>
                <Link href="/gallery" className="btn btn-ghost btn-sm">
                    Lihat Semua
                </Link>
            </div>

            {recentGenerations.length === 0 ? (
                <div className="empty-state">
                    <Images size={64} className="empty-state-icon" />
                    <h3 className="empty-state-title">Belum ada poster</h3>
                    <p className="empty-state-desc">
                        Generate poster pertama Anda sekarang!
                    </p>
                    <Link href="/generate" className="btn btn-primary">
                        <Wand2 size={16} />
                        Generate Poster
                    </Link>
                </div>
            ) : (
                <div className="gallery-grid">
                    {recentGenerations.map((gen) => (
                        <div key={gen.id} className="gallery-card">
                            {gen.resultImageUrl && (
                                <img
                                    src={gen.resultImageUrl}
                                    alt={gen.prompt}
                                    className="gallery-card-image"
                                    loading="lazy"
                                />
                            )}
                            <div className="gallery-card-info">
                                <div className="gallery-card-category">
                                    {gen.category.replace(/_/g, " ")}
                                </div>
                                <div className="gallery-card-date">
                                    {new Date(gen.createdAt).toLocaleDateString("id-ID")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
