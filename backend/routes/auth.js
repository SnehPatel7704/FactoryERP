import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { validateRequired, validateEmail, handleValidationError } from '../lib/validation.js';
import { simpleRateLimit } from '../middleware/rateLimit.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Rate limit login attempts (100 requests per 15 minutes)
const loginRateLimit = simpleRateLimit(15 * 60 * 1000, 100);

router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    const missing = validateRequired({ email, password }, ['email', 'password']);
    if (missing) {
      return handleValidationError(res, missing);
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Lookup user in MySQL
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify Password against hash
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Return User Meta & Token
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Verify token endpoint for persistent sessions
router.post('/verify', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ valid: false });

  try {
    const bearerToken = token.split(' ')[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true });
  } catch (err) {
    return res.status(401).json({ valid: false });
  }
});

// Logout endpoint - Note: stateless JWTs can't be revoked on server
// In production, implement token blacklist or refresh token rotation
router.post('/logout', verifyToken, (req, res) => {
  // Stateless JWT logout - just clear client-side token
  try {
    return res.status(200).json({ 
      message: 'Logout successful. Please clear your token from localStorage.' 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
