"use client";

import { useState, useEffect, useCallback } from "react";
import { Images, Trash2, Download, Loader2, ExternalLink } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";

interface GalleryItem {
    id: string;
    category: string;
    status: string;
    prompt: string;
    resultImageUrl: string | null;
    aspectRatio: string;
    isPublic: boolean;
    createdAt: string;
}

export default function GalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("ALL");
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    const fetchGallery = useCallback(async (p: number, cat: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p), limit: "20" });
            if (cat !== "ALL") params.set("category", cat);

            const res = await fetch(`/api/gallery?${params}`);
            const data = await res.json();
            setItems(data.items || []);
            setTotalPages(data.totalPages || 1);
        } catch {
            toast.error("Gagal memuat gallery");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGallery(page, filter);
    }, [page, filter, fetchGallery]);

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus poster ini?")) return;
        try {
            const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Poster dihapus");
            setItems(items.filter((i) => i.id !== id));
            setSelectedItem(null);
        } catch {
            toast.error("Gagal menghapus");
        }
    };

    const getCategoryLabel = (cat: string) => {
        return CATEGORIES.find((c) => c.id === cat)?.name || cat.replace(/_/g, " ");
    };

    return (
        <>
            {/* Filters */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                <button
                    className={`public-gallery-tab ${filter === "ALL" ? "public-gallery-tab-active" : ""}`}
                    onClick={() => { setFilter("ALL"); setPage(1); }}
                >
                    Semua
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`public-gallery-tab ${filter === cat.id ? "public-gallery-tab-active" : ""}`}
                        onClick={() => { setFilter(cat.id); setPage(1); }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="empty-state">
                    <Loader2 size={40} className="animate-pulse" style={{ margin: "0 auto" }} />
                    <p style={{ marginTop: "16px" }}>Memuat gallery...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <Images size={64} className="empty-state-icon" />
                    <h3 className="empty-state-title">Belum ada poster</h3>
                    <p className="empty-state-desc">
                        Poster yang Anda generate akan muncul di sini
                    </p>
                </div>
            ) : (
                <>
                    <div className="gallery-grid">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="gallery-card"
                                onClick={() => setSelectedItem(item)}
                            >
                                {item.resultImageUrl ? (
                                    <img
                                        src={item.resultImageUrl}
                                        alt={item.prompt}
                                        className="gallery-card-image"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div
                                        style={{
                                            aspectRatio: "1",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "var(--dark-600)",
                                        }}
                                    >
                                        {item.status === "PROCESSING" ? (
                                            <Loader2 size={24} className="animate-pulse" style={{ color: "var(--primary-400)" }} />
                                        ) : (
                                            <Images size={24} style={{ color: "var(--dark-400)" }} />
                                        )}
                                    </div>
                                )}
                                <div className="gallery-card-info">
                                    <div className="gallery-card-category">
                                        {getCategoryLabel(item.category)}
                                    </div>
                                    <div className="gallery-card-date">
                                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "32px" }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                ← Sebelumnya
                            </button>
                            <span style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "var(--surface-300)" }}>
                                Halaman {page} dari {totalPages}
                            </span>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                Selanjutnya →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Image Modal */}
            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "700px" }}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {getCategoryLabel(selectedItem.category)}
                            </h3>
                            <button
                                className="btn btn-ghost btn-icon"
                                onClick={() => setSelectedItem(null)}
                            >
                                ✕
                            </button>
                        </div>

                        {selectedItem.resultImageUrl && (
                            <img
                                src={selectedItem.resultImageUrl}
                                alt={selectedItem.prompt}
                                style={{ width: "100%", borderRadius: "12px", marginBottom: "16px" }}
                            />
                        )}

                        <p style={{ fontSize: "13px", color: "var(--surface-300)", lineHeight: 1.6, marginBottom: "16px" }}>
                            {selectedItem.prompt}
                        </p>

                        <div style={{ fontSize: "12px", color: "var(--dark-400)", marginBottom: "16px" }}>
                            {new Date(selectedItem.createdAt).toLocaleString("id-ID")} • {selectedItem.aspectRatio} • {selectedItem.isPublic ? "Publik" : "Privat"}
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            {selectedItem.resultImageUrl && (
                                <>
                                    <a
                                        href={selectedItem.resultImageUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm"
                                    >
                                        <Download size={14} />
                                        Download
                                    </a>
                                    <a
                                        href={selectedItem.resultImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-ghost btn-sm"
                                    >
                                        <ExternalLink size={14} />
                                        Buka
                                    </a>
                                </>
                            )}
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(selectedItem.id)}
                            >
                                <Trash2 size={14} />
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
