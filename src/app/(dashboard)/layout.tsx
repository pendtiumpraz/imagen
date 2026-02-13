import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardTopbar } from "@/components/dashboard/TopBar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <AuthProvider>
            <div className="dashboard-layout">
                <DashboardSidebar user={session.user} />
                <div className="main-content">
                    <DashboardTopbar user={session.user} />
                    <div className="page-content">{children}</div>
                </div>
            </div>
        </AuthProvider>
    );
}
