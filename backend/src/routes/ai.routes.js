import express from 'express';
import { analyzeReport, chatHub } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI Analysis & Chat
 */

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Interactive Chatbot for Complaint Gathering
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "I found a deepfake video of me on Twitter."
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     parts:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI Response
 */
router.post('/chat', protect, chatHub);

/**
 * @swagger
 * /ai/analyze:
 *   post:
 *     summary: Trigger Gemini Analysis for a report
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analysis result
 */
router.post('/analyze', protect, analyzeReport);

export default router;
