import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Analyze transfer proof using AI (DeepSeek Vision / compatible model)
 * Returns: { valid: boolean, confidence: string, reason: string, detectedAmount?: number }
 */
async function analyzeTransferProof(params: {
    proofImageUrl: string;
    expectedAmount: number;
    senderName: string;
    recipientAccount: string;
    recipientName: string;
}): Promise<{
    valid: boolean;
    confidence: string;
    reason: string;
    detectedAmount?: number;
}> {
    try {
        // Get DeepSeek config
        const provider = await prisma.aIProvider.findFirst({
            where: { name: "deepseek", isActive: true },
        });

        if (!provider) {
            return { valid: false, confidence: "none", reason: "AI provider tidak tersedia. Menunggu verifikasi admin." };
        }

        // Decrypt API key
        const { decrypt } = await import("@/lib/encryption");
        const apiKey = decrypt(provider.apiKey);

        const systemPrompt = `Kamu adalah sistem verifikasi pembayaran otomatis. Analisis gambar bukti transfer bank berikut.

TUGAS:
1. Periksa apakah ini benar-benar screenshot/foto bukti transfer bank yang valid
2. Identifikasi nominal transfer
3. Periksa apakah nama penerima dan/atau nomor rekening sesuai
4. Berikan keputusan: VALID atau INVALID

INFO YANG DIHARAPKAN:
- Nominal: Rp ${params.expectedAmount.toLocaleString("id-ID")}
- Rekening tujuan: ${params.recipientAccount}
- Nama penerima: ${params.recipientName}
- Nama pengirim mengklaim: ${params.senderName}

RESPON dalam JSON format:
{
  "valid": true/false,
  "confidence": "high" | "medium" | "low",
  "reason": "penjelasan singkat dalam bahasa Indonesia",
  "detectedAmount": angka nominal yang terdeteksi (0 jika tidak terbaca)
}

RULES:
- Jika gambar bukan bukti transfer → INVALID
- Jika nominal tidak sesuai (toleransi ±5000) → INVALID tapi jelaskan
- Jika nama/rekening penerima tidak cocok → INVALID
- Jika bukti terlihat diedit/palsu → INVALID
- Jika tidak bisa membaca jelas → confidence "low"
- HANYA respon dengan JSON, tanpa markdown atau teks lain`;

        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: (provider.config as Record<string, string>)?.model || provider.modelId || "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: { url: params.proofImageUrl },
                            },
                            {
                                type: "text",
                                text: `Tolong analisis bukti transfer ini. Apakah valid untuk pembayaran Rp ${params.expectedAmount.toLocaleString("id-ID")} ke rekening ${params.recipientAccount} a.n. ${params.recipientName}?`,
                            },
                        ],
                    },
                ],
                temperature: 0.1,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            console.error("AI verification API error:", response.status);
            return { valid: false, confidence: "none", reason: "AI tidak dapat memproses gambar. Menunggu verifikasi admin." };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";

        // Parse JSON response
        let jsonStr = content.trim();
        if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        try {
            const result = JSON.parse(jsonStr);
            return {
                valid: !!result.valid,
                confidence: result.confidence || "low",
                reason: result.reason || "Tidak ada penjelasan",
                detectedAmount: result.detectedAmount || 0,
            };
        } catch {
            return { valid: false, confidence: "low", reason: `AI response tidak dapat diparse. Menunggu verifikasi admin. Raw: ${content.slice(0, 100)}` };
        }
    } catch (error) {
        console.error("AI verification error:", error);
        return { valid: false, confidence: "none", reason: "Error saat verifikasi AI. Menunggu verifikasi admin." };
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan, amount, proofImageUrl, senderName, senderBank, transferDate, notes } = await req.json();

        if (!plan || !proofImageUrl || !senderName) {
            return NextResponse.json(
                { error: "Plan, bukti transfer, dan nama pengirim wajib diisi" },
                { status: 400 }
            );
        }

        if (!["BASIC", "PRO"].includes(plan)) {
            return NextResponse.json(
                { error: "Plan tidak valid" },
                { status: 400 }
            );
        }

        // Check for existing pending payment
        const existingPending = await prisma.paymentConfirmation.findFirst({
            where: {
                userId: session.user.id,
                status: "PENDING",
            },
        });

        if (existingPending) {
            return NextResponse.json(
                { error: "Anda masih memiliki pembayaran yang sedang diproses. Silakan tunggu verifikasi admin." },
                { status: 400 }
            );
        }

        // Run AI verification on the proof image
        const aiResult = await analyzeTransferProof({
            proofImageUrl,
            expectedAmount: amount || (plan === "PRO" ? 99000 : 49000),
            senderName,
            recipientAccount: "1710010533530",
            recipientName: "Galih Prasetyo",
        });

        let paymentStatus: "PENDING" | "APPROVED" | "REJECTED" = "PENDING";
        let adminNotes = `AI Verification: [${aiResult.confidence}] ${aiResult.reason}`;

        if (aiResult.detectedAmount) {
            adminNotes += ` | Nominal terdeteksi: Rp ${aiResult.detectedAmount.toLocaleString("id-ID")}`;
        }

        // Auto-approve if AI says valid with high confidence
        if (aiResult.valid && aiResult.confidence === "high") {
            paymentStatus = "APPROVED";
            adminNotes += " | AUTO-APPROVED by AI";
        }
        // Auto-reject if clearly invalid
        else if (!aiResult.valid && aiResult.confidence === "high") {
            paymentStatus = "REJECTED";
            adminNotes += " | AUTO-REJECTED by AI";
        }
        // Otherwise keep PENDING for admin review

        const payment = await prisma.paymentConfirmation.create({
            data: {
                userId: session.user.id,
                plan,
                amount: amount || 0,
                proofImageUrl,
                senderName,
                senderBank: senderBank || null,
                transferDate: transferDate || null,
                notes: notes || null,
                status: paymentStatus,
                adminNotes,
                reviewedAt: paymentStatus !== "PENDING" ? new Date() : null,
                reviewedBy: paymentStatus !== "PENDING" ? "AI_SYSTEM" : null,
            },
        });

        // If auto-approved, upgrade user immediately
        if (paymentStatus === "APPROVED") {
            const quotaMap: Record<string, number> = { BASIC: 150, PRO: 500 };
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    plan: plan as "BASIC" | "PRO",
                    monthlyQuota: quotaMap[plan] || 150,
                },
            });

            // Create subscription record
            const now = new Date();
            const endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + 1);

            await prisma.subscription.create({
                data: {
                    userId: session.user.id,
                    plan: plan as "BASIC" | "PRO",
                    price: amount || (plan === "PRO" ? 99000 : 49000),
                    startDate: now,
                    endDate,
                    isActive: true,
                },
            });
        }

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            status: paymentStatus,
            aiVerification: {
                valid: aiResult.valid,
                confidence: aiResult.confidence,
                reason: aiResult.reason,
                detectedAmount: aiResult.detectedAmount,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Payment confirm error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}
