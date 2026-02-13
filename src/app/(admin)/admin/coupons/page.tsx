"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket, Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface CouponItem {
    id: string;
    code: string;
    type: string;
    value: number;
    maxUses: number;
    usedCount: number;
    expiresAt: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    _count: { redemptions: number };
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<CouponItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Form state
    const [code, setCode] = useState("");
    const [type, setType] = useState("EXTRA_QUOTA");
    const [value, setValue] = useState("");
    const [maxUses, setMaxUses] = useState("100");
    const [expiresAt, setExpiresAt] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchCoupons = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/coupons");
            const data = await res.json();
            setCoupons(data.coupons || []);
        } catch {
            toast.error("Gagal memuat data kupon");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, type, value, maxUses, expiresAt, description }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Kupon berhasil dibuat!");
            setShowForm(false);
            setCode(""); setValue(""); setDescription("");
            fetchCoupons();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal membuat kupon");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleActive = async (coupon: CouponItem) => {
        try {
            await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !coupon.isActive }),
            });
            fetchCoupons();
            toast.success(coupon.isActive ? "Kupon dinonaktifkan" : "Kupon diaktifkan");
        } catch {
            toast.error("Gagal mengubah status kupon");
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm("Yakin ingin menonaktifkan kupon ini?")) return;
        try {
            await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
            fetchCoupons();
            toast.success("Kupon dinonaktifkan");
        } catch {
            toast.error("Gagal menghapus kupon");
        }
    };

    const copyCode = (couponCode: string, id: string) => {
        navigator.clipboard.writeText(couponCode);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const typeLabel = (t: string) => {
        switch (t) {
            case "EXTRA_QUOTA": return "Bonus Quota";
            case "DISCOUNT": return "Diskon %";
            case "QUOTA_BOOST": return "Boost Quota";
            default: return t;
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
                <Loader2 size={32} className="animate-pulse" />
            </div>
        );
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
                        <Ticket size={24} style={{ display: "inline", marginRight: "8px" }} />
                        Manajemen Kupon
                    </h2>
                    <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
                        Buat dan kelola kode kupon untuk user
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} /> Buat Kupon
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "16px" }}>Buat Kupon Baru</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div className="input-group">
                                <label className="input-label">Kode Kupon</label>
                                <input className="input" placeholder="Contoh: DAKWAH20" value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Tipe</label>
                                <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="EXTRA_QUOTA">Bonus Quota (tambah langsung)</option>
                                    <option value="DISCOUNT">Diskon Harga (%)</option>
                                    <option value="QUOTA_BOOST">Boost Quota Bulanan</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">
                                    {type === "EXTRA_QUOTA" ? "Jumlah Bonus Generate" : type === "DISCOUNT" ? "Persen Diskon" : "Jumlah Boost Generate"}
                                </label>
                                <input className="input" type="number" placeholder={type === "DISCOUNT" ? "20" : "20"}
                                    value={value} onChange={(e) => setValue(e.target.value)} required min="1" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Maks. Pengguna</label>
                                <input className="input" type="number" placeholder="100" value={maxUses}
                                    onChange={(e) => setMaxUses(e.target.value)} required min="1" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Berlaku Sampai</label>
                                <input className="input" type="datetime-local" value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)} required />
                            </div>
                        </div>
                        <div className="input-group" style={{ marginTop: "16px" }}>
                            <label className="input-label">Syarat & Ketentuan (opsional)</label>
                            <textarea className="textarea" rows={3}
                                placeholder="Contoh: Share ke 5 designer, kirim bukti ke WA 081252595958 (Webklinik) untuk dapatkan Coupon Code 20 Image"
                                value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                {submitting ? <><Loader2 size={14} className="animate-pulse" /> Membuat...</> : "Buat Kupon"}
                            </button>
                            <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Batal</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>Tipe</th>
                            <th>Nilai</th>
                            <th>Dipakai</th>
                            <th>Expire</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--surface-400)" }}>
                                    Belum ada kupon. Klik "Buat Kupon" untuk memulai.
                                </td>
                            </tr>
                        ) : coupons.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <code style={{
                                            background: "var(--surface-700)", padding: "2px 8px",
                                            borderRadius: "6px", fontSize: "13px", fontWeight: 700,
                                            letterSpacing: "1px",
                                        }}>
                                            {c.code}
                                        </code>
                                        <button className="btn-icon btn-ghost" style={{ padding: "2px" }}
                                            onClick={() => copyCode(c.code, c.id)} title="Copy kode">
                                            {copiedId === c.id ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                    {c.description && (
                                        <div style={{ fontSize: "11px", color: "var(--surface-400)", marginTop: "4px", maxWidth: "200px" }}>
                                            {c.description.substring(0, 60)}{c.description.length > 60 ? "..." : ""}
                                        </div>
                                    )}
                                </td>
                                <td><span className="badge badge-info">{typeLabel(c.type)}</span></td>
                                <td style={{ fontWeight: 600 }}>
                                    {c.type === "DISCOUNT" ? `${c.value}%` : `${c.value} image`}
                                </td>
                                <td>{c.usedCount} / {c.maxUses}</td>
                                <td style={{ fontSize: "12px" }}>
                                    {new Date(c.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                    {new Date(c.expiresAt) < new Date() && (
                                        <span className="badge badge-error" style={{ marginLeft: "4px", fontSize: "10px" }}>Expired</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${c.isActive ? "badge-success" : "badge-error"}`}>
                                        {c.isActive ? "Aktif" : "Nonaktif"}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(c)}>
                                            {c.isActive ? "Nonaktifkan" : "Aktifkan"}
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => deleteCoupon(c.id)}
                                            style={{ color: "var(--error)" }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
