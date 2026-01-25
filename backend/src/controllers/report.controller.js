import { prisma } from '../config/db.js';
import Joi from 'joi';
import { generateComplaintPDF } from '../services/pdf.service.js';
import path from 'path';
import fs from 'fs/promises';

const createReportSchema = Joi.object({
    description: Joi.string().required(),
});

export const createReport = async (req, res) => {
    try {
        const { error } = createReportSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { description } = req.body;
        const userId = req.user.id;

        const report = await prisma.report.create({
            data: {
                userId,
                description,
                status: 'DRAFT',
            },
        });

        res.status(201).json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getMyReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const reports = await prisma.report.findMany({
            where: { userId },
            include: {
                mediaEvidence: true,
                aiAnalysis: true,
            },
        });
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const submitReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await prisma.report.update({
            where: { id },
            data: { status: 'SUBMITTED' }
        });
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                aiAnalysis: true,
                complaint: true, // Also include complaint details
            },
        });
        if (!report) return res.status(404).json({ error: 'Report not found' });

        // Return structured data including feedback
        res.json({
            ...report,
            // (Feedback fields are already on report top level due to schema update)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
export const downloadComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const pdfBuffer = await generateComplaintPDF(id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=complaint-${id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ error: "Failed to generate complaint PDF" });
    }
};

/**
 * Handle direct upload of the complaint document (PDF)
 */
export const uploadComplaintDocument = async (req, res) => {
    try {
        const { id } = req.params; // reportId
        const { base64Data } = req.body;

        if (!base64Data) return res.status(400).json({ error: "No document data provided" });

        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `complaint_${id}_${Date.now()}.pdf`;
        const filePath = path.join('uploads', fileName);

        await fs.writeFile(filePath, buffer);

        // Update the Complaint record with the path
        await prisma.complaint.update({
            where: { reportId: id },
            data: { pdfPath: filePath }
        });

        res.json({ message: "Complaint document successfully submitted to NGO", filePath });

    } catch (error) {
        console.error("Complaint Upload Error:", error);
        res.status(500).json({ error: "Failed to submit complaint document" });
    }
};

/**
 * Handle download of the submitted complaint document for NGO
 */
export const downloadSubmittedComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await prisma.complaint.findUnique({
            where: { reportId: id }
        });

        if (!complaint || !complaint.pdfPath) {
            return res.status(404).json({ error: "No submitted complaint document found" });
        }

        const filePath = path.resolve(complaint.pdfPath);
        res.sendFile(filePath);

    } catch (error) {
        console.error("Complaint Retrieval Error:", error);
        res.status(500).json({ error: "Failed to retrieve complaint document" });
    }
};
