"use client";

import { useState, useEffect } from "react";
import { Key, Save, Loader2, AlertCircle, CheckCircle, Cpu, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Provider {
    id: string;
    name: string;
    apiKey: string;
    baseUrl: string;
    modelId: string | null;
    isActive: boolean;
}

const defaultProviders = [
    {
        name: "modelslab",
        label: "ModelsLab",
        desc: "Image Generation (Text-to-Image & Image Edit)",
        defaultUrl: "https://modelslab.com/api/v7/images",
        defaultModel: "nano-banana-pro",
        features: [
            "Text-to-Image (tanpa reference → nano-banana-pro)",
            "Image-to-Image Edit (dengan reference → nano-banana-pro image edit)",
            "Mendukung aspect ratio custom",
            "Safety checker bawaan",
        ],
    },
    {
        name: "deepseek",
        label: "DeepSeek",
        desc: "AI Prompt Enhancement",
        defaultUrl: "https://api.deepseek.com/v1",
        defaultModel: "deepseek-chat",
        features: [
            "Enhance prompt secara otomatis",
            "Optimasi prompt untuk Islamic poster",
            "Terjemahan prompt ke English",
        ],
    },
];

export default function AdminProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // Form state per provider
    const [formState, setFormState] = useState<
        Record<string, { apiKey: string; baseUrl: string; modelId: string; isActive: boolean }>
    >({});

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const res = await fetch("/api/admin/providers");
            const data = await res.json();
            setProviders(data.providers || []);

            // Initialize form state
            const state: typeof formState = {};
            defaultProviders.forEach((dp) => {
                const existing = (data.providers || []).find(
                    (p: Provider) => p.name === dp.name
                );
                state[dp.name] = {
                    apiKey: existing ? "••••••••" : "",
                    baseUrl: existing?.baseUrl || dp.defaultUrl,
                    modelId: existing?.modelId || dp.defaultModel,
                    isActive: existing?.isActive ?? true,
                };
            });
            setFormState(state);
        } catch {
            toast.error("Gagal memuat providers");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (providerName: string) => {
        const form = formState[providerName];
        if (!form) return;

        if (!form.apiKey || form.apiKey === "••••••••") {
            const existing = providers.find((p) => p.name === providerName);
            if (!existing) {
                toast.error("Masukkan API key");
                return;
            }
        }

        setSaving(providerName);
        try {
            const body: Record<string, unknown> = {
                name: providerName,
                baseUrl: form.baseUrl,
                modelId: form.modelId,
                isActive: form.isActive,
            };

            // Only send API key if changed
            if (form.apiKey && form.apiKey !== "••••••••") {
                body.apiKey = form.apiKey;
            }

            const res = await fetch("/api/admin/providers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`${providerName} berhasil disimpan`);
            fetchProviders();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
        } finally {
            setSaving(null);
        }
    };

    const updateForm = (name: string, field: string, value: string | boolean) => {
        setFormState((prev) => ({
            ...prev,
            [name]: { ...prev[name], [field]: value },
        }));
    };

    if (loading) {
        return (
            <div className="empty-state">
                <Loader2 size={40} className="animate-pulse" style={{ margin: "0 auto" }} />
            </div>
        );
    }

    const activeModels = defaultProviders.filter((dp) => {
        const existing = providers.find((p) => p.name === dp.name);
        return existing?.isActive;
    });

    return (
        <>
            {/* Active AI Models Overview */}
            <div className="card" style={{ marginBottom: "24px", border: "1px solid var(--primary-600)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div
                        className="category-card-icon"
                        style={{ background: "rgba(13,159,102,0.12)", color: "var(--primary-400)" }}
                    >
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>
                            AI Models Aktif
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--surface-300)" }}>
                            {activeModels.length} provider aktif dari {defaultProviders.length} total
                        </p>
                    </div>
                </div>

                {activeModels.length === 0 ? (
                    <div style={{
                        padding: "16px", background: "rgba(239,68,68,0.08)",
                        borderRadius: "10px", fontSize: "var(--text-sm)", color: "#F87171"
                    }}>
                        <AlertCircle size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
                        Belum ada AI provider yang aktif. Konfigurasi minimal 1 provider di bawah.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {activeModels.map((dp) => {
                            const form = formState[dp.name];
                            return (
                                <div
                                    key={dp.name}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        padding: "12px 16px", background: "rgba(13,159,102,0.06)",
                                        borderRadius: "10px", border: "1px solid rgba(13,159,102,0.15)"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <Sparkles size={16} style={{ color: "var(--primary-400)" }} />
                                        <div>
                                            <span style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
                                                {dp.label}
                                            </span>
                                            <span style={{
                                                fontSize: "11px", color: "var(--surface-300)",
                                                marginLeft: "8px"
                                            }}>
                                                {dp.desc}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="badge badge-primary">
                                        {form?.modelId || dp.defaultModel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{
                    marginTop: "12px", padding: "10px 14px",
                    background: "rgba(59,130,246,0.08)", borderRadius: "8px",
                    fontSize: "12px", color: "var(--surface-300)", lineHeight: "1.6"
                }}>
                    <strong style={{ color: "var(--info)" }}>💡 Cara kerja:</strong>{" "}
                    Tanpa image reference → <strong>Text-to-Image</strong> (nano-banana-pro).
                    Dengan image reference → <strong>Image Edit</strong> (nano-banana-pro image-to-image).
                    Prompt dienhance otomatis via <strong>DeepSeek AI</strong>.
                </div>
            </div>

            {/* Provider Configuration */}
            <p style={{ color: "var(--surface-300)", fontSize: "var(--text-sm)", marginBottom: "24px" }}>
                Kelola API key dan konfigurasi untuk AI providers. API key akan dienkripsi sebelum disimpan.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {defaultProviders.map((dp) => {
                    const form = formState[dp.name];
                    const existing = providers.find((p) => p.name === dp.name);
                    if (!form) return null;

                    return (
                        <div key={dp.name} className="card">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div
                                        className="category-card-icon"
                                        style={{
                                            background: form.isActive
                                                ? "rgba(13,159,102,0.12)"
                                                : "rgba(239,68,68,0.12)",
                                            color: form.isActive
                                                ? "var(--primary-400)"
                                                : "var(--error)",
                                        }}
                                    >
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>
                                            {dp.label}
                                        </h3>
                                        <p style={{ fontSize: "12px", color: "var(--surface-300)" }}>
                                            {existing ? (
                                                <span style={{ color: "var(--success)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <CheckCircle size={12} /> Terkonfigurasi
                                                </span>
                                            ) : (
                                                <span style={{ color: "var(--warning)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <AlertCircle size={12} /> Belum dikonfigurasi
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => updateForm(dp.name, "isActive", e.target.checked)}
                                        style={{ width: "18px", height: "18px", accentColor: "var(--primary-500)" }}
                                    />
                                    <span style={{ fontSize: "13px" }}>Aktif</span>
                                </label>
                            </div>

                            {/* Features list */}
                            <div style={{
                                display: "flex", flexWrap: "wrap", gap: "6px",
                                marginBottom: "16px"
                            }}>
                                {dp.features.map((f, i) => (
                                    <span key={i} className="badge badge-info" style={{ fontSize: "11px" }}>
                                        {f}
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div className="input-group">
                                    <label className="input-label">API Key</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={form.apiKey}
                                        onChange={(e) => updateForm(dp.name, "apiKey", e.target.value)}
                                        placeholder="Masukkan API key..."
                                        onFocus={() => {
                                            if (form.apiKey === "••••••••") {
                                                updateForm(dp.name, "apiKey", "");
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div className="input-group">
                                        <label className="input-label">Base URL</label>
                                        <input
                                            className="input"
                                            value={form.baseUrl}
                                            onChange={(e) => updateForm(dp.name, "baseUrl", e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Model ID</label>
                                        <input
                                            className="input"
                                            value={form.modelId}
                                            onChange={(e) => updateForm(dp.name, "modelId", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ marginTop: "16px" }}
                                onClick={() => handleSave(dp.name)}
                                disabled={saving === dp.name}
                            >
                                {saving === dp.name ? (
                                    <>
                                        <Loader2 size={16} className="animate-pulse" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
