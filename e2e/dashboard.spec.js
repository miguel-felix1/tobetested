// @ts-check
const { test, expect } = require('@playwright/test');

const DEMO_EMAIL = 'demo@taskflow.app';
const DEMO_PASSWORD = 'Demo1234!';

async function login(page) {
  await page.goto('/login.html');
  await page.getByTestId('email-input').fill(DEMO_EMAIL);
  await page.getByTestId('password-input').fill(DEMO_PASSWORD);
  await page.getByTestId('login-btn').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  await expect(page.getByTestId('sidebar')).toBeVisible();
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard shows stats and task list area', async ({ page }) => {
    await expect(page.getByTestId('stats-grid')).toBeVisible();
    await expect(page.getByTestId('stat-total')).toBeVisible();
    await expect(page.getByTestId('stat-active')).toBeVisible();
    await expect(page.getByTestId('stat-completed')).toBeVisible();
    await expect(page.getByTestId('add-task-card')).toBeVisible();
    await expect(page.getByTestId('tasks-card')).toBeVisible();
    await expect(page.getByTestId('task-list')).toBeVisible();
  });

  test('add task form adds a new task to the list', async ({ page }) => {
    const taskTitle = `E2E task ${Date.now()}`;
    await page.getByTestId('task-input').fill(taskTitle);
    await page.getByTestId('add-task-btn').click();
    await expect(page.getByTestId('task-item').filter({ hasText: taskTitle })).toBeVisible();
    await expect(page.getByTestId('stat-total')).toContainText(/\d+/);
  });

  test('toggle task checkbox marks task completed and updates stats', async ({ page }) => {
    const taskTitle = `Toggle test ${Date.now()}`;
    await page.getByTestId('task-input').fill(taskTitle);
    await page.getByTestId('add-task-btn').click();
    const item = page.getByTestId('task-item').filter({ hasText: taskTitle });
    await expect(item).toBeVisible();
    await page.getByTestId('task-checkbox').first().click();
    await expect(item).toHaveClass(/completed/);
    await expect(page.getByTestId('stat-completed')).toContainText(/\d+/);
  });

  test('delete task removes it from the list', async ({ page }) => {
    const taskTitle = `Delete me ${Date.now()}`;
    await page.getByTestId('task-input').fill(taskTitle);
    await page.getByTestId('add-task-btn').click();
    const item = page.getByTestId('task-item').filter({ hasText: taskTitle });
    await expect(item).toBeVisible();
    await item.getByTestId('task-delete').click();
    await expect(item).not.toBeVisible();
  });

  test('filter tabs switch between All, Active, Completed', async ({ page }) => {
    await page.getByTestId('filter-all').click();
    await expect(page.getByTestId('filter-all')).toHaveClass(/active/);
    await page.getByTestId('filter-active').click();
    await expect(page.getByTestId('filter-active')).toHaveClass(/active/);
    await page.getByTestId('filter-completed').click();
    await expect(page.getByTestId('filter-completed')).toHaveClass(/active/);
  });

  test('active filter hides completed seeded tasks and shows active ones', async ({ page }) => {
    const completedTitle = 'Review project requirements';
    const activeTitle = 'Write unit tests for auth module';

    await page.getByTestId('filter-active').click();
    await expect(page.getByTestId('task-item').filter({ hasText: completedTitle })).toHaveCount(0);
    await expect(page.getByTestId('task-item').filter({ hasText: activeTitle })).toHaveCount(1);
  });

  test('completed filter shows finished tasks and hides active seeded tasks', async ({ page }) => {
    const completedTitle = 'Set up development environment';
    const activeTitle = 'Design dashboard wireframes';

    await page.getByTestId('filter-completed').click();
    await expect(page.getByTestId('task-item').filter({ hasText: completedTitle })).toHaveCount(1);
    await expect(page.getByTestId('task-item').filter({ hasText: activeTitle })).toHaveCount(0);
  });

  test('all filter lists every seeded demo task', async ({ page }) => {
    await page.getByTestId('filter-all').click();
    await expect(page.getByTestId('task-item')).toHaveCount(5);
  });

  test('priority select is available when adding task', async ({ page }) => {
    await expect(page.getByTestId('priority-select')).toBeVisible();
    await page.getByTestId('priority-select').selectOption('high');
    const taskTitle = 'High priority task';
    await page.getByTestId('task-input').fill(taskTitle);
    await page.getByTestId('add-task-btn').click();
    const newTaskItem = page.getByTestId('task-item').filter({ hasText: taskTitle });
    await expect(newTaskItem).toBeVisible();
    await expect(newTaskItem.getByTestId('task-priority')).toHaveText('high');
  });
});
