// @ts-check

class LandingPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  get heroSection() {
    return this.page.getByTestId('hero-section');
  }

  get featuresSection() {
    return this.page.getByTestId('features-section');
  }

  get featureCardTasks() {
    return this.page.getByTestId('feature-card-tasks');
  }

  get navLogin() {
    return this.page.getByTestId('nav-login');
  }

  get navSignup() {
    return this.page.getByTestId('nav-signup');
  }

  get heroCtaSignup() {
    return this.page.getByTestId('hero-cta-signup');
  }

  get heroCtaLogin() {
    return this.page.getByTestId('hero-cta-login');
  }

  get heroLoginLink() {
    return this.page.getByTestId('hero-login-link');
  }

  get demoSection() {
    return this.page.getByTestId('demo-section');
  }

  get demoEmail() {
    return this.page.getByTestId('demo-email');
  }

  get demoPassword() {
    return this.page.getByTestId('demo-password');
  }

  get demoLoginBtn() {
    return this.page.getByTestId('demo-login-btn');
  }

  get ctaSignupBtn() {
    return this.page.getByTestId('cta-signup-btn');
  }

  get navFeatures() {
    return this.page.getByTestId('nav-features');
  }

  async clickNavLogin() {
    await this.navLogin.click();
  }

  async clickNavSignup() {
    await this.navSignup.click();
  }

  async clickHeroCtaSignup() {
    await this.heroCtaSignup.click();
  }

  async clickHeroCtaLogin() {
    await this.heroCtaLogin.click();
  }

  async clickHeroLoginLink() {
    await this.heroLoginLink.click();
  }

  async clickDemoLoginBtn() {
    await this.demoLoginBtn.click();
  }

  async clickCtaSignup() {
    await this.ctaSignupBtn.click();
  }

  async clickNavFeatures() {
    await this.navFeatures.click();
  }
}

module.exports = { LandingPage };
