/**
 * Content Safety Filter
 * Checks prompts for NSFW and inappropriate content before generation
 */

// Blocked terms (Indonesian + English) — lowercase
const NSFW_TERMS = [
    // English
    "nude", "naked", "nsfw", "porn", "pornographic", "xxx", "sexual", "sexually",
    "erotic", "erotica", "hentai", "genitalia", "genital", "sex scene",
    "topless", "bottomless", "stripper", "strip club", "orgasm",
    "intercourse", "masturbat", "fetish", "bondage", "bdsm",
    "explicit content", "adult content", "obscene",
    // Indonesian
    "telanjang", "bugil", "porno", "pornografi", "cabul",
    "mesum", "asusila", "seksual", "bokep", "vulgar",
    "senonoh", "tidak senonoh", "tak senonoh", "jorok",
    "berbau seks", "dewasa 18+", "konten dewasa",
    // Violence / gore
    "gore", "gory", "mutilation", "dismember", "bloody murder",
    "decapitat", "torture", "violent death", "graphic violence",
    // Drugs
    "drug use", "crack cocaine", "methamphetamine", "heroin use",
    "inject drugs", "narkoba", "narkotika", "ganja",
    // Hate speech
    "hate speech", "racist", "racism", "nazi", "swastika",
    "kafir", "ujaran kebencian",
];

// Suspicious patterns for fraud-related content
const FRAUD_PATTERNS = [
    // Transfer/payment manipulation
    "transfer ke rekening", "transfer ke nomor",
    "kirim uang ke", "bayar ke rekening",
    "ganti nomor rekening", "ubah rekening",
    "ganti no rek", "ubah no rek",
    "change account number", "change bank account",
    "new account number", "different account",
];

export interface SafetyCheckResult {
    safe: boolean;
    reason?: string;
    type?: "nsfw" | "fraud" | "violence" | "other";
}

/**
 * Check a prompt for NSFW or inappropriate content
 */
export function checkPromptSafety(prompt: string): SafetyCheckResult {
    const lowerPrompt = prompt.toLowerCase().trim();

    // Check NSFW terms
    for (const term of NSFW_TERMS) {
        if (lowerPrompt.includes(term)) {
            return {
                safe: false,
                reason: `Konten tidak pantas terdeteksi. Prompt mengandung unsur "${term}" yang tidak diperbolehkan.`,
                type: "nsfw",
            };
        }
    }

    return { safe: true };
}

/**
 * Check for potential fraud in poster revision prompts
 * Detects if someone is trying to change bank account numbers significantly
 */
export function checkFraudAttempt(params: {
    prompt: string;
    originalAccountNumber?: string;
    originalAccountName?: string;
}): SafetyCheckResult {
    const lowerPrompt = params.prompt.toLowerCase().trim();

    // Check for fraud-related patterns
    for (const pattern of FRAUD_PATTERNS) {
        if (lowerPrompt.includes(pattern)) {
            return {
                safe: false,
                reason: "Percobaan perubahan rekening terdeteksi. Mengubah informasi rekening bank pada poster tidak diperbolehkan.",
                type: "fraud",
            };
        }
    }

    // Check if prompt contains a different bank account number
    if (params.originalAccountNumber) {
        // Extract numbers that look like account numbers (8-20 digits)
        const accountNumberRegex = /\b(\d{8,20})\b/g;
        const matches = lowerPrompt.match(accountNumberRegex);

        if (matches) {
            for (const match of matches) {
                if (match !== params.originalAccountNumber) {
                    // Count digit differences
                    const diffs = countDigitDifferences(match, params.originalAccountNumber);
                    if (diffs > 2) {
                        return {
                            safe: false,
                            reason: `Percobaan fraud terdeteksi: nomor rekening pada prompt (${match}) berbeda signifikan dari rekening asli. Perubahan lebih dari 2 digit tidak diperbolehkan.`,
                            type: "fraud",
                        };
                    }
                }
            }
        }
    }

    // Check if trying to change account holder name
    if (params.originalAccountName) {
        const nameChangePatterns = [
            "a/n ", "atas nama ",
            "nama rekening ", "account name ",
            "pemilik rekening ",
        ];

        for (const pattern of nameChangePatterns) {
            const idx = lowerPrompt.indexOf(pattern);
            if (idx >= 0) {
                const afterPattern = lowerPrompt.substring(idx + pattern.length, idx + pattern.length + 50).trim();
                const originalLower = params.originalAccountName.toLowerCase();
                // Check if the name is significantly different
                if (afterPattern.length > 2 && !afterPattern.includes(originalLower) && !originalLower.includes(afterPattern.split(/[,.\s]/)[0])) {
                    return {
                        safe: false,
                        reason: "Percobaan fraud terdeteksi: nama pemilik rekening yang dimasukkan berbeda dari data asli.",
                        type: "fraud",
                    };
                }
            }
        }
    }

    return { safe: true };
}

/**
 * Count how many digits differ between two number strings
 */
function countDigitDifferences(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    let diffs = Math.abs(a.length - b.length); // Length diff counts as differences

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) diffs++;
    }

    // If lengths are very different, it's definitely a different number
    if (Math.abs(a.length - b.length) > 2) return maxLen;

    return diffs;
}
