"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
    Wand2, Sparkles, Upload, X, Loader2, Download, ArrowLeft, ImageIcon, Palette, Layers, Sun,
    Image as ImageLucide, AtSign, Globe, Plus,
} from "lucide-react";
import Link from "next/link";
import {
    CATEGORIES, ASPECT_RATIOS, STYLE_OPTIONS, BACKGROUND_OPTIONS,
    COLOR_PALETTES, ISLAMIC_ELEMENTS,
} from "@/lib/utils";
import toast from "react-hot-toast";

const SOCIAL_MEDIA_OPTIONS = [
    { id: "instagram", name: "Instagram", icon: "📸", prefix: "@" },
    { id: "facebook", name: "Facebook", icon: "📘", prefix: "" },
    { id: "tiktok", name: "TikTok", icon: "🎵", prefix: "@" },
    { id: "youtube", name: "YouTube", icon: "🎬", prefix: "" },
    { id: "twitter", name: "X / Twitter", icon: "𝕏", prefix: "@" },
    { id: "whatsapp", name: "WhatsApp", icon: "💬", prefix: "" },
    { id: "telegram", name: "Telegram", icon: "✈️", prefix: "@" },
    { id: "website", name: "Website", icon: "🌐", prefix: "" },
    { id: "email", name: "Email", icon: "📧", prefix: "" },
    { id: "shopee", name: "Shopee", icon: "🛒", prefix: "" },
    { id: "tokopedia", name: "Tokopedia", icon: "🟢", prefix: "" },
];

