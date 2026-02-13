import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, currentPassword, newPassword } = await req.json();
        const updateData: Record<string, unknown> = {};

        if (name) {
            updateData.name = name;
        }

        if (currentPassword && newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: "Password baru minimal 6 karakter" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { password: true },
            });

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json(
                    { error: "Password saat ini salah" },
                    { status: 400 }
                );
            }

            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: updateData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings error:", error);
        return NextResponse.json(
            { error: "Gagal menyimpan pengaturan" },
            { status: 500 }
        );
    }
}
