"use client";

import { useState } from "react";
import { Ticket, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function CouponRedeemer() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRedeem = async () => {
        if (!code.trim()) {
            toast.error("Masukkan kode kupon");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/coupon/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message);
            setCode("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal redeem kupon");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Ticket size={18} style={{ color: "var(--primary-400)" }} />
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Punya Kode Kupon?</h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--surface-400)", marginBottom: "12px" }}>
                Masukkan kode kupon untuk mendapatkan bonus quota atau diskon
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
                <input
                    className="input"
                    placeholder="Masukkan kode kupon..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
                    style={{ flex: 1, letterSpacing: "1px", fontWeight: 600 }}
                />
                <button className="btn btn-primary" onClick={handleRedeem} disabled={loading || !code.trim()}>
                    {loading ? <Loader2 size={14} className="animate-pulse" /> : "Redeem"}
                </button>
            </div>
        </div>
    );
}
