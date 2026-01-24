import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db.js';
import { encryptBuffer } from '../services/encryption.service.js';
import { generateSHA256 } from '../services/hashing.service.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadMedia = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if (!req.body.reportId) return res.status(400).json({ error: 'Report ID required' });

        const { reportId } = req.body;
        const { originalname, buffer, mimetype } = req.file;

        // Check if report exists
        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) return res.status(404).json({ error: 'Report not found' });

        // Hashing
        const fileHash = generateSHA256(buffer);

        // Encryption
        const { content: encryptedContent, iv, authTag } = encryptBuffer(buffer);

        // We need to store IV and AuthTag to decrypt later. 
        // For this prototype, I'll append them to the file or filename, but cleaner to store in DB or separate file.
        // Let's store as filename.iv.authtag.enc

        const fileName = `${Date.now()}-${fileHash}.enc`;
        // We must save the IV and AuthTag. 
        // I will modify the save format to be: IV(hex):AuthTag(hex):EncryptedContent(hex) -> written to file as string?
        // Or just write the buffer?
        // The previous encryption service returned hex strings.
        // Let's write the JSON of { iv, authTag, content } to the file for simplicity in this hackathon.

        const encryptedData = JSON.stringify({ iv, content: encryptedContent, authTag });

        // Use absolute path for uploads
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, encryptedData);

        const mediaType = mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO';

        const media = await prisma.mediaEvidence.create({
            data: {
                reportId,
                filePath: fileName, // Store relative filename
                fileHash,
                fileType: mediaType,
            },
        });

        res.status(201).json(media);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during upload' });
    }
};
