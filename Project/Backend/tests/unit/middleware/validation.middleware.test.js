import {
  validateEmail,
  validateMobile,
  validatePassword,
  validateDate,
  validateFutureDate,
  validatePrice,
  sanitizeString,
  validateRequired
} from '../../../middleware/validation.middleware.js';

describe('Validation Middleware', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validateMobile', () => {
    it('should validate correct mobile numbers', () => {
      expect(validateMobile('1234567890')).toBe(true);
      expect(validateMobile('12345678901234')).toBe(true);
      expect(validateMobile(1234567890)).toBe(true);
    });

    it('should reject invalid mobile numbers', () => {
      expect(validateMobile('123')).toBe(false);
      expect(validateMobile('12345678901234567')).toBe(false);
      expect(validateMobile('abcdefghij')).toBe(false);
      expect(validateMobile('123-456-7890')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('PasswordABC');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });

    it('should reject null or undefined passwords', () => {
      expect(validatePassword(null).valid).toBe(false);
      expect(validatePassword(undefined).valid).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should validate correct date formats', () => {
      expect(validateDate('2024-01-15')).toBe(true);
      expect(validateDate('2024-12-31')).toBe(true);
      expect(validateDate(new Date().toISOString())).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(validateDate('invalid')).toBe(false);
      expect(validateDate('2024-13-01')).toBe(false);
      expect(validateDate('')).toBe(false);
    });
  });

  describe('validateFutureDate', () => {
    it('should validate future dates within range', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = validateFutureDate(tomorrow.toISOString());
      expect(result.valid).toBe(true);
    });

    it('should reject past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = validateFutureDate(yesterday.toISOString());
      expect(result.valid).toBe(false);
      expect(result.message).toContain('past');
    });

    it('should reject dates too far in the future', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 100);
      const result = validateFutureDate(farFuture.toISOString(), 30);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('30 days');
    });

    it('should reject invalid date formats', () => {
      const result = validateFutureDate('invalid-date');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid date format');
    });
  });

  describe('validatePrice', () => {
    it('should validate positive numbers', () => {
      expect(validatePrice(10.5).valid).toBe(true);
      expect(validatePrice('25.99').valid).toBe(true);
      expect(validatePrice(0).valid).toBe(true);
    });

    it('should reject negative numbers', () => {
      const result = validatePrice(-10);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('positive number');
    });

    it('should reject non-numeric values', () => {
      const result = validatePrice('abc');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('positive number');
    });

    it('should return parsed numeric value', () => {
      const result = validatePrice('42.50');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(42.50);
    });
  });

  describe('sanitizeString', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeString("It's a test")).toBe('It&#x27;s a test');
      expect(sanitizeString('A & B')).toBe('A & B');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(undefined);
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('validateRequired', () => {
    it('should pass when all required fields are present', () => {
      const data = { name: 'John', email: 'john@example.com', age: 25 };
      const result = validateRequired(['name', 'email', 'age'], data);
      expect(result.valid).toBe(true);
    });

    it('should fail when required fields are missing', () => {
      const data = { name: 'John' };
      const result = validateRequired(['name', 'email', 'age'], data);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('email');
      expect(result.message).toContain('age');
    });

    it('should allow zero as a valid value', () => {
      const data = { name: 'John', count: 0 };
      const result = validateRequired(['name', 'count'], data);
      expect(result.valid).toBe(true);
    });

    it('should reject empty strings', () => {
      const data = { name: '', email: 'john@example.com' };
      const result = validateRequired(['name', 'email'], data);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('name');
    });
  });
});
