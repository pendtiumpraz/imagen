"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";

interface GalleryItem {
    id: string;
    resultImageUrl: string;
    category: string;
    prompt: string;
    createdAt: string;
}

const CATEGORY_TABS = [
    { id: "ALL", label: "Semua" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
];

const PAGE_SIZE = 12;

export function PublicGallery() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [activeTab, setActiveTab] = useState("ALL");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchGallery = useCallback(
        async (pageNum: number, category: string, replace: boolean) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(pageNum),
                    limit: String(PAGE_SIZE),
                });
                if (category !== "ALL") params.set("category", category);

                const res = await fetch(`/api/public/gallery?${params}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();

                if (replace) {
                    setItems(data.items || []);
                } else {
                    // Lazy load: replace previous pages with new page only
                    setItems(data.items || []);
                }
                setHasMore((data.items?.length || 0) >= PAGE_SIZE);
            } catch {
                // silent fail for public gallery
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        setPage(1);
        fetchGallery(1, activeTab, true);
    }, [activeTab, fetchGallery]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchGallery(nextPage, activeTab, true); // Replace with new page (hide previous)
    };

    const handlePrevPage = () => {
        if (page <= 1) return;
        const prevPage = page - 1;
        setPage(prevPage);
        fetchGallery(prevPage, activeTab, true);
    };

    const getCategoryLabel = (cat: string) => {
        const found = CATEGORIES.find((c) => c.id === cat);
        return found?.name || cat;
    };

    return (
        <section id="gallery" className="section public-gallery-section">
            <div className="section-inner">
                <div className="section-header">
                    <p className="section-eyebrow">Showcase</p>
                    <h2 className="section-title">Hasil Karya Komunitas</h2>
                    <p className="section-desc">
                        Lihat poster-poster yang telah dibuat oleh pengguna PosterDakwah
                    </p>
                </div>

                <div className="public-gallery-tabs">
                    {CATEGORY_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`public-gallery-tab ${activeTab === tab.id ? "public-gallery-tab-active" : ""
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div ref={containerRef}>
                    {initialLoading ? (
                        <div className="empty-state">
                            <Loader2
                                size={40}
                                className="animate-pulse"
                                style={{ margin: "0 auto" }}
                            />
                            <p style={{ marginTop: "16px" }}>Memuat gallery...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="empty-state">
                            <ImageIcon size={64} className="empty-state-icon" />
                            <h3 className="empty-state-title">Belum ada poster</h3>
                            <p className="empty-state-desc">
                                Poster yang di-generate akan muncul di sini
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="public-gallery-grid">
                                {items.map((item) => (
                                    <div key={item.id} className="public-gallery-card">
                                        <img
                                            src={item.resultImageUrl}
                                            alt={item.prompt}
                                            className="public-gallery-img"
                                            loading="lazy"
                                        />
                                        <div className="public-gallery-info">
                                            <span className="public-gallery-category-badge">
                                                {getCategoryLabel(item.category)}
                                            </span>
                                            <p className="public-gallery-prompt">{item.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "12px",
                                    marginTop: "32px",
                                }}
                            >
                                {page > 1 && (
                                    <button
                                        className="btn btn-ghost"
                                        onClick={handlePrevPage}
                                        disabled={loading}
                                    >
                                        ← Sebelumnya
                                    </button>
                                )}
                                <span
                                    style={{
                                        fontSize: "14px",
                                        color: "var(--surface-300)",
                                    }}
                                >
                                    Halaman {page}
                                </span>
                                {hasMore && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={16} className="animate-pulse" />
                                                Memuat...
                                            </>
                                        ) : (
                                            "Selanjutnya →"
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
