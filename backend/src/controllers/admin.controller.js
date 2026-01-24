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
                    include: {
                        complaint: true // Include the new complaint draft
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Parse technical data for the Admin view
        const formattedReports = reports.map(a => {
            let technicalData = {};
            try {
                technicalData = JSON.parse(a.analysisText);
            } catch (e) {
                console.error("Failed to parse analysisText for", a.id);
                technicalData = { analysisSummary: "Format Error: Could not parse technical data." };
            }

            return {
                id: a.id,
                reportId: a.reportId,
                timestamp: a.createdAt,
                confidenceScore: a.confidenceScore || technicalData.confidenceScore || 0,
                status: a.report?.status || 'SUBMITTED',
                analysisSummary: technicalData.analysisSummary || "No technical summary available.",
                indicators: technicalData.indicators || [],
                complaint: a.report?.complaint || null, // Pass full complaint object
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
            where: { reportId: id },
            include: {
                report: {
                    include: {
                        complaint: true
                    }
                }
            }
        });

        if (!analysis) {
            return res.status(404).json({ error: "Report analysis not found" });
        }

        let technicalData = {};
        try {
            technicalData = JSON.parse(analysis.analysisText);
        } catch (e) {
            technicalData = { analysisSummary: "Error parsing technical payload." };
        }

        const report = await prisma.report.findUnique({ where: { id: analysis.reportId } });

        res.json({
            id: analysis.id,
            reportId: analysis.reportId,
            confidenceScore: analysis.confidenceScore || technicalData.confidenceScore || 0,
            status: report?.status || 'SUBMITTED',
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
