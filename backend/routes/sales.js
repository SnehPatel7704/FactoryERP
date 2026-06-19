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

    // Ensure all orders have status (default to 'draft' if missing)
    for (const order of orders) {
      if (!order.status) {
        await req.prisma.salesOrder.update({
          where: { id: order.id },
          data: { status: 'draft' }
        });
        order.status = 'draft';
      }
    }
    res.json(orders);
  } catch (error) {
    console.error("Failed to fetch all orders: ", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Sales Order Transaction 
router.post('/new', async (req, res) => {
  try {
    const { orderNumber, customerName, status, internalNotes, expectedDate, lineItems, productionEntryIds } = req.body;

    const order = await req.prisma.$transaction(async (tx) => {
      const newOrder = await tx.salesOrder.create({
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
              weightId: Number(item.weightId) || 0,
              lengthMeter: Number(item.lengthMeter) || null,
            }))
          }
        },
        include: {
          lineItems: true
        }
      });

      if (productionEntryIds && productionEntryIds.length > 0) {
        await tx.productionEntry.updateMany({
          where: { id: { in: productionEntryIds } },
          data: {
            salesOrderId: newOrder.id,
            status: 'pre-sale'
          }
        });
      }
      return newOrder;
    });

    res.json(order);
  } catch (error) {
    console.error("Failed to generate order: ", error);
    res.status(500).json({ error: error.message });
  }
});
// Search single order by OrderNumber
router.get('/search/:orderNumber', async (req, res) => {
  try {
    const order = await req.prisma.salesOrder.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        lineItems: {
          include: {
            item: true,
            size: true,
            quality: true,
            color: true,
          }
        }
      }
    });
    if (!order) return res.status(404).json({ error: 'Order Not Found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Staging endpoint for pre-dispatch (return production entries with 'staged' status)
router.get('/staging', async (req, res) => {
  try {
    const stagedEntries = await req.prisma.productionEntry.findMany({
      where: {
        status: 'staged'  // Fetch only staged items
      },
      include: {
        item: true,
        size: true,
        quality: true,
        color: true,
        secondaryColor: true,
        salesOrder: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ stagedItems: stagedEntries });
  } catch (error) {
    console.error('Staging fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Get all dispatched entries with sales order details (for dispatch history tracking)
router.get('/dispatch/history/all', async (req, res) => {
  try {
    const dispatchedEntries = await req.prisma.productionEntry.findMany({
      where: {
        status: 'dispatched'  // Fetch only dispatched items
      },
      include: {
        item: true,
        size: true,
        quality: true,
        color: true,
        secondaryColor: true,
        salesOrder: true
      },
      orderBy: { updatedAt: 'desc' }
    });


    // Ensure all orders have status (default to 'confirmed' if missing)
    for (const entry of dispatchedEntries) {
      if (entry.salesOrder && !entry.salesOrder.status) {
        await req.prisma.salesOrder.update({
          where: { id: entry.salesOrderId },
          data: { status: 'confirmed' }
        });
        entry.salesOrder.status = 'confirmed';
      }
    }

    // Group by sales order
    const groupedByOrder = {};
    dispatchedEntries.forEach(entry => {
      const orderId = entry.salesOrderId || 'unassigned';
      if (!groupedByOrder[orderId]) {
        groupedByOrder[orderId] = {
          order: entry.salesOrder,
          entries: []
        };
      }
      groupedByOrder[orderId].entries.push(entry);
    });

    res.json({ groups: groupedByOrder, total: dispatchedEntries.length });
  } catch (error) {
    console.error('Dispatch history fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dispatch history for a specific sales order
router.get('/dispatch/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    let order = await req.prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: { lineItems: true }
    });

    // Ensure order has status (default to 'confirmed' if missing)
    if (order && !order.status) {
      order.status = 'confirmed';
      await req.prisma.salesOrder.update({
        where: { id: orderId },
        data: { status: 'confirmed' }
      });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order Not Found' });
    }

    const dispatchedEntries = await req.prisma.productionEntry.findMany({
      where: {
        salesOrderId: orderId,
        status: 'dispatched'
      },
      include: {
        item: true,
        size: true,
        quality: true,
        color: true,
        secondaryColor: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate summary
    const summary = {
      totalItems: dispatchedEntries.length,
      totalWeight: dispatchedEntries.reduce((sum, e) => sum + (e.weightId || 0), 0),
      totalMeter: dispatchedEntries.reduce((sum, e) => sum + (e.lengthMeter || 0), 0),
      dispatchDate: dispatchedEntries.length > 0 ? dispatchedEntries[0].updatedAt : null
    };


    res.json({ order, dispatchedEntries, summary });
  } catch (error) {
    console.error('Dispatch order history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dispatch endpoint - called from frontend after challan generation
router.post('/:id/dispatch', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await req.prisma.salesOrder.findUnique({
      where: { id },
      include: { productionEntries: true }
    });

    if (!order) return res.status(404).json({ error: 'Order Not Found' });

    await req.prisma.$transaction(async (tx) => {
      // Set order confirmed
      await tx.salesOrder.update({
        where: { id },
        data: { status: 'confirmed' }
      });

      // Set linked production to dispatched
      if (order.productionEntries && order.productionEntries.length > 0) {
        const prodIds = order.productionEntries.map(pe => pe.id);
        await tx.productionEntry.updateMany({
          where: { id: { in: prodIds } },
          data: { status: 'dispatched' }
        });
      }
    });

    res.json({ success: true, message: 'Order confirmed and products dispatched' });
  } catch (error) {
    console.error('Dispatch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy force dispatch
router.post('/dispatch/force/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check order
    const order = await req.prisma.salesOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) return res.status(404).json({ error: 'Order Not Found' });

    // Update order status
    await req.prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: 'confirmed' }
    });

    // Update all linked production entries to dispatched
    await req.prisma.productionEntry.updateMany({
      where: { salesOrderId: orderId },
      data: { status: 'dispatched' }
    });

    res.json({ success: true, message: 'Order forcibly marked as dispatched' });
  } catch (error) {
    console.error("Force dispatch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await req.prisma.salesOrder.findUnique({
      where: { id: req.params.id },
      include: { lineItems: true, productionEntries: { include: { item: true, color: true, size: true, quality: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Order Not Found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Sales Order and completely rewrite LineItems
router.put('/:id', async (req, res) => {
  try {
    const { customerName, status, internalNotes, expectedDate, lineItems, productionEntryIds } = req.body;
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
              weightId: Number(item.weightId) || 0,
              lengthMeter: Number(item.lengthMeter) || null,
            }))
          }
        },
        include: { lineItems: true }
      });

      // Unlink old production entries first
      await tx.productionEntry.updateMany({
        where: { salesOrderId: orderId },
        data: { salesOrderId: null, status: 'staged' } // Revert to staged
      });

      if (productionEntryIds && productionEntryIds.length > 0) {
        await tx.productionEntry.updateMany({
          where: { id: { in: productionEntryIds } },
          data: {
            salesOrderId: orderId,
            status: 'pre-sale'
          }
        });
      }

      return order;
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order: ", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
