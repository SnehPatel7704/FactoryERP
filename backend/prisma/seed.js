import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding - clearing existing data first...');

  // Clear data (reverse order due to foreign keys)
  await prisma.dispatchLine.deleteMany();
  await prisma.dispatchChallan.deleteMany();
  await prisma.productionEntry.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.quality.deleteMany();
  await prisma.size.deleteMany();
  await prisma.color.deleteMany();
  await prisma.item.deleteMany();

  console.log('Existing data cleared.');

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

  // Masters
  const item1 = await prisma.item.create({
    data: { 
      code: 'CTN-TWL-240-BLU', 
      name: 'Cotton Twill 240GSM', 
      description: 'Heavy duty cotton fabric' 
    }
  });

  const clr1 = await prisma.color.create({
    data: { 
      name: 'Obsidian Black', 
      hexCode: '#111111' 
    }
  });

  const sz1 = await prisma.size.create({
    data: { value: '200mm' }
  });

  const q1 = await prisma.quality.create({
    data: { grade: 'Grade A+' }
  });

  console.log('Masters created.');

  // Sales Orders with unique orderNumbers
  const salesOrders = [];
  for (let i = 1; i <= 5; i++) {
    const so = await prisma.salesOrder.create({
      data: {
        orderNumber: `SO-${Date.now()}-${String(i).padStart(3, '0')}`,
        customerName: `Customer ${i}`,
        status: 'confirmed',
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
      weightKg: 150.5,
      lengthMeter: 1200,
    }
  });

  // Production Entries (10 records)
  for (let i = 1; i <= 10; i++) {
    await prisma.productionEntry.create({
      data: {
        shiftCode: `A${i}`,
        machineCenter: 'Loom-01',
        operatorId: `OP-00${i}`,
        weightKg: 100 + (i * 5),
        lengthMeter: 800 + (i * 40),
        bagsCount: 8 + i,
        itemId: item1.id,
        sizeId: sz1.id,
        qualityId: q1.id,
        colorId: clr1.id,
        salesOrderId: salesOrders[Math.floor(i/2) % salesOrders.length].id,
      }
    });
  }

  // Dispatch
  const dispatchChallan1 = await prisma.dispatchChallan.create({
    data: {
      challanNumber: `CHL-${Date.now()}-001`,
      vehicleNo: 'GJ05AB1234',
      transporter: 'Fast Freight Ltd',
      driverContact: '+91 98765 43210',
      destination: 'Surat',
      status: 'delivered',
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

