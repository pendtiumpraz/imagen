"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.startsWith("BANNED:")) {
                    setError(result.error.replace("BANNED:", ""));
                } else {
                    setError("Email atau password salah");
                }
            } else {
                router.push("/dashboard");
                router.refresh();
            }
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
                    <h1 className="auth-title">Selamat Datang!</h1>
                    <p className="auth-subtitle">
                        Masuk ke akun Anda untuk mulai generate poster
                    </p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label className="input-label" htmlFor="login-email">
                            Email
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            className="input"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label" htmlFor="login-password">
                            Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            className="input"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                <LogIn size={18} />
                                Masuk
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-divider">
                    Belum punya akun?{" "}
                    <Link href="/register">Daftar Gratis</Link>
                </p>
            </div>
        </div>
    );
}
