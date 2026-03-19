// @ts-check
const { test, expect } = require('@playwright/test');
const { ForgotPasswordPage } = require('./pages/ForgotPasswordPage');
const { LoginPage } = require('./pages/LoginPage');

test.describe('Forgot password', () => {
  test.beforeEach(async ({ page }) => {
    const fp = new ForgotPasswordPage(page);
    await fp.goto();
  });

  test('shows forgot password form with email field and submit button', async ({ page }) => {
    const fp = new ForgotPasswordPage(page);
    await expect(fp.forgotPasswordForm).toBeVisible();
    await expect(fp.emailInput).toBeVisible();
    await expect(fp.submitButton).toBeVisible();
    await expect(fp.submitButton).toContainText(/send reset link/i);
    await expect(fp.backToLoginLink).toBeVisible();
  });

  test('empty email shows validation error', async ({ page }) => {
    const fp = new ForgotPasswordPage(page);
    await fp.submitRequest();
    await expect(fp.emailError).toBeVisible();
    await expect(fp.emailError).toContainText(/required/i);
    await expect(fp.stepRequest).toBeVisible();
    await expect(fp.stepSuccess).not.toBeVisible();
  });

  test('invalid email shows validation error', async ({ page }) => {
    const fp = new ForgotPasswordPage(page);
    await fp.fillEmail('not-an-email');
    await fp.submitRequest();
    await expect(fp.emailError).toBeVisible();
    await expect(fp.emailError).toContainText(/valid/i);
    await expect(fp.stepRequest).toBeVisible();
  });

  test('valid email submits and shows success step with submitted email', async ({ page }) => {
    const fp = new ForgotPasswordPage(page);
    const email = 'user@example.com';
    await fp.requestResetFor(email);
    await expect(fp.stepSuccess).toBeVisible();
    await expect(fp.submittedEmail).toHaveText(email);
    await expect(fp.stepRequest).not.toBeVisible();
  });

  test('try again button resets to request step and clears email', async ({ page }) => {
    const fp = new ForgotPasswordPage(page);
    await fp.requestResetFor('reset@example.com');
    await expect(fp.stepSuccess).toBeVisible();
    await fp.clickTryAgain();
    await expect(fp.stepRequest).toBeVisible();
    await expect(fp.emailInput).toHaveValue('');
  });

  test('back to login link navigates to login page', async ({ page }) => {
    const fp = new ForgotPasswordPage(page);
    const login = new LoginPage(page);
    await fp.clickBackToLogin();
    await expect(page).toHaveURL(/\/login/);
    await expect(login.loginForm).toBeVisible();
  });
});
