import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const providers = await prisma.aIProvider.findMany({
            select: {
                id: true,
                name: true,
                apiKey: false, // Don't expose encrypted key
                baseUrl: true,
                modelId: true,
                isActive: true,
                createdAt: true,
            },
        });

        // Add a flag indicating if API key is set
        const providersWithKeyStatus = providers.map((p) => ({
            ...p,
            apiKey: "configured", // Don't send actual key
        }));

        return NextResponse.json({ providers: providersWithKeyStatus });
    } catch (error) {
        console.error("Admin providers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user as Record<string, unknown>).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, apiKey, baseUrl, modelId, isActive } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Provider name required" }, { status: 400 });
        }

        const existing = await prisma.aIProvider.findUnique({
            where: { name },
        });

        if (existing) {
            // Update
            const updateData: Record<string, unknown> = {
                baseUrl: baseUrl || existing.baseUrl,
                modelId: modelId || existing.modelId,
                isActive: isActive ?? existing.isActive,
            };

            if (apiKey) {
                updateData.apiKey = encrypt(apiKey);
            }

            await prisma.aIProvider.update({
                where: { name },
                data: updateData,
            });
        } else {
            // Create
            if (!apiKey) {
                return NextResponse.json(
                    { error: "API key required for new provider" },
                    { status: 400 }
                );
            }

            await prisma.aIProvider.create({
                data: {
                    name,
                    apiKey: encrypt(apiKey),
                    baseUrl: baseUrl || "",
                    modelId: modelId || null,
                    isActive: isActive ?? true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin providers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
