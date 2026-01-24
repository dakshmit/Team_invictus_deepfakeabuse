import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function testChat() {
    console.log("Testing Gemini Chat Logic...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("No API Key found!");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Mock Data mimicking what comes from frontend
    const history = [
        { role: 'user', parts: 'I found a deepfake.' },
        { role: 'model', parts: 'Where did you see it?' }
    ];
    const message = "On Twitter.";

    // Logic from Controller
    const formattedHistory = history.map(item => ({
        role: item.role,
        parts: Array.isArray(item.parts) ? item.parts : [{ text: item.parts }]
    }));

    console.log("Formatted History:", JSON.stringify(formattedHistory, null, 2));

    try {
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: { maxOutputTokens: 500 },
        });

        // Simulating the system prompt logic
        let parts = message;

        console.log("Sending message:", parts);
        const result = await chat.sendMessage(parts);
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("TEST SUCCESSFUL");
    } catch (error) {
        console.error("TEST FAILED");
        console.error(error);
    }
}

testChat();
