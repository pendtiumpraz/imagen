import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { name, email, phone, password } = await req.json();

        if (!name || !email || !phone || !password) {
            return NextResponse.json(
                { error: "Nama, email, nomor HP, dan password wajib diisi" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password minimal 6 karakter" },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Format email tidak valid" },
                { status: 400 }
            );
        }

        // Validate phone number (Indonesian format)
        const phoneClean = phone.replace(/[\s\-\(\)]/g, "");
        if (!/^(\+62|62|08)[0-9]{8,13}$/.test(phoneClean)) {
            return NextResponse.json(
                { error: "Nomor HP tidak valid. Gunakan format 08xx atau +62xx" },
                { status: 400 }
            );
        }

        const existing = await prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Email sudah terdaftar" },
                { status: 409 }
            );
        }

        // Check duplicate phone
        const existingPhone = await prisma.user.findFirst({
            where: { phone: phoneClean },
        });

        if (existingPhone) {
            return NextResponse.json(
                { error: "Nomor HP sudah digunakan akun lain" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone: phoneClean,
                password: hashedPassword,
                role: "USER",
                plan: "FREE",
                monthlyQuota: 2,
                lifetimeQuota: 2,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                plan: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            { message: "Registrasi berhasil!", user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
