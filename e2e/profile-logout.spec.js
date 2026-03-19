// @ts-check
const { test, expect } = require('@playwright/test');

const DEMO_EMAIL = 'demo@taskflow.app';
const DEMO_PASSWORD = 'Demo1234!';

async function login(page) {
  await page.goto('/login.html');
  await page.getByTestId('email-input').fill(DEMO_EMAIL);
  await page.getByTestId('password-input').fill(DEMO_PASSWORD);
  await page.getByTestId('login-btn').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  await expect(page.getByTestId('sidebar')).toBeVisible();
}

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('profile page shows account info and edit form', async ({ page }) => {
    await page.getByTestId('nav-profile').click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByTestId('page-header')).toContainText('Profile');
    await expect(page.getByTestId('account-info-card')).toBeVisible();
    await expect(page.getByTestId('profile-display-name')).toBeVisible();
    await expect(page.getByTestId('profile-display-email')).toBeVisible();
    await expect(page.getByTestId('edit-profile-form')).toBeVisible();
    await expect(page.getByTestId('edit-name-input')).toBeVisible();
    await expect(page.getByTestId('edit-email-input')).toBeVisible();
    await expect(page.getByTestId('save-profile-btn')).toBeVisible();
  });

  test('profile shows task stats', async ({ page }) => {
    await page.getByTestId('nav-profile').click();
    await expect(page.getByTestId('profile-stat-total')).toBeVisible();
    await expect(page.getByTestId('profile-stat-active')).toBeVisible();
    await expect(page.getByTestId('profile-stat-completed')).toBeVisible();
  });

  test('saving profile updates displayed name and email', async ({ page }) => {
    const suffix = Date.now();
    const newName = `Demo User ${suffix}`;
    const newEmail = `demo.${suffix}@taskflow.app`;

    await page.getByTestId('nav-profile').click();
    await page.getByTestId('edit-name-input').fill(newName);
    await page.getByTestId('edit-email-input').fill(newEmail);
    await page.getByTestId('save-profile-btn').click();

    await expect(page.getByTestId('profile-success-alert')).toContainText(/updated successfully/i);
    await expect(page.getByTestId('profile-display-name')).toHaveText(newName);
    await expect(page.getByTestId('profile-display-email')).toHaveText(newEmail);
    await expect(page.locator('[data-user-name]').first()).toContainText(newName);
  });

  test('empty name on profile shows validation error', async ({ page }) => {
    await page.getByTestId('nav-profile').click();
    await page.getByTestId('edit-name-input').fill('');
    await page.getByTestId('save-profile-btn').click();
    await expect(page.getByTestId('edit-name-error')).toContainText(/required/i);
  });

  test('invalid email on profile shows validation error', async ({ page }) => {
    await page.getByTestId('nav-profile').click();
    await page.getByTestId('edit-email-input').fill('not-a-valid-email');
    await page.getByTestId('save-profile-btn').click();
    await expect(page.getByTestId('edit-email-error')).toContainText(/valid email/i);
  });

  test('name shorter than two characters shows validation error', async ({ page }) => {
    await page.getByTestId('nav-profile').click();
    await page.getByTestId('edit-name-input').fill('A');
    await page.getByTestId('save-profile-btn').click();
    await expect(page.getByTestId('edit-name-error')).toContainText(/at least 2/i);
  });
});

test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('logout redirects to login page', async ({ page }) => {
    await page.getByTestId('logout-btn').click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('after logout visiting dashboard redirects to login', async ({ page }) => {
    await page.getByTestId('logout-btn').click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/dashboard.html');
    await expect(page).toHaveURL(/\/login/);
  });
});
