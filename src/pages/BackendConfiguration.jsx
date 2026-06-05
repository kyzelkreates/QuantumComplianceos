/**
 * QUANTUM COMPLIANCE OS™ — BackendConfiguration.jsx
 * Run 23 (8.6): Product Mode Backend Provider Configuration Panel
 * ===============================================================
 * Full backend provider configuration: select, configure, save,
 * validate, test, and clear each provider. Product Mode gated.
 *
 * PROVIDERS:
 *   localOnly     — Local Storage (always active, always safe)
 *   supabase      — Supabase (format valid + live HEAD test)
 *   firebase      — Firebase (validation-only, no SDK)
 *   customRest    — Custom REST API (live GET health test)
 *   awsEnterprise — AWS / Amplify (validation-only, no SDK)
 *
 * SAFETY:
 * - All field values scanned for unsafe secrets before save/test
 * - SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, PRIVATE_KEY, etc. blocked
 * - No real backend sync implemented in this run
 * - No Supabase schema created
 * - RLS NOT enabled — must be done in Supabase console
 * - No external AI API calls
 * - No payments
 * - No offensive scanning
 * - All config stored locally via storage.js SSOT only
 *
 * DISCLAIMER:
 * Backend configuration is saved locally. Full live sync requires a
 * future backend migration run. RLS and security policies must be
 * reviewed before production use. Risk scores and recommendations are
 * advisory and require qualified human review.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader  from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import { getState, subscribe } from '../core/storage.js';
import {
  getBackendConfig,
  updateBackendProviderConfig,
  setActiveBackendProviderConfig,
  setProductModeBackendEnabled,
  saveBackendConnectionTest,
  clearBackendProviderConfig,
  getBackendReadinessSummary,
  markFrontendOnlyWarningAccepted,
} from '../core/storage.js';
import {
  PROVIDER_IDS,
  getDefaultBackendConfig,
  validateProviderConfig,
  scanForUnsafeSecrets,
  maskSensitiveValue,
  getProviderReadinessLabel,
  READINESS,
} from '../core/backendConfigGuard.js';
import { testBackendConnection } from '../core/backendConnectionTester.js';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';

// ─────────────────────────────────────────────────────────────────────────────
// SMALL ATOMS
// ─────────────────────────────────────────────────────────────────────────────

function Pill({ status, label, size = 'sm' }) {
  const MAP = {
    active:             { bg: 'rgba(16,185,129,0.12)',  fg: '#10b981', border: 'rgba(16,185,129,0.3)'  },
    configured:         { bg: 'rgba(0,212,255,0.10)',   fg: '#00d4ff', border: 'rgba(0,212,255,0.3)'   },
    'not-configured':   { bg: 'rgba(107,114,128,0.10)', fg: '#6b7280', border: 'rgba(107,114,128,0.25)' },
    placeholder:        { bg: 'rgba(107,114,128,0.08)', fg: '#6b7280', border: 'rgba(107,114,128,0.20)' },
    'format-valid':     { bg: 'rgba(0,212,255,0.08)',   fg: '#00d4ff', border: 'rgba(0,212,255,0.25)'  },
    unsafe:             { bg: 'rgba(239,68,68,0.10)',   fg: '#ef4444', border: 'rgba(239,68,68,0.3)'   },
    success:            { bg: 'rgba(16,185,129,0.12)',  fg: '#10b981', border: 'rgba(16,185,129,0.3)'  },
    warning:            { bg: 'rgba(245,158,11,0.10)',  fg: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
    failed:             { bg: 'rgba(239,68,68,0.10)',   fg: '#ef4444', border: 'rgba(239,68,68,0.3)'   },
    'validation-only':  { bg: 'rgba(59,130,246,0.10)',  fg: '#3b82f6', border: 'rgba(59,130,246,0.3)'  },
    demo:               { bg: 'rgba(245,158,11,0.10)',  fg: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
    testing:            { bg: 'rgba(139,92,246,0.10)',  fg: '#8b5cf6', border: 'rgba(139,92,246,0.3)'  },
  };
  const c = MAP[status] || MAP['not-configured'];
  const fs = size === 'xs' ? 9 : 10;
  return (
    <span style={{
      fontSize: fs, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      {label || status}
    </span>
  );
}

function Banner({ type = 'warn', children }) {
  const MAP = {
    warn:    { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.25)',  icon: '⚠',  fg: '#f59e0b' },
    error:   { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',   icon: '⛔', fg: '#ef4444' },
    info:    { bg: 'rgba(0,212,255,0.05)',    border: 'rgba(0,212,255,0.2)',    icon: 'ℹ',  fg: '#00d4ff' },
    success: { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.25)',  icon: '✅', fg: '#10b981' },
    blocked: { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.35)',   icon: '🚫', fg: '#ef4444' },
  };
  const c = MAP[type] || MAP.warn;
  return (
    <div style={{
      padding: '9px 12px', marginBottom: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
    }}>
      <span style={{ color: c.fg, marginRight: 5 }}>{c.icon}</span>{children}
    </div>
  );
}

function TestResultBanner({ result }) {
  if (!result) return null;
  const typeMap = { success: 'success', warning: 'warn', failed: 'error', 'validation-only': 'info' };
  const type    = typeMap[result.status] || 'info';
  return (
    <Banner type={type}>
      <strong>{result.status?.toUpperCase()}</strong> — {result.message}
      {result.testedAt && (
        <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 10 }}>
          {new Date(result.testedAt).toLocaleString()}
        </span>
      )}
    </Banner>
  );
}

function Field({ label, fieldKey, value, onChange, type = 'text', placeholder = '', hint = '', required = false, sensitive = false }) {
  const [localVal, setLocalVal] = useState(value || '');
  const [blocked,  setBlocked]  = useState(false);

  useEffect(() => { setLocalVal(value || ''); }, [value]);

  function handleChange(e) {
    const v = e.target.value;
    setLocalVal(v);
    // Real-time secret scan
    if (v.trim()) {
      const scan = scanForUnsafeSecrets({ [fieldKey]: v });
      setBlocked(scan.blocked);
      if (!scan.blocked) onChange(fieldKey, v);
    } else {
      setBlocked(false);
      onChange(fieldKey, v);
    }
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={sensitive ? 'password' : type}
        value={localVal}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-input"
        style={{
          width: '100%', boxSizing: 'border-box', fontSize: 12,
          border: blocked ? '1px solid #ef444480' : undefined,
        }}
        autoComplete={sensitive ? 'off' : undefined}
      />
      {blocked && (
        <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3, lineHeight: 1.5 }}>
          🚫 Blocked — this value looks like a server-side secret. Do not store this in frontend config.
        </div>
      )}
      {hint && !blocked && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>{hint}</div>
      )}
    </div>
  );
}

function Toggle({ label, value, onChange, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10, flexShrink: 0,
          background: value ? '#10b981' : 'var(--bg-elevated)',
          border: `1px solid ${value ? '#10b981' : 'var(--border-muted)'}`,
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
        }}
        role="switch" aria-checked={value} tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!value); }}}
      >
        <div style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 14, height: 14, borderRadius: '50%',
          background: value ? '#fff' : 'var(--text-muted)',
          transition: 'left 0.2s',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
        {hint && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{hint}</div>}
      </div>
    </div>
  );
}

function Btn({ onClick, children, variant = 'ghost', disabled = false, loading = false, style: extraStyle }) {
  const variants = {
    primary: { bg: 'var(--accent)',               color: '#0d1117', border: 'var(--accent)' },
    danger:  { bg: 'rgba(239,68,68,0.10)',         color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    ghost:   { bg: 'var(--bg-elevated)',           color: 'var(--text-secondary)', border: 'var(--border-muted)' },
    success: { bg: 'rgba(16,185,129,0.10)',        color: '#10b981', border: 'rgba(16,185,129,0.3)' },
    info:    { bg: 'rgba(0,212,255,0.07)',         color: '#00d4ff', border: 'rgba(0,212,255,0.25)' },
  };
  const v = variants[variant] || variants.ghost;
  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      style={{
        padding: '5px 14px', fontSize: 11, fontWeight: 600, borderRadius: 'var(--radius-md)',
        background: v.bg, color: v.color, border: `1px solid ${v.border}`,
        cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        ...extraStyle,
      }}
    >
      {loading ? '⏳ Testing…' : children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER CARDS STRIP
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDER_META = {
  [PROVIDER_IDS.LOCAL_ONLY]:   { icon: '💾', label: 'Local Storage',      colour: '#10b981', desc: 'Always active. Browser localStorage. No network required.' },
  [PROVIDER_IDS.SUPABASE]:     { icon: '⚡', label: 'Supabase',            colour: '#00d4ff', desc: 'Postgres backend. Auth, Realtime, Storage, Edge Functions.' },
  [PROVIDER_IDS.FIREBASE]:     { icon: '🔥', label: 'Firebase',            colour: '#f59e0b', desc: 'Firestore / Realtime DB. Google Cloud backend.' },
  [PROVIDER_IDS.CUSTOM_REST]:  { icon: '🔌', label: 'Custom REST API',     colour: '#8b5cf6', desc: 'Your own REST API. White-label and enterprise deployments.' },
  [PROVIDER_IDS.AWS]:          { icon: '☁️', label: 'AWS / Amplify',       colour: '#D4AF37', desc: 'API Gateway + Cognito + S3 + DynamoDB. Enterprise future.' },
};

const PROVIDER_ORDER = [
  PROVIDER_IDS.LOCAL_ONLY,
  PROVIDER_IDS.SUPABASE,
  PROVIDER_IDS.FIREBASE,
  PROVIDER_IDS.CUSTOM_REST,
  PROVIDER_IDS.AWS,
];

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER FORM — SUPABASE
// ─────────────────────────────────────────────────────────────────────────────

function SupabaseForm({ cfg, onSave, onClear, onTest, testing }) {
  const init = cfg || {};
  const [draft, setDraft] = useState({
    projectUrl:          init.projectUrl          || '',
    anonPublicKey:       init.anonPublicKey        || '',
    databaseRegion:      init.databaseRegion       || '',
    projectRef:          init.projectRef           || '',
    authEnabled:         init.authEnabled          || false,
    realtimeEnabled:     init.realtimeEnabled      || false,
    storageEnabled:      init.storageEnabled       || false,
    edgeFunctionsPlanned:init.edgeFunctionsPlanned || false,
    notes:               init.notes               || '',
  });

  function set(key, val) { setDraft((d) => ({ ...d, [key]: val })); }

  const validation = validateProviderConfig(PROVIDER_IDS.SUPABASE, draft);
  const hasUnsafe  = validation.readiness === READINESS.UNSAFE;

  return (
    <div>
      <Banner type="warn">
        ⚠ <strong>RLS is NOT enabled by this frontend configuration.</strong> Supabase Row Level Security must
        be enabled in the Supabase project using SQL policies during a future backend setup run.
        Do NOT use service role keys in this frontend app.
      </Banner>
      <Banner type="info">
        Use only the <strong>anon/public key</strong> from Supabase Project Settings → API.
        The service role key is blocked and must never be placed in frontend code.
      </Banner>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Field label="Project URL" fieldKey="projectUrl" value={draft.projectUrl}
          onChange={set} required placeholder="https://xyz.supabase.co"
          hint="Found in Supabase Project Settings → API" />
        <Field label="Anon / Public Key" fieldKey="anonPublicKey" value={draft.anonPublicKey}
          onChange={set} required sensitive placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          hint="Public anon key only — NOT the service role key" />
        <Field label="Database Region" fieldKey="databaseRegion" value={draft.databaseRegion}
          onChange={set} placeholder="eu-west-2"
          hint="Optional — Supabase region for reference" />
        <Field label="Project Ref" fieldKey="projectRef" value={draft.projectRef}
          onChange={set} placeholder="xyzabcdefg"
          hint="Optional — project reference ID" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: 8 }}>
        <Toggle label="Auth Enabled" value={draft.authEnabled} onChange={(v) => set('authEnabled', v)} hint="Supabase Auth planned for this provider" />
        <Toggle label="Realtime Enabled" value={draft.realtimeEnabled} onChange={(v) => set('realtimeEnabled', v)} hint="Supabase Realtime planned" />
        <Toggle label="Storage Enabled" value={draft.storageEnabled} onChange={(v) => set('storageEnabled', v)} hint="Supabase Storage planned" />
        <Toggle label="Edge Functions Planned" value={draft.edgeFunctionsPlanned} onChange={(v) => set('edgeFunctionsPlanned', v)} hint="Future run placeholder" />
      </div>

      <Field label="Notes" fieldKey="notes" value={draft.notes} onChange={set} placeholder="Optional notes about this Supabase project" />

      {validation.errors.length > 0 && (
        <Banner type="error">{validation.errors.join(' · ')}</Banner>
      )}
      {validation.warnings.map((w, i) => <Banner key={i} type="warn">{w}</Banner>)}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <Btn variant="primary" onClick={() => onSave(PROVIDER_IDS.SUPABASE, draft)} disabled={hasUnsafe || !validation.valid}>
          💾 Save Config
        </Btn>
        <Btn variant="info" onClick={() => onTest(PROVIDER_IDS.SUPABASE, draft)} loading={testing} disabled={hasUnsafe || !draft.projectUrl}>
          🔌 Test Connection
        </Btn>
        <Btn variant="danger" onClick={() => onClear(PROVIDER_IDS.SUPABASE)}>
          🗑 Clear Config
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER FORM — FIREBASE
// ─────────────────────────────────────────────────────────────────────────────

function FirebaseForm({ cfg, onSave, onClear, onTest, testing }) {
  const init = cfg || {};
  const [draft, setDraft] = useState({
    apiKey:                init.apiKey               || '',
    authDomain:            init.authDomain            || '',
    projectId:             init.projectId             || '',
    storageBucket:         init.storageBucket         || '',
    messagingSenderId:     init.messagingSenderId      || '',
    appId:                 init.appId                 || '',
    measurementId:         init.measurementId         || '',
    authEnabled:           init.authEnabled            || false,
    firestorePlanned:      init.firestorePlanned       || false,
    realtimeDatabasePlanned: init.realtimeDatabasePlanned || false,
    storageEnabled:        init.storageEnabled         || false,
    notes:                 init.notes                 || '',
  });

  function set(key, val) { setDraft((d) => ({ ...d, [key]: val })); }

  const validation = validateProviderConfig(PROVIDER_IDS.FIREBASE, draft);
  const hasUnsafe  = validation.readiness === READINESS.UNSAFE;

  return (
    <div>
      <Banner type="warn">
        Firebase Security Rules must be configured in the Firebase Console before going live.
        This frontend config does not set security rules.
        Service account / private key JSON is blocked from frontend config.
      </Banner>
      <Banner type="info">
        Connection test is validation-only — no Firebase SDK is installed in this run.
      </Banner>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Field label="API Key" fieldKey="apiKey" value={draft.apiKey} onChange={set} required hint="Public Firebase web API key — safe in frontend" />
        <Field label="Auth Domain" fieldKey="authDomain" value={draft.authDomain} onChange={set} required placeholder="xyz.firebaseapp.com" />
        <Field label="Project ID" fieldKey="projectId" value={draft.projectId} onChange={set} required placeholder="my-firebase-project" />
        <Field label="Storage Bucket" fieldKey="storageBucket" value={draft.storageBucket} onChange={set} placeholder="xyz.appspot.com" />
        <Field label="Messaging Sender ID" fieldKey="messagingSenderId" value={draft.messagingSenderId} onChange={set} />
        <Field label="App ID" fieldKey="appId" value={draft.appId} onChange={set} placeholder="1:123456789:web:abcdef" />
        <Field label="Measurement ID" fieldKey="measurementId" value={draft.measurementId} onChange={set} placeholder="G-XXXXXXXXXX" hint="Optional — Analytics" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: 8 }}>
        <Toggle label="Auth Enabled" value={draft.authEnabled} onChange={(v) => set('authEnabled', v)} />
        <Toggle label="Firestore Planned" value={draft.firestorePlanned} onChange={(v) => set('firestorePlanned', v)} />
        <Toggle label="Realtime DB Planned" value={draft.realtimeDatabasePlanned} onChange={(v) => set('realtimeDatabasePlanned', v)} />
        <Toggle label="Storage Enabled" value={draft.storageEnabled} onChange={(v) => set('storageEnabled', v)} />
      </div>

      <Field label="Notes" fieldKey="notes" value={draft.notes} onChange={set} placeholder="Optional notes" />

      {validation.errors.length > 0 && <Banner type="error">{validation.errors.join(' · ')}</Banner>}
      {validation.warnings.map((w, i) => <Banner key={i} type="warn">{w}</Banner>)}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <Btn variant="primary" onClick={() => onSave(PROVIDER_IDS.FIREBASE, draft)} disabled={hasUnsafe || !validation.valid}>
          💾 Save Config
        </Btn>
        <Btn variant="info" onClick={() => onTest(PROVIDER_IDS.FIREBASE, draft)} loading={testing} disabled={hasUnsafe}>
          🔌 Test (Validation Only)
        </Btn>
        <Btn variant="danger" onClick={() => onClear(PROVIDER_IDS.FIREBASE)}>🗑 Clear Config</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER FORM — CUSTOM REST
// ─────────────────────────────────────────────────────────────────────────────

function CustomRestForm({ cfg, onSave, onClear, onTest, testing }) {
  const init = cfg || {};
  const [draft, setDraft] = useState({
    baseUrl:              init.baseUrl              || '',
    healthCheckPath:      init.healthCheckPath       || '/health',
    authType:             init.authType              || 'none',
    publicApiKeyAllowed:  init.publicApiKeyAllowed   || false,
    headerName:           init.headerName            || '',
    tokenPlaceholder:     init.tokenPlaceholder      || '',
    syncEndpointPath:     init.syncEndpointPath      || '/sync',
    reportEndpointPath:   init.reportEndpointPath    || '/reports',
    evidenceEndpointPath: init.evidenceEndpointPath  || '/evidence',
    notes:                init.notes                || '',
  });

  function set(key, val) { setDraft((d) => ({ ...d, [key]: val })); }

  const validation = validateProviderConfig(PROVIDER_IDS.CUSTOM_REST, draft);
  const hasUnsafe  = validation.readiness === READINESS.UNSAFE;

  return (
    <div>
      <Banner type="info">
        Custom REST API support is reserved for white-label and enterprise deployments.
        Only public-facing URLs and client-safe tokens may be configured here.
        Backend-only bearer tokens must be stored server-side.
      </Banner>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Field label="Base URL" fieldKey="baseUrl" value={draft.baseUrl} onChange={set} required placeholder="https://api.yourdomain.com" hint="HTTPS required for production" />
        <Field label="Health Check Path" fieldKey="healthCheckPath" value={draft.healthCheckPath} onChange={set} placeholder="/health" hint="Path appended to base URL for connection test" />
        <Field label="Sync Endpoint" fieldKey="syncEndpointPath" value={draft.syncEndpointPath} onChange={set} placeholder="/sync" />
        <Field label="Reports Endpoint" fieldKey="reportEndpointPath" value={draft.reportEndpointPath} onChange={set} placeholder="/reports" />
        <Field label="Evidence Endpoint" fieldKey="evidenceEndpointPath" value={draft.evidenceEndpointPath} onChange={set} placeholder="/evidence" />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Auth Type</label>
        <select
          value={draft.authType}
          onChange={(e) => set('authType', e.target.value)}
          className="form-input"
          style={{ width: '100%', fontSize: 12 }}
        >
          {['none','bearer','api-key','custom-header'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
          Only public/client-safe tokens may be stored in frontend config.
        </div>
      </div>

      {draft.authType !== 'none' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Field label="Header Name" fieldKey="headerName" value={draft.headerName} onChange={set} placeholder="X-API-Key" />
          <Field label="Token Placeholder" fieldKey="tokenPlaceholder" value={draft.tokenPlaceholder} onChange={set}
            placeholder="public-test-token-only"
            hint="Public test token only. Backend secrets must never be stored here." />
        </div>
      )}

      <Toggle label="Public API Key Allowed" value={draft.publicApiKeyAllowed} onChange={(v) => set('publicApiKeyAllowed', v)}
        hint="Enable if this API accepts a public client-side key" />

      <Field label="Notes" fieldKey="notes" value={draft.notes} onChange={set} placeholder="Optional notes" />

      {validation.errors.length > 0 && <Banner type="error">{validation.errors.join(' · ')}</Banner>}
      {validation.warnings.map((w, i) => <Banner key={i} type="warn">{w}</Banner>)}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <Btn variant="primary" onClick={() => onSave(PROVIDER_IDS.CUSTOM_REST, draft)} disabled={hasUnsafe || !validation.valid}>
          💾 Save Config
        </Btn>
        <Btn variant="info" onClick={() => onTest(PROVIDER_IDS.CUSTOM_REST, draft)} loading={testing} disabled={hasUnsafe || !draft.baseUrl}>
          🔌 Test Health Check
        </Btn>
        <Btn variant="danger" onClick={() => onClear(PROVIDER_IDS.CUSTOM_REST)}>🗑 Clear Config</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER FORM — LOCAL ONLY
// ─────────────────────────────────────────────────────────────────────────────

function LocalOnlyForm({ cfg, onSave, onTest, testing }) {
  const init = cfg || {};
  const [draft, setDraft] = useState({
    modeName:                init.modeName                || 'Local-Only',
    backupReminderEnabled:   init.backupReminderEnabled   || false,
    exportBackupFrequency:   init.exportBackupFrequency   || 'manual',
    importExportEnabled:     init.importExportEnabled     !== false,
    notes:                   init.notes                  || '',
  });

  function set(key, val) { setDraft((d) => ({ ...d, [key]: val })); }

  return (
    <div>
      <Banner type="success">
        Local Storage is always active. All data is stored exclusively in your browser.
        No network connection required. No credentials needed.
        This is the safest mode — all other providers require additional backend configuration.
      </Banner>

      <Field label="Mode Label" fieldKey="modeName" value={draft.modeName} onChange={set} hint="Custom label for this storage mode" />
      <Toggle label="Export Backup Reminders" value={draft.backupReminderEnabled} onChange={(v) => set('backupReminderEnabled', v)} hint="Future run: show reminder to export data periodically" />
      <Toggle label="Import / Export Enabled" value={draft.importExportEnabled} onChange={(v) => set('importExportEnabled', v)} hint="Allow manual JSON export and import of all data" />

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Backup Frequency</label>
        <select value={draft.exportBackupFrequency} onChange={(e) => set('exportBackupFrequency', e.target.value)} className="form-input" style={{ width: '100%', fontSize: 12 }}>
          {['manual','daily','weekly','monthly'].map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <Field label="Notes" fieldKey="notes" value={draft.notes} onChange={set} placeholder="Optional notes" />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <Btn variant="primary" onClick={() => onSave(PROVIDER_IDS.LOCAL_ONLY, draft)}>💾 Save Settings</Btn>
        <Btn variant="info" onClick={() => onTest(PROVIDER_IDS.LOCAL_ONLY, draft)} loading={testing}>🔌 Test Storage</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER FORM — AWS ENTERPRISE
// ─────────────────────────────────────────────────────────────────────────────

function AwsForm({ cfg, onSave, onClear, onTest, testing }) {
  const init = cfg || {};
  const [draft, setDraft] = useState({
    region:            init.region             || '',
    apiGatewayBaseUrl: init.apiGatewayBaseUrl   || '',
    cognitoUserPoolId: init.cognitoUserPoolId   || '',
    cognitoClientId:   init.cognitoClientId     || '',
    s3BucketName:      init.s3BucketName        || '',
    dynamoPlanned:     init.dynamoPlanned        || false,
    notes:             init.notes              || '',
  });

  function set(key, val) { setDraft((d) => ({ ...d, [key]: val })); }

  const validation = validateProviderConfig(PROVIDER_IDS.AWS, draft);
  const hasUnsafe  = validation.readiness === READINESS.UNSAFE;

  return (
    <div>
      <Banner type="warn">
        AWS / Amplify integration is reserved for a future enterprise backend run.
        No real AWS SDK is connected in this run.
        <strong> AWS_SECRET_ACCESS_KEY is blocked from frontend config.</strong>
        Server-side IAM authentication is required for production AWS integration.
      </Banner>
      <Banner type="info">
        Only public identifiers (region, User Pool ID, Client ID, public API Gateway URL)
        may be saved here. No secret access keys are accepted.
      </Banner>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Field label="AWS Region" fieldKey="region" value={draft.region} onChange={set} placeholder="eu-west-1" hint="e.g. us-east-1, eu-west-2" />
        <Field label="API Gateway Base URL" fieldKey="apiGatewayBaseUrl" value={draft.apiGatewayBaseUrl} onChange={set} placeholder="https://xyz.execute-api.eu-west-1.amazonaws.com" />
        <Field label="Cognito User Pool ID" fieldKey="cognitoUserPoolId" value={draft.cognitoUserPoolId} onChange={set} placeholder="eu-west-1_XXXXXXXXX" hint="Public identifier — safe in frontend" />
        <Field label="Cognito Client ID" fieldKey="cognitoClientId" value={draft.cognitoClientId} onChange={set} placeholder="abcdef1234567890" hint="App client ID — public identifier" />
        <Field label="S3 Bucket Name" fieldKey="s3BucketName" value={draft.s3BucketName} onChange={set} placeholder="my-qcos-bucket" hint="Bucket name for reference only" />
      </div>

      <Toggle label="DynamoDB Planned" value={draft.dynamoPlanned} onChange={(v) => set('dynamoPlanned', v)} hint="Future enterprise data layer" />
      <Field label="Notes" fieldKey="notes" value={draft.notes} onChange={set} placeholder="Optional notes about this AWS configuration" />

      {validation.errors.length > 0 && <Banner type="error">{validation.errors.join(' · ')}</Banner>}
      {validation.warnings.map((w, i) => <Banner key={i} type="warn">{w}</Banner>)}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <Btn variant="primary" onClick={() => onSave(PROVIDER_IDS.AWS, draft)} disabled={hasUnsafe}>
          💾 Save Config
        </Btn>
        <Btn variant="info" onClick={() => onTest(PROVIDER_IDS.AWS, draft)} loading={testing} disabled={hasUnsafe}>
          🔌 Test (Validation Only)
        </Btn>
        <Btn variant="danger" onClick={() => onClear(PROVIDER_IDS.AWS)}>🗑 Clear Config</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function BackendConfiguration() {
  const [state,         setState_]         = useState(() => getState());
  const [activeSection, setActiveSection]  = useState(PROVIDER_IDS.LOCAL_ONLY);
  const [testResults,   setTestResults]    = useState({});
  const [testing,       setTesting]        = useState({});
  const [msg,           setMsg]            = useState('');
  const [warningShown,  setWarningShown]   = useState(false);
  const msgTimer = useRef(null);

  useEffect(() => {
    const unsub = subscribe(() => setState_(getState()));
    return unsub;
  }, []);

  function flash(text, ms = 3500) {
    setMsg(text);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(''), ms);
  }

  const workspaceMode = state.settings?.workspaceMode || WORKSPACE_MODE.DEMO;
  const isDemo        = workspaceMode === WORKSPACE_MODE.DEMO;
  const cfg           = getBackendConfig();
  const summary       = getBackendReadinessSummary();

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSave(providerId, draft) {
    const result = updateBackendProviderConfig(providerId, draft);
    if (result.blocked) {
      flash(`🚫 Config NOT saved — blocked secret detected: ${result.reason}`);
    } else {
      flash(`✅ "${PROVIDER_META[providerId]?.label}" config saved.`);
    }
  }

  async function handleTest(providerId, draft) {
    setTesting((t) => ({ ...t, [providerId]: true }));
    const result = await testBackendConnection(providerId, draft);
    setTestResults((r) => ({ ...r, [providerId]: result }));
    saveBackendConnectionTest(result);
    setTesting((t) => ({ ...t, [providerId]: false }));
    flash(`Test complete: ${result.message.slice(0, 80)}…`);
  }

  function handleClear(providerId) {
    if (!window.confirm(`Clear all saved config for "${PROVIDER_META[providerId]?.label}"? This cannot be undone.`)) return;
    clearBackendProviderConfig(providerId);
    flash(`🗑 Config cleared for "${PROVIDER_META[providerId]?.label}".`);
  }

  function handleSetActive(providerId) {
    setActiveBackendProviderConfig(providerId);
    flash(`✅ Active provider set to "${PROVIDER_META[providerId]?.label}".`);
  }

  // ── Demo gate ─────────────────────────────────────────────────────────────

  if (isDemo && !warningShown) {
    return (
      <div style={{ padding: '24px 28px', maxWidth: 720, margin: '0 auto' }}>
        <PageHeader
          title="Product Mode Backend Configuration"
          subtitle="Configure, validate, and safely test backend providers"
          icon="🔧"
        />
        <SectionCard title="Demo Mode Active" icon="🎯">
          <Banner type="warn">
            Backend configuration is available in <strong>Product Mode</strong> only.
            Switch to Product Mode to configure live backend readiness.
          </Banner>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 12px' }}>
            In Demo Mode, all backend provider configuration controls are disabled to prevent
            accidental configuration of live backend systems during presentation.
            Your existing demo data and assessments are not affected.
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            To use this panel: go to <strong>Settings → Product Mode</strong> and switch to
            <strong> Live Local Mode</strong> or connect a backend provider.
          </p>
          <Btn variant="ghost" onClick={() => setWarningShown(true)} style={{ marginTop: 8 }}>
            👁 Preview Panel (Read-Only)
          </Btn>
        </SectionCard>
      </div>
    );
  }

  // ── Full panel ────────────────────────────────────────────────────────────

  const providers = cfg.providers || {};

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, margin: '0 auto' }}>
      <PageHeader
        title="Product Mode Backend Configuration"
        subtitle="Configure, validate, save, and safely test backend providers for Quantum Compliance OS™"
        icon="🔧"
      />

      {isDemo && (
        <Banner type="warn">
          You are in Demo Mode — reading backend config in preview mode only.
          Switch to Product Mode to make changes.
        </Banner>
      )}

      {msg && (
        <div style={{
          padding: '8px 14px', marginBottom: 12, borderRadius: 'var(--radius-sm)',
          background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.25)',
          fontSize: 12, color: 'var(--text-secondary)',
        }}>
          {msg}
        </div>
      )}

      {/* ── Status Strip ─────────────────────────────────────────────────── */}
      <SectionCard title="Backend Readiness Overview" icon="📊">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 10 }}>
          {[
            { label: 'Active Provider',   value: PROVIDER_META[summary.activeProvider]?.label || summary.activeProvider, colour: '#00d4ff' },
            { label: 'Backend Enabled',   value: summary.backendEnabled ? 'Yes' : 'Local-only', colour: summary.backendEnabled ? '#10b981' : '#f59e0b' },
            { label: 'Supabase',          value: summary.supabaseConfigured   ? 'Configured' : 'Not configured', colour: summary.supabaseConfigured   ? '#10b981' : '#6b7280' },
            { label: 'Firebase',          value: summary.firebaseConfigured   ? 'Configured' : 'Not configured', colour: summary.firebaseConfigured   ? '#10b981' : '#6b7280' },
            { label: 'Custom REST',       value: summary.customRestConfigured ? 'Configured' : 'Not configured', colour: summary.customRestConfigured ? '#10b981' : '#6b7280' },
            { label: 'AWS / Enterprise',  value: summary.awsConfigured        ? 'Configured' : 'Not configured', colour: summary.awsConfigured        ? '#10b981' : '#6b7280' },
          ].map(({ label, value, colour }) => (
            <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: colour }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Toggle
            label="Product Mode Backend Enabled"
            value={summary.backendEnabled}
            onChange={(v) => { setProductModeBackendEnabled(v); flash(v ? '✅ Product Mode backend enabled.' : '⚠ Product Mode backend disabled — using local-only.'); }}
            hint="Enable when you are ready to connect a live backend provider"
          />
        </div>

        <Banner type="info">
          Backend configuration is saved locally only. Full live sync requires a future backend migration run.
          LocalStorage remains the safe active provider until a backend is connected and tested.
        </Banner>
      </SectionCard>

      {/* ── Provider Selector Cards ───────────────────────────────────────── */}
      <SectionCard title="Select Provider" icon="🔌">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 8 }}>
          {PROVIDER_ORDER.map((pid) => {
            const meta    = PROVIDER_META[pid];
            const prov    = providers[pid] || {};
            const isActive = cfg.activeProvider === pid;
            const readiness = pid === PROVIDER_IDS.LOCAL_ONLY ? 'active' : (prov.configured ? 'configured' : 'not-configured');
            return (
              <div
                key={pid}
                onClick={() => !isDemo && setActiveSection(pid)}
                style={{
                  background: activeSection === pid ? `${meta.colour}0D` : 'var(--bg-secondary)',
                  border: `1px solid ${activeSection === pid ? meta.colour + '50' : 'var(--border-muted)'}`,
                  borderTop: `3px solid ${activeSection === pid ? meta.colour : 'var(--border-muted)'}`,
                  borderRadius: 'var(--radius-md)', padding: '12px 14px', cursor: isDemo ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 5 }}>{meta.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: meta.colour, marginBottom: 3 }}>{meta.label}</div>
                <div style={{ marginBottom: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Pill status={readiness} label={readiness} size="xs" />
                  {isActive && <Pill status="active" label="Active" size="xs" />}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{meta.desc}</div>
                {!isDemo && pid !== PROVIDER_IDS.LOCAL_ONLY && prov.configured && !isActive && (
                  <Btn variant="success" onClick={(e) => { e.stopPropagation(); handleSetActive(pid); }}
                    style={{ marginTop: 8, fontSize: 10, padding: '3px 10px' }}>
                    Set Active
                  </Btn>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Active Provider Form ──────────────────────────────────────────── */}
      <SectionCard title={`Configure: ${PROVIDER_META[activeSection]?.label}`} icon={PROVIDER_META[activeSection]?.icon}>
        {isDemo && (
          <Banner type="warn">Switch to Product Mode to save or modify backend config.</Banner>
        )}
        {!isDemo && (
          <>
            {activeSection === PROVIDER_IDS.LOCAL_ONLY  && <LocalOnlyForm  cfg={providers[PROVIDER_IDS.LOCAL_ONLY]}  onSave={handleSave} onTest={handleTest} testing={testing[PROVIDER_IDS.LOCAL_ONLY]} />}
            {activeSection === PROVIDER_IDS.SUPABASE    && <SupabaseForm    cfg={providers[PROVIDER_IDS.SUPABASE]}    onSave={handleSave} onClear={handleClear} onTest={handleTest} testing={testing[PROVIDER_IDS.SUPABASE]} />}
            {activeSection === PROVIDER_IDS.FIREBASE    && <FirebaseForm    cfg={providers[PROVIDER_IDS.FIREBASE]}    onSave={handleSave} onClear={handleClear} onTest={handleTest} testing={testing[PROVIDER_IDS.FIREBASE]} />}
            {activeSection === PROVIDER_IDS.CUSTOM_REST && <CustomRestForm  cfg={providers[PROVIDER_IDS.CUSTOM_REST]} onSave={handleSave} onClear={handleClear} onTest={handleTest} testing={testing[PROVIDER_IDS.CUSTOM_REST]} />}
            {activeSection === PROVIDER_IDS.AWS         && <AwsForm         cfg={providers[PROVIDER_IDS.AWS]}         onSave={handleSave} onClear={handleClear} onTest={handleTest} testing={testing[PROVIDER_IDS.AWS]} />}
          </>
        )}

        {/* Last test result for active section */}
        {testResults[activeSection] && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 }}>Last Test Result</div>
            <TestResultBanner result={testResults[activeSection]} />
          </div>
        )}
      </SectionCard>

      {/* ── Backend Readiness Checklist ───────────────────────────────────── */}
      <SectionCard title="Backend Readiness Checklist" icon="✅">
        {[
          { label: 'Local Storage available and active',               done: true },
          { label: 'storage.js SSOT in place',                        done: true },
          { label: 'backendConfig schema initialised',                done: true },
          { label: 'Secret scan guard active',                        done: true },
          { label: 'SERVICE_ROLE_KEY blocked from frontend',          done: true },
          { label: 'Private key / JWT blocked from frontend',         done: true },
          { label: 'DATABASE_URL blocked from frontend',              done: true },
          { label: 'Supabase provider configurable',                  done: true },
          { label: 'Firebase provider configurable',                  done: true },
          { label: 'Custom REST provider configurable',               done: true },
          { label: 'AWS / Enterprise provider configurable',          done: true },
          { label: 'Supabase config saved',                           done: summary.supabaseConfigured },
          { label: 'Firebase config saved',                           done: summary.firebaseConfigured },
          { label: 'Custom REST config saved',                        done: summary.customRestConfigured },
          { label: 'Active provider set',                             done: !!cfg.activeProvider },
          { label: 'Connection test run for active provider',         done: (cfg.connectionTests || []).length > 0 },
          { label: 'No real backend sync implemented (by design)',    done: true },
          { label: 'No Supabase schema created (by design)',         done: true },
          { label: 'RLS NOT enabled — configure in Supabase console', done: true, note: 'By design — RLS must be set up server-side' },
          { label: 'No external AI API calls',                       done: true },
          { label: 'No payments',                                    done: true },
        ].map(({ label, done, note }) => (
          <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '5px 0', borderBottom: '1px solid var(--border-muted)' }}>
            <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{done ? '✅' : '⬜'}</span>
            <div>
              <div style={{ fontSize: 11, color: done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{label}</div>
              {note && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{note}</div>}
            </div>
          </div>
        ))}
      </SectionCard>

      {/* ── 4P3X API Config Guard™ ────────────────────────────────────────── */}
      <SectionCard title="4P3X API Config Guard™" icon="🛡">
        <Banner type="blocked">
          Backend-only secrets must NEVER be placed in frontend code, committed to Git,
          logged, or exported carelessly. The following are permanently blocked from frontend config:
        </Banner>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 5, marginBottom: 12 }}>
          {[
            'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY', 'GROQ_API_KEY',
            'STRIPE_SECRET_KEY', 'DATABASE_URL', 'JWT_SECRET',
            'PRIVATE_KEY', 'WEBHOOK_SECRET', 'Admin Tokens',
            'Service Account JSON', 'Root Keys', 'AWS_SECRET_ACCESS_KEY',
            'Backend Bearer Tokens', 'FIREBASE_PRIVATE_KEY', 'Server-only secrets',
          ].map((k) => (
            <div key={k} style={{
              padding: '4px 10px', background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)',
              fontSize: 10, fontFamily: 'monospace', color: '#ef4444',
            }}>
              🚫 {k}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Safe for frontend config:</strong><br />
          ✅ Supabase project URL &nbsp;·&nbsp; ✅ Supabase anon/public key &nbsp;·&nbsp;
          ✅ Firebase web app config (apiKey, projectId, etc.) &nbsp;·&nbsp;
          ✅ Public API base URL &nbsp;·&nbsp; ✅ Cognito User Pool ID / Client ID &nbsp;·&nbsp;
          ✅ AWS region / public API Gateway URL &nbsp;·&nbsp;
          ✅ Public project identifiers
        </div>
      </SectionCard>

      {/* ── Sync Status Placeholder ───────────────────────────────────────── */}
      <SectionCard title="Sync Status" icon="🔄">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Current Provider', value: PROVIDER_META[summary.activeProvider]?.label || 'Local-only' },
            { label: 'Sync Status',      value: 'Not connected' },
            { label: 'Backend Ready',    value: summary.backendEnabled ? 'Yes' : 'No — Local-only' },
            { label: 'Last Test',        value: cfg.lastTestedAt ? new Date(cfg.lastTestedAt).toLocaleDateString() : 'Not yet run' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</div>
            </div>
          ))}
        </div>
        <Banner type="info">
          Backend configuration is saved locally. Full live sync requires a future backend migration run.
          No data has been moved to any external backend.
        </Banner>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 8 }}>
          <strong>Future runs (not implemented here):</strong><br />
          · Run 24+: Supabase SQL schema setup + RLS policy SQL<br />
          · Run 25+: Local-to-Supabase migration engine<br />
          · Run 26+: Live sync queue + conflict resolution<br />
          · Run 27+: Team accounts + row-level permissions<br />
          · Run 28+: Optional external AI API connector
        </div>
      </SectionCard>

      {/* ── Connection Test History ───────────────────────────────────────── */}
      {(cfg.connectionTests || []).length > 0 && (
        <SectionCard title="Recent Connection Tests" icon="📋">
          {cfg.connectionTests.slice(0, 8).map((t) => (
            <div key={t.id} style={{
              padding: '7px 10px', marginBottom: 5,
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
              display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap',
            }}>
              <Pill status={t.status} label={t.status} size="xs" />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                {PROVIDER_META[t.providerId]?.label || t.providerId}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, minWidth: 0 }}>
                {t.message}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                {t.testedAt ? new Date(t.testedAt).toLocaleString() : ''}
              </span>
            </div>
          ))}
        </SectionCard>
      )}


      {/* ── Backend-Ready Data Mapping Panel ────────────────────────────── */}
      <SectionCard title="Backend-Ready Data Mapping" icon="🗂">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12, padding: '8px 12px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--radius-sm)' }}>
          Informational only. Run 24 will create the full Supabase SQL schema + RLS policies.
          This panel shows how current local data maps to future backend tables.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                {['Local / SSOT Key', 'Future Backend Table', 'Sync Status', 'Notes'].map((h) => (
                  <th key={h} style={{ padding: '7px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'clients (consultantStorage)',      table: 'clients',           status: 'local-demo',  note: 'isDemo flag separates demo/live records' },
                { key: 'assessments (storage.js)',          table: 'assessments',       status: 'local-demo',  note: 'Linked to clientId' },
                { key: 'reports (reportHistoryData)',       table: 'reports',           status: 'local-demo',  note: 'reportSchema.js defines structure' },
                { key: 'evidence items (evidencePack)',     table: 'evidence_items',    status: 'local-demo',  note: 'File uploads require Supabase Storage / S3' },
                { key: 'risk scores (riskModel)',           table: 'risk_scores',       status: 'local-demo',  note: 'Computed locally, backed up to table' },
                { key: 'ai notes (aiAgentSessions)',        table: 'ai_notes',          status: 'local-demo',  note: 'Advisory only. Mock AI active.' },
                { key: 'audit log (activityLog)',           table: 'audit_logs',        status: 'pending-run', note: 'Full audit trail requires Run 24+' },
                { key: 'backend settings (backendConfig)',  table: 'backend_settings',  status: 'pending-run', note: 'Admin/config table in Run 24' },
                { key: 'branding (consultantStorage)',      table: 'client_branding',   status: 'pending-run', note: 'White-label config in Run 24+' },
                { key: 'users / team (not yet)',            table: 'users',             status: 'not-configured', note: 'Auth + team roles in Run 25+' },
              ].map(({ key, table, status, note }) => {
                const statusMeta = {
                  'local-demo':      { label: 'Local / Demo only',    colour: '#f59e0b' },
                  'pending-run':     { label: 'Pending Run 24+',       colour: '#6b7280' },
                  'not-configured':  { label: 'Not yet implemented',   colour: '#6b7280' },
                  'backend-ready':   { label: 'Backend-ready',         colour: '#00d4ff' },
                  'connected':       { label: 'Connected',             colour: '#10b981' },
                }[status] || { label: status, colour: '#6b7280' };
                return (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                    <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 10, color: 'var(--text-secondary)' }}>{key}</td>
                    <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 10, color: 'var(--accent)' }}>{table}</td>
                    <td style={{ padding: '6px 12px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: `${statusMeta.colour}18`, color: statusMeta.colour, border: `1px solid ${statusMeta.colour}30` }}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td style={{ padding: '6px 12px', color: 'var(--text-muted)', fontSize: 10, lineHeight: 1.5 }}>{note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Live Product Readiness Checklist ─────────────────────────────── */}
      <SectionCard title="Live Product Readiness Checklist" icon="🚦">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>
          Track what is ready, what needs configuration, and what is pending a future run.
        </div>
        {[
          { item: 'Demo / Live toggle verified (workspaceMode SSOT)',              status: 'ready',     note: 'workspaceMode.js + storage.js — single source of truth' },
          { item: 'Demo data hidden in Product Mode',                              status: 'ready',     note: 'isDemo flag on all records; filterRecordsByProductMode()' },
          { item: 'Live-mode empty states present (clients/reports/evidence/AI)', status: 'ready',     note: 'Run 23 — empty states show backend CTA' },
          { item: 'Backend provider selected',                                    status: !isDemo && summary.activeProvider && summary.activeProvider !== 'localOnly' ? 'ready' : 'needs-config', note: `Active: ${summary.activeProvider || 'localOnly'}` },
          { item: 'Backend config saved',                                         status: summary.supabaseConfigured || summary.firebaseConfigured || summary.customRestConfigured ? 'ready' : 'needs-config', note: 'Configure a provider above and save' },
          { item: 'Backend connection test passed',                               status: summary.connectionTests?.length > 0 ? 'needs-config' : 'needs-config', note: 'Test connection using a configured provider' },
          { item: '4P3X API Config Guard™ active',                               status: 'ready',     note: 'backendConfigGuard.js — 15+ blocked secret patterns' },
          { item: 'Service role / private keys blocked',                          status: 'ready',     note: 'Blocked on every keystroke before save' },
          { item: 'Client records backend-ready',                                 status: 'ready',     note: 'isDemo flag + filterClientsByMode() in place' },
          { item: 'Reports backend-ready',                                        status: 'ready',     note: 'reportSchema.js — structure ready for Run 24 tables' },
          { item: 'Evidence storage backend-ready',                               status: 'needs-config', note: 'File uploads need Supabase Storage / S3 in Run 24+' },
          { item: 'AI provider backend-safe',                                     status: 'ready',     note: 'detectBlockedAISecrets + mock-only in current run' },
          { item: 'Supabase SQL schema',                                          status: 'pending',   note: 'Full schema + RLS policies in Run 24' },
          { item: 'Audit trail / activity log backend table',                     status: 'pending',   note: 'audit_logs table in Run 24' },
          { item: 'Auth / team roles / user management',                          status: 'pending',   note: 'Supabase Auth + Cognito / Firebase Auth in Run 25+' },
          { item: 'Production QA + penetration readiness review',                 status: 'pending',   note: 'Run 26+ final QA and deployment hardening' },
        ].map(({ item, status, note }) => {
          const meta = {
            ready:        { icon: '✅', colour: '#10b981', label: 'Ready' },
            'needs-config': { icon: '⚠️', colour: '#f59e0b', label: 'Needs configuration' },
            pending:      { icon: '🔮', colour: '#6b7280', label: 'Pending future run' },
            failed:       { icon: '❌', colour: '#ef4444', label: 'Failed' },
          }[status] || { icon: '⬜', colour: '#6b7280', label: String(status) };
          return (
            <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{meta.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: status === 'ready' ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{item}</div>
                {note && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{note}</div>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: `${meta.colour}15`, color: meta.colour, border: `1px solid ${meta.colour}28`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {meta.label}
              </span>
            </div>
          );
        })}
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--accent)' }}>Next steps:</strong><br />
          · <strong>Run 24</strong> — Full Supabase SQL schema + RLS policies + evidence storage<br />
          · <strong>Run 25</strong> — Auth + team roles + row-level user management<br />
          · <strong>Run 26</strong> — Production QA + deployment hardening
        </div>
      </SectionCard>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px', marginTop: 8,
        background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius-md)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7,
      }}>
        <strong>Run 23 (8.6) — Backend Configuration Panel</strong><br />
        RLS is NOT enabled — must be configured in Supabase console using SQL policies in a future run.
        Backend sync is NOT implemented. Supabase schema is NOT created. Backend provider configuration
        is saved locally only. Real payments are NOT included. External AI APIs are NOT included.
        Offensive scanning is NOT included. Risk scores and recommendations are advisory and require
        qualified human review. Data separation status is a product safeguard and does not guarantee
        legal or regulatory compliance.<br /><br />
        <em>Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™</em>
      </div>
    </div>
  );
}
