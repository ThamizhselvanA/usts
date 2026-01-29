import process from "node:process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    try {
        const jobs = await prisma.syncJob.findMany({
            include: { ticket: { select: { subject: true } } }
        });
        console.log("Current Sync Jobs:");
        console.log(JSON.stringify(jobs, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Sync check failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

check();
