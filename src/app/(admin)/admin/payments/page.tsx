"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CreditCard, Clock, CheckCircle, XCircle, Eye, Loader2,
    ShieldCheck, Ban, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";

interface PaymentItem {
    id: string;
    userId: string;
    plan: string;
    amount: number;
    status: string;
    proofImageUrl: string | null;
    senderName: string | null;
    senderBank: string | null;
    transferDate: string | null;
    notes: string | null;
    adminNotes: string | null;
    reviewedAt: string | null;
    reviewedBy: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        plan: string;
    };
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");
    const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [processing, setProcessing] = useState(false);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/payments");
            const data = await res.json();
            setPayments(data.payments || []);
            setStats(data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
        } catch {
            toast.error("Gagal memuat data pembayaran");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const handleAction = async (paymentId: string, action: "approve" | "reject") => {
        setProcessing(true);
        try {
            const res = await fetch("/api/admin/payments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, action, adminNotes }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(action === "approve" ? "Payment approved & user upgraded!" : "Payment rejected");
            setSelectedPayment(null);
            setAdminNotes("");
            fetchPayments();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal memproses");
        } finally {
            setProcessing(false);
        }
    };

    const filtered = filter === "ALL"
        ? payments
        : payments.filter((p) => p.status === filter);

    const statusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return <span className="badge badge-accent"><Clock size={12} /> Pending</span>;
            case "APPROVED": return <span className="badge badge-success"><CheckCircle size={12} /> Approved</span>;
            case "REJECTED": return <span className="badge badge-error"><XCircle size={12} /> Rejected</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <>
            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: "24px" }}>
                <div className="stat-card" onClick={() => setFilter("ALL")} style={{ cursor: "pointer" }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Pembayaran</span>
                        <div className="stat-card-icon" style={{ background: "rgba(59,130,246,0.12)", color: "var(--info)" }}>
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{stats.total}</div>
                </div>
                <div className="stat-card" onClick={() => setFilter("PENDING")} style={{ cursor: "pointer" }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Menunggu Review</span>
                        <div className="stat-card-icon" style={{ background: "rgba(212,168,83,0.12)", color: "var(--accent-400)" }}>
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value" style={{ color: stats.pending > 0 ? "var(--accent-400)" : undefined }}>
                        {stats.pending}
                    </div>
                </div>
                <div className="stat-card" onClick={() => setFilter("APPROVED")} style={{ cursor: "pointer" }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Disetujui</span>
                        <div className="stat-card-icon" style={{ background: "rgba(13,159,102,0.12)", color: "var(--success)" }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{stats.approved}</div>
                </div>
                <div className="stat-card" onClick={() => setFilter("REJECTED")} style={{ cursor: "pointer" }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Ditolak</span>
                        <div className="stat-card-icon" style={{ background: "rgba(239,68,68,0.12)", color: "var(--error)" }}>
                            <XCircle size={20} />
                        </div>
                    </div>
                    <div className="stat-card-value">{stats.rejected}</div>
                </div>
            </div>

            {/* Filter bar */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
                    <button
                        key={f}
                        className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === "ALL" ? "Semua" : f === "PENDING" ? "Pending" : f === "APPROVED" ? "Approved" : "Rejected"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="empty-state">
                    <Loader2 size={40} className="animate-pulse" style={{ margin: "0 auto" }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <CreditCard size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">Belum ada pembayaran</h3>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Paket</th>
                                <th>Nominal</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>AI Notes</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: "13px" }}>{payment.user.name}</div>
                                            <div style={{ fontSize: "11px", color: "var(--surface-400)" }}>{payment.user.email}</div>
                                            {payment.senderName && (
                                                <div style={{ fontSize: "11px", color: "var(--surface-300)" }}>
                                                    Pengirim: {payment.senderName}
                                                    {payment.senderBank && ` (${payment.senderBank})`}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-primary">{payment.plan}</span></td>
                                    <td style={{ fontWeight: 700 }}>{formatPrice(payment.amount)}</td>
                                    <td>{statusBadge(payment.status)}</td>
                                    <td style={{ fontSize: "12px", color: "var(--surface-300)" }}>
                                        {new Date(payment.createdAt).toLocaleDateString("id-ID")}
                                    </td>
                                    <td style={{ maxWidth: "200px", fontSize: "11px", color: "var(--surface-400)", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {payment.adminNotes?.slice(0, 80)}
                                        {(payment.adminNotes?.length || 0) > 80 ? "..." : ""}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => { setSelectedPayment(payment); setAdminNotes(""); }}
                                                title="Detail"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            {payment.status === "PENDING" && (
                                                <>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ color: "var(--success)" }}
                                                        onClick={() => handleAction(payment.id, "approve")}
                                                        title="Approve"
                                                    >
                                                        <ShieldCheck size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ color: "var(--error)" }}
                                                        onClick={() => handleAction(payment.id, "reject")}
                                                        title="Reject"
                                                    >
                                                        <Ban size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {selectedPayment && (
                <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Detail Pembayaran</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSelectedPayment(null)}>✕</button>
                        </div>

                        <div style={{ display: "grid", gap: "16px" }}>
                            {/* Proof Image */}
                            {selectedPayment.proofImageUrl && (
                                <div style={{ textAlign: "center" }}>
                                    <img
                                        src={selectedPayment.proofImageUrl}
                                        alt="Bukti Transfer"
                                        style={{
                                            maxWidth: "100%", maxHeight: "300px",
                                            borderRadius: "12px", border: "2px solid var(--dark-400)",
                                        }}
                                    />
                                    <a
                                        href={selectedPayment.proofImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "8px", fontSize: "12px", color: "var(--primary-400)" }}
                                    >
                                        <ExternalLink size={12} /> Buka gambar penuh
                                    </a>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                                <div>
                                    <span style={{ color: "var(--surface-400)" }}>User:</span>
                                    <div style={{ fontWeight: 600 }}>{selectedPayment.user.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--surface-400)" }}>{selectedPayment.user.email}</div>
                                </div>
                                <div>
                                    <span style={{ color: "var(--surface-400)" }}>Pengirim:</span>
                                    <div style={{ fontWeight: 600 }}>{selectedPayment.senderName || "-"}</div>
                                    <div style={{ fontSize: "11px" }}>{selectedPayment.senderBank || ""}</div>
                                </div>
                                <div>
                                    <span style={{ color: "var(--surface-400)" }}>Paket:</span>
                                    <div style={{ fontWeight: 700 }}>{selectedPayment.plan}</div>
                                </div>
                                <div>
                                    <span style={{ color: "var(--surface-400)" }}>Nominal:</span>
                                    <div style={{ fontWeight: 700, color: "var(--primary-400)" }}>{formatPrice(selectedPayment.amount)}</div>
                                </div>
                                <div>
                                    <span style={{ color: "var(--surface-400)" }}>Tanggal Transfer:</span>
                                    <div>{selectedPayment.transferDate || "-"}</div>
                                </div>
                                <div>
                                    <span style={{ color: "var(--surface-400)" }}>Status:</span>
                                    <div>{statusBadge(selectedPayment.status)}</div>
                                </div>
                            </div>

                            {/* AI Notes */}
                            {selectedPayment.adminNotes && (
                                <div style={{
                                    padding: "12px", background: "var(--dark-600)",
                                    borderRadius: "10px", fontSize: "12px"
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: "4px", color: "var(--surface-300)" }}>🤖 AI / Admin Notes:</div>
                                    <div style={{ color: "var(--surface-400)", lineHeight: 1.6 }}>{selectedPayment.adminNotes}</div>
                                </div>
                            )}

                            {/* User Notes */}
                            {selectedPayment.notes && (
                                <div style={{
                                    padding: "12px", background: "var(--dark-600)",
                                    borderRadius: "10px", fontSize: "12px"
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: "4px", color: "var(--surface-300)" }}>📝 Catatan User:</div>
                                    <div style={{ color: "var(--surface-400)" }}>{selectedPayment.notes}</div>
                                </div>
                            )}

                            {/* Admin Actions */}
                            {selectedPayment.status === "PENDING" && (
                                <div style={{ borderTop: "1px solid var(--dark-500)", paddingTop: "16px" }}>
                                    <div className="input-group" style={{ marginBottom: "12px" }}>
                                        <label className="input-label">Catatan Admin</label>
                                        <textarea
                                            className="textarea"
                                            rows={2}
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Catatan admin (opsional)..."
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1 }}
                                            onClick={() => handleAction(selectedPayment.id, "approve")}
                                            disabled={processing}
                                        >
                                            <ShieldCheck size={16} />
                                            Approve & Upgrade
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ flex: 1 }}
                                            onClick={() => handleAction(selectedPayment.id, "reject")}
                                            disabled={processing}
                                        >
                                            <Ban size={16} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
