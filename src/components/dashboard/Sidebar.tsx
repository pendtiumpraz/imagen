"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Moon,
    LayoutDashboard,
    Wand2,
    Images,
    CreditCard,
    Settings,
    Shield,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        plan: string;
    };
}

const navItems = [
    {
        section: "Menu",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/generate", icon: Wand2, label: "Generate Poster" },
            { href: "/gallery", icon: Images, label: "Gallery Saya" },
        ],
    },
    {
        section: "Akun",
        items: [
            { href: "/subscription", icon: CreditCard, label: "Langganan" },
            { href: "/settings", icon: Settings, label: "Pengaturan" },
        ],
    },
];

export function DashboardSidebar({ user }: SidebarProps) {
    const pathname = usePathname();

    const planLabel =
        user.plan === "PRO"
            ? "Pro"
            : user.plan === "BASIC"
                ? "Basic"
                : "Free";

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link href="/" className="logo">
                    <div className="logo-icon">
                        <Moon size={20} />
                    </div>
                    PosterDakwah
                </Link>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.section} className="sidebar-section">
                        <div className="sidebar-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${pathname === item.href ? "sidebar-link-active" : ""
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}

                {user.role === "ADMIN" && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Admin</div>
                        <Link
                            href="/admin"
                            className={`sidebar-link ${pathname.startsWith("/admin") ? "sidebar-link-active" : ""
                                }`}
                        >
                            <Shield size={18} />
                            Admin Panel
                        </Link>
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.name}</div>
                        <div className="sidebar-user-plan">Paket {planLabel}</div>
                    </div>
                </div>
                <button
                    className="sidebar-link"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{ width: "100%", marginTop: "8px", border: "none", background: "none" }}
                >
                    <LogOut size={18} />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
