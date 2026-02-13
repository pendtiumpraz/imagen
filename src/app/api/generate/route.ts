import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkQuota, incrementUsage } from "@/lib/quota";
import { generateTextToImage, generateImageToImage } from "@/lib/modelslab";
import { GenerationCategory } from "@prisma/client";
import { buildIslamicPrompt, getCategoryInfo } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Check quota
        const quota = await checkQuota(userId);
        if (quota.isBanned) {
            return NextResponse.json(
                { error: `Akun diblokir: ${quota.banReason || "Hubungi admin"}` },
                { status: 403 }
            );
        }
        if (!quota.allowed) {
            return NextResponse.json(
                { error: `Kuota harian habis (${quota.limit}/hari). Upgrade paket untuk lebih banyak.` },
                { status: 429 }
            );
        }

        const {
            prompt,
            category,
            aspectRatio,
            referenceImages,
            isPublic,
            style,
            background,
            customBackground,
            colorPalette,
            customColor,
            elements,
        } = await req.json();

        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: "Prompt tidak boleh kosong" },
                { status: 400 }
            );
        }

        // Build the full Islamic-compliant prompt
        const categoryInfo = getCategoryInfo(category as GenerationCategory);
        const fullPrompt = buildIslamicPrompt({
            userPrompt: prompt,
            categoryTemplate: categoryInfo?.promptTemplate || "",
            style,
            background,
            customBackground,
            colorPalette,
            customColor,
            elements,
        });

        // Create generation record
        const generation = await prisma.generation.create({
            data: {
                userId,
                category: category as GenerationCategory,
                status: "PROCESSING",
                prompt: fullPrompt,
                aspectRatio: aspectRatio || "1:1",
                referenceImages: referenceImages || [],
                isPublic: isPublic ?? true,
            },
        });

        try {
            // Call ModelsLab API
            // With reference → image-to-image (nano-banana-pro image edit)
            // Without reference → text-to-image (nano-banana-pro)
            let result;
            if (referenceImages && referenceImages.length > 0) {
                result = await generateImageToImage({
                    prompt: fullPrompt,
                    initImages: referenceImages,
                    aspectRatio: aspectRatio || "1:1",
                });
            } else {
                result = await generateTextToImage({
                    prompt: fullPrompt,
                    aspectRatio: aspectRatio || "1:1",
                });
            }

            // Get image URL from result
            let imageUrl: string | null = null;
            if (result.output && result.output.length > 0) {
                imageUrl = result.output[0];
            } else if (result.proxy_links && result.proxy_links.length > 0) {
                imageUrl = result.proxy_links[0];
            } else if (result.future_links && result.future_links.length > 0) {
                imageUrl = result.future_links[0];
            }

            if (imageUrl) {
                // Update generation record with result
                await prisma.generation.update({
                    where: { id: generation.id },
                    data: {
                        status: "COMPLETED",
                        resultImageUrl: imageUrl,
                        resultMetadata: result as object,
                    },
                });

                // Increment usage
                await incrementUsage(userId);

                return NextResponse.json({
                    id: generation.id,
                    status: "completed",
                    resultImageUrl: imageUrl,
                });
            } else if (result.status === "processing" && result.eta) {
                // Still processing
                await prisma.generation.update({
                    where: { id: generation.id },
                    data: {
                        status: "PROCESSING",
                        resultMetadata: result as object,
                    },
                });

                // Still increment usage since it was queued
                await incrementUsage(userId);

                return NextResponse.json({
                    id: generation.id,
                    status: "processing",
                    eta: result.eta,
                    message: "Gambar sedang diproses",
                });
            } else {
                throw new Error(result.message || "Unexpected API response");
            }
        } catch (apiError) {
            // Update generation as failed
            await prisma.generation.update({
                where: { id: generation.id },
                data: {
                    status: "FAILED",
                    errorMessage:
                        apiError instanceof Error ? apiError.message : "Unknown error",
                },
            });

            throw apiError;
        }
    } catch (error) {
        console.error("Generate error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Gagal generate gambar",
            },
            { status: 500 }
        );
    }
}
