// ============================================
// RITMO MENSUAL - Main Entry (Home + Area views)
// ============================================

import { AREAS, PRIORITIES, MONTHS_ES } from './config.js';
import * as storage from './storage.js';

let currentYear, currentMonth;
let currentAreaId = null;

// ---------- Helpers ----------
function getPeriod() {
  return { year: currentYear, month: currentMonth };
}

function updateMonthLabel() {
  const el = document.getElementById('current-month');
  if (el) el.textContent = `${MONTHS_ES[currentMonth]} ${currentYear}`;
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.add('hidden'), 2800);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// ---------- Theme ----------
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  storage.setTheme(theme);
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// ---------- Navigation ----------
function showHome() {
  currentAreaId = null;
  document.getElementById('home-view')?.classList.remove('view-hidden');
  document.getElementById('area-view')?.classList.add('view-hidden');
  document.getElementById('back-btn')?.classList.add('view-hidden');
  document.getElementById('fab-add')?.classList.remove('view-hidden');
  renderHome();
}

function showArea(areaId) {
  currentAreaId = areaId;
  const area = AREAS.find(a => a.id === areaId);
  if (!area) return;

  document.getElementById('home-view')?.classList.add('view-hidden');
  document.getElementById('area-view')?.classList.remove('view-hidden');
  document.getElementById('back-btn')?.classList.remove('view-hidden');
  document.getElementById('fab-add')?.classList.add('view-hidden');

  document.getElementById('area-view-icon').textContent = area.emoji;
  document.getElementById('area-view-title').textContent = area.name;

  renderAreaTasks();
}

