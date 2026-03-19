// @ts-check

const { LoginPage } = require('./LoginPage');
const { AppShellPage } = require('./AppShellPage');
const { DEMO_EMAIL, DEMO_PASSWORD } = require('../constants');

class ProfilePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.shell = new AppShellPage(page);
  }

  async loginAsDemo() {
    const login = new LoginPage(this.page);
    await login.goto();
    await login.fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);
    await login.submit();
    await login.expectAuthenticatedOnDashboard();
  }

  async openFromDashboard() {
    await this.shell.openProfile();
  }

  get accountInfoCard() {
    return this.page.getByTestId('account-info-card');
  }

  get profileDisplayName() {
    return this.page.getByTestId('profile-display-name');
  }

  get profileDisplayEmail() {
    return this.page.getByTestId('profile-display-email');
  }

  get editProfileForm() {
    return this.page.getByTestId('edit-profile-form');
  }

  get editNameInput() {
    return this.page.getByTestId('edit-name-input');
  }

  get editEmailInput() {
    return this.page.getByTestId('edit-email-input');
  }

  get saveProfileButton() {
    return this.page.getByTestId('save-profile-btn');
  }

  get profileSuccessAlert() {
    return this.page.getByTestId('profile-success-alert');
  }

  get editNameError() {
    return this.page.getByTestId('edit-name-error');
  }

  get editEmailError() {
    return this.page.getByTestId('edit-email-error');
  }

  get profileStatTotal() {
    return this.page.getByTestId('profile-stat-total');
  }

  get profileStatActive() {
    return this.page.getByTestId('profile-stat-active');
  }

  get profileStatCompleted() {
    return this.page.getByTestId('profile-stat-completed');
  }

  get changePasswordForm() {
    return this.page.getByTestId('change-password-form');
  }

  get currentPasswordInput() {
    return this.page.getByTestId('current-password-input');
  }

  get newPasswordInput() {
    return this.page.getByTestId('new-password-input');
  }

  get confirmNewPasswordInput() {
    return this.page.getByTestId('confirm-new-password-input');
  }

  get changePasswordButton() {
    return this.page.getByTestId('change-password-btn');
  }

  get passwordSuccessAlert() {
    return this.page.getByTestId('password-success-alert');
  }

  get passwordErrorAlert() {
    return this.page.getByTestId('password-error-alert');
  }

  get currentPasswordError() {
    return this.page.getByTestId('current-password-error');
  }

  get newPasswordError() {
    return this.page.getByTestId('new-password-error');
  }

  get confirmNewPasswordError() {
    return this.page.getByTestId('confirm-new-password-error');
  }

  async saveProfile() {
    await this.saveProfileButton.click();
  }

  async submitChangePassword() {
    await this.changePasswordButton.click();
  }

  /**
   * @param {{ current: string, next: string, confirm: string }} passwords
   */
  async fillChangePassword({ current, next, confirm }) {
    await this.currentPasswordInput.fill(current);
    await this.newPasswordInput.fill(next);
    await this.confirmNewPasswordInput.fill(confirm);
  }
}

module.exports = { ProfilePage };
