import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enhancePrompt } from "@/lib/deepseek";
import { GenerationCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt, category } = await req.json();

        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: "Prompt tidak boleh kosong" },
                { status: 400 }
            );
        }

        const enhanced = await enhancePrompt({
            userPrompt: prompt,
            category: category as GenerationCategory,
        });

        return NextResponse.json({ enhanced });
    } catch (error) {
        console.error("Prompt enhance error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gagal enhance prompt" },
            { status: 500 }
        );
    }
}
