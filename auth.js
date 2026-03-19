/* ============================================================
   TaskFlow — Authentication Module
   ============================================================
   Storage keys:
     tf_users       → array of user objects (localStorage)
     tf_session     → current user (sessionStorage)
     tf_remember    → current user (localStorage, persistent)
   ============================================================ */

const AUTH = (() => {
  const USERS_KEY    = 'tf_users';
  const SESSION_KEY  = 'tf_session';
  const REMEMBER_KEY = 'tf_remember';

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    const fromSession  = sessionStorage.getItem(SESSION_KEY);
    const fromRemember = localStorage.getItem(REMEMBER_KEY);
    const raw = fromSession || fromRemember;
    return raw ? JSON.parse(raw) : null;
  }

  // BUG [MEDIUM]: remember=true is ignored — always writes to sessionStorage only,
  // so "keep me logged in" never persists across browser sessions
  function setCurrentUser(user, remember = false) {
    const data = JSON.stringify(user);
    sessionStorage.setItem(SESSION_KEY, data);
    // missing: if (remember) { localStorage.setItem(REMEMBER_KEY, data); }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    window.location.href = 'login.html';
  }

  // BUG [MEDIUM]: duplicate email check is case-sensitive — "User@Example.com" can
  // register even when "user@example.com" already exists
  function register(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const user = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    const sessionUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    setCurrentUser(sessionUser, false);
    return { success: true, user: sessionUser };
  }

  function login(email, password, remember = false) {
    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }
    const sessionUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    setCurrentUser(sessionUser, remember);
    return { success: true, user: sessionUser };
  }

  function updateProfile(id, updates) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    if (updates.name !== undefined) {
      users[idx].name = String(updates.name).trim();
    }
    if (updates.email !== undefined) {
      const newEmail = String(updates.email).trim().toLowerCase();
      if (users.some(u => u.id !== id && u.email.toLowerCase() === newEmail)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      users[idx].email = newEmail;
    }

    saveUsers(users);
    const current = getCurrentUser();
    const updated = { ...current, name: users[idx].name, email: users[idx].email };
    const inLocalStorage = !!localStorage.getItem(REMEMBER_KEY);
    setCurrentUser(updated, inLocalStorage);
    return { success: true, user: updated };
  }

  function changePassword(id, currentPassword, newPassword) {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return { success: false, error: 'User not found.' };
    if (user.password !== currentPassword) return { success: false, error: 'Current password is incorrect.' };
    if (currentPassword === newPassword) return { success: false, error: 'New password must be different from the current password.' };
    user.password = newPassword;
    saveUsers(users);
    return { success: true };
  }

  /** Only same-origin targets; blocks open redirects (external URLs, //, javascript:, etc.). */
  function safePostLoginRedirect(raw) {
    const fallback = 'dashboard.html';
    if (raw == null || raw === '') return fallback;
    const s = String(raw).trim();
    if (s === '/' || s === '') return fallback;
    try {
      const url = new URL(s, window.location.href);
      if (url.origin !== window.location.origin) return fallback;
      const path = url.pathname + url.search + url.hash;
      if (path === '/' || path === '') return fallback;
      return path;
    } catch {
      return fallback;
    }
  }

  function requireAuth() {
    if (!getCurrentUser()) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = 'login.html?redirect=' + redirect;
      return false;
    }
    return true;
  }

  function redirectIfAuth() {
    if (getCurrentUser()) {
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  }

  function seedDemo() {
    const users = getUsers();
    if (!users.find(u => u.email === 'demo@taskflow.app')) {
      users.push({
        id: 'usr_demo',
        name: 'Demo User',
        email: 'demo@taskflow.app',
        password: 'Demo1234!',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
      saveUsers(users);
    }
  }

  function showToast(message, type = 'default', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast' + (type !== 'default' ? ' ' + type : '');
    const icons = { success: '✓', error: '✕', default: 'ℹ' };
    const iconSpan = document.createElement('span');
    iconSpan.textContent = icons[type] || icons.default;
    toast.appendChild(iconSpan);
    toast.appendChild(document.createTextNode(' '));
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all .3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  seedDemo();

  return { getCurrentUser, setCurrentUser, logout, register, login, updateProfile, changePassword, requireAuth, redirectIfAuth, safePostLoginRedirect, showToast };
})();
