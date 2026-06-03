/**
 * QUANTUM COMPLIANCE OS™ — utils/text.js
 * Text formatting utilities.
 */

export function truncate(str, maxLen = 80) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str) {
  if (!str) return '';
  return str
    .split(/[\s_-]+/)
    .map((w) => capitalize(w.toLowerCase()))
    .join(' ');
}

export function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}

export function joinList(arr, conjunction = 'and') {
  if (!arr || arr.length === 0) return '—';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} ${conjunction} ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')}, ${conjunction} ${arr[arr.length - 1]}`;
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
