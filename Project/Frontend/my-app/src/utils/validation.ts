// Comprehensive validation utilities for admin dashboard

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  value: any;
  rules: string[];
  customMessage?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mobile number validation regex (10-15 digits)
const MOBILE_REGEX = /^\d{10,15}$/;

// Password validation regex (min 8 chars, at least 1 letter, 1 number)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

// Price validation regex (positive numbers with up to 2 decimal places)
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;

// Name validation regex (letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s\-']+$/;

export class Validator {
  
  // Validate individual field
  static validateField(field: string, value: any, rules: string[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const error = this.applyRule(field, value, rule);
      if (error) {
        errors.push(error);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Validate multiple fields
  static validateForm(validationRules: ValidationRule[]): ValidationResult {
    const allErrors: string[] = [];
    
    for (const rule of validationRules) {
      const result = this.validateField(rule.field, rule.value, rule.rules);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
  
  // Apply individual validation rule
  private static applyRule(field: string, value: any, rule: string): string | null {
    const fieldName = this.formatFieldName(field);
    
    switch (rule) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return `${fieldName} is required`;
        }
        break;
        
      case 'email':
        if (value && !EMAIL_REGEX.test(value)) {
          return `${fieldName} must be a valid email address`;
        }
        break;
        
      case 'mobile':
        if (value && !MOBILE_REGEX.test(value.toString())) {
          return `${fieldName} must be a valid mobile number (10-15 digits)`;
        }
        break;
        
      case 'indianMobile':
        if (value && !/^[6-9]\d{9}$/.test(value.toString())) {
          return `${fieldName} must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9`;
        }
        break;
        
      case 'password':
        if (value && !PASSWORD_REGEX.test(value)) {
          return `${fieldName} must be at least 8 characters with letters and numbers`;
        }
        break;
        
      case 'price':
        if (value && !PRICE_REGEX.test(value.toString())) {
          return `${fieldName} must be a valid price (positive number)`;
        }
        break;
        
      case 'name':
        if (value && !NAME_REGEX.test(value)) {
          return `${fieldName} must contain only letters, spaces, hyphens, and apostrophes`;
        }
        break;
        
      case 'minLength:3':
        if (value && value.length < 3) {
          return `${fieldName} must be at least 3 characters long`;
        }
        break;
        
      case 'minLength:5':
        if (value && value.length < 5) {
          return `${fieldName} must be at least 5 characters long`;
        }
        break;
        
      case 'minLength:10':
        if (value && value.length < 10) {
          return `${fieldName} must be at least 10 characters long`;
        }
        break;
        
      case 'maxLength:50':
        if (value && value.length > 50) {
          return `${fieldName} must be no more than 50 characters long`;
        }
        break;
        
      case 'maxLength:100':
        if (value && value.length > 100) {
          return `${fieldName} must be no more than 100 characters long`;
        }
        break;
        
      case 'maxLength:255':
        if (value && value.length > 255) {
          return `${fieldName} must be no more than 255 characters long`;
        }
        break;
        
      case 'maxLength:500':
        if (value && value.length > 500) {
          return `${fieldName} must be no more than 500 characters long`;
        }
        break;
        
      case 'positive':
        if (value && (isNaN(value) || parseFloat(value) <= 0)) {
          return `${fieldName} must be a positive number`;
        }
        break;
        
      case 'numeric':
        if (value && isNaN(value)) {
          return `${fieldName} must be a number`;
        }
        break;
        
      case 'alphanumeric':
        if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
          return `${fieldName} must contain only letters and numbers`;
        }
        break;
        
      case 'noSpecialChars':
        if (value && /[<>\"'%;()&+]/.test(value)) {
          return `${fieldName} contains invalid characters`;
        }
        break;
        
      default:
        // Handle custom length rules
        if (rule.startsWith('minLength:')) {
          const minLength = parseInt(rule.split(':')[1]);
          if (value && value.length < minLength) {
            return `${fieldName} must be at least ${minLength} characters long`;
          }
        } else if (rule.startsWith('maxLength:')) {
          const maxLength = parseInt(rule.split(':')[1]);
          if (value && value.length > maxLength) {
            return `${fieldName} must be no more than ${maxLength} characters long`;
          }
        }
        break;
    }
    
    return null;
  }
  
  // Format field name for display
  private static formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Specific validation functions for common use cases
export const ValidationHelpers = {
  
  // Validate agent signup form
  validateAgentSignup: (formData: {
    name: string;
    email: string;
    mobile_No: string;
    address: string;
    password: string;
    confirmPassword: string;
  }): ValidationResult => {
    const rules: ValidationRule[] = [
      { field: 'name', value: formData.name, rules: ['required', 'name', 'minLength:3', 'maxLength:50'] },
      { field: 'email', value: formData.email, rules: ['required', 'email', 'maxLength:100'] },
      { field: 'mobile_No', value: formData.mobile_No, rules: ['required', 'mobile'] },
      { field: 'address', value: formData.address, rules: ['required', 'minLength:5', 'maxLength:255'] },
      { field: 'password', value: formData.password, rules: ['required', 'password'] },
    ];
    
    const result = Validator.validateForm(rules);
    
    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      result.errors.push('Password and confirm password do not match');
      result.isValid = false;
    }
    
    return result;
  },

  // Validate login form
  validateLogin: (formData: {
    mobile: string;
    password: string;
    role: string;
  }): ValidationResult => {
    const rules: ValidationRule[] = [
      { field: 'mobile', value: formData.mobile, rules: ['required', 'mobile'] },
      { field: 'password', value: formData.password, rules: ['required'] },
      { field: 'role', value: formData.role, rules: ['required'] },
    ];
    
    return Validator.validateForm(rules);
  },

  // Validate scrap request form
  validateScrapRequest: (formData: {
    name: string;
    mobile: string;
    email: string;
    address: string;
    pickupDate: string;
    timeSlot: string;
    description: string;
  }): ValidationResult => {
    const rules: ValidationRule[] = [
      { field: 'name', value: formData.name, rules: ['required', 'name', 'minLength:3', 'maxLength:50'] },
      { field: 'mobile', value: formData.mobile, rules: ['required', 'mobile'] },
      { field: 'email', value: formData.email, rules: ['required', 'email', 'maxLength:100'] },
      { field: 'address', value: formData.address, rules: ['required', 'minLength:5', 'maxLength:255'] },
      { field: 'pickupDate', value: formData.pickupDate, rules: ['required'] },
      { field: 'timeSlot', value: formData.timeSlot, rules: ['required'] },
      { field: 'description', value: formData.description, rules: ['required', 'minLength:10', 'maxLength:500'] },
    ];
    
    const result = Validator.validateForm(rules);
    
    // Validate pickup date is not in the past
    if (formData.pickupDate) {
      const dateValidation = this.validateDate(formData.pickupDate);
      if (!dateValidation.isValid) {
        result.errors.push(...dateValidation.errors);
        result.isValid = false;
      }
    }
    
    return result;
  },

  // Validate scrap collection form
  validateScrapCollection: (formData: {
    customerName: string;
    customerEmail: string;
    customerMobile: string;
    address: string;
    scrapItems: any[];
  }): ValidationResult => {
    const rules: ValidationRule[] = [
      { field: 'customerName', value: formData.customerName, rules: ['required', 'name', 'minLength:3', 'maxLength:50'] },
      { field: 'customerEmail', value: formData.customerEmail, rules: ['required', 'email', 'maxLength:100'] },
      { field: 'customerMobile', value: formData.customerMobile, rules: ['required', 'indianMobile'] },
      { field: 'address', value: formData.address, rules: ['required', 'minLength:5', 'maxLength:255'] },
    ];
    
    const result = Validator.validateForm(rules);
    
    // Validate scrap items
    if (!formData.scrapItems || formData.scrapItems.length === 0) {
      result.errors.push('At least one scrap item is required');
      result.isValid = false;
    } else {
      formData.scrapItems.forEach((item, index) => {
        if (!item.category || !item.type || !item.weight) {
          result.errors.push(`Scrap item ${index + 1}: Category, type, and weight are required`);
          result.isValid = false;
        }
        if (item.weight && (isNaN(item.weight) || parseFloat(item.weight) <= 0)) {
          result.errors.push(`Scrap item ${index + 1}: Weight must be a positive number`);
          result.isValid = false;
        }
      });
    }
    
    return result;
  },
  
  // Validate scrap details form
  validateScrapDetails: (formData: {
    category: string;
    type: string;
    price: string | number;
  }): ValidationResult => {
    const rules: ValidationRule[] = [
      { field: 'category', value: formData.category, rules: ['required', 'minLength:3', 'maxLength:50', 'noSpecialChars'] },
      { field: 'type', value: formData.type, rules: ['required', 'minLength:3', 'maxLength:50', 'noSpecialChars'] },
      { field: 'price', value: formData.price, rules: ['required', 'price', 'positive'] },
    ];
    
    return Validator.validateForm(rules);
  },
  
  // Validate search input
  validateSearch: (searchQuery: string): ValidationResult => {
    const rules: ValidationRule[] = [
      { field: 'search', value: searchQuery, rules: ['maxLength:100', 'noSpecialChars'] },
    ];
    
    return Validator.validateForm(rules);
  },
  
  // Validate admin access
  validateAdminAccess: (user: any): ValidationResult => {
    if (!user) {
      return {
        isValid: false,
        errors: ['User not authenticated']
      };
    }
    
    if (!user.role || user.role !== 'admin') {
      return {
        isValid: false,
        errors: ['Access denied. Admin privileges required.']
      };
    }
    
    return {
      isValid: true,
      errors: []
    };
  },
  
  // Validate ID parameter
  validateId: (id: any): ValidationResult => {
    const rules: ValidationRule[] = [
      { field: 'id', value: id, rules: ['required', 'numeric', 'positive'] },
    ];
    
    return Validator.validateForm(rules);
  },
  
  // Validate date input
  validateDate: (date: string): ValidationResult => {
    if (!date) {
      return {
        isValid: false,
        errors: ['Date is required']
      };
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return {
        isValid: false,
        errors: ['Invalid date format']
      };
    }
    
    // Check if date is not in the past (for pickup dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
      return {
        isValid: false,
        errors: ['Date cannot be in the past']
      };
    }
    
    return {
      isValid: true,
      errors: []
    };
  }
};

// Real-time validation hook for React components
export const useValidation = () => {
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  
  const validateField = (field: string, value: any, rules: string[]) => {
    const result = Validator.validateField(field, value, rules);
    setErrors(prev => ({
      ...prev,
      [field]: result.errors
    }));
    return result.isValid;
  };
  
  const clearErrors = (field?: string) => {
    if (field) {
      setErrors(prev => ({
        ...prev,
        [field]: []
      }));
    } else {
      setErrors({});
    }
  };
  
  const hasErrors = (field?: string) => {
    if (field) {
      return errors[field] && errors[field].length > 0;
    }
    return Object.values(errors).some(fieldErrors => fieldErrors.length > 0);
  };
  
  const getErrors = (field?: string) => {
    if (field) {
      return errors[field] || [];
    }
    return Object.values(errors).flat();
  };
  
  return {
    errors,
    validateField,
    clearErrors,
    hasErrors,
    getErrors
  };
};

export default Validator;