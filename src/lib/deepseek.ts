import { prisma } from "./prisma";
import { decrypt } from "./encryption";
import { getCategoryInfo, STYLE_OPTIONS, BACKGROUND_OPTIONS, COLOR_PALETTES, ISLAMIC_ELEMENTS } from "./utils";
import { GenerationCategory } from "@prisma/client";

async function getApiConfig(): Promise<{ apiKey: string; baseUrl: string; model: string }> {
    const provider = await prisma.aIProvider.findUnique({
        where: { name: "deepseek" },
    });
    if (!provider || !provider.isActive) {
        throw new Error("DeepSeek provider belum dikonfigurasi atau tidak aktif. Silakan set API key di Admin > AI Provider.");
    }
    return {
        apiKey: decrypt(provider.apiKey),
        baseUrl: provider.baseUrl || "https://api.deepseek.com/v1",
        model: provider.modelId || "deepseek-chat",
    };
}

const ISLAMIC_SYSTEM_RULES = `
STRICT ISLAMIC RULES for ALL generated content:
- If any female figure appears, she MUST be shown ONLY as a dark silhouette wearing full cadar (niqab) and wide hijab that covers her entire body. No skin, hair, or facial features visible.
- If any male figure appears, he must wear modest Islamic clothing (jubah/thawb, kopiah/peci/turban).
- NO depiction of faces or full heads of ANY living creatures (humans or animals). All living beings must be shown as silhouettes or with necks cut off (no head visible).
- NO musical instruments, NO dogs, NO pigs in any imagery.
- NO inappropriate, revealing, or un-Islamic imagery.
- Use Islamic geometric patterns, arabesques, and Arabic calligraphy as decorative elements.
- Maintain respectful and dignified visual representation at all times.
- All designs should feel spiritually uplifting and appropriate for Muslim audiences.
`;

/**
 * Enhance a user prompt with Islamic-aware AI
 */
export async function enhancePrompt(params: {
    userPrompt: string;
    category: GenerationCategory;
    language?: string;
}): Promise<string> {
    const config = await getApiConfig();
    const categoryInfo = getCategoryInfo(params.category);

    const systemPrompt = `You are an expert AI image prompt engineer specializing in creating detailed, effective prompts for Islamic poster and design generation. Your task is to enhance user prompts to produce stunning, high-quality Islamic images.

Rules:
1. Keep the enhanced prompt in English (the AI model works best with English prompts)
2. Add specific visual details: lighting, composition, style, mood, colors
3. Include quality boosters: "high quality", "professional", "detailed", "8K"
4. Add relevant style keywords based on the category
5. Keep the core intent of the user's original prompt
6. Output ONLY the enhanced prompt text, nothing else
7. Maximum 200 words

${ISLAMIC_SYSTEM_RULES}

Category context: ${categoryInfo?.name || params.category}
Category style hints: ${categoryInfo?.promptTemplate || "professional Islamic design"}`;

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

/**
 * Generate a full auto-fill JSON suggestion for all form fields
 * Returns JSON with: prompt, style, background, colorPalette, elements
 */
export interface AutoFillSuggestion {
    prompt: string;
    style: string;
    background: string;
    customBackground: string;
    colorPalette: string;
    customColor: string;
    elements: string[];
}

export async function generateAutoFill(params: {
    category: GenerationCategory;
    userHint?: string;
}): Promise<AutoFillSuggestion> {
    const config = await getApiConfig();
    const categoryInfo = getCategoryInfo(params.category);

    const styleIds = STYLE_OPTIONS.map((s) => s.id).join(", ");
    const bgIds = BACKGROUND_OPTIONS.map((b) => b.id).join(", ");
    const colorIds = COLOR_PALETTES.map((c) => c.id).join(", ");
    const elementIds = ISLAMIC_ELEMENTS.map((e) => e.id).join(", ");

    const systemPrompt = `You are an expert Islamic poster designer AI. You generate creative, beautiful, and STRICTLY Islamic-compliant design suggestions for poster generation.

${ISLAMIC_SYSTEM_RULES}

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, no text before or after), with these exact keys:
{
  "prompt": "A detailed, creative English prompt for the image generation AI (max 150 words). Must follow all Islamic rules above.",
  "style": "one of: ${styleIds}",
  "background": "one of: ${bgIds}",
  "customBackground": "only fill if background is 'custom', otherwise empty string",
  "colorPalette": "one of: ${colorIds}",
  "customColor": "only fill if colorPalette is 'custom', otherwise empty string",
  "elements": ["array of element IDs from: ${elementIds} — pick 2-4 relevant ones"]
}

Category: ${categoryInfo?.name || params.category}
Category description: ${categoryInfo?.description || ""}
Category prompt hints: ${categoryInfo?.promptTemplate || "Islamic design"}

Make the suggestion creative, visually stunning, and fully compliant with Islamic art principles. The prompt should be specific and vivid. Pick styles, backgrounds, colors, and elements that best match this category.`;

    const userMessage = params.userHint
        ? `Generate a creative Islamic design suggestion for "${categoryInfo?.name}" category. User hint: "${params.userHint}"`
        : `Generate a creative Islamic design suggestion for "${categoryInfo?.name}" category. Be creative and pick a beautiful, unique concept.`;

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
                { role: "user", content: userMessage },
            ],
            temperature: 0.9,
            max_tokens: 800,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `DeepSeek API error (${response.status}): ${JSON.stringify(errorData)}`
        );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
        throw new Error("DeepSeek returned empty response");
    }

    // Parse JSON - handle potential markdown wrapping
    let jsonStr = content;
    if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
        const parsed = JSON.parse(jsonStr) as AutoFillSuggestion;

        // Validate and sanitize
        return {
            prompt: parsed.prompt || "",
            style: STYLE_OPTIONS.find((s) => s.id === parsed.style) ? parsed.style : "realistic",
            background: BACKGROUND_OPTIONS.find((b) => b.id === parsed.background) ? parsed.background : "mosque",
            customBackground: parsed.customBackground || "",
            colorPalette: COLOR_PALETTES.find((c) => c.id === parsed.colorPalette) ? parsed.colorPalette : "emerald_gold",
            customColor: parsed.customColor || "",
            elements: Array.isArray(parsed.elements)
                ? parsed.elements.filter((id) => ISLAMIC_ELEMENTS.find((e) => e.id === id))
                : ["calligraphy", "dome"],
        };
    } catch {
        // If JSON parse fails, return a sensible default
        return {
            prompt: content.slice(0, 500),
            style: "realistic",
            background: "mosque",
            customBackground: "",
            colorPalette: "emerald_gold",
            customColor: "",
            elements: ["calligraphy", "dome"],
        };
    }
}
