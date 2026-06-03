/**
 * QUANTUM COMPLIANCE OS™ — workspaceMode.js
 * Run 8.5: Global Demo Mode / Product Mode Separation
 * =====================================================
 * Single source of truth for workspace mode logic.
 * All mode functions import from here or from storage.js.
 *
 * NO external API calls. NO backend. NO offensive tools.
 * Defensive readiness platform only.
 *
 * MODES:
 *   "demo"    — Investor/client showcase mode. Shows fictional demo clients,
 *               sample scores, sample reports, sample evidence.
 *               All demo content is clearly labelled as fictional.
 *
 *   "product" — Real working product. Demo clients hidden from active views.
 *               Real user-entered clients only. Clean workspace.
 *               Demo data preserved in storage until explicitly cleared.
 */

// ─── Demo client ID prefix — all demo-seeded clients share this prefix ────────
export const DEMO_CLIENT_ID_PREFIX = 'demo_client_';

// ─── Known demo client IDs (from demoPortfolio.js) ───────────────────────────
export const DEMO_CLIENT_IDS = new Set([
  'demo_client_meridian',
  'demo_client_vantage',
  'demo_client_apex',
  'demo_client_helix',
  'demo_client_clearline',
]);

// ─── Workspace mode constants ─────────────────────────────────────────────────
export const WORKSPACE_MODE = {
  DEMO:    'demo',
  PRODUCT: 'product',
};

/**
 * Determine if a client record is a demo client.
 * Checks clientMeta.isDemo, id prefix, and known demo IDs.
 * Falls back gracefully for legacy records without clientMeta.
 */
export function clientIsDemo(client) {
  if (!client) return false;
  // Explicit clientMeta flag takes priority
  if (typeof client.clientMeta?.isDemo === 'boolean') return client.clientMeta.isDemo;
  // Check known demo IDs
  if (DEMO_CLIENT_IDS.has(client.id)) return true;
  // Check id prefix
  if (typeof client.id === 'string' && client.id.startsWith(DEMO_CLIENT_ID_PREFIX)) return true;
  return false;
}

/**
 * Build a clientMeta block for a new user-created client.
 */
export function buildRealClientMeta() {
  return {
    isDemo: false,
    workspaceMode: WORKSPACE_MODE.PRODUCT,
    createdFrom: 'user',
    lockedDemoRecord: false,
  };
}

/**
 * Build a clientMeta block for a demo-seeded client.
 */
export function buildDemoClientMeta() {
  return {
    isDemo: true,
    workspaceMode: WORKSPACE_MODE.DEMO,
    createdFrom: 'demo-seed',
    lockedDemoRecord: true,
  };
}

/**
 * Migrate legacy client record — adds clientMeta if missing.
 * Called during loadConsultantState to ensure all records have clientMeta.
 */
export function migrateClientMeta(client) {
  if (client.clientMeta) return client; // already has meta — preserve it
  const isDemo = clientIsDemo(client);
  return {
    ...client,
    clientMeta: {
      isDemo,
      workspaceMode: isDemo ? WORKSPACE_MODE.DEMO : WORKSPACE_MODE.PRODUCT,
      createdFrom: isDemo ? 'demo-seed' : 'user',
      lockedDemoRecord: isDemo,
    },
  };
}

/**
 * Filter a client list for the current workspace mode.
 * - demo mode: shows all clients (demo + real), demo ones labelled
 * - product mode: hides demo clients from active product views
 */
export function filterClientsByMode(clients, workspaceMode, { includeArchived = false } = {}) {
  if (!Array.isArray(clients)) return [];

  // Always apply archive filter first
  const visible = includeArchived ? clients : clients.filter((c) => !c.archived);

  if (workspaceMode === WORKSPACE_MODE.DEMO) {
    // Demo mode shows everything
    return visible;
  }

  // Product mode: hide demo clients
  return visible.filter((c) => !clientIsDemo(c));
}

/**
 * Get only demo clients from a list.
 */
export function getDemoClientsFromList(clients) {
  return (clients || []).filter(clientIsDemo);
}

/**
 * Get only real (non-demo) clients from a list.
 */
export function getRealClientsFromList(clients) {
  return (clients || []).filter((c) => !clientIsDemo(c));
}

/**
 * Is the given state in demo mode?
 * Checks settings.workspaceMode (new), then settings.demoMode (legacy).
 */
export function isDemoMode(state) {
  if (!state) return true; // default to demo mode for safety
  const wm = state.settings?.workspaceMode;
  if (wm) return wm === WORKSPACE_MODE.DEMO;
  // Legacy fallback
  return state.settings?.demoMode !== false;
}

/**
 * Is the given state in product mode?
 */
export function isProductMode(state) {
  return !isDemoMode(state);
}

/**
 * Get the workspace mode string from state.
 */
export function getWorkspaceModeFromState(state) {
  return isDemoMode(state) ? WORKSPACE_MODE.DEMO : WORKSPACE_MODE.PRODUCT;
}

/**
 * Mode display metadata — label, badge colour, description.
 */
export const MODE_META = {
  [WORKSPACE_MODE.DEMO]: {
    label:       'Demo Mode',
    shortLabel:  'DEMO',
    icon:        '🎯',
    colour:      'var(--warning)',
    bg:          'rgba(245,158,11,0.12)',
    border:      'rgba(245,158,11,0.35)',
    description: 'Uses fictional demo clients, sample scores, sample reports, and sample evidence so the platform can be shown to investors, clients, and consultants.',
  },
  [WORKSPACE_MODE.PRODUCT]: {
    label:       'Product Mode',
    shortLabel:  'LIVE',
    icon:        '🟢',
    colour:      'var(--success)',
    bg:          'rgba(16,185,129,0.10)',
    border:      'rgba(16,185,129,0.30)',
    description: 'Hides demo content and turns the app into a clean working product for real client assessments and reports.',
  },
};
