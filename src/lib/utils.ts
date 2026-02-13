import { GenerationCategory } from "@prisma/client";

export interface CategoryInfo {
    id: GenerationCategory;
    name: string;
    description: string;
    icon: string;
    defaultAspectRatio: string;
    group: "dakwah" | "jualan";
    promptTemplate: string;
}

export const CATEGORIES: CategoryInfo[] = [
    // Dakwah
    {
        id: "POSTER_KAJIAN",
        name: "Poster Kajian",
        description: "Buat poster untuk acara kajian Islam yang menarik",
        icon: "BookOpen",
        defaultAspectRatio: "3:4",
        group: "dakwah",
        promptTemplate:
            "Islamic study event poster, elegant Islamic geometric patterns, mosque silhouette, modern calligraphy style, professional layout",
    },
    {
        id: "POSTER_DAKWAH",
        name: "Poster Dakwah",
        description: "Poster konten dakwah Islam yang inspiratif",
        icon: "Heart",
        defaultAspectRatio: "1:1",
        group: "dakwah",
        promptTemplate:
            "Islamic dawah poster, inspiring Islamic art, Quran verse visual, beautiful Arabic calligraphy, spiritual atmosphere",
    },
    {
        id: "THUMBNAIL_KAJIAN",
        name: "Thumbnail Kajian",
        description: "Thumbnail YouTube untuk video kajian Islam",
        icon: "Play",
        defaultAspectRatio: "16:9",
        group: "dakwah",
        promptTemplate:
            "YouTube thumbnail for Islamic lecture, professional design, bold text area, mosque background, modern Islamic design",
    },
    {
        id: "POSTER_RAMADHAN",
        name: "Poster Ramadhan",
        description: "Poster spesial bulan Ramadhan dan Hari Raya",
        icon: "Moon",
        defaultAspectRatio: "3:4",
        group: "dakwah",
        promptTemplate:
            "Ramadan poster, crescent moon, lanterns, golden light, Islamic architecture, festive atmosphere, holy month",
    },
    {
        id: "POSTER_JUMAT",
        name: "Poster Jumat",
        description: "Poster pengingat sholat Jumat mingguan",
        icon: "Calendar",
        defaultAspectRatio: "9:16",
        group: "dakwah",
        promptTemplate:
            "Friday prayer reminder poster, mosque dome, golden hour lighting, peaceful Islamic design, minimalist elegant",
    },
    {
        id: "KARTU_UCAPAN_ISLAMI",
        name: "Kartu Ucapan Islami",
        description: "Kartu ucapan untuk hari besar Islam",
        icon: "Gift",
        defaultAspectRatio: "1:1",
        group: "dakwah",
        promptTemplate:
            "Islamic greeting card, beautiful floral Islamic pattern, warm colors, festive design, elegant typography area",
    },
    // Jualan
    {
        id: "POSTER_PRODUK",
        name: "Poster Produk",
        description: "Poster tampilan produk yang eye-catching",
        icon: "ShoppingBag",
        defaultAspectRatio: "1:1",
        group: "jualan",
        promptTemplate:
            "Product display poster, clean professional layout, modern commercial design, product spotlight, attractive visual",
    },
    {
        id: "BANNER_PROMO",
        name: "Banner Promo",
        description: "Banner promosi dan diskon yang menarik",
        icon: "Percent",
        defaultAspectRatio: "16:9",
        group: "jualan",
        promptTemplate:
            "Promotional banner, bold sale design, dynamic composition, attention-grabbing colors, professional commercial",
    },
    {
        id: "THUMBNAIL_MARKETPLACE",
        name: "Thumbnail Marketplace",
        description: "Thumbnail produk untuk marketplace online",
        icon: "Store",
        defaultAspectRatio: "1:1",
        group: "jualan",
        promptTemplate:
            "Marketplace product thumbnail, clean white background, professional product photography style, commercial layout",
    },
    {
        id: "FEED_INSTAGRAM",
        name: "Feed Instagram",
        description: "Konten feed Instagram yang aesthetic",
        icon: "Instagram",
        defaultAspectRatio: "1:1",
        group: "jualan",
        promptTemplate:
            "Instagram feed post, aesthetic social media design, trendy modern layout, eye-catching visual content",
    },
    {
        id: "STORY_INSTAGRAM",
        name: "Story Instagram",
        description: "Story Instagram & TikTok yang engaging",
        icon: "Smartphone",
        defaultAspectRatio: "9:16",
        group: "jualan",
        promptTemplate:
            "Instagram story design, vertical format, trendy dynamic layout, mobile-first visual, engaging social media content",
    },
];

export const ASPECT_RATIOS = [
    { value: "1:1", label: "1:1 Square", width: 1024, height: 1024 },
    { value: "3:4", label: "3:4 Portrait", width: 768, height: 1024 },
    { value: "4:3", label: "4:3 Landscape", width: 1024, height: 768 },
    { value: "16:9", label: "16:9 Wide", width: 1024, height: 576 },
    { value: "9:16", label: "9:16 Tall", width: 576, height: 1024 },
];

export const PLAN_LIMITS: Record<string, { daily: number; price: number; name: string; features: string[] }> = {
    FREE: {
        daily: 10,
        price: 0,
        name: "Gratis",
        features: [
            "10 generasi per hari",
            "Semua kategori poster",
            "AI prompt enhancement",
            "Download hasil",
        ],
    },
    BASIC: {
        daily: 50,
        price: 49000,
        name: "Basic",
        features: [
            "50 generasi per hari",
            "Semua kategori poster",
            "AI prompt enhancement",
            "Download hasil",
            "Prioritas antrian",
            "Tanpa watermark",
        ],
    },
    PRO: {
        daily: 200,
        price: 100000,
        name: "Pro",
        features: [
            "200 generasi per hari",
            "Semua kategori poster",
            "AI prompt enhancement",
            "Download hasil",
            "Prioritas antrian",
            "Tanpa watermark",
            "Output HD",
            "Support prioritas",
        ],
    },
};

export function getCategoryInfo(id: GenerationCategory): CategoryInfo | undefined {
    return CATEGORIES.find((c) => c.id === id);
}

export function getCategoriesByGroup(group: "dakwah" | "jualan"): CategoryInfo[] {
    return CATEGORIES.filter((c) => c.group === group);
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

export function getEffectiveQuota(user: { dailyQuota: number; customQuota: number | null; isBanned: boolean }): number {
    if (user.isBanned) return 0;
    return user.customQuota ?? user.dailyQuota;
}
