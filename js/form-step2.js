/**
 * MoneyMe Loan App — Form Step 2: Employment & Income
 * Validates employment status, employer name, income, and expenses
 */

'use strict';

/**
 * Validation rules for Step 2 fields
 */
const step2Rules = {
  employmentStatus: {
    required: true,
    messages: {
      required: 'Please select your employment status',
    },
  },
  employerName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z0-9\s&.,'-]+$/,
    messages: {
      required: 'Employer name is required',
      minLength: 'Employer name must be at least 2 characters',
      pattern: 'Please enter a valid employer name',
    },
  },
  annualIncome: {
    required: true,
    isNumeric: true,
    min: 1000,
    messages: {
      required: 'Annual income is required',
      isNumeric: 'Please enter a valid number',
      min: 'Annual income must be at least $1,000',
    },
  },
  monthlyExpenses: {
    required: true,
    isNumeric: true,
    min: 0,
    messages: {
      required: 'Monthly expenses is required',
      isNumeric: 'Please enter a valid number',
      min: 'Monthly expenses cannot be negative',
    },
  },
};

/**
 * Parse a numeric string (strip currency formatting)
 * @param {string} str - Input string
 * @returns {number} Parsed number or NaN
 */
function parseNumericInput(str) {
  if (typeof str !== 'string') return NaN;
  const cleaned = str.replace(/[$,\s]/g, '');
  return parseFloat(cleaned);
}

/**
 * Format a number as AUD currency display
 * @param {number} amount - The number to format
 * @returns {string} Formatted string
 */
function formatAUD(amount) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate a Step 2 field
 * @param {string} fieldName - Field name
 * @param {string} value - Field value
 * @returns {{ valid: boolean, message: string }}
 */
function validateStep2Field(fieldName, value) {
  const rules = step2Rules[fieldName];
  if (!rules) return { valid: true, message: '' };

  const trimmed = value.trim();

  if (rules.required && trimmed.length === 0) {
    return { valid: false, message: rules.messages.required };
  }

  if (rules.minLength && trimmed.length < rules.minLength) {
    return { valid: false, message: rules.messages.minLength };
  }

  if (rules.pattern && !rules.pattern.test(trimmed)) {
    return { valid: false, message: rules.messages.pattern };
  }

  if (rules.isNumeric) {
    const num = parseNumericInput(trimmed);
    if (isNaN(num)) {
      return { valid: false, message: rules.messages.isNumeric };
    }
    if (rules.min !== undefined && num < rules.min) {
      return { valid: false, message: rules.messages.min };
    }
  }

  return { valid: true, message: '' };
}

/**
 * Show validation state on a Step 2 field
 * @param {HTMLElement} input - The input/select element
 * @param {{ valid: boolean, message: string }} result - Validation result
 */
function showStep2FieldState(input, result) {
  const errorEl = document.getElementById(`${input.id}-error`);
  const cssClass = input.tagName === 'SELECT' ? 'form-field__select' : 'form-field__input';

  input.classList.remove(`${cssClass}--valid`, `${cssClass}--invalid`,
    'form-field__input--valid', 'form-field__input--invalid');

  if (input.value.trim().length === 0) {
    if (errorEl) errorEl.textContent = '';
    return;
  }

  if (result.valid) {
    input.classList.add('form-field__input--valid');
    if (errorEl) errorEl.textContent = '';
  } else {
    input.classList.add('form-field__input--invalid');
    if (errorEl) errorEl.textContent = result.message;
  }
}

/**
 * Check if all Step 2 fields are valid
 */
function checkStep2Validity() {
  const nextBtn = document.getElementById('step2-next');
  if (!nextBtn) return;

  const allValid = Object.keys(step2Rules).every((fieldName) => {
    const input = document.getElementById(fieldName);
    if (!input) return false;
    const result = validateStep2Field(fieldName, sanitiseInput(input.value));
    return result.valid;
  });

  nextBtn.disabled = !allValid;
}

/**
 * Restore Step 2 fields from sessionStorage
 */
function restoreStep2() {
  const data = getStepData('employment');
  Object.keys(step2Rules).forEach((fieldName) => {
    const input = document.getElementById(fieldName);
    if (input && data[fieldName]) {
      input.value = data[fieldName];
    }
  });
  checkStep2Validity();
}

/**
 * Initialise Step 2 form validation
 */
function initStep2Validation() {
  const form = document.getElementById('step-2');
  if (!form) return;

  // Attach validation to each field
  Object.keys(step2Rules).forEach((fieldName) => {
    const input = document.getElementById(fieldName);
    if (!input) return;

    const eventType = input.tagName === 'SELECT' ? 'change' : 'blur';

    input.addEventListener(eventType, () => {
      const sanitised = sanitiseInput(input.value);
      const result = validateStep2Field(fieldName, sanitised);
      showStep2FieldState(input, result);
      checkStep2Validity();
    });

    if (input.tagName !== 'SELECT') {
      input.addEventListener('input', () => {
        checkStep2Validity();
      });
    }
  });

  // Back button
  const backBtn = document.getElementById('step2-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      goToStep(1);
    });
  }

  // Submit (Next)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const stepData = {};
    Object.keys(step2Rules).forEach((fieldName) => {
      const input = document.getElementById(fieldName);
      if (input) {
        stepData[fieldName] = input.value;
      }
    });

    saveStepData('employment', stepData);
    goToStep(3);
  });

  // Restore saved data
  restoreStep2();
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initStep2Validation();
});
