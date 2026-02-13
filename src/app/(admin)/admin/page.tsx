import { prisma } from "@/lib/prisma";
import { Users, Images, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalGenerations, todayGenerations, activeSubscriptions] =
        await Promise.all([
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.generation.count({ where: { deletedAt: null } }),
            prisma.generation.count({
                where: { deletedAt: null, createdAt: { gte: today } },
            }),
            prisma.subscription.count({ where: { isActive: true } }),
        ]);

    return (
        <>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total User</span>
                        <div className="stat-card-icon" style={{ background: "rgba(59,130,246,0.12)", color: "var(--info)" }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{totalUsers}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Generasi</span>
                        <div className="stat-card-icon" style={{ background: "rgba(13,159,102,0.12)", color: "var(--primary-400)" }}>
                            <Images size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{totalGenerations}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Generasi Hari Ini</span>
                        <div className="stat-card-icon" style={{ background: "rgba(212,168,83,0.12)", color: "var(--accent-400)" }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{todayGenerations}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Langganan Aktif</span>
                        <div className="stat-card-icon" style={{ background: "rgba(34,197,94,0.12)", color: "var(--success)" }}>
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{activeSubscriptions}</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Link href="/admin/users" className="category-card">
                    <div className="category-card-icon">
                        <Users size={22} />
                    </div>
                    <div className="category-card-name">Manajemen User</div>
                    <div className="category-card-desc">
                        Kelola user, ubah quota, ban/unban, reset password
                    </div>
                </Link>
                <Link href="/admin/providers" className="category-card">
                    <div className="category-card-icon" style={{ background: "rgba(212,168,83,0.12)", color: "var(--accent-400)" }}>
                        <TrendingUp size={22} />
                    </div>
                    <div className="category-card-name">AI Provider</div>
                    <div className="category-card-desc">
                        Kelola API key ModelsLab dan DeepSeek
                    </div>
                </Link>
            </div>
        </>
    );
}
