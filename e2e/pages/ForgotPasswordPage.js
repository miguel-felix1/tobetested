// @ts-check

class ForgotPasswordPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/forgot-password.html');
  }

  get forgotPasswordForm() {
    return this.page.getByTestId('forgot-password-form');
  }

  get emailInput() {
    return this.page.getByTestId('fp-email-input');
  }

  get submitButton() {
    return this.page.getByTestId('fp-submit-btn');
  }

  get emailError() {
    return this.page.getByTestId('fp-email-error');
  }

  get stepRequest() {
    return this.page.getByTestId('step-request');
  }

  get stepSuccess() {
    return this.page.getByTestId('step-success');
  }

  get submittedEmail() {
    return this.page.getByTestId('submitted-email');
  }

  get tryAgainButton() {
    return this.page.getByTestId('try-again-btn');
  }

  get backToLoginLink() {
    return this.page.getByTestId('back-to-login-link');
  }

  async submitRequest() {
    await this.submitButton.click();
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async requestResetFor(email) {
    await this.fillEmail(email);
    await this.submitRequest();
  }

  async clickTryAgain() {
    await this.tryAgainButton.click();
  }

  async clickBackToLogin() {
    await this.backToLoginLink.click();
  }
}

module.exports = { ForgotPasswordPage };
