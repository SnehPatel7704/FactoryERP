import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { generateSKU } from '../lib/skuGenerator.js';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding - clearing existing data first...');

    // Safe clear function - reverse FK order
    const tablesToClear = [
        'DispatchLine',
        'DispatchChallan',
        'ProductionEntry',
        'LineItem',
        'SalesOrder',
        'Quality',
        'Size',
        'Color',
        'Item',
        'User'
    ];

    for (const table of tablesToClear) {
        try {
            await prisma[table].deleteMany();
            console.log(`✅ Cleared ${table}`);
        } catch (e) {
            console.log(`⏭️  Skipped ${table} (may not exist):`, e.message.slice(0, 100));
        }
    }

    console.log('✅ All existing data cleared/skipped.');

    // Create Default Admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@featherafine.com' },
        update: {},
        create: {
            email: 'admin@featherafine.com',
            password: hashedAdminPassword,
            role: 'admin'
        }
    });
    console.log('Default Admin created.');

    // Create Default Item
    await prisma.item.upsert({
        where: { id: '1001' },
        update: {},
        create: {
            id: '1001',
            code: '1001',
            name: 'F3',
            description: 'F3',
            isActive: true,
            basePrice: 100,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
    console.log('Default Item created.');

    console.log('Full dataset seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
