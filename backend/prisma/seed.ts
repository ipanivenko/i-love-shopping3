import "dotenv/config";
import { PrismaClient } from "@prisma/client";

import { seedBatch1 } from "./seed1";
import { seedBatch2 } from "./seed2";
import { seedBatch3 } from "./seed3";
import { seedBatch4 } from "./seed4";
import { seedBatch5 } from "./seed5";
import { seedBatch6 } from "./seed6";
import { seedBatch7 } from "./seed7";
import { seedBatch8 } from "./seed8";
import { seedShipping } from "./seedShipping";
import { seedFaq } from "./seedFaq";

const prisma = new PrismaClient();

async function runSeed(name: string, fn: (prisma: PrismaClient) => Promise<void>) {
    try {
        console.log(`\n=== Running ${name} ===`);
        await fn(prisma);
        console.log(`=== Finished ${name} ===`);
    } catch (error) {
        console.error(`=== ${name} failed ===`, error);
    }
}

async function main() {
    await runSeed("seed1", seedBatch1);
    await runSeed("seed2", seedBatch2);
    await runSeed("seed3", seedBatch3);
    await runSeed("seed4", seedBatch4);
    await runSeed("seed5", seedBatch5);
    await runSeed("seed6", seedBatch6);
    await runSeed("seed7", seedBatch7);
    await runSeed("seed8", seedBatch8);
    await runSeed("seedShipping", seedShipping);
    await runSeed("seedFAQ", seedFaq);
}

main()
    .catch((error) => {
        console.error("Master seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });