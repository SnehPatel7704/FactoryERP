import express from 'express';
const router = express.Router();

// Get all challans
router.get('/challans', async (req, res) => {
  try {
    const challans = await req.prisma.dispatchChallan.findMany({
      include: { lines: true },
      orderBy: { dispatchDate: 'desc' }
    });
    res.json(challans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single challan by ID
router.get('/challan/:id', async (req, res) => {
  try {
    const challan = await req.prisma.dispatchChallan.findUnique({
      where: { id: req.params.id },
      include: { lines: true }
    });
    if (!challan) return res.status(404).json({ error: 'Challan Not Found' });
    res.json(challan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new dispatch challan
router.post('/challan', async (req, res) => {
  try {
    const { challanNumber, vehicleNo, transporter, driverContact, destination, lines } = req.body;
    
    // Validation
    if (!challanNumber || challanNumber.trim() === '') {
      return res.status(400).json({ error: "Challan Number is deeply required" });
    }
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: "Cannot create a challan without at least one line item" });
    }

    // Create Challan with nested line items
    const challan = await req.prisma.dispatchChallan.create({
      data: {
        challanNumber: challanNumber,
        vehicleNo,
        transporter,
        driverContact,
        destination,
        lines: {
          create: lines?.map(line => ({
            productionId: line.productionId,
            batchWeightKg: Number(line.batchWeightKg) || 0,
            description: line.description || ''
          })) || []
        }
      },
      include: { lines: true }
    });

    res.json(challan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
