/**
 * QUANTUM COMPLIANCE OS™ — consultantStorage.js
 * Run 5: Local-First Consultant SaaS Layer
 * =========================================
 * All consultant workspace data stored in localStorage under
 * QCOS_CONSULTANT_KEY. Each client gets its own isolated
 * state key: qcos_v1_state__<clientId>.
 *
 * NO backend. NO Supabase. NO external APIs. NO payments.
 * Purely local-first. All data stays in the browser.
 *
 * DEFENSIVE USE ONLY. No offensive tools.
 */

import { migrateClientMeta, buildRealClientMeta } from './workspaceMode.js';

export const CONSULTANT_KEY      = 'qcos_v5_consultant';
export const CLIENT_STATE_PREFIX = 'qcos_v1_state__';
// ─── Landing / Onboarding Entry Tracking ─────────────────────────────────────
// Stored via consultantStorage to keep localStorage access inside this file.
export const ENTERED_KEY = 'qcos_v5_entered';

export function hasEnteredApp() {
  try { return !!localStorage.getItem(ENTERED_KEY); } catch { return false; }
}

export function markAppEntered() {
  try { localStorage.setItem(ENTERED_KEY, '1'); } catch {}
}



// ─── Commercial Tiers (placeholder only — no billing) ─────────────────────────
export const COMMERCIAL_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '🌱',
    maxClients: 1,
    features: ['Single client', 'All assessments', 'JSON export', 'Basic reports'],
    priceNote: 'Local use only',
    colour: '#10b981',
    cta: 'Current Plan',
  },
  {
    id: 'pro_consultant',
    name: 'Pro Consultant',
    icon: '🚀',
    maxClients: 10,
    features: ['Up to 10 clients', 'Client switcher', 'Per-client branding', 'CSV + JSON export', 'Full reports'],
    priceNote: 'Coming Soon',
    colour: '#3b82f6',
    cta: 'Notify Me',
  },
  {
    id: 'agency',
    name: 'Agency',
    icon: '🏢',
    maxClients: 50,
    features: ['Up to 50 clients', 'Risk comparison', 'White-label', 'Client archive', 'Priority support'],
    priceNote: 'Coming Soon',
    colour: '#8b5cf6',
    cta: 'Notify Me',
  },
  {
    id: 'white_label',
    name: 'White Label',
    icon: '🎨',
    maxClients: 999,
    features: ['Unlimited clients', 'Full white-label', 'Custom domain', 'Onboarding wizard', 'SLA support'],
    priceNote: 'Enterprise — Coming Soon',
    colour: '#f59e0b',
    cta: 'Contact Sales',
  },
];

// ─── Default Consultant Workspace ─────────────────────────────────────────────
export function getInitialConsultantState() {
  return {
    version:          '15.0.0',
    createdAt:        new Date().toISOString(),
    lastUpdated:      new Date().toISOString(),
    consultantName:   '',
    firmName:         '',
    firmEmail:        '',
    tier:             'starter',
    activeClientId:   null,   // null = self (legacy single-tenant)
    clients:          [],
    onboardingComplete: false,
    onboardingStep:   0,
    deploymentChecklist: buildDeploymentChecklist(),
    branding: {
      productName:  'Quantum Compliance OS',
      tagline:      'Defensive Quantum-Readiness & Security Assessment',
      logoText:     'QC-OS',
      accentColour: '#00d4ff',
    },
    notifications: [],
    // Run 12 — Report History, Evidence Archive, Snapshots
    reports:       [],   // per-client report history records
    evidenceItems: [],   // per-client evidence archive records
    snapshots:     [],   // per-client assessment snapshots
    // Run 13 — Agency + White Label Settings
    agencySettings:      null,   // populated on first save; null = use defaults from agencyHelpers.js
    whiteLabelSettings:  null,   // populated on first save; null = use defaults from agencyHelpers.js
  };
}

