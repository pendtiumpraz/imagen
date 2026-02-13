"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
    Wand2, Sparkles, Upload, X, Loader2, Download, ArrowLeft, ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { CATEGORIES, ASPECT_RATIOS } from "@/lib/utils";
import toast from "react-hot-toast";

export default function GeneratorPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.category as string;
    const category = CATEGORIES.find((c) => c.id === categoryId);

    const [prompt, setPrompt] = useState("");
    const [enhancedPrompt, setEnhancedPrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState(
        category?.defaultAspectRatio || "1:1"
    );
    const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
    const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newFiles = [...referenceFiles, ...acceptedFiles].slice(0, 2);
            setReferenceFiles(newFiles);
            const urls = newFiles.map((f) => URL.createObjectURL(f));
            setPreviewUrls(urls);
        },
        [referenceFiles]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxFiles: 2,
        maxSize: 10 * 1024 * 1024,
    });

    const removeFile = (index: number) => {
        const newFiles = referenceFiles.filter((_, i) => i !== index);
        setReferenceFiles(newFiles);
        setPreviewUrls(newFiles.map((f) => URL.createObjectURL(f)));
        setReferenceUrls(referenceUrls.filter((_, i) => i !== index));
    };

    const handleEnhancePrompt = async () => {
        if (!prompt.trim()) {
            toast.error("Masukkan prompt terlebih dahulu");
            return;
        }
        setEnhancing(true);
        try {
            const res = await fetch("/api/generate/prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, category: categoryId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal enhance prompt");
            setEnhancedPrompt(data.enhanced);
            toast.success("Prompt berhasil di-enhance!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal enhance prompt");
        } finally {
            setEnhancing(false);
        }
    };

    const uploadReferenceImages = async (): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of referenceFiles) {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal upload gambar");
            urls.push(data.url);
        }
        return urls;
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && !enhancedPrompt.trim()) {
            toast.error("Masukkan prompt terlebih dahulu");
            return;
        }
        setGenerating(true);
        setResultUrl(null);

        try {
            let initImages: string[] = [];
            if (referenceFiles.length > 0) {
                initImages = await uploadReferenceImages();
                setReferenceUrls(initImages);
            }

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: enhancedPrompt || prompt,
                    category: categoryId,
                    aspectRatio,
                    referenceImages: initImages,
                    isPublic,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal generate gambar");

            if (data.resultImageUrl) {
                setResultUrl(data.resultImageUrl);
                toast.success("Poster berhasil di-generate!");
            } else if (data.status === "processing") {
                toast("Gambar sedang diproses, cek kembali nanti", { icon: "⏳" });
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal generate");
        } finally {
            setGenerating(false);
        }
    };

    if (!category) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Kategori tidak ditemukan</h3>
                <Link href="/generate" className="btn btn-primary">
                    <ArrowLeft size={16} />
                    Kembali
                </Link>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: "24px" }}>
                <Link
                    href="/generate"
                    className="btn btn-ghost btn-sm"
                    style={{ marginBottom: "16px" }}
                >
                    <ArrowLeft size={16} />
                    Kembali ke Kategori
                </Link>
                <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
                    {category.name}
                </h2>
                <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
                    {category.description}
                </p>
            </div>

            <div className="generator-layout">
                <div className="generator-form">
                    {/* Prompt Input */}
                    <div className="card">
                        <div className="input-group">
                            <label className="input-label">
                                Prompt / Deskripsi Poster
                            </label>
                            <textarea
                                className="textarea"
                                placeholder={`Deskripsikan poster ${category.name} yang ingin dibuat...`}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                            />
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={handleEnhancePrompt}
                                    disabled={enhancing || !prompt.trim()}
                                >
                                    {enhancing ? (
                                        <Loader2 size={14} className="animate-pulse" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    {enhancing ? "Enhancing..." : "AI Enhance Prompt"}
                                </button>
                            </div>
                        </div>

                        {enhancedPrompt && (
                            <div
                                style={{
                                    marginTop: "16px",
                                    padding: "12px",
                                    background: "rgba(13,159,102,0.08)",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(13,159,102,0.2)",
                                }}
                            >
                                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary-400)", marginBottom: "6px" }}>
                                    ✨ Enhanced Prompt
                                </div>
                                <p style={{ fontSize: "13px", color: "var(--surface-300)", lineHeight: 1.6 }}>
                                    {enhancedPrompt}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Reference Images */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "block" }}>
                            Gambar Referensi (Opsional, maks 2)
                        </label>
                        <div
                            {...getRootProps()}
                            className={`upload-zone ${isDragActive ? "upload-zone-active" : ""}`}
                        >
                            <input {...getInputProps()} />
                            <Upload size={32} className="upload-icon" />
                            <p className="upload-text">
                                {isDragActive
                                    ? "Lepas gambar di sini..."
                                    : "Drag & drop gambar atau klik untuk upload"}
                            </p>
                            <p className="upload-subtext">PNG, JPG, WEBP (maks 10MB)</p>
                        </div>
                        {previewUrls.length > 0 && (
                            <div className="upload-previews">
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="upload-preview">
                                        <img src={url} alt={`ref-${i}`} />
                                        <button
                                            className="upload-preview-remove"
                                            onClick={() => removeFile(i)}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Aspect Ratio */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "block" }}>
                            Rasio Aspek
                        </label>
                        <div className="aspect-grid">
                            {ASPECT_RATIOS.map((ar) => (
                                <button
                                    key={ar.value}
                                    className={`aspect-option ${aspectRatio === ar.value ? "aspect-option-active" : ""
                                        }`}
                                    onClick={() => setAspectRatio(ar.value)}
                                >
                                    {ar.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Public toggle */}
                    <div className="card">
                        <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                style={{ width: "18px", height: "18px", accentColor: "var(--primary-500)" }}
                            />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
                                    Tampilkan di Gallery Publik
                                </div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--surface-300)" }}>
                                    Poster akan muncul di halaman utama
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Generate Button */}
                    <button
                        className="btn btn-accent btn-lg"
                        onClick={handleGenerate}
                        disabled={generating || (!prompt.trim() && !enhancedPrompt.trim())}
                        style={{ width: "100%" }}
                    >
                        {generating ? (
                            <>
                                <Loader2 size={20} className="animate-pulse" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} />
                                Generate Poster
                            </>
                        )}
                    </button>
                </div>

                {/* Preview Panel */}
                <div className="generator-preview">
                    <div className="preview-container">
                        {resultUrl ? (
                            <div style={{ width: "100%" }}>
                                <img
                                    src={resultUrl}
                                    alt="Generated poster"
                                    className="preview-image"
                                />
                                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                    <a
                                        href={resultUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm"
                                        style={{ flex: 1 }}
                                    >
                                        <Download size={14} />
                                        Download
                                    </a>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setResultUrl(null);
                                            setPrompt("");
                                            setEnhancedPrompt("");
                                        }}
                                        style={{ flex: 1 }}
                                    >
                                        Generate Lagi
                                    </button>
                                </div>
                            </div>
                        ) : generating ? (
                            <div className="preview-placeholder">
                                <Loader2
                                    size={48}
                                    className="animate-pulse"
                                    style={{ margin: "0 auto 16px", color: "var(--primary-400)" }}
                                />
                                <p style={{ fontSize: "var(--text-sm)" }}>
                                    Sedang memproses poster Anda...
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", marginTop: "8px" }}>
                                    Ini bisa memakan waktu 10-30 detik
                                </p>
                            </div>
                        ) : (
                            <div className="preview-placeholder">
                                <ImageIcon size={64} className="preview-placeholder-icon" />
                                <p style={{ fontSize: "var(--text-sm)" }}>
                                    Hasil poster akan muncul di sini
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
