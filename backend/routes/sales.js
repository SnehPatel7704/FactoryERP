import express from 'express';
const router = express.Router();

// Fetch all Sales Orders
router.get('/', async (req, res) => {
  try {
    const orders = await req.prisma.salesOrder.findMany({
      include: {
        lineItems: true, // Include related line items
      },
      orderBy: {
        createdAt: 'desc', // Show newest first
      }
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Failed to fetch all orders: ", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Sales Order Transaction 
router.post('/new', async (req, res) => {
  try {
    const { orderNumber, customerName, status, internalNotes, expectedDate, lineItems } = req.body;

    const order = await req.prisma.salesOrder.create({
      data: {
        orderNumber,
        customerName,
        status,
        internalNotes,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        // Nested relation creation
        lineItems: {
          create: lineItems.map(item => ({
             itemId: item.itemId,
             sizeId: item.sizeId,
             qualityId: item.qualityId,
             colorId: item.colorId,
             secondaryColorId: item.secondaryColorId,
             weightKg: Number(item.weightKg) || 0,
             lengthMeter: Number(item.lengthMeter) || null,
          }))
        }
      },
      include: {
        lineItems: true
      }
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error("Failed to generate order: ", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Search single order by OrderNumber
router.get('/search/:orderNumber', async (req, res) => {
  try {
    const order = await req.prisma.salesOrder.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { lineItems: true }
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order Not Found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await req.prisma.salesOrder.findUnique({
      where: { id: req.params.id },
      include: { lineItems: true }
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order Not Found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Sales Order and completely rewrite LineItems
router.put('/:id', async (req, res) => {
  try {
    const { customerName, status, internalNotes, expectedDate, lineItems } = req.body;
    const orderId = req.params.id;
    
    // Process update in atomic transaction deleting old lineItems first
    const updatedOrder = await req.prisma.$transaction(async (tx) => {
      // 1. Wipe old items 
      await tx.lineItem.deleteMany({
         where: { salesOrderId: orderId }
      });
      // 2. Update parent and inject new items 
       const order = await tx.salesOrder.update({
         where: { id: orderId },
         data: {
           customerName,
           status,
           internalNotes,
           expectedDate: expectedDate ? new Date(expectedDate) : null,
           lineItems: {
             create: lineItems.map(item => ({
                itemId: item.itemId,
                sizeId: item.sizeId,
                qualityId: item.qualityId,
                colorId: item.colorId,
                secondaryColorId: item.secondaryColorId,
                weightKg: Number(item.weightKg) || 0,
                lengthMeter: Number(item.lengthMeter) || null,
             }))
           }
         },
         include: { lineItems: true }
       });
       return order;
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Failed to update order: ", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Staging endpoint for pre-dispatch (return staged production entries ready for dispatch)
router.get('/staging', async (req, res) => {
  try {
    const stagedEntries = await req.prisma.productionEntry.findMany({
      where: {
        salesOrder: {
          status: 'confirmed'
        }
      },
      include: {
        item: true,
        size: true,
        quality: true,
        color: true,
        salesOrder: true
      },
      take: 20, // Limit for staging view
      orderBy: { createdAt: 'desc' }
    });
    res.json({ stagedItems: stagedEntries });
  } catch (error) {
    console.error('Staging fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
