/**
 * QUANTUM COMPLIANCE OS™ — BackendConnectorSettings.jsx
 * Run 15: Backend Connectors + Live Sync Layer
 * ======================================================
 * Backend connector settings, Supabase config panel, Firebase config panel,
 * AWS/CustomAPI placeholders, sync control panel, and SQL setup reference.
 *
 * SAFETY:
 * - No real Supabase/Firebase/AWS/custom API SDK instantiation
 * - No service role keys, DATABASE_URL, JWT_SECRET, or private keys
 * - Blocked secrets are not saved, not logged, and not displayed back
 * - All config is local/browser-safe public config only
 * - LocalStorage remains default/fallback in Run 15
 * - Connection tests are config-shape validation only (no real network)
 * - Kyzel Kreates™ / 4P3X Intelligent AI™ ownership preserved
 *
 * DISCLAIMER:
 * Backend connection enables persistence and sync but does not guarantee
 * compliance. RLS and backend security policies must be reviewed before
 * production use. Live sync status reflects app sync state only, not
 * legal audit certification.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader   from '../components/PageHeader.jsx';
import SectionCard  from '../components/SectionCard.jsx';
import { getState, subscribe } from '../core/storage.js';
import {
  BACKEND_MODE, CONNECTION_STATUS, SYNC_STATUS,
  getDefaultBackendSettings, getDefaultSyncSettings,
  getBackendSettings, getSyncSettings, getSyncStatusSummary,
  getBackendReadinessStatus,
  detectBlockedSecrets, validatePublicConfig, maskProviderConfig,
  saveBackendProviderConfig, testBackendConnection, setActiveBackendProvider,
  runManualSync,
} from '../core/backendSync.js';

// ─── Status pill ──────────────────────────────────────────────────────────────
function Pill({ status, label }) {
  const MAP = {
    active:             { bg:'rgba(16,185,129,0.12)', fg:'#10b981', border:'rgba(16,185,129,0.3)' },
    configured:         { bg:'rgba(0,212,255,0.1)',   fg:'#00d4ff', border:'rgba(0,212,255,0.3)' },
    'not-configured':   { bg:'rgba(107,114,128,0.1)', fg:'#6b7280', border:'rgba(107,114,128,0.25)' },
    placeholder:        { bg:'rgba(107,114,128,0.08)',fg:'#6b7280', border:'rgba(107,114,128,0.2)' },
    'local-only':       { bg:'rgba(245,158,11,0.1)',  fg:'#f59e0b', border:'rgba(245,158,11,0.3)' },
    connected:          { bg:'rgba(16,185,129,0.12)', fg:'#10b981', border:'rgba(16,185,129,0.3)' },
    failed:             { bg:'rgba(239,68,68,0.1)',   fg:'#ef4444', border:'rgba(239,68,68,0.3)' },
    testing:            { bg:'rgba(59,130,246,0.1)',  fg:'#3b82f6', border:'rgba(59,130,246,0.3)' },
    'shape-valid':      { bg:'rgba(0,212,255,0.08)',  fg:'#00d4ff', border:'rgba(0,212,255,0.25)' },
    success:            { bg:'rgba(16,185,129,0.12)', fg:'#10b981', border:'rgba(16,185,129,0.3)' },
    warning:            { bg:'rgba(245,158,11,0.1)',  fg:'#f59e0b', border:'rgba(245,158,11,0.3)' },
  };
  const c = MAP[status] || MAP['not-configured'];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {label || status}
    </span>
  );
}

// ─── Warning banner ───────────────────────────────────────────────────────────
function WarnBanner({ children, colour = '#f59e0b' }) {
  return (
    <div style={{
      padding: '8px 12px', marginBottom: 10,
      background: `${colour}0A`, border: `1px solid ${colour}30`,
      borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
    }}>
      ⚠ {children}
    </div>
  );
}

// ─── Secret-blocked banner ────────────────────────────────────────────────────
function BlockedBanner({ reason }) {
  return (
    <div style={{
      padding: '8px 12px', marginBottom: 10,
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 'var(--radius-sm)', fontSize: 11, color: '#ef4444', fontWeight: 600,
    }}>
      🚫 {reason}
    </div>
  );
}

// ─── Result banner ────────────────────────────────────────────────────────────
function ResultBanner({ result }) {
  if (!result) return null;
  const colour = result.success ? '#10b981' : '#ef4444';
  return (
    <div style={{
      padding: '8px 12px', marginBottom: 10,
      background: `${colour}0A`, border: `1px solid ${colour}30`,
      borderRadius: 'var(--radius-sm)', fontSize: 12, color: colour, fontWeight: 600,
    }}>
      {result.success ? '✅' : '❌'} {result.message}
      {result.warnings?.length > 0 && (
        <div style={{ marginTop: 6, fontWeight: 400, color: '#f59e0b' }}>
          {result.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
        </div>
      )}
      {result.simulated && (
        <div style={{ marginTop: 4, fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>
          (Config shape validation only — no real network call made in Run 15)
        </div>
      )}
    </div>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────
function ConfigField({ label, fieldKey, value, onChange, type = 'text', placeholder = '', hint = '' }) {
  const [blocked, setBlocked] = useState(null);

  function handleChange(e) {
    const val = e.target.value;
    const detection = detectBlockedSecrets(val);
    if (detection.blocked) {
      setBlocked(detection.reason);
      // Do not propagate blocked value
      return;
    }
    setBlocked(null);
    onChange(fieldKey, val);
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
        {label}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={handleChange}
        className="form-input"
        style={{ width: '100%', fontFamily: label.toLowerCase().includes('key') || label.toLowerCase().includes('token') ? 'monospace' : 'inherit', fontSize: 12 }}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {blocked && <BlockedBanner reason={blocked} />}
      {hint && !blocked && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

// ─── Sync status icon ─────────────────────────────────────────────────────────
function syncIcon(status) {
  const MAP = {
    [SYNC_STATUS.SUCCESS]:    '✅',
    [SYNC_STATUS.LOCAL_ONLY]: '💾',
    [SYNC_STATUS.FAILED]:     '❌',
    [SYNC_STATUS.PARTIAL]:    '⚠',
    [SYNC_STATUS.NOT_RUN]:    '—',
    [SYNC_STATUS.PROVIDER_NOT_CONFIGURED]: '🔒',
    'config-saved-sdk-pending': '⚙',
  };
  return MAP[status] || '—';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main BackendConnectorSettings component
// ─────────────────────────────────────────────────────────────────────────────
export default function BackendConnectorSettings() {
  const [mainState,    setMainState]    = useState(() => getState());
  const [globalMsg,    setGlobalMsg]    = useState('');
  const [syncResult,   setSyncResult]   = useState(null);
  const [testResults,  setTestResults]  = useState({});
  const [setActiveRes, setSetActiveRes] = useState({});

  // Per-provider edit state
  const [supabaseEdit,  setSupabaseEdit]  = useState(null);
  const [firebaseEdit,  setFirebaseEdit]  = useState(null);
  const [customApiEdit, setCustomApiEdit] = useState(null);

  useEffect(() => { return subscribe(setMainState); }, []);

  const bs     = mainState?.backendSettings || getDefaultBackendSettings();
  const ss     = mainState?.syncSettings    || getDefaultSyncSettings();
  const sq     = mainState?.syncQueue       || [];
  const ready  = getBackendReadinessStatus();
  const syncSummary = getSyncStatusSummary();

  function showMsg(msg, timeout = 3000) {
    setGlobalMsg(msg);
    setTimeout(() => setGlobalMsg(''), timeout);
  }

  // ── Save config ─────────────────────────────────────────────────────────────
  function handleSaveConfig(providerId, editState) {
    const result = saveBackendProviderConfig(providerId, editState);
    if (result.blocked) {
      showMsg('🚫 Blocked secret detected. Config not saved.', 4000);
    } else if (result.saved) {
      showMsg(`✅ ${providerId} config saved successfully.`);
      if (providerId === 'supabase')  setSupabaseEdit(null);
      if (providerId === 'firebase')  setFirebaseEdit(null);
      if (providerId === 'customApi') setCustomApiEdit(null);
    } else {
      showMsg(`❌ Save failed: ${result.errors.join('; ')}`);
    }
  }

  // ── Test connection ──────────────────────────────────────────────────────────
  function handleTestConnection(providerId) {
    const result = testBackendConnection(providerId);
    setTestResults((prev) => ({ ...prev, [providerId]: result }));
  }

  // ── Set active provider ──────────────────────────────────────────────────────
  function handleSetActive(providerId) {
    const result = setActiveBackendProvider(providerId);
    setSetActiveRes((prev) => ({ ...prev, [providerId]: result }));
    if (result.success) showMsg(`✅ Active provider set to ${providerId}.`);
  }

  // ── Manual sync ─────────────────────────────────────────────────────────────
  function handleManualSync() {
    const result = runManualSync();
    setSyncResult(result);
    setTimeout(() => setSyncResult(null), 6000);
  }

  // ── Field change helper ──────────────────────────────────────────────────────
  const handleFieldChange = useCallback((setter) => (key, val) => {
    setter((prev) => ({ ...prev, [key]: val }));
  }, []);

  const supabaseProv  = bs.providers?.supabase    || {};
  const firebaseProv  = bs.providers?.firebase    || {};
  const awsProv       = bs.providers?.aws         || {};
  const customApiProv = bs.providers?.customApi   || {};

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Backend Connectors & Live Sync"
        subtitle="Quantum Compliance OS™ · Powered by 4P3X Intelligent AI™"
      />

      {globalMsg && (
        <div style={{
          marginBottom: 14, padding: '8px 14px',
          background: globalMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : globalMsg.startsWith('🚫') ? 'rgba(239,68,68,0.08)' : 'rgba(0,212,255,0.08)',
          border: `1px solid ${globalMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : globalMsg.startsWith('🚫') ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,255,0.25)'}`,
          borderRadius: 'var(--radius-md)', fontSize: 13,
          color: globalMsg.startsWith('✅') ? '#10b981' : globalMsg.startsWith('🚫') ? '#ef4444' : 'var(--accent)',
          fontWeight: 600,
        }}>
          {globalMsg}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 1. Backend Connector Status Overview                                 */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Backend Connector Status" icon="🔌">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7,
          padding: '8px 12px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 'var(--radius-sm)' }}>
          <strong style={{ color: 'var(--accent)' }}>Run 15 status:</strong>{' '}
          Backend connector settings foundation. LocalStorage remains the active provider.
          Supabase and Firebase public config can be saved and shape-validated.
          Real SDK connection and live sync require the connector SDK to be installed and schema validated.
          <br />
          <strong style={{ display: 'block', marginTop: 4 }}>
            Backend connection enables persistence and sync but does not guarantee compliance.
            RLS and backend security policies must be reviewed before production use.
          </strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 8, marginBottom: 10 }}>
          {[
            ['Active Provider',      `💾 ${bs.activeProvider}`,                            'var(--accent)'],
            ['Backend Mode',         bs.backendMode,                                        '#f59e0b'],
            ['Connection Status',    bs.connectionStatus,                                   '#6b7280'],
            ['Offline Fallback',     bs.offlineFallbackEnabled ? 'Enabled' : 'Disabled',    '#10b981'],
            ['Sync Enabled',         bs.syncEnabled ? 'Yes' : 'No (Run 15)',                '#6b7280'],
            ['Realtime',             bs.realtimeEnabled ? 'Yes' : 'No (future run)',        '#6b7280'],
            ['Supabase Configured',  ready.supabaseConfigured ? 'Yes' : 'No',               ready.supabaseConfigured ? '#10b981' : '#6b7280'],
            ['Firebase Configured',  ready.firebaseConfigured ? 'Yes' : 'No',               ready.firebaseConfigured ? '#10b981' : '#6b7280'],
            ['Last Connection Test', bs.lastConnectionTestAt ? bs.lastConnectionTestAt.slice(0, 16).replace('T',' ') : '—', '#6b7280'],
            ['Last Sync',            ss.lastSyncAt ? ss.lastSyncAt.slice(0, 16).replace('T',' ') : '—', '#6b7280'],
          ].map(([label, value, colour]) => (
            <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '9px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: colour }}>{value}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 2. Supabase Panel                                                    */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Supabase Connector" icon="⚡">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <Pill status={supabaseProv.status || 'not-configured'} label={supabaseProv.status || 'not-configured'} />
          {supabaseProv.configured && <Pill status="shape-valid" label="Config saved" />}
          {bs.activeProvider === 'supabase' && <Pill status="active" label="Active" />}
        </div>

        <WarnBanner>Use only the <strong>public anon key</strong> in frontend configuration.</WarnBanner>
        <WarnBanner>Never paste <code style={{ fontFamily: 'monospace' }}>SUPABASE_SERVICE_ROLE_KEY</code> into this app. It is automatically blocked.</WarnBanner>
        <WarnBanner>RLS must be enabled on all tables before production use. See the SQL setup file in this repository.</WarnBanner>

        {supabaseEdit ? (
          <div>
            <ConfigField label="Supabase Project URL"       fieldKey="supabaseUrl"     value={supabaseEdit.supabaseUrl}     onChange={handleFieldChange(setSupabaseEdit)}  placeholder="https://xyz.supabase.co" hint="Your Supabase project URL — found in Project Settings > API." />
            <ConfigField label="Supabase Anon / Public Key" fieldKey="supabaseAnonKey" value={supabaseEdit.supabaseAnonKey} onChange={handleFieldChange(setSupabaseEdit)}  placeholder="eyJhbGciOi..." hint="The anon/public key from Project Settings > API. NOT the service role key." />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <button onClick={() => handleSaveConfig('supabase', supabaseEdit)} className="btn btn-primary" style={{ fontSize: 12 }}>Save Config</button>
              <button onClick={() => setSupabaseEdit(null)} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {supabaseProv.configured && supabaseProv.maskedConfig && (
              <div style={{ marginBottom: 12 }}>
                {Object.entries(supabaseProv.maskedConfig).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--border-muted)', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 160 }}>{key}</span>
                    <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{val || '—'}</code>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setSupabaseEdit({ ...(supabaseProv.publicConfig || { supabaseUrl: '', supabaseAnonKey: '' }) })} className="btn btn-primary" style={{ fontSize: 12 }}>
                {supabaseProv.configured ? 'Edit Config' : 'Configure Supabase'}
              </button>
              {supabaseProv.configured && (
                <>
                  <button onClick={() => handleTestConnection('supabase')} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
                    🔍 Test Connection
                  </button>
                  {bs.activeProvider !== 'supabase' && (
                    <button onClick={() => handleSetActive('supabase')} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>
                      Set as Active Provider
                    </button>
                  )}
                </>
              )}
            </div>
            <ResultBanner result={testResults.supabase} />
            {setActiveRes.supabase && !setActiveRes.supabase.success && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#ef4444' }}>❌ {setActiveRes.supabase.message}</div>
            )}
          </div>
        )}

        {supabaseProv.lastTestAt && (
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)' }}>
            Last test: {supabaseProv.lastTestAt.slice(0, 16).replace('T',' ')} —{' '}
            <Pill status={supabaseProv.lastTestResult || 'not-configured'} label={supabaseProv.lastTestResult || '—'} />
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
          padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
          <strong>Connection test note:</strong> Real Supabase SDK is not installed in Run 15.
          Connection test validates config shape only (URL format, anon key shape, blocked secret check).
          Install <code style={{ fontFamily: 'monospace' }}>@supabase/supabase-js</code> and implement
          the connector in a future run to enable real connection testing and live sync.
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 3. Firebase Panel                                                    */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Firebase / Firestore Connector" icon="🔥">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <Pill status={firebaseProv.status || 'not-configured'} label={firebaseProv.status || 'not-configured'} />
          {firebaseProv.configured && <Pill status="shape-valid" label="Config saved" />}
          {bs.activeProvider === 'firebase' && <Pill status="active" label="Active" />}
        </div>

        <WarnBanner>Use only <strong>client-safe Firebase web app config</strong>. Do not use Firebase Admin SDK or private key JSON.</WarnBanner>
        <WarnBanner>Security rules must be reviewed before production use.</WarnBanner>

        {firebaseEdit ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 8 }}>
              <ConfigField label="API Key"             fieldKey="apiKey"            value={firebaseEdit.apiKey}            onChange={handleFieldChange(setFirebaseEdit)}  hint="Public Firebase web API key — safe in frontend." />
              <ConfigField label="Auth Domain"         fieldKey="authDomain"        value={firebaseEdit.authDomain}        onChange={handleFieldChange(setFirebaseEdit)}  placeholder="xyz.firebaseapp.com" />
              <ConfigField label="Project ID"          fieldKey="projectId"         value={firebaseEdit.projectId}         onChange={handleFieldChange(setFirebaseEdit)} />
              <ConfigField label="Storage Bucket"      fieldKey="storageBucket"     value={firebaseEdit.storageBucket}     onChange={handleFieldChange(setFirebaseEdit)}  placeholder="xyz.appspot.com" />
              <ConfigField label="Messaging Sender ID" fieldKey="messagingSenderId" value={firebaseEdit.messagingSenderId} onChange={handleFieldChange(setFirebaseEdit)} />
              <ConfigField label="App ID"              fieldKey="appId"             value={firebaseEdit.appId}             onChange={handleFieldChange(setFirebaseEdit)} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <button onClick={() => handleSaveConfig('firebase', firebaseEdit)} className="btn btn-primary" style={{ fontSize: 12 }}>Save Config</button>
              <button onClick={() => setFirebaseEdit(null)} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {firebaseProv.configured && firebaseProv.maskedConfig && (
              <div style={{ marginBottom: 12 }}>
                {Object.entries(firebaseProv.maskedConfig).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--border-muted)', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 160 }}>{key}</span>
                    <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{val || '—'}</code>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setFirebaseEdit({ ...(firebaseProv.publicConfig || { apiKey:'', authDomain:'', projectId:'', storageBucket:'', messagingSenderId:'', appId:'' }) })} className="btn btn-primary" style={{ fontSize: 12 }}>
                {firebaseProv.configured ? 'Edit Config' : 'Configure Firebase'}
              </button>
              {firebaseProv.configured && (
                <>
                  <button onClick={() => handleTestConnection('firebase')} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
                    🔍 Test Connection
                  </button>
                  {bs.activeProvider !== 'firebase' && (
                    <button onClick={() => handleSetActive('firebase')} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}>
                      Set as Active Provider
                    </button>
                  )}
                </>
              )}
            </div>
            <ResultBanner result={testResults.firebase} />
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
          padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
          Real Firebase SDK (<code style={{ fontFamily: 'monospace' }}>firebase</code>) is not installed in Run 15.
          Connection test validates config shape only. Install the SDK and implement the connector in a future run.
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 4. AWS / Amplify Placeholder                                         */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="AWS / Amplify" icon="☁️">
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <Pill status="placeholder" label="placeholder" />
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
            Future run
          </span>
        </div>
        <div style={{ padding: '14px 16px', background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.15)', borderRadius: 'var(--radius-md)', lineHeight: 1.7 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Enterprise Backend Option — Reserved</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            AWS / Amplify integration is reserved for a future enterprise backend run.
            No real AWS connection is active in Run 15. No AWS secret keys are accepted in this app.
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
          <strong>Note:</strong> <code style={{ fontFamily: 'monospace' }}>AWS_SECRET_ACCESS_KEY</code> is blocked from frontend config.
          Server-side auth is required for production AWS integration.
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 5. Custom REST API Placeholder                                        */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Custom REST API" icon="🔌">
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <Pill status="placeholder" label="placeholder" />
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
            Future run
          </span>
        </div>
        <div style={{ padding: '14px 16px', background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.15)', borderRadius: 'var(--radius-md)', lineHeight: 1.7, marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Custom Backend API Connector — Reserved</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Custom REST API support is reserved for future white-label and enterprise deployments.
            No private token or API secret support is provided in frontend config.
            Server-side auth is required in future production versions.
          </div>
        </div>
        {customApiEdit ? (
          <div>
            <ConfigField label="Base URL" fieldKey="baseUrl" value={customApiEdit.baseUrl || ''} onChange={handleFieldChange(setCustomApiEdit)} placeholder="https://api.yourdomain.com" hint="Public-facing API base URL only. No tokens in frontend." />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleSaveConfig('customApi', customApiEdit)} className="btn btn-primary" style={{ fontSize: 12 }}>Save Base URL</button>
              <button onClick={() => setCustomApiEdit(null)} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setCustomApiEdit({ baseUrl: customApiProv.publicConfig?.baseUrl || '' })} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            Set Base URL (placeholder only)
          </button>
        )}
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 6. Sync Control Panel                                                */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Sync Control" icon="🔄">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
          Manual sync foundation. Real sync requires backend SDK and schema validation.
          Demo records are not automatically synced to backend.
          Only non-demo live/local records should be queued for backend sync.
        </div>

        {syncResult && <ResultBanner result={syncResult} />}

        {/* Sync status rows */}
        {[
          ['Last Sync',           ss.lastSyncAt ? ss.lastSyncAt.slice(0, 16).replace('T',' ') : 'Never',  '📅'],
          ['Last Sync Status',    `${syncIcon(ss.lastSyncStatus)} ${ss.lastSyncStatus || 'not-run'}`,      '📋'],
          ['Pending Queue',       `${syncSummary.pendingCount} item${syncSummary.pendingCount !== 1 ? 's' : ''}`, '⏳'],
          ['Failed Queue',        `${syncSummary.failedCount} item${syncSummary.failedCount !== 1 ? 's' : ''}`,   '❌'],
          ['Synced',              `${syncSummary.syncedCount} item${syncSummary.syncedCount !== 1 ? 's' : ''}`,   '✅'],
          ['Offline Fallback',    ss.offlineFallbackEnabled ? '✅ Enabled' : '—',                          '💾'],
          ['Active Provider',     `💾 ${ss.provider || bs.activeProvider}`,                                '🔌'],
          ['Provider Readiness',  bs.activeProvider === 'localStorage' ? 'LocalStorage — no sync needed' : (ready.supabaseConfigured || ready.firebaseConfigured ? 'Config saved — SDK pending' : 'Not configured'), '🔧'],
        ].map(([label, value, icon]) => (
          <div key={label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-muted)', fontSize: 12 }}>
            <span style={{ width: 22, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
            <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
          </div>
        ))}

        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleManualSync} className="btn btn-primary" style={{ fontSize: 13 }}>
            🔄 Run Manual Sync
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
          padding: '8px 12px', background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.12)', borderRadius: 'var(--radius-sm)' }}>
          <strong>Sync behaviour in Run 15:</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
            <li>If LocalStorage is active → shows "No backend sync required."</li>
            <li>If provider configured, SDK absent → shows "Config saved. Real sync requires SDK implementation."</li>
            <li>Real sync implemented when backend SDK is installed and schema is validated in a future run.</li>
            <li>Demo records are never automatically synced to backend.</li>
          </ul>
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 7. SQL Setup Reference Panel                                         */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Supabase SQL Setup File" icon="🗄️">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.7 }}>
          A complete Supabase SQL setup file has been added to this repository.
          Review and execute this file in your Supabase SQL Editor before connecting the backend.
        </div>

        <div style={{ marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
          {[
            ['File',           'SUPABASE_SETUP_RUN_15.sql',       '📄', '#D4AF37'],
            ['RLS Status',     '✅ ENABLED on all tables',          '🔒', '#10b981'],
            ['Tables',         '8 tables',                         '🗂', 'var(--accent)'],
            ['Indexes',        'owner_id, client_id, status, risk','📑', 'var(--text-secondary)'],
            ['Functions',      'update_updated_at()',               '⚙', 'var(--text-secondary)'],
            ['Triggers',       '8 (one per table)',                 '🔔', 'var(--text-secondary)'],
            ['Policies',       'Authenticated user — owner only',   '🛡', '#10b981'],
            ['Verification',   'Included',                          '✅', '#10b981'],
            ['Rollback',       'Commented section included',        '↩', '#f59e0b'],
          ].map(([label, value, icon, colour]) => (
            <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '9px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{icon} {label}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: colour }}>{value}</div>
            </div>
          ))}
        </div>

        <WarnBanner colour="#ef4444">
          Authentication integration is required before production use. These RLS policies are
          backend-ready and must be reviewed by a qualified Supabase/PostgreSQL administrator before live deployment.
        </WarnBanner>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
          padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
          <strong>SQL execution order:</strong><br />
          1. Extensions → 2. updated_at function → 3. Tables → 4. Indexes → 5. Triggers →
          6. Enable RLS → 7. Policies → 8. Verification queries → 9. Rollback notes (commented)
        </div>
      </SectionCard>

      {/* Footer ownership */}
      <div style={{
        marginTop: 24, padding: '12px 16px', textAlign: 'center', fontSize: 11,
        color: 'var(--text-muted)', borderTop: '1px solid var(--border-muted)', lineHeight: 1.8,
      }}>
        Quantum Compliance OS™ · Run 15 — Backend Connectors + Live Sync Layer ·
        Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™ ·
        Local-first fallback always active · No real backend sync in Run 15 ·
        RLS enabled in SQL setup file · No service role keys accepted.
      </div>
    </div>
  );
}
