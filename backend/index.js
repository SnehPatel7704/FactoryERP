import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';

import masterDataRoutes from './routes/masterData.js';
import salesRoutes from './routes/sales.js';
import inventoryRoutes from './routes/inventory.js';
import logisticsRoutes from './routes/logistics.js';
import reportsRoutes from './routes/reports.js';
import authRoutes from './routes/auth.js';
import verifyToken from './middleware/auth.js';
import { requireAdmin, requireManager, requireOperatorOrManager } from './middleware/authorize.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Pass prisma instance to request object to avoid multiple instantiations
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Public Auth routes
app.use('/api/auth', authRoutes);

// Protected Routes - Master Data (admin/manager only)
app.use('/api/master', verifyToken, requireManager, masterDataRoutes);
// Protected Routes - Sales (all roles)
app.use('/api/sales', verifyToken, requireOperatorOrManager, salesRoutes);
// Protected Routes - Inventory (all roles)
app.use('/api/inventory', verifyToken, requireOperatorOrManager, inventoryRoutes);
// Protected Routes - Logistics (manager only)
app.use('/api/logistics', verifyToken, requireManager, logisticsRoutes);
// Protected Routes - Reports (all roles)
app.use('/api/reports', verifyToken, requireOperatorOrManager, reportsRoutes);

app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const totalOrders = await prisma.salesOrder.count();
    const pendingOrders = await prisma.salesOrder.count({ where: { status: 'pending' } });

    // Compute production entry metrics via findMany to avoid prisma aggregate type mismatch
    let productionEntries = [];
    let activeStockCount = 0;
    let totalProductionMeter = 0;
    let totalBags = 0;

    try {
      productionEntries = await prisma.productionEntry.findMany({
        where: { type: 'entry' },
        select: { lengthMeter: true, bagsCount: true }
      });

      activeStockCount = productionEntries.length || 0;
      totalProductionMeter = productionEntries.reduce((s, e) => s + (e.lengthMeter || 0), 0);
      totalBags = productionEntries.reduce((s, e) => s + (e.bagsCount || 0), 0);
    } catch (err) {
      // If DB schema doesn't match expected fields, fall back to zeroed metrics (avoid 500s)
      activeStockCount = 0;
      totalProductionMeter = 0;
      totalBags = 0;
    }

    // Line items sum to calculate approximate Sales Revenue based on current basePrices
    let approxRevenue = 0;
    try {
      const lineItemsData = await prisma.lineItem.findMany({ include: { item: true } });
      lineItemsData.forEach(line => {
        approxRevenue += (line.weightId || 0) * (line.item?.basePrice || 120);
      });
    } catch (err) {
      // If the DB schema for LineItem differs, skip revenue calc to avoid 500s
      approxRevenue = 0;
    }

    res.json({
      metrics: {
        totalOrders,
        pendingOrders,
        totalProductionMeter,
        totalBags,
        monthlySales: approxRevenue,
        annualTarget: 4100000,
        physicalStocks: activeStockCount,
        monthlyProduction: totalProductionMeter, // Using total dynamically for now
        annualProduction: totalProductionMeter // Using total dynamically for now
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  // console.log(process.env.ALLOWED_ORIGINS?.split(','));
  console.log(`Server running on port ${port}`);
});
