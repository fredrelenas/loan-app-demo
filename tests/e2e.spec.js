// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Landing Page', () => {
  test('loads with navbar and hero visible', async ({ page }) => {
    await page.goto('/');

    // Navbar visible
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.navbar__logo')).toBeVisible();

    // Hero section
    await expect(page.locator('.hero__title')).toBeVisible();
    await expect(page.locator('.hero__title')).toContainText('Fast, Fair Finance');
    await expect(page.locator('.hero__cta')).toBeVisible();

    // Product cards
    await expect(page.locator('.product-card')).toHaveCount(4);

    // Footer
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('navbar links are present', async ({ page }) => {
    await page.goto('/');

    const navLinks = page.locator('.navbar__link');
    await expect(navLinks).toHaveCount(4);
  });
});

test.describe('Loan Calculator', () => {
  test('updates repayment on slider change', async ({ page }) => {
    await page.goto('/');

    const slider = page.locator('#calc-amount');
    const monthlyDisplay = page.locator('#calc-monthly');

    await expect(slider).toBeVisible();

    // Get initial value
    const initialText = await monthlyDisplay.textContent();

    // Change slider to max
    await slider.fill('50000');
    await slider.dispatchEvent('input');

    // Monthly should have changed
    const newText = await monthlyDisplay.textContent();
    expect(newText).not.toBe('$0');
  });

  test('term selector changes repayment', async ({ page }) => {
    await page.goto('/');

    const termSelect = page.locator('#calc-term');
    const monthlyDisplay = page.locator('#calc-monthly');

    // Select 60 months — lower monthly payment
    await termSelect.selectOption('60');
    const longTermPayment = await monthlyDisplay.textContent();

    // Select 12 months — higher monthly payment
    await termSelect.selectOption('12');
    const shortTermPayment = await monthlyDisplay.textContent();

    // Short term should show higher monthly payment
    expect(shortTermPayment).not.toBe(longTermPayment);
  });
});

test.describe('Application Form — Step 1', () => {
  test('validates and advances to step 2', async ({ page }) => {
    await page.goto('/apply.html');

    // Step 1 should be visible
    await expect(page.locator('#step-1')).toBeVisible();

    // Next button should be disabled initially
    const nextBtn = page.locator('#step1-next');
    await expect(nextBtn).toBeDisabled();

    // Fill in valid data
    await page.fill('#firstName', 'John');
    await page.locator('#firstName').blur();

    await page.fill('#lastName', 'Smith');
    await page.locator('#lastName').blur();

    await page.fill('#email', 'john.smith@example.com');
    await page.locator('#email').blur();

    await page.fill('#mobile', '0412 345 678');
    await page.locator('#mobile').blur();

    await page.fill('#dob', '15/03/1990');
    await page.locator('#dob').blur();

    // Next button should be enabled
    await expect(nextBtn).toBeEnabled();

    // Click next
    await nextBtn.click();

    // Step 2 should be visible
    await expect(page.locator('#step-2')).toBeVisible();
    await expect(page.locator('#step-1')).toBeHidden();
  });

  test('shows error for invalid inputs', async ({ page }) => {
    await page.goto('/apply.html');

    // Enter invalid email
    await page.fill('#email', 'not-an-email');
    await page.locator('#email').blur();

    const emailError = page.locator('#email-error');
    await expect(emailError).toContainText('valid email');

    // Enter invalid mobile
    await page.fill('#mobile', '123456');
    await page.locator('#mobile').blur();

    const mobileError = page.locator('#mobile-error');
    await expect(mobileError).toContainText('Australian mobile');
  });
});

test.describe('Application Form — Step 2', () => {
  test('validates and advances to step 3', async ({ page }) => {
    await page.goto('/apply.html');

    // Complete Step 1 first
    await page.fill('#firstName', 'Jane');
    await page.locator('#firstName').blur();
    await page.fill('#lastName', 'Doe');
    await page.locator('#lastName').blur();
    await page.fill('#email', 'jane@example.com');
    await page.locator('#email').blur();
    await page.fill('#mobile', '0412 345 678');
    await page.locator('#mobile').blur();
    await page.fill('#dob', '01/01/1995');
    await page.locator('#dob').blur();
    await page.locator('#step1-next').click();

    // Now on Step 2
    await expect(page.locator('#step-2')).toBeVisible();

    // Next should be disabled
    await expect(page.locator('#step2-next')).toBeDisabled();

    // Fill Step 2
    await page.selectOption('#employmentStatus', 'Full-time');
    await page.fill('#employerName', 'Acme Corp');
    await page.locator('#employerName').blur();
    await page.fill('#annualIncome', '85000');
    await page.locator('#annualIncome').blur();
    await page.fill('#monthlyExpenses', '3000');
    await page.locator('#monthlyExpenses').blur();

    // Next should be enabled
    await expect(page.locator('#step2-next')).toBeEnabled();

    // Advance
    await page.locator('#step2-next').click();
    await expect(page.locator('#step-3')).toBeVisible();
  });
});

