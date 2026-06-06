/**
 * QUANTUM COMPLIANCE OS™ — storage.js
 * ======================================
 * Single Source of Truth (SSOT) for all application state.
 * ALL localStorage access is EXCLUSIVELY handled here.
 * No other file may read/write localStorage directly.
 *
 * Defensive use only. No backend. No Supabase. Local-first.
 */

import { SEED_DATA } from './seedData.js';
import {
  WORKSPACE_MODE, isDemoMode, isProductMode, buildDemoClientMeta,
  filterClientsByMode, getDemoClientsFromList, getRealClientsFromList,
  getWorkspaceModeFromState, DEMO_CLIENT_IDS,
} from './workspaceMode.js';
import { DEMO_CLIENTS, DEMO_CLIENT_STATES, computeDemoMetrics } from './demoPortfolio.js';

// ─── Storage Key ────────────────────────────────────────────────────────────
export const APP_STORAGE_KEY = 'qcos_v1_state';

// ─── Initial State Factory ──────────────────────────────────────────────────
export function getInitialState() {
  return {
    appMeta: {
      appName: 'Quantum Compliance OS™',
      version: '1.0.0-run27',
      buildRun: 'RUN_27_LIVE_URL_VERIFICATION_DEFECT_REPAIR',
      latestCompletedRun: 27,
      latestCompletedRunLabel: 'Run 27 — Live URL Verification + Final Defect Repair Pass',
      mode: 'local-first',
      defensiveOnly: true,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      runLevel: 8.5,
      environment: 'local',
    },
    completedRuns: [
      'RUN_1_FOUNDATION',
      'RUN_2_SECURITY_ASSESSMENT_ENGINE',
      'RUN_3_QUANTUM_READINESS_ENGINE',
      'RUN_4_REPORTS_RECOMMENDATIONS_EVIDENCE',
      'RUN_5_CONSULTANT_SAAS_LAYER',
      'RUN_5_5_VALIDATION_HARDENING',
      'RUN_6_DEMO_DATA_SALES_POLISH',
      'RUN_7_DEPLOYMENT_PACKAGING',
      'RUN_8_CONSULTANT_COPILOT',
      'RUN_8_5_WORKSPACE_MODE',
    ],
    moduleStatus: {
      foundation:           'complete',
      securityAssessment:   'complete',
      quantumReadiness:     'complete',
      reports:              'complete',
      evidencePack:         'complete',
      consultantDashboard:  'complete',
      demoPortfolio:        'complete',
      deploymentReadiness:  'complete',
      consultantCopilot:    'complete',
      workspaceMode:        'complete',
    },
    featureFlags: {
      localFirstFoundation:      true,
      securityAssessmentEngine:  true,
      quantumReadinessEngine:    true,
      reportsAndEvidencePack:    true,
      consultantDashboard:       true,
      demoPortfolio:             true,
      deploymentPackaging:       true,
      consultantCopilot:         true,
      workspaceModeToggle:       true,
      supabaseEnabled:           false,
      backendEnabled:            false,
      paymentsEnabled:           false,
      externalAiEnabled:         false,
      offensiveScanningEnabled:  false,
    },
    organisation: {
      id: null,
      name: '',
      sector: '',
      size: '',
      country: '',
      contactName: '',
      contactEmail: '',
      complianceNeeds: [],
      dataSensitivityLevel: '',
      notes: '',
      createdAt: null,
      updatedAt: null,
      isComplete: false,
    },
    clientMode: {
      isDemoMode: true,
      demoDataLoaded: false,
    },
    systemProfiles: [],
    assessmentState: {
      securityAssessment: {
        status: 'not_started',
        lastUpdated: null,
        completedSections: [],
        responses: {},
      },
      quantumReadiness: {
        status: 'not_started',
        lastUpdated: null,
        completedSections: [],
        responses: {},
      },
    },
    riskModel: {
      categories: [],
      riskEntries: [],
      lastUpdated: null,
    },
    recommendationModel: {
      recommendations: [],
      priorityActions: [],
      lastUpdated: null,
    },
    reportModel: {
      sections: [],
      status: 'not_ready',
      lastGenerated: null,
      config: {},
    },
    evidencePack: {
      items: [],
      status: 'not_started',
      lastUpdated: null,
    },
    settings: {
      theme: 'dark',
      demoMode: true,           // legacy — workspaceMode is now SSOT
      workspaceMode: 'demo',    // 'demo' | 'product'  (Run 8.5)
      activePlanId: 'starter',  // Run 10: commercial tier — default is always 'starter'
      productMode: 'demo',      // Run 14: product mode — 'demo' | 'live-local' | 'live-backend-ready'
      activeDataProvider: 'localStorage',  // Run 14: only localStorage is active
      protectRealDataOnDemoLoad: true,
      requireModeSwitchConfirmation: true,
      autosave: true,
      legalDisclaimer: 'This platform is for defensive security readiness, compliance preparation, and post-quantum migration planning only. It does not perform offensive testing, unauthorised scanning, exploitation, or guarantee compliance. All assessments should be reviewed by qualified security professionals before operational decisions are made.',
      reportDisclaimer: 'This report is for internal planning and defensive readiness assessment purposes only. It does not constitute legal, regulatory, or professional compliance advice. Findings should be reviewed by qualified security and compliance professionals prior to any operational decisions.',
      language: 'en-GB',
      dateFormat: 'DD/MM/YYYY',
    },
    branding: {
      productName: 'Quantum Compliance OS™',
      tagline: 'Defensive Quantum-Readiness & Security Implementation Assessment',
      logoText: 'QC-OS',
      accentColour: '#00d4ff',
      logoUrl: null,
    },
    activityLog: [],
    consultantCopilot: {
      enabled: true,
      mode: 'local-template',
      apiMode: 'disabled',           // always 'disabled' in Run 8 — no external AI calls
      generatedDrafts: [],
      savedGuidance: [],
      promptHistory: [],
      lastGeneratedAt: null,
      disclaimersAccepted: false,
      settings: {
        tone: 'professional',        // professional | plain | technical | sales
        audience: 'SME business owner', // SME business owner | technical manager | board/investor | consultant internal note
        detailLevel: 'balanced',     // short | balanced | detailed
        includeQuantumNotes: true,
        includeEvidenceNotes: true,
        includeCommercialActions: true,
      },
    },
    // ── Run 9: Target Assessment Engine ─────────────────────────────────────
    targetAssessments:  [],
    targetFindings:     [],
    targetEvidence:     [],
    // ── Run 15: Backend Connector + Sync state ──────────────────────────────
    backendSettings: null,   // null = use getDefaultBackendSettings() from backendSync.js
    backendConfig:   null,   // null = use getDefaultBackendConfig() from backendConfigGuard.js (Run 23)
    syncSettings:    null,   // null = use getDefaultSyncSettings() from backendSync.js
    syncQueue:       [],     // local sync queue — items waiting for backend push
    // ── Run 16: AI Agents + Provider state ───────────────────────────────────
    aiSettings:      null,   // null = use getDefaultAISettings() from aiAgents.js
    aiProviders:     {},     // provider config overrides (base registry in aiAgents.js)
    aiAgentSessions: [],     // local agent session log
    targetScores:       [],
    assessmentSettings: {
      passiveChecksEnabled:         true,
      manualEvidenceEnabled:        true,
      questionnaireEnabled:         true,
      reportIntegrationEnabled:     true,
      allowDemoTargets:             true,
      showBrowserLimitationWarning: true,
    },
    demoTargetsLoaded:  false,
  };
}

// ─── Internal State Container ────────────────────────────────────────────────
let _state = null;
let _listeners = [];


// ─── Run 8 State Migration ──────────────────────────────────────────────────
// Safely upgrades existing localStorage state to Run 8 metadata without
// wiping any user data (assessments, clients, reports, evidence packs, drafts).
// Called inside loadState() after deepMerge so old stored values can be patched.
//
// PRESERVATION GUARANTEE:
//   organisation, systemProfiles, assessmentState, riskModel, recommendationModel,
//   reportModel, evidencePack, settings, branding, activityLog, consultantCopilot
//   generatedDrafts — ALL preserved. Only appMeta/completedRuns/moduleStatus/
//   featureFlags/consultantCopilot shell are upgraded if stale.

