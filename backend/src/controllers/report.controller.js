import { prisma } from '../config/db.js';
import Joi from 'joi';
import { generateComplaintPDF } from '../services/pdf.service.js';

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
            },
        });
        if (!report) return res.status(404).json({ error: 'Report not found' });
        res.json(report);
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
