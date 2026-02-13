import { GenerationCategory } from "@prisma/client";

export interface CategoryInfo {
    id: GenerationCategory;
    name: string;
    description: string;
    icon: string;
    defaultAspectRatio: string;
    group: "dakwah" | "kegiatan" | "jualan";
    promptTemplate: string;
}

// ==================== ISLAMIC PROMPT RULES ====================
// These rules are ALWAYS appended to every generation prompt

export const ISLAMIC_PROMPT_RULES = [
    "STRICTLY follow Islamic guidelines for all imagery",
    "If any female figure appears, she MUST be shown ONLY as a silhouette wearing full cadar (niqab) and wide hijab covering entire body",
    "If any male figure appears, he should wear modest Islamic clothing (jubah, kopiah/peci)",
    "NO depiction of faces of living beings - all living creatures must have their necks cut off or shown as silhouettes only",
    "NO musical instruments, NO dogs or pigs in any imagery",
    "NO inappropriate, revealing, or un-Islamic imagery",
    "Use Islamic geometric patterns, arabesques, and calligraphy as decorative elements",
    "Maintain respectful and dignified visual representation at all times",
].join(". ");

// ==================== STYLES ====================

export interface StyleOption {
    id: string;
    name: string;
    description: string;
    promptModifier: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
    {
        id: "realistic",
        name: "Realistic",
        description: "Fotorealistik, seperti foto asli",
        promptModifier: "photorealistic, hyperrealistic, cinematic photography, 8K quality, professional photograph",
    },
    {
        id: "3d",
        name: "3D Render",
        description: "3D rendering berkualitas tinggi",
        promptModifier: "3D render, 3D illustration, Pixar-quality 3D, volumetric lighting, detailed 3D model, octane render",
    },
    {
        id: "2d",
        name: "2D Illustration",
        description: "Ilustrasi 2D modern dan clean",
        promptModifier: "2D flat illustration, modern vector art, clean illustration style, digital art, graphic design",
    },
    {
        id: "watercolor",
        name: "Watercolor",
        description: "Gaya cat air yang artistik",
        promptModifier: "watercolor painting style, soft watercolor, artistic watercolor illustration, delicate brush strokes",
    },
    {
        id: "calligraphy",
        name: "Calligraphy Art",
        description: "Seni kaligrafi Islam yang indah",
        promptModifier: "Arabic calligraphy art, Islamic calligraphy, beautiful hand-lettered, ornamental calligraphy design",
    },
    {
        id: "minimalist",
        name: "Minimalist",
        description: "Desain minimalis dan modern",
        promptModifier: "minimalist design, clean minimal layout, simple elegant, modern minimalist poster, whitespace",
    },
    {
        id: "vintage",
        name: "Vintage Islamic",
        description: "Gaya klasik Islamic vintage",
        promptModifier: "vintage Islamic art style, classical Ottoman design, traditional Islamic ornament, aged paper texture",
    },
];

// ==================== BACKGROUND OPTIONS ====================

export interface BackgroundOption {
    id: string;
    name: string;
    promptModifier: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
    { id: "mosque", name: "🕌 Masjid", promptModifier: "beautiful mosque background, Islamic architecture, dome and minarets" },
    { id: "geometric", name: "🔷 Pola Geometris Islam", promptModifier: "Islamic geometric pattern background, arabesque ornamental backdrop" },
    { id: "night_sky", name: "🌙 Langit Malam", promptModifier: "night sky with crescent moon and stars, peaceful dark sky" },
    { id: "nature", name: "🌿 Alam / Taman", promptModifier: "beautiful garden background, nature scenery, green paradise-like garden" },
    { id: "gradient", name: "🎨 Gradien Warna", promptModifier: "abstract gradient background, smooth color gradient backdrop" },
    { id: "marble", name: "🤍 Marmer / Putih", promptModifier: "white marble texture background, clean elegant light backdrop" },
    { id: "dark", name: "🖤 Gelap / Navy", promptModifier: "dark navy background, deep dark elegant backdrop" },
    { id: "gold", name: "✨ Emas / Mewah", promptModifier: "golden luxury background, gold ornamental Islamic backdrop, opulent" },
    { id: "desert", name: "🏜️ Padang Pasir", promptModifier: "beautiful desert landscape background, golden sand dunes, sunset" },
    { id: "kaaba", name: "🕋 Ka'bah / Haji", promptModifier: "Kaaba background, Makkah scenery, hajj holy land backdrop" },
    { id: "medina", name: "🌴 Madinah", promptModifier: "Masjid Nabawi Medina background, green dome, peaceful holy city" },
    { id: "school", name: "🏫 Sekolah", promptModifier: "school building background, Islamic school environment, educational setting" },
    { id: "custom", name: "✏️ Custom (tulis sendiri)", promptModifier: "" },
];

