// ============================================
// RITMO MENSUAL - Configuration
// ============================================

export const AREAS = [
  { id: 'cocina',   name: 'Cocina',           emoji: '🍳' },
  { id: 'trabajo',  name: 'Trabajo',          emoji: '💼' },
  { id: 'personal', name: 'Personal',         emoji: '👤' },
  { id: 'compras',  name: 'Compras',          emoji: '🛒' },
  { id: 'ahorros',  name: 'Ahorros',          emoji: '💰' },
  { id: 'metas',    name: 'Metas / Objetivos', emoji: '🎯' },
];

export const PRIORITIES = {
  low:    { label: 'Baja',  value: 'low' },
  medium: { label: 'Media', value: 'medium' },
  high:   { label: 'Alta',  value: 'high' },
};

export const THEMES = ['teal', 'coral', 'soft', 'bright'];

export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Supabase config (reemplazar con tus credenciales)
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
