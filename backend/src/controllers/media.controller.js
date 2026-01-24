import { prisma } from '../config/db.js';
import { encryptBuffer, generateHash } from '../utils/security.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * Securely uploads and encrypts evidence.
 */
export const uploadSecureEvidence = async (req, res) => {
    try {
        const { reportId, mimeType, base64Data, description } = req.body;
        if (!base64Data) return res.status(400).json({ error: "No image data provided" });

        const buffer = Buffer.from(base64Data, 'base64');

        // 1. Generate Integrity Hash
        const integrityHash = generateHash(buffer);

        // 2. Encrypt Buffer
        const { iv, data: encryptedHex } = encryptBuffer(buffer);

        // 3. Save placeholder file (In real world, you'd save the binary or hex to a file)
        const fileName = `${Date.now()}_secured.enc`;
        const filePath = path.join('uploads', fileName);
        await fs.writeFile(filePath, encryptedHex);

        // 4. Update Database
        let finalReportId = reportId;

        // If no reportId provided, create a DRAFT report for this user
        if (!finalReportId && req.user) {
            const report = await prisma.report.create({
                data: {
                    userId: req.user.id,
                    description: description || "Evidence uploaded via chat",
                    status: 'DRAFT'
                }
            });
            finalReportId = report.id;
        }

        const evidence = await prisma.mediaEvidence.create({
            data: {
                reportId: finalReportId || null,
                filePath: filePath,
                fileHash: integrityHash,
                fileType: mimeType.includes('video') ? 'VIDEO' : 'IMAGE',
                description: description || null,
                metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null,
            }
        });

        res.status(201).json({
            message: "Evidence securely hashed and encrypted.",
            evidenceId: evidence.id,
            reportId: finalReportId,
            hash: integrityHash
        });

    } catch (error) {
        console.error("Secure Upload Error:", error);

        // Handle Foreign Key violation (usually invalid userId in session)
        if (error.code === 'P2003') {
            return res.status(401).json({ error: "Session expired or invalid user. Please log in again." });
        }

        res.status(500).json({ error: "Secure intake failed" });
    }
};

/**
 * Standard upload controller for multipart form data
 */
export const uploadMedia = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const buffer = req.file.buffer;
        const integrityHash = generateHash(buffer);
        const { iv, data: encryptedHex } = encryptBuffer(buffer);

        const fileName = `${Date.now()}_std_secured.enc`;
        const filePath = path.join('uploads', fileName);
        await fs.writeFile(filePath, encryptedHex);

        const evidence = await prisma.mediaEvidence.create({
            data: {
                reportId: req.body.reportId || null,
                filePath: filePath,
                fileHash: integrityHash,
                fileType: req.file.mimetype.includes('video') ? 'VIDEO' : 'IMAGE',
            }
        });

        res.status(201).json({
            message: 'File uploaded and encrypted',
            evidenceId: evidence.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
};
