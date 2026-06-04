/**
 * QUANTUM COMPLIANCE OS™ — ProductModeSettings.jsx
 * Run 14: Demo/Live Toggle + Data Provider Architecture
 * ======================================================
 * Product Mode Panel, Data Provider Readiness, Data Separation
 * Diagnostics, and 4P3X API Config Guard™.
 *
 * SAFETY:
 * - No real Supabase/Firebase/AWS/custom API connections
 * - No secrets or credentials stored or requested
 * - No external calls of any kind
 * - localStorage is the ONLY active provider in Run 14
 * - Mode switches do NOT delete demo or live/local records
 * - Kyzel Kreates™ / 4P3X Intelligent AI™ ownership preserved
 *
 * DATA SEPARATION:
 * - Demo Mode: all records (demo + live) visible; demo clearly labelled
 * - Live Local Mode: demo records hidden; live records shown
 * - No records are ever deleted on mode switch
 *
 * DISCLAIMER:
 * Data separation status is a product safeguard and does not guarantee
 * legal or regulatory compliance. Risk scores and recommendations are
 * advisory and require qualified human review.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect } from 'react';
import PageHeader   from '../components/PageHeader.jsx';
import SectionCard  from '../components/SectionCard.jsx';
import {
  getState, subscribe, updateSettings, setWorkspaceMode,
} from '../core/storage.js';
import { getConsultantState, subscribeConsultant } from '../core/consultantStorage.js';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';
import {
  PRODUCT_MODE, PRODUCT_MODE_META, DATA_PROVIDERS, DATA_PROVIDER_ORDER,
  DATA_PROVIDER_ID, getDefaultProductModeSettings,
  getProductModeFromState, isDemoProductMode, isLiveLocalMode,
  getActiveDataProvider, getAvailableDataProviders, canUseProvider,
  getDataSeparationStatus, getModeStatusMessage,
  validateDemoLiveSeparation, getProviderReadinessSummary,
  API_CONFIG_GUARD,
} from '../core/dataProviders.js';

// ─── Small helper components ──────────────────────────────────────────────────

function StatusPill({ status, colour }) {
  const colours = {
    active:       { bg: 'rgba(16,185,129,0.12)', fg: '#10b981', border: 'rgba(16,185,129,0.3)' },
    placeholder:  { bg: 'rgba(107,114,128,0.08)', fg: '#6b7280', border: 'rgba(107,114,128,0.25)' },
    safe:         { bg: 'rgba(16,185,129,0.12)', fg: '#10b981', border: 'rgba(16,185,129,0.3)' },
    warning:      { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    'needs-review':{ bg: 'rgba(239,68,68,0.10)', fg: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  };
  const c = colours[status] || colours.placeholder;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {status}
    </span>
  );
}

function CapBadge({ yes }) {
  return (
    <span style={{ fontSize: 11, color: yes ? '#10b981' : '#6b7280', fontWeight: 600 }}>
      {yes ? '✅' : '—'}
    </span>
  );
}

function DiagnosticRow({ label, value, colour, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
      borderBottom: '1px solid var(--border-muted)',
    }}>
      <span style={{ fontSize: 15, width: 22, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: colour || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductModeSettings component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductModeSettings({ workspaceMode }) {
  const [mainState, setMainState] = useState(() => getState());
  const [cs,        setCs]        = useState(() => getConsultantState());
  const [savedMsg,  setSavedMsg]  = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [pendingMode, setPendingMode] = useState(null);

  useEffect(() => {
    const unsubM = subscribe(setMainState);
    const unsubC = subscribeConsultant(setCs);
    return () => { unsubM(); unsubC(); };
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const currentMode      = getProductModeFromState(mainState);
  const isDemo           = isDemoProductMode(mainState);
  const isLive           = isLiveLocalMode(mainState);
  const activeProvider   = getActiveDataProvider(mainState);
  const modeMeta         = PRODUCT_MODE_META[currentMode] || PRODUCT_MODE_META[PRODUCT_MODE.DEMO];
  const modeMsg          = getModeStatusMessage(mainState);
  const providerSummary  = getProviderReadinessSummary();
  const validationResult = validateDemoLiveSeparation(cs.clients, cs.reports, cs.evidenceItems);

  // Separation diagnostics
  const diagData = getDataSeparationStatus(
    cs.clients, cs.reports, cs.evidenceItems, cs.snapshots, mainState
  );

  // ── Mode switch ───────────────────────────────────────────────────────────
  function requestModeSwitch(newMode) {
    if (newMode === currentMode) return;
    const confirmText = newMode === PRODUCT_MODE.DEMO
      ? 'Live/local records are preserved. Demo records will be shown for presentation.'
      : 'Demo records will be hidden from the live workspace. They are not deleted.';
    setConfirmMsg(confirmText);
    setPendingMode(newMode);
  }

  function confirmModeSwitch() {
    if (!pendingMode) return;
    // Map Run 14 mode to Run 8.5 workspaceMode for backward compatibility
    const wm = pendingMode === PRODUCT_MODE.DEMO ? WORKSPACE_MODE.DEMO : WORKSPACE_MODE.PRODUCT;
    setWorkspaceMode(wm);
    // Also persist productModeSettings via updateSettings
    updateSettings({
      productMode: pendingMode,
      activeDataProvider: DATA_PROVIDER_ID.LOCAL_STORAGE,
    });
    setSavedMsg(`Product mode updated to ${PRODUCT_MODE_META[pendingMode]?.label || pendingMode}.`);
    setTimeout(() => setSavedMsg(''), 3500);
    setConfirmMsg('');
    setPendingMode(null);
  }

  function cancelModeSwitch() {
    setConfirmMsg('');
    setPendingMode(null);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Product Mode & Data Providers"
        subtitle="Quantum Compliance OS™ · Powered by 4P3X Intelligent AI™"
      />

      {savedMsg && (
        <div style={{
          marginBottom: 16, padding: '8px 14px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: '#10b981', fontWeight: 600,
        }}>
          ✅ {savedMsg}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmMsg && pendingMode && (
        <div style={{
          marginBottom: 16, padding: '12px 16px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600, marginBottom: 6 }}>
            ⚠ Switching to {PRODUCT_MODE_META[pendingMode]?.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {confirmMsg}
            <br />
            <strong style={{ display: 'block', marginTop: 4 }}>
              Switching modes changes which records are visible. It does not delete demo or live data.
            </strong>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={confirmModeSwitch} style={{
              fontSize: 12, padding: '5px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)',
              color: '#f59e0b', cursor: 'pointer', fontWeight: 700,
            }}>
              Confirm Switch
            </button>
            <button onClick={cancelModeSwitch} style={{
              fontSize: 12, padding: '5px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 1. Current Mode Status Banner                                        */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: 18, padding: '12px 18px',
        background: modeMeta.bg, border: `1px solid ${modeMeta.border}`,
        borderRadius: 'var(--radius-md)', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 28 }}>{modeMeta.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: modeMeta.colour, marginBottom: 3 }}>
            {modeMeta.label} · {activeProvider.icon} {activeProvider.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {modeMsg}
          </div>
        </div>
        <StatusPill status={isDemo ? 'demo' : 'active'} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 2. Product Mode Panel                                                */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Product Mode" icon="🔀">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7,
          padding: '8px 12px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 'var(--radius-sm)' }}>
          <strong style={{ color: 'var(--accent)' }}>
            Demo Mode shows the product. Live Mode runs the product. Backend connection scales it into a live SaaS platform.
          </strong>
          {' '}Backend connectors, live sync, audit trails, and real-time team access are reserved for Run 15 and later.
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          {[PRODUCT_MODE.DEMO, PRODUCT_MODE.LIVE_LOCAL].map((mode) => {
            const meta    = PRODUCT_MODE_META[mode];
            const active  = currentMode === mode;
            return (
              <button key={mode} onClick={() => requestModeSwitch(mode)} style={{
                flex: '1 1 220px', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
                background: active ? meta.bg : 'var(--bg-secondary)',
                border: `2px solid ${active ? meta.colour : 'var(--border-default)'}`,
                cursor: active ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: active ? meta.colour : 'var(--text-primary)' }}>
                    {meta.label}
                  </span>
                  {active && <StatusPill status="active" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {meta.description}
                </div>
              </button>
            );
          })}

          {/* Backend Ready — locked */}
          <div style={{
            flex: '1 1 220px', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.2)',
            opacity: 0.7,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>☁️</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-muted)' }}>
                Backend Ready Mode
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)', color: '#6b7280' }}>
                Run 15
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {PRODUCT_MODE_META[PRODUCT_MODE.LIVE_BACKEND_READY].description}
            </div>
          </div>
        </div>

        {/* Mode detail rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8, marginBottom: 10 }}>
          {[
            ['Current Mode',    modeMeta.label,                                            modeMeta.colour],
            ['Demo Data',       isDemo ? 'Visible' : 'Hidden (preserved)',                 isDemo ? '#f59e0b' : '#6b7280'],
            ['Live Records',    isLive ? 'Active' : 'Will show when added',                '#10b981'],
            ['Active Provider', `${activeProvider.icon} ${activeProvider.name}`,          'var(--accent)'],
            ['Offline Support', 'Yes (localStorage)',                                       '#10b981'],
            ['Sync/Realtime',   'Not in Run 14 — reserved for Run 15',                    '#6b7280'],
          ].map(([label, value, colour]) => (
            <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colour || 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Empty live workspace state */}
        {isLive && diagData.liveClients === 0 && (
          <div style={{
            marginTop: 12, padding: '16px', textAlign: 'center',
            background: 'rgba(16,185,129,0.04)', border: '1px dashed rgba(16,185,129,0.25)',
            borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🟢</div>
            <strong style={{ color: '#10b981', display: 'block', marginBottom: 4 }}>Live Product Mode is active.</strong>
            No live clients have been added yet. Add a client in the Client Hub to begin using Quantum Compliance OS™ as a local live product.
          </div>
        )}

        {/* Demo workspace state */}
        {isDemo && (
          <div style={{
            marginTop: 12, padding: '12px 16px',
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            🎯 <strong style={{ color: '#f59e0b' }}>Demo Mode is active.</strong>{' '}
            Sample clients, reports, evidence, and analytics are shown for presentation and testing.
            Switch to Live Product Mode to hide demo records and use the platform with real local data.
          </div>
        )}
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 3. Data Provider Readiness Panel                                     */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Data Provider Readiness" icon="🔌">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
          {providerSummary.active} of {providerSummary.total} providers active ·{' '}
          {providerSummary.planned} reserved for future backend connector runs.
          Backend connectors, live sync, audit trails, and real-time team access are reserved for Run 15 and later.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DATA_PROVIDER_ORDER.map((providerId) => {
            const p = DATA_PROVIDERS[providerId];
            const isActive = p.status === 'active';
            return (
              <div key={p.id} style={{
                background: isActive ? 'rgba(16,185,129,0.04)' : 'var(--bg-tertiary)',
                border: `1px solid ${isActive ? 'rgba(16,185,129,0.25)' : 'var(--border-muted)'}`,
                borderRadius: 'var(--radius-md)', padding: '12px 16px',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#10b981' : 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                      <StatusPill status={p.status} />
                      {p.futureRun && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 999,
                          background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
                          {p.futureRun}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>
                      {p.description}
                    </div>
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                      {[
                        ['Offline', p.supportsOffline],
                        ['Sync',    p.supportsSync],
                        ['Realtime',p.supportsRealtime],
                        ['Configured', p.configured],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CapBadge yes={val} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!isActive && (
                    <div style={{ flexShrink: 0 }}>
                      <div style={{
                        fontSize: 11, padding: '5px 12px', borderRadius: 'var(--radius-md)',
                        background: 'rgba(107,114,128,0.06)', border: '1px solid rgba(107,114,128,0.2)',
                        color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4,
                        maxWidth: 200,
                      }}>
                        🔒 Reserved for {p.futureRun || 'a future run'}
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div style={{ flexShrink: 0 }}>
                      <div style={{
                        fontSize: 11, padding: '5px 12px', borderRadius: 'var(--radius-md)',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981', fontWeight: 700,
                      }}>
                        ✅ Active Provider
                      </div>
                    </div>
                  )}
                </div>
                {!isActive && p.activationNote && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic',
                    borderTop: '1px solid var(--border-muted)', paddingTop: 8 }}>
                    {p.activationNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 4. Data Separation Diagnostics                                       */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Data Separation Diagnostics" icon="🔍">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
          Data separation status is a product safeguard and does not guarantee legal or regulatory compliance.
          Demo records (isDemo: true) are hidden in Live Product Mode but are never deleted.
        </div>

        {/* Separation status badge */}
        <div style={{
          marginBottom: 14, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center',
          background: diagData.separationStatus === 'safe' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${diagData.separationStatus === 'safe' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontSize: 20 }}>{diagData.separationStatus === 'safe' ? '✅' : '⚠'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700,
              color: diagData.separationStatus === 'safe' ? '#10b981' : '#f59e0b' }}>
              Separation: <StatusPill status={diagData.separationStatus} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
              {diagData.separationNote}
            </div>
          </div>
        </div>

        {/* Validation warnings */}
        {validationResult.hasWarnings && (
          <div style={{ marginBottom: 14 }}>
            {validationResult.warnings.map((w, i) => (
              <div key={i} style={{
                padding: '6px 12px', marginBottom: 6,
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-sm)', fontSize: 11, color: '#ef4444',
              }}>
                ⚠ {w}
              </div>
            ))}
          </div>
        )}

        {/* Diagnostic rows */}
        <DiagnosticRow label="Current Mode"           value={PRODUCT_MODE_META[diagData.currentMode]?.label || diagData.currentMode} icon="🔀" colour={PRODUCT_MODE_META[diagData.currentMode]?.colour} />
        <DiagnosticRow label="Active Data Provider"   value={diagData.activeProvider}         icon="💾" colour="var(--accent)" />
        <DiagnosticRow label="Total Clients"          value={diagData.totalClients}            icon="👥" />
        <DiagnosticRow label="Demo Clients"           value={diagData.demoClients}             icon="🎯" colour="#f59e0b" />
        <DiagnosticRow label="Live/Local Clients"     value={diagData.liveClients}             icon="🟢" colour="#10b981" />
        <DiagnosticRow label="Visible Clients"        value={diagData.visibleClients}          icon="👁" colour="var(--accent)" />
        {diagData.hiddenDemoClients > 0 && (
          <DiagnosticRow label="Hidden Demo Clients (live mode)" value={diagData.hiddenDemoClients} icon="🙈" colour="#6b7280" />
        )}
        <DiagnosticRow label="Total Reports"          value={diagData.totalReports}            icon="📄" />
        <DiagnosticRow label="Demo Reports"           value={diagData.demoReports}             icon="🎯" colour="#f59e0b" />
        <DiagnosticRow label="Live/Local Reports"     value={diagData.liveReports}             icon="🟢" colour="#10b981" />
        <DiagnosticRow label="Total Evidence Items"   value={diagData.totalEvidence}           icon="📂" />
        <DiagnosticRow label="Demo Evidence"          value={diagData.demoEvidence}            icon="🎯" colour="#f59e0b" />
        <DiagnosticRow label="Live/Local Evidence"    value={diagData.liveEvidence}            icon="🟢" colour="#10b981" />
        <DiagnosticRow label="Total Snapshots"        value={diagData.totalSnapshots}          icon="📈" />
        <DiagnosticRow label="Demo Snapshots"         value={diagData.demoSnapshots}           icon="🎯" colour="#f59e0b" />
        <DiagnosticRow label="Live/Local Snapshots"   value={diagData.liveSnapshots}           icon="🟢" colour="#10b981" />
        <DiagnosticRow label="Total Demo Records"     value={diagData.totalDemoRecords}        icon="📦" colour="#f59e0b" />
        <DiagnosticRow label="Total Live Records"     value={diagData.totalLiveRecords}        icon="🏭" colour="#10b981" />

        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Load demo data from the Client Hub to see populated diagnostics.
          Live/local records are created by adding clients and data in Live Product Mode.
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 5. 4P3X API Config Guard™                                           */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="4P3X API Config Guard™" icon="🛡">
        <div style={{
          marginBottom: 14, padding: '10px 14px',
          background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#D4AF37', marginBottom: 4 }}>
            {API_CONFIG_GUARD.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {API_CONFIG_GUARD.purpose}
          </div>
        </div>

        {/* Rules */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Security Rules
          </div>
          {API_CONFIG_GUARD.rules.map((rule, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '6px 0',
              borderBottom: '1px solid var(--border-muted)',
            }}>
              <span style={{ color: '#10b981', flexShrink: 0, fontSize: 12 }}>✓</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rule}</span>
            </div>
          ))}
        </div>

        {/* Blocked from frontend */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🚫 Blocked from Frontend Code
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {API_CONFIG_GUARD.blockedFromFrontend.map((key, i) => (
              <span key={i} style={{
                fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
                padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
              }}>
                {key}
              </span>
            ))}
          </div>
        </div>

        {/* Safe in frontend */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ✅ Safe in Frontend (public keys only)
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {API_CONFIG_GUARD.safeInFrontend.map((key, i) => (
              <span key={i} style={{
                fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
                padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                color: '#10b981',
              }}>
                {key}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          padding: '10px 14px',
          background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.15)',
          borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
        }}>
          <strong>Disclaimer:</strong> {API_CONFIG_GUARD.disclaimer}
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 6. Backend Future Notice                                             */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Backend Connectors — Coming in Run 15" icon="🔮">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.7 }}>
          Backend connectors, live sync, audit trails, and real-time team access are reserved for Run 15 and later.
          This architecture foundation ensures Run 15 can safely add backend providers without breaking existing features.
        </div>
        {[
          ['☁ Supabase Connector',     'Run 15 — Realtime PostgreSQL + RLS + Auth'],
          ['🔥 Firebase Connector',     'Run 15 — Firestore realtime document sync'],
          ['☁️ AWS / Amplify',          'Future run — Enterprise backend option'],
          ['🔌 Custom REST API',         'Future run — Bring-your-own backend'],
          ['🔄 Live Sync Queue',         'Future run — Conflict resolution and sync'],
          ['👥 Team Permissions',        'Future run — Multi-user access control'],
          ['📊 Real-time Analytics',     'Future run — Live portfolio tracking'],
          ['🔐 Verified Audit Trails',   'Future run — Immutable audit log storage'],
        ].map(([label, note]) => (
          <div key={label} style={{
            display: 'flex', gap: 10, padding: '9px 0',
            borderBottom: '1px solid var(--border-muted)', fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: 220 }}>{label}</span>
            <span>{note}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Live Local Mode stores real/local records in this browser until a backend provider is connected in a future run.
          No backend sync is active in Run 14.
        </div>
      </SectionCard>

      {/* Footer ownership — always preserved */}
      <div style={{
        marginTop: 24, padding: '12px 16px', textAlign: 'center', fontSize: 11,
        color: 'var(--text-muted)', borderTop: '1px solid var(--border-muted)', lineHeight: 1.8,
      }}>
        Quantum Compliance OS™ · Run 14 — Demo/Live Toggle + Data Provider Architecture ·
        Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™ ·
        Local-first · No backend · No Supabase · No real sync active ·
        localStorage is the only active provider in this run.
      </div>
    </div>
  );
}