function buildDeploymentChecklist() {
  return [
    { id: 'org_profile',      label: 'Create first organisation profile',    done: false, page: 'organisation',        note: 'Add your first client\'s details' },
    { id: 'system_inventory', label: 'Add at least one system to inventory', done: false, page: 'system-inventory',    note: 'Document critical systems' },
    { id: 'security_assess',  label: 'Run security assessment',              done: false, page: 'security-assessment', note: 'Complete and score assessment' },
    { id: 'quantum_assess',   label: 'Run quantum readiness assessment',     done: false, page: 'quantum-readiness',   note: 'Assess post-quantum exposure' },
    { id: 'evidence_pack',    label: 'Build evidence pack',                  done: false, page: 'evidence-pack',       note: 'Scaffold evidence items' },
    { id: 'first_report',     label: 'Generate first report',                done: false, page: 'reports',             note: 'Export or print report' },
    { id: 'pwa_install',      label: 'Install as PWA (optional)',            done: false, page: null,                  note: 'Install to home screen for offline use' },
    { id: 'export_backup',    label: 'Export local backup',                  done: false, page: null,                  note: 'Download JSON backup of all data' },
    { id: 'branding',         label: 'Customise branding',                   done: false, page: 'settings',            note: 'Set product name, colours, tagline' },
    { id: 'second_client',    label: 'Add second client profile',            done: false, page: null,                  note: 'Unlock multi-client consultant mode' },
  ];
}

