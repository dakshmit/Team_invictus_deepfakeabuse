import express from 'express';
import { getForensicReports, getReportDetails, updateReportStatus } from '../controllers/admin.controller.js';
import { streamEvidence, verifyEvidenceIntegrity } from '../controllers/evidence.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware: All admin/NGO routes require login and specialized roles
router.use(protect);
router.use(restrictTo('ADMIN', 'NGO_ADMIN', 'CASE_OFFICER'));

// --- Intake Dashboard ---
router.get('/forensics', getForensicReports);

// --- Complaint Detail View ---
router.get('/forensics/:id', getReportDetails);

// --- Action & Case Handling ---
router.put('/forensics/:id/status', updateReportStatus);

// --- Secure Evidence Access ---
router.get('/evidence/:id/view', streamEvidence);
router.get('/evidence/:id/integrity', verifyEvidenceIntegrity);

export default router;
