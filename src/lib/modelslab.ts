import { prisma } from "./prisma";
import { decrypt } from "./encryption";

interface ModelsLabResponse {
    status: string;
    generationTime?: number;
    id?: number;
    output?: string[];
    proxy_links?: string[];
    meta?: Record<string, unknown>;
    message?: string;
    future_links?: string[];
    eta?: number;
}

interface ProviderConfig {
    apiKey: string;
    baseUrl: string;
    modelId: string | null;
}

async function getProviderConfig(): Promise<ProviderConfig> {
    const provider = await prisma.aIProvider.findUnique({
        where: { name: "modelslab" },
    });
    if (!provider || !provider.isActive) {
        throw new Error("ModelsLab provider belum dikonfigurasi atau tidak aktif. Silakan set API key di Admin > AI Provider.");
    }
    return {
        apiKey: decrypt(provider.apiKey),
        baseUrl: provider.baseUrl || "https://modelslab.com/api/v7/images",
        modelId: provider.modelId || "nano-banana-pro",
    };
}

/**
 * Text to Image — tanpa reference image
 * Menggunakan model nano-banana-pro via text-to-image endpoint
 */
export async function generateTextToImage(params: {
    prompt: string;
    aspectRatio?: string;
    negativePrompt?: string;
}): Promise<ModelsLabResponse> {
    const config = await getProviderConfig();

    const requestBody = {
        prompt: params.prompt,
        model_id: config.modelId || "nano-banana-pro",
        aspect_ratio: params.aspectRatio || "1:1",
        negative_prompt: params.negativePrompt || "blurry, low quality, distorted, watermark, text errors",
        key: config.apiKey,
        samples: 1,
        safety_checker: true,
    };

    const response = await fetch(`${config.baseUrl}/text-to-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `ModelsLab API error (${response.status}): ${JSON.stringify(errorData)}`
        );
    }

    return response.json();
}

/**
 * Image to Image — dengan reference image
 * Menggunakan model nano-banana-pro via image-to-image endpoint (image edit)
 */
export async function generateImageToImage(params: {
    prompt: string;
    initImages: string[];
    aspectRatio?: string;
    negativePrompt?: string;
}): Promise<ModelsLabResponse> {
    const config = await getProviderConfig();

    const requestBody = {
        prompt: params.prompt,
        model_id: config.modelId || "nano-banana-pro",
        init_image: params.initImages[0], // primary reference image
        aspect_ratio: params.aspectRatio || "1:1",
        negative_prompt: params.negativePrompt || "blurry, low quality, distorted, watermark, text errors",
        key: config.apiKey,
        samples: 1,
        safety_checker: true,
    };

    const response = await fetch(`${config.baseUrl}/image-to-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `ModelsLab API error (${response.status}): ${JSON.stringify(errorData)}`
        );
    }

    return response.json();
}

/**
 * Cek status generasi (untuk polling jika status=processing)
 */
export async function checkGenerationStatus(requestId: string): Promise<ModelsLabResponse> {
    const config = await getProviderConfig();

    const response = await fetch(`${config.baseUrl}/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: config.apiKey, request_id: requestId }),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch generation status: ${response.status}`);
    }

    return response.json();
}
