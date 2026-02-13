"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

interface TopbarProps {
    user: {
        name: string;
        plan: string;
    };
    onToggleSidebar?: () => void;
}

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/generate": "Generate Poster",
    "/gallery": "Gallery Saya",
    "/subscription": "Langganan",
    "/settings": "Pengaturan",
    "/admin": "Admin Panel",
    "/admin/users": "Manajemen User",
    "/admin/providers": "AI Provider",
    "/admin/settings": "Pengaturan Sistem",
    "/admin/payments": "Pembayaran",
    "/payment": "Konfirmasi Pembayaran",
    "/revise": "Revisi Poster",
};

export function DashboardTopbar({ user, onToggleSidebar }: TopbarProps) {
    const pathname = usePathname();
    const title =
        pageTitles[pathname] ||
        (pathname.startsWith("/generate/") ? "Generate Poster" : "PosterDakwah");

    return (
        <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                    className="mobile-menu-btn btn-icon btn-ghost"
                    onClick={onToggleSidebar}
                    aria-label="Toggle menu"
                >
                    <Menu size={20} />
                </button>
                <h1 className="topbar-title">{title}</h1>
            </div>
            <div className="topbar-actions">
                <span className="badge badge-primary">{user.plan}</span>
            </div>
        </header>
    );
}
