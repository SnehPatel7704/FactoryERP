import express from 'express';
import bcrypt from 'bcryptjs';
import { validateRequired, handleValidationError } from '../lib/validation.js';

const router = express.Router();

// Get all master data (for populating select form dropdowns)
router.get('/all', async (req, res) => {
  try {
    const items = await req.prisma.item.findMany();
    const colors = await req.prisma.color.findMany();
    const sizes = await req.prisma.size.findMany();
    const qualities = await req.prisma.quality.findMany();

    res.json({ items, colors, sizes, qualities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Colors
router.get('/colors', async (req, res) => {
  try {
    const colors = await req.prisma.color.findMany();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/colors', async (req, res) => {
  try {
    const { name, hexCode } = req.body;
    const missing = validateRequired({ name }, ['name']);
    if (missing) return handleValidationError(res, missing);
    
    const newColor = await req.prisma.color.create({
      data: { name, hexCode }
    });
    res.json(newColor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create color' });
  }
});

router.put('/colors/:id', async (req, res) => {
  try {
    const { name, hexCode } = req.body;
    const updatedColor = await req.prisma.color.update({
      where: { id: req.params.id },
      data: { name, hexCode }
    });
    res.json(updatedColor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sizes
router.get('/sizes', async (req, res) => {
  try {
    const sizes = await req.prisma.size.findMany();
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sizes', async (req, res) => {
  try {
    const { value } = req.body;
    const missing = validateRequired({ value }, ['value']);
    if (missing) return handleValidationError(res, missing);
    
    const newSize = await req.prisma.size.create({
      data: { value }
    });
    res.json(newSize);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create size' });
  }
});

router.put('/sizes/:id', async (req, res) => {
  try {
    const { value } = req.body;
    const updatedSize = await req.prisma.size.update({
      where: { id: req.params.id },
      data: { value }
    });
    res.json(updatedSize);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Qualities
router.get('/qualities', async (req, res) => {
  try {
    const qualities = await req.prisma.quality.findMany();
    res.json(qualities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/qualities', async (req, res) => {
  try {
    const { grade } = req.body;
    const missing = validateRequired({ grade }, ['grade']);
    if (missing) return handleValidationError(res, missing);
    
    const newQuality = await req.prisma.quality.create({
      data: { grade }
    });
    res.json(newQuality);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quality' });
  }
});

router.put('/qualities/:id', async (req, res) => {
  try {
    const { grade } = req.body;
    const updatedQuality = await req.prisma.quality.update({
      where: { id: req.params.id },
      data: { grade }
    });
    res.json(updatedQuality);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Items
router.get('/items', async (req, res) => {
  try {
    const items = await req.prisma.item.findMany();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/items', async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const missing = validateRequired({ code, name }, ['code', 'name']);
    if (missing) return handleValidationError(res, missing);
    
    const newItem = await req.prisma.item.create({
      data: { code, name, description }
    });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/items/:id', async (req, res) => {
  try {
    const { code, name } = req.body;
    const updatedItem = await req.prisma.item.update({
      where: { id: req.params.id },
      data: { code, name }
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DELETES ---
router.delete('/colors/:id', async (req, res) => {
  try { await req.prisma.color.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/sizes/:id', async (req, res) => {
  try { await req.prisma.size.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/qualities/:id', async (req, res) => {
  try { await req.prisma.quality.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/items/:id', async (req, res) => {
  try { await req.prisma.item.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// --- WEIGHTS ---
router.get('/weights', async (req, res) => {
  try { res.json(await req.prisma.weightConfig.findMany()); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.post('/weights', async (req, res) => {
  try { 
    res.json(await req.prisma.weightConfig.create({ 
      data: { 
        value: parseFloat(req.body.value),
        type: req.body.type || "Standard"
      } 
    })); 
  }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/weights/:id', async (req, res) => {
  try { await req.prisma.weightConfig.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// --- METERS ---
router.get('/meters', async (req, res) => {
  try { res.json(await req.prisma.meterConfig.findMany()); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.post('/meters', async (req, res) => {
  try { 
    res.json(await req.prisma.meterConfig.create({ 
      data: { 
        value: parseFloat(req.body.value),
        type: req.body.type || "Industrial"
      } 
    })); 
  }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/meters/:id', async (req, res) => {
  try { await req.prisma.meterConfig.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await req.prisma.user.create({
      data: { email, password: hashedPassword, role: role || 'operator' }
    });
    res.json({ id: newUser.id, email: newUser.email, role: newUser.role });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try { await req.prisma.user.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

export default router;
