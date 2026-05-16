import { Validator, ValidationHelpers } from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('Validator.validateField', () => {
    it('should validate required fields', () => {
      const result = Validator.validateField('name', '', ['required']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('should validate email format', () => {
      const validResult = Validator.validateField('email', 'test@example.com', ['email']);
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateField('email', 'invalid-email', ['email']);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Email must be a valid email address');
    });

    it('should validate mobile numbers', () => {
      const validResult = Validator.validateField('mobile', '9876543210', ['mobile']);
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateField('mobile', '123', ['mobile']);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Mobile must be a valid mobile number (10-15 digits)');
    });

    it('should validate Indian mobile numbers', () => {
      const validResult = Validator.validateField('mobile', '9876543210', ['indianMobile']);
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateField('mobile', '1234567890', ['indianMobile']);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Mobile must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9');
    });

    it('should validate passwords', () => {
      const validResult = Validator.validateField('password', 'password123', ['password']);
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateField('password', '123', ['password']);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Password must be at least 8 characters with letters and numbers');
    });

    it('should validate prices', () => {
      const validResult = Validator.validateField('price', '25.50', ['price']);
      expect(validResult.isValid).toBe(true);

      const invalidResult = Validator.validateField('price', '-10', ['price']);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('ValidationHelpers.validateLogin', () => {
    it('should validate complete login form', () => {
      const validData = {
        mobile: '9876543210',
        password: 'password123',
        role: 'user'
      };

      const result = ValidationHelpers.validateLogin(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid login data', () => {
      const invalidData = {
        mobile: '',
        password: '',
        role: ''
      };

      const result = ValidationHelpers.validateLogin(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('ValidationHelpers.validateScrapDetails', () => {
    it('should validate scrap details form', () => {
      const validData = {
        category: 'Paper',
        type: 'Newspaper',
        price: '12.50'
      };

      const result = ValidationHelpers.validateScrapDetails(validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid scrap details', () => {
      const invalidData = {
        category: '',
        type: 'A',
        price: '-5'
      };

      const result = ValidationHelpers.validateScrapDetails(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});