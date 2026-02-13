import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";
import {
    BookOpen, Heart, Play, Moon as MoonIcon, Calendar, Gift,
    ShoppingBag, Percent, Store, Instagram, Smartphone,
    Star, Sparkles, CalendarDays, CalendarCheck, GraduationCap,
    UserPlus, BookMarked, Building2, HandHeart, Plane,
    HeartHandshake, Baby, BookCopy, Hexagon,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    BookOpen, Heart, Play, Moon: MoonIcon, Calendar, Gift,
    ShoppingBag, Percent, Store, Instagram, Smartphone,
    Star, Sparkles, CalendarDays, CalendarCheck, GraduationCap,
    UserPlus, BookMarked, Building2, HandHeart, Plane,
    HeartHandshake, Baby, BookCopy, Hexagon,
};

const groups = [
    {
        key: "dakwah" as const,
        title: "Kategori Dakwah",
        subtitle: "Poster kajian, dakwah, dan hari besar Islam",
        icon: MoonIcon,
        iconColor: "var(--primary-400)",
        cardIconBg: "rgba(13,159,102,0.12)",
        cardIconColor: "var(--primary-400)",
    },
    {
        key: "kegiatan" as const,
        title: "Kategori Kegiatan",
        subtitle: "Event, sekolah, pesantren, donasi, dan lainnya",
        icon: CalendarCheck,
        iconColor: "var(--info)",
        cardIconBg: "rgba(59,130,246,0.12)",
        cardIconColor: "var(--info)",
    },
    {
        key: "jualan" as const,
        title: "Kategori Jualan & Sosmed",
        subtitle: "Produk, promo, marketplace, dan konten sosial media",
        icon: ShoppingBag,
        iconColor: "var(--accent-400)",
        cardIconBg: "rgba(212,168,83,0.12)",
        cardIconColor: "var(--accent-400)",
    },
];

export default function GeneratePage() {
    return (
        <>
            {groups.map((group) => {
                const items = CATEGORIES.filter((c) => c.group === group.key);
                const GroupIcon = group.icon;
                return (
                    <div key={group.key} className="category-group">
                        <h3 className="category-group-title">
                            <GroupIcon size={24} style={{ color: group.iconColor }} />
                            <span>
                                {group.title}
                                <span style={{
                                    display: "block", fontSize: "12px",
                                    fontWeight: 400, color: "var(--surface-300)", marginTop: "2px"
                                }}>
                                    {group.subtitle}
                                </span>
                            </span>
                        </h3>
                        <div className="category-grid">
                            {items.map((cat) => {
                                const Icon = iconMap[cat.icon] || BookOpen;
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/generate/${cat.id}`}
                                        className="category-card"
                                    >
                                        <div
                                            className="category-card-icon"
                                            style={{ background: group.cardIconBg, color: group.cardIconColor }}
                                        >
                                            <Icon size={22} />
                                        </div>
                                        <div className="category-card-name">{cat.name}</div>
                                        <div className="category-card-desc">{cat.description}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
