"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon } from "lucide-react";

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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
                </ul>

                <div className="nav-actions">
                    <Link href="/login" className="btn btn-ghost">
                        Masuk
                    </Link>
                    <Link href="/register" className="btn btn-primary">
                        Daftar Gratis
                    </Link>
                </div>
            </div>
        </nav>
    );
}
