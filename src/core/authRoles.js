/**
 * QUANTUM COMPLIANCE OS™ — authRoles.js
 * Run 25 — Auth + Team Roles + Client Permissions Layer
 * ======================================================
 * Central role configuration, permission matrix, and auth-state model.
 * This is the single source of truth for roles and permissions.
 *
 * SECURITY POSITION:
 * Frontend role checks improve UI safety and user experience.
 * Real production access control MUST be enforced by the backend using:
 *   - Supabase Auth (or equivalent)
 *   - Row Level Security (RLS) policies
 *   - Database-level policies
 *   - Server-side validation
 *   - Secure API rules
 *
 * Demo roles are for presentation only. They do not represent
 * production authentication or access control.
 *
 * SAFETY:
 * - No real auth SDK in this file
 * - No backend-only secrets
 * - No fake login success
 * - No production security guarantees
 * - Local-first, SSOT-aligned
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

// ─────────────────────────────────────────────────────────────────────────────
// ROLE IDs
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE = {
  OWNER:         'owner',
  ADMIN:         'admin',
  CONSULTANT:    'consultant',
  ANALYST:       'analyst',
  CLIENT_VIEWER: 'client_viewer',
  AUDITOR:       'auditor',
  DEMO_USER:     'demo_user',
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_META = {
  [ROLE.OWNER]: {
    id:          ROLE.OWNER,
    label:       'Owner',
    icon:        '👑',
    colour:      '#D4AF37',
    description: 'Full account and product owner. Manages organisation settings, backend, users, roles, clients, reports, evidence, AI settings, exports, and live/demo configuration.',
    isDemo:      false,
    level:       100,
  },
  [ROLE.ADMIN]: {
    id:          ROLE.ADMIN,
    label:       'Admin',
    icon:        '⚙️',
    colour:      '#00d4ff',
    description: 'Manages clients, reports, evidence, assessments, team members, and operational settings. Cannot access backend secrets or ownership transfer controls.',
    isDemo:      false,
    level:       80,
  },
  [ROLE.CONSULTANT]: {
    id:          ROLE.CONSULTANT,
    label:       'Consultant',
    icon:        '🧑‍💼',
    colour:      '#8b5cf6',
    description: 'Creates and manages assigned clients, assessments, reports, evidence notes, and AI-assisted summaries. Cannot manage global backend settings unless explicitly allowed.',
    isDemo:      false,
    level:       60,
  },
  [ROLE.ANALYST]: {
    id:          ROLE.ANALYST,
    label:       'Analyst',
    icon:        '📊',
    colour:      '#10b981',
    description: 'Reviews assessments, risk scores, reports, and evidence. Can add notes where allowed. Cannot change backend settings or team roles.',
    isDemo:      false,
    level:       40,
  },
  [ROLE.CLIENT_VIEWER]: {
    id:          ROLE.CLIENT_VIEWER,
    label:       'Client Viewer',
    icon:        '👁',
    colour:      '#6b7280',
    description: 'Views assigned client reports, evidence summaries, and readiness status. Cannot view other clients or change consultant/admin settings.',
    isDemo:      false,
    level:       20,
  },
  [ROLE.AUDITOR]: {
    id:          ROLE.AUDITOR,
    label:       'Auditor / Read Only',
    icon:        '📋',
    colour:      '#6b7280',
    description: 'Views assigned records and exports/report summaries. Cannot edit client data, settings, users, roles, backend config, or evidence.',
    isDemo:      false,
    level:       15,
  },
  [ROLE.DEMO_USER]: {
    id:          ROLE.DEMO_USER,
    label:       'Demo User',
    icon:        '🎯',
    colour:      '#f59e0b',
    description: 'Demo mode preview only. Can preview workflows without real backend permissions. Not valid in live/product mode.',
    isDemo:      true,
    level:       0,
  },
};

export const ALL_ROLES = Object.values(ROLE_META);

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION KEYS
// ─────────────────────────────────────────────────────────────────────────────

export const PERM = {
  // Dashboard
  VIEW_DASHBOARD:             'view_dashboard',

  // Clients
  VIEW_ALL_CLIENTS:           'view_all_clients',
  VIEW_ASSIGNED_CLIENTS:      'view_assigned_clients',
  CREATE_CLIENT:              'create_client',
  EDIT_CLIENT:                'edit_client',
  ARCHIVE_CLIENT:             'archive_client',
  DELETE_CLIENT:              'delete_client',

  // Reports
  VIEW_REPORTS:               'view_reports',
  CREATE_REPORT:              'create_report',
  EXPORT_REPORT:              'export_report',

  // Evidence
  VIEW_EVIDENCE:              'view_evidence',
  ADD_EVIDENCE:               'add_evidence',
  EDIT_EVIDENCE:              'edit_evidence',
  DELETE_EVIDENCE:            'delete_evidence',

  // AI
  VIEW_AI_NOTES:              'view_ai_notes',
  GENERATE_AI_GUIDANCE:       'generate_ai_guidance',

  // Backend / System
  VIEW_BACKEND_SETTINGS:      'view_backend_settings',
  EDIT_BACKEND_SETTINGS:      'edit_backend_settings',
  TEST_BACKEND_CONNECTION:    'test_backend_connection',

  // Team
  MANAGE_TEAM:                'manage_team',
  ASSIGN_ROLES:               'assign_roles',

  // Mode
  TOGGLE_DEMO_LIVE:           'toggle_demo_live',

  // Audit
  VIEW_AUDIT_TRAIL:           'view_audit_trail',

  // Portfolio
  VIEW_PORTFOLIO_ANALYTICS:   'view_portfolio_analytics',

  // Branding
  MANAGE_WHITELABEL:          'manage_whitelabel',
};

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION MATRIX
// ─────────────────────────────────────────────────────────────────────────────
// true  = always allowed
// false = never allowed
// null  = restricted (assigned only / backend-required)

export const PERMISSION_MATRIX = {
  [PERM.VIEW_DASHBOARD]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       true,
    [ROLE.CLIENT_VIEWER]: true,
    [ROLE.AUDITOR]:       true,
    [ROLE.DEMO_USER]:     true,
  },
  [PERM.VIEW_ALL_CLIENTS]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    false,  // assigned only
    [ROLE.ANALYST]:       false,  // assigned only
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     true,   // demo mode: all demo clients
  },
  [PERM.VIEW_ASSIGNED_CLIENTS]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       true,
    [ROLE.CLIENT_VIEWER]: true,   // assigned client only
    [ROLE.AUDITOR]:       true,   // assigned records only
    [ROLE.DEMO_USER]:     true,
  },
  [PERM.CREATE_CLIENT]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.EDIT_CLIENT]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,   // assigned only
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.ARCHIVE_CLIENT]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.DELETE_CLIENT]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         false,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.VIEW_REPORTS]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       true,
    [ROLE.CLIENT_VIEWER]: true,   // assigned client reports only
    [ROLE.AUDITOR]:       true,   // assigned records only
    [ROLE.DEMO_USER]:     true,
  },
  [PERM.CREATE_REPORT]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.EXPORT_REPORT]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       true,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       true,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.VIEW_EVIDENCE]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       true,
    [ROLE.CLIENT_VIEWER]: true,
    [ROLE.AUDITOR]:       true,
    [ROLE.DEMO_USER]:     true,
  },
  [PERM.ADD_EVIDENCE]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.EDIT_EVIDENCE]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.DELETE_EVIDENCE]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         false,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.VIEW_AI_NOTES]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       true,
    [ROLE.CLIENT_VIEWER]: false,  // internal notes not visible
    [ROLE.AUDITOR]:       true,   // read-only
    [ROLE.DEMO_USER]:     true,
  },
  [PERM.GENERATE_AI_GUIDANCE]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.VIEW_BACKEND_SETTINGS]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.EDIT_BACKEND_SETTINGS]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         false,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.TEST_BACKEND_CONNECTION]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.MANAGE_TEAM]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.ASSIGN_ROLES]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         false,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.TOGGLE_DEMO_LIVE]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.VIEW_AUDIT_TRAIL]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       true,
    [ROLE.DEMO_USER]:     false,
  },
  [PERM.VIEW_PORTFOLIO_ANALYTICS]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         true,
    [ROLE.CONSULTANT]:    true,
    [ROLE.ANALYST]:       true,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     true,
  },
  [PERM.MANAGE_WHITELABEL]: {
    [ROLE.OWNER]:         true,
    [ROLE.ADMIN]:         false,
    [ROLE.CONSULTANT]:    false,
    [ROLE.ANALYST]:       false,
    [ROLE.CLIENT_VIEWER]: false,
    [ROLE.AUDITOR]:       false,
    [ROLE.DEMO_USER]:     false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a role has a given permission.
 * @param {string} roleId - ROLE.* constant
 * @param {string} permId - PERM.* constant
 * @returns {boolean}
 */
