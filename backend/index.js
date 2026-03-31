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
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
    
    // Aggregate production entry metrics
    const productionStats = await prisma.productionEntry.aggregate({
      where: { type: 'entry' },
      _sum: { weightKg: true },
      _count: { id: true }
    });

    const activeStockCount = productionStats._count.id || 0;
    const totalProductionKg = productionStats._sum.weightKg || 0;

    // Line items sum to calculate accurate Sales Revenue based on current basePrices
    const lineItemsData = await prisma.lineItem.findMany({
      include: { item: true }
    });
    
    let approxRevenue = 0;
    lineItemsData.forEach(line => {
      approxRevenue += (line.weightKg || 0) * (line.item?.basePrice || 120);
    });

    res.json({
      metrics: {
        totalOrders,
        pendingOrders,
        totalProductionKg,
        monthlySales: approxRevenue,
        annualTarget: 4100000,
        physicalStocks: activeStockCount,
        monthlyProduction: totalProductionKg, // Using total dynamically for now
        annualProduction: totalProductionKg // Using total dynamically for now
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
