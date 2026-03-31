// Simple rate limiting middleware (can be replaced with express-rate-limit)
// Install: npm install express-rate-limit

const requests = new Map();

export const simpleRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const requestTimestamps = requests.get(ip);
    
    // Remove old requests outside the window
    const validRequests = requestTimestamps.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    validRequests.push(now);
    requests.set(ip, validRequests);
    
    next();
  };
};

// Cleanup old IPs periodically (every 30 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requests.entries()) {
    const validRequests = timestamps.filter(time => now - time < 15 * 60 * 1000);
    if (validRequests.length === 0) {
      requests.delete(ip);
    } else {
      requests.set(ip, validRequests);
    }
  }
}, 30 * 60 * 1000);