const RUN_8_5_COMPLETED_RUNS = [
  'RUN_1_FOUNDATION',
  'RUN_2_SECURITY_ASSESSMENT_ENGINE',
  'RUN_3_QUANTUM_READINESS_ENGINE',
  'RUN_4_REPORTS_RECOMMENDATIONS_EVIDENCE',
  'RUN_5_CONSULTANT_SAAS_LAYER',
  'RUN_5_5_VALIDATION_HARDENING',
  'RUN_6_DEMO_DATA_SALES_POLISH',
  'RUN_7_DEPLOYMENT_PACKAGING',
  'RUN_8_CONSULTANT_COPILOT',
  'RUN_8_5_WORKSPACE_MODE',
  'RUN_9_TARGET_ASSESSMENT_ENGINE',
  'RUN_10_COMMERCIAL_TIER_FOUNDATION',
  'RUN_11_MULTI_CLIENT_CONSULTANT_HUB',
  'RUN_12_REPORTS_EVIDENCE_HISTORY_RISK_COMPARISON',
  'RUN_13_AGENCY_WHITE_LABEL_SETTINGS',
  'RUN_14_DEMO_LIVE_TOGGLE_DATA_PROVIDER',
  'RUN_15_BACKEND_CONNECTORS_LIVE_SYNC',
  'RUN_16_BUILT_IN_AI_AGENTS',
  'RUN_17_FINAL_COMMERCIAL_POLISH',
  'RUN_19_CONSULTANT_AGENCY_HARDENING',
  'RUN_20_FINAL_PRODUCTION_POLISH',
  'RUN_21_PDF_REPORT_TEMPLATE_POLISH',
  'RUN_22_PUBLIC_LANDING_INVESTOR_DEMO',
  'RUN_23_PRODUCT_MODE_BACKEND_CONFIG',
  'RUN_24_LIVE_BACKEND_READINESS_HARDENING',
  'RUN_25_AUTH_TEAM_ROLES_CLIENT_PERMISSIONS',
  'RUN_26_FINAL_PRODUCTION_QA_LOCKDOWN',
  'RUN_27_LIVE_URL_VERIFICATION_DEFECT_REPAIR',
];

const RUN_8_5_MODULE_STATUS = {
  foundation:              'complete',
  securityAssessment:      'complete',
  quantumReadiness:        'complete',
  reports:                 'complete',
  evidencePack:            'complete',
  consultantDashboard:     'complete',
  demoPortfolio:           'complete',
  deploymentReadiness:     'complete',
  consultantCopilot:       'complete',
  workspaceMode:           'complete',
  targetAssessmentEngine:     'complete',
  commercialTierFoundation:   'complete',
  multiClientConsultantHub:   'complete',
  reportHistoryEvidenceRisk:  'complete',
  agencyWhiteLabelSettings:   'complete',
  demoLiveToggleDataProvider: 'complete',
  backendConnectorsLiveSync:  'complete',
  builtInAIAgents:            'complete',
  finalCommercialPolish:      'complete',
  consultantAgencyHardening:  'complete',
 finalProductionPolish:      'complete',
  pdfReportTemplatePolish:    'complete',
  publicLandingInvestorDemo:  'complete',
  productModeBackendConfig:   'complete',
  liveBackendReadinessHardening: 'complete',
  authTeamRolesClientPermissions: 'complete',
  finalProductionQaLockdown: 'complete',
};

const RUN_8_5_FEATURE_FLAGS = {
  localFirstFoundation:      true,
  securityAssessmentEngine:  true,
  quantumReadinessEngine:    true,
  reportsAndEvidencePack:    true,
  consultantDashboard:       true,
  demoPortfolio:             true,
  deploymentPackaging:       true,
  consultantCopilot:         true,
  workspaceModeToggle:       true,
  targetAssessmentEngine:    true,
  commercialTierFoundation:  true,
  multiClientConsultantHub:  true,
  reportHistoryEvidenceRisk:  true,
  agencyWhiteLabelSettings:   true,
  demoLiveToggleDataProvider: true,
  backendConnectorsLiveSync:  true,
  builtInAIAgents:            true,
  finalCommercialPolish:      true,
  consultantAgencyHardening:  true,
  finalProductionPolish:      true,
  pdfReportTemplatePolish:    true,
  publicLandingInvestorDemo:  true,
  productModeBackendConfig:   true,
  liveBackendReadinessHardening: true,
  authTeamRolesClientPermissions: true,
  finalProductionQaLockdown: true,
  supabaseEnabled:           false,
  backendEnabled:            false,
  paymentsEnabled:           false,
  externalAiEnabled:         false,
  offensiveScanningEnabled:  false,
};

export function migrateState(state) {
  if (!state || typeof state !== 'object') return state;

  const migrated = { ...state };

  // ── 1. Upgrade appMeta to Run 9 ─────────────────────────────────────────
  const existingMeta = migrated.appMeta || {};
  const storedRun = existingMeta.latestCompletedRun || existingMeta.runLevel || 0;

  if (storedRun < 27 || existingMeta.buildRun !== 'RUN_27_LIVE_URL_VERIFICATION_DEFECT_REPAIR') {
    migrated.appMeta = {
      ...existingMeta,
      appName: 'Quantum Compliance OS™',
      version: '1.0.0-run27',
      buildRun: 'RUN_27_LIVE_URL_VERIFICATION_DEFECT_REPAIR',
      latestCompletedRun: 27,
      latestCompletedRunLabel: 'Run 27 — Live URL Verification + Final Defect Repair Pass',
      mode: 'local-first',
      defensiveOnly: true,
      runLevel: 13,
      migratedToRun13At: new Date().toISOString(),
    };
  }

  // ── 2. Add completedRuns if missing or stale ─────────────────────────────
  const existingRuns = Array.isArray(migrated.completedRuns) ? migrated.completedRuns : [];
  const missingRuns  = RUN_8_5_COMPLETED_RUNS.filter((r) => !existingRuns.includes(r));
  if (missingRuns.length > 0) {
    migrated.completedRuns = [...new Set([...existingRuns, ...RUN_8_5_COMPLETED_RUNS])];
  }

  // ── 3. Add/patch moduleStatus ────────────────────────────────────────────
  migrated.moduleStatus = {
    ...(migrated.moduleStatus || {}),
    ...RUN_8_5_MODULE_STATUS,
  };

  // ── 4. Add/patch featureFlags ────────────────────────────────────────────
  migrated.featureFlags = {
    ...(migrated.featureFlags || {}),
    ...RUN_8_5_FEATURE_FLAGS,
  };

  // ── 5. Ensure consultantCopilot shell exists (Run 8) ────────────────────
  //    Preserve any existing generatedDrafts, savedGuidance, promptHistory.
  if (!migrated.consultantCopilot) {
    migrated.consultantCopilot = {
      enabled: true,
      mode: 'local-template',
      apiMode: 'disabled',
      generatedDrafts: [],
      savedGuidance: [],
      promptHistory: [],
      lastGeneratedAt: null,
      disclaimersAccepted: false,
      settings: {
        tone: 'professional',
        audience: 'SME business owner',
        detailLevel: 'balanced',
        includeQuantumNotes: true,
        includeEvidenceNotes: true,
        includeCommercialActions: true,
      },
    };
  } else {
    // Ensure all copilot sub-fields exist without overwriting existing drafts
    const cc = migrated.consultantCopilot;
    migrated.consultantCopilot = {
      enabled:             cc.enabled              ?? true,
      mode:                cc.mode                 || 'local-template',
      apiMode:             cc.apiMode              || 'disabled',
      generatedDrafts:     Array.isArray(cc.generatedDrafts)  ? cc.generatedDrafts  : [],
      savedGuidance:       Array.isArray(cc.savedGuidance)    ? cc.savedGuidance    : [],
      promptHistory:       Array.isArray(cc.promptHistory)    ? cc.promptHistory    : [],
      lastGeneratedAt:     cc.lastGeneratedAt      || null,
      disclaimersAccepted: cc.disclaimersAccepted  ?? false,
      settings: {
        tone:                    cc.settings?.tone                    || 'professional',
        audience:                cc.settings?.audience                || 'SME business owner',
        detailLevel:             cc.settings?.detailLevel             || 'balanced',
        includeQuantumNotes:     cc.settings?.includeQuantumNotes     ?? true,
        includeEvidenceNotes:    cc.settings?.includeEvidenceNotes    ?? true,
        includeCommercialActions:cc.settings?.includeCommercialActions ?? true,
      },
    };
  }

  // ── 7. Ensure targetAssessment fields exist (Run 9) ────────────────────
  if (!Array.isArray(migrated.targetAssessments)) {
    migrated.targetAssessments  = [];
    migrated.targetFindings     = [];
    migrated.targetEvidence     = [];
    migrated.targetScores       = [];
    migrated.demoTargetsLoaded  = false;
  }
  if (!migrated.assessmentSettings) {
    migrated.assessmentSettings = {
      passiveChecksEnabled:         true,
      manualEvidenceEnabled:        true,
      questionnaireEnabled:         true,
      reportIntegrationEnabled:     true,
      allowDemoTargets:             true,
      showBrowserLimitationWarning: true,
    };
  }

  // ── 8. Ensure activePlanId exists in settings (Run 10) ─────────────────
  if (!migrated.settings) {
    migrated.settings = {};
  }
  if (!migrated.settings.activePlanId) {
    migrated.settings.activePlanId = 'starter';
  }

  // ── 9. Ensure productMode + activeDataProvider exist in settings (Run 14) ─
  if (!migrated.settings.productMode) {
    const wm = migrated.settings.workspaceMode;
    migrated.settings.productMode = wm === 'product' ? 'live-local' : 'demo';
  }
  if (!migrated.settings.activeDataProvider) {
    migrated.settings.activeDataProvider = 'localStorage';
  }

  // ── 10. Ensure backendSettings + syncSettings + syncQueue exist (Run 15) ─
  if (migrated.backendSettings === undefined) {
    migrated.backendSettings = null;
  }
  if (migrated.syncSettings === undefined) {
    migrated.syncSettings = null;
  }
  if (!Array.isArray(migrated.syncQueue)) {
    migrated.syncQueue = [];
  }

  // ── 11. Ensure aiSettings + aiProviders + aiAgentSessions exist (Run 16) ─
  if (migrated.aiSettings === undefined) {
    migrated.aiSettings = null;      // null = use defaults from aiAgents.js
  }
  if (!migrated.aiProviders || typeof migrated.aiProviders !== 'object') {
    migrated.aiProviders = {};
  }
  if (!Array.isArray(migrated.aiAgentSessions)) {
    migrated.aiAgentSessions = [];
  }

  // ── 12. Ensure backendConfig exists (Run 23 / 8.6) ──────────────────────
  if (migrated.backendConfig === undefined || migrated.backendConfig === null) {
    migrated.backendConfig = null;   // lazily initialised via getDefaultBackendConfig()
  }

  // ── 13. Ensure authConfig exists (Run 25) ────────────────────────────────
  if (!migrated.authConfig || typeof migrated.authConfig !== 'object') {
    migrated.authConfig = getDefaultAuthConfig();
  } else {
    const def = getDefaultAuthConfig();
    migrated.authConfig = { ...def, ...migrated.authConfig };
  }

  return migrated;
}

