import { prisma } from "./prisma";
import { decrypt } from "./encryption";
import { getCategoryInfo } from "./utils";
import { GenerationCategory } from "@prisma/client";

async function getApiConfig(): Promise<{ apiKey: string; baseUrl: string; model: string }> {
    const provider = await prisma.aIProvider.findUnique({
        where: { name: "deepseek" },
    });
    if (!provider || !provider.isActive) {
        throw new Error("DeepSeek provider not configured or inactive");
    }
    return {
        apiKey: decrypt(provider.apiKey),
        baseUrl: provider.baseUrl || "https://api.deepseek.com/v1",
        model: provider.modelId || "deepseek-chat",
    };
}

export async function enhancePrompt(params: {
    userPrompt: string;
    category: GenerationCategory;
    language?: string;
}): Promise<string> {
    const config = await getApiConfig();
    const categoryInfo = getCategoryInfo(params.category);

    const systemPrompt = `You are an expert AI image prompt engineer specializing in creating detailed, effective prompts for AI image generation models. Your task is to enhance user prompts to produce stunning, high-quality images.

Rules:
1. Keep the enhanced prompt in English (the AI model works best with English prompts)
2. Add specific visual details: lighting, composition, style, mood, colors
3. Include quality boosters: "high quality", "professional", "detailed", "8K"
4. Add relevant style keywords based on the category
5. Keep the core intent of the user's original prompt
6. Output ONLY the enhanced prompt, nothing else
7. Maximum 200 words

Category context: ${categoryInfo?.name || params.category}
Category style hints: ${categoryInfo?.promptTemplate || "professional design"}`;

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Enhance this image generation prompt for ${categoryInfo?.name || "poster"} category:\n\n"${params.userPrompt}"`,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `DeepSeek API error (${response.status}): ${JSON.stringify(errorData)}`
        );
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim();

    if (!enhanced) {
        throw new Error("DeepSeek returned empty response");
    }

    return enhanced;
}
