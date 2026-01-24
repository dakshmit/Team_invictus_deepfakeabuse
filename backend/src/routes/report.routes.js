import express from 'express';
import { createReport, getMyReports, submitReport } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Reporting management
 */

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Create a new report draft
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report created
 *   get:
 *     summary: Get my reports
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
router.post('/', protect, createReport);
router.get('/', protect, getMyReports);

/**
 * @swagger
 * /report/{id}/submit:
 *   put:
 *     summary: Submit a report
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report submitted
 */
router.put('/:id/submit', protect, submitReport);

export default router;
