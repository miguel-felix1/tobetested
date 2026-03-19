// @ts-check

/** Sidebar, navigation, and logout shared by dashboard and profile. */
class AppShellPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  get sidebar() {
    return this.page.getByTestId('sidebar');
  }

  get navDashboard() {
    return this.page.getByTestId('nav-dashboard');
  }

  get navProfile() {
    return this.page.getByTestId('nav-profile');
  }

  get logoutButton() {
    return this.page.getByTestId('logout-btn');
  }

  get pageHeader() {
    return this.page.getByTestId('page-header');
  }

  firstUserNameLine() {
    return this.page.locator('[data-user-name]').first();
  }

  async openProfile() {
    await this.navProfile.click();
  }

  async openDashboard() {
    await this.navDashboard.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}

module.exports = { AppShellPage };
