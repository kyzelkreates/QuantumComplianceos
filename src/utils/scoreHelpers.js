/**
 * QUANTUM COMPLIANCE OS™ — utils/scoreHelpers.js
 * Readiness scoring helpers. Defensive readiness only.
 * Scoring engine lives in Run 2.
 */

import { SETUP_CHECKLIST } from '../core/constants.js';

export function getSetupProgress(state) {
  const total = SETUP_CHECKLIST.length;
  const completed = SETUP_CHECKLIST.filter((item) => {
    try { return item.check(state); } catch { return false; }
  }).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}

export function getActiveSystemCount(systemProfiles = []) {
  return systemProfiles.filter((s) => !s.archived).length;
}

export function getArchivedSystemCount(systemProfiles = []) {
  return systemProfiles.filter((s) => s.archived).length;
}

export function getCriticalSystemCount(systemProfiles = []) {
  return systemProfiles.filter((s) => !s.archived && s.criticality === 'critical').length;
}

export function getReadinessLabel(status) {
  const map = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    complete: 'Complete',
    requires_review: 'Requires Review',
  };
  return map[status] || 'Unknown';
}

export function getReadinessColour(status) {
  const map = {
    not_started: '#6b7280',
    in_progress: '#f59e0b',
    complete: '#10b981',
    requires_review: '#f97316',
  };
  return map[status] || '#6b7280';
}
