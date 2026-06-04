/**
 * QUANTUM COMPLIANCE OS™ — backendSync.js
 * Run 15: Backend Connectors + Live Sync Layer
 * =============================================
 * Backend settings model, sync queue foundation, connection helpers,
 * blocked-secret detection, and sync status utilities.
 *
 * SAFETY:
 * - No real Supabase/Firebase/AWS client instantiation
 * - No service role keys, DATABASE_URL, JWT_SECRET, or private keys
 * - No external network calls (Supabase/Firebase SDK not installed)
 * - Config validation only — checks shape and blocked secrets
 * - LocalStorage remains the active/fallback provider in Run 15
 * - Blocked secrets are never saved, logged, or exported
 * - All helpers fail safely if config is missing
 * - No duplicate state store — extends storage.js SSOT
 *
 * DISCLAIMER:
 * Backend connection enables persistence and sync but does not guarantee
 * compliance. RLS and backend security policies must be reviewed before
 * production use. Live sync status reflects app sync state only, not
 * legal audit certification. Risk scores and recommendations are advisory
 * and require qualified human review.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import { getState, setState, addActivityLog } from './storage.js';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const BACKEND_MODE = {
  NOT_CONNECTED:  'not-connected',
  LOCAL_ONLY:     'local-only',
  BACKEND_READY:  'backend-ready',
  CONNECTED:      'connected',
  SYNC_ERROR:     'sync-error',
};

export const CONNECTION_STATUS = {
  LOCAL_ONLY:      'local-only',
  NOT_CONFIGURED:  'not-configured',
  CONFIGURED:      'configured',
  TESTING:         'testing',
  CONNECTED:       'connected',
  FAILED:          'failed',
  OFFLINE:         'offline',
  SYNC_ERROR:      'sync-error',
};

export const SYNC_MODE = {
  MANUAL:              'manual',
  AUTO_PLACEHOLDER:    'auto-placeholder',
  REALTIME_PLACEHOLDER:'realtime-placeholder',
};

export const SYNC_STATUS = {
  NOT_RUN:               'not-run',
  SUCCESS:               'success',
  FAILED:                'failed',
  PARTIAL:               'partial',
  LOCAL_ONLY:            'local-only',
  PROVIDER_NOT_CONFIGURED:'provider-not-configured',
};

export const SYNC_ENTITY_TYPE = {
  CLIENT:               'client',
  REPORT:               'report',
  EVIDENCE:             'evidence',
  SNAPSHOT:             'snapshot',
  AGENCY_SETTINGS:      'agencySettings',
  WHITE_LABEL_SETTINGS: 'whiteLabelSettings',
  PRODUCT_MODE_SETTINGS:'productModeSettings',
};

export const SYNC_OPERATION = {
  CREATE:           'create',
  UPDATE:           'update',
  UPSERT:           'upsert',
  ARCHIVE:          'archive',
  DELETE_PLACEHOLDER:'delete-placeholder',
};

export const SYNC_ITEM_STATUS = {
  PENDING:  'pending',
  SYNCING:  'syncing',
  SYNCED:   'synced',
  FAILED:   'failed',
  SKIPPED:  'skipped',
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKED SECRETS LIST — never save, log, or export these patterns
// ─────────────────────────────────────────────────────────────────────────────

const BLOCKED_SECRET_PATTERNS = [
  // Supabase
  /service_role/i,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}/,   // Supabase JWT format (service role is very long)
  // Generic secret patterns
  /database_url/i,
  /jwt_secret/i,
  /private_key/i,
  /webhook_secret/i,
  /admin_token/i,
  /secret_key/i,
  /openai_api_key/i,
  /groq_api_key/i,
  /stripe_secret/i,
  /aws_secret_access_key/i,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/i,
];

// Supabase service role key heuristic: JWT with 'service_role' in payload
function isSupabaseServiceRoleKey(value) {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  try {
    const decoded = JSON.parse(atob(parts[1]));
    return decoded?.role === 'service_role';
  } catch {
    return false;
  }
}

/**
 * detectBlockedSecrets — checks if a string value looks like a backend-only secret.
 * Returns { blocked: boolean, reason: string }.
 * Never logs the value itself.
 */
