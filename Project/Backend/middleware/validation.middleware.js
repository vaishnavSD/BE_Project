// Input validation middleware

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Mobile number validation (10-15 digits)
export const validateMobile = (mobile) => {
  return /^\d{10,15}$/.test(mobile.toString());
};

// Password strength validation
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

// Date validation
export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Future date validation
export const validateFutureDate = (dateString, maxDays = 30) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(date.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }
  
  if (date < today) {
    return { valid: false, message: "Date cannot be in the past" };
  }
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);
  if (date > maxDate) {
    return { valid: false, message: `Date cannot be more than ${maxDays} days from today` };
  }
  
  return { valid: true };
};

// Price validation
export const validatePrice = (price) => {
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return { valid: false, message: "Price must be a valid positive number" };
  }
  return { valid: true, value: numericPrice };
};

// Sanitize string input (prevent XSS)
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate required fields
export const validateRequired = (fields, data) => {
  const missing = [];
  for (const field of fields) {
    if (!data[field] && data[field] !== 0) {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    return { valid: false, message: `Missing required fields: ${missing.join(', ')}` };
  }
  return { valid: true };
};
