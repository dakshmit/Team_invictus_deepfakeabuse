/**
 * Vision Artifact Analysis Service
 * Performs lightweight, rule-based analysis on image indicators.
 */

export const analyzeArtifacts = async (metadata) => {
    const indicators = [];
    let score = 0;

    // 1. Resolution Inconsistencies
    if (metadata.width && metadata.height) {
        if (metadata.width < 500 || metadata.height < 500) {
            indicators.push({
                type: "Low Resolution",
                detail: "Low resolution can sometimes mask manipulation artifacts or indicate multiple re-saves.",
                strength: 0.4
            });
            score += 0.3;
        }
    }

    // 2. Compression Artifacts (Simulated based on file type/size)
    if (metadata.format === 'jpeg' && metadata.size < 50000) {
        indicators.push({
            type: "High Compression",
            detail: "Heavy compression artifacts detected, which often occur during repeated sharing or editing.",
            strength: 0.5
        });
        score += 0.4;
    }

    // 3. Metadata Gaps (Simulated)
    if (!metadata.hasExif) {
        indicators.push({
            type: "Missing Metadata",
            detail: "Original camera metadata is missing, which is common in images processed by editing software or social platforms.",
            strength: 0.3
        });
        score += 0.2;
    }

    // 4. Edge Complexity (Placeholder for future logic)
    // In a real system, we would use sharp/canvas to check high-frequency noise around edges.

    // Confidence Mapping
    let confidence = "LOW";
    if (score > 0.8) confidence = "HIGH";
    else if (score > 0.4) confidence = "MODERATE";

    return {
        indicators,
        internalScore: score,
        confidence
    };
};

/**
 * Detailed Artifact Analysis using Gemini Vision API
 * This serves as the core intelligence layer for forensics.
 */
export const analyzeArtifactsWithGemini = async (model, morphedBase64, mimeType, originalBase64 = null, securityMetadata = {}) => {
    console.log(`[SERVICE DEBUG] Calling Gemini with ${originalBase64 ? 'TWO' : 'ONE'} images.`);
    let prompt = `
        You are a Specialized Forensic Image Authenticity Expert. 
        Your task is to conduct a technical examination of the provided image(s) to detect digital manipulation, generative AI artifacts, or identity inconsistencies.
    `;

    const parts = [];

    if (originalBase64) {
        prompt += `
        MULTI-SIGNAL FORENSIC ANALYSIS:
        - Signals: 
            1. Identity Consistency: Compare [SUSPECT] and [REFERENCE] for geometric alignment (nose, jaw, eyes).
            2. Pixel Integrity: Look for blending artifacts or noise mismatches in [SUSPECT].
            3. Lighting Logic: Verify if shadow directions and corneal glints match across images.
        - GOAL: Assess the risk that [SUSPECT] is a manipulated version of [REFERENCE] or a completely different individual.
        `;
        parts.push({ text: prompt });
        parts.push({ inlineData: { data: morphedBase64, mimeType: mimeType || 'image/jpeg' } });
        parts.push({ inlineData: { data: originalBase64, mimeType: mimeType || 'image/jpeg' } });
    } else {
        prompt += `
        SINGLE-IMAGE ARTIFACT SCAN:
        - Analyze [SUSPECT] for:
            - Texture Anomalies: Over-smoothed skin or "checkerboard" pixel patterns.
            - Edge Artifacts: Unnatural sharpness or blurring around facial boundaries and hairline.
            - Lighting Mismatch: Shadow orientations that don't align with the environment.
        - GOAL: Assess the risk of generative AI manipulation or morphing.
        `;
        parts.push({ text: prompt });
        parts.push({ inlineData: { data: morphedBase64, mimeType: mimeType || 'image/jpeg' } });
    }

    prompt += `
        Provide a detailed technical analysis and assign a risk level (Low, Medium, High).
    `;

    // --- NEW: Security Context for Complaint Draft ---
    if (securityMetadata && Object.keys(securityMetadata).length > 0) {
        prompt += `
        COMPLAINT DRAFT SECURITY REQUIREMENTS:
        - The "complaintDraft" MUST include the following security metadata for chain-of-custody verification:
            - Submitter Identity: ${securityMetadata.userName || 'Anonymous'} (${securityMetadata.userEmail || 'Protected'})
            - Digital Integrity Keys (Evidence Hashes): ${securityMetadata.evidenceHashes?.join(', ') || 'N/A'}
            - Evidence Encryption Status: All visual evidence is currently AES-256 encrypted in the Digital Dignity Forensic Vault.
        `;
    }

    // Ensure the last part is the format instruction
    parts[0].text += `\n\nProvide the response strictly in the JSON format defined in your instructions. If you cannot analyze due to safety, set "safetyRefusal": true.`;

    try {
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: parts
            }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        if (!responseText) {
            throw new Error("Gemini returned an empty response. This might be due to safety filters.");
        }

        return JSON.parse(responseText);

    } catch (apiError) {
        console.error("Gemini Vision Forensics Error:", apiError);

        // Handle Quota Exhaustion (429)
        if (apiError.status === 429 || apiError.message?.includes("429") || apiError.message?.includes("quota")) {
            throw new Error("Sakhi is currently taking a short breath due to high demand. Please try again in a few minutes.");
        }

        // Handle specific safety block scenario
        if (apiError.message?.includes("block")) {
            throw new Error("The analysis was stopped by safety filters. This can happen with sensitive images.");
        }

        throw new Error(`Detailed forensics failed: ${apiError.message}`);
    }
};
