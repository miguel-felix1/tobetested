// @ts-check
const { test, expect } = require('@playwright/test');

const DEMO_EMAIL = 'demo@taskflow.app';
const DEMO_PASSWORD = 'Demo1234!';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
  });

  test('shows login form with email and password fields', async ({ page }) => {
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-btn')).toBeVisible();
  });

  test('successful login with demo credentials redirects to dashboard', async ({ page }) => {
    await page.getByTestId('email-input').fill(DEMO_EMAIL);
    await page.getByTestId('password-input').fill(DEMO_PASSWORD);
    await page.getByTestId('login-btn').click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('page-header')).toContainText('Dashboard');
  });

  test('invalid email or password shows error and stays on login page', async ({ page }) => {
    await page.getByTestId('email-input').fill('wrong@example.com');
    await page.getByTestId('password-input').fill('WrongPass123!');
    await page.getByTestId('login-btn').click();
    const alert = page.getByTestId('login-alert');
    await expect(alert).toContainText(/invalid|password/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test('empty email shows validation error', async ({ page }) => {
    await page.getByTestId('password-input').fill(DEMO_PASSWORD);
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('email-error')).toContainText(/required|valid/i);
  });

  test('empty password shows validation error', async ({ page }) => {
    await page.getByTestId('email-input').fill(DEMO_EMAIL);
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toContainText(/required/i);
  });

  test('demo fill button pre-fills credentials', async ({ page }) => {
    await page.getByTestId('demo-fill-btn').click();
    await expect(page.getByTestId('email-input')).toHaveValue(DEMO_EMAIL);
    await expect(page.getByTestId('password-input')).toHaveValue(DEMO_PASSWORD);
  });
});

test.describe('Signup and duplicate email', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup.html');
  });

  test('signup with existing demo email shows duplicate error', async ({ page }) => {
    await page.getByTestId('name-input').fill('Another User');
    await page.getByTestId('email-input').fill(DEMO_EMAIL);
    await page.getByTestId('password-input').fill('NewPass123!');
    await page.getByTestId('confirm-password-input').fill('NewPass123!');
    await page.getByTestId('terms-checkbox').check();
    await page.getByTestId('signup-btn').click();
    const alert = page.getByTestId('signup-alert');
    await expect(alert).toContainText(/already exists|email/i);
    await expect(page).toHaveURL(/\/signup/);
  });

  test('successful signup with new email redirects to dashboard', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('email-input').fill(uniqueEmail);
    await page.getByTestId('password-input').fill('TestPass123!');
    await page.getByTestId('confirm-password-input').fill('TestPass123!');
    await page.getByTestId('terms-checkbox').check();
    await page.getByTestId('signup-btn').click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByTestId('sidebar')).toBeVisible();
  });
});