export function hasPermission(roleId, permId) {
  if (!roleId || !permId) return false;
  const row = PERMISSION_MATRIX[permId];
  if (!row) return false;
  return row[roleId] === true;
}

/**
 * Get all permissions granted to a role.
 * @param {string} roleId
 * @returns {string[]}
 */
export function getRolePermissions(roleId) {
  return Object.entries(PERMISSION_MATRIX)
    .filter(([, row]) => row[roleId] === true)
    .map(([permId]) => permId);
}

/**
 * Check if a role can view back-office system settings.
 */
export function isSystemRole(roleId) {
  return [ROLE.OWNER, ROLE.ADMIN].includes(roleId);
}

/**
 * Check if a role is demo-only.
 */
export function isDemoRole(roleId) {
  return roleId === ROLE.DEMO_USER;
}

/**
 * Get the display name + icon for a role.
 */
export function getRoleLabel(roleId) {
  return ROLE_META[roleId]?.label || 'Unknown';
}
export function getRoleIcon(roleId) {
  return ROLE_META[roleId]?.icon || '❓';
}
export function getRoleColour(roleId) {
  return ROLE_META[roleId]?.colour || '#6b7280';
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH STATE MODEL
// ─────────────────────────────────────────────────────────────────────────────

export const AUTH_STATE = {
  DEMO_MODE:                'demo_mode',             // demo mode active
  LIVE_NO_BACKEND:          'live_no_backend',        // live mode, no backend
  BACKEND_CONFIGURED:       'backend_configured',     // backend saved, not tested
  BACKEND_TESTED:           'backend_tested',         // test passed
  AUTH_NOT_CONFIGURED:      'auth_not_configured',    // Supabase not set up
  AUTH_CONFIGURED:          'auth_configured',        // Supabase config present
  LOGGED_OUT:               'logged_out',
  LOGGED_IN:                'logged_in',
  ROLE_UNKNOWN:             'role_unknown',
  ROLE_ASSIGNED:            'role_assigned',
  ACCESS_DENIED:            'access_denied',
};

export const AUTH_STATE_META = {
  [AUTH_STATE.DEMO_MODE]:          { label: 'Demo Mode',               icon: '🎯', colour: '#f59e0b', detail: 'Showing demo data. Demo roles are for preview only.' },
  [AUTH_STATE.LIVE_NO_BACKEND]:    { label: 'Live — No Backend',       icon: '💾', colour: '#00d4ff', detail: 'Product Mode active. Backend not connected. Records stored locally.' },
  [AUTH_STATE.BACKEND_CONFIGURED]: { label: 'Backend Config Saved',    icon: '⚙️', colour: '#00d4ff', detail: 'Backend provider configured. Connection not tested.' },
  [AUTH_STATE.BACKEND_TESTED]:     { label: 'Backend Tested',          icon: '🔗', colour: '#10b981', detail: 'Backend connection test passed. Auth/RLS must be enabled before production use.' },
  [AUTH_STATE.AUTH_NOT_CONFIGURED]:{ label: 'Auth Not Configured',     icon: '🔒', colour: '#f59e0b', detail: 'Supabase Auth or equivalent not yet set up.' },
  [AUTH_STATE.AUTH_CONFIGURED]:    { label: 'Auth Provider Configured',icon: '🔑', colour: '#10b981', detail: 'Auth provider config present. Real sign-in available.' },
  [AUTH_STATE.LOGGED_OUT]:         { label: 'Logged Out',              icon: '🚪', colour: '#6b7280', detail: 'No active session.' },
  [AUTH_STATE.LOGGED_IN]:          { label: 'Logged In',               icon: '✅', colour: '#10b981', detail: 'Active user session.' },
  [AUTH_STATE.ROLE_UNKNOWN]:       { label: 'Role Unknown',            icon: '❓', colour: '#f59e0b', detail: 'User is authenticated but role is not assigned.' },
  [AUTH_STATE.ROLE_ASSIGNED]:      { label: 'Role Assigned',           icon: '🏷',  colour: '#10b981', detail: 'User role is known and permissions are applied.' },
  [AUTH_STATE.ACCESS_DENIED]:      { label: 'Access Restricted',       icon: '⛔', colour: '#ef4444', detail: 'This area requires a role with elevated permissions.' },
};

/**
 * Compute the current auth state from app state.
 * Called with the full state from storage.js getState().
 * Returns the most specific applicable AUTH_STATE.
 */
export function computeAuthState(appState) {
  const wm      = appState?.settings?.workspaceMode || 'demo';
  const isDemo  = wm === 'demo';
  const authCfg = appState?.authConfig || {};
  const session = authCfg.activeSession || null;
  const backendCfg = appState?.backendConfig || null;

  if (isDemo)        return AUTH_STATE.DEMO_MODE;
  if (!backendCfg || backendCfg.activeProvider === 'localOnly')
                     return AUTH_STATE.LIVE_NO_BACKEND;
  if (backendCfg && (backendCfg.connectionTests || []).length > 0) {
    const lastTest = backendCfg.connectionTests[0];
    if (lastTest?.status === 'success') {
      if (authCfg.supabaseAuthEnabled) {
        if (session)     return AUTH_STATE.LOGGED_IN;
        return AUTH_STATE.AUTH_CONFIGURED;
      }
      return AUTH_STATE.AUTH_NOT_CONFIGURED;
    }
  }
  if (backendCfg.activeProvider && backendCfg.activeProvider !== 'localOnly')
                     return AUTH_STATE.BACKEND_CONFIGURED;
  return AUTH_STATE.LIVE_NO_BACKEND;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO TEAM MEMBERS (demo mode only — never shown in live mode)
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_TEAM_MEMBERS = [
  {
    id:               'demo_user_owner',
    name:             'Ciaran Kyzel',
    email:            'owner@demo.qcos.local',
    role:             ROLE.OWNER,
    status:           'demo',
    assignedClientIds: ['all'],
    joinedAt:         '2025-01-01T00:00:00.000Z',
    isDemo:           true,
    avatarInitials:   'CK',
  },
  {
    id:               'demo_user_consultant',
    name:             'Alex Consultant',
    email:            'consultant@demo.qcos.local',
    role:             ROLE.CONSULTANT,
    status:           'demo',
    assignedClientIds: ['demo_client_001', 'demo_client_002'],
    joinedAt:         '2025-02-15T00:00:00.000Z',
    isDemo:           true,
    avatarInitials:   'AC',
  },
  {
    id:               'demo_user_analyst',
    name:             'Jordan Analyst',
    email:            'analyst@demo.qcos.local',
    role:             ROLE.ANALYST,
    status:           'demo',
    assignedClientIds: ['demo_client_001'],
    joinedAt:         '2025-03-10T00:00:00.000Z',
    isDemo:           true,
    avatarInitials:   'JA',
  },
  {
    id:               'demo_user_viewer',
    name:             'Sam Client',
    email:            'viewer@demo.qcos.local',
    role:             ROLE.CLIENT_VIEWER,
    status:           'demo',
    assignedClientIds: ['demo_client_001'],
    joinedAt:         '2025-04-01T00:00:00.000Z',
    isDemo:           true,
    avatarInitials:   'SC',
  },
  {
    id:               'demo_user_auditor',
    name:             'Morgan Auditor',
    email:            'auditor@demo.qcos.local',
    role:             ROLE.AUDITOR,
    status:           'demo',
    assignedClientIds: ['demo_client_001', 'demo_client_002'],
    joinedAt:         '2025-05-20T00:00:00.000Z',
    isDemo:           true,
    avatarInitials:   'MA',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO ROLE PRESET for role switcher (demo mode only)
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_ROLE_PRESETS = [
  { roleId: ROLE.OWNER,         label: 'Owner preview',         icon: '👑', description: 'Full access — all settings, backend, team, clients' },
  { roleId: ROLE.CONSULTANT,    label: 'Consultant preview',    icon: '🧑‍💼', description: 'Assigned clients, reports, assessments, AI guidance' },
  { roleId: ROLE.ANALYST,       label: 'Analyst preview',       icon: '📊', description: 'Read/note access — risk scores, reports, evidence review' },
  { roleId: ROLE.CLIENT_VIEWER, label: 'Client Viewer preview', icon: '👁', description: 'Assigned client reports and readiness status only' },
  { roleId: ROLE.AUDITOR,       label: 'Auditor preview',       icon: '📋', description: 'Read-only — reports, evidence summaries, audit trail' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT AUTH CONFIG (extends storage.js SSOT)
// ─────────────────────────────────────────────────────────────────────────────

export function getDefaultAuthConfig() {
  return {
    // Current session (null until real auth connected)
    activeSession:       null,        // { userId, email, role, loginAt } or null
    activeRole:          ROLE.OWNER,  // frontend role — Owner by default (local/demo mode)
    demoPreviewRole:     ROLE.OWNER,  // demo role switcher selection
    supabaseAuthEnabled: false,       // true only when Supabase Auth is configured + tested
    authProvider:        'none',      // 'none' | 'supabase' | 'firebase' | 'custom'
    // Team members (live: backend-driven; demo: DEMO_TEAM_MEMBERS)
    teamMembers:         [],
    // Audit trail (local placeholder — real trail requires Run 26 backend)
    localAuditEvents:    [],
    lastUpdatedAt:       null,
    // Safety
    frontendOnlyWarning: true,        // always true — remind that frontend roles ≠ production security
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE RESTRICTION MAP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps PAGES.* ids to the minimum permission required to access them.
 * Pages not listed here are accessible to all roles.
 */
export const PAGE_PERMISSIONS = {
  'backend-connectors': PERM.VIEW_BACKEND_SETTINGS,
  'backend-config':     PERM.VIEW_BACKEND_SETTINGS,
  'agency-settings':    PERM.MANAGE_WHITELABEL,
  'team-access':        PERM.MANAGE_TEAM,
};

/**
 * Check whether a role can access a given page id.
 */
export function canAccessPage(roleId, pageId) {
  const required = PAGE_PERMISSIONS[pageId];
  if (!required) return true;  // no restriction
  return hasPermission(roleId, required);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT EVENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const AUDIT_EVENT = {
  USER_SIGN_IN:          'user_sign_in',
  ROLE_CHANGED:          'role_changed',
  CLIENT_ASSIGNED:       'client_assigned',
  CLIENT_CREATED:        'client_created',
  REPORT_GENERATED:      'report_generated',
  EVIDENCE_ADDED:        'evidence_added',
  BACKEND_CONFIG_CHANGED:'backend_config_changed',
  MODE_CHANGED:          'mode_changed',
  EXPORT_GENERATED:      'export_generated',
};

export function buildAuditEvent(type, details = {}) {
  return {
    id:        `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    details,
    timestamp: new Date().toISOString(),
    isDemo:    details.isDemo || false,
  };
}
