import jwt from 'jsonwebtoken';

// Warn if JWT_SECRET is weak or not set
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 20) {
  console.warn('⚠️  WARNING: JWT_SECRET is weak or not set. Use a strong random secret in production!');
}

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'A token is required for authentication' });
  }

  try {
    const bearerToken = token.split(' ')[1]; // Format: Bearer <token>
    if (!bearerToken) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired Token' });
  }
  return next();
};

export default verifyToken;
