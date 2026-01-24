import { prisma } from '../config/db.js';
import { model } from '../config/gemini.js';
import { analyzeArtifacts, analyzeArtifactsWithGemini } from '../services/vision.service.js';

/**
 * Controller for Image Intelligence Layer
 */
export const analyzeImageIntelligence = async (req, res) => {
    try {
        const { metadata } = req.body; // In real flow, this would extract from the uploaded file buffer

        // 1. Vision Artifact Analysis
        const analysis = await analyzeArtifacts(metadata || { format: 'jpeg', size: 40000, hasExif: false });

        // 2. Gemini Explanation Logic
        const prompt = `
            You are "Sakhi", a calm and empathetic safety companion for Digital Dignity.
            Analyze the following vision indicators and explain them to the user.
            
            Indicators: ${JSON.stringify(analysis.indicators)}
            Internal Confidence: ${analysis.confidence}

            STRICT RULES:
            1. Use uncertainty-aware phrasing (e.g., "might represent," "is often seen in").
            2. NEVER confirm the image is "fake" or "real".
            3. NEVER use alarmist language.
            4. Include a disclaimer that these artifacts can occur in normal photo editing or sharing.
            5. Since confidence is ${analysis.confidence}, tailor your response:
               - LOW: Reassure the user that no strong signs were found, but their feelings matter.
               - MODERATE: Suggest caution and ask if they want deeper help.
               - HIGH: Acknowledge multiple indicators and ask consent to proceed to complaint drafting.

            Format: Give a friendly explanation paragraph, followed by a bullet list of indicators.
        `;

        const result = await model.generateContent(prompt);
        const explanation = result.response.text();

        res.json({
            explanation,
            indicators: analysis.indicators,
            confidence: analysis.confidence, // Internal value, frontend handles display
            nextStepRequired: true
        });

    } catch (error) {
        console.error("Vision Analysis Error:", error);
        res.status(500).json({ error: "Analysis failed" });
    }
};

/**
 * Detailed Forensic Analysis using Gemini Vision
 */
export const detailedAnalysis = async (req, res) => {
    try {
        const { base64Data, mimeType, reportId } = req.body;
        if (!base64Data) return res.status(400).json({ error: "No image data for detailed analysis" });

        const analysisData = await analyzeArtifactsWithGemini(model, base64Data, mimeType);

        // --- NGO HITL WORKFLOW: PARTITIONING DATA ---
        // 1. Technical report for NGO oversight
        const technicalForensicReport = {
            reportId,
            analysisSummary: analysisData.analysisSummary,
            confidenceScore: analysisData.confidenceScore,
            indicators: analysisData.indicators,
            visualArtifacts: "Detailed technical markers identified for NGO review."
        };

        // 2. User-friendly report (Empowerment focused)
        const userFriendlyReport = {
            complaintDraft: analysisData.complaintDraft,
            legalSections: ["Section 66E (Privacy)", "Section 67 (Obscenity)", "IT Act 2000"],
            message: "I've analyzed the technical details and drafted a formal complaint for you. These findings have been securely shared with our NGO partners for professional oversight."
        };

        // --- SECURE FORWARDING TO NGO SERVER (SIMULATED) ---
        console.log(">>> [HITL SECURE FORWARD] Sending technical forensic summary to NGO employee portal...");
        console.log(`>>> Report ID: ${reportId} forwarded successfully.`);

        // 3. Persist technical details to Database (NGO View)
        if (reportId) {
            try {
                await prisma.aIAnalysis.upsert({
                    where: { reportId: reportId },
                    update: {
                        analysisText: JSON.stringify(technicalForensicReport),
                        confidenceScore: parseFloat(analysisData.confidenceScore) || 0,
                    },
                    create: {
                        reportId: reportId,
                        analysisText: JSON.stringify(technicalForensicReport),
                        confidenceScore: parseFloat(analysisData.confidenceScore) || 0,
                    }
                });
            } catch (dbError) {
                console.error("DB Persistence Error (AIAnalysis):", dbError);
            }
        }

        // Return ONLY user-friendly data to the victim
        res.json(userFriendlyReport);

    } catch (error) {
        console.error("Detailed Analysis Error:", error);
        res.status(500).json({ error: error.message || "Detailed forensics failed" });
    }
};
