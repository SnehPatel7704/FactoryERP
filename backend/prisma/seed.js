import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { generateSKU } from '../lib/skuGenerator.js';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding - clearing existing data first...');

    // Safe clear function - reverse FK order (use prisma delegate names)
    const tablesToClear = [
        'dispatchLine',
        'dispatchChallan',
        'productionEntry',
        'lineItem',
        'salesOrder',
        'quality',
        'size',
        'color',
        'item',
        'user'
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

    // Create Default Admin (env override supported)
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    if (!process.env.SEED_ADMIN_PASSWORD) {
        console.warn('⚠️  No SEED_ADMIN_PASSWORD set. Using default password admin123 for seed data. Set SEED_ADMIN_PASSWORD in /backend/.env to avoid weak credentials.');
    }
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
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

    // Keep a stable default item id for integration tests/fixtures
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

    // Additional richer seed data (from seed-fixed)
    const item1 = await prisma.item.create({
        data: {
            code: 'CTN-TWL-240-BLU',
            name: 'Cotton Twill 240GSM',
            description: 'Heavy duty cotton fabric'
        }
    });

    const clr1 = await prisma.color.create({ data: { name: 'Obsidian Black', hexCode: '#111111' } });
    const sz1 = await prisma.size.create({ data: { value: '200mm' } });
    const q1 = await prisma.quality.create({ data: { grade: 'Grade A+' } });

    const item2 = await prisma.item.create({ data: { code: 'LIN-POL-180-NAT', name: 'Linen Polyester Blend 180GSM', description: 'Medium weight blend fabric' } });
    const item3 = await prisma.item.create({ data: { code: 'SLK-CHK-200-PRM', name: 'Silk Checkered Premium 200GSM', description: 'Premium silk fabric' } });

    const clr2 = await prisma.color.create({ data: { name: 'Pure White', hexCode: '#FFFFFF' } });
    const clr3 = await prisma.color.create({ data: { name: 'Navy Blue', hexCode: '#001A4D' } });
    const clr4 = await prisma.color.create({ data: { name: 'Crimson Red', hexCode: '#DC143C' } });

    const sz2 = await prisma.size.create({ data: { value: '300mm' } });
    const sz3 = await prisma.size.create({ data: { value: '150mm' } });

    const q2 = await prisma.quality.create({ data: { grade: 'Grade A' } });
    const q3 = await prisma.quality.create({ data: { grade: 'Grade B' } });

    console.log('Masters created.');

    // Sales Orders with unique orderNumbers
    const salesOrders = [];
    for (let i = 1; i <= 8; i++) {
        const so = await prisma.salesOrder.create({
            data: {
                orderNumber: `SO-${Date.now()}-${String(i).padStart(3, '0')}`,
                customerName: `Customer ${i}`,
                status: 'confirmed'
            }
        });
        salesOrders.push(so);
    }

    // Line Items
    await prisma.lineItem.create({
        data: {
            salesOrderId: salesOrders[0].id,
            itemId: item1.id,
            sizeId: sz1.id,
            qualityId: q1.id,
            colorId: clr1.id,
            weightId: 150.5,
            lengthMeter: 1200
        }
    });

    // Production Entries (diverse records for testing)
    const items = [item1, item2, item3];
    const colors = [clr1, clr2, clr3, clr4];
    const sizes = [sz1, sz2, sz3];
    const qualities = [q1, q2, q3];
    const machines = ['Loom-01', 'Loom-02', 'Loom-03', 'Loom-04'];
    const shifts = ['A', 'B', 'C'];
    const statuses = ['created', 'created', 'created', 'staged', 'staged', 'dispatched'];

    for (let i = 1; i <= 30; i++) {
        const item = items[i % items.length];
        const color = colors[i % colors.length];
        const size = sizes[i % sizes.length];
        const quality = qualities[i % qualities.length];
        const machine = machines[i % machines.length];
        const shift = shifts[i % shifts.length];
        const status = statuses[i % statuses.length];

        await prisma.productionEntry.create({
            data: {
                sku: generateSKU(),
                status: status,
                shiftCode: `${shift}${String(i).padStart(2, '0')}`,
                machineCenter: machine,
                operatorId: `OP-${String(i).padStart(4, '0')}`,
                weightId: 50 + (i * 3),
                lengthMeter: 600 + (i * 50),
                bagsCount: 5 + (i % 10),
                itemId: item.id,
                sizeId: size.id,
                qualityId: quality.id,
                colorId: color.id,
                salesOrderId: salesOrders[i % salesOrders.length].id
            }
        });
    }

    // Dispatch
    await prisma.dispatchChallan.create({
        data: {
            challanNumber: `CHL-${Date.now()}-001`,
            vehicleNo: 'GJ05AB1234',
            transporter: 'Fast Freight Ltd',
            driverContact: '+91 98765 43210',
            destination: 'Surat',
            status: 'delivered'
        }
    });

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
