// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Landing page (index.html)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero and features sections are visible', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('features-section')).toBeVisible();
    await expect(page.getByTestId('feature-card-tasks')).toBeVisible();
  });

  test('navbar links navigate to login and signup', async ({ page }) => {
    await page.getByTestId('nav-login').click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-form')).toBeVisible();

    await page.goto('/');
    await page.getByTestId('nav-signup').click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('hero CTAs navigate to signup and login', async ({ page }) => {
    await page.getByTestId('hero-cta-signup').click();
    await expect(page).toHaveURL(/\/signup/);

    await page.goto('/');
    await page.getByTestId('hero-cta-login').click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/');
    await page.getByTestId('hero-login-link').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('demo callout shows credentials and links to login', async ({ page }) => {
    await expect(page.getByTestId('demo-section')).toBeVisible();
    await expect(page.getByTestId('demo-email')).toContainText('demo@taskflow.app');
    await expect(page.getByTestId('demo-password')).toContainText('Demo1234!');
    await page.getByTestId('demo-login-btn').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('footer CTA navigates to signup', async ({ page }) => {
    await page.getByTestId('cta-signup-btn').click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('features nav scrolls to features section', async ({ page }) => {
    await page.getByTestId('nav-features').click();
    await expect(page.getByTestId('features-section')).toBeInViewport();
  });
});