export function detectBlockedSecrets(value) {
  if (!value || typeof value !== 'string') return { blocked: false, reason: '' };
  const trimmed = value.trim();

  if (isSupabaseServiceRoleKey(trimmed)) {
    return { blocked: true, reason: 'Supabase service role key detected. Use only the anon/public key.' };
  }

  for (const pattern of BLOCKED_SECRET_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { blocked: true, reason: 'This looks like a backend-only secret. Use only public/client-safe configuration.' };
    }
  }

  return { blocked: false, reason: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ─────────────────────────────────────────────────────────────────────────────

export function getDefaultBackendSettings() {
  return {
    activeProvider:               'localStorage',
    backendMode:                  BACKEND_MODE.LOCAL_ONLY,
    connectionStatus:             CONNECTION_STATUS.LOCAL_ONLY,
    lastConnectionTestAt:         null,
    lastSuccessfulConnectionAt:   null,
    lastSyncAt:                   null,
    syncEnabled:                  false,
    realtimeEnabled:              false,
    offlineFallbackEnabled:       true,
    preventSecretExposure:        true,
    providers: {
      localStorage: {
        id:                     'localStorage',
        name:                   'Local Storage',
        enabled:                true,
        configured:             true,
        status:                 'active',
        publicConfig:           {},
        maskedConfig:           {},
        supportsConnectionTest: true,
        supportsSync:           false,
        supportsRealtime:       false,
        supportsOffline:        true,
      },
      supabase: {
        id:                     'supabase',
        name:                   'Supabase',
        enabled:                false,
        configured:             false,
        status:                 'not-configured',
        publicConfig: {
          supabaseUrl:          '',
          supabaseAnonKey:      '',
        },
        maskedConfig:           {},
        supportsConnectionTest: true,
        supportsSync:           true,
        supportsRealtime:       true,
        supportsOffline:        false,
        lastTestAt:             null,
        lastTestResult:         null,
        lastTestMessage:        '',
      },
      firebase: {
        id:                     'firebase',
        name:                   'Firebase / Firestore',
        enabled:                false,
        configured:             false,
        status:                 'not-configured',
        publicConfig: {
          apiKey:               '',
          authDomain:           '',
          projectId:            '',
          storageBucket:        '',
          messagingSenderId:    '',
          appId:                '',
        },
        maskedConfig:           {},
        supportsConnectionTest: true,
        supportsSync:           true,
        supportsRealtime:       true,
        supportsOffline:        false,
        lastTestAt:             null,
        lastTestResult:         null,
        lastTestMessage:        '',
      },
      aws: {
        id:                     'aws',
        name:                   'AWS / Amplify',
        enabled:                false,
        configured:             false,
        status:                 'placeholder',
        publicConfig:           {},
        maskedConfig:           {},
        supportsConnectionTest: false,
        supportsSync:           true,
        supportsRealtime:       false,
        supportsOffline:        false,
      },
      customApi: {
        id:                     'customApi',
        name:                   'Custom REST API',
        enabled:                false,
        configured:             false,
        status:                 'placeholder',
        publicConfig: {
          baseUrl:              '',
        },
        maskedConfig:           {},
        supportsConnectionTest: false,
        supportsSync:           true,
        supportsRealtime:       false,
        supportsOffline:        false,
      },
    },
  };
}

export function getDefaultSyncSettings() {
  return {
    enabled:                false,
    provider:               'localStorage',
    mode:                   SYNC_MODE.MANUAL,
    lastSyncAt:             null,
    lastSyncStatus:         SYNC_STATUS.NOT_RUN,
    pendingQueueCount:      0,
    failedQueueCount:       0,
    conflictCount:          0,
    offlineFallbackEnabled: true,
    manualSyncEnabled:      true,
    autoSyncEnabled:        false,
    realtimeSyncEnabled:    false,
    conflictStrategy:       'manual-review',
    updatedAt:              new Date().toISOString().slice(0, 10),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND SETTINGS HELPERS (read from state)
// ─────────────────────────────────────────────────────────────────────────────

export function getBackendSettings() {
  const s = getState();
  return s.backendSettings || getDefaultBackendSettings();
}

export function getSyncSettings() {
  const s = getState();
  return s.syncSettings || getDefaultSyncSettings();
}

export function getPendingSyncQueue() {
  const s = getState();
  return (s.syncQueue || []).filter((item) => item.status === SYNC_ITEM_STATUS.PENDING);
}

export function getFailedSyncQueue() {
  const s = getState();
  return (s.syncQueue || []).filter((item) => item.status === SYNC_ITEM_STATUS.FAILED);
}

export function getLastSyncResult() {
  const s = getState();
  return s.syncSettings?.lastSyncStatus || SYNC_STATUS.NOT_RUN;
}

export function getBackendReadinessStatus() {
  const bs = getBackendSettings();
  return {
    activeProvider:       bs.activeProvider,
    backendMode:          bs.backendMode,
    connectionStatus:     bs.connectionStatus,
    offlineFallback:      bs.offlineFallbackEnabled,
    syncEnabled:          bs.syncEnabled,
    supabaseConfigured:   bs.providers?.supabase?.configured || false,
    firebaseConfigured:   bs.providers?.firebase?.configured || false,
    isBackendActive:      bs.activeProvider !== 'localStorage',
  };
}

export function getSyncStatusSummary() {
  const ss = getSyncSettings();
  const sq = getState().syncQueue || [];
  const pending  = sq.filter((i) => i.status === SYNC_ITEM_STATUS.PENDING).length;
  const failed   = sq.filter((i) => i.status === SYNC_ITEM_STATUS.FAILED).length;
  const synced   = sq.filter((i) => i.status === SYNC_ITEM_STATUS.SYNCED).length;
  return {
    lastSyncAt:     ss.lastSyncAt,
    lastSyncStatus: ss.lastSyncStatus,
    pendingCount:   pending,
    failedCount:    failed,
    syncedCount:    synced,
    totalQueued:    sq.length,
    provider:       ss.provider,
    enabled:        ss.enabled,
    mode:           ss.mode,
  };
}

export function canSyncWithProvider(providerId) {
  const bs = getBackendSettings();
  const provider = bs.providers?.[providerId];
  if (!provider) return false;
  if (!provider.configured) return false;
  if (provider.status === 'placeholder') return false;
  if (!provider.supportsSync) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_REQUIRED_FIELDS = ['supabaseUrl', 'supabaseAnonKey'];
const FIREBASE_REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

/**
 * validatePublicConfig — checks config shape without network calls.
 * Returns { valid: boolean, errors: string[], warnings: string[] }
 */
export function validatePublicConfig(providerId, publicConfig) {
  const errors   = [];
  const warnings = [];

  if (!publicConfig || typeof publicConfig !== 'object') {
    return { valid: false, errors: ['Config must be a non-null object.'], warnings };
  }

  // Check for blocked secrets in all values
  for (const [key, value] of Object.entries(publicConfig)) {
    if (!value) continue;
    const detection = detectBlockedSecrets(String(value));
    if (detection.blocked) {
      errors.push(`Field "${key}": ${detection.reason}`);
    }
  }

  if (providerId === 'supabase') {
    for (const field of SUPABASE_REQUIRED_FIELDS) {
      if (!publicConfig[field] || !String(publicConfig[field]).trim()) {
        errors.push(`Supabase "${field}" is required.`);
      }
    }
    // Check URL format
    if (publicConfig.supabaseUrl) {
      try {
        const url = new URL(publicConfig.supabaseUrl);
        if (!url.hostname.includes('supabase')) {
          warnings.push('URL does not appear to be a Supabase project URL. Verify before saving.');
        }
      } catch {
        errors.push('supabaseUrl must be a valid URL (e.g. https://xyz.supabase.co).');
      }
    }
    // anon key basic check — should be a JWT (3 dot-separated parts)
    if (publicConfig.supabaseAnonKey) {
      const parts = String(publicConfig.supabaseAnonKey).split('.');
      if (parts.length !== 3) {
        errors.push('supabaseAnonKey does not appear to be a valid JWT. Use the anon/public key from your Supabase project settings.');
      }
      // Block service role
      if (isSupabaseServiceRoleKey(publicConfig.supabaseAnonKey)) {
        errors.push('BLOCKED: supabaseAnonKey appears to be a service_role key. Use only the anon/public key.');
      }
    }
    warnings.push('RLS must be enabled on all tables before production use.');
    warnings.push('Use only the public anon key. Never paste SUPABASE_SERVICE_ROLE_KEY into this app.');
  }

  if (providerId === 'firebase') {
    for (const field of FIREBASE_REQUIRED_FIELDS) {
      if (!publicConfig[field] || !String(publicConfig[field]).trim()) {
        errors.push(`Firebase "${field}" is required.`);
      }
    }
    warnings.push('Use only client-safe Firebase web app config.');
    warnings.push('Security rules must be reviewed before production use.');
  }

  if (providerId === 'customApi') {
    if (publicConfig.baseUrl) {
      try { new URL(publicConfig.baseUrl); } catch {
        errors.push('baseUrl must be a valid URL.');
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * maskProviderConfig — masks sensitive-looking values for display.
 * Anon keys are masked as: eyJhbG...****
 */
export function maskProviderConfig(publicConfig) {
  if (!publicConfig) return {};
  const masked = {};
  for (const [key, value] of Object.entries(publicConfig)) {
    if (!value) { masked[key] = value; continue; }
    const str = String(value);
    // Mask JWT-like values (anon keys)
    if (str.startsWith('eyJ') && str.length > 20) {
      masked[key] = str.slice(0, 8) + '…' + '•'.repeat(8);
    } else if (str.length > 20) {
      masked[key] = str.slice(0, 6) + '…' + '•'.repeat(6);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE MUTATIONS (via storage.js setState)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * saveBackendProviderConfig — validates and saves public config for a provider.
 * Returns { saved: boolean, errors: string[], warnings: string[], blocked: boolean }.
 * Blocked secrets are never saved or logged.
 */
export function saveBackendProviderConfig(providerId, publicConfig) {
  // Validate first
  const validation = validatePublicConfig(providerId, publicConfig);
  if (!validation.valid) {
    return { saved: false, errors: validation.errors, warnings: validation.warnings, blocked: validation.errors.some((e) => e.startsWith('BLOCKED:') || e.includes('backend-only secret')) };
  }

  const maskedConfig = maskProviderConfig(publicConfig);
  const allFieldsFilled = Object.values(publicConfig).every((v) => v && String(v).trim());

  setState((s) => {
    const bs = { ...(s.backendSettings || getDefaultBackendSettings()) };
    bs.providers = { ...(bs.providers || {}) };
    bs.providers[providerId] = {
      ...(bs.providers[providerId] || {}),
      publicConfig: { ...publicConfig },
      maskedConfig,
      configured: allFieldsFilled,
      status: allFieldsFilled ? 'configured' : 'not-configured',
      enabled: false,   // not yet active — requires explicit setActiveBackendProvider
    };
    return { ...s, backendSettings: bs };
  });

  addActivityLog({ type: 'backend_config_saved', message: `Backend config saved for provider: ${providerId}.` });
  return { saved: true, errors: [], warnings: validation.warnings, blocked: false };
}

/**
 * testBackendConnection — config-shape validation only (no real network call).
 * SDK not installed in Run 15 — simulates validation result.
 */
export function testBackendConnection(providerId) {
  const bs = getBackendSettings();
  const provider = bs.providers?.[providerId];

  if (providerId === 'localStorage') {
    return {
      success: true,
      message: 'LocalStorage is active and working. No backend connection test required.',
      simulated: false,
    };
  }

  if (!provider) {
    return { success: false, message: `Provider "${providerId}" not found.`, simulated: true };
  }

  if (provider.status === 'placeholder') {
    return { success: false, message: `Provider "${providerId}" is a placeholder reserved for a future run.`, simulated: true };
  }

  if (!provider.configured) {
    return { success: false, message: 'Provider is not fully configured. Fill in all required fields and save first.', simulated: true };
  }

  // Config shape validation
  const validation = validatePublicConfig(providerId, provider.publicConfig || {});
  const now = new Date().toISOString();

  // Save test result to state
  setState((s) => {
    const bs2 = { ...(s.backendSettings || getDefaultBackendSettings()) };
    bs2.lastConnectionTestAt = now;
    bs2.providers = { ...bs2.providers };
    bs2.providers[providerId] = {
      ...bs2.providers[providerId],
      lastTestAt:     now,
      lastTestResult: validation.valid ? 'shape-valid' : 'invalid',
      lastTestMessage: validation.valid
        ? `Config shape is valid. Connector dependency (${providerId} SDK) is not active yet — install and configure in a future run.`
        : `Config validation failed: ${validation.errors.join('; ')}`,
      status: validation.valid ? 'configured' : 'not-configured',
    };
    return { ...s, backendSettings: bs2 };
  });

  if (!validation.valid) {
    return { success: false, message: `Config validation failed: ${validation.errors.join('; ')}`, simulated: true };
  }

  return {
    success: true,
    message: `Config shape is valid. Connector dependency (${providerId} SDK) is not active yet — install and configure in a future run to enable real connection testing.`,
    simulated: true,
    warnings: validation.warnings,
  };
}

/**
 * setActiveBackendProvider — sets the active backend provider.
 * localStorage is always allowed. Others require configuration.
 */
export function setActiveBackendProvider(providerId) {
  const bs = getBackendSettings();
  const provider = bs.providers?.[providerId];

  if (!provider) return { success: false, message: `Provider "${providerId}" not found.` };
  if (providerId !== 'localStorage' && !provider.configured) {
    return { success: false, message: 'Configure and test the provider before setting it as active.' };
  }
  if (provider.status === 'placeholder') {
    return { success: false, message: 'This provider is a placeholder and cannot be set as active yet.' };
  }

  setState((s) => {
    const bs2 = { ...(s.backendSettings || getDefaultBackendSettings()) };
    bs2.activeProvider   = providerId;
    bs2.backendMode      = providerId === 'localStorage' ? BACKEND_MODE.LOCAL_ONLY : BACKEND_MODE.BACKEND_READY;
    bs2.connectionStatus = providerId === 'localStorage' ? CONNECTION_STATUS.LOCAL_ONLY : CONNECTION_STATUS.CONFIGURED;
    return { ...s, backendSettings: bs2 };
  });

  addActivityLog({ type: 'backend_provider_changed', message: `Active backend provider set to: ${providerId}.` });
  return { success: true, message: `Active provider set to ${provider.name}.` };
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC QUEUE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * queueSyncEvent — adds a sync event to the local queue.
 * Only non-demo records should be queued for backend sync.
 */
export function queueSyncEvent(entityType, entityId, operation, payloadPreview, isDemo = false) {
  if (isDemo) {
    return { queued: false, reason: 'Demo records are not queued for backend sync.' };
  }

  const id = `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const item = {
    id,
    entityType,
    entityId,
    operation,
    provider: getBackendSettings().activeProvider,
    status: SYNC_ITEM_STATUS.PENDING,
    createdAt: now,
    lastAttemptAt: null,
    attemptCount: 0,
    errorMessage: '',
    payloadPreview: payloadPreview || `${entityType} queued for backend sync.`,
    isDemo: false,
  };

  setState((s) => ({
    ...s,
    syncQueue: [...(s.syncQueue || []), item],
  }));

  return { queued: true, id };
}

/**
 * markSyncEventSynced — marks a queue item as synced.
 */
export function markSyncEventSynced(syncId) {
  setState((s) => ({
    ...s,
    syncQueue: (s.syncQueue || []).map((item) =>
      item.id === syncId ? { ...item, status: SYNC_ITEM_STATUS.SYNCED, lastAttemptAt: new Date().toISOString() } : item
    ),
  }));
}

/**
 * markSyncEventFailed — marks a queue item as failed with error.
 */
export function markSyncEventFailed(syncId, errorMessage) {
  setState((s) => ({
    ...s,
    syncQueue: (s.syncQueue || []).map((item) =>
      item.id === syncId ? {
        ...item,
        status:        SYNC_ITEM_STATUS.FAILED,
        errorMessage:  errorMessage || 'Sync failed.',
        attemptCount:  (item.attemptCount || 0) + 1,
        lastAttemptAt: new Date().toISOString(),
      } : item
    ),
  }));
}

/**
 * runManualSync — attempts a manual sync.
 * In Run 15: always returns local-only or provider-not-configured result.
 * Real sync implemented in Run 16+ when SDK is installed and schema validated.
 */
export function runManualSync() {
  const bs = getBackendSettings();
  const now = new Date().toISOString();

  if (bs.activeProvider === 'localStorage') {
    setState((s) => ({
      ...s,
      syncSettings: {
        ...(s.syncSettings || getDefaultSyncSettings()),
        lastSyncAt:     now,
        lastSyncStatus: SYNC_STATUS.LOCAL_ONLY,
        updatedAt:      now.slice(0, 10),
      },
    }));
    return {
      success: true,
      status:  SYNC_STATUS.LOCAL_ONLY,
      message: 'LocalStorage is active. No backend sync is required. All data is stored locally.',
    };
  }

  const provider = bs.providers?.[bs.activeProvider];
  if (!provider?.configured) {
    setState((s) => ({
      ...s,
      syncSettings: {
        ...(s.syncSettings || getDefaultSyncSettings()),
        lastSyncAt:     now,
        lastSyncStatus: SYNC_STATUS.PROVIDER_NOT_CONFIGURED,
        updatedAt:      now.slice(0, 10),
      },
    }));
    return {
      success: false,
      status:  SYNC_STATUS.PROVIDER_NOT_CONFIGURED,
      message: 'Backend provider is not configured yet. Configure and test the provider first.',
    };
  }

  // Provider configured but SDK not active
  setState((s) => ({
    ...s,
    syncSettings: {
      ...(s.syncSettings || getDefaultSyncSettings()),
      lastSyncAt:     now,
      lastSyncStatus: SYNC_STATUS.PROVIDER_NOT_CONFIGURED,
      lastSyncMessage:'Backend config saved. Real sync requires connector implementation and schema validation.',
      updatedAt:      now.slice(0, 10),
    },
    backendSettings: {
      ...bs,
      lastSyncAt: now,
    },
  }));
  addActivityLog({ type: 'manual_sync_attempted', message: `Manual sync attempted with provider: ${bs.activeProvider}. SDK not active in Run 15.` });

  return {
    success: false,
    status:  'config-saved-sdk-pending',
    message: `Backend config saved. Real sync requires connector implementation and schema validation. Implement the ${provider.name} SDK connector in a future run.`,
  };
}
