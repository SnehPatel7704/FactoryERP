import express from 'express';
const router = express.Router();

// Get all production entries
router.get('/production', async (req, res) => {
  try {
    const entries = await req.prisma.productionEntry.findMany({
      include: { item: true, size: true, quality: true, color: true },
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
      include: { item: true, size: true, quality: true, color: true },
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
    const { shiftCode, machineCenter, operatorId, weightKg, lengthMeter, bagsCount, batchNumber, entryDate, itemId, sizeId, qualityId, colorId, secondaryColorId, accentColorId } = req.body;
    
    if(!itemId || !sizeId || !qualityId || !colorId) throw new Error("Missing Master Data foreign keys linking inventory element");
    
    const entry = await req.prisma.productionEntry.create({
      data: {
        type: "entry",
        shiftCode: shiftCode || null,
        machineCenter: machineCenter || null,
        operatorId: operatorId || null,
        batchNumber: batchNumber || null,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        weightKg: Number(weightKg) || 0,
        lengthMeter: Number(lengthMeter) || 0,
        bagsCount: Number(bagsCount) || 1,
        item: { connect: { id: itemId } },
        size: { connect: { id: sizeId } },
        quality: { connect: { id: qualityId } },
        color: { connect: { id: colorId } },
        ...(secondaryColorId && { secondaryColor: { connect: { id: secondaryColorId } } }),
        ...(accentColorId && { accentColor: { connect: { id: accentColorId } } })
      },
      include: { item: true, size: true, quality: true, color: true }
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create production return
router.post('/production/return', async (req, res) => {
  try {
    const { shiftCode, machineCenter, operatorId, weightKg, lengthMeter, bagsCount, itemId, sizeId, qualityId, colorId } = req.body;
    
    if(!itemId || !sizeId || !qualityId || !colorId) throw new Error("Missing Master Data foreign keys linking inventory element");

    const entry = await req.prisma.productionEntry.create({
      data: {
        type: "return",
        shiftCode: shiftCode || null,
        machineCenter: machineCenter || null,
        operatorId: operatorId || null,
        weightKg: Number(weightKg) || 0,
        lengthMeter: Number(lengthMeter) || 0,
        bagsCount: Number(bagsCount) || 1,
        item: { connect: { id: itemId } },
        size: { connect: { id: sizeId } },
        quality: { connect: { id: qualityId } },
        color: { connect: { id: colorId } }
      }
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
    const { weightKg, lengthMeter, bagsCount, batchNumber, entryDate, itemId, sizeId, qualityId, colorId, secondaryColorId, accentColorId } = req.body;
    
    if(!id) throw new Error("Entry ID is required");
    if(!itemId || !sizeId || !qualityId || !colorId) throw new Error("Missing Master Data foreign keys");

    const entry = await req.prisma.productionEntry.update({
      where: { id },
      data: {
        batchNumber: batchNumber || null,
        entryDate: entryDate ? new Date(entryDate) : undefined,
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
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

export default router;
