import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";
import {
    BookOpen, Heart, Play, Moon as MoonIcon, Calendar, Gift,
    ShoppingBag, Percent, Store, Instagram, Smartphone,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    BookOpen, Heart, Play, Moon: MoonIcon, Calendar, Gift,
    ShoppingBag, Percent, Store, Instagram, Smartphone,
};

export default function GeneratePage() {
    const dakwah = CATEGORIES.filter((c) => c.group === "dakwah");
    const jualan = CATEGORIES.filter((c) => c.group === "jualan");

    return (
        <>
            <div className="category-group">
                <h3 className="category-group-title">
                    <MoonIcon size={24} style={{ color: "var(--primary-400)" }} />
                    Kategori Dakwah
                </h3>
                <div className="category-grid">
                    {dakwah.map((cat) => {
                        const Icon = iconMap[cat.icon] || BookOpen;
                        return (
                            <Link
                                key={cat.id}
                                href={`/generate/${cat.id}`}
                                className="category-card"
                            >
                                <div className="category-card-icon">
                                    <Icon size={22} />
                                </div>
                                <div className="category-card-name">{cat.name}</div>
                                <div className="category-card-desc">{cat.description}</div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="category-group">
                <h3 className="category-group-title">
                    <ShoppingBag size={24} style={{ color: "var(--accent-400)" }} />
                    Kategori Jualan
                </h3>
                <div className="category-grid">
                    {jualan.map((cat) => {
                        const Icon = iconMap[cat.icon] || ShoppingBag;
                        return (
                            <Link
                                key={cat.id}
                                href={`/generate/${cat.id}`}
                                className="category-card"
                            >
                                <div className="category-card-icon" style={{ background: "rgba(212,168,83,0.12)", color: "var(--accent-400)" }}>
                                    <Icon size={22} />
                                </div>
                                <div className="category-card-name">{cat.name}</div>
                                <div className="category-card-desc">{cat.description}</div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
