import express from 'express';
import multer from 'multer';
import { uploadMedia, uploadSecureEvidence } from '../controllers/media.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const storage = multer.memoryStorage(); // We need buffer for encryption
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media evidence management
 */

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload media evidence (Encrypted on server)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               reportId:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: file uploaded and encrypted
 */
router.post('/upload', protect, upload.single('file'), uploadMedia);

/**
 * @swagger
 * /media/upload-secure:
 *   post:
 *     summary: Securely hash and encrypt evidence
 *     tags: [Media]
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
 */
router.post('/upload-secure', protect, uploadSecureEvidence);

export default router;
