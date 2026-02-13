"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload, X, Loader2, Download, ArrowLeft, ImageIcon, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RevisePage() {
    const [prompt, setPrompt] = useState("");
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setReferenceFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
    });

    const removeFile = () => {
        setReferenceFile(null);
        setPreviewUrl(null);
    };

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal upload gambar");
        return data.url;
    };

    const handleRevise = async () => {
        if (!referenceFile) {
            toast.error("Upload poster yang ingin direvisi terlebih dahulu");
            return;
        }
        if (!prompt.trim()) {
            toast.error("Masukkan instruksi revisi");
            return;
        }

        setGenerating(true);
        setResultUrl(null);

        try {
            const imageUrl = await uploadFile(referenceFile);

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: `Revise this poster: ${prompt.trim()}. Keep the overall layout and design style consistent.`,
                    category: "POSTER_DAKWAH",
                    aspectRatio: "1:1",
                    referenceImages: [imageUrl],
                    isPublic: false,
                    style: "none",
                    background: "none",
                    elements: [],
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Gagal revisi poster");
            }

            if (data.resultImageUrl) {
                setResultUrl(data.resultImageUrl);
                toast.success("Poster berhasil direvisi!");
            } else if (data.status === "processing") {
                toast("Poster sedang diproses, cek kembali nanti", { icon: "⏳" });
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal revisi poster");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: "16px" }}>
                    <ArrowLeft size={16} /> Kembali ke Dashboard
                </Link>
                <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
                    <RefreshCw size={24} style={{ display: "inline", marginRight: "8px" }} />
                    Revisi Poster
                </h2>
                <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
                    Upload poster yang sudah ada, lalu berikan instruksi untuk merevisi menggunakan AI (Image-to-Image)
                </p>
            </div>

            <div className="generator-layout">
                <div className="generator-form">

                    {/* Upload Poster to Revise */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                            <Upload size={16} style={{ display: "inline", marginRight: "6px" }} />
                            Poster yang Ingin Direvisi (Wajib)
                        </label>
                        <p style={{ fontSize: "11px", color: "var(--surface-400)", marginBottom: "12px" }}>
                            Upload poster asli yang akan direvisi. AI akan menggunakan gambar ini sebagai referensi.
                        </p>

                        {previewUrl ? (
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={previewUrl}
                                    alt="Poster to revise"
                                    style={{
                                        maxWidth: "100%", maxHeight: "300px",
                                        borderRadius: "12px", border: "2px solid var(--primary-600)",
                                    }}
                                />
                                <button
                                    onClick={removeFile}
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
                                className={`upload-zone ${isDragActive ? "upload-zone-active" : ""}`}
                            >
                                <input {...getInputProps()} />
                                <Upload size={32} className="upload-icon" />
                                <p className="upload-text">
                                    {isDragActive ? "Lepas gambar di sini..." : "Drag & drop poster atau klik untuk upload"}
                                </p>
                                <p className="upload-subtext">PNG, JPG, WEBP (maks 10MB)</p>
                            </div>
                        )}
                    </div>

                    {/* Revision Prompt */}
                    <div className="card">
                        <div className="input-group">
                            <label className="input-label">Instruksi Revisi</label>
                            <textarea
                                className="textarea"
                                placeholder="Contoh: Ganti warna background jadi biru tua, tambahkan ornamen bulan sabit di pojok kanan atas..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Safety notice */}
                    <div style={{
                        padding: "12px 16px", background: "rgba(239,68,68,0.06)",
                        borderRadius: "10px", border: "1px solid rgba(239,68,68,0.15)",
                        fontSize: "12px", color: "var(--surface-300)", lineHeight: 1.6,
                    }}>
                        ⚠️ <strong style={{ color: "var(--error)" }}>Peringatan:</strong>{" "}
                        Perubahan nomor rekening atau informasi keuangan pada poster akan terdeteksi
                        sebagai percobaan fraud dan dilaporkan ke admin.
                    </div>

                    {/* Revise Button */}
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleRevise}
                        disabled={generating || !referenceFile || !prompt.trim()}
                        style={{ width: "100%" }}
                    >
                        {generating ? (
                            <><Loader2 size={20} className="animate-pulse" /> Merevisi...</>
                        ) : (
                            <><RefreshCw size={20} /> Revisi Poster</>
                        )}
                    </button>
                </div>

                {/* Preview Panel */}
                <div className="generator-preview">
                    <div className="preview-container">
                        {resultUrl ? (
                            <div style={{ width: "100%" }}>
                                <img src={resultUrl} alt="Revised poster" className="preview-image" />
                                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                    <a
                                        href={resultUrl} download target="_blank" rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm" style={{ flex: 1 }}
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => { setResultUrl(null); setPrompt(""); }}
                                        style={{ flex: 1 }}
                                    >
                                        Revisi Lagi
                                    </button>
                                </div>
                            </div>
                        ) : generating ? (
                            <div className="preview-placeholder">
                                <Loader2 size={48} className="animate-pulse" style={{ margin: "0 auto 16px", color: "var(--primary-400)" }} />
                                <p style={{ fontSize: "var(--text-sm)" }}>Sedang merevisi poster Anda...</p>
                                <p style={{ fontSize: "var(--text-xs)", marginTop: "8px" }}>Ini bisa memakan waktu 10-30 detik</p>
                            </div>
                        ) : (
                            <div className="preview-placeholder">
                                <ImageIcon size={64} className="preview-placeholder-icon" />
                                <p style={{ fontSize: "var(--text-sm)" }}>Hasil revisi akan muncul di sini</p>
                                <p style={{ fontSize: "11px", color: "var(--surface-400)", marginTop: "8px" }}>
                                    Upload poster → Tulis instruksi → Klik Revisi
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