// ─── Load State ─────────────────────────────────────────────────────────────
export function loadState() {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) {
      _state = deepMerge(getInitialState(), SEED_DATA);
      _state.clientMode.demoDataLoaded = true;
      // Run 8 migration: stamp fresh state with full Run 8 metadata
      _state = migrateState(_state);
      saveState(_state);
      return _state;
    }
    const parsed = JSON.parse(raw);
    // Deep merge: initialState provides defaults, parsed provides user data
    const merged = deepMerge(getInitialState(), parsed);
    // Run 8 migration: safely upgrade appMeta/completedRuns/moduleStatus/featureFlags
    // WITHOUT touching user data (assessments, reports, clients, drafts)
    _state = migrateState(merged);
    // Persist the migrated state so next load is already up-to-date
    if (merged.appMeta?.buildRun !== 'RUN_11_MULTI_CLIENT_CONSULTANT_HUB') {
      saveState(_state);
    }
    return _state;
  } catch (err) {
    console.error('[QCOS Storage] Failed to load state:', err);
    _state = migrateState(deepMerge(getInitialState(), SEED_DATA));
    _state.clientMode.demoDataLoaded = true;
    return _state;
  }
}

// ─── Save State ─────────────────────────────────────────────────────────────
export function saveState(state) {
  try {
    const toSave = {
      ...state,
      appMeta: {
        ...state.appMeta,
        lastUpdated: new Date().toISOString(),
      },
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(toSave));
    _state = toSave;
    return true;
  } catch (err) {
    console.error('[QCOS Storage] Failed to save state:', err);
    return false;
  }
}

// ─── Reset State ─────────────────────────────────────────────────────────────
export function resetState() {
  const fresh = getInitialState();
  saveState(fresh);
  _notifyListeners();
  return fresh;
}

// ─── Get State ───────────────────────────────────────────────────────────────
export function getState() {
  if (!_state) loadState();
  return _state;
}

// ─── Set State ───────────────────────────────────────────────────────────────
export function setState(updater) {
  const current = getState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  saveState(next);
  _notifyListeners();
  return next;
}

