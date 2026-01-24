import prisma from "../prisma/client.js";

export async function logAudit(userId, action, metadata = {}) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      metadata
    }
  });
}
