// @ts-check
const { test, expect } = require('@playwright/test');
const { LandingPage } = require('./pages/LandingPage');
const { LoginPage } = require('./pages/LoginPage');

test.describe('Landing page (index.html)', () => {
  test.beforeEach(async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();
  });

  test('hero and features sections are visible', async ({ page }) => {
    const landing = new LandingPage(page);
    await expect(landing.heroSection).toBeVisible();
    await expect(landing.featuresSection).toBeVisible();
    await expect(landing.featureCardTasks).toBeVisible();
  });

  test('navbar links navigate to login and signup', async ({ page }) => {
    const landing = new LandingPage(page);
    const login = new LoginPage(page);
    await landing.clickNavLogin();
    await expect(page).toHaveURL(/\/login/);
    await expect(login.loginForm).toBeVisible();

    await landing.goto();
    await landing.clickNavSignup();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('hero CTAs navigate to signup and login', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.clickHeroCtaSignup();
    await expect(page).toHaveURL(/\/signup/);

    await landing.goto();
    await landing.clickHeroCtaLogin();
    await expect(page).toHaveURL(/\/login/);

    await landing.goto();
    await landing.clickHeroLoginLink();
    await expect(page).toHaveURL(/\/login/);
  });

  test('demo callout shows credentials and links to login', async ({ page }) => {
    const landing = new LandingPage(page);
    await expect(landing.demoSection).toBeVisible();
    await expect(landing.demoEmail).toContainText('demo@taskflow.app');
    await expect(landing.demoPassword).toContainText('Demo1234!');
    await landing.clickDemoLoginBtn();
    await expect(page).toHaveURL(/\/login/);
  });

  test('footer CTA navigates to signup', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.clickCtaSignup();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('features nav scrolls to features section', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.clickNavFeatures();
    await expect(landing.featuresSection).toBeInViewport();
  });
});
