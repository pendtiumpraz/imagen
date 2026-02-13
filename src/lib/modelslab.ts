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

async function getApiKey(): Promise<string> {
    const provider = await prisma.aIProvider.findUnique({
        where: { name: "modelslab" },
    });
    if (!provider || !provider.isActive) {
        throw new Error("ModelsLab provider not configured or inactive");
    }
    return decrypt(provider.apiKey);
}

async function getBaseUrl(): Promise<string> {
    const provider = await prisma.aIProvider.findUnique({
        where: { name: "modelslab" },
    });
    return provider?.baseUrl || "https://modelslab.com/api/v7/images";
}

export async function generateTextToImage(params: {
    prompt: string;
    aspectRatio?: string;
    negativePrompt?: string;
}): Promise<ModelsLabResponse> {
    const apiKey = await getApiKey();
    const baseUrl = await getBaseUrl();

    const requestBody = {
        prompt: params.prompt,
        model_id: "nano-banana-pro",
        aspect_ratio: params.aspectRatio || "1:1",
        negative_prompt: params.negativePrompt || "blurry, low quality, distorted, watermark, text errors",
        key: apiKey,
        samples: 1,
        safety_checker: true,
    };

    const response = await fetch(`${baseUrl}/text-to-image`, {
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

export async function generateImageToImage(params: {
    prompt: string;
    initImages: string[];
    aspectRatio?: string;
    negativePrompt?: string;
}): Promise<ModelsLabResponse> {
    const apiKey = await getApiKey();
    const baseUrl = await getBaseUrl();

    const requestBody = {
        prompt: params.prompt,
        model_id: "nano-banana-pro",
        init_image: params.initImages,
        aspect_ratio: params.aspectRatio || "1:1",
        negative_prompt: params.negativePrompt || "blurry, low quality, distorted, watermark, text errors",
        key: apiKey,
        samples: 1,
        safety_checker: true,
    };

    const response = await fetch(`${baseUrl}/image-to-image`, {
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

export async function checkGenerationStatus(requestId: string): Promise<ModelsLabResponse> {
    const apiKey = await getApiKey();

    const response = await fetch("https://modelslab.com/api/v7/images/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey, request_id: requestId }),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch generation status: ${response.status}`);
    }

    return response.json();
}