test.describe('Application Form — Step 3', () => {
  test('validates and advances to step 4', async ({ page }) => {
    await page.goto('/apply.html');

    // Complete Steps 1 and 2
    await page.fill('#firstName', 'Jane');
    await page.locator('#firstName').blur();
    await page.fill('#lastName', 'Doe');
    await page.locator('#lastName').blur();
    await page.fill('#email', 'jane@example.com');
    await page.locator('#email').blur();
    await page.fill('#mobile', '0412 345 678');
    await page.locator('#mobile').blur();
    await page.fill('#dob', '01/01/1995');
    await page.locator('#dob').blur();
    await page.locator('#step1-next').click();

    await page.selectOption('#employmentStatus', 'Full-time');
    await page.fill('#employerName', 'Acme Corp');
    await page.locator('#employerName').blur();
    await page.fill('#annualIncome', '85000');
    await page.locator('#annualIncome').blur();
    await page.fill('#monthlyExpenses', '3000');
    await page.locator('#monthlyExpenses').blur();
    await page.locator('#step2-next').click();

    // Now on Step 3
    await expect(page.locator('#step-3')).toBeVisible();
    await expect(page.locator('#step3-next')).toBeDisabled();

    // Fill Step 3
    await page.fill('#loanAmount', '15000');
    await page.locator('#loanAmount').blur();
    await page.locator('label[for="term-36"]').click();
    await page.selectOption('#loanPurpose', 'Car');

    // Check estimate updates
    const monthly = await page.locator('#step3-monthly').textContent();
    expect(monthly).not.toBe('$0');

    // Next should be enabled
    await expect(page.locator('#step3-next')).toBeEnabled();

    // Advance
    await page.locator('#step3-next').click();
    await expect(page.locator('#step-4')).toBeVisible();
  });
});

test.describe('Application Form — Step 4 Summary & Submit', () => {
  test('shows correct data and submits successfully', async ({ page }) => {
    await page.goto('/apply.html');

    // Complete all steps
    // Step 1
    await page.fill('#firstName', 'Jane');
    await page.locator('#firstName').blur();
    await page.fill('#lastName', 'Doe');
    await page.locator('#lastName').blur();
    await page.fill('#email', 'jane@example.com');
    await page.locator('#email').blur();
    await page.fill('#mobile', '0412 345 678');
    await page.locator('#mobile').blur();
    await page.fill('#dob', '01/01/1995');
    await page.locator('#dob').blur();
    await page.locator('#step1-next').click();

    // Step 2
    await page.selectOption('#employmentStatus', 'Full-time');
    await page.fill('#employerName', 'Acme Corp');
    await page.locator('#employerName').blur();
    await page.fill('#annualIncome', '85000');
    await page.locator('#annualIncome').blur();
    await page.fill('#monthlyExpenses', '3000');
    await page.locator('#monthlyExpenses').blur();
    await page.locator('#step2-next').click();

    // Step 3
    await page.fill('#loanAmount', '20000');
    await page.locator('#loanAmount').blur();
    await page.locator('label[for="term-48"]').click();
    await page.selectOption('#loanPurpose', 'Car');
    await page.locator('#step3-next').click();

    // Now on Step 4 — verify summary
    await expect(page.locator('#step-4')).toBeVisible();
    await expect(page.locator('#sum-name')).toContainText('Jane Doe');
    await expect(page.locator('#sum-email')).toContainText('jane@example.com');
    await expect(page.locator('#sum-employment')).toContainText('Full-time');
    await expect(page.locator('#sum-employer')).toContainText('Acme Corp');
    await expect(page.locator('#sum-purpose')).toContainText('Car');

    // Submit button should be disabled
    await expect(page.locator('#step4-submit')).toBeDisabled();

    // Check both consent boxes
    await page.locator('#termsConsent').check();
    await page.locator('#privacyConsent').check();

    // Submit should be enabled
    await expect(page.locator('#step4-submit')).toBeEnabled();

    // Submit
    await page.locator('#step4-submit').click();

    // Success modal should appear
    await expect(page.locator('#success-modal')).toBeVisible();
    await expect(page.locator('#modal-ref')).not.toBeEmpty();

    // Reference should be 8 characters
    const ref = await page.locator('#modal-ref').textContent();
    expect(ref.length).toBe(8);
  });
});