// ==================== COLOR PALETTES ====================

export interface ColorPalette {
    id: string;
    name: string;
    colors: string[];
    promptModifier: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
    { id: "emerald_gold", name: "Emerald & Gold", colors: ["#0D9F66", "#D4A853", "#054B2E"], promptModifier: "emerald green and golden color palette, luxurious Islamic colors" },
    { id: "royal_blue", name: "Royal Blue", colors: ["#1E3A8A", "#3B82F6", "#D4A853"], promptModifier: "royal blue and gold color scheme, regal Islamic palette" },
    { id: "warm_sunset", name: "Warm Sunset", colors: ["#F59E0B", "#EF4444", "#7C2D12"], promptModifier: "warm sunset orange and red tones, warm glowing colors" },
    { id: "soft_pastel", name: "Soft Pastel", colors: ["#F3E8FF", "#DBEAFE", "#FEF3C7"], promptModifier: "soft pastel colors, gentle light tones, delicate color palette" },
    { id: "dark_luxury", name: "Dark Luxury", colors: ["#0A1120", "#D4A853", "#1D2940"], promptModifier: "dark luxury palette, black and gold, premium dark theme" },
    { id: "earth_tone", name: "Earth Tone", colors: ["#92400E", "#78350F", "#854D0E"], promptModifier: "earthy brown tones, natural warm colors, organic feel" },
    { id: "white_clean", name: "Putih Bersih", colors: ["#FFFFFF", "#F1F5F9", "#E2E8F0"], promptModifier: "clean white design, minimalist white and grey palette" },
    { id: "ramadan_purple", name: "Ramadhan Purple", colors: ["#581C87", "#7C3AED", "#D4A853"], promptModifier: "purple and gold Ramadan color palette, mystical purple tones" },
    { id: "custom", name: "Custom (tulis sendiri)", colors: [], promptModifier: "" },
];

// ==================== ISLAMIC ELEMENTS ====================

export interface IslamicElement {
    id: string;
    name: string;
    promptModifier: string;
}

export const ISLAMIC_ELEMENTS: IslamicElement[] = [
    { id: "calligraphy", name: "Kaligrafi Arab", promptModifier: "Arabic calligraphy decoration, Quranic verse art" },
    { id: "crescent", name: "Bulan Sabit & Bintang", promptModifier: "crescent moon and stars, Islamic crescent symbol" },
    { id: "lantern", name: "Lentera / Fanoos", promptModifier: "Islamic lantern, Ramadan fanoos, glowing traditional lamp" },
    { id: "dates", name: "Kurma", promptModifier: "dates fruit, iftar dates, traditional Islamic food" },
    { id: "quran", name: "Al-Quran", promptModifier: "holy Quran book, open Quran with beautiful pages" },
    { id: "tasbih", name: "Tasbih", promptModifier: "prayer beads, Islamic tasbih, rosary beads" },
    { id: "dome", name: "Kubah Masjid", promptModifier: "mosque dome, Islamic architectural dome element" },
    { id: "minaret", name: "Menara Masjid", promptModifier: "mosque minaret tower, tall Islamic tower" },
    { id: "mihrab", name: "Mihrab", promptModifier: "mihrab arch, Islamic prayer niche, decorated arch" },
    { id: "arabesque", name: "Arabesque Pattern", promptModifier: "arabesque floral patterns, Islamic ornamental motifs" },
    { id: "flowers", name: "Bunga & Flora Islami", promptModifier: "Islamic floral decoration, rose and jasmine, botanical Islamic art" },
];