// ─── Load / Save Consultant Workspace ────────────────────────────────────────
export function loadConsultantState() {
  try {
    const raw = localStorage.getItem(CONSULTANT_KEY);
    if (!raw) {
      const fresh = getInitialConsultantState();
      saveConsultantState(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    // Merge to pick up new fields from any newer run
    const merged = { ...getInitialConsultantState(), ...parsed };
    // Run 8.5 migration: ensure all clients have clientMeta
    if (Array.isArray(merged.clients)) {
      merged.clients = merged.clients.map(migrateClientMeta);
    }
    // Run 12 migration: ensure reports/evidenceItems/snapshots arrays exist
    if (!Array.isArray(merged.reports))       merged.reports       = [];
    if (!Array.isArray(merged.evidenceItems)) merged.evidenceItems = [];
    if (!Array.isArray(merged.snapshots))     merged.snapshots     = [];
    // Run 13 migration: ensure agencySettings + whiteLabelSettings exist (null = use defaults)
    if (merged.agencySettings     === undefined) merged.agencySettings     = null;
    if (merged.whiteLabelSettings === undefined) merged.whiteLabelSettings = null;
    return merged;
  } catch {
    const fresh = getInitialConsultantState();
    saveConsultantState(fresh);
    return fresh;
  }
}

export function saveConsultantState(state) {
  try {
    localStorage.setItem(CONSULTANT_KEY, JSON.stringify({ ...state, lastUpdated: new Date().toISOString() }));
  } catch (err) {
    console.error('[QCOS Consultant] Failed to save consultant state:', err);
  }
}

// ─── In-memory consultant store ───────────────────────────────────────────────
let _consultantState = null;
let _consultantListeners = [];

export function getConsultantState() {
  if (!_consultantState) _consultantState = loadConsultantState();
  return _consultantState;
}

export function setConsultantState(updater) {
  const prev = getConsultantState();
  _consultantState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
  saveConsultantState(_consultantState);
  _consultantListeners.forEach((fn) => fn(_consultantState));
}

export function subscribeConsultant(listener) {
  _consultantListeners.push(listener);
  return () => { _consultantListeners = _consultantListeners.filter((l) => l !== listener); };
}

// ─── Client State Keys ────────────────────────────────────────────────────────
export function clientStateKey(clientId) {
  return `${CLIENT_STATE_PREFIX}${clientId}`;
}

export function getClientState(clientId) {
  try {
    const raw = localStorage.getItem(clientStateKey(clientId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveClientState(clientId, state) {
  try {
    localStorage.setItem(clientStateKey(clientId), JSON.stringify(state));
  } catch (err) {
    console.error(`[QCOS Client] Failed to save client ${clientId}:`, err);
  }
}

export function deleteClientState(clientId) {
  localStorage.removeItem(clientStateKey(clientId));
}

// ─── Client CRUD ──────────────────────────────────────────────────────────────
export function createClient(payload) {
  const now = new Date().toISOString();
  const client = {
    id:                    payload.id || `client_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name:                  payload.name || 'New Client',
    sector:                payload.sector || '',
    contactName:           payload.contactName || '',
    contactEmail:          payload.contactEmail || '',
    notes:                 payload.notes || '',
    tags:                  payload.tags || [],
    branding:              payload.branding || null,  // per-client white-label
    archived:              false,
    createdAt:             payload.createdAt || now,
    updatedAt:             now,
    lastActivity:          now,
    // Run 8.5 — workspace mode metadata
    clientMeta:            payload.clientMeta || buildRealClientMeta(),
    // Run 11 — Multi-Client Hub extended fields
    riskLevel:             payload.riskLevel             || 'unknown',      // high | medium | low | unknown
    quantumReadinessScore: payload.quantumReadinessScore != null ? Number(payload.quantumReadinessScore) : null,
    securityScore:         payload.securityScore         != null ? Number(payload.securityScore)         : null,
    evidenceStatus:        payload.evidenceStatus        || 'missing',      // complete | partial | incomplete | missing
    assessmentStatus:      payload.assessmentStatus      || 'not-started',  // not-started | in-progress | review-needed | complete
    lastAssessmentDate:    payload.lastAssessmentDate    || null,
    reportCount:           payload.reportCount           != null ? Number(payload.reportCount) : 0,
    isDemo:                payload.isDemo                ?? false,
    status:                payload.archived ? 'archived' : (payload.status || 'active'),
  };

  setConsultantState((s) => ({
    ...s,
    clients: [...s.clients, client],
  }));

  return client;
}

export function updateClient(clientId, payload) {
  setConsultantState((s) => ({
    ...s,
    clients: s.clients.map((c) => {
      if (c.id !== clientId) return c;
      const updated = { ...c, ...payload, updatedAt: new Date().toISOString() };
      // Keep status in sync with archived flag
      if ('archived' in payload) {
        updated.status = payload.archived ? 'archived' : 'active';
      }
      return updated;
    }),
  }));
}

export function archiveClient(clientId) {
  setConsultantState((s) => ({
    ...s,
    clients: s.clients.map((c) =>
      c.id === clientId ? { ...c, archived: true, status: 'archived', updatedAt: new Date().toISOString() } : c
    ),
    activeClientId: s.activeClientId === clientId ? null : s.activeClientId,
  }));
}

export function restoreClient(clientId) {
  setConsultantState((s) => ({
    ...s,
    clients: s.clients.map((c) =>
      c.id === clientId ? { ...c, archived: false, status: 'active', updatedAt: new Date().toISOString() } : c
    ),
  }));
}

export function deleteClientPermanently(clientId) {
  deleteClientState(clientId);
  setConsultantState((s) => ({
    ...s,
    clients: s.clients.filter((c) => c.id !== clientId),
    activeClientId: s.activeClientId === clientId ? null : s.activeClientId,
  }));
}

// ─── Run 11: Demo Hub Client Helpers ────────────────────────────────────────────
/**
 * Load the 5 Run 11 demo hub clients into the consultant workspace.
 * Safe — will not duplicate existing clients by id.
 * Requires demoHubClients array from clientHubSeedData.js.
 */
export function loadDemoHubClients(demoHubClients) {
  setConsultantState((s) => {
    const existingIds = new Set((s.clients || []).map((c) => c.id));
    const toAdd = demoHubClients.filter((c) => !existingIds.has(c.id));
    if (toAdd.length === 0) return s;
    return { ...s, clients: [...s.clients, ...toAdd] };
  });
}

/**
 * Clear all demo hub clients (those with isDemo: true and Run 11 demo IDs).
 */
export function clearDemoHubClients(demoHubClients) {
  const demoIds = new Set(demoHubClients.map((c) => c.id));
  setConsultantState((s) => ({
    ...s,
    clients: (s.clients || []).filter((c) => !demoIds.has(c.id)),
    activeClientId: demoIds.has(s.activeClientId) ? null : s.activeClientId,
  }));
}

/**
 * Return only demo hub clients (isDemo=true + matching prefix) from current state.
 */
// ─── Run 12: Report / Evidence / Snapshot CRUD ──────────────────────────────
export function addReportRecord(report) {
  setConsultantState((s) => ({
    ...s,
    reports: [...(s.reports || []), report],
  }));
}

export function updateReportRecord(reportId, patch) {
  setConsultantState((s) => ({
    ...s,
    reports: (s.reports || []).map((r) =>
      r.id === reportId ? { ...r, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : r
    ),
  }));
}

export function addEvidenceRecord(item) {
  setConsultantState((s) => ({
    ...s,
    evidenceItems: [...(s.evidenceItems || []), item],
  }));
}

export function updateEvidenceRecord(itemId, patch) {
  setConsultantState((s) => ({
    ...s,
    evidenceItems: (s.evidenceItems || []).map((e) =>
      e.id === itemId ? { ...e, ...patch, lastUpdated: new Date().toISOString().slice(0, 10) } : e
    ),
  }));
}

export function addSnapshotRecord(snapshot) {
  setConsultantState((s) => ({
    ...s,
    snapshots: [...(s.snapshots || []), snapshot],
  }));
}

export function loadDemoReportHistory(demoReports, demoEvidence, demoSnapshots) {
  setConsultantState((s) => {
    const existingRids = new Set((s.reports       || []).map((r)  => r.id));
    const existingEids = new Set((s.evidenceItems || []).map((e)  => e.id));
    const existingSids = new Set((s.snapshots     || []).map((sn) => sn.id));
    return {
      ...s,
      reports:       [...(s.reports       || []), ...demoReports.filter((r)  => !existingRids.has(r.id))],
      evidenceItems: [...(s.evidenceItems || []), ...demoEvidence.filter((e)  => !existingEids.has(e.id))],
      snapshots:     [...(s.snapshots     || []), ...demoSnapshots.filter((sn) => !existingSids.has(sn.id))],
    };
  });
}

export function clearDemoReportHistory(demoReportIds, demoEvidenceIds, demoSnapshotIds) {
  setConsultantState((s) => ({
    ...s,
    reports:       (s.reports       || []).filter((r)  => !demoReportIds.has(r.id)),
    evidenceItems: (s.evidenceItems || []).filter((e)  => !demoEvidenceIds.has(e.id)),
    snapshots:     (s.snapshots     || []).filter((sn) => !demoSnapshotIds.has(sn.id)),
  }));
}

export function getReportsState()       { return getConsultantState().reports       || []; }
export function getEvidenceItemsState() { return getConsultantState().evidenceItems || []; }
export function getSnapshotsState()     { return getConsultantState().snapshots     || []; }
export function getClientsFromState()   { return getConsultantState().clients       || []; }

export function getDemoHubClients() {
  return (getConsultantState().clients || []).filter((c) => c.isDemo === true);
}

// ─── Active Client Switching ──────────────────────────────────────────────────
/**
 * Switch the main app storage key to a client-specific key.
 * This is done by rewriting APP_STORAGE_KEY before loadState().
 * On switch: save current state, then hot-swap the storage key.
 */
export function switchToClient(clientId, currentMainState, saveMainStateFn) {
  const APP_KEY = 'qcos_v1_state';
  const now     = new Date().toISOString();

  // 1. Save current main app state to main key
  if (currentMainState && saveMainStateFn) {
    saveMainStateFn(currentMainState);
  }

  // 1b. Also save current state to the CURRENT CLIENT's dedicated slot
  //     so switching away doesn't lose their latest data
  const currentActiveId = _consultantState?.activeClientId;
  if (currentActiveId && currentMainState) {
    saveClientState(currentActiveId, currentMainState);
  }

  // 2. If switching to a specific client, copy their state into the main key
  if (clientId) {
    const clientData = getClientState(clientId);
    if (clientData) {
      localStorage.setItem(APP_KEY, JSON.stringify(clientData));
    } else {
      // New client — copy a blank initial state
      localStorage.removeItem(APP_KEY);
    }
    setConsultantState((s) => ({
      ...s,
      activeClientId: clientId,
      clients: s.clients.map((c) =>
        c.id === clientId ? { ...c, lastActivity: now } : c
      ),
    }));
  } else {
    // Switch back to "own" workspace — main key as-is
    setConsultantState((s) => ({ ...s, activeClientId: null }));
  }
}

/**
 * Persist current main app state back into client's dedicated slot.
 * Called on every state change when a client is active.
 */
export function syncClientState(clientId, mainState) {
  if (!clientId) return;
  saveClientState(clientId, mainState);
}

// ─── Deployment Checklist ─────────────────────────────────────────────────────
export function updateDeploymentChecklistItem(id, done) {
  setConsultantState((s) => ({
    ...s,
    deploymentChecklist: s.deploymentChecklist.map((item) =>
      item.id === id ? { ...item, done } : item
    ),
  }));
}

// ─── Full Export (all clients + consultant workspace) ─────────────────────────
export function exportFullBackup(mainState) {
  const consultant = getConsultantState();
  const clientSnapshots = {};
  for (const client of consultant.clients) {
    clientSnapshots[client.id] = getClientState(client.id) || {};
  }
  return {
    meta: {
      exportedAt:   new Date().toISOString(),
      platform:     'Quantum Compliance OS™',
      version:      '5.0.0',
      exportType:   'full_backup',
      defensiveOnly: true,
    },
    consultantWorkspace: consultant,
    clientSnapshots,
    mainState,
  };
}

// ─── Full Import (restore from backup) ───────────────────────────────────────
export function importFullBackup(backupJson, reloadFn) {
  try {
    const backup = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
    if (!backup || typeof backup !== 'object') throw new Error('Backup is not a valid JSON object');
    if (!backup.meta || !backup.consultantWorkspace) throw new Error('Invalid backup format — missing meta or consultantWorkspace');
    if (typeof backup.meta.exportedAt !== 'string') throw new Error('Backup meta.exportedAt is missing or invalid');

    // Restore consultant workspace
    _consultantState = { ...getInitialConsultantState(), ...backup.consultantWorkspace };
    saveConsultantState(_consultantState);

    // Restore each client's state — sanitise clientId keys
    const snapshots = backup.clientSnapshots || {};
    for (const [clientId, clientState] of Object.entries(snapshots)) {
      // Validate clientId is a safe string (alphanumeric / dash / underscore)
      if (typeof clientId !== 'string' || !/^[\w\-]+$/.test(clientId)) continue;
      if (typeof clientState !== 'object' || clientState === null) continue;
      saveClientState(clientId, clientState);
    }

    // Restore main state if present
    if (backup.mainState && typeof backup.mainState === 'object') {
      localStorage.setItem('qcos_v1_state', JSON.stringify(backup.mainState));
    }

    if (typeof reloadFn === 'function') reloadFn();
    return { success: true, clientCount: Object.keys(backup.clientSnapshots || {}).length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Consultant Analytics (from client states) ────────────────────────────────
export function computeConsultantAnalytics(clients, mainState) {
  const activeClients = clients.filter((c) => !c.archived);
  let totalSecScore   = 0;
  let secScoreCount   = 0;
  let totalQScore     = 0;
  let qScoreCount     = 0;
  let highRiskCount   = 0;
  let assessComplete  = 0;
  let reportReady     = 0;

  for (const client of activeClients) {
    const data = getClientState(client.id);
    if (!data) continue;

    const secScore = data.assessmentState?.securityAssessment?.securityImplementationScore;
    const qScore   = data.assessmentState?.quantumReadiness?.quantumReadinessScore;
    const riskItems= data.riskModel?.riskEntries || [];

    if (secScore != null) { totalSecScore += secScore; secScoreCount++; }
    if (qScore   != null) { totalQScore   += qScore;   qScoreCount++;   }
    if (riskItems.some((r) => r.inherentRisk === 'critical')) highRiskCount++;
    if (secScore != null || qScore != null) assessComplete++;
    if (data.reportModel?.lastGenerated) reportReady++;
  }

  // Also include own state if no active client
  const ownSec = mainState?.assessmentState?.securityAssessment?.securityImplementationScore;
  const ownQ   = mainState?.assessmentState?.quantumReadiness?.quantumReadinessScore;

  return {
    totalClients:    activeClients.length,
    highRiskClients: highRiskCount,
    assessmentsDone: assessComplete,
    reportsReady:    reportReady,
    avgSecScore:     secScoreCount > 0 ? Math.round(totalSecScore / secScoreCount) : null,
    avgQScore:       qScoreCount   > 0 ? Math.round(totalQScore   / qScoreCount)   : null,
    ownSecScore:     ownSec,
    ownQScore:       ownQ,
  };
}

// ─── Onboarding Steps ─────────────────────────────────────────────────────────
export const ONBOARDING_STEPS = [
  {
    id: 0,
    title: 'Welcome to Quantum Compliance OS™',
    subtitle: 'Defensive security readiness and post-quantum migration assessment platform.',
    content: 'This platform is for defensive readiness assessment and compliance preparation only. No offensive testing, live scanning, or exploitation capabilities are included. All data is stored locally in your browser — no backend, no cloud sync, no third-party data sharing.',
    action: 'Get Started',
    icon: '⬡',
  },
  {
    id: 1,
    title: 'Tell us about yourself',
    subtitle: 'Set up your consultant workspace.',
    content: 'Are you assessing your own organisation, or acting as a consultant managing multiple clients? This determines how the platform is configured.',
    action: 'Continue',
    icon: '👤',
  },
  {
    id: 2,
    title: 'Customise your branding',
    subtitle: 'White-label the platform for your clients.',
    content: 'Set your product name, tagline, and accent colour. These appear on all reports and the platform interface. You can change these any time in Settings.',
    action: 'Continue',
    icon: '🎨',
  },
  {
    id: 3,
    title: 'You\'re ready',
    subtitle: 'Start your first assessment.',
    content: 'Your workspace is configured. Begin with your Organisation Profile, then work through the assessments. Results automatically populate your risk register and recommendations.',
    action: 'Launch Platform',
    icon: '🚀',
  },
];
