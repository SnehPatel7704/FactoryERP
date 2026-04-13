/**
 * SKU Generator Utility
 * Generates unique, scannable SKU codes for production entries
 * Format: SKU-YYYYMMDD-HHMMSS-RANDOM
 * Example: SKU-20260331-142530-A7K9X
 */

const generateSKU = () => {
  // Get current date and time
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Generate random alphanumeric string (5 characters)
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase().padEnd(5, 'X');
  
  const sku = `SKU-${year}${month}${date}-${hours}${minutes}${seconds}-${randomPart}`;
  
  return sku;
};

/**
 * Generate SKU with custom prefix (optional)
 * @param {string} prefix - Custom prefix (default: 'SKU')
 * @returns {string} Generated SKU
 */
const generateSKUWithPrefix = (prefix = 'SKU') => {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase().padEnd(5, 'X');
  
  const sku = `${prefix}-${year}${month}${date}-${hours}${minutes}${seconds}-${randomPart}`;
  
  return sku;
};

export {
  generateSKU,
  generateSKUWithPrefix
};
