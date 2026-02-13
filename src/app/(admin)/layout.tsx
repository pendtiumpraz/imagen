import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardTopbar } from "@/components/dashboard/TopBar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if ((session.user as Record<string, unknown>).role !== "ADMIN") redirect("/dashboard");

    return (
        <AuthProvider>
            <div className="dashboard-layout">
                <DashboardSidebar user={session.user as { id: string; name: string; email: string; role: string; plan: string }} />
                <div className="main-content">
                    <DashboardTopbar user={session.user as { name: string; plan: string }} />
                    <div className="page-content">{children}</div>
                </div>
            </div>
        </AuthProvider>
    );
}
