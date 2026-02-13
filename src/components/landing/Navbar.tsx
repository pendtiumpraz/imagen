"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Menu, X } from "lucide-react";

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setMobileOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className={`landing-nav ${scrolled ? "landing-nav-scrolled" : ""}`}>
            <div className="landing-nav-inner">
                <Link href="/" className="logo">
                    <div className="logo-icon">
                        <Moon size={22} />
                    </div>
                    PosterDakwah
                </Link>

                <ul className="nav-links">
                    <li>
                        <a href="#features" className="nav-link">
                            Fitur
                        </a>
                    </li>
                    <li>
                        <a href="#gallery" className="nav-link">
                            Gallery
                        </a>
                    </li>
                    <li>
                        <a href="#pricing" className="nav-link">
                            Harga
                        </a>
                    </li>
                    <li>
                        <Link href="/products" className="nav-link">
                            Produk Lain
                        </Link>
                    </li>
                    <li>
                        <a href="#contact" className="nav-link">
                            Kontak
                        </a>
                    </li>
                </ul>

                <div className="nav-actions">
                    <Link href="/login" className="btn btn-ghost">
                        Masuk
                    </Link>
                    <Link href="/register" className="btn btn-primary">
                        Daftar Gratis
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="mobile-nav-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu dropdown */}
            {mobileOpen && (
                <div className="mobile-nav-menu">
                    <a href="#features" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                        Fitur
                    </a>
                    <a href="#gallery" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                        Gallery
                    </a>
                    <a href="#pricing" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                        Harga
                    </a>
                    <Link href="/products" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                        Produk Lain
                    </Link>
                    <a href="#contact" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                        Kontak
                    </a>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", padding: "0 4px" }}>
                        <Link href="/login" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
                            Masuk
                        </Link>
                        <Link href="/register" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}>
                            Daftar Gratis
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
