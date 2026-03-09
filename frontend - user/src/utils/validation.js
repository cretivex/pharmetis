/**
 * Reusable validation helpers for forms. Returns error message or null.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{10,15}$/;

export const validation = {
  required(value, fieldName = 'This field') {
    if (value == null || String(value).trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  email(value) {
    if (!value) return 'Email is required';
    if (!EMAIL_REGEX.test(String(value).trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone(value, min = 10, max = 15) {
    if (!value) return 'Phone number is required';
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.length < min || cleaned.length > max) {
      return `Phone must be between ${min} and ${max} digits`;
    }
    return null;
  },

  minLength(value, min, fieldName = 'Field') {
    if (value != null && String(value).length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  numberMin(value, min, fieldName = 'Value') {
    const n = Number(value);
    if (isNaN(n) || n < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  positiveNumber(value, fieldName = 'Value') {
    const n = Number(value);
    if (value === '' || value == null) return `${fieldName} is required`;
    if (isNaN(n) || n <= 0) return `${fieldName} must be greater than 0`;
    return null;
  },

  dateRequired(value, fieldName = 'Date') {
    if (!value || String(value).trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  },
};

/**
 * Run multiple validators on a value. Returns first error or null.
 */
export function validateField(value, rules) {
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : rule;
    if (error) return error;
  }
  return null;
}

/**
 * Validate an object of fields. Returns { isValid: boolean, errors: { [key]: string } }.
 */
export function validateForm(schema) {
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    const value = typeof rules.value !== 'undefined' ? rules.value : rules;
    const validators = Array.isArray(rules.validators) ? rules.validators : [rules];
    const error = validateField(value, validators);
    if (error) errors[field] = error;
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default validation;
