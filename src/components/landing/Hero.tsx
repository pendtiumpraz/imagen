import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";

export function Hero() {
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
                    Buat Poster <span className="gradient-text">Dakwah & Jualan</span>{" "}
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
                        <div className="hero-stat-value">10K+</div>
                        <div className="hero-stat-label">Poster Dibuat</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">2K+</div>
                        <div className="hero-stat-label">Pengguna Aktif</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">11</div>
                        <div className="hero-stat-label">Kategori Poster</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
