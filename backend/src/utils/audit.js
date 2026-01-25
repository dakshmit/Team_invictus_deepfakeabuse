import { prisma } from '../config/db.js';

/**
 * Log an action for audit purposes
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action type (e.g., "VIEW_EVIDENCE", "STATUS_CHANGE")
 * @param {string} reportId - Optional associated report ID
 * @param {string} details - Additional details or metadata
 */
export const logAction = async (userId, action, reportId = null, details = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                reportId,
                details: typeof details === 'object' ? JSON.stringify(details) : details,
            }
        });
        console.log(`[AUDIT] ${action} by User ${userId} ${reportId ? `on Report ${reportId}` : ''}`);
    } catch (error) {
        console.error("[AUDIT ERROR] Failed to create audit log:", error);
    }
};
