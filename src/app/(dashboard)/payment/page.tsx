"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
    Upload, CreditCard, CheckCircle, Loader2, ArrowLeft, Copy, X,
    AlertTriangle, ShieldCheck, Clock, XCircle,
} from "lucide-react";
import Link from "next/link";
import { PLAN_LIMITS, PAYMENT_INFO, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface AIVerification {
    valid: boolean;
    confidence: string;
    reason: string;
    detectedAmount?: number;
}

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const selectedPlan = searchParams.get("plan") || "BASIC";
    const plan = PLAN_LIMITS[selectedPlan];

    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [senderName, setSenderName] = useState("");
    const [senderBank, setSenderBank] = useState("");
    const [transferDate, setTransferDate] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Result state
    const [resultStatus, setResultStatus] = useState<"APPROVED" | "REJECTED" | "PENDING" | null>(null);
    const [aiVerification, setAiVerification] = useState<AIVerification | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => {
            if (files[0]) {
                setProofFile(files[0]);
                setProofPreview(URL.createObjectURL(files[0]));
            }
        },
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
    });

    const copyAccountNumber = () => {
        navigator.clipboard.writeText(PAYMENT_INFO.accountNumber);
        toast.success("Nomor rekening berhasil disalin!");
    };

    const handleSubmit = async () => {
        if (!proofFile) {
            toast.error("Upload bukti transfer terlebih dahulu");
            return;
        }
        if (!senderName.trim()) {
            toast.error("Masukkan nama pengirim");
            return;
        }

        setSubmitting(true);
        try {
            // Upload proof image
            const formData = new FormData();
            formData.append("file", proofFile);
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal upload bukti");

            // Submit payment confirmation (AI will verify)
            const res = await fetch("/api/payment/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: selectedPlan,
                    amount: plan?.price || 0,
                    proofImageUrl: uploadData.url,
                    senderName: senderName.trim(),
                    senderBank: senderBank.trim(),
                    transferDate,
                    notes: notes.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal mengirim konfirmasi");

            setResultStatus(data.status);
            setAiVerification(data.aiVerification);

            if (data.status === "APPROVED") {
                toast.success("✅ Pembayaran diverifikasi & akun berhasil di-upgrade!");
            } else if (data.status === "REJECTED") {
                toast.error("❌ Bukti transfer tidak valid. Silakan cek kembali.");
            } else {
                toast.success("⏳ Konfirmasi dikirim, menunggu verifikasi admin.");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal mengirim konfirmasi");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── RESULT SCREEN ───
    if (resultStatus) {
        const isApproved = resultStatus === "APPROVED";
        const isRejected = resultStatus === "REJECTED";
        const isPending = resultStatus === "PENDING";

        return (
            <div style={{ maxWidth: "550px", margin: "0 auto", padding: "32px 16px" }}>
                {/* Status Icon */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    {isApproved && (
                        <>
                            <ShieldCheck size={64} style={{ color: "var(--success)", margin: "0 auto 12px" }} />
                            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--success)" }}>
                                Pembayaran Terverifikasi! ✅
                            </h2>
                            <p style={{ color: "var(--surface-300)", fontSize: "14px", lineHeight: 1.6, marginTop: "8px" }}>
                                AI telah memverifikasi bukti transfer Anda. Akun berhasil di-upgrade ke paket <strong>{plan?.name}</strong>!
                            </p>
                        </>
                    )}
                    {isRejected && (
                        <>
                            <XCircle size={64} style={{ color: "var(--error)", margin: "0 auto 12px" }} />
                            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--error)" }}>
                                Bukti Tidak Valid ❌
                            </h2>
                            <p style={{ color: "var(--surface-300)", fontSize: "14px", lineHeight: 1.6, marginTop: "8px" }}>
                                AI tidak dapat memverifikasi bukti transfer Anda. Silakan pastikan bukti transfer benar dan ulangi.
                            </p>
                        </>
                    )}
                    {isPending && (
                        <>
                            <Clock size={64} style={{ color: "var(--accent-400)", margin: "0 auto 12px" }} />
                            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-400)" }}>
                                Menunggu Verifikasi Admin ⏳
                            </h2>
                            <p style={{ color: "var(--surface-300)", fontSize: "14px", lineHeight: 1.6, marginTop: "8px" }}>
                                AI tidak yakin 100% dengan bukti transfer. Admin akan memverifikasi secara manual (biasanya 1-24 jam).
                            </p>
                        </>
                    )}
                </div>

                {/* AI Verification Detail */}
                {aiVerification && (
                    <div style={{
                        padding: "20px",
                        background: "var(--dark-700)",
                        borderRadius: "14px",
                        border: `1px solid ${isApproved ? "rgba(13,159,102,0.3)" : isRejected ? "rgba(239,68,68,0.3)" : "rgba(212,168,83,0.3)"}`,
                        marginBottom: "20px",
                    }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                            🤖 Hasil Analisis AI
                        </h4>

                        <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--surface-400)" }}>Status:</span>
                                <span style={{
                                    fontWeight: 700,
                                    color: aiVerification.valid ? "var(--success)" : "var(--error)",
                                }}>
                                    {aiVerification.valid ? "Valid ✅" : "Tidak Valid ❌"}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--surface-400)" }}>Kepercayaan:</span>
                                <span style={{
                                    fontWeight: 600,
                                    color: aiVerification.confidence === "high" ? "var(--success)"
                                        : aiVerification.confidence === "medium" ? "var(--accent-400)"
                                            : "var(--surface-300)",
                                }}>
                                    {aiVerification.confidence === "high" ? "Tinggi 🟢"
                                        : aiVerification.confidence === "medium" ? "Sedang 🟡"
                                            : aiVerification.confidence === "low" ? "Rendah 🔴"
                                                : "Tidak tersedia"
                                    }
                                </span>
                            </div>
                            {aiVerification.detectedAmount != null && aiVerification.detectedAmount > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--surface-400)" }}>Nominal terdeteksi:</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {formatPrice(aiVerification.detectedAmount)}
                                    </span>
                                </div>
                            )}
                            <div style={{
                                marginTop: "8px",
                                padding: "10px",
                                background: "var(--dark-600)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "var(--surface-300)",
                                lineHeight: 1.6,
                            }}>
                                💬 {aiVerification.reason}
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan info */}
                <div style={{
                    padding: "16px",
                    background: isApproved ? "rgba(13,159,102,0.08)" : "rgba(212,168,83,0.08)",
                    borderRadius: "12px",
                    border: `1px solid ${isApproved ? "rgba(13,159,102,0.2)" : "rgba(212,168,83,0.2)"}`,
                    textAlign: "center",
                    marginBottom: "20px",
                }}>
                    <div style={{ fontSize: "13px", color: "var(--surface-300)" }}>Paket dipilih</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary-400)" }}>
                        {plan?.name} — {formatPrice(plan?.price || 0)}/bulan
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--accent-400)", marginTop: "4px" }}>
                        {plan?.monthly} gambar/bulan
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <Link href="/dashboard" className="btn btn-primary" style={{ textDecoration: "none" }}>
                        Ke Dashboard
                    </Link>
                    {isRejected && (
                        <button
                            className="btn btn-accent"
                            onClick={() => { setResultStatus(null); setAiVerification(null); }}
                        >
                            Coba Lagi
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ─── PAYMENT FORM ───
    return (
        <>
            <Link href="/subscription" className="btn btn-ghost btn-sm" style={{ marginBottom: "16px" }}>
                <ArrowLeft size={16} /> Kembali ke Paket
            </Link>

            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "4px" }}>
                Konfirmasi Pembayaran
            </h2>
            <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)", marginBottom: "8px" }}>
                Transfer ke rekening di bawah, lalu upload bukti transfer.
            </p>

            {/* AI Info Banner */}
            <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 14px", marginBottom: "20px",
                background: "rgba(59,130,246,0.08)", borderRadius: "10px",
                border: "1px solid rgba(59,130,246,0.2)", fontSize: "12px",
                color: "var(--info)",
            }}>
                <ShieldCheck size={16} />
                <span>Bukti transfer akan diverifikasi otomatis oleh AI. Jika AI tidak yakin, admin akan mereview manual.</span>
            </div>

            <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "1fr 1fr" }}>
                {/* Left: Bank Info */}
                <div>
                    {/* Plan Selection */}
                    <div className="card" style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "12px", color: "var(--surface-400)", marginBottom: "8px" }}>
                            Paket dipilih:
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                            <Link
                                href="/payment?plan=BASIC"
                                className={`btn ${selectedPlan === "BASIC" ? "btn-primary" : "btn-ghost"}`}
                                style={{ flex: 1, textDecoration: "none" }}
                            >
                                Basic — {formatPrice(49000)}
                            </Link>
                            <Link
                                href="/payment?plan=PRO"
                                className={`btn ${selectedPlan === "PRO" ? "btn-primary" : "btn-ghost"}`}
                                style={{ flex: 1, textDecoration: "none" }}
                            >
                                Pro — {formatPrice(99000)}
                            </Link>
                        </div>
                        {plan && (
                            <div style={{
                                padding: "12px",
                                background: "rgba(212,168,83,0.08)",
                                borderRadius: "10px",
                                textAlign: "center",
                            }}>
                                <div style={{ textDecoration: "line-through", color: "var(--surface-400)", fontSize: "13px" }}>
                                    {plan.originalMonthly} gambar/bulan
                                </div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary-400)" }}>
                                    {plan.monthly} gambar/bulan 🔥
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--accent-400)", fontWeight: 600 }}>
                                    🌙 PROMO RAMADHAN — {Math.round(plan.monthly / plan.originalMonthly)}x LIPAT!
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bank Transfer Info */}
                    <div className="card">
                        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <CreditCard size={18} /> Transfer Ke
                        </h3>
                        <div style={{
                            padding: "20px",
                            background: "linear-gradient(135deg, rgba(13,159,102,0.1), rgba(212,168,83,0.1))",
                            borderRadius: "14px",
                            border: "1px solid rgba(13,159,102,0.2)",
                        }}>
                            <div style={{ fontSize: "14px", color: "var(--surface-300)", marginBottom: "8px" }}>
                                {PAYMENT_INFO.bankName}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "2px", color: "var(--primary-400)" }}>
                                    {PAYMENT_INFO.accountNumber}
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={copyAccountNumber}
                                    title="Salin nomor rekening"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div style={{ fontSize: "15px", fontWeight: 600 }}>
                                a.n. {PAYMENT_INFO.accountHolder}
                            </div>
                        </div>

                        <div style={{
                            marginTop: "16px", padding: "12px",
                            background: "rgba(212,168,83,0.06)", borderRadius: "10px",
                            fontSize: "13px", fontWeight: 700, textAlign: "center",
                            color: "var(--accent-400)",
                        }}>
                            Nominal Transfer: {formatPrice(plan?.price || 0)}
                        </div>

                        <p style={{ fontSize: "11px", color: "var(--surface-400)", marginTop: "12px", lineHeight: 1.6 }}>
                            🕌 {PAYMENT_INFO.description}
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div>
                    <div className="card">
                        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
                            📋 Form Konfirmasi
                        </h3>

                        {/* Upload */}
                        <div className="input-group" style={{ marginBottom: "16px" }}>
                            <label className="input-label">Bukti Transfer *</label>
                            {proofPreview ? (
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <img
                                        src={proofPreview}
                                        alt="Bukti transfer"
                                        style={{
                                            maxWidth: "100%", maxHeight: "200px",
                                            borderRadius: "12px", border: "2px solid var(--primary-600)",
                                        }}
                                    />
                                    <button
                                        onClick={() => { setProofFile(null); setProofPreview(null); }}
                                        style={{
                                            position: "absolute", top: "-8px", right: "-8px",
                                            width: "24px", height: "24px", borderRadius: "50%",
                                            background: "var(--error)", color: "white", border: "none",
                                            cursor: "pointer", display: "flex", alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    {...getRootProps()}
                                    style={{
                                        border: "2px dashed var(--surface-600)",
                                        borderRadius: "12px", padding: "24px", textAlign: "center",
                                        cursor: "pointer",
                                        background: isDragActive ? "rgba(13,159,102,0.08)" : "transparent",
                                    }}
                                >
                                    <input {...getInputProps()} />
                                    <Upload size={32} style={{ margin: "0 auto 8px", color: "var(--surface-400)" }} />
                                    <p style={{ fontSize: "13px", color: "var(--surface-400)" }}>
                                        Upload screenshot bukti transfer
                                    </p>
                                    <p style={{ fontSize: "11px", color: "var(--surface-500)" }}>
                                        PNG, JPG maks 5MB
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="input-group" style={{ marginBottom: "12px" }}>
                            <label className="input-label">Nama Pengirim *</label>
                            <input
                                className="input"
                                placeholder="Nama sesuai rekening pengirim"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: "12px" }}>
                            <label className="input-label">Bank Pengirim</label>
                            <input
                                className="input"
                                placeholder="Contoh: BCA, BRI, Mandiri..."
                                value={senderBank}
                                onChange={(e) => setSenderBank(e.target.value)}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: "12px" }}>
                            <label className="input-label">Tanggal Transfer</label>
                            <input
                                type="date" className="input"
                                value={transferDate}
                                onChange={(e) => setTransferDate(e.target.value)}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: "16px" }}>
                            <label className="input-label">Catatan (opsional)</label>
                            <textarea
                                className="textarea" rows={2}
                                placeholder="Info tambahan..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: "100%" }}
                            onClick={handleSubmit}
                            disabled={submitting || !proofFile || !senderName.trim()}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-pulse" />
                                    <span>Mengirim & Memverifikasi AI...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    <span>Kirim & Verifikasi Otomatis</span>
                                </>
                            )}
                        </button>

                        <p style={{ fontSize: "11px", color: "var(--surface-500)", textAlign: "center", marginTop: "8px" }}>
                            🤖 Bukti transfer akan dianalisis oleh AI secara otomatis
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
