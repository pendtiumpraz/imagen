import {
    BookOpen,
    Heart,
    Play,
    Moon,
    Calendar,
    Gift,
    ShoppingBag,
    Percent,
    Store,
    Instagram,
    Smartphone,
} from "lucide-react";

const dakwahFeatures = [
    {
        icon: BookOpen,
        title: "Poster Kajian",
        desc: "Buat poster acara kajian Islam yang menarik dan profesional",
    },
    {
        icon: Heart,
        title: "Poster Dakwah",
        desc: "Poster konten dakwah yang inspiratif dan menyentuh hati",
    },
    {
        icon: Play,
        title: "Thumbnail Kajian",
        desc: "Thumbnail YouTube untuk video kajian yang eye-catching",
    },
    {
        icon: Moon,
        title: "Poster Ramadhan",
        desc: "Desain spesial untuk bulan suci Ramadhan dan hari raya",
    },
    {
        icon: Calendar,
        title: "Poster Jumat",
        desc: "Pengingat sholat Jumat mingguan yang indah",
    },
    {
        icon: Gift,
        title: "Kartu Ucapan Islami",
        desc: "Kartu ucapan elegan untuk hari besar Islam",
    },
];

const jualanFeatures = [
    {
        icon: ShoppingBag,
        title: "Poster Produk",
        desc: "Tampilan produk yang eye-catching dan profesional",
    },
    {
        icon: Percent,
        title: "Banner Promo",
        desc: "Banner promosi dan diskon yang menarik perhatian",
    },
    {
        icon: Store,
        title: "Thumbnail Marketplace",
        desc: "Thumbnail produk untuk Shopee, Tokopedia, dll",
    },
    {
        icon: Instagram,
        title: "Feed Instagram",
        desc: "Konten feed Instagram yang aesthetic dan trendy",
    },
    {
        icon: Smartphone,
        title: "Story Instagram",
        desc: "Story Instagram & TikTok yang engaging",
    },
];

export function Features() {
    return (
        <section id="features" className="section">
            <div className="section-inner">
                <div className="section-header">
                    <p className="section-eyebrow">Fitur Lengkap</p>
                    <h2 className="section-title">
                        Semua yang Kamu Butuhkan untuk Konten Visual
                    </h2>
                    <p className="section-desc">
                        Dari poster dakwah hingga konten jualan — semua bisa di-generate
                        dengan AI dalam hitungan detik
                    </p>
                </div>

                <div className="category-group">
                    <h3 className="category-group-title">
                        <Moon size={24} style={{ color: "var(--primary-400)" }} />
                        Kategori Dakwah
                    </h3>
                    <div className="features-grid">
                        {dakwahFeatures.map((f) => (
                            <div key={f.title} className="feature-card">
                                <div className="feature-icon">
                                    <f.icon size={28} />
                                </div>
                                <h4 className="feature-title">{f.title}</h4>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="category-group">
                    <h3 className="category-group-title">
                        <ShoppingBag size={24} style={{ color: "var(--accent-400)" }} />
                        Kategori Jualan
                    </h3>
                    <div className="features-grid">
                        {jualanFeatures.map((f) => (
                            <div key={f.title} className="feature-card">
                                <div className="feature-icon">
                                    <f.icon size={28} />
                                </div>
                                <h4 className="feature-title">{f.title}</h4>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
