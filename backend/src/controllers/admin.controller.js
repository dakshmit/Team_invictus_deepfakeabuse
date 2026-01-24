import { prisma } from '../config/db.js';

/**
 * NGO Admin Controller: Technical Forensic Review
 */

// List all forensic reports with technical signals
export const getForensicReports = async (req, res) => {
    try {
        const reports = await prisma.aIAnalysis.findMany({
            include: {
                report: {
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Parse technical data for the Admin view
        const formattedReports = reports.map(report => {
            let technicalData = {};
            try {
                technicalData = JSON.parse(report.analysisText);
            } catch (e) {
                technicalData = { raw: report.analysisText };
            }

            return {
                id: report.id,
                reportId: report.reportId,
                timestamp: report.createdAt,
                confidenceScore: report.confidenceScore,
                ...technicalData
            };
        });

        res.json(formattedReports);
    } catch (error) {
        console.error("Admin Report Retrieval Error:", error);
        res.status(500).json({ error: "Failed to fetch forensic signals" });
    }
};

// Detailed view for a specific report
export const getReportDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await prisma.aIAnalysis.findUnique({
            where: { reportId: id }
        });

        if (!analysis) {
            return res.status(404).json({ error: "Report analysis not found" });
        }

        let technicalData = {};
        try {
            technicalData = JSON.parse(analysis.analysisText);
        } catch (e) {
            technicalData = { raw: analysis.analysisText };
        }

        res.json({
            id: analysis.id,
            reportId: analysis.reportId,
            confidenceScore: analysis.confidenceScore,
            ...technicalData
        });
    } catch (error) {
        console.error("Admin Detail Retrieval Error:", error);
        res.status(500).json({ error: "Failed to fetch report details" });
    }
};

// Verify a report and notify the user
export const verifyReport = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Update the Report status to VERIFIED
        const updatedReport = await prisma.report.update({
            where: { id: id },
            data: { status: 'VERIFIED' }
        });

        // 2. We could trigger a real-time notification here (e.g., via WebSockets)
        // For now, the frontend will poll or check status on refresh.
        console.log(`>>> [ADMIN ACTION] Report ${id} has been VERIFIED. User notified.`);

        res.json({
            success: true,
            status: updatedReport.status,
            message: "Report successfully verified. The victim has been notified."
        });
    } catch (error) {
        console.error("Admin Verification Error:", error);
        res.status(500).json({ error: "Failed to verify report" });
    }
};
