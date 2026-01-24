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
export const analyzeArtifactsWithGemini = async (model, base64Data, mimeType) => {
    const prompt = `
        You are a Forensic Image Analyst. Analyze this image for visual artifacts indicative of manipulation.
        
        Look for:
        - Edge Blending & Sharpness Inconsistencies
        - Lighting & Shadow Discrepancies
        - Geometric Warping or Distortion
        - Compression Artifacts & Noise Pattern mismatches
        - Skin Texture & Facial Feature Alignment
        
        JSON RESPONSE FORMAT:
        {
            "analysisSummary": "A detailed technical summary of findings.",
            "confidenceScore": 0.85,
            "indicators": ["indicator name: detail description", "..."],
            "complaintDraft": "A professional draft for reporting this incident."
        }
    `;

    try {
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    { inlineData: { data: base64Data, mimeType: mimeType || 'image/jpeg' } }
                ]
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
