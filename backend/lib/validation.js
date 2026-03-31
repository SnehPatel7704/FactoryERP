// Simple validation utility
export const validateRequired = (data, fields) => {
  const missing = fields.filter(field => !data[field]);
  return missing.length > 0 ? missing : null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const handleValidationError = (res, missing) => {
  res.status(400).json({ 
    success: false, 
    error: `Missing required fields: ${missing.join(', ')}` 
  });
};
