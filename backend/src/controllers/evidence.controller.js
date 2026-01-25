import { prisma } from '../config/db.js';
import { decryptBuffer, generateHash } from '../utils/security.js';
import { logAction } from '../utils/audit.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * NGO Secure Evidence Access Controller
 */

// Request evidence decryption and streaming
export const streamEvidence = async (req, res) => {
    try {
        const { id } = req.params; // evidenceId

        // 1. Fetch metadata and IV
        const evidence = await prisma.mediaEvidence.findUnique({
            where: { id },
            include: { report: true }
        });

        if (!evidence) return res.status(404).json({ error: "Evidence not found" });

        // --- NEW: Access Revocation Post-Closure ---
        if (evidence.report?.status === 'RESOLVED') {
            return res.status(403).json({ error: "Access Denied: This case is closed and evidence access has been revoked." });
        }

        // 2. Audit Log (Access Request)
        await logAction(req.user.id, "VIEW_EVIDENCE", evidence.reportId, {
            evidenceId: id,
            method: "IN_MEMORY_STREAM"
        });

        // 3. Read encrypted file from disk
        const filePath = path.resolve(evidence.filePath);
        const encryptedHex = await fs.readFile(filePath, 'utf8');

        // 4. Decrypt in memory (RAM only)
        const decryptedBuffer = decryptBuffer(encryptedHex, evidence.encryptionIv);

        // 5. Silent Integrity Verification
        const currentHash = generateHash(decryptedBuffer);
        const integrityVerified = currentHash === evidence.fileHash;

        if (!integrityVerified) {
            console.error(`[SECURITY ALERT] Integrity mismatch for Evidence ${id}!`);
            await logAction("SYSTEM", "INTEGRITY_FAILURE", evidence.reportId, { evidenceId: id });
        }

        // 6. Secure Streaming
        res.setHeader('Content-Type', evidence.fileType === 'VIDEO' ? 'video/mp4' : 'image/jpeg');
        res.setHeader('Content-Disposition', 'inline'); // Open in browser, don't download
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('X-Forensic-Integrity', integrityVerified ? 'verified' : 'tampered');

        res.send(decryptedBuffer);

        // Buffer will be cleared by GC naturally as it local to this scope
    } catch (error) {
        console.error("Evidence Streaming Error:", error);
        res.status(500).json({ error: "Secure streaming failed" });
    }
};

// Check integrity explicitly
export const verifyEvidenceIntegrity = async (req, res) => {
    try {
        const { id } = req.params;
        const evidence = await prisma.mediaEvidence.findUnique({ where: { id } });

        if (!evidence) return res.status(404).json({ error: "Evidence not found" });

        const filePath = path.resolve(evidence.filePath);
        const encryptedHex = await fs.readFile(filePath, 'utf8');
        const decryptedBuffer = decryptBuffer(encryptedHex, evidence.encryptionIv);
        const currentHash = generateHash(decryptedBuffer);

        const valid = currentHash === evidence.fileHash;

        res.json({
            evidenceId: id,
            name: `Evidence ${id.slice(-6)}`,
            storedHash: evidence.fileHash,
            computedHash: currentHash,
            valid: valid,
            status: valid ? "✅ Integrity Verified" : "❌ Tampered"
        });
    } catch (error) {
        console.error("Integrity Check Error:", error);
        res.status(500).json({ error: "Integrity check failed" });
    }
};
