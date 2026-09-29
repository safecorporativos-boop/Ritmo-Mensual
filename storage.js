// ============================================
// RITMO MENSUAL - Local Storage Layer
// (Ready to swap with Supabase later)
// ============================================

const STORAGE_KEY = 'ritmo_mensual_data';
const THEME_KEY = 'ritmo_mensual_theme';
const USER_KEY = 'ritmo_mensual_user';

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { months: {} };
  } catch {
    return { months: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

// ---------- Tasks ----------

export function getTasks(year, month) {
  const data = getData();
  const key = monthKey(year, month);
  return data.months[key]?.tasks || [];
}

export function saveTasks(year, month, tasks) {
  const data = getData();
  const key = monthKey(year, month);
  if (!data.months[key]) data.months[key] = {};
  data.months[key].tasks = tasks;
  saveData(data);
}

export function addTask(year, month, task) {
  const tasks = getTasks(year, month);
  const newTask = {
    id: crypto.randomUUID(),
    title: task.title,
    area: task.area || 'personal',
    priority: task.priority || 'medium',
    due: task.due || null,
    notes: task.notes || '',
    completed: false,
    createdAt: new Date().toISOString(),
    order: tasks.length,
  };
  tasks.push(newTask);
  saveTasks(year, month, tasks);
  return newTask;
}

export function updateTask(year, month, taskId, updates) {
  const tasks = getTasks(year, month);
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
  saveTasks(year, month, tasks);
  return tasks[idx];
}

export function deleteTask(year, month, taskId) {
  let tasks = getTasks(year, month);
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks(year, month, tasks);
}

export function toggleTask(year, month, taskId) {
  const tasks = getTasks(year, month);
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  saveTasks(year, month, tasks);
  return task;
}

export function moveTask(year, month, taskId, newArea, newOrder) {
  const tasks = getTasks(year, month);
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.area = newArea;
  if (typeof newOrder === 'number') task.order = newOrder;
  task.updatedAt = new Date().toISOString();
  saveTasks(year, month, tasks);
}

// ---------- Theme ----------

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'coral';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

// ---------- Fake User (until Supabase) ----------

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function logout() {
  localStorage.removeItem(USER_KEY);
}
