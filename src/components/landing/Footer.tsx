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
                        </ul>
                    </div>
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
