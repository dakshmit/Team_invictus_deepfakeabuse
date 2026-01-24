import express from 'express';
import { getForensicReports, getReportDetails, verifyReport } from '../controllers/admin.controller.js';

const router = express.Router();

// NGO-only endpoints for technical forensic review
router.get('/forensics', getForensicReports);
router.get('/forensics/:id', getReportDetails);
router.post('/forensics/:id/verify', verifyReport);

export default router;
