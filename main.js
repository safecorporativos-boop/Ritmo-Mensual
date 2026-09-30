// ============================================
// RITMO MENSUAL - Main Entry (versión segura)
// ============================================

import { THEMES } from './config.js';
import * as storage from './storage.js';
import { initBoard, changeMonth, getCurrentPeriod, scrollToArea } from './board.js';

// ---------- Theme ----------
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  storage.setTheme(theme);
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function initTheme() {
  const saved = storage.getTheme();
  applyTheme(saved);
}

// ---------- Auth ----------
function showApp(user) {
  const auth = document.getElementById('auth-screen');
  const app = document.getElementById('app');
  if (auth) auth.classList.add('hidden');
  if (app) app.classList.remove('hidden');

  const nameEl = document.getElementById('user-name');
  const emailEl = document.getElementById('user-email');
  const avatarEl = document.getElementById('user-avatar');

  if (nameEl) nameEl.textContent = user.name || 'Usuario';
  if (emailEl) emailEl.textContent = user.email || '';
  if (avatarEl) avatarEl.textContent = (user.name || 'U')[0].toUpperCase();

  const now = new Date();
  initBoard(now.getFullYear(), now.getMonth());
}

function showAuth() {
  const auth = document.getElementById('auth-screen');
  const app = document.getElementById('app');
  if (auth) auth.classList.remove('hidden');
  if (app) app.classList.add('hidden');
}

function initAuth() {
  const user = storage.getUser();
  if (user) {
    showApp(user);
  } else {
    showAuth();
  }

  // Tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      const formId = tab.dataset.tab === 'login' ? 'login-form' : 'register-form';
      const form = document.getElementById(formId);
      if (form) form.classList.add('active');
    });
  });

  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      if (!email) {
        showToast('Escribe tu correo');
        return;
      }
      const user = { name: email.split('@')[0], email };
      storage.setUser(user);
      showApp(user);
      showToast('¡Bienvenido de nuevo!');
    });
  }

  // Register
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name')?.value.trim() || 'Usuario';
      const email = document.getElementById('register-email')?.value.trim();
      if (!email) {
        showToast('Escribe tu correo');
        return;
      }
      const user = { name, email };
      storage.setUser(user);
      showApp(user);
      showToast('Cuenta creada correctamente');
    });
  }

  // Magic link
  document.getElementById('magic-link-btn')?.addEventListener('click', () => {
    const email = document.getElementById('login-email')?.value.trim();
    if (!email) {
      showToast('Escribe tu correo primero');
      return;
    }
    const user = { name: email.split('@')[0], email };
    storage.setUser(user);
    showApp(user);
    showToast('Magic Link simulado ✓');
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    storage.logout();
    showAuth();
    document.getElementById('user-dropdown')?.classList.add('hidden');
  });
}

// ---------- Task Modal ----------
function openTaskModal({ task = null, area = 'personal' } = {}) {
  const modal = document.getElementById('task-modal');
  const form = document.getElementById('task-form');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('task-id').value = '';

  if (task) {
    document.getElementById('modal-title').textContent = 'Editar tarea';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-area').value = task.area;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-due').value = task.due || '';
    document.getElementById('task-notes').value = task.notes || '';
  } else {
    document.getElementById('modal-title').textContent = 'Nueva tarea';
    document.getElementById('task-area').value = area;
  }

  modal.classList.remove('hidden');
  document.getElementById('task-title')?.focus();
}

function closeTaskModal() {
  document.getElementById('task-modal')?.classList.add('hidden');
}

function initModal() {
  window.addEventListener('open-task-modal', (e) => {
    openTaskModal(e.detail || {});
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeTaskModal);
  });
  document.querySelector('.modal-backdrop')?.addEventListener('click', closeTaskModal);

  document.getElementById('task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const { year, month } = getCurrentPeriod();
    const id = document.getElementById('task-id').value;
    const data = {
      title: document.getElementById('task-title').value.trim(),
      area: document.getElementById('task-area').value,
      priority: document.getElementById('task-priority').value,
      due: document.getElementById('task-due').value || null,
      notes: document.getElementById('task-notes').value.trim(),
    };

    if (!data.title) return;

    if (id) {
      storage.updateTask(year, month, id, data);
      showToast('Tarea actualizada');
    } else {
      storage.addTask(year, month, data);
      showToast('Tarea creada');
    }

    closeTaskModal();
    const period = getCurrentPeriod();
    initBoard(period.year, period.month);
  });
}

// ---------- UI ----------
function initUI() {
  document.getElementById('prev-month')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('next-month')?.addEventListener('click', () => changeMonth(1));

  // Theme panel
  const themeBtn = document.getElementById('theme-btn');
  const themePanel = document.getElementById('theme-panel');
  themeBtn?.addEventListener('click', () => themePanel?.classList.toggle('hidden'));
  document.getElementById('close-theme')?.addEventListener('click', () => themePanel?.classList.add('hidden'));

  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      themePanel?.classList.add('hidden');
      showToast(`Tema ${btn.querySelector('span')?.textContent || ''} aplicado`);
    });
  });

  // User dropdown
  document.getElementById('user-btn')?.addEventListener('click', () => {
    document.getElementById('user-dropdown')?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      document.getElementById('user-dropdown')?.classList.add('hidden');
    }
    if (!e.target.closest('#theme-btn') && !e.target.closest('#theme-panel')) {
      themePanel?.classList.add('hidden');
    }
  });

  // Area chips
  document.querySelectorAll('.area-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.area-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      scrollToArea(chip.dataset.area);
    });
  });

  // Bottom sheet
  const areaSheet = document.getElementById('area-sheet');

  function openAreaSheet() {
    areaSheet?.classList.remove('hidden');
  }
  function closeAreaSheet() {
    areaSheet?.classList.add('hidden');
  }

  document.getElementById('fab-add')?.addEventListener('click', openAreaSheet);
  document.querySelector('.bottom-sheet-backdrop')?.addEventListener('click', closeAreaSheet);

  document.querySelectorAll('.area-card').forEach(card => {
    card.addEventListener('click', () => {
      closeAreaSheet();
      openTaskModal({ area: card.dataset.area });
    });
  });

  // Export
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const { year, month } = getCurrentPeriod();
    const tasks = storage.getTasks(year, month);
    const dataStr = JSON.stringify({ year, month: month + 1, tasks }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritmo-mensual-${year}-${String(month + 1).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Mes exportado en JSON');
  });
}

// ---------- Toast ----------
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
}

// ---------- Service Worker ----------
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', () => {
  try {
    initTheme();
    initAuth();
    initUI();
    initModal();
    registerSW();
  } catch (err) {
    console.error('Error al iniciar la app:', err);
    alert('Error al cargar la app. Revisa la consola (F12).');
  }
});
