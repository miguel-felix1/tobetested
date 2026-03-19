// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Forgot password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password.html');
  });

  test('shows forgot password form with email field and submit button', async ({ page }) => {
    await expect(page.getByTestId('forgot-password-form')).toBeVisible();
    await expect(page.getByTestId('fp-email-input')).toBeVisible();
    await expect(page.getByTestId('fp-submit-btn')).toBeVisible();
    await expect(page.getByTestId('fp-submit-btn')).toContainText(/send reset link/i);
    await expect(page.getByTestId('back-to-login-link')).toBeVisible();
  });

  test('empty email shows validation error', async ({ page }) => {
    await page.getByTestId('fp-submit-btn').click();
    await expect(page.getByTestId('fp-email-error')).toBeVisible();
    await expect(page.getByTestId('fp-email-error')).toContainText(/required/i);
    await expect(page.getByTestId('step-request')).toBeVisible();
    await expect(page.getByTestId('step-success')).not.toBeVisible();
  });

  test('invalid email shows validation error', async ({ page }) => {
    await page.getByTestId('fp-email-input').fill('not-an-email');
    await page.getByTestId('fp-submit-btn').click();
    await expect(page.getByTestId('fp-email-error')).toBeVisible();
    await expect(page.getByTestId('fp-email-error')).toContainText(/valid/i);
    await expect(page.getByTestId('step-request')).toBeVisible();
  });

  test('valid email submits and shows success step with submitted email', async ({ page }) => {
    const email = 'user@example.com';
    await page.getByTestId('fp-email-input').fill(email);
    await page.getByTestId('fp-submit-btn').click();
    await expect(page.getByTestId('step-success')).toBeVisible();
    await expect(page.getByTestId('submitted-email')).toHaveText(email);
    await expect(page.getByTestId('step-request')).not.toBeVisible();
  });

  test('try again button resets to request step and clears email', async ({ page }) => {
    await page.getByTestId('fp-email-input').fill('reset@example.com');
    await page.getByTestId('fp-submit-btn').click();
    await expect(page.getByTestId('step-success')).toBeVisible();
    await page.getByTestId('try-again-btn').click();
    await expect(page.getByTestId('step-request')).toBeVisible();
    await expect(page.getByTestId('fp-email-input')).toHaveValue('');
  });

  test('back to login link navigates to login page', async ({ page }) => {
    await page.getByTestId('back-to-login-link').click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});