// ---------- Render Home ----------
function renderHome() {
  const grid = document.getElementById('areas-home-grid');
  if (!grid) return;

  const tasks = storage.getTasks(currentYear, currentMonth);

  grid.innerHTML = AREAS.map(area => {
    const count = tasks.filter(t => t.area === area.id).length;
    const done = tasks.filter(t => t.area === area.id && t.completed).length;
    const label = count === 0 ? 'Sin tareas' : `${done}/${count} completadas`;

    return `
      <button class="home-area-card" data-area="${area.id}">
        <span class="home-area-icon">${area.emoji}</span>
        <span class="home-area-name">${area.name}</span>
        <span class="home-area-count">${label}</span>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.home-area-card').forEach(card => {
    card.addEventListener('click', () => showArea(card.dataset.area));
  });
}

// ---------- Render Area Tasks ----------
function renderAreaTasks() {
  const container = document.getElementById('area-view-tasks');
  const countEl = document.getElementById('area-view-count');
  if (!container || !currentAreaId) return;

  const tasks = storage.getTasks(currentYear, currentMonth)
    .filter(t => t.area === currentAreaId)
    .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  if (countEl) countEl.textContent = tasks.length;

  if (tasks.length === 0) {
    const area = AREAS.find(a => a.id === currentAreaId);
    container.innerHTML = `
      <div class="area-empty">
        <span>${area?.emoji || '📋'}</span>
        <p>No hay tareas en esta área</p>
        <p style="font-size:0.85rem;margin-top:6px">Pulsa el botón + para crear una</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tasks.map(task => {
    const dueStr = task.due
      ? new Date(task.due + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
      : '';
    const isOverdue = task.due && !task.completed && new Date(task.due) < new Date().setHours(0, 0, 0, 0);
    const pri = PRIORITIES[task.priority] || PRIORITIES.medium;

    return `
      <div class="task-list-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-list-row">
          <div class="task-list-check" data-id="${task.id}">${task.completed ? '✓' : ''}</div>
          <div class="task-list-title">${escapeHtml(task.title)}</div>
        </div>
        ${task.notes ? `<div class="task-notes-preview" style="margin-left:34px;margin-top:4px">${escapeHtml(task.notes)}</div>` : ''}
        <div class="task-list-meta">
          <span class="task-priority ${task.priority}">${pri.label}</span>
          ${dueStr ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">📅 ${dueStr}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Checkbox toggle
  container.querySelectorAll('.task-list-check').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      storage.toggleTask(currentYear, currentMonth, el.dataset.id);
      renderAreaTasks();
      renderHome();
    });
  });

  // Open edit
  container.querySelectorAll('.task-list-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.task-list-check')) return;
      const tasks = storage.getTasks(currentYear, currentMonth);
      const task = tasks.find(t => t.id === card.dataset.id);
      if (task) openTaskModal({ task });
    });
  });
}

// ---------- Month change ----------
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  updateMonthLabel();
  if (currentAreaId) renderAreaTasks();
  else renderHome();
}

// ---------- Task Modal ----------
function openTaskModal({ task = null, area = null } = {}) {
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
    document.getElementById('task-area').value = area || currentAreaId || 'personal';
  }

  modal.classList.remove('hidden');
  document.getElementById('task-title')?.focus();
}

function closeTaskModal() {
  document.getElementById('task-modal')?.classList.add('hidden');
}

// ---------- Auth ----------
function showApp(user) {
  document.getElementById('auth-screen')?.classList.add('hidden');
  document.getElementById('app')?.classList.remove('hidden');
  document.getElementById('user-name').textContent = user.name || 'Usuario';
  document.getElementById('user-email').textContent = user.email || '';
  document.getElementById('user-avatar').textContent = (user.name || 'U')[0].toUpperCase();
  document.getElementById('greeting-text').textContent = `Hola, ${user.name || 'Usuario'}`;

  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();
  updateMonthLabel();
  showHome();
}

function showAuth() {
  document.getElementById('auth-screen')?.classList.remove('hidden');
  document.getElementById('app')?.classList.add('hidden');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  // Theme
  applyTheme(storage.getTheme());

  // Auth state
  const user = storage.getUser();
  if (user) showApp(user);
  else showAuth();

  // Auth tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab === 'login' ? 'login-form' : 'register-form')?.classList.add('active');
    });
  });

  // Login
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    if (!email) return showToast('Escribe tu correo');
    const u = { name: email.split('@')[0], email };
    storage.setUser(u);
    showApp(u);
    showToast('¡Bienvenido de nuevo!');
  });

  // Register
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name')?.value.trim() || 'Usuario';
    const email = document.getElementById('register-email')?.value.trim();
    if (!email) return showToast('Escribe tu correo');
    const u = { name, email };
    storage.setUser(u);
    showApp(u);
    showToast('Cuenta creada correctamente');
  });

  // Magic link
  document.getElementById('magic-link-btn')?.addEventListener('click', () => {
    const email = document.getElementById('login-email')?.value.trim();
    if (!email) return showToast('Escribe tu correo primero');
    const u = { name: email.split('@')[0], email };
    storage.setUser(u);
    showApp(u);
    showToast('Magic Link simulado ✓');
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    storage.logout();
    showAuth();
    document.getElementById('user-dropdown')?.classList.add('hidden');
  });

  // Month nav
  document.getElementById('prev-month')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('next-month')?.addEventListener('click', () => changeMonth(1));

  // Back button
  document.getElementById('back-btn')?.addEventListener('click', showHome);

  // Theme panel
  const themePanel = document.getElementById('theme-panel');
  document.getElementById('theme-btn')?.addEventListener('click', () => themePanel?.classList.toggle('hidden'));
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

  // Bottom sheet
  const areaSheet = document.getElementById('area-sheet');
  function openSheet() { areaSheet?.classList.remove('hidden'); }
  function closeSheet() { areaSheet?.classList.add('hidden'); }

  document.getElementById('fab-add')?.addEventListener('click', openSheet);
  document.querySelector('.bottom-sheet-backdrop')?.addEventListener('click', closeSheet);

  // From sheet → go to that area (or open modal if already inside an area)
  document.querySelectorAll('.area-card').forEach(card => {
    card.addEventListener('click', () => {
      const area = card.dataset.area;
      closeSheet();
      showArea(area);
    });
  });

  // FAB inside area → new task for current area
  document.getElementById('area-fab')?.addEventListener('click', () => {
    openTaskModal({ area: currentAreaId });
  });

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeTaskModal));
  document.querySelector('.modal-backdrop')?.addEventListener('click', closeTaskModal);

  // Modal submit
  document.getElementById('task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
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
      storage.updateTask(currentYear, currentMonth, id, data);
      showToast('Tarea actualizada');
    } else {
      storage.addTask(currentYear, currentMonth, data);
      showToast('Tarea creada');
    }

    closeTaskModal();

    // Refresh current view
    if (currentAreaId) {
      // If task was created in another area, go there
      if (data.area !== currentAreaId) showArea(data.area);
      else renderAreaTasks();
    } else {
      renderHome();
    }
  });

  // Export
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const tasks = storage.getTasks(currentYear, currentMonth);
    const dataStr = JSON.stringify({ year: currentYear, month: currentMonth + 1, tasks }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritmo-mensual-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Mes exportado en JSON');
  });

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
