/**
 * QUANTUM COMPLIANCE OS™ — dataProviders.js
 * Run 14: Demo/Live Toggle + Data Provider Architecture
 * ======================================================
 * Central data provider registry, product mode model, demo/live
 * data separation helpers, and provider readiness utilities.
 *
 * SAFETY:
 * - No real Supabase/Firebase/AWS/custom API connections
 * - No secrets or credentials stored or requested
 * - No external calls of any kind
 * - localStorage is the ONLY active provider in Run 14
 * - All other providers are clearly placeholders for future runs
 * - No duplicate state store — extends workspaceMode.js (Run 8.5)
 *
 * DATA SEPARATION:
 * - Demo records: isDemo: true — shown in Demo Mode, hidden in Live Mode
 * - Live records: isDemo: false — always shown, created as local
 * - No deletion of any records on mode switch
 * - Mixing prevention: enforced via filterRecordsByProductMode()
 *
 * DISCLAIMER:
 * Data separation status is a product safeguard and does not guarantee
 * legal or regulatory compliance. Risk scores and recommendations are
 * advisory and require qualified human review.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import { WORKSPACE_MODE } from './workspaceMode.js';

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MODE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_MODE = {
  DEMO:               'demo',
  LIVE_LOCAL:         'live-local',
  LIVE_BACKEND_READY: 'live-backend-ready', // reserved for Run 15
};

export const DATA_PROVIDER_ID = {
  LOCAL_STORAGE: 'localStorage',
  SUPABASE:      'supabase',
  FIREBASE:      'firebase',
  AWS:           'aws',
  CUSTOM_API:    'customApi',
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA PROVIDER REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const DATA_PROVIDERS = {
  [DATA_PROVIDER_ID.LOCAL_STORAGE]: {
    id:               DATA_PROVIDER_ID.LOCAL_STORAGE,
    name:             'Local Storage',
    status:           'active',
    type:             'local',
    configured:       true,
    supportsOffline:  true,
    supportsSync:     false,
    supportsRealtime: false,
    icon:             '💾',
    colour:           '#10b981',
    description:      'Local-first browser storage for demo and local live usage. Active in all runs up to Run 14.',
    activationNote:   null,
    futureRun:        null,
  },
  [DATA_PROVIDER_ID.SUPABASE]: {
    id:               DATA_PROVIDER_ID.SUPABASE,
    name:             'Supabase',
    status:           'placeholder',
    type:             'backend',
    configured:       false,
    supportsOffline:  false,
    supportsSync:     true,
    supportsRealtime: true,
    icon:             '⚡',
    colour:           '#6b7280',
    description:      'Postgres-backed realtime database. Includes Row-Level Security, Auth, and Realtime subscriptions.',
    activationNote:   'This provider is prepared for a future backend connector run and is not active yet.',
    futureRun:        'Run 15',
  },
  [DATA_PROVIDER_ID.FIREBASE]: {
    id:               DATA_PROVIDER_ID.FIREBASE,
    name:             'Firebase / Firestore',
    status:           'placeholder',
    type:             'backend',
    configured:       false,
    supportsOffline:  false,
    supportsSync:     true,
    supportsRealtime: true,
    icon:             '🔥',
    colour:           '#6b7280',
    description:      'Google Firebase Firestore realtime document database. Suitable for real-time sync and mobile.',
    activationNote:   'This provider is prepared for a future backend connector run and is not active yet.',
    futureRun:        'Run 15',
  },
  [DATA_PROVIDER_ID.AWS]: {
    id:               DATA_PROVIDER_ID.AWS,
    name:             'AWS / Amplify',
    status:           'placeholder',
    type:             'backend',
    configured:       false,
    supportsOffline:  false,
    supportsSync:     true,
    supportsRealtime: false,
    icon:             '☁️',
    colour:           '#6b7280',
    description:      'Amazon Web Services with Amplify DataStore. Enterprise-scale backend option for agency deployments.',
    activationNote:   'This provider is prepared for a future backend connector run and is not active yet.',
    futureRun:        'Future run',
  },
  [DATA_PROVIDER_ID.CUSTOM_API]: {
    id:               DATA_PROVIDER_ID.CUSTOM_API,
    name:             'Custom REST API',
    status:           'placeholder',
    type:             'backend',
    configured:       false,
    supportsOffline:  false,
    supportsSync:     true,
    supportsRealtime: false,
    icon:             '🔌',
    colour:           '#6b7280',
    description:      'Bring-your-own REST API backend. Suitable for custom enterprise or white-label deployments.',
    activationNote:   'This provider is prepared for a future backend connector run and is not active yet.',
    futureRun:        'Future run',
  },
};

// Ordered list for UI rendering
export const DATA_PROVIDER_ORDER = [
  DATA_PROVIDER_ID.LOCAL_STORAGE,
  DATA_PROVIDER_ID.SUPABASE,
  DATA_PROVIDER_ID.FIREBASE,
  DATA_PROVIDER_ID.AWS,
  DATA_PROVIDER_ID.CUSTOM_API,
];

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT PRODUCT MODE SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export function getDefaultProductModeSettings() {
  return {
    mode:                   PRODUCT_MODE.DEMO,
    demoModeEnabled:        true,
    liveModeEnabled:        false,
    activeDataProvider:     DATA_PROVIDER_ID.LOCAL_STORAGE,
    allowDemoData:          true,
    allowLiveData:          false,
    preventDemoLiveMixing:  true,
    lastModeChangedAt:      new Date().toISOString().slice(0, 10),
    lastModeChangedBy:      'local-user',
    statusMessage:          'Demo Mode is active. Sample clients, reports, evidence, and agency data are shown for presentation.',
    isDemo:                 false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MODE HELPERS (pure — no side effects, no state mutations)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the effective product mode from the full app state.
 * Falls back to workspaceMode (Run 8.5) for backward compatibility.
 */
