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

    // Create Challan with nested line items inside a transaction
    const challan = await req.prisma.$transaction(async (tx) => {
      const newChallan = await tx.dispatchChallan.create({
        data: {
          challanNumber: challanNumber,
          vehicleNo,
          transporter,
          driverContact,
          destination,
          lines: {
            create: lines?.map(line => ({
              productionId: line.productionId,
              batchweightId: Number(line.batchweightId) || 0,
              description: line.description || ''
            })) || []
          }
        },
        include: { lines: true }
      });

      // Update ProductionEntries to 'dispatched'
      const productionIds = lines.map(line => line.productionId).filter(id => id);
      if (productionIds.length > 0) {
        await tx.productionEntry.updateMany({
          where: { id: { in: productionIds } },
          data: { status: 'dispatched' }
        });
      }

      // Update SalesOrder to 'confirmed' if salesOrderId is passed
      if (req.body.salesOrderId) {
        await tx.salesOrder.update({
          where: { id: req.body.salesOrderId },
          data: { status: 'confirmed' }
        });
      }

      return newChallan;
    });

    res.json(challan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate challan from staged items
router.post('/challan/generate-from-staging', async (req, res) => {
  try {
    const { salesOrderId, vehicleNo, transporter, driverContact, destination } = req.body;

    if (!salesOrderId) {
      return res.status(400).json({ error: "Sales Order ID is required" });
    }

    // Get all staged items for this sales order
    const stagedItems = await req.prisma.productionEntry.findMany({
      where: {
        salesOrderId,
        status: 'staged'
      },
      include: {
        item: true,
        size: true,
        quality: true,
        color: true
      }
    });

    if (stagedItems.length === 0) {
      return res.status(400).json({ error: "No staged items found for this sales order" });
    }

    // Generate unique challan number: CHALLAN-TIMESTAMP-ORDER
    const timestamp = Date.now();
    const orderNum = salesOrderId.substring(0, 8).toUpperCase();
    const challanNumber = `CHALLAN-${timestamp}-${orderNum}`;

    // Calculate total weight
    const totalWeight = stagedItems.reduce((sum, item) => sum + item.weightId, 0);

    // Create challan with all staged items as lines
    const challan = await req.prisma.dispatchChallan.create({
      data: {
        challanNumber,
        vehicleNo: vehicleNo || '',
        transporter: transporter || '',
        driverContact: driverContact || '',
        destination: destination || '',
        lines: {
          create: stagedItems.map(item => ({
            productionId: item.id,
            batchweightId: item.weightId,
            description: `${item.item?.name || ''} - ${item.color?.name || ''} - ${item.size?.value || ''} (${item.quality?.grade || ''})`
          }))
        }
      },
      include: { lines: true }
    });

    res.json({
      success: true,
      challan,
      totalItems: stagedItems.length,
      totalWeight
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
