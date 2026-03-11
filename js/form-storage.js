/**
 * MoneyMe Loan App — Form Storage
 * Manages form data in sessionStorage only (never localStorage)
 * All values are sanitised before storage
 */

'use strict';

const STORAGE_KEY = 'moneyme_application';

/**
 * Sanitise a string — strip HTML tags and trim whitespace
 * @param {string} str - Raw input string
 * @returns {string} Sanitised string
 */
function sanitiseInput(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.trim();
}

/**
 * Get the full application data object from sessionStorage
 * @returns {Object} Application data
 */
function getFormData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save the full application data object to sessionStorage
 * @param {Object} data - Application data
 */
function saveFormData(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Save a specific step's data (sanitised)
 * @param {string} stepKey - Step identifier (e.g. 'personal', 'employment')
 * @param {Object} stepData - Key-value pairs for the step
 */
function saveStepData(stepKey, stepData) {
  const data = getFormData();
  const sanitised = {};
  for (const [key, value] of Object.entries(stepData)) {
    sanitised[key] = sanitiseInput(String(value));
  }
  data[stepKey] = sanitised;
  saveFormData(data);
}

/**
 * Get a specific step's data
 * @param {string} stepKey - Step identifier
 * @returns {Object} Step data or empty object
 */
function getStepData(stepKey) {
  const data = getFormData();
  return data[stepKey] || {};
}

/**
 * Clear all application data from sessionStorage
 */
function clearFormData() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Get the current step number from sessionStorage
 * @returns {number} Current step (1-4)
 */
function getCurrentStep() {
  const data = getFormData();
  return data._currentStep || 1;
}

/**
 * Save the current step number
 * @param {number} step - Step number (1-4)
 */
function setCurrentStep(step) {
  const data = getFormData();
  data._currentStep = step;
  saveFormData(data);
}
