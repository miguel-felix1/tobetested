// @ts-check
const { test, expect } = require('@playwright/test');
const { ProfilePage } = require('./pages/ProfilePage');
const { LoginPage } = require('./pages/LoginPage');
const { DEMO_EMAIL, DEMO_PASSWORD } = require('./constants');

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.loginAsDemo();
  });

  test('profile page shows account info and edit form', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await expect(page).toHaveURL(/\/profile/);
    await expect(profile.shell.pageHeader).toContainText('Profile');
    await expect(profile.accountInfoCard).toBeVisible();
    await expect(profile.profileDisplayName).toBeVisible();
    await expect(profile.profileDisplayEmail).toBeVisible();
    await expect(profile.editProfileForm).toBeVisible();
    await expect(profile.editNameInput).toBeVisible();
    await expect(profile.editEmailInput).toBeVisible();
    await expect(profile.saveProfileButton).toBeVisible();
  });

  test('profile shows task stats', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await expect(profile.profileStatTotal).toBeVisible();
    await expect(profile.profileStatActive).toBeVisible();
    await expect(profile.profileStatCompleted).toBeVisible();
  });

  test('saving profile updates displayed name and email', async ({ page }) => {
    const profile = new ProfilePage(page);
    const suffix = Date.now();
    const newName = `Demo User ${suffix}`;
    const newEmail = `demo.${suffix}@taskflow.app`;

    await profile.openFromDashboard();
    await profile.editNameInput.fill(newName);
    await profile.editEmailInput.fill(newEmail);
    await profile.saveProfile();

    await expect(profile.profileSuccessAlert).toContainText(/updated successfully/i);
    await expect(profile.profileDisplayName).toHaveText(newName);
    await expect(profile.profileDisplayEmail).toHaveText(newEmail);
    await expect(profile.shell.firstUserNameLine()).toContainText(newName);
  });

  test('empty name on profile shows validation error', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await profile.editNameInput.fill('');
    await profile.saveProfile();
    await expect(profile.editNameError).toContainText(/required/i);
  });

  test('invalid email on profile shows validation error', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await profile.editEmailInput.fill('not-a-valid-email');
    await profile.saveProfile();
    await expect(profile.editEmailError).toContainText(/valid email/i);
  });

  test('name shorter than two characters shows validation error', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await profile.editNameInput.fill('A');
    await profile.saveProfile();
    await expect(profile.editNameError).toContainText(/at least 2/i);
  });

  test('change password succeeds and new password works on next login', async ({ page }) => {
    const profile = new ProfilePage(page);
    const login = new LoginPage(page);
    const newPassword = 'RotatedPass999!';

    await profile.openFromDashboard();
    await profile.fillChangePassword({
      current: DEMO_PASSWORD,
      next: newPassword,
      confirm: newPassword,
    });
    await profile.submitChangePassword();
    await expect(profile.passwordSuccessAlert).toContainText(/changed successfully/i);

    await profile.shell.logout();
    await expect(page).toHaveURL(/\/login/);

    await login.fillCredentials(DEMO_EMAIL, newPassword);
    await login.submit();
    await login.expectAuthenticatedOnDashboard();

    await profile.openFromDashboard();
    await profile.fillChangePassword({
      current: newPassword,
      next: DEMO_PASSWORD,
      confirm: DEMO_PASSWORD,
    });
    await profile.submitChangePassword();
    await expect(profile.passwordSuccessAlert).toContainText(/changed successfully/i);
  });

  test('change password with wrong current password shows error alert', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await profile.fillChangePassword({
      current: 'DefinitelyWrong123!',
      next: 'SomeNewPass999!',
      confirm: 'SomeNewPass999!',
    });
    await profile.submitChangePassword();
    await expect(profile.passwordErrorAlert).toContainText(/incorrect/i);
  });

  test('change password rejects new password identical to current', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await profile.fillChangePassword({
      current: DEMO_PASSWORD,
      next: DEMO_PASSWORD,
      confirm: DEMO_PASSWORD,
    });
    await profile.submitChangePassword();
    await expect(profile.passwordErrorAlert).toContainText(/different from the current/i);
  });

  test('change password with mismatched confirmation shows field error', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await profile.fillChangePassword({
      current: DEMO_PASSWORD,
      next: 'NewLongPass1!',
      confirm: 'OtherLongPass1!',
    });
    await profile.submitChangePassword();
    await expect(profile.confirmNewPasswordError).toContainText(/do not match/i);
  });

  test('change password with empty new password shows validation error', async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.openFromDashboard();
    await profile.currentPasswordInput.fill(DEMO_PASSWORD);
    await profile.newPasswordInput.fill('');
    await profile.confirmNewPasswordInput.fill('');
    await profile.submitChangePassword();
    await expect(profile.newPasswordError).toContainText(/required/i);
  });
});

test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.loginAsDemo();
  });

  test('logout redirects to login page', async ({ page }) => {
    const profile = new ProfilePage(page);
    const login = new LoginPage(page);
    await profile.shell.logout();
    await expect(page).toHaveURL(/\/login/);
    await expect(login.loginForm).toBeVisible();
  });

  test('after logout visiting dashboard redirects to login', async ({ page }) => {
    const profile = new ProfilePage(page);
    const login = new LoginPage(page);
    await profile.shell.logout();
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/dashboard.html');
    await expect(page).toHaveURL(/\/login/);
  });
});
