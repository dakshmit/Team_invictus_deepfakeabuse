import { prisma } from './src/config/db.js';

async function promoteUser(email, role) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role }
        });
        console.log(`✅ User ${user.email} promoted to ${role}`);
    } catch (error) {
        console.error("❌ Promotion failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
const role = process.argv[3] || 'NGO_ADMIN';

if (!email) {
    console.log("Usage: node promote_user.js <email> <role>");
    process.exit(1);
}

promoteUser(email, role);
