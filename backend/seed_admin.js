import { prisma } from './src/config/db.js';
import bcrypt from 'bcrypt';

async function seedAdmin() {
    console.log("--- SEEDING STANDARD NGO ADMIN ---");
    const email = "ngo@digitaldignity.org";
    const password = "AdminPassword123"; // Standard password as requested
    const name = "Official Digital Dignity NGO";

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'NGO_ADMIN',
                isVerified: true
            },
            create: {
                email,
                name,
                passwordHash,
                role: 'NGO_ADMIN',
                isVerified: true
            }
        });

        console.log(`✅ Standard NGO Admin seeded successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
