"use client";

import Link from "next/link";
import { LandingNavbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
    ArrowRight, ExternalLink, Moon, Phone, MessageCircle,
    Briefcase, Building2, BookOpen, Plane, FileText, Home,
} from "lucide-react";

const products = [
    {
        name: "AI Office Notaris",
        description: "Sistem administrasi kantor notaris berbasis AI. Otomatisasi pengelolaan dokumen, jadwal, dan klien notaris.",
        url: "https://notrarsis.vercel.app",
        icon: Briefcase,
        color: "#6366f1",
        bgColor: "rgba(99,102,241,0.12)",
    },
    {
        name: "Yayasan Imam Syafii Blitar",
        description: "Website resmi Yayasan Imam Syafii Blitar. Platform informasi yayasan, program, dan kegiatan dakwah.",
        url: "https://www.imamsyafiiblitar.com/",
        icon: Building2,
        color: "#0d9f66",
        bgColor: "rgba(13,159,102,0.12)",
    },
    {
        name: "Kesamben Mengaji",
        description: "Platform kajian Islam online. Jadwal kajian, rekaman, dan materi pembelajaran untuk umat.",
        url: "https://kesambenmengaji.com/",
        icon: BookOpen,
        color: "#d4a853",
        bgColor: "rgba(212,168,83,0.12)",
    },
    {
        name: "AI Travel Umroh",
        description: "Aplikasi online AI untuk perjalanan Umroh. Perencanaan, booking, dan panduan perjalanan otomatis.",
        url: "https://traveling-ebon.vercel.app/",
        icon: Plane,
        color: "#3b82f6",
        bgColor: "rgba(59,130,246,0.12)",
    },
    {
        name: "KARSA AI — Dokumen Legal",
        description: "AI pembuat dokumen legal otomatis. Buat surat perjanjian, kontrak, dan dokumen hukum dengan AI.",
        url: "https://karsa-ai.vercel.app/",
        icon: FileText,
        color: "#ef4444",
        bgColor: "rgba(239,68,68,0.12)",
    },
    {
        name: "AI Sistem Kos-Kosan",
        description: "Sistem manajemen kos-kosan berbasis AI. Kelola penyewa, pembayaran, dan data properti otomatis.",
        url: "https://kosan-bay.vercel.app/",
        icon: Home,
        color: "#f59e0b",
        bgColor: "rgba(245,158,11,0.12)",
    },
];

export default function ProductsPage() {
    return (
        <>
            <LandingNavbar />

            <main style={{ minHeight: "100vh", paddingTop: "100px", paddingBottom: "60px" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "6px 16px", borderRadius: "20px",
                            background: "rgba(13,159,102,0.1)", border: "1px solid rgba(13,159,102,0.2)",
                            fontSize: "13px", fontWeight: 600, color: "var(--primary-400)",
                            marginBottom: "16px",
                        }}>
                            🚀 Produk & Layanan Lainnya
                        </div>
                        <h1 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "12px", lineHeight: 1.2 }}>
                            Solusi AI & Aplikasi{" "}
                            <span style={{ color: "var(--primary-400)" }}>Custom</span>
                        </h1>
                        <p style={{
                            fontSize: "16px", color: "var(--surface-300)",
                            maxWidth: "600px", margin: "0 auto", lineHeight: 1.7,
                        }}>
                            Kami membangun berbagai aplikasi AI dan website profesional.
                            Lihat portofolio kami atau hubungi untuk pemesanan custom.
                        </p>
                    </div>

                    {/* Products Grid */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "20px", marginBottom: "48px",
                    }}>
                        {products.map((product) => (
                            <a
                                key={product.name}
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "block", textDecoration: "none", color: "inherit",
                                    padding: "24px",
                                    background: "var(--dark-700)",
                                    borderRadius: "16px",
                                    border: "1px solid var(--dark-500)",
                                    transition: "all 0.25s ease",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = product.color;
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${product.bgColor}`;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--dark-500)";
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "12px",
                                        background: product.bgColor, color: product.color,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <product.icon size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                                            {product.name}
                                        </h3>
                                        <p style={{ fontSize: "13px", color: "var(--surface-300)", lineHeight: 1.5 }}>
                                            {product.description}
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    fontSize: "12px", color: product.color, fontWeight: 600,
                                }}>
                                    <ExternalLink size={14} /> Kunjungi Situs
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div style={{
                        textAlign: "center", padding: "48px 32px",
                        background: "linear-gradient(135deg, rgba(13,159,102,0.08), rgba(212,168,83,0.08))",
                        borderRadius: "24px",
                        border: "1px solid rgba(13,159,102,0.2)",
                    }}>
                        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>
                            Butuh Aplikasi Custom? 🚀
                        </h2>
                        <p style={{
                            fontSize: "15px", color: "var(--surface-300)", lineHeight: 1.7,
                            maxWidth: "500px", margin: "0 auto 24px",
                        }}>
                            Install poster generator di website brand Anda, atau pesan aplikasi AI,
                            Chatbot, dan automasi sesuai kebutuhan bisnis Anda.
                        </p>

                        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                            <a
                                href="https://wa.me/6281319504441?text=Halo%20Galih%20Praz,%20saya%20tertarik%20pesan%20aplikasi%20AI"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                                style={{ textDecoration: "none", gap: "8px" }}
                            >
                                <MessageCircle size={20} />
                                WhatsApp Galih Praz
                            </a>
                            <a
                                href="tel:081319504441"
                                className="btn btn-ghost btn-lg"
                                style={{ textDecoration: "none", gap: "8px" }}
                            >
                                <Phone size={20} />
                                081319504441
                            </a>
                        </div>

                        <div style={{
                            marginTop: "24px", padding: "16px",
                            background: "rgba(255,255,255,0.03)", borderRadius: "12px",
                            fontSize: "13px", color: "var(--surface-400)", lineHeight: 1.6,
                        }}>
                            <strong style={{ color: "var(--surface-200)" }}>Layanan kami:</strong>{" "}
                            Pembuatan Aplikasi Web • Chatbot AI • Sistem Automasi •
                            Website Company Profile • Aplikasi Mobile • Integrasi AI
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
