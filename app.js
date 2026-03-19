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

  function add(userId, title, priority = 'medium', dueDate = null) {
    const tasks = getAll(userId);
    const task = {
      id: 'task_' + Date.now(),
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
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

  // BUG [HIGH]: inverted filter — keeps only the target task, deletes everything else
  function remove(userId, taskId) {
    const tasks = getAll(userId).filter(t => t.id === taskId);
    save(userId, tasks);
    return tasks;
  }

  // BUG [HIGH]: active and completed counts are swapped
  function getStats(userId) {
    const tasks = getAll(userId);
    return {
      total:     tasks.length,
      completed: tasks.filter(t => !t.completed).length,
      active:    tasks.filter(t =>  t.completed).length,
    };
  }

  // BUG [HIGH]: marks already-completed tasks as INCOMPLETE instead of marking active tasks complete
  function markAllComplete(userId) {
    const tasks = getAll(userId);
    let count = 0;
    tasks.forEach(task => {
      if (task.completed) {
        task.completed  = false;
        task.completedAt = null;
        count++;
      }
    });
    save(userId, tasks);
    return count;
  }

  // BUG [HIGH]: clears ACTIVE tasks instead of completed ones (filter is inverted)
  function clearCompleted(userId) {
    const all  = getAll(userId);
    const kept = all.filter(t => t.completed);
    save(userId, kept);
    return all.length - kept.length;
  }

  // BUG [LOW]: empty string title allowed (no validation)
  function updateTitle(userId, taskId, newTitle) {
    const tasks = getAll(userId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.title = newTitle;
      save(userId, tasks);
    }
    return task;
  }

  // BUG [MEDIUM]: comparison is inverted — flags tasks with FUTURE due dates as overdue
  function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) > new Date();
  }

  // BUG [LOW]: returns total task count, not overdue count
  function getOverdueCount(userId) {
    const tasks = getAll(userId);
    return tasks.length;
  }

  // Sort tasks — has several bugs
  function sortTasks(tasks, sortBy) {
    const arr = [...tasks];
    switch (sortBy) {
      case 'newest':
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // BUG [MEDIUM]: "Oldest first" uses same comparator as newest — shows newest first
      case 'oldest':
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // BUG [MEDIUM]: "By priority" sorts alphabetically by title instead of by priority level
      case 'priority': {
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      }

      // BUG [LOW]: "A → Z" sorts Z → A (comparator arguments are flipped)
      case 'az':
        return arr.sort((a, b) => b.title.localeCompare(a.title));

      case 'za':
        return arr.sort((a, b) => a.title.localeCompare(b.title));

      default:
        return arr;
    }
  }

  function seedDemo() {
    const demoKey = key('usr_demo');
    if (!localStorage.getItem(demoKey)) {
      const now = Date.now();
      const tasks = [
        { id: 'task_d1', title: 'Review project requirements',    priority: 'high',   dueDate: new Date(now - 86400000 * 2).toISOString().slice(0,10), completed: true,  createdAt: new Date(now - 86400000 * 3).toISOString(), completedAt: new Date(now - 86400000 * 2).toISOString() },
        { id: 'task_d2', title: 'Set up development environment', priority: 'high',   dueDate: null,                                                     completed: true,  createdAt: new Date(now - 86400000 * 2).toISOString(), completedAt: new Date(now - 86400000).toISOString() },
        { id: 'task_d3', title: 'Write unit tests for auth module', priority: 'medium', dueDate: new Date(now + 86400000 * 2).toISOString().slice(0,10), completed: false, createdAt: new Date(now - 86400000).toISOString(),     completedAt: null },
        { id: 'task_d4', title: 'Design dashboard wireframes',      priority: 'medium', dueDate: new Date(now - 86400000).toISOString().slice(0,10),     completed: false, createdAt: new Date(now - 3600000 * 5).toISOString(),  completedAt: null },
        { id: 'task_d5', title: 'Update README documentation',      priority: 'low',    dueDate: null,                                                   completed: false, createdAt: new Date(now - 3600000 * 2).toISOString(),  completedAt: null },
      ];
      save('usr_demo', tasks);
    }
  }

  seedDemo();

  return { getAll, add, toggle, remove, getStats, markAllComplete, clearCompleted, updateTitle, isOverdue, getOverdueCount, sortTasks };
})();

/* ============================================================
   Dashboard renderer
   ============================================================ */
