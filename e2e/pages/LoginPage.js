// @ts-check

class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login.html');
  }

  /** Open login as an unauthenticated user would after hitting a protected page (preserves redirect query). */
  async gotoFromProtectedPageIntercept() {
    await this.page.goto('/profile.html');
    await this.page.waitForURL(
      (url) =>
        /\/login(\.html)?$/.test(url.pathname) &&
        url.searchParams.has('redirect'),
      { timeout: 10000 },
    );
  }

  get loginForm() {
    return this.page.getByTestId('login-form');
  }

  get emailInput() {
    return this.page.getByTestId('email-input');
  }

  get passwordInput() {
    return this.page.getByTestId('password-input');
  }

  get loginButton() {
    return this.page.getByTestId('login-btn');
  }

  get loginAlert() {
    return this.page.getByTestId('login-alert');
  }

  get emailError() {
    return this.page.getByTestId('email-error');
  }

  get passwordError() {
    return this.page.getByTestId('password-error');
  }

  get demoFillButton() {
    return this.page.getByTestId('demo-fill-btn');
  }

  get sidebar() {
    return this.page.getByTestId('sidebar');
  }

  get pageHeader() {
    return this.page.getByTestId('page-header');
  }

  async fillCredentials(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  async clickDemoFill() {
    await this.demoFillButton.click();
  }

  async loginWithCredentials(email, password) {
    await this.fillCredentials(email, password);
    await this.submit();
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }

  async expectAuthenticatedOnDashboard() {
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await this.sidebar.waitFor({ state: 'visible' });
  }
}

module.exports = { LoginPage };
