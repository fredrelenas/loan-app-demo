/**
 * MoneyMe Loan App — Form Step 3: Loan Details
 * Loan amount, term, purpose with live repayment estimate
 * Reuses calculateRepayment from calculator.js
 */

'use strict';

const STEP3_ANNUAL_RATE = 0.0899;

/**
 * Calculate monthly repayment (standalone for apply page which may not load calculator.js)
 * PMT = [P × r × (1+r)^n] / [(1+r)^n – 1]
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual rate (decimal)
 * @param {number} months - Term in months
 * @returns {{ monthly: number, total: number, interest: number }}
 */
function calcRepayment(principal, annualRate, months) {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) {
    const monthly = principal / months;
    return { monthly, total: principal, interest: 0 };
  }
  const factor = Math.pow(1 + monthlyRate, months);
  const monthly = (principal * monthlyRate * factor) / (factor - 1);
  const total = monthly * months;
  const interest = total - principal;
  return { monthly, total, interest };
}

/**
 * Format number as AUD currency
 * @param {number} amount
 * @returns {string}
 */
function formatStep3Currency(amount) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Update the live repayment estimate display
 */
function updateStep3Estimate() {
  const amountInput = document.getElementById('loanAmount');
  const termRadios = document.querySelectorAll('input[name="loanTerm"]');
  const monthlyEl = document.getElementById('step3-monthly');
  const totalEl = document.getElementById('step3-total');
  const interestEl = document.getElementById('step3-interest');

  if (!amountInput || !monthlyEl) return;

  const amount = parseFloat(amountInput.value.replace(/[$,\s]/g, ''));
  let term = 24;
  termRadios.forEach((r) => { if (r.checked) term = parseInt(r.value, 10); });

  if (isNaN(amount) || amount < 2000) {
    monthlyEl.textContent = '$0';
    totalEl.textContent = '$0';
    interestEl.textContent = '$0';
    return;
  }

  const result = calcRepayment(amount, STEP3_ANNUAL_RATE, term);
  monthlyEl.textContent = formatStep3Currency(Math.round(result.monthly));
  totalEl.textContent = formatStep3Currency(Math.round(result.total));
  interestEl.textContent = formatStep3Currency(Math.round(result.interest));
}

/**
 * Validate Step 3 fields and enable/disable Next
 */
function checkStep3Validity() {
  const nextBtn = document.getElementById('step3-next');
  if (!nextBtn) return;

  const amountInput = document.getElementById('loanAmount');
  const purposeSelect = document.getElementById('loanPurpose');
  const termSelected = document.querySelector('input[name="loanTerm"]:checked');

  const amount = parseFloat((amountInput ? amountInput.value : '').replace(/[$,\s]/g, ''));
  const amountValid = !isNaN(amount) && amount >= 2000 && amount <= 50000;
  const purposeValid = purposeSelect && purposeSelect.value.length > 0;
  const termValid = termSelected !== null;

  // Show amount validation
  if (amountInput) {
    const errorEl = document.getElementById('loanAmount-error');
    amountInput.classList.remove('form-field__input--valid', 'form-field__input--invalid');

    if (amountInput.value.trim().length > 0) {
      if (amountValid) {
        amountInput.classList.add('form-field__input--valid');
        if (errorEl) errorEl.textContent = '';
      } else {
        amountInput.classList.add('form-field__input--invalid');
        if (errorEl) errorEl.textContent = 'Loan amount must be between $2,000 and $50,000';
      }
    } else {
      if (errorEl) errorEl.textContent = '';
    }
  }

  // Show purpose validation
  if (purposeSelect) {
    const errorEl = document.getElementById('loanPurpose-error');
    if (purposeSelect.value.length > 0) {
      if (errorEl) errorEl.textContent = '';
    }
  }

  nextBtn.disabled = !(amountValid && purposeValid && termValid);
}

/**
 * Pre-fill loan amount from URL params (from calculator)
 */
function prefillFromURL() {
  const params = new URLSearchParams(window.location.search);
  const amount = params.get('amount');
  const term = params.get('term');

  if (amount) {
    const amountInput = document.getElementById('loanAmount');
    if (amountInput) amountInput.value = amount;
  }

  if (term) {
    const termRadio = document.getElementById(`term-${term}`);
    if (termRadio) termRadio.checked = true;
  }
}

/**
 * Restore Step 3 from sessionStorage
 */
function restoreStep3() {
  const data = getStepData('loan');
  const amountInput = document.getElementById('loanAmount');
  const purposeSelect = document.getElementById('loanPurpose');

  if (data.loanAmount && amountInput) amountInput.value = data.loanAmount;
  if (data.loanTerm) {
    const radio = document.getElementById(`term-${data.loanTerm}`);
    if (radio) radio.checked = true;
  }
  if (data.loanPurpose && purposeSelect) purposeSelect.value = data.loanPurpose;

  // Pre-fill from URL only if no saved data
  if (!data.loanAmount) {
    prefillFromURL();
  }

  updateStep3Estimate();
  checkStep3Validity();
}

/**
 * Initialise Step 3
 */
function initStep3() {
  const form = document.getElementById('step-3');
  if (!form) return;

  const amountInput = document.getElementById('loanAmount');
  const purposeSelect = document.getElementById('loanPurpose');
  const termRadios = document.querySelectorAll('input[name="loanTerm"]');

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      updateStep3Estimate();
      checkStep3Validity();
    });
    amountInput.addEventListener('blur', () => {
      checkStep3Validity();
    });
  }

  if (purposeSelect) {
    purposeSelect.addEventListener('change', () => {
      checkStep3Validity();
    });
  }

  termRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      updateStep3Estimate();
      checkStep3Validity();
    });
  });

  // Back button
  const backBtn = document.getElementById('step3-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => goToStep(2));
  }

  // Submit (Next)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedTerm = document.querySelector('input[name="loanTerm"]:checked');
    const stepData = {
      loanAmount: amountInput ? amountInput.value : '',
      loanTerm: selectedTerm ? selectedTerm.value : '24',
      loanPurpose: purposeSelect ? purposeSelect.value : '',
    };

    saveStepData('loan', stepData);
    goToStep(4);
  });

  restoreStep3();
}

document.addEventListener('DOMContentLoaded', () => {
  initStep3();
});
