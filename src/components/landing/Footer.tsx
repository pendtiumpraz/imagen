import Link from "next/link";
import { Moon } from "lucide-react";

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link href="/" className="logo">
                            <div className="logo-icon">
                                <Moon size={22} />
                            </div>
                            PosterDakwah
                        </Link>
                        <p className="footer-brand-desc">
                            Platform AI untuk membuat poster dakwah, kajian Islam, dan konten
                            jualan profesional. Tanpa skill desain — langsung jadi!
                        </p>
                    </div>
                    <div>
                        <h4 className="footer-heading">Produk</h4>
                        <ul className="footer-links">
                            <li>
                                <a href="#features">Fitur</a>
                            </li>
                            <li>
                                <a href="#pricing">Harga</a>
                            </li>
                            <li>
                                <a href="#gallery">Gallery</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Kategori</h4>
                        <ul className="footer-links">
                            <li>
                                <a href="#features">Poster Kajian</a>
                            </li>
                            <li>
                                <a href="#features">Poster Dakwah</a>
                            </li>
                            <li>
                                <a href="#features">Poster Produk</a>
                            </li>
                            <li>
                                <a href="#features">Banner Promo</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Lainnya</h4>
                        <ul className="footer-links">
                            <li>
                                <Link href="/login">Masuk</Link>
                            </li>
                            <li>
                                <Link href="/register">Daftar</Link>
                            </li>
                            <li>
                                <Link href="/products">Produk Lain</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Section */}
                <div id="contact" style={{
                    padding: "24px",
                    background: "rgba(13,159,102,0.06)",
                    borderRadius: "16px",
                    border: "1px solid rgba(13,159,102,0.15)",
                    margin: "24px 0",
                    textAlign: "center",
                }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                        📱 Hubungi Kami
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--surface-300)", marginBottom: "12px", lineHeight: 1.6 }}>
                        Butuh poster generator di website brand Anda? Ingin dibuatkan aplikasi AI custom?
                    </p>
                    <a
                        href="https://wa.me/6281319504441?text=Halo%20Galih%20Praz,%20saya%20tertarik%20dengan%20layanan%20aplikasi%20AI"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ textDecoration: "none" }}
                    >
                        💬 WhatsApp Galih Praz — 081319504441
                    </a>
                    <p style={{ fontSize: "11px", color: "var(--surface-400)", marginTop: "8px" }}>
                        Pemesanan Aplikasi, Chatbot, AI, dan Automasi
                    </p>
                </div>
                <div className="footer-bottom">
                    <p className="footer-copy">
                        &copy; {new Date().getFullYear()} PosterDakwah. All rights reserved.
                    </p>
                    <p className="footer-copy">
                        Dibuat dengan ❤️ untuk umat
                    </p>
                </div>
            </div>
        </footer>
    );
}
