/**
 * MoneyMe Loan App — Form Validation (Step 1: Personal Details)
 * Real-time inline validation on blur, enables Next when all valid
 */

'use strict';

/**
 * Validation rules for Step 1 fields
 */
const step1Rules = {
  firstName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s'-]+$/,
    messages: {
      required: 'First name is required',
      minLength: 'First name must be at least 2 characters',
      pattern: 'First name can only contain letters, spaces, hyphens and apostrophes',
    },
  },
  lastName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s'-]+$/,
    messages: {
      required: 'Last name is required',
      minLength: 'Last name must be at least 2 characters',
      pattern: 'Last name can only contain letters, spaces, hyphens and apostrophes',
    },
  },
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    messages: {
      required: 'Email address is required',
      pattern: 'Please enter a valid email address',
    },
  },
  mobile: {
    required: true,
    pattern: /^04\d{2}\s?\d{3}\s?\d{3}$/,
    messages: {
      required: 'Mobile number is required',
      pattern: 'Please enter a valid Australian mobile (04XX XXX XXX)',
    },
  },
  dob: {
    required: true,
    pattern: /^\d{2}\/\d{2}\/\d{4}$/,
    custom: validateAge,
    messages: {
      required: 'Date of birth is required',
      pattern: 'Please enter date as DD/MM/YYYY',
      custom: 'You must be at least 18 years old',
    },
  },
};

/**
 * Validate that the person is at least 18 years old
 * @param {string} dobStr - Date string in DD/MM/YYYY format
 * @returns {boolean} True if 18+
 */
function validateAge(dobStr) {
  const parts = dobStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const dob = new Date(year, month, day);

  // Check for invalid date
  if (dob.getDate() !== day || dob.getMonth() !== month || dob.getFullYear() !== year) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 18;
}

/**
 * Validate a single field against its rules
 * @param {string} fieldName - Field name
 * @param {string} value - Field value (already sanitised)
 * @returns {{ valid: boolean, message: string }}
 */
function validateField(fieldName, value) {
  const rules = step1Rules[fieldName];
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

  if (rules.custom && !rules.custom(trimmed)) {
    return { valid: false, message: rules.messages.custom };
  }

  return { valid: true, message: '' };
}

/**
 * Show validation state on a field
 * @param {HTMLInputElement} input - The input element
 * @param {{ valid: boolean, message: string }} result - Validation result
 */
function showFieldState(input, result) {
  const errorEl = document.getElementById(`${input.id}-error`);

  input.classList.remove('form-field__input--valid', 'form-field__input--invalid');

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
 * Check if all Step 1 fields are valid and enable/disable Next button
 */
function checkStep1Validity() {
  const nextBtn = document.getElementById('step1-next');
  if (!nextBtn) return;

  const allValid = Object.keys(step1Rules).every((fieldName) => {
    const input = document.getElementById(fieldName);
    if (!input) return false;
    const result = validateField(fieldName, sanitiseInput(input.value));
    return result.valid;
  });

  nextBtn.disabled = !allValid;
}

/**
 * Navigate to a specific form step
 * @param {number} stepNum - Target step (1-4)
 */
function goToStep(stepNum) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach((step) => {
    step.classList.add('form-step--hidden');
  });

  // Show target step
  const target = document.getElementById(`step-${stepNum}`);
  if (target) {
    target.classList.remove('form-step--hidden');
  }

  // Update step indicator
  document.querySelectorAll('.step-indicator__step').forEach((step) => {
    const num = parseInt(step.dataset.step, 10);
    step.classList.remove('step-indicator__step--active', 'step-indicator__step--completed');
    step.removeAttribute('aria-current');

    if (num === stepNum) {
      step.classList.add('step-indicator__step--active');
      step.setAttribute('aria-current', 'step');
    } else if (num < stepNum) {
      step.classList.add('step-indicator__step--completed');
    }
  });

  setCurrentStep(stepNum);
}

/**
 * Restore Step 1 fields from sessionStorage
 */
function restoreStep1() {
  const data = getStepData('personal');
  Object.keys(step1Rules).forEach((fieldName) => {
    const input = document.getElementById(fieldName);
    if (input && data[fieldName]) {
      input.value = data[fieldName];
    }
  });
  checkStep1Validity();
}

/**
 * Initialise Step 1 form validation
 */
function initStep1Validation() {
  const form = document.getElementById('step-1');
  if (!form) return;

  // Attach blur validation to each field
  Object.keys(step1Rules).forEach((fieldName) => {
    const input = document.getElementById(fieldName);
    if (!input) return;

    input.addEventListener('blur', () => {
      const sanitised = sanitiseInput(input.value);
      const result = validateField(fieldName, sanitised);
      showFieldState(input, result);
      checkStep1Validity();
    });

    input.addEventListener('input', () => {
      checkStep1Validity();
    });
  });

  // Handle form submit (Next button)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect and save data
    const stepData = {};
    Object.keys(step1Rules).forEach((fieldName) => {
      const input = document.getElementById(fieldName);
      if (input) {
        stepData[fieldName] = input.value;
      }
    });

    saveStepData('personal', stepData);
    goToStep(2);
  });

  // Restore saved data
  restoreStep1();

  // Restore to correct step if mid-application
  const currentStep = getCurrentStep();
  if (currentStep > 1) {
    goToStep(currentStep);
  }
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initStep1Validation();
});
