// @ts-check
const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('./pages/DashboardPage');

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.loginAsDemo();
  });

  test('dashboard shows stats and task list area', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await expect(dashboard.statsGrid).toBeVisible();
    await expect(dashboard.statTotal).toBeVisible();
    await expect(dashboard.statActive).toBeVisible();
    await expect(dashboard.statCompleted).toBeVisible();
    await expect(dashboard.addTaskCard).toBeVisible();
    await expect(dashboard.tasksCard).toBeVisible();
    await expect(dashboard.taskList).toBeVisible();
  });

  test('add task form adds a new task to the list', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const taskTitle = `E2E task ${Date.now()}`;
    await dashboard.addTask(taskTitle);
    await expect(dashboard.taskItemByTitle(taskTitle)).toBeVisible();
    await expect(dashboard.statTotal).toContainText(/\d+/);
  });

  test('toggle task checkbox marks task completed and updates stats', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const taskTitle = `Toggle test ${Date.now()}`;
    await dashboard.addTask(taskTitle);
    const item = dashboard.taskItemByTitle(taskTitle);
    await expect(item).toBeVisible();
    await dashboard.toggleFirstTaskCheckbox();
    await expect(item).toHaveClass(/completed/);
    await expect(dashboard.statCompleted).toContainText(/\d+/);
  });

  test('delete task removes it from the list', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const taskTitle = `Delete me ${Date.now()}`;
    await dashboard.addTask(taskTitle);
    const item = dashboard.taskItemByTitle(taskTitle);
    await expect(item).toBeVisible();
    await dashboard.deleteTaskForItem(item);
    await expect(item).not.toBeVisible();
  });

  test('filter tabs switch between All, Active, Completed', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.clickFilterAll();
    await expect(dashboard.filterAll).toHaveClass(/active/);
    await dashboard.clickFilterActive();
    await expect(dashboard.filterActive).toHaveClass(/active/);
    await dashboard.clickFilterCompleted();
    await expect(dashboard.filterCompleted).toHaveClass(/active/);
  });

  test('active filter hides completed seeded tasks and shows active ones', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const completedTitle = 'Review project requirements';
    const activeTitle = 'Write unit tests for auth module';

    await dashboard.clickFilterActive();
    await expect(dashboard.taskItemByTitle(completedTitle)).toHaveCount(0);
    await expect(dashboard.taskItemByTitle(activeTitle)).toHaveCount(1);
  });

  test('completed filter shows finished tasks and hides active seeded tasks', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const completedTitle = 'Set up development environment';
    const activeTitle = 'Design dashboard wireframes';

    await dashboard.clickFilterCompleted();
    await expect(dashboard.taskItemByTitle(completedTitle)).toHaveCount(1);
    await expect(dashboard.taskItemByTitle(activeTitle)).toHaveCount(0);
  });

  test('all filter lists every seeded demo task', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.clickFilterAll();
    await expect(dashboard.taskItems).toHaveCount(5);
  });

  test('priority select is available when adding task', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await expect(dashboard.prioritySelect).toBeVisible();
    await dashboard.selectPriority('high');
    const taskTitle = 'High priority task';
    await dashboard.addTask(taskTitle);
    const newTaskItem = dashboard.taskItemByTitle(taskTitle);
    await expect(newTaskItem).toBeVisible();
    await expect(dashboard.taskPriorityOnItem(newTaskItem)).toHaveText('high');
  });
});
