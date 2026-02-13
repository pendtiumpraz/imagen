"use client";

import { useState } from "react";
import { DashboardSidebar } from "./Sidebar";
import { DashboardTopbar } from "./TopBar";

interface DashboardShellProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        plan: string;
    };
    children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <DashboardSidebar
                user={user}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="main-content">
                <DashboardTopbar
                    user={user}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />
                <div className="page-content">{children}</div>
            </div>
        </div>
    );
}
