/**
 * MoneyMe Loan App — Loan Calculator
 * Calculates monthly repayments using PMT formula
 * Rate: 8.99% p.a. (indicative)
 */

'use strict';

const ANNUAL_RATE = 0.0899;

/**
 * Format a number as AUD currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate monthly repayment using PMT formula
 * PMT = [P × r × (1+r)^n] / [(1+r)^n – 1]
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (decimal)
 * @param {number} months - Loan term in months
 * @returns {{ monthly: number, total: number, interest: number }}
 */
function calculateRepayment(principal, annualRate, months) {
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
 * Update calculator display with current values
 */
function updateCalculator() {
  const amountSlider = document.getElementById('calc-amount');
  const termSelect = document.getElementById('calc-term');
  const amountDisplay = document.getElementById('calc-amount-display');
  const monthlyEl = document.getElementById('calc-monthly');
  const totalEl = document.getElementById('calc-total');
  const interestEl = document.getElementById('calc-interest');
  const applyBtn = document.getElementById('calc-apply-btn');

  if (!amountSlider || !termSelect) return;

  const principal = parseInt(amountSlider.value, 10);
  const months = parseInt(termSelect.value, 10);

  if (amountDisplay) {
    amountDisplay.textContent = formatCurrency(principal);
  }

  const result = calculateRepayment(principal, ANNUAL_RATE, months);

  if (monthlyEl) monthlyEl.textContent = formatCurrency(Math.round(result.monthly));
  if (totalEl) totalEl.textContent = formatCurrency(Math.round(result.total));
  if (interestEl) interestEl.textContent = formatCurrency(Math.round(result.interest));

  // Update apply button link with pre-filled amount
  if (applyBtn) {
    applyBtn.href = `apply.html?amount=${principal}&term=${months}`;
  }
}

/**
 * Initialise calculator event listeners
 */
function initCalculator() {
  const amountSlider = document.getElementById('calc-amount');
  const termSelect = document.getElementById('calc-term');

  if (!amountSlider || !termSelect) return;

  amountSlider.addEventListener('input', updateCalculator);
  termSelect.addEventListener('change', updateCalculator);

  // Initial calculation
  updateCalculator();
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
});
