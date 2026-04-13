import express from 'express';
import { generateSKU } from '../lib/skuGenerator.js';
const router = express.Router();

// Get all production entries
router.get('/production', async (req, res) => {
  try {
    const entries = await req.prisma.productionEntry.findMany({
      include: { item: true, size: true, quality: true, color: true, secondaryColor: true, accentColor: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent production entries (last 10)
router.get('/production/recent', async (req, res) => {
  try {
    const entries = await req.prisma.productionEntry.findMany({
      where: { type: 'entry' },
      include: { item: true, size: true, quality: true, color: true, secondaryColor: true, accentColor: true, weightId: true, lengthMeter: true, bagsCount: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create production log (Entry)
router.post('/production/entry', async (req, res) => {
  try {
    const { shiftCode, machineCenter, operatorId, weightId, lengthMeter, bagsCount, batchNumber, entryDate, itemId, sizeId, qualityId, colorId, secondaryColorId, accentColorId } = req.body;

    if (!itemId || !sizeId || !qualityId || !colorId) throw new Error("Missing Master Data foreign keys linking inventory element");

    // Generate unique SKU for this production entry
    const sku = generateSKU();

    const entry = await req.prisma.productionEntry.create({
      data: {
        sku: sku,
        type: "entry",
        shiftCode: shiftCode || null,
        machineCenter: machineCenter || null,
        operatorId: operatorId || null,
        batchNumber: batchNumber || null,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        weightId: Number(weightId) || 0,
        lengthMeter: Number(lengthMeter) || 0,
        bagsCount: Number(bagsCount) || 1,
        item: { connect: { id: itemId } },
        size: { connect: { id: sizeId } },
        quality: { connect: { id: qualityId } },
        color: { connect: { id: colorId } },
        ...(secondaryColorId && { secondaryColor: { connect: { id: secondaryColorId } } }),
        ...(accentColorId && { accentColor: { connect: { id: accentColorId } } })
      },
      include: { item: true, size: true, quality: true, color: true, secondaryColor: true, accentColor: true }
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create production return
router.post('/production/return', async (req, res) => {
  try {
    const { shiftCode, machineCenter, operatorId, weightId, lengthMeter, bagsCount, itemId, sizeId, qualityId, colorId } = req.body;

    if (!itemId || !sizeId || !qualityId || !colorId) throw new Error("Missing Master Data foreign keys linking inventory element");

    // Generate unique SKU for this production return
    const sku = generateSKU();

    const entry = await req.prisma.productionEntry.create({
      data: {
        sku: sku,
        type: "return",
        shiftCode: shiftCode || null,
        machineCenter: machineCenter || null,
        operatorId: operatorId || null,
        weightId: Number(weightId) || 0,
        lengthMeter: Number(lengthMeter) || 0,
        bagsCount: Number(bagsCount) || 1,
        item: { connect: { id: itemId } },
        size: { connect: { id: sizeId } },
        quality: { connect: { id: qualityId } },
        color: { connect: { id: colorId } }
      },
      include: { item: true, size: true, quality: true, color: true }
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update production entry (Admin only)
router.put('/production/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weightId, lengthMeter, bagsCount, batchNumber, entryDate, itemId, sizeId, qualityId, colorId, secondaryColorId, accentColorId } = req.body;

    if (!id) throw new Error("Entry ID is required");
    if (!itemId || !sizeId || !qualityId || !colorId) throw new Error("Missing Master Data foreign keys");

    const entry = await req.prisma.productionEntry.update({
      where: { id },
      data: {
        batchNumber: batchNumber || null,
        entryDate: entryDate ? new Date(entryDate) : undefined,
        weightId: weightId !== undefined ? Number(weightId) : undefined,
        lengthMeter: lengthMeter !== undefined ? Number(lengthMeter) : undefined,
        bagsCount: bagsCount !== undefined ? Number(bagsCount) : undefined,
        item: { connect: { id: itemId } },
        size: { connect: { id: sizeId } },
        quality: { connect: { id: qualityId } },
        color: { connect: { id: colorId } },
        ...(secondaryColorId ? { secondaryColor: { connect: { id: secondaryColorId } } } : { secondaryColor: { disconnect: true } }),
        ...(accentColorId ? { accentColor: { connect: { id: accentColorId } } } : { accentColor: { disconnect: true } })
      },
      include: { item: true, size: true, quality: true, color: true, secondaryColor: true, accentColor: true }
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search production entry by SKU (for scanning at pre-dispatch)
router.get('/production/sku/:sku', async (req, res) => {
  try {
    const { sku } = req.params;

    if (!sku || sku.trim().length === 0) {
      return res.status(400).json({ error: 'SKU is required' });
    }

    // Try finding exact match first
    let entry = await req.prisma.productionEntry.findUnique({
      where: { sku: sku.trim() },
      include: {
        item: true,
        size: true,
        quality: true,
        color: true,
        secondaryColor: true,
        accentColor: true,
        salesOrder: true
      }
    });

    if (!entry) {
      // If no exact match (or we want to find a staged variant because the original might have been fully consumed/deleted, though unlikely if split, wait actually if we want sales to find the staged variant, let's search for the first staged entry that starts with this SKU)
      const exactOrSplit = await req.prisma.productionEntry.findFirst({
        where: {
          sku: { startsWith: sku.trim() },
          status: 'staged'
        },
        include: {
          item: true,
          size: true,
          quality: true,
          color: true,
          secondaryColor: true,
          accentColor: true,
          salesOrder: true
        },
        orderBy: { createdAt: 'desc' }
      });
      if (exactOrSplit) {
        entry = exactOrSplit;
      }
    }

    if (!entry) {
      return res.status(404).json({ error: `No production entry found with SKU: ${sku}` });
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update production entry status
router.patch('/production/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) throw new Error("Entry ID is required");
    if (!status) throw new Error("Status is required");

    const validStatuses = ['created', 'staged', 'DISPATCHED', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const entry = await req.prisma.productionEntry.update({
      where: { id },
      data: { status },
      include: {
        item: true,
        size: true,
        quality: true,
        color: true,
        secondaryColor: true,
        accentColor: true
      }
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Bulk update status for multiple entries
router.patch('/production/bulk/status', async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required and must not be empty" });
    }
    if (!status) throw new Error("Status is required");

    const validStatuses = ['created', 'staged', 'DISPATCHED', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const entries = await req.prisma.productionEntry.updateMany({
      where: { id: { in: ids } },
      data: { status }
    });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Split production entry for partial staging
router.post('/production/stage-partial', async (req, res) => {
  try {
    const { id, bagsToStage } = req.body;

    if (!id) throw new Error("Entry ID is required");
    const numBagsToStage = parseInt(bagsToStage);
    if (isNaN(numBagsToStage) || numBagsToStage <= 0) throw new Error("Number of bags to stage must be greater than 0");

    const originalEntry = await req.prisma.productionEntry.findUnique({
      where: { id }
    });

    if (!originalEntry) return res.status(404).json({ error: "Original production entry not found" });
    if (originalEntry.bagsCount < numBagsToStage) return res.status(400).json({ error: "Cannot stage more bags than available" });

    if (originalEntry.bagsCount === numBagsToStage) {
      const updatedEntry = await req.prisma.productionEntry.update({
        where: { id },
        data: { status: 'staged' },
        include: { item: true, size: true, quality: true, color: true, secondaryColor: true, accentColor: true }
      });
      return res.json({ stagedEntry: updatedEntry, originalRemaining: null });
    }

    // Calculate proportions (safely handling zero division)
    const factor = originalEntry.bagsCount > 0 ? numBagsToStage / originalEntry.bagsCount : 0;
    const stageWeight = originalEntry.weightId * factor;
    const stageLength = originalEntry.lengthMeter * factor;

    const result = await req.prisma.$transaction(async (tx) => {
      // 1. Update original
      const updatedOriginal = await tx.productionEntry.update({
        where: { id },
        data: {
          bagsCount: originalEntry.bagsCount - numBagsToStage,
          weightId: originalEntry.weightId - stageWeight,
          lengthMeter: originalEntry.lengthMeter - stageLength
        }
      });

      // 2. Create staged entry with derived SKU
      const newSku = `${originalEntry.sku}-S${Date.now().toString().slice(-4)}`;

      const stagedEntry = await tx.productionEntry.create({
        data: {
          sku: newSku,
          type: originalEntry.type,
          status: 'staged',
          shiftCode: originalEntry.shiftCode,
          machineCenter: originalEntry.machineCenter,
          operatorId: originalEntry.operatorId,
          batchNumber: originalEntry.batchNumber,
          entryDate: originalEntry.entryDate,
          weightId: stageWeight,
          lengthMeter: stageLength,
          bagsCount: numBagsToStage,
          itemId: originalEntry.itemId,
          sizeId: originalEntry.sizeId,
          qualityId: originalEntry.qualityId,
          colorId: originalEntry.colorId,
          secondaryColorId: originalEntry.secondaryColorId,
          accentColorId: originalEntry.accentColorId
        },
        include: { item: true, size: true, quality: true, color: true, secondaryColor: true, accentColor: true }
      });

      return { stagedEntry, originalRemaining: updatedOriginal };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