function initDashboard() {
  if (!AUTH.requireAuth()) return;
  const user = AUTH.getCurrentUser();

  document.querySelectorAll('[data-user-name]').forEach(el  => { el.textContent = user.name; });
  document.querySelectorAll('[data-user-email]').forEach(el => { el.textContent = user.email; });
  document.querySelectorAll('[data-user-avatar]').forEach(el => { el.textContent = user.name[0].toUpperCase(); });

  let activeFilter = 'all';
  let searchQuery  = '';
  let sortBy       = 'default';

  // BUG [LOW]: page title only updates when a task is ADDED — stale after delete or toggle
  function updatePageTitle() {
    const stats = TASKS.getStats(user.id);
    document.title = `(${stats.active} active) Dashboard — TaskFlow`;
  }

  function renderStats() {
    const stats = TASKS.getStats(user.id);
    const elTotal     = document.querySelector('[data-stat="total"]');
    const elActive    = document.querySelector('[data-stat="active"]');
    const elCompleted = document.querySelector('[data-stat="completed"]');
    if (elTotal)     elTotal.textContent     = stats.total;
    if (elActive)    elActive.textContent    = stats.active;
    if (elCompleted) elCompleted.textContent = stats.completed;

    const activeBadge = document.querySelector('[data-active-badge]');
    if (activeBadge) {
      activeBadge.textContent = stats.active;
      activeBadge.style.display = stats.active > 0 ? 'inline-flex' : 'none';
    }

    // Overdue stats — BUG [LOW]: getOverdueCount returns total, not real overdue count
    const overdueCount = TASKS.getOverdueCount(user.id);
    const statOverdue  = document.getElementById('stat-overdue-value');
    if (statOverdue) statOverdue.textContent = overdueCount;

    const overdueBadge = document.getElementById('overdue-badge');
    if (overdueBadge) {
      overdueBadge.textContent = overdueCount;
      overdueBadge.style.display = overdueCount > 0 ? 'inline-flex' : 'none';
    }
  }

  function renderTasks() {
    const allTasks = TASKS.getAll(user.id);

    // BUG [MEDIUM]: "Active" filter shows completed tasks; "Completed" shows active tasks
    let byFilter;
    if (activeFilter === 'all')       byFilter = allTasks;
    else if (activeFilter === 'active')    byFilter = allTasks.filter(t =>  t.completed);
    else if (activeFilter === 'completed') byFilter = allTasks.filter(t => !t.completed);
    else if (activeFilter === 'overdue')   byFilter = allTasks.filter(t => TASKS.isOverdue(t));
    else byFilter = allTasks;

    // Apply sort
    const sorted = TASKS.sortTasks(byFilter, sortBy);

    // BUG [MEDIUM]: search is case-sensitive
    const filtered = searchQuery
      ? sorted.filter(t => t.title.includes(searchQuery))
      : sorted;

    const list  = document.querySelector('[data-testid="task-list"]');
    const empty = document.querySelector('[data-testid="task-empty"]');
    if (!list) return;

    list.innerHTML = '';

    if (filtered.length === 0) {
      if (empty) {
        empty.classList.remove('hidden');
        const msg = document.getElementById('empty-message');
        if (msg) {
          if (searchQuery)                       msg.textContent = `No tasks matching "${searchQuery}".`;
          else if (activeFilter === 'completed') msg.textContent = 'No completed tasks yet.';
          else if (activeFilter === 'active')    msg.textContent = 'No active tasks — great job!';
          else if (activeFilter === 'overdue')   msg.textContent = 'No overdue tasks!';
          else                                   msg.textContent = 'No tasks yet. Add your first task above!';
        }
      }
      return;
    }
    if (empty) empty.classList.add('hidden');

    filtered.forEach(task => {
      const overdue = TASKS.isOverdue(task);
      const item = document.createElement('div');
      item.className = 'task-item' + (task.completed ? ' completed' : '') + (overdue ? ' task-overdue' : '');
      item.setAttribute('data-testid', 'task-item');
      item.setAttribute('data-task-id', task.id);

      // Checkbox
      const checkbox = document.createElement('div');
      checkbox.className = 'task-checkbox' + (task.completed ? ' checked' : '');
      checkbox.setAttribute('data-testid', 'task-checkbox');
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('aria-checked', task.completed);
      checkbox.setAttribute('tabindex', '0');
      checkbox.addEventListener('click', () => handleToggle(task.id));
      checkbox.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') handleToggle(task.id); });

      // Title (double-click to edit inline)
      const titleEl = document.createElement('span');
      titleEl.className = 'task-title';
      titleEl.setAttribute('data-testid', 'task-title');
      titleEl.textContent = task.title;
      titleEl.title = 'Double-click to edit';
      titleEl.style.cursor = 'default';
      titleEl.addEventListener('dblclick', () => startEdit(task.id, titleEl, task.title));

      // Due date label (BUG [LOW]: shows createdAt date as completion time for completed tasks)
      let metaEl = null;
      if (task.completed && task.completedAt) {
        metaEl = document.createElement('span');
        metaEl.className = 'task-meta-label';
        metaEl.setAttribute('data-testid', 'task-completed-at');
        // BUG [LOW]: displays createdAt instead of completedAt
        metaEl.textContent = 'Done ' + new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (task.dueDate) {
        metaEl = document.createElement('span');
        metaEl.className = 'task-meta-label' + (overdue ? ' due-overdue' : ' due-upcoming');
        metaEl.setAttribute('data-testid', 'task-due-date');
        const dateStr = new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        metaEl.textContent = (overdue ? '⚠ Overdue · ' : '📅 Due ') + dateStr;
      }

      // Priority badge
      const badge = document.createElement('span');
      badge.className = `task-priority priority-${task.priority}`;
      badge.setAttribute('data-testid', 'task-priority');
      badge.textContent = task.priority;

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'task-delete';
      editBtn.setAttribute('data-testid', 'task-edit-btn');
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.innerHTML = '✎';
      editBtn.style.fontSize = '.9rem';
      editBtn.addEventListener('click', () => startEdit(task.id, titleEl, task.title));

      // Delete button
      const del = document.createElement('button');
      del.className = 'task-delete';
      del.setAttribute('data-testid', 'task-delete');
      del.setAttribute('aria-label', 'Delete task');
      del.innerHTML = '✕';
      del.addEventListener('click', () => handleDelete(task.id, task.title));

      if (metaEl) item.append(checkbox, titleEl, metaEl, badge, editBtn, del);
      else        item.append(checkbox, titleEl, badge, editBtn, del);
      list.appendChild(item);
    });
  }

  // Inline task title editing — BUG [LOW]: allows saving empty title
  function startEdit(taskId, titleEl, currentTitle) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'form-input';
    input.setAttribute('data-testid', 'task-edit-input');
    input.style.cssText = 'flex:1;padding:.3rem .6rem;font-size:.9rem;height:auto;';
    titleEl.replaceWith(input);
    input.focus();
    input.select();

    function commitEdit() {
      const newTitle = input.value;
      TASKS.updateTitle(user.id, taskId, newTitle);
      renderStats();
      renderTasks();
    }

    input.addEventListener('blur',    commitEdit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { input.blur(); }
      if (e.key === 'Escape') { input.value = currentTitle; input.blur(); }
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

  // ── Search ──
  const searchInput = document.querySelector('[data-testid="task-search"]');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      renderTasks();
    });
  }
  const clearSearchBtn = document.querySelector('[data-testid="clear-search"]');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) { searchInput.value = ''; searchQuery = ''; }
      renderTasks();
      if (searchInput) searchInput.focus();
    });
  }

  // ── Sort ──
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortBy = sortSelect.value;
      renderTasks();
    });
  }

  // ── Mark all complete — BUG [HIGH]: actually uncompletes all tasks ──
  const markAllBtn = document.getElementById('mark-all-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      const count = TASKS.markAllComplete(user.id);
      // BUG [LOW]: toast always says "0 tasks marked complete" regardless of actual count
      AUTH.showToast('0 tasks marked complete', 'success');
      renderStats();
      renderTasks();
    });
  }

  // ── Clear completed — BUG [HIGH]: removes active tasks instead ──
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const removed = TASKS.clearCompleted(user.id);
      AUTH.showToast(`${removed} task(s) removed`, 'default');
      renderStats();
      renderTasks();
    });
  }

  // ── Add task ──
  const addForm     = document.querySelector('[data-testid="add-task-form"]');
  const taskInput   = document.querySelector('[data-testid="task-input"]');
  const prioritySel = document.querySelector('[data-testid="priority-select"]');
  const dueDateInp  = document.querySelector('[data-testid="due-date-input"]');
  const taskError   = document.querySelector('[data-testid="task-input-error"]');

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
      const priority = prioritySel ? prioritySel.value : 'medium';
      const dueDate  = dueDateInp  ? dueDateInp.value  : null;
      TASKS.add(user.id, title, priority, dueDate || null);
      taskInput.value = '';
      if (prioritySel) prioritySel.value = 'medium';
      if (dueDateInp)  dueDateInp.value  = '';
      AUTH.showToast('Task added!', 'success');
      updatePageTitle();
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

  // ── Filter tabs ──
  document.querySelectorAll('[data-filter]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      renderTasks();
    });
  });

  // ── Dark mode — BUG [MEDIUM]: only the sidebar goes dark, main content stays white ──
  const darkBtn = document.getElementById('dark-mode-btn');
  if (darkBtn) {
    let isDark = false;
    darkBtn.addEventListener('click', () => {
      isDark = !isDark;
      const sidebar = document.getElementById('sidebar');
      if (isDark) {
        sidebar.classList.add('dark');
        darkBtn.textContent = '☀️ Light mode';
      } else {
        sidebar.classList.remove('dark');
        darkBtn.textContent = '🌙 Dark mode';
      }
    });
  }

  // ── Logout ──
  document.querySelectorAll('[data-testid="logout-btn"]').forEach(btn => {
    btn.addEventListener('click', () => AUTH.logout());
  });

  updatePageTitle();
  renderStats();
  renderTasks();
}
