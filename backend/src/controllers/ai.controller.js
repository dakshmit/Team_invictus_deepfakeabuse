import { model } from '../config/gemini.js';

/**
 * Controller for AI Chatbot and Analysis
 */

export const chatHub = async (req, res) => {
    try {
        const { message, history, image } = req.body;
        if (!message && !image) return res.status(400).json({ error: "I'm listening, please share what's on your mind." });

        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.parts }],
        }));

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: { maxOutputTokens: 512 },
        });

        let result;
        if (image && image.data && image.mimeType) {
            result = await chat.sendMessage([
                { text: message || "Please analyze this shared image." },
                { inlineData: { data: image.data, mimeType: image.mimeType } }
            ]);
        } else {
            result = await chat.sendMessage(message);
        }

        const text = result.response.text();
        res.json({ text });
    } catch (err) {
        console.error("Gemini Chat Error:", err);
        res.status(500).json({ error: "I'm here, but I'm having a quiet moment. Try again?" });
    }
};

export const analyzeReport = async (req, res) => {
    try {
        const { reportId } = req.body;
        // Mock analysis for hackathon
        const analysis = {
            reportId,
            status: "Success",
            riskLevel: "High",
            summary: "Potential deepfake manipulation detected in edge blending and resolution inconsistencies.",
            confidence: 0.89
        };
        res.json(analysis);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