// ─── Subscribe ───────────────────────────────────────────────────────────────
export function subscribe(listener) {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

function _notifyListeners() {
  const current = getState();
  _listeners.forEach((l) => {
    try { l(current); } catch (e) { /* silent */ }
  });
}

// ─── Organisation Operations ─────────────────────────────────────────────────
export function createOrganisation(payload) {
  const now = new Date().toISOString();
  const org = {
    ...payload,
    id: payload.id || `org_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    isComplete: _isOrgComplete(payload),
  };
  setState((s) => ({ ...s, organisation: org }));
  addActivityLog({ type: 'org_created', message: `Organisation "${org.name}" created.` });
  return org;
}

export function updateOrganisation(payload) {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    organisation: {
      ...s.organisation,
      ...payload,
      updatedAt: now,
      isComplete: _isOrgComplete({ ...s.organisation, ...payload }),
    },
  }));
  addActivityLog({ type: 'org_updated', message: `Organisation profile updated.` });
}

function _isOrgComplete(org) {
  return !!(org.name && org.sector && org.country && org.dataSensitivityLevel);
}

// ─── System Profile Operations ────────────────────────────────────────────────
export function createSystemProfile(payload) {
  const now = new Date().toISOString();
  const system = {
    ...payload,
    id: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
    archived: false,
    archivedAt: null,
  };
  setState((s) => ({
    ...s,
    systemProfiles: [...s.systemProfiles, system],
  }));
  addActivityLog({ type: 'system_created', message: `System "${system.name}" added to inventory.` });
  return system;
}

export function updateSystemProfile(id, payload) {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    systemProfiles: s.systemProfiles.map((sys) =>
      sys.id === id ? { ...sys, ...payload, updatedAt: now } : sys
    ),
  }));
  addActivityLog({ type: 'system_updated', message: `System "${payload.name || id}" updated.` });
}

export function deleteSystemProfile(id) {
  const state = getState();
  const sys = state.systemProfiles.find((s) => s.id === id);
  setState((s) => ({
    ...s,
    systemProfiles: s.systemProfiles.filter((sys) => sys.id !== id),
  }));
  addActivityLog({ type: 'system_deleted', message: `System "${sys?.name || id}" permanently deleted.` });
}

export function archiveSystemProfile(id) {
  const now = new Date().toISOString();
  const state = getState();
  const sys = state.systemProfiles.find((s) => s.id === id);
  setState((s) => ({
    ...s,
    systemProfiles: s.systemProfiles.map((sys) =>
      sys.id === id ? { ...sys, archived: true, archivedAt: now } : sys
    ),
  }));
  addActivityLog({ type: 'system_archived', message: `System "${sys?.name || id}" archived.` });
}

export function restoreSystemProfile(id) {
  const state = getState();
  const sys = state.systemProfiles.find((s) => s.id === id);
  setState((s) => ({
    ...s,
    systemProfiles: s.systemProfiles.map((sys) =>
      sys.id === id ? { ...sys, archived: false, archivedAt: null } : sys
    ),
  }));
  addActivityLog({ type: 'system_restored', message: `System "${sys?.name || id}" restored from archive.` });
}

// ─── Settings & Branding ──────────────────────────────────────────────────────
export function updateSettings(payload) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...payload } }));
  addActivityLog({ type: 'settings_updated', message: 'Settings updated.' });
}

export function updateBranding(payload) {
  setState((s) => ({ ...s, branding: { ...s.branding, ...payload } }));
  addActivityLog({ type: 'branding_updated', message: 'Branding settings updated.' });
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
export function addActivityLog(entry) {
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: entry.type || 'info',
    message: entry.message || '',
    timestamp: new Date().toISOString(),
    meta: entry.meta || null,
  };
  setState((s) => ({
    ...s,
    activityLog: [logEntry, ...s.activityLog].slice(0, 100), // cap at 100 entries
  }));
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
export function clearDemoData() {
  setState((s) => ({
    ...s,
    organisation: getInitialState().organisation,
    systemProfiles: [],
    activityLog: [],
    clientMode: { ...s.clientMode, isDemoMode: false, demoDataLoaded: false },
  }));
  addActivityLog({ type: 'demo_cleared', message: 'Demo data cleared. Ready for live data.' });
}

export function restoreDemoData() {
  setState((s) => ({
    ...s,
    organisation: SEED_DATA.organisation,
    systemProfiles: SEED_DATA.systemProfiles,
    clientMode: { isDemoMode: true, demoDataLoaded: true },
  }));
  addActivityLog({ type: 'demo_restored', message: 'Demo data restored.' });
}

// ─── Run 6: Demo Portfolio Operations ─────────────────────────────────────────

/**
 * Load the full demo portfolio into the consultant layer.
 * Saves each demo client's state into their individual localStorage slot.
 * Must be called with the consultantStorage helpers to avoid circular imports.
 * Called from: ConsultantDashboard or Settings with the save helpers passed in.
 */
export function loadDemoPortfolio(saveClientStateFn, setConsultantStateFn, getConsultantStateFn) {
  const now = new Date().toISOString();

  // Save each client state into their dedicated slot
  for (const [clientId, clientState] of Object.entries(DEMO_CLIENT_STATES)) {
    saveClientStateFn(clientId, {
      ...clientState,
      clientMode: { isDemoMode: true, demoDataLoaded: true },
    });
  }

  // Stamp clientMeta.isDemo = true on all demo clients before merging
  const demoClientsWithMeta = DEMO_CLIENTS.map((c) => ({
    ...c,
    clientMeta: {
      isDemo: true,
      workspaceMode: WORKSPACE_MODE.DEMO,
      createdFrom: 'demo-seed',
      lockedDemoRecord: true,
    },
  }));

  // Merge demo clients into consultant workspace (preserve any existing non-demo clients)
  const currentCs = getConsultantStateFn();
  const existingIds = new Set((currentCs.clients || []).map((c) => c.id));
  const newClients = demoClientsWithMeta.filter((c) => !existingIds.has(c.id));

  setConsultantStateFn((cs) => ({
    ...cs,
    clients: [
      ...newClients,
      ...(cs.clients || []).map((c) => {
        // Update any already-existing demo clients with fresh clientMeta
        if (DEMO_CLIENT_IDS.has(c.id)) {
          return {
            ...c,
            clientMeta: { isDemo: true, workspaceMode: WORKSPACE_MODE.DEMO, createdFrom: 'demo-seed', lockedDemoRecord: true },
          };
        }
        return c;
      }),
    ],
    lastUpdated: now,
  }));

  // Restore main app state to the showcase client (Clearline) for immediate impact
  const showcaseId = 'demo_client_clearline';
  const showcaseState = DEMO_CLIENT_STATES[showcaseId];
  if (showcaseState) {
    setState(() => ({
      ...getInitialState(),
      ...showcaseState,
      clientMode: { isDemoMode: true, demoDataLoaded: true },
      settings: {
        ...getInitialState().settings,
        workspaceMode: WORKSPACE_MODE.DEMO,
        demoMode: true,
      },
    }));
    saveState(_state);
  }

  addActivityLog({ type: 'demo_portfolio_loaded', message: 'Demo portfolio loaded with 5 SME client examples.' });
}

/**
 * Reset the demo portfolio — removes all demo clients and restores the
 * default single-client seed data. Destructive — confirm before calling.
 */
export function resetDemoPortfolio(saveClientStateFn, setConsultantStateFn, deleteFn) {
  const demoIds = DEMO_CLIENTS.map((c) => c.id);

  // Remove each demo client state from localStorage
  for (const id of demoIds) {
    try { deleteFn(id); } catch {}
  }

  // Remove demo clients from consultant workspace
  setConsultantStateFn((cs) => ({
    ...cs,
    clients: (cs.clients || []).filter((c) => !demoIds.includes(c.id)),
    activeClientId: null,
    lastUpdated: new Date().toISOString(),
  }));

  // Restore default seed state
  setState(() => ({
    ...getInitialState(),
    ...SEED_DATA,
    clientMode: { isDemoMode: true, demoDataLoaded: true },
  }));
  saveState(_state);

  addActivityLog({ type: 'demo_portfolio_reset', message: 'Demo portfolio reset. Default demo data restored.' });
}

/**
 * Get demo portfolio metrics for consultant dashboard display.
 * Returns pre-computed analytics from the demo dataset.
 */
export function getDemoPortfolioMetrics() {
  return computeDemoMetrics();
}

/**
 * Get all demo client metadata (without full state — lightweight for list views).
 */
export function getDemoClients() {
  return DEMO_CLIENTS;
}


// ─── Utilities ────────────────────────────────────────────────────────────────
function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN 2 — SECURITY ASSESSMENT ENGINE EXTENSIONS
// Added below existing Run 1 functions. No modification to existing functions.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Save Assessment Response ─────────────────────────────────────────────────
/**
 * Save a single answer to the security assessment.
 * responses structure: { [categoryId]: { [questionId]: answerValue } }
 */
export function saveAssessmentResponse(categoryId, questionId, answerValue) {
  setState((s) => {
    const existing = s.assessmentState?.securityAssessment?.responses || {};
    const catResponses = existing[categoryId] || {};
    const updatedCat = { ...catResponses, [questionId]: answerValue };
    const updatedResponses = { ...existing, [categoryId]: updatedCat };

    return {
      ...s,
      assessmentState: {
        ...s.assessmentState,
        securityAssessment: {
          ...s.assessmentState.securityAssessment,
          responses: updatedResponses,
          status: 'in_progress',
          lastUpdated: new Date().toISOString(),
        },
      },
    };
  });
}

// ─── Save Bulk Assessment Responses (for a full category) ────────────────────
export function saveAssessmentCategoryResponses(categoryId, categoryResponses) {
  setState((s) => {
    const existing = s.assessmentState?.securityAssessment?.responses || {};
    const updatedResponses = { ...existing, [categoryId]: { ...(existing[categoryId] || {}), ...categoryResponses } };

    return {
      ...s,
      assessmentState: {
        ...s.assessmentState,
        securityAssessment: {
          ...s.assessmentState.securityAssessment,
          responses: updatedResponses,
          status: 'in_progress',
          lastUpdated: new Date().toISOString(),
        },
      },
    };
  });
  addActivityLog({ type: 'assessment_progress', message: `Security assessment: ${categoryId} responses saved.` });
}

// ─── Commit Assessment Results ────────────────────────────────────────────────
/**
 * After scoring, persist the full assessment result back to state.
 * This updates: riskModel, recommendationModel, and assessmentState.
 */
export function commitAssessmentResults(scoringResult, responses) {
  const now = new Date().toISOString();
  const completedCats = scoringResult.progress?.completedCategories || [];
  const isFullyComplete = scoringResult.progress?.percentRequired >= 100;

  setState((s) => ({
    ...s,
    assessmentState: {
      ...s.assessmentState,
      securityAssessment: {
        ...s.assessmentState.securityAssessment,
        responses,
        status: isFullyComplete ? 'complete' : 'in_progress',
        completedSections: completedCats,
        lastUpdated: now,
        // Store core scores directly on assessment state
        securityImplementationScore: scoringResult.securityImplementationScore,
        preventativeControlScore: scoringResult.preventativeControlScore,
        categoryScores: scoringResult.categoryScores,
        computedAt: scoringResult.computedAt,
      },
    },
    riskModel: {
      categories: scoringResult.categoryScores,
      riskEntries: scoringResult.riskItems,
      weaknesses: scoringResult.weaknesses,
      lastUpdated: now,
    },
    recommendationModel: {
      recommendations: scoringResult.recommendations,
      priorityActions: scoringResult.priorityActions,
      lastUpdated: now,
    },
    appMeta: {
      ...s.appMeta,
      runLevel: Math.max(s.appMeta?.runLevel || 1, 2),
    },
  }));

  const scoreLabel = scoringResult.threshold?.label || 'Unknown';
  addActivityLog({
    type: 'assessment_scored',
    message: `Security assessment scored: ${scoringResult.securityImplementationScore}% — ${scoreLabel}. ${scoringResult.riskItems.length} risk items identified.`,
  });
}

// ─── Reset Security Assessment ────────────────────────────────────────────────
export function resetSecurityAssessment() {
  setState((s) => ({
    ...s,
    assessmentState: {
      ...s.assessmentState,
      securityAssessment: {
        status: 'not_started',
        lastUpdated: new Date().toISOString(),
        completedSections: [],
        responses: {},
        securityImplementationScore: null,
        preventativeControlScore: null,
        categoryScores: null,
        computedAt: null,
      },
    },
    riskModel: {
      categories: [],
      riskEntries: [],
      weaknesses: [],
      lastUpdated: null,
    },
    recommendationModel: {
      recommendations: [],
      priorityActions: [],
      lastUpdated: null,
    },
  }));
  addActivityLog({ type: 'assessment_reset', message: 'Security assessment reset. All responses cleared.' });
}

// ─── Update Risk Entry Status ─────────────────────────────────────────────────
export function updateRiskEntryStatus(riskId, status) {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    riskModel: {
      ...s.riskModel,
      riskEntries: (s.riskModel?.riskEntries || []).map((r) =>
        r.id === riskId ? { ...r, status, updatedAt: now } : r
      ),
      lastUpdated: now,
    },
  }));
}

// ─── Update Recommendation Status ────────────────────────────────────────────
export function updateRecommendationStatus(recId, status) {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    recommendationModel: {
      ...s.recommendationModel,
      recommendations: (s.recommendationModel?.recommendations || []).map((r) =>
        r.id === recId ? { ...r, status, updatedAt: now } : r
      ),
      lastUpdated: now,
    },
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN 3 — QUANTUM READINESS ENGINE EXTENSIONS
// Appended below Run 2. No existing functions modified.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Save Quantum Category Responses ─────────────────────────────────────────
export function saveQuantumCategoryResponses(categoryId, categoryResponses) {
  setState((s) => {
    const existing = s.assessmentState?.quantumReadiness?.responses || {};
    const updated  = { ...existing, [categoryId]: { ...(existing[categoryId] || {}), ...categoryResponses } };
    return {
      ...s,
      assessmentState: {
        ...s.assessmentState,
        quantumReadiness: {
          ...s.assessmentState.quantumReadiness,
          responses:    updated,
          status:       'in_progress',
          lastUpdated:  new Date().toISOString(),
        },
      },
    };
  });
  addActivityLog({ type: 'quantum_progress', message: `Quantum readiness: ${categoryId} responses saved.` });
}

// ─── Commit Quantum Assessment Results ───────────────────────────────────────
export function commitQuantumResults(scoringResult, responses) {
  const now = new Date().toISOString();
  const completedCats  = scoringResult.progress?.completedCategories || [];
  const isFullyComplete = scoringResult.progress?.percentRequired >= 100;

  setState((s) => {
    // Merge quantum risk items with existing security risk items
    const existingRiskEntries = s.riskModel?.riskEntries?.filter((r) => !r.id?.startsWith('qrisk_')) || [];
    const combinedRiskEntries = [...existingRiskEntries, ...(scoringResult.riskItems || [])];

    // Merge quantum recommendations with existing security recommendations
    const existingRecs = s.recommendationModel?.recommendations?.filter((r) => !r.id?.startsWith('qrec_')) || [];
    const combinedRecs = [...existingRecs, ...(scoringResult.migrationPriorities || [])];

    // Merge priority actions
    const existingPriority = s.recommendationModel?.priorityActions?.filter((r) => !r.id?.startsWith('qrec_')) || [];
    const combinedPriority = [...existingPriority, ...(scoringResult.priorityActions || [])].slice(0, 20);

    // Compute combined overall readiness score
    const secScore = s.assessmentState?.securityAssessment?.securityImplementationScore ?? null;
    const qScore   = scoringResult.quantumReadinessScore;
    const overallReadinessScore = (secScore != null && qScore != null)
      ? Math.round(secScore * 0.6 + qScore * 0.4)
      : null;

    return {
      ...s,
      assessmentState: {
        ...s.assessmentState,
        quantumReadiness: {
          ...s.assessmentState.quantumReadiness,
          responses:            responses,
          status:               isFullyComplete ? 'complete' : 'in_progress',
          completedSections:    completedCats,
          lastUpdated:          now,
          quantumReadinessScore: scoringResult.quantumReadinessScore,
          cryptoAgilityScore:   scoringResult.cryptoAgilityScore,
          hndlRiskScore:        scoringResult.hndlRiskScore,
          categoryScores:       scoringResult.categoryScores,
          computedAt:           scoringResult.computedAt,
          ncscPhase:            scoringResult.ncscPhase,
        },
        overallReadinessScore,
      },
      riskModel: {
        ...s.riskModel,
        riskEntries:  combinedRiskEntries,
        weaknesses:   [
          ...(s.riskModel?.weaknesses?.filter((w) => w.domain !== 'quantum') || []),
          ...(scoringResult.weaknesses || []),
        ],
        lastUpdated:  now,
      },
      recommendationModel: {
        recommendations: combinedRecs,
        priorityActions: combinedPriority,
        migrationPriorities: scoringResult.migrationPriorities || [],
        lastUpdated: now,
      },
      appMeta: {
        ...s.appMeta,
        runLevel: Math.max(s.appMeta?.runLevel || 1, 3),
      },
    };
  });

  const label = scoringResult.threshold?.label || 'Unknown';
  addActivityLog({
    type:    'quantum_scored',
    message: `Quantum readiness scored: ${scoringResult.quantumReadinessScore}% — ${label}. Crypto-agility: ${scoringResult.cryptoAgilityScore}%. HNDL risk: ${scoringResult.hndlRiskScore}/100. ${scoringResult.riskItems.length} quantum risk items.`,
  });
}

// ─── Reset Quantum Assessment ─────────────────────────────────────────────────
export function resetQuantumAssessment() {
  setState((s) => {
    // Remove quantum risk/rec items, keep security ones
    const secRiskEntries = (s.riskModel?.riskEntries || []).filter((r) => !r.id?.startsWith('qrisk_'));
    const secRecs        = (s.recommendationModel?.recommendations || []).filter((r) => !r.id?.startsWith('qrec_'));
    const secPriority    = (s.recommendationModel?.priorityActions  || []).filter((r) => !r.id?.startsWith('qrec_'));

    const secScore = s.assessmentState?.securityAssessment?.securityImplementationScore ?? null;

    return {
      ...s,
      assessmentState: {
        ...s.assessmentState,
        quantumReadiness: {
          status:      'not_started',
          lastUpdated: new Date().toISOString(),
          completedSections: [],
          responses:   {},
          quantumReadinessScore: null,
          cryptoAgilityScore:   null,
          hndlRiskScore:        null,
          categoryScores:       null,
          computedAt:           null,
          ncscPhase:            null,
        },
        overallReadinessScore: null,
      },
      riskModel: {
        ...s.riskModel,
        riskEntries: secRiskEntries,
        weaknesses:  (s.riskModel?.weaknesses || []).filter((w) => w.domain !== 'quantum'),
        lastUpdated: new Date().toISOString(),
      },
      recommendationModel: {
        ...s.recommendationModel,
        recommendations:    secRecs,
        priorityActions:    secPriority,
        migrationPriorities:[],
        lastUpdated:        new Date().toISOString(),
      },
    };
  });
  addActivityLog({ type: 'quantum_reset', message: 'Quantum readiness assessment reset. All responses cleared.' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN 4 — REPORTS, RECOMMENDATIONS + EVIDENCE PACK EXTENSIONS
// Appended below Run 3. No existing functions modified.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Evidence Pack Operations ─────────────────────────────────────────────────

export function addEvidenceItem(payload) {
  const now = new Date().toISOString();
  const item = {
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    controlName: payload.controlName || '',
    evidenceType: payload.evidenceType || 'document',
    status: payload.status || 'not_started',
    owner: payload.owner || '',
    notes: payload.notes || '',
    framework: payload.framework || '',
    domain: payload.domain || '',
    dateAdded: now,
    lastReviewed: null,
    updatedAt: now,
  };
  setState((s) => ({
    ...s,
    evidencePack: {
      ...s.evidencePack,
      items: [...(s.evidencePack?.items || []), item],
      lastUpdated: now,
      status: 'in_progress',
    },
  }));
  addActivityLog({ type: 'evidence_added', message: `Evidence item added: "${item.controlName}".` });
  return item;
}

export function updateEvidenceItem(id, payload) {
  const now = new Date().toISOString();
  setState((s) => ({
    ...s,
    evidencePack: {
      ...s.evidencePack,
      items: (s.evidencePack?.items || []).map((item) =>
        item.id === id
          ? { ...item, ...payload, updatedAt: now, lastReviewed: now }
          : item
      ),
      lastUpdated: now,
    },
  }));
}

export function deleteEvidenceItem(id) {
  setState((s) => {
    const item = (s.evidencePack?.items || []).find((i) => i.id === id);
    return {
      ...s,
      evidencePack: {
        ...s.evidencePack,
        items: (s.evidencePack?.items || []).filter((i) => i.id !== id),
        lastUpdated: new Date().toISOString(),
      },
    };
  });
  addActivityLog({ type: 'evidence_deleted', message: `Evidence item deleted.` });
}

export function markEvidencePackReady() {
  setState((s) => ({
    ...s,
    evidencePack: {
      ...s.evidencePack,
      status: 'ready',
      lastUpdated: new Date().toISOString(),
    },
  }));
  addActivityLog({ type: 'evidence_pack_ready', message: 'Evidence pack marked as ready.' });
}

export function scaffoldEvidencePack(recommendations, riskEntries) {
  const now = new Date().toISOString();
  // Build evidence items from recommendations + risk domain mapping
  const EVIDENCE_TYPE_MAP = {
    mfa: { type: 'configuration', control: 'Multi-Factor Authentication Policy & Configuration', framework: 'NCSC Cyber Essentials / ISO 27001 A.9' },
    password_policy: { type: 'policy', control: 'Password Policy Document', framework: 'NIST SP 800-63B / NCSC' },
    access_control: { type: 'process', control: 'Access Control & JML Process Records', framework: 'ISO 27001 A.9 / NIST CSF PR.AC' },
    encryption_transit: { type: 'configuration', control: 'TLS Configuration & Certificate Records', framework: 'ISO 27001 A.10 / NCSC TLS Guidance' },
    encryption_rest: { type: 'configuration', control: 'Encryption at Rest Configuration Evidence', framework: 'ISO 27001 A.10 / NIST CSF PR.DS' },
    backups: { type: 'audit_log', control: 'Backup & Restore Test Records', framework: 'ISO 27001 A.12.3 / NCSC' },
    logging_monitoring: { type: 'audit_log', control: 'SIEM / Log Management Configuration & Retention', framework: 'ISO 27001 A.12.4 / NIST CSF DE.CM' },
    incident_response: { type: 'policy', control: 'Incident Response Plan & Test Records', framework: 'ISO 27001 A.16 / NIST CSF RS' },
    vulnerability_management: { type: 'audit_log', control: 'Vulnerability Scan Reports & Patch Records', framework: 'ISO 27001 A.12.6 / CIS Control 7' },
    third_party: { type: 'contract', control: 'Supplier Security Due Diligence Records', framework: 'ISO 27001 A.15 / NIS2 Article 21' },
    device_user_security: { type: 'training_record', control: 'Security Awareness Training Completion Records', framework: 'NCSC Cyber Essentials / ISO 27001 A.6' },
    cloud_posture: { type: 'configuration', control: 'Cloud Security Posture Configuration Export', framework: 'CIS Benchmarks / CSA CCM' },
    pke_exposure: { type: 'audit_log', control: 'Cryptographic Asset Inventory', framework: 'NIST SP 800-208 / NCSC PQC Guidance' },
    cert_key_inventory: { type: 'configuration', control: 'Certificate & Key Inventory Export', framework: 'NIST SP 800-57 / SP 800-208' },
    hndl_risk: { type: 'policy', control: 'Data Shelf-Life & HNDL Risk Assessment', framework: 'NIST IR 8413 / NCSC PQC Guidance' },
    crypto_agility: { type: 'policy', control: 'Crypto-Agility Architecture Review Document', framework: 'NIST IR 8547 / SP 800-208' },
    migration_planning: { type: 'policy', control: 'PQC Migration Roadmap', framework: 'NIST SP 800-208 / NCSC PQC Guidance' },
  };

  const seen = new Set();
  const items = [];

  // From risk domains
  for (const risk of (riskEntries || [])) {
    const catId = risk.id?.split('_').slice(1, -1).join('_') || '';
    const domainKey = Object.keys(EVIDENCE_TYPE_MAP).find((k) => risk.id?.includes(k));
    if (domainKey && !seen.has(domainKey)) {
      seen.add(domainKey);
      const map = EVIDENCE_TYPE_MAP[domainKey];
      items.push({
        id: `ev_scaffold_${domainKey}_${Date.now()}`,
        controlName: map.control,
        evidenceType: map.type,
        status: 'not_started',
        owner: '',
        notes: '',
        framework: map.framework,
        domain: domainKey,
        dateAdded: now,
        lastReviewed: null,
        updatedAt: now,
      });
    }
  }

  // Always add core items
  const CORE_ITEMS = [
    { controlName: 'Information Security Policy', evidenceType: 'policy', framework: 'ISO 27001 A.5 / NCSC', domain: 'governance' },
    { controlName: 'Asset Register / CMDB', evidenceType: 'configuration', framework: 'ISO 27001 A.8 / CIS Control 1', domain: 'governance' },
    { controlName: 'Risk Assessment Register', evidenceType: 'audit_log', framework: 'ISO 27001 §6 / NIST CSF ID.RA', domain: 'governance' },
    { controlName: 'Business Continuity Plan', evidenceType: 'policy', framework: 'ISO 27001 A.17', domain: 'governance' },
    { controlName: 'Data Processing Register (GDPR Article 30)', evidenceType: 'document', framework: 'UK GDPR / GDPR Article 30', domain: 'data_protection' },
  ];

  for (const ci of CORE_ITEMS) {
    if (!seen.has(ci.domain + ci.controlName)) {
      seen.add(ci.domain + ci.controlName);
      items.push({ ...ci, id: `ev_core_${ci.domain}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`, status: 'not_started', owner: '', notes: '', dateAdded: now, lastReviewed: null, updatedAt: now });
    }
  }

  setState((s) => ({
    ...s,
    evidencePack: {
      items,
      status: 'in_progress',
      lastUpdated: now,
    },
  }));
  addActivityLog({ type: 'evidence_scaffolded', message: `Evidence pack scaffolded with ${items.length} items from assessment results.` });
  return items;
}

// ─── Report History Operations ────────────────────────────────────────────────

export function saveReportSnapshot(reportConfig) {
  const now = new Date().toISOString();
  const snapshot = {
    id: `report_${Date.now()}`,
    generatedAt: now,
    type: reportConfig.type || 'full',
    label: reportConfig.label || `Report — ${new Date().toLocaleDateString('en-GB')}`,
    sections: reportConfig.sections || [],
    scoreSnapshot: reportConfig.scoreSnapshot || {},
    branding: reportConfig.branding || {},
  };
  setState((s) => ({
    ...s,
    reportModel: {
      ...s.reportModel,
      sections: reportConfig.sections || [],
      status: 'ready',
      lastGenerated: now,
      history: [snapshot, ...(s.reportModel?.history || [])].slice(0, 20),
    },
    appMeta: { ...s.appMeta, runLevel: Math.max(s.appMeta?.runLevel || 1, 4) },
  }));
  addActivityLog({ type: 'report_generated', message: `Report generated: ${snapshot.label}` });
  return snapshot;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN 5 — CONSULTANT LAYER BRIDGE
// When a client is active, every setState also syncs to that client's slot.
// Imported lazily to avoid circular deps. No logic change to existing functions.
// ═══════════════════════════════════════════════════════════════════════════════

// Called from AppShell after client switch to force a fresh state load
export function forceReloadState() {
  _state = null;
  loadState();
  _listeners.forEach((fn) => fn(_state));
}
// ─── Corrupted State Recovery ─────────────────────────────────────────────────
/**
 * Attempts to recover a valid state object.
 * If _state is null/undefined or critically malformed, reloads from localStorage.
 * Falls back to initial+seed if localStorage is also corrupted.
 * Defensive-only: never alters user data unless recovery is needed.
 */
export function getStateOrRecover() {
  if (!_state || typeof _state !== 'object') {
    console.warn('[QCOS Storage] State missing — attempting recovery via loadState()');
    loadState();
  }
  // Ensure top-level shape integrity — re-merge with defaults if needed
  if (!_state.organisation || !_state.systemProfiles) {
    console.warn('[QCOS Storage] State shape corrupted — deep-merging with initial state');
    _state = deepMerge(getInitialState(), _state || {});
  }
  return _state;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN 8 — CONSULTANT COPILOT STORAGE FUNCTIONS
// All copilot state flows exclusively through storage.js (SSOT).
// No external AI calls. No backend. Defensive use only.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * saveCopilotDraft — saves a generated copilot draft to state.
 * @param {object} draft — { id, title, type, content, generatedAt, clientSnapshot }
 */
export function saveCopilotDraft(draft) {
  setState((s) => {
    const existing = s.consultantCopilot?.generatedDrafts || [];
    // Limit to 20 saved drafts — drop oldest if over limit
    const updated = [draft, ...existing].slice(0, 20);
    return {
      ...s,
      consultantCopilot: {
        ...s.consultantCopilot,
        generatedDrafts: updated,
        lastGeneratedAt: draft.generatedAt || new Date().toISOString(),
      },
    };
  });
}

/**
 * deleteCopilotDraft — removes a draft by id.
 */
export function deleteCopilotDraft(draftId) {
  setState((s) => ({
    ...s,
    consultantCopilot: {
      ...s.consultantCopilot,
      generatedDrafts: (s.consultantCopilot?.generatedDrafts || []).filter((d) => d.id !== draftId),
    },
  }));
}

/**
 * updateCopilotSettings — updates copilot settings (tone, audience, etc.)
 */
export function updateCopilotSettings(settingsUpdate) {
  setState((s) => ({
    ...s,
    consultantCopilot: {
      ...s.consultantCopilot,
      settings: {
        ...(s.consultantCopilot?.settings || {}),
        ...settingsUpdate,
      },
    },
  }));
}

/**
 * acceptCopilotDisclaimer — marks disclaimer accepted.
 */
export function acceptCopilotDisclaimer() {
  setState((s) => ({
    ...s,
    consultantCopilot: {
      ...s.consultantCopilot,
      disclaimersAccepted: true,
    },
  }));
}

/**
 * getCopilotState — returns the current copilot sub-state.
 */
export function getCopilotState() {
  return getState().consultantCopilot || getInitialState().consultantCopilot;
}

/**
 * addCopilotPromptHistory — logs a prompt/generation event (last 50).
 */
export function addCopilotPromptHistory(entry) {
  setState((s) => {
    const existing = s.consultantCopilot?.promptHistory || [];
    return {
      ...s,
      consultantCopilot: {
        ...s.consultantCopilot,
        promptHistory: [entry, ...existing].slice(0, 50),
      },
    };
  });
}

/**
 * getStorageUsageKB — returns approximate localStorage usage in KB.
 * Read-only diagnostic. Safe to call without side effects.
 */
export function getStorageUsageKB() {
  try {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      total += (localStorage.getItem(key) || '').length * 2;
    }
    return Math.round(total / 1024);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN 8.5 — GLOBAL WORKSPACE MODE FUNCTIONS
// All mode switching flows through storage.js (SSOT).
// No backend. No external calls. Defensive use only.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * setWorkspaceMode — switch between 'demo' and 'product' modes.
 * Updates settings.workspaceMode and settings.demoMode (legacy compat).
 * Does NOT delete data — only hides/shows content via mode filtering.
 *
 * @param {'demo'|'product'} mode
 */
export function setWorkspaceMode(mode) {
  if (mode !== WORKSPACE_MODE.DEMO && mode !== WORKSPACE_MODE.PRODUCT) {
    console.warn(`[QCOS] setWorkspaceMode: unknown mode "${mode}"`);
    return;
  }
  setState((s) => ({
    ...s,
    settings: {
      ...s.settings,
      workspaceMode: mode,
      demoMode: mode === WORKSPACE_MODE.DEMO,    // legacy compat
    },
    clientMode: {
      ...s.clientMode,
      isDemoMode: mode === WORKSPACE_MODE.DEMO,
    },
  }));
  addActivityLog({
    type: 'workspace_mode_changed',
    message: `Workspace switched to ${mode === WORKSPACE_MODE.DEMO ? 'Demo Mode' : 'Product Mode'}.`,
  });
}

/**
 * enableDemoMode — convenience wrapper for setWorkspaceMode('demo').
 */
export function enableDemoMode() {
  setWorkspaceMode(WORKSPACE_MODE.DEMO);
}

/**
 * enableProductMode — convenience wrapper for setWorkspaceMode('product').
 * Does NOT delete demo data — only hides it from product views.
 */
export function enableProductMode() {
  setWorkspaceMode(WORKSPACE_MODE.PRODUCT);
}

/**
 * getWorkspaceMode — returns current workspace mode string.
 */
export function getWorkspaceMode() {
  const s = getState();
  return s.settings?.workspaceMode || (s.settings?.demoMode ? WORKSPACE_MODE.DEMO : WORKSPACE_MODE.PRODUCT);
}

/**
 * isDemoModeActive — returns true if current state is in demo mode.
 */
export function isDemoModeActive() {
  return isDemoMode(getState());
}

/**
 * isProductModeActive — returns true if current state is in product mode.
 */
export function isProductModeActive() {
  return isProductMode(getState());
}

/**
 * markClientAsDemo — stamps clientMeta.isDemo = true on a client record.
 * Used by import validation to tag imported demo records.
 * Operates on consultantStorage clients — pass setConsultantStateFn.
 */
export function markClientAsDemo(clientId, setConsultantStateFn) {
  if (!setConsultantStateFn) return;
  setConsultantStateFn((cs) => ({
    ...cs,
    clients: cs.clients.map((c) =>
      c.id === clientId
        ? { ...c, clientMeta: { isDemo: true, workspaceMode: WORKSPACE_MODE.DEMO, createdFrom: 'demo-seed', lockedDemoRecord: true } }
        : c
    ),
  }));
}

/**
 * markClientAsReal — stamps clientMeta.isDemo = false on a client record.
 */
export function markClientAsReal(clientId, setConsultantStateFn) {
  if (!setConsultantStateFn) return;
  setConsultantStateFn((cs) => ({
    ...cs,
    clients: cs.clients.map((c) =>
      c.id === clientId
        ? { ...c, clientMeta: { isDemo: false, workspaceMode: WORKSPACE_MODE.PRODUCT, createdFrom: 'import', lockedDemoRecord: false } }
        : c
    ),
  }));
}

/**
 * getVisibleClients — returns clients filtered for current workspace mode.
 * Wraps filterClientsByMode with live state.
 * Requires the full clients array from consultantStorage.
 */
export function getVisibleClients(clients) {
  const mode = getWorkspaceMode();
  return filterClientsByMode(clients, mode);
}

/**
 * getRealClients — returns only real (non-demo) clients from a list.
 */
export function getRealClients(clients) {
  return getRealClientsFromList(clients);
}

/**
 * getDemoClientList — returns only demo clients from a list.
 */
export function getDemoClientList(clients) {
  return getDemoClientsFromList(clients);
}

/**
 * createCleanProductWorkspace — resets main state to a fresh real-product
 * workspace. Demo data in consultantStorage clients is NOT deleted — only
 * the main app state is reset to a blank real-product starting point.
 * Call this after confirming with the user.
 */
export function createCleanProductWorkspace() {
  const initial = getInitialState();
  setState(() => ({
    ...initial,
    settings: {
      ...initial.settings,
      workspaceMode: WORKSPACE_MODE.PRODUCT,
      demoMode: false,
    },
    clientMode: {
      isDemoMode: false,
      demoDataLoaded: false,
    },
  }));
  saveState(_state);
  addActivityLog({ type: 'product_workspace_created', message: 'Clean product workspace created. Demo data hidden.' });
}

/**
 * clearDemoPortfolio — permanently removes demo client states from localStorage
 * and removes demo clients from the consultant workspace.
 * DESTRUCTIVE — confirm before calling.
 * Requires consultantStorage functions passed as args to avoid circular imports.
 */
export function clearDemoPortfolio(saveClientStateFn, setConsultantStateFn, deleteFn) {
  const demoIds = [...DEMO_CLIENT_IDS];

  // Delete each demo client state from localStorage
  for (const id of demoIds) {
    try { deleteFn(id); } catch {}
  }

  // Remove demo clients from consultant workspace
  setConsultantStateFn((cs) => ({
    ...cs,
    clients: (cs.clients || []).filter((c) => {
      if (DEMO_CLIENT_IDS.has(c.id)) return false;
      if (c.clientMeta?.isDemo) return false;
      return true;
    }),
    activeClientId: DEMO_CLIENT_IDS.has(cs.activeClientId) ? null : cs.activeClientId,
    lastUpdated: new Date().toISOString(),
  }));

  // Reset main state to clean product baseline
  createCleanProductWorkspace();

  addActivityLog({ type: 'demo_portfolio_cleared', message: 'Demo portfolio permanently cleared from local storage.' });
}

// ─── Run 14: Visible record helpers (delegate to dataProviders.js) ─────────────
/**
 * getVisibleClientsForMode — returns clients visible in current product mode.
 * Uses existing filterClientsByMode from workspaceMode.js.
 */
export function getVisibleClientsForMode() {
  const s = getState();
  const clients = s.clients || [];
  const wm = s.settings?.workspaceMode || 'demo';
  return filterClientsByMode(clients, wm, { includeArchived: false });
}


/**
 * exportWorkspaceBackup — exports the full local workspace as JSON backup.
 * Includes workspaceMode metadata and clientMeta on all clients.
 * Returns a JSON string ready to download.
 */
export function exportWorkspaceBackup(consultantState) {
  const state = getState();
  return JSON.stringify({
    exportVersion: '8.5',
    exportedAt: new Date().toISOString(),
    workspaceMode: getWorkspaceMode(),
    appState: state,
    consultantState: consultantState || null,
  }, null, 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN 23 (8.6) — BACKEND CONFIG HELPERS
// Manage the backendConfig SSOT structure for provider configuration,
// validation results, connection tests, and safety state.
// ─────────────────────────────────────────────────────────────────────────────

import { getDefaultBackendConfig, scanForUnsafeSecrets as _scanSecrets, PROVIDER_IDS } from './backendConfigGuard.js';
import {
  getDefaultAuthConfig,
  ROLE,
  buildAuditEvent,
  AUDIT_EVENT,
} from './authRoles.js';

/** Return current backendConfig, initialising defaults if needed. */
export function getBackendConfig() {
  const s = getState();
  return s.backendConfig || getDefaultBackendConfig();
}

/** Update a provider's config fields safely (blocks unsafe secrets). */
export function updateBackendProviderConfig(providerId, payload) {
  const scan = _scanSecrets(payload || {});
  if (scan.blocked) {
    addActivityLog(`⚠ Backend config not saved — blocked secret detected in provider "${providerId}": ${scan.reason}`);
    return { success: false, blocked: true, reason: scan.reason, detectedIn: scan.detectedIn };
  }
  setState((s) => {
    const cfg = { ...(s.backendConfig || getDefaultBackendConfig()) };
    cfg.providers = { ...(cfg.providers || {}) };
    cfg.providers[providerId] = { ...(cfg.providers[providerId] || {}), ...payload };
    cfg.lastUpdatedAt = new Date().toISOString();
    // Mark configured if required fields are present
    if (providerId === PROVIDER_IDS.SUPABASE && payload.projectUrl && payload.anonPublicKey) {
      cfg.providers[providerId].configured = true;
      cfg.providers[providerId].status     = 'configured';
      cfg.providerStatus = { ...(cfg.providerStatus || {}), [providerId]: 'configured' };
    } else if (providerId === PROVIDER_IDS.FIREBASE && payload.apiKey && payload.projectId) {
      cfg.providers[providerId].configured = true;
      cfg.providers[providerId].status     = 'configured';
      cfg.providerStatus = { ...(cfg.providerStatus || {}), [providerId]: 'configured' };
    } else if (providerId === PROVIDER_IDS.CUSTOM_REST && payload.baseUrl) {
      cfg.providers[providerId].configured = true;
      cfg.providers[providerId].status     = 'configured';
      cfg.providerStatus = { ...(cfg.providerStatus || {}), [providerId]: 'configured' };
    } else if (providerId === PROVIDER_IDS.AWS && payload.region) {
      cfg.providers[providerId].configured = true;
      cfg.providers[providerId].status     = 'configured';
      cfg.providerStatus = { ...(cfg.providerStatus || {}), [providerId]: 'configured' };
    }
    return { ...s, backendConfig: cfg };
  });
  addActivityLog(`Backend provider config updated: "${providerId}"`);
  return { success: true };
}

/** Set the active backend provider. */
export function setActiveBackendProviderConfig(providerId) {
  setState((s) => {
    const cfg = { ...(s.backendConfig || getDefaultBackendConfig()) };
    cfg.activeProvider     = providerId;
    cfg.lastUpdatedAt      = new Date().toISOString();
    return { ...s, backendConfig: cfg };
  });
  addActivityLog(`Active backend provider set to: "${providerId}"`);
}

/** Enable or disable product mode backend. */
export function setProductModeBackendEnabled(enabled) {
  setState((s) => {
    const cfg = { ...(s.backendConfig || getDefaultBackendConfig()) };
    cfg.productModeBackendEnabled = !!enabled;
    cfg.lastUpdatedAt             = new Date().toISOString();
    return { ...s, backendConfig: cfg };
  });
  addActivityLog(`Product Mode backend ${enabled ? 'enabled' : 'disabled'}`);
}

/** Save a connection test result to the backendConfig. */
export function saveBackendConnectionTest(result) {
  if (!result) return;
  setState((s) => {
    const cfg  = { ...(s.backendConfig || getDefaultBackendConfig()) };
    const tests = [...(cfg.connectionTests || [])];
    tests.unshift(result);
    cfg.connectionTests = tests.slice(0, 20); // keep last 20
    cfg.lastTestedAt    = result.testedAt || new Date().toISOString();
    // Update provider lastTestAt / lastTestResult
    if (result.providerId && cfg.providers?.[result.providerId]) {
      cfg.providers = { ...(cfg.providers || {}) };
      cfg.providers[result.providerId] = {
        ...cfg.providers[result.providerId],
        lastTestedAt:    result.testedAt,
        lastTestResult:  result.status,
        lastTestMessage: result.message,
      };
    }
    return { ...s, backendConfig: cfg };
  });
}

/** Clear a provider's saved config fields (not connection test history). */
export function clearBackendProviderConfig(providerId) {
  const defaults = getDefaultBackendConfig();
  setState((s) => {
    const cfg = { ...(s.backendConfig || getDefaultBackendConfig()) };
    cfg.providers = { ...(cfg.providers || {}) };
    cfg.providers[providerId] = { ...(defaults.providers[providerId] || { configured: false, status: 'not-configured' }) };
    cfg.providerStatus = { ...(cfg.providerStatus || {}), [providerId]: 'not-configured' };
    if (cfg.activeProvider === providerId && providerId !== PROVIDER_IDS.LOCAL_ONLY) {
      cfg.activeProvider = PROVIDER_IDS.LOCAL_ONLY;
    }
    cfg.lastUpdatedAt = new Date().toISOString();
    return { ...s, backendConfig: cfg };
  });
  addActivityLog(`Backend provider config cleared: "${providerId}"`);
}

/** Get a backend readiness summary across all providers. */
export function getBackendReadinessSummary() {
  const cfg = getBackendConfig();
  const providers = cfg.providers || {};
  return {
    activeProvider:   cfg.activeProvider || PROVIDER_IDS.LOCAL_ONLY,
    backendEnabled:   cfg.productModeBackendEnabled || false,
    lastUpdatedAt:    cfg.lastUpdatedAt,
    lastTestedAt:     cfg.lastTestedAt,
    supabaseConfigured:   !!(providers[PROVIDER_IDS.SUPABASE]?.configured),
    firebaseConfigured:   !!(providers[PROVIDER_IDS.FIREBASE]?.configured),
    customRestConfigured: !!(providers[PROVIDER_IDS.CUSTOM_REST]?.configured),
    awsConfigured:        !!(providers[PROVIDER_IDS.AWS]?.configured),
    localOnlyActive:  cfg.activeProvider === PROVIDER_IDS.LOCAL_ONLY,
    hasLiveProvider:  [PROVIDER_IDS.SUPABASE, PROVIDER_IDS.FIREBASE, PROVIDER_IDS.CUSTOM_REST, PROVIDER_IDS.AWS]
                        .includes(cfg.activeProvider),
    secretScanEnabled: cfg.safety?.secretScanEnabled !== false,
    connectionTests:  cfg.connectionTests || [],
  };
}

/** Accept the frontend-only warning. */
export function markFrontendOnlyWarningAccepted() {
  setState((s) => {
    const cfg = { ...(s.backendConfig || getDefaultBackendConfig()) };
    cfg.frontendOnlyWarningAccepted     = true;
    cfg.safety = { ...(cfg.safety || {}), frontendOnlyWarningAccepted: true };
    return { ...s, backendConfig: cfg };
  });
}

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Run 25: Auth Config Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Get current auth config, initialising defaults if not set. */
export function getAuthConfig() {
  const appState = getState();
  if (!appState.authConfig || typeof appState.authConfig !== 'object') {
    return getDefaultAuthConfig();
  }
  return appState.authConfig;
}

/** Update auth config fields safely. */
export function updateAuthConfig(fields) {
  if (!fields || typeof fields !== 'object') return;
  setState((s) => ({
    ...s,
    authConfig: {
      ...(s.authConfig || getDefaultAuthConfig()),
      ...fields,
      lastUpdatedAt: new Date().toISOString(),
    },
  }));
}

/** Set the active role (frontend only - no production security guarantee). */
export function setActiveRole(roleId) {
  updateAuthConfig({ activeRole: roleId });
  addActivityLog('Active role set: "' + roleId + '"');
}

/** Set the demo preview role (demo mode only). */
export function setDemoPreviewRole(roleId) {
  updateAuthConfig({ demoPreviewRole: roleId });
}

/** Add a local audit event (live: backend-required; demo: local only). */
export function addLocalAuditEvent(eventType, details) {
  const safeDetails = details || {};
  const event = {
    id:        'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    type:      eventType,
    details:   safeDetails,
    timestamp: new Date().toISOString(),
    isDemo:    safeDetails.isDemo || false,
  };
  setState((s) => {
    const cfg    = s.authConfig || getDefaultAuthConfig();
    const events = [...(cfg.localAuditEvents || [])];
    events.unshift(event);
    return { ...s, authConfig: { ...cfg, localAuditEvents: events.slice(0, 100) } };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
