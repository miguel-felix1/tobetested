// @ts-check
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { SignupPage } = require('./pages/SignupPage');
const { ProfilePage } = require('./pages/ProfilePage');
const { DEMO_EMAIL, DEMO_PASSWORD } = require('./constants');

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
  });

  test('shows login form with email and password fields', async ({ page }) => {
    const login = new LoginPage(page);
    await expect(login.loginForm).toBeVisible();
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.loginButton).toBeVisible();
  });

  test('successful login with demo credentials redirects to dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);
    await login.submit();
    await login.expectAuthenticatedOnDashboard();
    await expect(login.pageHeader).toContainText('Dashboard');
  });

  test('invalid email or password shows error and stays on login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.fillCredentials('wrong@example.com', 'WrongPass123!');
    await login.submit();
    await expect(login.loginAlert).toContainText(/invalid|password/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test('empty email shows validation error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.passwordInput.fill(DEMO_PASSWORD);
    await login.submit();
    await expect(login.emailError).toBeVisible();
    await expect(login.emailError).toContainText(/required|valid/i);
  });

  test('empty password shows validation error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.emailInput.fill(DEMO_EMAIL);
    await login.submit();
    await expect(login.passwordError).toBeVisible();
    await expect(login.passwordError).toContainText(/required/i);
  });

  test('demo fill button pre-fills credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.clickDemoFill();
    await expect(login.emailInput).toHaveValue(DEMO_EMAIL);
    await expect(login.passwordInput).toHaveValue(DEMO_PASSWORD);
  });

  test('successful login honours redirect query to profile', async ({ page }) => {
    const login = new LoginPage(page);
    const profile = new ProfilePage(page);
    await login.gotoFromProtectedPageIntercept();
    await login.fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);
    await login.submit();
    await page.waitForURL(/\/profile/, { timeout: 10000 });
    await expect(profile.shell.pageHeader).toContainText('Profile');
    await expect(profile.accountInfoCard).toBeVisible();
  });
});

test.describe('Signup and duplicate email', () => {
  test.beforeEach(async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
  });

  test('signup with existing demo email shows duplicate error', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.fillSignupForm({
      name: 'Another User',
      email: DEMO_EMAIL,
      password: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    await signup.acceptTerms();
    await signup.submitSignup();
    await expect(signup.signupAlert).toContainText(/already exists|email/i);
    await expect(page).toHaveURL(/\/signup/);
  });

  test('successful signup with new email redirects to dashboard', async ({ page }) => {
    const signup = new SignupPage(page);
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await signup.registerNewUser('Test User', uniqueEmail, 'TestPass123!');
    const login = new LoginPage(page);
    await expect(login.sidebar).toBeVisible();
  });

  test('signup without accepting terms shows validation error', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.fillSignupForm({
      name: 'Terms Tester',
      email: `terms-${Date.now()}@example.com`,
      password: 'LongPass1!',
      confirmPassword: 'LongPass1!',
    });
    await signup.submitSignup();
    await expect(signup.termsError).toContainText(/terms/i);
    await expect(page).toHaveURL(/\/signup/);
  });

  test('signup with mismatched passwords shows confirm validation error', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.fillSignupForm({
      name: 'Mismatch User',
      email: `mismatch-${Date.now()}@example.com`,
      password: 'FirstPass123!',
      confirmPassword: 'SecondPass123!',
    });
    await signup.acceptTerms();
    await signup.submitSignup();
    await expect(signup.confirmPasswordError).toContainText(/do not match/i);
    await expect(page).toHaveURL(/\/signup/);
  });

  test('signup with password shorter than eight characters shows validation error', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.fillSignupForm({
      name: 'Short Pass User',
      email: `shortpw-${Date.now()}@example.com`,
      password: 'short',
      confirmPassword: 'short',
    });
    await signup.acceptTerms();
    await signup.submitSignup();
    await expect(signup.passwordError).toContainText(/8 characters/i);
    await expect(page).toHaveURL(/\/signup/);
  });
});
