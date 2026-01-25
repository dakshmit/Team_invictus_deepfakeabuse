import { prisma } from './src/config/db.js';

async function testGetReports() {
    console.log("Testing getForensicReports logic...");
    try {
        const reports = await prisma.aIAnalysis.findMany({
            include: {
                report: {
                    include: {
                        complaint: true,
                        mediaEvidence: {
                            select: { id: true, fileHash: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Successfully fetched ${reports.length} reports.`);
    } catch (error) {
        console.error("❌ Database query failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testGetReports();
