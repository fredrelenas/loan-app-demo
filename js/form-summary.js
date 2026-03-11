/**
 * MoneyMe Loan App — Form Step 4: Review & Submit
 * Displays summary of all steps, handles submission
 */

'use strict';

/**
 * Generate a random 8-character reference number
 * @returns {string} Reference number (uppercase alphanumeric)
 */
function generateRefNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 8; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[arr[i] % chars.length];
  }
  return result;
}

/**
 * Format a currency value for display
 * @param {string} value - Raw numeric string
 * @returns {string} Formatted AUD string
 */
function formatSummaryCurrency(value) {
  const num = parseFloat(String(value).replace(/[$,\s]/g, ''));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Populate the summary from sessionStorage
 */
function populateSummary() {
  const personal = getStepData('personal');
  const employment = getStepData('employment');
  const loan = getStepData('loan');

  // Personal
  const nameEl = document.getElementById('sum-name');
  const emailEl = document.getElementById('sum-email');
  const mobileEl = document.getElementById('sum-mobile');
  const dobEl = document.getElementById('sum-dob');

  if (nameEl) nameEl.textContent = `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
  if (emailEl) emailEl.textContent = personal.email || '';
  if (mobileEl) mobileEl.textContent = personal.mobile || '';
  if (dobEl) dobEl.textContent = personal.dob || '';

  // Employment
  const empEl = document.getElementById('sum-employment');
  const employerEl = document.getElementById('sum-employer');
  const incomeEl = document.getElementById('sum-income');
  const expensesEl = document.getElementById('sum-expenses');

  if (empEl) empEl.textContent = employment.employmentStatus || '';
  if (employerEl) employerEl.textContent = employment.employerName || '';
  if (incomeEl) incomeEl.textContent = formatSummaryCurrency(employment.annualIncome || '0');
  if (expensesEl) expensesEl.textContent = formatSummaryCurrency(employment.monthlyExpenses || '0');

  // Loan
  const amountEl = document.getElementById('sum-amount');
  const termEl = document.getElementById('sum-term');
  const purposeEl = document.getElementById('sum-purpose');
  const repaymentEl = document.getElementById('sum-repayment');

  if (amountEl) amountEl.textContent = formatSummaryCurrency(loan.loanAmount || '0');
  if (termEl) termEl.textContent = `${loan.loanTerm || '24'} months`;
  if (purposeEl) purposeEl.textContent = loan.loanPurpose || '';

  // Calculate repayment for summary
  if (repaymentEl) {
    const principal = parseFloat(String(loan.loanAmount || '0').replace(/[$,\s]/g, ''));
    const months = parseInt(loan.loanTerm || '24', 10);
    const rate = 0.0899;

    if (!isNaN(principal) && principal > 0) {
      const monthlyRate = rate / 12;
      const factor = Math.pow(1 + monthlyRate, months);
      const monthly = (principal * monthlyRate * factor) / (factor - 1);
      repaymentEl.textContent = formatSummaryCurrency(Math.round(monthly)) + '/month';
    } else {
      repaymentEl.textContent = '$0/month';
    }
  }
}

/**
 * Check if both consent checkboxes are checked
 */
function checkStep4Validity() {
  const submitBtn = document.getElementById('step4-submit');
  const termsBox = document.getElementById('termsConsent');
  const privacyBox = document.getElementById('privacyConsent');

  if (!submitBtn) return;
  submitBtn.disabled = !(termsBox && termsBox.checked && privacyBox && privacyBox.checked);
}

/**
 * Show the success modal
 * @param {string} refNumber - Application reference number
 */
function showSuccessModal(refNumber) {
  const modal = document.getElementById('success-modal');
  const refEl = document.getElementById('modal-ref');

  if (refEl) refEl.textContent = refNumber;
  if (modal) modal.classList.add('modal-overlay--visible');
}

/**
 * Initialise Step 4
 */
function initStep4() {
  const form = document.getElementById('step-4');
  if (!form) return;

  // Consent checkboxes
  const termsBox = document.getElementById('termsConsent');
  const privacyBox = document.getElementById('privacyConsent');

  if (termsBox) termsBox.addEventListener('change', checkStep4Validity);
  if (privacyBox) privacyBox.addEventListener('change', checkStep4Validity);

  // Edit buttons — jump back to specific step
  document.querySelectorAll('.summary-section__edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const stepNum = parseInt(btn.dataset.editStep, 10);
      if (stepNum >= 1 && stepNum <= 3) {
        goToStep(stepNum);
      }
    });
  });

  // Back button
  const backBtn = document.getElementById('step4-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => goToStep(3));
  }

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const refNumber = generateRefNumber();
    showSuccessModal(refNumber);
    clearFormData();
  });

  // Populate summary whenever Step 4 becomes visible
  const observer = new MutationObserver(() => {
    if (!form.classList.contains('form-step--hidden')) {
      populateSummary();
      checkStep4Validity();
    }
  });
  observer.observe(form, { attributes: true, attributeFilter: ['class'] });
}

document.addEventListener('DOMContentLoaded', () => {
  initStep4();
});
