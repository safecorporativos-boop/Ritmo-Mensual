// ============================================
// RITMO MENSUAL - Board (Kanban)
// ============================================

import { AREAS, PRIORITIES, MONTHS_ES } from './config.js';
import * as storage from './storage.js';

let currentYear, currentMonth;
let draggedTaskId = null;

export function initBoard(year, month) {
  currentYear = year;
  currentMonth = month;
  renderBoard();
  updateMonthLabel();
}

export function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderBoard();
  updateMonthLabel();
}

export function getCurrentPeriod() {
  return { year: currentYear, month: currentMonth };
}

function updateMonthLabel() {
  const el = document.getElementById('current-month');
  if (el) el.textContent = `${MONTHS_ES[currentMonth]} ${currentYear}`;
}

function renderBoard() {
  const board = document.getElementById('board');
  if (!board) return;

  const tasks = storage.getTasks(currentYear, currentMonth);

  board.innerHTML = AREAS.map(area => {
    const areaTasks = tasks
      .filter(t => t.area === area.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return `
      <div class="column" data-area="${area.id}">
        <div class="column-header">
          <div class="column-title">
            <span class="column-dot"></span>
            <span>${area.emoji} ${area.name}</span>
            <span class="column-count">${areaTasks.length}</span>
          </div>
          <button class="column-add" data-area="${area.id}" title="Añadir tarea" aria-label="Añadir tarea en ${area.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        <div class="column-tasks" data-area="${area.id}">
          ${areaTasks.length === 0
            ? `<div class="column-empty"><span>${area.emoji}</span>Sin tareas</div>`
            : areaTasks.map(t => renderTaskCard(t)).join('')
          }
        </div>
      </div>
    `;
  }).join('');

  attachBoardEvents();
}

function renderTaskCard(task) {
  const dueStr = task.due
    ? new Date(task.due + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
    : '';
  const isOverdue = task.due && !task.completed && new Date(task.due) < new Date().setHours(0,0,0,0);

  return `
    <div class="task-card ${task.completed ? 'completed' : ''}" 
         draggable="true" 
         data-id="${task.id}"
         data-area="${task.area}">
      <div class="task-header">
        <div class="task-check" data-id="${task.id}" role="checkbox" aria-checked="${task.completed}">
          ${task.completed ? '✓' : ''}
        </div>
        <div class="task-title">${escapeHtml(task.title)}</div>
      </div>
      ${task.notes ? `<div class="task-notes-preview">${escapeHtml(task.notes)}</div>` : ''}
      <div class="task-meta">
        <span class="task-priority ${task.priority}">${PRIORITIES[task.priority]?.label || task.priority}</span>
        ${dueStr ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">📅 ${dueStr}</span>` : ''}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function attachBoardEvents() {
  // Add buttons
  document.querySelectorAll('.column-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const area = btn.dataset.area;
      window.dispatchEvent(new CustomEvent('open-task-modal', { detail: { area } }));
    });
  });

  // Checkboxes
  document.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.id;
      storage.toggleTask(currentYear, currentMonth, id);
      renderBoard();
    });
  });

  // Open edit on card click
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.task-check')) return;
      const id = card.dataset.id;
      const tasks = storage.getTasks(currentYear, currentMonth);
      const task = tasks.find(t => t.id === id);
      if (task) {
        window.dispatchEvent(new CustomEvent('open-task-modal', { detail: { task } }));
      }
    });
  });

  // Drag and drop
  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedTaskId = card.dataset.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedTaskId);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedTaskId = null;
      document.querySelectorAll('.column-tasks').forEach(c => c.classList.remove('drag-over'));
    });
  });

  document.querySelectorAll('.column-tasks').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
      const newArea = zone.dataset.area;
      if (taskId && newArea) {
        storage.moveTask(currentYear, currentMonth, taskId, newArea);
        renderBoard();
      }
    });
  });
}

// Area chips scroll
export function scrollToArea(areaId) {
  const col = document.querySelector(`.column[data-area="${areaId}"]`);
  if (col) {
    col.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }
}
