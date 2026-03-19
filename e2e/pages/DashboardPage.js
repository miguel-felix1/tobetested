// @ts-check

const { LoginPage } = require('./LoginPage');
const { AppShellPage } = require('./AppShellPage');
const { DEMO_EMAIL, DEMO_PASSWORD } = require('../constants');

class DashboardPage {
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

  get statsGrid() {
    return this.page.getByTestId('stats-grid');
  }

  get statTotal() {
    return this.page.getByTestId('stat-total');
  }

  get statActive() {
    return this.page.getByTestId('stat-active');
  }

  get statCompleted() {
    return this.page.getByTestId('stat-completed');
  }

  get addTaskCard() {
    return this.page.getByTestId('add-task-card');
  }

  get tasksCard() {
    return this.page.getByTestId('tasks-card');
  }

  get taskList() {
    return this.page.getByTestId('task-list');
  }

  get taskItems() {
    return this.page.getByTestId('task-item');
  }

  get taskInput() {
    return this.page.getByTestId('task-input');
  }

  get addTaskButton() {
    return this.page.getByTestId('add-task-btn');
  }

  get prioritySelect() {
    return this.page.getByTestId('priority-select');
  }

  get filterAll() {
    return this.page.getByTestId('filter-all');
  }

  get filterActive() {
    return this.page.getByTestId('filter-active');
  }

  get filterCompleted() {
    return this.page.getByTestId('filter-completed');
  }

  taskItemByTitle(title) {
    return this.page.getByTestId('task-item').filter({ hasText: title });
  }

  /** @param {import('@playwright/test').Locator} taskItem */
  taskPriorityOnItem(taskItem) {
    return taskItem.getByTestId('task-priority');
  }

  async addTask(title) {
    await this.taskInput.fill(title);
    await this.addTaskButton.click();
  }

  async selectPriority(value) {
    await this.prioritySelect.selectOption(value);
  }

  async clickFilterAll() {
    await this.filterAll.click();
  }

  async clickFilterActive() {
    await this.filterActive.click();
  }

  async clickFilterCompleted() {
    await this.filterCompleted.click();
  }

  async toggleFirstTaskCheckbox() {
    await this.page.getByTestId('task-checkbox').first().click();
  }

  async deleteTaskForItem(item) {
    await item.getByTestId('task-delete').click();
  }
}

module.exports = { DashboardPage };
