import { model, visionModel } from '../config/gemini.js';
import { analyzeArtifacts, analyzeArtifactsWithGemini } from '../services/vision.service.js';
import { prisma } from '../config/db.js';

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
        const { morphedBase64, mimeType, reportId, originalBase64 } = req.body;
        // morphedBase64 is the primary evidence, originalBase64 is the reference (optional)

        if (!morphedBase64) return res.status(400).json({ error: "No image data for detailed analysis" });

        console.log(`[FORENSIC DEBUG] Starting analysis for Report: ${reportId}`);
        const analysisData = await analyzeArtifactsWithGemini(visionModel, morphedBase64, mimeType, originalBase64);
        console.log(`[FORENSIC DEBUG] RAW ANALYTICS FROM AI: ${JSON.stringify(analysisData)}`);

        // Multi-Signal Confidence Mapping
        const riskLevel = analysisData.riskLevel || "Low";
        let numericScore = analysisData.confidenceScore || 0;

        // Map technical risk levels to consistent scores if not provided
        if (!numericScore || numericScore === 0) {
            const riskMap = {
                "Low": 0.15,
                "Medium": 0.55,
                "High": 0.92
            };
            numericScore = riskMap[riskLevel] || 0.15;
        }

        // Normalize if necessary (0.0 to 1.0)
        let finalScore = numericScore > 1 ? numericScore / 100 : numericScore;

        // Handle Safety Refusals or Inconclusive states
        if (analysisData.safetyRefusal) {
            console.log("[FORENSIC DEBUG] AI triggered a safety refusal.");
            analysisData.analysisSummary = "The automated scan was inconclusive for this specific content. Specialized professional review is required.";
            finalScore = 0.05; // Set to minimal confidence to avoid alarm
        }

        // --- NGO HITL WORKFLOW: PARTITIONING DATA ---
        // 1. Technical report for NGO oversight
        const technicalForensicReport = {
            reportId,
            comparisonPerformed: !!originalBase64,
            analysisSummary: analysisData.analysisSummary || "Technical analysis performed on pixel alignment and lighting distribution.",
            confidenceScore: finalScore,
            indicators: (analysisData.indicators && analysisData.indicators.length > 0) ? analysisData.indicators : ["Automated Artifact Scan", "Lighting Consistency Check", "Texture Anomaly Detection"],
            visualArtifacts: "Forensic indicators captured for NGO professional review."
        };

        // 2. User-friendly report (Empowerment focused)
        const userFriendlyReport = {
            complaintDraft: analysisData.complaintDraft || "Formal complaint draft generated based on identified inconsistencies.",
            legalSections: ["Section 66E (Privacy)", "Section 67 (Obscenity)", "IT Act 2000"],
            message: "I've analyzed the technical details and prepared your formal complaint. Our NGO partners have been notified and will provide professional oversight."
        };

        // 3. Persist technical details to Database (NGO View)
        if (reportId) {
            try {
                // Save Analysis
                await prisma.aIAnalysis.upsert({
                    where: { reportId: reportId },
                    update: {
                        analysisText: JSON.stringify(technicalForensicReport),
                        confidenceScore: finalScore,
                    },
                    create: {
                        reportId: reportId,
                        analysisText: JSON.stringify(technicalForensicReport),
                        confidenceScore: finalScore,
                    }
                });

                // --- NEW: Save Complaint Draft ---
                if (userFriendlyReport.complaintDraft) {
                    await prisma.complaint.upsert({
                        where: { reportId: reportId },
                        update: {
                            content: userFriendlyReport.complaintDraft,
                            suggestedLaw: userFriendlyReport.legalSections?.join(', ') || null
                        },
                        create: {
                            reportId: reportId,
                            content: userFriendlyReport.complaintDraft,
                            suggestedLaw: userFriendlyReport.legalSections?.join(', ') || null
                        }
                    });
                    console.log(`[FORENSIC DEBUG] Saved Complaint Draft for ${reportId}.`);
                }

                // Update Report Status to SUBMITTED
                await prisma.report.update({
                    where: { id: reportId },
                    data: { status: 'SUBMITTED' }
                });

                console.log(`[FORENSIC DEBUG] SUCCESS: Saved analysis for ${reportId} (Score: ${finalScore}) and updated Status to SUBMITTED.`);
            } catch (dbError) {
                console.error("DB Persistence Error (AIAnalysis/Status):", dbError);
            }
        }

        // Return user data
        res.json(userFriendlyReport);

    } catch (error) {
        console.error("Detailed Analysis Error:", error);
        res.status(500).json({ error: error.message || "Detailed forensics failed" });
    }
};
