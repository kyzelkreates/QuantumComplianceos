/**
 * QUANTUM COMPLIANCE OS™ — utils/id.js
 * Unique ID generation. No external dependencies.
 */

export function generateId(prefix = 'id') {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

export function generateShortId() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}
