import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("Testing connection specifically to:", process.env.DATABASE_URL);
    try {
        await prisma.$connect();
        console.log("Successfully connected to database!");
        process.exit(0);
    } catch (e) {
        console.error("Connection failed:");
        console.error(e.message);
        process.exit(1);
    }
}

main();
