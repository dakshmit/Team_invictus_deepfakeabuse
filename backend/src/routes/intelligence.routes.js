import express from 'express';
import { analyzeImageIntelligence, detailedAnalysis } from '../controllers/vision.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Intelligence
 *   description: Image Intelligence Layer
 */

/**
 * @swagger
 * /intelligence/analyze:
 *   post:
 *     summary: Analyze image artifacts (Image Intelligence Layer)
 *     tags: [Intelligence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Analysis explanation and indicators
 */
router.post('/analyze', protect, analyzeImageIntelligence);

/**
 * @swagger
 * /intelligence/detailed-analysis:
 *   post:
 *     summary: Perform deep forensic analysis using Gemini Vision
 *     tags: [Intelligence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base64Data:
 *                 type: string
 *               mimeType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Detailed forensics, confidence score, and complaint draft
 */
router.post('/detailed-analysis', protect, detailedAnalysis);

export default router;
