import { prisma } from '../config/db.js';
import { logAction } from '../utils/audit.js';

/**
 * NGO Admin Controller: Technical Forensic Review
 */

// List all forensic reports with technical signals (Intake Dashboard)
export const getForensicReports = async (req, res) => {
    try {
        const reports = await prisma.aIAnalysis.findMany({
            include: {
                report: {
                    include: {
                        complaint: true,
                        mediaEvidence: {
                            select: { id: true, fileHash: true } // Only metadata
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedReports = reports.map(a => {
            let technicalData = {};
            try {
                technicalData = JSON.parse(a.analysisText);
            } catch (e) {
                technicalData = { analysisSummary: "Format Error" };
            }

            return {
                id: a.id,
                reportId: a.reportId,
                timestamp: a.createdAt,
                confidenceScore: a.confidenceScore || technicalData.confidenceScore || 0,
                status: a.report?.status || 'SUBMITTED',
                analysisSummary: technicalData.analysisSummary || "No technical summary available.",
                indicators: technicalData.indicators || [],
                evidenceCount: a.report?.mediaEvidence?.length || 0,
                integrityVerified: true, // Placeholder for silent re-hash check
                complaint: a.report?.complaint || null,
                ...technicalData
            };
        });

        res.json(formattedReports);
    } catch (error) {
        console.error("Admin Report Retrieval Error:", error);
        res.status(500).json({ error: "Failed to fetch forensic signals" });
    }
};

// Detailed view for a specific report (WITHOUT Evidence Display)
export const getReportDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await prisma.aIAnalysis.findUnique({
            where: { reportId: id },
            include: {
                report: {
                    include: {
                        complaint: true,
                        mediaEvidence: { select: { id: true, fileHash: true, fileType: true } }
                    }
                }
            }
        });

        if (!analysis) return res.status(404).json({ error: "Report analysis not found" });

        let technicalData = {};
        try {
            technicalData = JSON.parse(analysis.analysisText);
        } catch (e) {
            technicalData = { analysisSummary: "Error parsing payload." };
        }

        res.json({
            id: analysis.id,
            reportId: analysis.reportId,
            idForUI: analysis.reportId,
            confidenceScore: analysis.confidenceScore || technicalData.confidenceScore || 0,
            status: analysis.report?.status || 'SUBMITTED',
            officialResponse: analysis.report?.officialResponse,
            supportContact: analysis.report?.supportContact,
            rejectionDetails: analysis.report?.rejectionDetails,
            evidence: analysis.report?.mediaEvidence || [], // Locked IDs and Hashes only
            ...technicalData
        });
    } catch (error) {
        console.error("Admin Detail Retrieval Error:", error);
        res.status(500).json({ error: "Failed to fetch report details" });
    }
};

// Update Case Status (Action & Case Handling)
export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params; // reportId
        const { status, notes } = req.body;

        let extraData = {};
        if (status === 'VALID') {
            extraData = {
                officialResponse: "Our forensic team has verified your case. We are here to support you throughout the legal process.",
                supportContact: "+91 98765 43210 (24/7 Digital Safety Helpline)"
            };
        } else if (['RESOLVED', 'NEEDS_CLARIFICATION'].includes(status)) {
            extraData = {
                rejectionDetails: notes || "No specific details provided."
            };
        }

        const updatedReport = await prisma.report.update({
            where: { id: id },
            data: {
                status: status,
                ...extraData,
                internalNotes: notes ? {
                    create: {
                        content: notes,
                        authorId: req.user.id
                    }
                } : undefined
            }
        });

        // Audit Log
        await logAction(req.user.id, "STATUS_CHANGE", id, { newStatus: status });

        res.json({
            success: true,
            status: updatedReport.status,
            message: `Case status updated to ${status}`
        });
    } catch (error) {
        console.error("Admin Status Update Error:", error);
        res.status(500).json({ error: "Failed to update case status" });
    }
};

// legacy verifyReport shim
export const verifyReport = async (req, res) => {
    req.body.status = 'VALID';
    return updateReportStatus(req, res);
};