export function getProductModeFromState(state) {
  if (!state) return PRODUCT_MODE.DEMO;
  // Run 14: prefer productModeSettings.mode
  const pm = state.productModeSettings?.mode;
  if (pm && Object.values(PRODUCT_MODE).includes(pm)) return pm;
  // Run 8.5 fallback: workspaceMode → product maps to live-local
  const wm = state.settings?.workspaceMode;
  if (wm === WORKSPACE_MODE.PRODUCT) return PRODUCT_MODE.LIVE_LOCAL;
  return PRODUCT_MODE.DEMO;
}

export function isDemoProductMode(state) {
  return getProductModeFromState(state) === PRODUCT_MODE.DEMO;
}

export function isLiveLocalMode(state) {
  return getProductModeFromState(state) === PRODUCT_MODE.LIVE_LOCAL;
}

export function isBackendReadyMode(state) {
  return getProductModeFromState(state) === PRODUCT_MODE.LIVE_BACKEND_READY;
}

export function getActiveDataProvider(state) {
  const providerId = state?.productModeSettings?.activeDataProvider || DATA_PROVIDER_ID.LOCAL_STORAGE;
  return DATA_PROVIDERS[providerId] || DATA_PROVIDERS[DATA_PROVIDER_ID.LOCAL_STORAGE];
}

export function getDataProviderById(providerId) {
  return DATA_PROVIDERS[providerId] || null;
}

export function getAvailableDataProviders() {
  return DATA_PROVIDER_ORDER.map((id) => DATA_PROVIDERS[id]);
}

