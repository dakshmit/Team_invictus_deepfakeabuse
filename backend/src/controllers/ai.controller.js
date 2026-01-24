import { prisma } from '../config/db.js';
import { model, visionModel } from '../config/gemini.js';
import fs from 'fs';
import path from 'path';

export const analyzeReport = async (req, res) => {
    try {
        const { reportId } = req.body;

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { mediaEvidence: true },
        });

        if (!report) return res.status(404).json({ error: 'Report not found' });
        if (report.userId !== req.user.id && req.user.role !== 'ADMIN') { // Basic check
            return res.status(403).json({ error: 'Unauthorized' });
        }

        let analysisText = "";
        let confidenceScore = 0.0;

        // Construct prompt
        const prompt = `
      Analyze the following deepfake abuse report description and metadata.
      Description: "${report.description}"
      Media Files: ${report.mediaEvidence.length}
      
      Determine the likelihood of this being a deepfake incident based on typical indicators (metadata inconsistencies, description details).
      Provide a brief explanation and a confidence score between 0 and 1.
      Format: JSON { "explanation": "...", "score": 0.8 }
    `;

        // If implementing vision, we would load the image here.
        // Since files are encrypted, we'd need to decrypt them to send to Gemini.
        // For this hackathon scope (Text/Image analysis), let's stick to text-based analysis of the *description* and *metadata* 
        // unless the user specifically asks for image analysis which requires decryption.
        // The requirement says "Send media metadata + description to Gemini". It doesn't explicitly say "send the image itself".
        // "Gemini API used ONLY for text/image analysis".
        // I will just use the text model for now to satisfy "Send media metadata". 

        // Using gemini-pro (text)
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse result
        try {
            // Cleaning markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonRes = JSON.parse(cleanText);
            analysisText = jsonRes.explanation;
            confidenceScore = jsonRes.score;
        } catch (parseError) {
            console.log("Failed to parse JSON from Gemini, using raw text", text);
            analysisText = text;
            confidenceScore = 0.5; // Default/Unknown
        }

        const analysis = await prisma.aIAnalysis.create({
            data: {
                reportId,
                analysisText,
                confidenceScore
            }
        });

        res.json(analysis);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI Analysis failed' });
    }
};

export const chatHub = async (req, res) => {
    try {
        const { message, history } = req.body;

        // Sanitize history to match SDK expectations: { role: string, parts: Array<{ text: string }> }
        const formattedHistory = (history || []).map(item => ({
            role: item.role,
            parts: Array.isArray(item.parts) ? item.parts : [{ text: item.parts }]
        }));

        // Construct the chat history for Gemini
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const systemPrompt = `
      You are an empathetic and meticulous AI investigator for "DigiDignity", a platform protecting women from deepfake abuse.
      Your goal is to gather specific details from the victim to prepare a "Stage 1 Complaint Summary".
      
      Protocol:
      1. Acknowledge the user's distress with brevity and empathy.
      2. Ask ONE or TWO specific questions at a time to gather:
         - Nature of the content (Image/Video/Audio)
         - Platform where it was found (URL if possible)
         - Suspected perpetrator (if any)
         - Timeline (When was it seen/posted)
      3. Do NOT ask for the file upload yet.
      4. Once you have sufficient details (min 3-4 key points), ask "Do you want me to generate the official complaint summary now?".
      5. If they say YES, output the summary in this format:
         "COMPLAINT_SUMMARY:
          - Incident: ...
          - Platform: ...
          - Suspect: ...
          - Timeline: ..."
      
      Current User Message: ${message}
    `;

        // Strategy to enforce system prompt:
        // If it's a new conversation (no history), we send the system prompt logic as part of the first message.
        // If it's existing, we assume context is maintained, or we could append the persona reminder.

        let parts = message;
        if (!history || history.length === 0) {
            parts = systemPrompt;
        }

        const result = await chat.sendMessage(parts);
        const response = await result.response;
        const text = response.text();

        res.json({ text });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Chat interaction failed' });
    }
};