export default function GeneratorPage() {
    const params = useParams();
    const categoryId = params.category as string;
    const category = CATEGORIES.find((c) => c.id === categoryId);

    // Core
    const [prompt, setPrompt] = useState("");
    const [enhancedPrompt, setEnhancedPrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState(category?.defaultAspectRatio || "1:1");

    // Islamic inputs
    const [style, setStyle] = useState("realistic");
    const [background, setBackground] = useState("mosque");
    const [customBackground, setCustomBackground] = useState("");
    const [colorPalette, setColorPalette] = useState("emerald_gold");
    const [customColor, setCustomColor] = useState("");
    const [selectedElements, setSelectedElements] = useState<string[]>(["calligraphy", "dome"]);

    // Logo
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Username & Social Media
    const [brandName, setBrandName] = useState("");
    const [activeSocials, setActiveSocials] = useState<string[]>([]);
    const [socialUsernames, setSocialUsernames] = useState<Record<string, string>>({});

    // Reference images
    const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
    const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // State
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [autoFilling, setAutoFilling] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    // Reference image drop
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newFiles = [...referenceFiles, ...acceptedFiles].slice(0, 2);
            setReferenceFiles(newFiles);
            setPreviewUrls(newFiles.map((f) => URL.createObjectURL(f)));
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

    // Logo drop
    const onLogoDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
        onDrop: onLogoDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".svg"] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
    });

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const toggleElement = (id: string) => {
        setSelectedElements((prev) =>
            prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
        );
    };

    const toggleSocial = (id: string) => {
        setActiveSocials((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const updateSocialUsername = (id: string, value: string) => {
        setSocialUsernames((prev) => ({ ...prev, [id]: value }));
    };

    // Build footer/contact info for prompt
    const buildFooterPrompt = (): string => {
        const parts: string[] = [];
        if (brandName.trim()) {
            parts.push(`brand/organization name "${brandName}" displayed prominently`);
        }
        const socials = activeSocials
            .filter((id) => socialUsernames[id]?.trim())
            .map((id) => {
                const opt = SOCIAL_MEDIA_OPTIONS.find((s) => s.id === id);
                return `${opt?.name}: ${opt?.prefix || ""}${socialUsernames[id]}`;
            });

        if (socials.length > 0) {
            parts.push(`footer with social media contact info: ${socials.join(", ")}`);
        }

        if (logoFile) {
            parts.push("include the uploaded logo/brand mark in the design, placed in a professional position (corner or header)");
        }

        return parts.join(". ");
    };

    // ============ AI AUTO-FILL ============
    const handleAutoFill = async () => {
        setAutoFilling(true);
        try {
            const res = await fetch("/api/generate/prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "autofill",
                    category: categoryId,
                    prompt: prompt || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal generate suggestion");

            const s = data.suggestion;
            if (s.prompt) setPrompt(s.prompt);
            if (s.style) setStyle(s.style);
            if (s.background) setBackground(s.background);
            if (s.customBackground) setCustomBackground(s.customBackground);
            if (s.colorPalette) setColorPalette(s.colorPalette);
            if (s.customColor) setCustomColor(s.customColor);
            if (s.elements && s.elements.length > 0) setSelectedElements(s.elements);

            setEnhancedPrompt("");
            toast.success("✨ Auto-fill berhasil! Semua input terisi otomatis");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal auto-fill");
        } finally {
            setAutoFilling(false);
        }
    };

    // ============ ENHANCE PROMPT ============
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

    // ============ UPLOAD ============
    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal upload gambar");
        return data.url;
    };

    // ============ GENERATE ============
    const handleGenerate = async () => {
        if (!prompt.trim() && !enhancedPrompt.trim()) {
            toast.error("Masukkan prompt terlebih dahulu");
            return;
        }
        setGenerating(true);
        setResultUrl(null);

        try {
            // Upload reference images
            const initImages: string[] = [];
            for (const file of referenceFiles) {
                const url = await uploadFile(file);
                initImages.push(url);
            }

            // Upload logo as part of reference if provided
            if (logoFile) {
                const logoUrl = await uploadFile(logoFile);
                initImages.push(logoUrl);
            }

            setReferenceUrls(initImages);

            // Build footer info into the prompt
            const footerInfo = buildFooterPrompt();
            const finalPrompt = [enhancedPrompt || prompt, footerInfo].filter(Boolean).join(". ");

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    category: categoryId,
                    aspectRatio,
                    referenceImages: initImages.length > 0 ? initImages : undefined,
                    isPublic,
                    style,
                    background,
                    customBackground: background === "custom" ? customBackground : undefined,
                    colorPalette,
                    customColor: colorPalette === "custom" ? customColor : undefined,
                    elements: selectedElements,
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
                    <ArrowLeft size={16} /> Kembali
                </Link>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/generate" className="btn btn-ghost btn-sm" style={{ marginBottom: "16px" }}>
                    <ArrowLeft size={16} /> Kembali ke Kategori
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

                    {/* ✨ AI Auto-Fill */}
                    <button
                        className="btn btn-accent btn-lg"
                        onClick={handleAutoFill}
                        disabled={autoFilling}
                        style={{ width: "100%", marginBottom: "8px" }}
                    >
                        {autoFilling ? (
                            <><Loader2 size={20} className="animate-pulse" /> AI sedang membuat suggestion...</>
                        ) : (
                            <><Sparkles size={20} /> ✨ AI Auto-Fill (Generate Semua Input)</>
                        )}
                    </button>
                    <p style={{ fontSize: "11px", color: "var(--surface-400)", textAlign: "center", marginBottom: "16px" }}>
                        Klik untuk mengisi semua input otomatis menggunakan AI (Islami)
                    </p>

                    {/* Prompt Input */}
                    <div className="card">
                        <div className="input-group">
                            <label className="input-label">Prompt / Deskripsi Poster</label>
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
                                    {enhancing ? <Loader2 size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                                    {enhancing ? "Enhancing..." : "AI Enhance Prompt"}
                                </button>
                            </div>
                        </div>
                        {enhancedPrompt && (
                            <div style={{
                                marginTop: "16px", padding: "12px",
                                background: "rgba(13,159,102,0.08)", borderRadius: "10px",
                                border: "1px solid rgba(13,159,102,0.2)",
                            }}>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary-400)", marginBottom: "6px" }}>
                                    ✨ Enhanced Prompt
                                </div>
                                <p style={{ fontSize: "13px", color: "var(--surface-300)", lineHeight: 1.6 }}>
                                    {enhancedPrompt}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Style Selection */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Layers size={16} /> Gaya / Style
                        </label>
                        <div className="aspect-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
                            {STYLE_OPTIONS.map((s) => (
                                <button
                                    key={s.id}
                                    className={`aspect-option ${style === s.id ? "aspect-option-active" : ""}`}
                                    onClick={() => setStyle(s.id)}
                                    title={s.description}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background Selection */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Sun size={16} /> Background
                        </label>
                        <div className="aspect-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                            {BACKGROUND_OPTIONS.map((bg) => (
                                <button
                                    key={bg.id}
                                    className={`aspect-option ${background === bg.id ? "aspect-option-active" : ""}`}
                                    onClick={() => setBackground(bg.id)}
                                    style={{ fontSize: "12px" }}
                                >
                                    {bg.name}
                                </button>
                            ))}
                        </div>
                        {background === "custom" && (
                            <input
                                className="input"
                                style={{ marginTop: "12px" }}
                                placeholder="Deskripsikan background yang diinginkan..."
                                value={customBackground}
                                onChange={(e) => setCustomBackground(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Color Palette */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Palette size={16} /> Warna / Color Palette
                        </label>
                        <div className="aspect-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                            {COLOR_PALETTES.map((cp) => (
                                <button
                                    key={cp.id}
                                    className={`aspect-option ${colorPalette === cp.id ? "aspect-option-active" : ""}`}
                                    onClick={() => setColorPalette(cp.id)}
                                    style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    {cp.colors.length > 0 && (
                                        <span style={{ display: "flex", gap: "2px" }}>
                                            {cp.colors.slice(0, 3).map((c, i) => (
                                                <span key={i} style={{
                                                    width: "12px", height: "12px", borderRadius: "50%",
                                                    background: c, border: "1px solid rgba(255,255,255,0.2)",
                                                    display: "inline-block",
                                                }} />
                                            ))}
                                        </span>
                                    )}
                                    {cp.name}
                                </button>
                            ))}
                        </div>
                        {colorPalette === "custom" && (
                            <input
                                className="input"
                                style={{ marginTop: "12px" }}
                                placeholder="Deskripsikan warna, misal: biru navy dengan aksen emas..."
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Islamic Elements */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            🕌 Elemen Islami
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {ISLAMIC_ELEMENTS.map((el) => (
                                <button
                                    key={el.id}
                                    className={`aspect-option ${selectedElements.includes(el.id) ? "aspect-option-active" : ""}`}
                                    onClick={() => toggleElement(el.id)}
                                    style={{ fontSize: "12px" }}
                                >
                                    {el.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <ImageLucide size={16} /> Logo (Opsional)
                        </label>
                        <p style={{ fontSize: "11px", color: "var(--surface-400)", marginBottom: "12px" }}>
                            Upload logo masjid, organisasi, brand, atau sekolah Anda. Logo akan dimasukkan ke dalam desain poster.
                        </p>
                        {logoPreview ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "80px", height: "80px", borderRadius: "12px",
                                    background: "var(--surface-800)", display: "flex",
                                    alignItems: "center", justifyContent: "center", overflow: "hidden",
                                    border: "2px solid var(--primary-600)", position: "relative",
                                }}>
                                    <img src={logoPreview} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                    <button
                                        onClick={removeLogo}
                                        style={{
                                            position: "absolute", top: "-6px", right: "-6px",
                                            width: "20px", height: "20px", borderRadius: "50%",
                                            background: "var(--error)", color: "white", border: "none",
                                            cursor: "pointer", display: "flex", alignItems: "center",
                                            justifyContent: "center", fontSize: "10px",
                                        }}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--surface-300)" }}>
                                    ✅ Logo terupload. Akan dimasukkan ke desain poster.
                                </div>
                            </div>
                        ) : (
                            <div
                                {...getLogoRootProps()}
                                style={{
                                    border: "2px dashed var(--surface-600)", borderRadius: "12px",
                                    padding: "20px", textAlign: "center", cursor: "pointer",
                                    background: isLogoDragActive ? "rgba(13,159,102,0.08)" : "transparent",
                                    transition: "background 0.2s ease",
                                }}
                            >
                                <input {...getLogoInputProps()} />
                                <ImageLucide size={28} style={{ margin: "0 auto 8px", color: "var(--surface-400)" }} />
                                <p style={{ fontSize: "12px", color: "var(--surface-400)" }}>
                                    Klik atau drag logo di sini (PNG, JPG, SVG, maks 5MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Brand Name & Social Media */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <AtSign size={16} /> Nama Brand & Sosial Media (Footer Poster)
                        </label>
                        <p style={{ fontSize: "11px", color: "var(--surface-400)", marginBottom: "12px" }}>
                            Info ini akan ditampilkan di footer/bagian bawah poster yang di-generate.
                        </p>

                        {/* Brand Name */}
                        <div className="input-group" style={{ marginBottom: "16px" }}>
                            <label className="input-label" style={{ fontSize: "12px" }}>Nama Brand / Organisasi</label>
                            <input
                                className="input"
                                placeholder="Contoh: Masjid Al-Ikhlas, Pondok Pesantren Darul Hikmah..."
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                            />
                        </div>

                        {/* Social Media Selection */}
                        <label className="input-label" style={{ fontSize: "12px", marginBottom: "8px", display: "block" }}>
                            Pilih Sosial Media (klik untuk aktifkan)
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                            {SOCIAL_MEDIA_OPTIONS.map((sm) => (
                                <button
                                    key={sm.id}
                                    className={`aspect-option ${activeSocials.includes(sm.id) ? "aspect-option-active" : ""}`}
                                    onClick={() => toggleSocial(sm.id)}
                                    style={{ fontSize: "12px" }}
                                >
                                    {sm.icon} {sm.name}
                                </button>
                            ))}
                        </div>

                        {/* Active Social Media Username Inputs */}
                        {activeSocials.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {activeSocials.map((id) => {
                                    const sm = SOCIAL_MEDIA_OPTIONS.find((s) => s.id === id);
                                    if (!sm) return null;
                                    return (
                                        <div key={id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{
                                                fontSize: "14px", width: "28px", textAlign: "center",
                                                flexShrink: 0
                                            }}>
                                                {sm.icon}
                                            </span>
                                            <input
                                                className="input"
                                                style={{ flex: 1, fontSize: "13px" }}
                                                placeholder={`${sm.name}: ${sm.prefix}username atau link...`}
                                                value={socialUsernames[id] || ""}
                                                onChange={(e) => updateSocialUsername(id, e.target.value)}
                                            />
                                            <button
                                                onClick={() => toggleSocial(id)}
                                                style={{
                                                    background: "none", border: "none", cursor: "pointer",
                                                    color: "var(--surface-400)", flexShrink: 0,
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Reference Images */}
                    <div className="card">
                        <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                            Gambar Referensi (Opsional, maks 2)
                        </label>
                        <p style={{ fontSize: "11px", color: "var(--surface-400)", marginBottom: "12px" }}>
                            Jika ada referensi → AI menggunakan <strong>Image Edit</strong> (nano-banana-pro).
                            Tanpa referensi → <strong>Text-to-Image</strong>.
                        </p>
                        <div
                            {...getRootProps()}
                            className={`upload-zone ${isDragActive ? "upload-zone-active" : ""}`}
                        >
                            <input {...getInputProps()} />
                            <Upload size={32} className="upload-icon" />
                            <p className="upload-text">
                                {isDragActive ? "Lepas gambar di sini..." : "Drag & drop gambar atau klik untuk upload"}
                            </p>
                            <p className="upload-subtext">PNG, JPG, WEBP (maks 10MB)</p>
                        </div>
                        {previewUrls.length > 0 && (
                            <div className="upload-previews">
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="upload-preview">
                                        <img src={url} alt={`ref-${i}`} />
                                        <button className="upload-preview-remove" onClick={() => removeFile(i)}>
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
                                    className={`aspect-option ${aspectRatio === ar.value ? "aspect-option-active" : ""}`}
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

                    {/* Islamic rules notice */}
                    <div style={{
                        padding: "12px 16px", background: "rgba(13,159,102,0.06)",
                        borderRadius: "10px", border: "1px solid rgba(13,159,102,0.15)",
                        fontSize: "12px", color: "var(--surface-300)", lineHeight: 1.6,
                    }}>
                        🕌 <strong style={{ color: "var(--primary-400)" }}>Aturan Islami Otomatis:</strong>{" "}
                        Wanita muslimah → silhouette bercadar & hijab lebar.
                        Makhluk bernyawa → tanpa kepala/silhouette.
                        Semua desain sesuai syariat Islam.
                    </div>

                    {/* Generate Button */}
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleGenerate}
                        disabled={generating || (!prompt.trim() && !enhancedPrompt.trim())}
                        style={{ width: "100%" }}
                    >
                        {generating ? (
                            <><Loader2 size={20} className="animate-pulse" /> Generating...</>
                        ) : (
                            <><Wand2 size={20} /> Generate Poster</>
                        )}
                    </button>
                </div>

                {/* Preview Panel */}
                <div className="generator-preview">
                    <div className="preview-container">
                        {resultUrl ? (
                            <div style={{ width: "100%" }}>
                                <img src={resultUrl} alt="Generated poster" className="preview-image" />
                                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                    <a
                                        href={resultUrl} download target="_blank" rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm" style={{ flex: 1 }}
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => { setResultUrl(null); setPrompt(""); setEnhancedPrompt(""); }}
                                        style={{ flex: 1 }}
                                    >
                                        Generate Lagi
                                    </button>
                                </div>
                            </div>
                        ) : generating ? (
                            <div className="preview-placeholder">
                                <Loader2 size={48} className="animate-pulse" style={{ margin: "0 auto 16px", color: "var(--primary-400)" }} />
                                <p style={{ fontSize: "var(--text-sm)" }}>Sedang memproses poster Anda...</p>
                                <p style={{ fontSize: "var(--text-xs)", marginTop: "8px" }}>Ini bisa memakan waktu 10-30 detik</p>
                            </div>
                        ) : (
                            <div className="preview-placeholder">
                                <ImageIcon size={64} className="preview-placeholder-icon" />
                                <p style={{ fontSize: "var(--text-sm)" }}>Hasil poster akan muncul di sini</p>
                                <p style={{ fontSize: "11px", color: "var(--surface-400)", marginTop: "8px" }}>
                                    Tanpa referensi → Text-to-Image | Dengan referensi/logo → Image Edit
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