export function canUseProvider(providerId) {
  const p = DATA_PROVIDERS[providerId];
  if (!p) return false;
  return p.status === 'active';
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA SEPARATION HELPERS (pure — fail safely on missing data)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter any array of records by product mode.
 * Demo mode: all records visible.
 * Live-local/backend-ready: only non-demo records visible.
 */
export function filterRecordsByProductMode(records, state) {
  if (!Array.isArray(records)) return [];
  if (isDemoProductMode(state)) return records;
  return records.filter((r) => r && !r.isDemo);
}

export function getVisibleClients(clients, state) {
  if (!Array.isArray(clients)) return [];
  if (isDemoProductMode(state)) return clients;
  return clients.filter((c) => c && !c.isDemo && !(c.clientMeta?.isDemo));
}

export function getVisibleReports(reports, state) {
  return filterRecordsByProductMode(reports || [], state);
}

export function getVisibleEvidenceItems(evidenceItems, state) {
  return filterRecordsByProductMode(evidenceItems || [], state);
}

export function getVisibleSnapshots(snapshots, state) {
  return filterRecordsByProductMode(snapshots || [], state);
}

export function markRecordAsDemo(record) {
  if (!record) return record;
  return { ...record, isDemo: true };
}

export function markRecordAsLive(record) {
  if (!record) return record;
  return { ...record, isDemo: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA SEPARATION DIAGNOSTICS (pure)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute data separation diagnostics from consultant state + main state.
 * Returns safe counts and status label.
 */
export function getDataSeparationStatus(clients, reports, evidenceItems, snapshots, state) {
  const safe = (arr) => (Array.isArray(arr) ? arr : []);
  const allClients  = safe(clients);
  const allReports  = safe(reports);
  const allEvidence = safe(evidenceItems);
  const allSnaps    = safe(snapshots);

  const demoClients   = allClients.filter((c) => c.isDemo || c.clientMeta?.isDemo);
  const liveClients   = allClients.filter((c) => !c.isDemo && !c.clientMeta?.isDemo);
  const demoReports   = allReports.filter((r) => r.isDemo);
  const liveReports   = allReports.filter((r) => !r.isDemo);
  const demoEvidence  = allEvidence.filter((e) => e.isDemo);
  const liveEvidence  = allEvidence.filter((e) => !e.isDemo);
  const demoSnaps     = allSnaps.filter((s) => s.isDemo);
  const liveSnaps     = allSnaps.filter((s) => !s.isDemo);

  const isDemo    = isDemoProductMode(state);
  const isLive    = !isDemo;

  const visibleClients   = isDemo ? allClients : liveClients;
  const hiddenDemo       = isLive ? demoClients.length  : 0;
  const hiddenLive       = isDemo ? 0 : 0; // live records are never hidden in demo mode

  // Separation status
  let separationStatus = 'safe';
  let separationNote   = 'Data separation is working correctly.';

  if (isLive && liveClients.length === 0 && demoClients.length > 0) {
    separationStatus = 'warning';
    separationNote   = 'Live Product Mode is active but no live clients exist. Demo records are hidden.';
  }

  const totalDemoRecords = demoClients.length + demoReports.length + demoEvidence.length + demoSnaps.length;
  const totalLiveRecords = liveClients.length + liveReports.length + liveEvidence.length + liveSnaps.length;

  return {
    // Clients
    totalClients:       allClients.length,
    demoClients:        demoClients.length,
    liveClients:        liveClients.length,
    visibleClients:     visibleClients.length,
    hiddenDemoClients:  isLive ? demoClients.length  : 0,
    // Reports
    totalReports:       allReports.length,
    demoReports:        demoReports.length,
    liveReports:        liveReports.length,
    // Evidence
    totalEvidence:      allEvidence.length,
    demoEvidence:       demoEvidence.length,
    liveEvidence:       liveEvidence.length,
    // Snapshots
    totalSnapshots:     allSnaps.length,
    demoSnapshots:      demoSnaps.length,
    liveSnapshots:      liveSnaps.length,
    // Totals
    totalDemoRecords,
    totalLiveRecords,
    hiddenDemoTotal:    hiddenDemo,
    // Mode
    currentMode:        getProductModeFromState(state),
    separationStatus,
    separationNote,
    activeProvider:     getActiveDataProvider(state)?.name || 'Local Storage',
  };
}

/**
 * Get the mode status message for the current state.
 */
export function getModeStatusMessage(state) {
  const mode = getProductModeFromState(state);
  if (mode === PRODUCT_MODE.DEMO) {
    return 'Demo Mode is active. Sample clients, reports, evidence, and analytics are shown for presentation and testing.';
  }
  if (mode === PRODUCT_MODE.LIVE_LOCAL) {
    return 'Live Product Mode is active. Demo records are hidden. Live Local Mode stores real/local records in this browser until a backend provider is connected in a future run.';
  }
  return 'Backend-Ready Mode is active. Connect a backend provider to enable live sync, audit trails, and real-time team access.';
}

/**
 * Get a summary of data provider readiness.
 */
export function getProviderReadinessSummary() {
  const providers = getAvailableDataProviders();
  const active    = providers.filter((p) => p.status === 'active');
  const planned   = providers.filter((p) => p.status === 'placeholder');
  return {
    total:         providers.length,
    active:        active.length,
    planned:       planned.length,
    activeNames:   active.map((p) => p.name),
    plannedNames:  planned.map((p) => p.name),
  };
}

/**
 * Validate demo/live separation in current data.
 * Returns warnings if mixing is detected.
 */
export function validateDemoLiveSeparation(clients, reports, evidenceItems) {
  const warnings = [];
  const safe = (arr) => (Array.isArray(arr) ? arr : []);

  // Check for records with missing isDemo flag
  const clientsNoFlag  = safe(clients).filter((c) => c.isDemo === undefined && !c.clientMeta);
  const reportsNoFlag  = safe(reports).filter((r) => r.isDemo === undefined);
  const evidenceNoFlag = safe(evidenceItems).filter((e) => e.isDemo === undefined);

  if (clientsNoFlag.length > 0) {
    warnings.push(`${clientsNoFlag.length} client record(s) are missing isDemo flag — will be treated as live.`);
  }
  if (reportsNoFlag.length > 0) {
    warnings.push(`${reportsNoFlag.length} report record(s) are missing isDemo flag — will be treated as live.`);
  }
  if (evidenceNoFlag.length > 0) {
    warnings.push(`${evidenceNoFlag.length} evidence record(s) are missing isDemo flag — will be treated as live.`);
  }

  return {
    hasWarnings: warnings.length > 0,
    warnings,
    status: warnings.length === 0 ? 'safe' : 'needs-review',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4P3X API CONFIG GUARD™ — safe informational panel data
// ─────────────────────────────────────────────────────────────────────────────

export const API_CONFIG_GUARD = {
  title:     '4P3X API Config Guard™',
  purpose:   'Prepare for safe backend configuration in Run 15. No secrets are stored or requested in this run.',
  rules: [
    'No backend-only secrets should be placed in frontend code.',
    'Do not expose service role keys in any client-side file.',
    'Do not hardcode private API keys in source code.',
    'Do not commit credentials to GitHub or any public repository.',
    'Use only public/client-safe keys in frontend settings.',
    'Backend-only secrets must be handled server-side in future backend architecture.',
  ],
  blockedFromFrontend: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'GROQ_API_KEY',
    'STRIPE_SECRET_KEY',
    'DATABASE_URL',
    'JWT_SECRET',
    'PRIVATE_KEY',
    'WEBHOOK_SECRET',
    'Admin tokens',
    'Backend-only secrets of any kind',
  ],
  safeInFrontend: [
    'SUPABASE_ANON_KEY (public, read-only access)',
    'SUPABASE_URL (public endpoint)',
    'Firebase project config (public)',
    'Stripe publishable key',
    'Public API base URLs',
  ],
  disclaimer: 'This guard is informational only and does not enforce secrets management at runtime. A proper secrets management policy must be implemented when backend services are connected in Run 15.',
};

// ─────────────────────────────────────────────────────────────────────────────
// MODE META (display metadata for UI)
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_MODE_META = {
  [PRODUCT_MODE.DEMO]: {
    label:       'Demo Mode',
    shortLabel:  'DEMO',
    icon:        '🎯',
    colour:      '#f59e0b',
    bg:          'rgba(245,158,11,0.10)',
    border:      'rgba(245,158,11,0.30)',
    description: 'Uses fictional demo clients, sample scores, sample reports, and sample evidence so the platform can be shown to investors, clients, and consultants. All demo content is clearly labelled as fictional.',
  },
  [PRODUCT_MODE.LIVE_LOCAL]: {
    label:       'Live Local Mode',
    shortLabel:  'LIVE',
    icon:        '🟢',
    colour:      '#10b981',
    bg:          'rgba(16,185,129,0.08)',
    border:      'rgba(16,185,129,0.25)',
    description: 'Demo records hidden. New records are real/local records stored in this browser. No backend sync yet. Fully usable as a local live product.',
  },
  [PRODUCT_MODE.LIVE_BACKEND_READY]: {
    label:       'Backend Ready Mode',
    shortLabel:  'BACKEND',
    icon:        '☁️',
    colour:      '#3b82f6',
    bg:          'rgba(59,130,246,0.08)',
    border:      'rgba(59,130,246,0.25)',
    description: 'Reserved for Run 15. Indicates the app is prepared to connect to a backend provider. Backend sync is not active until Run 15.',
  },
};
