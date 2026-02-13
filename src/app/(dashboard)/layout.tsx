import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <AuthProvider>
            <DashboardShell user={session.user}>
                {children}
            </DashboardShell>
        </AuthProvider>
    );
}
