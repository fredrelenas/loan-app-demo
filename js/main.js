/**
 * MoneyMe Loan App — Main JavaScript
 * Handles navigation toggle and general UI interactions
 */

'use strict';

/**
 * Initialise the mobile navigation toggle
 */
function initNavToggle() {
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('navbar__menu--open');
    toggle.classList.toggle('navbar__toggle--active');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is clicked (mobile)
  menu.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('navbar__menu--open');
      toggle.classList.remove('navbar__toggle--active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('navbar__menu--open')) {
      menu.classList.remove('navbar__menu--open');
      toggle.classList.remove('navbar__toggle--active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

/**
 * Sanitise a string by stripping HTML tags and trimming whitespace
 * @param {string} str - The input string
 * @returns {string} The sanitised string
 */
function sanitise(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.trim();
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
});
