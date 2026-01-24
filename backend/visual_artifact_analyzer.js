import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in environment variables.");
}

// Configure Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Performs AI-assisted visual artifact analysis on an image using Google Gemini Vision.
 * 
 * @param {string|Buffer} imageInput - Either a local file path (string) or raw image buffer.
 * @param {string} [mimeType] - Mime type of the image (e.g., 'image/jpeg'). Required if buffer is used.
 * @returns {Promise<Object>} - Analysis results.
 */
export const analyzeVisualArtifacts = async (imageInput, mimeType) => {
    try {
        let imageData;
        let finalMimeType = mimeType;

        // 1. Input Processing & Validation
        if (typeof imageInput === 'string') {
            // Treat as local file path
            if (!fs.existsSync(imageInput)) {
                return { error: `File not found: ${imageInput}` };
            }

            const ext = path.extname(imageInput).toLowerCase();
            const supportedExts = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

            if (!supportedExts[ext]) {
                return { error: "Invalid file type. Supported: jpg, jpeg, png, webp." };
            }

            finalMimeType = supportedExts[ext];
            imageData = fs.readFileSync(imageInput).toString('base64');
        } else if (Buffer.isBuffer(imageInput)) {
            // Treat as Buffer
            if (!finalMimeType) {
                return { error: "mimeType is required when passing a Buffer." };
            }
            imageData = imageInput.toString('base64');
        } else {
            return { error: "Input must be a file path (string) or image Buffer." };
        }

        // 2. Prepare Gemini Model and Call
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a digital forensic assistant.
            Analyze the provided image for potential visual inconsistencies.
            Look for:
            - Unnatural facial textures or blending
            - Lighting or shadow mismatches
            - Edge artifacts around facial features
            - Distortions commonly associated with AI-generated or morphed images

            Important rules:
            - Do NOT make definitive claims
            - Do NOT label the image as fake or real
            - Provide observations only

            Return your response strictly in JSON with:
            {
              "visual_observations": [],
              "possible_indicators": [],
              "risk_level": "Low | Medium | High",
              "legal_safe_summary": "Short neutral explanation suitable for a complaint"
            }
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageData, mimeType: finalMimeType } }
        ]);

        // 3. Output Parsing
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error("Artifact Analysis Raw Response (No JSON found):", responseText);
            return { error: "API returned malformed response or no JSON found.", raw: responseText };
        }

        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error("Artifact Analysis JSON Parse Error:", responseText);
            return { error: "Failed to parse analysis results.", raw: responseText };
        }

    } catch (error) {
        console.error("Artifact Analysis Error:", error);
        return { error: `Visual analysis failed: ${error.message}` };
    }
};

// --- Example Usage (Manual Testing Only) ---
// To run this: node backend/visual_artifact_analyzer.js
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('visual_artifact_analyzer.js')) {
    const runTest = async () => {
        const TEST_IMAGE_PATH = "./test_image.jpg"; // Replace with a local file to test

        if (fs.existsSync(TEST_IMAGE_PATH)) {
            console.log(`--- Starting Analysis on ${TEST_IMAGE_PATH} ---`);
            const results = await analyzeVisualArtifacts(TEST_IMAGE_PATH);

            // Console output for testing
            console.log(JSON.stringify(results, null, 2));

            const risk = results.risk_level || "Low";
            if (risk === "Low") {
                console.log("\n[LOGIC] Risk Level Low: Redirecting to chat support for general assistance...");
            } else {
                console.log(`\n[LOGIC] Risk Level ${risk}: Forensic indicators found. Legal draft prepared.`);
            }
        } else {
            console.log("Note: Provide a valid file path in TEST_IMAGE_PATH inside this script to run manual test.");
        }
    };
    runTest();
}
