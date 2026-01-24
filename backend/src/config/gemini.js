import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

console.log("Gemini Config: API Key Present?", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
export const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
