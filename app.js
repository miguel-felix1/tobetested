/* ============================================================
   TaskFlow — Task Management Module
   ============================================================ */

const TASKS = (() => {
  function key(userId) { return 'tf_tasks_' + userId; }

  function getAll(userId) {
    return JSON.parse(localStorage.getItem(key(userId)) || '[]');
  }

  function save(userId, tasks) {
    localStorage.setItem(key(userId), JSON.stringify(tasks));
  }

  function add(userId, title, priority = 'medium') {
    const tasks = getAll(userId);
    const task = {
      id: 'task_' + Date.now(),
      title: title.trim(),
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    tasks.unshift(task);
    save(userId, tasks);
    return task;
  }

  function toggle(userId, taskId) {
    const tasks = getAll(userId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      save(userId, tasks);
    }
    return task;
  }

  function remove(userId, taskId) {
    const tasks = getAll(userId).filter(t => t.id !== taskId);
    save(userId, tasks);
    return tasks;
  }

  function getStats(userId) {
    const tasks = getAll(userId);
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      active: tasks.filter(t => !t.completed).length,
    };
  }

  // Seed some sample tasks for demo user
  function seedDemo() {
    const demoKey = key('usr_demo');
    if (!localStorage.getItem(demoKey)) {
      const now = Date.now();
      const tasks = [
        { id: 'task_d1', title: 'Review project requirements', priority: 'high',   completed: true,  createdAt: new Date(now - 86400000 * 3).toISOString(), completedAt: new Date(now - 86400000 * 2).toISOString() },
        { id: 'task_d2', title: 'Set up development environment', priority: 'high',   completed: true,  createdAt: new Date(now - 86400000 * 2).toISOString(), completedAt: new Date(now - 86400000).toISOString() },
        { id: 'task_d3', title: 'Write unit tests for auth module', priority: 'medium', completed: false, createdAt: new Date(now - 86400000).toISOString(), completedAt: null },
        { id: 'task_d4', title: 'Design dashboard wireframes',      priority: 'medium', completed: false, createdAt: new Date(now - 3600000 * 5).toISOString(), completedAt: null },
        { id: 'task_d5', title: 'Update README documentation',       priority: 'low',    completed: false, createdAt: new Date(now - 3600000 * 2).toISOString(), completedAt: null },
      ];
      save('usr_demo', tasks);
    }
  }

  seedDemo();

  return { getAll, add, toggle, remove, getStats };
})();

/* ============================================================
   Dashboard renderer
   ============================================================ */
function initDashboard() {
  if (!AUTH.requireAuth()) return;
  const user = AUTH.getCurrentUser();

  // Populate user info in sidebar
  document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = user.name; });
  document.querySelectorAll('[data-user-email]').forEach(el => { el.textContent = user.email; });
  document.querySelectorAll('[data-user-avatar]').forEach(el => { el.textContent = user.name[0].toUpperCase(); });

  let activeFilter = 'all';

  function renderStats() {
    const stats = TASKS.getStats(user.id);
    const elTotal = document.querySelector('[data-stat="total"]');
    const elActive = document.querySelector('[data-stat="active"]');
    const elCompleted = document.querySelector('[data-stat="completed"]');
    if (elTotal) elTotal.textContent = stats.total;
    if (elActive) elActive.textContent = stats.active;
    if (elCompleted) elCompleted.textContent = stats.completed;

    // Badge in sidebar
    const badge = document.querySelector('[data-active-badge]');
    if (badge) {
      badge.textContent = stats.active;
      badge.style.display = stats.active > 0 ? 'inline-flex' : 'none';
    }
  }

  function renderTasks() {
    const allTasks = TASKS.getAll(user.id);
    const filtered = activeFilter === 'all'      ? allTasks
                   : activeFilter === 'active'    ? allTasks.filter(t => !t.completed)
                   : activeFilter === 'completed' ? allTasks.filter(t => t.completed)
                   : allTasks;

    const list = document.querySelector('[data-testid="task-list"]');
    const empty = document.querySelector('[data-testid="task-empty"]');
    if (!list) return;

    list.innerHTML = '';

    if (filtered.length === 0) {
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');

    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = 'task-item' + (task.completed ? ' completed' : '');
      item.setAttribute('data-testid', 'task-item');
      item.setAttribute('data-task-id', task.id);

      const checkbox = document.createElement('div');
      checkbox.className = 'task-checkbox' + (task.completed ? ' checked' : '');
      checkbox.setAttribute('data-testid', 'task-checkbox');
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('aria-checked', task.completed);
      checkbox.setAttribute('tabindex', '0');
      checkbox.addEventListener('click', () => handleToggle(task.id));
      checkbox.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') handleToggle(task.id); });

      const title = document.createElement('span');
      title.className = 'task-title';
      title.setAttribute('data-testid', 'task-title');
      title.textContent = task.title;

      const badge = document.createElement('span');
      badge.className = `task-priority priority-${task.priority}`;
      badge.setAttribute('data-testid', 'task-priority');
      badge.textContent = task.priority;

      const del = document.createElement('button');
      del.className = 'task-delete';
      del.setAttribute('data-testid', 'task-delete');
      del.setAttribute('aria-label', 'Delete task');
      del.innerHTML = '✕';
      del.addEventListener('click', () => handleDelete(task.id, task.title));

      item.append(checkbox, title, badge, del);
      list.appendChild(item);
    });
  }

  function handleToggle(taskId) {
    TASKS.toggle(user.id, taskId);
    renderStats();
    renderTasks();
  }

  function handleDelete(taskId, title) {
    TASKS.remove(user.id, taskId);
    AUTH.showToast(`"${title}" deleted`, 'default');
    renderStats();
    renderTasks();
  }

  // Add task form
  const addForm = document.querySelector('[data-testid="add-task-form"]');
  const taskInput = document.querySelector('[data-testid="task-input"]');
  const prioritySelect = document.querySelector('[data-testid="priority-select"]');
  const taskError = document.querySelector('[data-testid="task-input-error"]');

  if (addForm) {
    addForm.addEventListener('submit', e => {
      e.preventDefault();
      const title = taskInput.value.trim();
      if (!title) {
        taskInput.classList.add('error');
        if (taskError) { taskError.textContent = 'Task title cannot be empty.'; taskError.classList.add('visible'); }
        taskInput.focus();
        return;
      }
      taskInput.classList.remove('error');
      if (taskError) taskError.classList.remove('visible');
      const priority = prioritySelect ? prioritySelect.value : 'medium';
      TASKS.add(user.id, title, priority);
      taskInput.value = '';
      if (prioritySelect) prioritySelect.value = 'medium';
      AUTH.showToast('Task added!', 'success');
      renderStats();
      renderTasks();
    });

    if (taskInput) {
      taskInput.addEventListener('input', () => {
        if (taskInput.value.trim()) {
          taskInput.classList.remove('error');
          if (taskError) taskError.classList.remove('visible');
        }
      });
    }
  }

  // Filter tabs
  document.querySelectorAll('[data-filter]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      renderTasks();
    });
  });

  // Logout
  document.querySelectorAll('[data-testid="logout-btn"]').forEach(btn => {
    btn.addEventListener('click', () => AUTH.logout());
  });

  renderStats();
  renderTasks();
}
