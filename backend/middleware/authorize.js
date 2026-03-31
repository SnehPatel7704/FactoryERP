// Authorization middleware for role-based access control

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireOperatorOrManager = requireRole(['operator', 'manager', 'admin']);
export const requireManager = requireRole(['manager', 'admin']);
