// @ts-check

class SignupPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/signup.html');
  }

  get nameInput() {
    return this.page.getByTestId('name-input');
  }

  get emailInput() {
    return this.page.getByTestId('email-input');
  }

  get passwordInput() {
    return this.page.getByTestId('password-input');
  }

  get confirmPasswordInput() {
    return this.page.getByTestId('confirm-password-input');
  }

  get termsCheckbox() {
    return this.page.getByTestId('terms-checkbox');
  }

  get signupButton() {
    return this.page.getByTestId('signup-btn');
  }

  get signupAlert() {
    return this.page.getByTestId('signup-alert');
  }

  get nameError() {
    return this.page.getByTestId('name-error');
  }

  get confirmPasswordError() {
    return this.page.getByTestId('confirm-password-error');
  }

  get termsError() {
    return this.page.getByTestId('terms-error');
  }

  get passwordError() {
    return this.page.getByTestId('password-error');
  }

  async fillSignupForm({ name, email, password, confirmPassword }) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async submitSignup() {
    await this.signupButton.click();
  }

  async registerNewUser(name, email, password) {
    await this.fillSignupForm({ name, email, password, confirmPassword: password });
    await this.acceptTerms();
    await this.submitSignup();
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}

module.exports = { SignupPage };