// ==================== CATEGORIES (EXPANDED) ====================

export const CATEGORIES: CategoryInfo[] = [
    // ---- DAKWAH ----
    {
        id: "POSTER_KAJIAN",
        name: "Poster Kajian",
        description: "Poster untuk acara kajian Islam, ustadz, dan halaqah ilmu",
        icon: "BookOpen",
        defaultAspectRatio: "3:4",
        group: "dakwah",
        promptTemplate: "Islamic study event poster, elegant Islamic geometric patterns, mosque silhouette, modern calligraphy style, professional layout",
    },
    {
        id: "POSTER_DAKWAH",
        name: "Poster Dakwah",
        description: "Poster konten dakwah Islam yang inspiratif dan memotivasi",
        icon: "Heart",
        defaultAspectRatio: "1:1",
        group: "dakwah",
        promptTemplate: "Islamic dawah poster, inspiring Islamic art, Quran verse visual, beautiful Arabic calligraphy, spiritual atmosphere",
    },
    {
        id: "THUMBNAIL_KAJIAN",
        name: "Thumbnail Kajian",
        description: "Thumbnail YouTube untuk video kajian dan ceramah Islam",
        icon: "Play",
        defaultAspectRatio: "16:9",
        group: "dakwah",
        promptTemplate: "YouTube thumbnail for Islamic lecture, professional design, bold text area, mosque background, modern Islamic design",
    },
    {
        id: "POSTER_RAMADHAN",
        name: "Poster Ramadhan",
        description: "Poster spesial bulan Ramadhan, tarawih, dan Hari Raya",
        icon: "Moon",
        defaultAspectRatio: "3:4",
        group: "dakwah",
        promptTemplate: "Ramadan poster, crescent moon, lanterns, golden light, Islamic architecture, festive atmosphere, holy month",
    },
    {
        id: "POSTER_JUMAT",
        name: "Poster Jumat",
        description: "Poster pengingat sholat Jumat dan khutbah mingguan",
        icon: "Calendar",
        defaultAspectRatio: "9:16",
        group: "dakwah",
        promptTemplate: "Friday prayer reminder poster, mosque dome, golden hour lighting, peaceful Islamic design, minimalist elegant",
    },
    {
        id: "KARTU_UCAPAN_ISLAMI",
        name: "Kartu Ucapan Islami",
        description: "Kartu ucapan Eid, Maulid, Isra Mi'raj, dan hari besar Islam",
        icon: "Gift",
        defaultAspectRatio: "1:1",
        group: "dakwah",
        promptTemplate: "Islamic greeting card, beautiful floral Islamic pattern, warm colors, festive design, elegant typography area",
    },
    {
        id: "POSTER_MAULID",
        name: "Poster Maulid Nabi",
        description: "Poster peringatan Maulid Nabi Muhammad SAW",
        icon: "Star",
        defaultAspectRatio: "3:4",
        group: "dakwah",
        promptTemplate: "Mawlid celebration poster, Prophet Muhammad birthday commemoration, green and gold Islamic design, Madinah mosque, beautiful calligraphy",
    },
    {
        id: "POSTER_ISRA_MIRAJ",
        name: "Poster Isra Mi'raj",
        description: "Poster peringatan Isra Mi'raj Nabi Muhammad SAW",
        icon: "Sparkles",
        defaultAspectRatio: "3:4",
        group: "dakwah",
        promptTemplate: "Isra Mi'raj night journey poster, Masjid Al-Aqsa, night sky with stars, Buraq silhouette, golden celestial atmosphere",
    },
    {
        id: "POSTER_TAHUN_BARU_HIJRIAH",
        name: "Poster 1 Muharram",
        description: "Poster Tahun Baru Islam / 1 Muharram",
        icon: "CalendarDays",
        defaultAspectRatio: "3:4",
        group: "dakwah",
        promptTemplate: "Islamic New Year poster, 1 Muharram, Hijri new year celebration, crescent moon, elegant Islamic calligraphy, fresh start theme",
    },

    // ---- KEGIATAN ----
    {
        id: "POSTER_KEGIATAN",
        name: "Poster Kegiatan",
        description: "Poster untuk event, seminar, dan kegiatan Islami",
        icon: "CalendarCheck",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Islamic event poster, modern seminar design, professional event announcement, mosque community gathering, elegant layout",
    },
    {
        id: "POSTER_SEKOLAH",
        name: "Poster Sekolah Islam",
        description: "Poster untuk sekolah Islam, madrasah, dan institusi pendidikan",
        icon: "GraduationCap",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Islamic school poster, education institution, madrasah design, students learning environment, academic Islamic poster",
    },
    {
        id: "POSTER_PPDB",
        name: "Poster PPDB",
        description: "Poster Penerimaan Peserta Didik Baru sekolah Islam",
        icon: "UserPlus",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "School enrollment poster, PPDB new student registration, Islamic school admission, welcoming educational design, professional academic",
    },
    {
        id: "POSTER_TAHFIDZ",
        name: "Poster Program Tahfidz",
        description: "Poster program menghafal Al-Quran dan tahfidz",
        icon: "BookMarked",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Quran tahfidz program poster, Quran memorization class, holy Quran with beautiful light, Islamic education poster, spiritual learning",
    },
    {
        id: "POSTER_PESANTREN",
        name: "Poster Pesantren",
        description: "Poster pesantren, pondok, dan boarding school Islam",
        icon: "Building2",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Islamic boarding school poster, pesantren design, traditional Islamic education, Islamic architecture campus, peaceful learning environment",
    },
    {
        id: "POSTER_DONASI",
        name: "Poster Donasi & Infaq",
        description: "Poster penggalangan donasi, infaq, sedekah, dan zakat",
        icon: "HandHeart",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Islamic charity donation poster, infaq and sadaqah, zakat campaign, helping hands silhouette, generous giving, Islamic philanthropy",
    },
    {
        id: "POSTER_UMRAH_HAJI",
        name: "Poster Umrah & Haji",
        description: "Poster paket umrah, haji, dan wisata religi",
        icon: "Plane",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Umrah and Hajj travel poster, Kaaba Makkah, pilgrimage design, holy city, Islamic travel agency poster, spiritual journey",
    },
    {
        id: "POSTER_NIKAH",
        name: "Undangan Nikah Islami",
        description: "Undangan pernikahan Islam yang elegan dan syar'i",
        icon: "HeartHandshake",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Islamic wedding invitation, elegant nikah poster, floral Islamic border, gold and green design, walimah celebration, modest and beautiful",
    },
    {
        id: "POSTER_AQIQAH",
        name: "Poster Aqiqah",
        description: "Poster undangan aqiqah dan walimah bayi",
        icon: "Baby",
        defaultAspectRatio: "1:1",
        group: "kegiatan",
        promptTemplate: "Islamic aqiqah poster, baby celebration invitation, cute Islamic design, pastel colors, newborn walimah, gentle and warm",
    },
    {
        id: "COVER_BUKU_ISLAMI",
        name: "Cover Buku Islami",
        description: "Desain cover buku, kitab, dan publikasi Islam",
        icon: "BookCopy",
        defaultAspectRatio: "3:4",
        group: "kegiatan",
        promptTemplate: "Islamic book cover design, professional book jacket, elegant Islamic typography, ornamental border, religious publication cover",
    },
    {
        id: "LOGO_ISLAMI",
        name: "Logo Islami",
        description: "Logo untuk masjid, yayasan, organisasi, dan lembaga Islam",
        icon: "Hexagon",
        defaultAspectRatio: "1:1",
        group: "kegiatan",
        promptTemplate: "Islamic logo design, mosque logo, Islamic organization emblem, clean modern Islamic symbol, professional branding, geometric Islamic motif",
    },

    // ---- JUALAN ----
    {
        id: "POSTER_PRODUK",
        name: "Poster Produk",
        description: "Poster tampilan produk yang eye-catching dan Islami",
        icon: "ShoppingBag",
        defaultAspectRatio: "1:1",
        group: "jualan",
        promptTemplate: "Product display poster, clean professional layout, modern commercial design, product spotlight, attractive visual",
    },
    {
        id: "BANNER_PROMO",
        name: "Banner Promo",
        description: "Banner promosi dan diskon yang menarik",
        icon: "Percent",
        defaultAspectRatio: "16:9",
        group: "jualan",
        promptTemplate: "Promotional banner, bold sale design, dynamic composition, attention-grabbing colors, professional commercial",
    },
    {
        id: "THUMBNAIL_MARKETPLACE",
        name: "Thumbnail Marketplace",
        description: "Thumbnail produk untuk Shopee, Tokopedia, dll",
        icon: "Store",
        defaultAspectRatio: "1:1",
        group: "jualan",
        promptTemplate: "Marketplace product thumbnail, clean white background, professional product photography style, commercial layout",
    },
    {
        id: "FEED_INSTAGRAM",
        name: "Feed Instagram",
        description: "Konten feed Instagram yang aesthetic dan Islami",
        icon: "Instagram",
        defaultAspectRatio: "1:1",
        group: "jualan",
        promptTemplate: "Instagram feed post, aesthetic social media design, trendy modern layout, eye-catching visual content",
    },
    {
        id: "STORY_INSTAGRAM",
        name: "Story Instagram",
        description: "Story Instagram & TikTok yang engaging",
        icon: "Smartphone",
        defaultAspectRatio: "9:16",
        group: "jualan",
        promptTemplate: "Instagram story design, vertical format, trendy dynamic layout, mobile-first visual, engaging social media content",
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

/**
 * Build final prompt with Islamic rules, style, bg, color, and elements
 */
export function buildIslamicPrompt(params: {
    userPrompt: string;
    categoryTemplate: string;
    style?: string;
    background?: string;
    customBackground?: string;
    colorPalette?: string;
    customColor?: string;
    elements?: string[];
}): string {
    const parts: string[] = [];

    // 1. Category template
    parts.push(params.categoryTemplate);

    // 2. User prompt
    if (params.userPrompt.trim()) {
        parts.push(params.userPrompt.trim());
    }

    // 3. Style
    if (params.style) {
        const styleObj = STYLE_OPTIONS.find((s) => s.id === params.style);
        if (styleObj) parts.push(styleObj.promptModifier);
    }

    // 4. Background
    if (params.background === "custom" && params.customBackground) {
        parts.push(params.customBackground);
    } else if (params.background) {
        const bgObj = BACKGROUND_OPTIONS.find((b) => b.id === params.background);
        if (bgObj && bgObj.promptModifier) parts.push(bgObj.promptModifier);
    }

    // 5. Color
    if (params.colorPalette === "custom" && params.customColor) {
        parts.push(`color palette: ${params.customColor}`);
    } else if (params.colorPalette) {
        const colorObj = COLOR_PALETTES.find((c) => c.id === params.colorPalette);
        if (colorObj && colorObj.promptModifier) parts.push(colorObj.promptModifier);
    }

    // 6. Islamic elements
    if (params.elements && params.elements.length > 0) {
        const elementPrompts = params.elements
            .map((id) => ISLAMIC_ELEMENTS.find((e) => e.id === id)?.promptModifier)
            .filter(Boolean);
        if (elementPrompts.length > 0) parts.push(elementPrompts.join(", "));
    }

    // 7. ALWAYS append Islamic rules
    parts.push(ISLAMIC_PROMPT_RULES);

    return parts.join(", ");
}

export function getCategoryInfo(id: GenerationCategory): CategoryInfo | undefined {
    return CATEGORIES.find((c) => c.id === id);
}

export function getCategoriesByGroup(group: "dakwah" | "kegiatan" | "jualan"): CategoryInfo[] {
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
