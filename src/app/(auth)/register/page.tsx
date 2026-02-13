"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, UserPlus, Loader2, Phone } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            return;
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Terjadi kesalahan");
                return;
            }

            router.push("/login?registered=true");
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg" />
            <div className="auth-card">
                <div className="auth-header">
                    <Link href="/" className="logo" style={{ justifyContent: "center" }}>
                        <div className="logo-icon">
                            <Moon size={22} />
                        </div>
                        PosterDakwah
                    </Link>
                    <h1 className="auth-title">Buat Akun Baru</h1>
                    <p className="auth-subtitle">
                        Daftar gratis dan mulai generate poster AI
                    </p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label className="input-label" htmlFor="register-name">
                            Nama Lengkap
                        </label>
                        <input
                            id="register-name"
                            type="text"
                            className="input"
                            placeholder="Masukkan nama lengkap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="register-email">
                            Email
                        </label>
                        <input
                            id="register-email"
                            type="email"
                            className="input"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="register-phone">
                            Nomor HP (WhatsApp)
                        </label>
                        <input
                            id="register-phone"
                            type="tel"
                            className="input"
                            placeholder="08xxxxxxxxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <p style={{ fontSize: "11px", color: "var(--surface-400)", marginTop: "4px" }}>
                            1 nomor HP hanya untuk 1 akun. Digunakan untuk info program & promo.
                        </p>
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="register-password">
                            Password
                        </label>
                        <input
                            id="register-password"
                            type="password"
                            className="input"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="register-confirm">
                            Konfirmasi Password
                        </label>
                        <input
                            id="register-confirm"
                            type="password"
                            className="input"
                            placeholder="Ulangi password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: "100%" }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-pulse" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Daftar Sekarang
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-divider">
                    Sudah punya akun?{" "}
                    <Link href="/login">Masuk di sini</Link>
                </p>
            </div>
        </div>
    );
}
