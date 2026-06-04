/**
 * QUANTUM COMPLIANCE OS™ — AgencySettings.jsx
 * Run 13: Agency + White Label Settings
 * =========================================
 * Agency profile, branding controls, white-label settings foundation,
 * portfolio analytics preview, client archive management, custom domain
 * placeholder, onboarding wizard placeholder, and SLA/support placeholder.
 *
 * SAFETY:
 * - No backend / Supabase / Firebase / OpenAI
 * - No real payments
 * - No real custom domain connection
 * - No real SLA support activation
 * - No offensive scanning
 * - No raw localStorage access — all state via consultantStorage.js SSOT
 * - No duplicate state store
 * - All agency/white-label data is local/demo-safe
 * - Kyzel Kreates™ / 4P3X Intelligent AI™ ownership preserved
 *
 * BRANDING PROTECTION:
 * Internal platform areas always preserve:
 *   Quantum Compliance OS™ — Powered by 4P3X Intelligent AI™ Created by Kyzel Kreates™
 * White-label preview areas may show agency name/colours as a preview only.
 * No irreversible global brand changes are made in this run.
 *
 * DISCLAIMER:
 * White-label settings control presentation only in this run and do not create
 * certified compliance outputs. Risk scores and recommendations are advisory
 * and require qualified human review.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect } from 'react';
import PageHeader   from '../components/PageHeader.jsx';
import SectionCard  from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import { getConsultantState, subscribeConsultant, setConsultantState, getClientsFromState, restoreClient } from '../core/consultantStorage.js';
import { getState, subscribe } from '../core/storage.js';
import { canUseFeature, FEATURE_KEYS, getPlanById } from '../core/plans.js';
import {
  getDefaultAgencySettings,
  getDefaultWhiteLabelSettings,
  getAgencyTierStatus,
  getWhiteLabelPreviewSettings,
  getAgencyPortfolioSummary,
  getArchivedClientCount,
} from '../core/agencyHelpers.js';

// ─── Onboarding steps ─────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { id: 1, label: 'Set agency profile',             done: true,  note: 'Add your agency name, contact details, and sector focus.' },
  { id: 2, label: 'Configure branding',             done: true,  note: 'Set primary, secondary, and accent colours for client-facing materials.' },
  { id: 3, label: 'Add first client',               done: true,  note: 'Create a client workspace in the Multi-Client Hub.' },
  { id: 4, label: 'Review evidence requirements',   done: true,  note: 'Assign evidence items to clients and track completion.' },
  { id: 5, label: 'Generate first report',          done: true,  note: 'Use the report history panel to record and review assessment reports.' },
  { id: 6, label: 'Configure backend',              done: false, note: 'Reserved for a future run — backend sync and live data persistence.', future: true },
  { id: 7, label: 'Configure AI agents',            done: false, note: 'Reserved for a future run — AI-assisted consultant insights.', future: true },
  { id: 8, label: 'Prepare white-label deployment', done: false, note: 'Reserved for a future run — full white-label hosting and custom domain.', future: true },
];

// ─── Locked feature pill ──────────────────────────────────────────────────────
function LockedPill({ label }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.25)',
      color: '#6b7280', marginLeft: 6,
    }}>
      🔒 {label}
    </span>
  );
}

// ─── Locked feature row ───────────────────────────────────────────────────────
function LockedRow({ icon, label, reason }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.15)',
      borderRadius: 'var(--radius-md)', marginBottom: 6,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{reason}</div>
      </div>
      <LockedPill label="Coming Soon" />
    </div>
  );
}

// ─── Feature indicator row ────────────────────────────────────────────────────
function FeatureRow({ icon, label, enabled, lockedNote }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
      borderBottom: '1px solid var(--border-muted)',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
      {enabled
        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>✅ Preview Active</span>
        : <LockedPill label={lockedNote || 'Upgrade Required'} />
      }
    </div>
  );
}

// ─── Score metric tile ────────────────────────────────────────────────────────
function MetricTile({ label, value, colour, icon }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      textAlign: 'center', flex: '1 1 110px',
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{icon} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: colour || 'var(--text-primary)' }}>{value ?? '—'}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AgencySettings page
// ─────────────────────────────────────────────────────────────────────────────
export default function AgencySettings({ workspaceMode }) {
  const [cs,        setCs]        = useState(() => getConsultantState());
  const [mainState, setMainState] = useState(() => getState());
  const [savedMsg,  setSavedMsg]  = useState('');

  useEffect(() => {
    const unsubC = subscribeConsultant(setCs);
    const unsubM = subscribe(setMainState);
    return () => { unsubC(); unsubM(); };
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const activePlanId   = mainState?.settings?.activePlanId || 'starter';
  const tierStatus     = getAgencyTierStatus(activePlanId);
  const agencySettings = cs.agencySettings       || getDefaultAgencySettings();
  const wlSettings     = cs.whiteLabelSettings   || getDefaultWhiteLabelSettings();
  const wlPreview      = getWhiteLabelPreviewSettings(wlSettings, agencySettings);
  const allClients     = cs.clients              || [];
  const reports        = cs.reports              || [];
  const evidenceItems  = cs.evidenceItems        || [];
  const archivedClients = allClients.filter((c) => c.archived || c.status === 'archived');
  const portfolio      = getAgencyPortfolioSummary(allClients, reports, evidenceItems);
  const isDemo         = workspaceMode === 'demo';

  // ── Agency settings local edit state ─────────────────────────────────────
  const [agEdit, setAgEdit] = useState(null); // null = view, object = editing
  const [wlEdit, setWlEdit] = useState(null);

  function startEditAgency()    { setAgEdit({ ...agencySettings }); }
  function cancelEditAgency()   { setAgEdit(null); }
  function startEditWhiteLabel(){ setWlEdit({ ...wlSettings }); }
  function cancelEditWhiteLabel(){ setWlEdit(null); }

  function saveAgency() {
    setConsultantState((s) => ({
      ...s,
      agencySettings: { ...agEdit, updatedAt: new Date().toISOString().slice(0, 10) },
    }));
    setAgEdit(null);
    setSavedMsg('Agency settings saved successfully.');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function saveWhiteLabel() {
    setConsultantState((s) => ({
      ...s,
      whiteLabelSettings: { ...wlEdit, updatedAt: new Date().toISOString().slice(0, 10) },
    }));
    setWlEdit(null);
    setSavedMsg('White Label settings saved successfully.');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function handleRestoreClient(clientId) {
    restoreClient(clientId);
    setSavedMsg('Client restored successfully.');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  const field = (label, key, editState, setEditState, opts = {}) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
        {label}
      </label>
      {opts.readOnly ? (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '6px 0' }}>
          {editState[key] || '—'}
        </div>
      ) : (
        <input
          type={opts.type || 'text'}
          value={editState[key] || ''}
          onChange={(e) => setEditState((s) => ({ ...s, [key]: e.target.value }))}
          className="form-input"
          style={{ width: '100%', ...(opts.style || {}) }}
          placeholder={opts.placeholder || ''}
        />
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Agency & White Label Settings"
        subtitle="Quantum Compliance OS™ · Powered by 4P3X Intelligent AI™"
      />

      {/* Saved message */}
      {savedMsg && (
        <div style={{
          marginBottom: 16, padding: '8px 14px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 'var(--radius-md)', fontSize: 13, color: '#10b981', fontWeight: 600,
        }}>
          ✅ {savedMsg}
        </div>
      )}

      {/* Plan status banner */}
      <div style={{
        marginBottom: 18, padding: '10px 16px',
        background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--accent)' }}>Current Plan: {tierStatus.planName}</strong>
        {' · '}Agency Settings Foundation — Run 13 · Local/demo-safe · No backend active.
        {' '}Demo Mode shows the product. Live Mode runs the product. Backend connection will scale
        {' '}agency settings, white-label configuration, and client data into a live SaaS platform in a future run.
      </div>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 1. Agency Profile Panel                                              */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Agency Profile" icon="🏢">
        {agEdit ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
              {field('Agency Name',         'agencyName',         agEdit, setAgEdit)}
              {field('Display Name',        'agencyDisplayName',  agEdit, setAgEdit)}
              {field('Contact Name',        'agencyContactName',  agEdit, setAgEdit)}
              {field('Contact Email',       'agencyContactEmail', agEdit, setAgEdit, { type: 'email' })}
              {field('Website',             'agencyWebsite',      agEdit, setAgEdit, { placeholder: 'https://' })}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                Sector Focus (comma-separated)
              </label>
              <input
                type="text"
                value={(agEdit.agencySectorFocus || []).join(', ')}
                onChange={(e) => setAgEdit((s) => ({ ...s, agencySectorFocus: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) }))}
                className="form-input"
                style={{ width: '100%' }}
                placeholder="SMEs, Manufacturing, Healthcare..."
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={saveAgency} className="btn btn-primary" style={{ fontSize: 13 }}>Save Agency Settings</button>
              <button onClick={cancelEditAgency} className="btn" style={{ fontSize: 13, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10, marginBottom: 14 }}>
              {[
                ['Agency Name',    agencySettings.agencyName],
                ['Display Name',   agencySettings.agencyDisplayName],
                ['Contact Name',   agencySettings.agencyContactName],
                ['Contact Email',  agencySettings.agencyContactEmail],
                ['Website',        agencySettings.agencyWebsite || '—'],
                ['Client Limit',   `${agencySettings.clientLimit} workspaces`],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Sector Focus</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(agencySettings.agencySectorFocus || []).map((s) => (
                  <span key={s} style={{
                    fontSize: 11, padding: '2px 10px', borderRadius: 999,
                    background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                    color: '#D4AF37', fontWeight: 600,
                  }}>{s}</span>
                ))}
              </div>
            </div>
            {isDemo && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10 }}>
                ℹ Demo agency profile — edit to customise for your agency.
              </div>
            )}
            <button onClick={startEditAgency} className="btn btn-primary" style={{ fontSize: 13 }}>Edit Agency Profile</button>
          </div>
        )}
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 2. Agency Branding Controls                                          */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Agency Branding Controls" icon="🎨">
        {agEdit ? (
          <div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
              {[
                ['Primary Colour',   'agencyPrimaryColor'],
                ['Secondary Colour', 'agencySecondaryColor'],
                ['Accent Colour',    'agencyAccentColor'],
              ].map(([label, key]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, minWidth: 120 }}>{label}</label>
                  <input
                    type="color"
                    value={agEdit[key] || '#000000'}
                    onChange={(e) => setAgEdit((s) => ({ ...s, [key]: e.target.value }))}
                    style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }}
                  />
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{agEdit[key]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              {field('Agency Logo URL', 'agencyLogoUrl', agEdit, setAgEdit, { placeholder: 'https://... (reserved for future run with file storage)' })}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Logo file upload is reserved for a future run with backend file storage. URL-based logo is accepted.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={saveAgency} className="btn btn-primary" style={{ fontSize: 13 }}>Save Branding</button>
              <button onClick={cancelEditAgency} className="btn" style={{ fontSize: 13, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
              {[
                ['Primary',   agencySettings.agencyPrimaryColor],
                ['Secondary', agencySettings.agencySecondaryColor],
                ['Accent',    agencySettings.agencyAccentColor],
              ].map(([label, colour]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: colour, border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600 }}>{colour}</div>
                  </div>
                </div>
              ))}
            </div>
            {agencySettings.agencyLogoUrl ? (
              <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Logo URL: <span style={{ color: 'var(--accent)' }}>{agencySettings.agencyLogoUrl}</span>
              </div>
            ) : (
              <div style={{ marginBottom: 10, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No logo URL set. File upload reserved for a future run.
              </div>
            )}
            <button onClick={startEditAgency} className="btn btn-primary" style={{ fontSize: 13 }}>Edit Branding</button>
          </div>
        )}
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 3. White Label Settings                                              */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="White Label Settings" icon="🏷️">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px',
          background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 'var(--radius-sm)', lineHeight: 1.7 }}>
          White-label settings control presentation only in this run and do not create certified compliance outputs.
          Full white-label mode requires backend connection — reserved for a future run.
          <strong style={{ display: 'block', marginTop: 4, color: 'var(--text-secondary)' }}>
            Internal platform areas always preserve: Quantum Compliance OS™ — Powered by 4P3X Intelligent AI™ Created by Kyzel Kreates™
          </strong>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          {[
            ['Mode',                   wlSettings.mode],
            ['Public Product Name',    wlSettings.publicProductName],
            ['Custom Domain',          wlSettings.customDomainReady ? (wlSettings.customDomainValue || 'Not set') : 'Not configured'],
            ['Show Kyzel Branding',    wlSettings.showKyzelBrandingInReports ? 'Yes (protected)' : 'Hidden in reports'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '10px 14px', flex: '1 1 180px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        <FeatureRow icon="🏷️" label="White-Label Reports"       enabled={tierStatus.hasWhiteLabelReports}  lockedNote="Agency tier" />
        <FeatureRow icon="🌐" label="Full White-Label Mode"     enabled={tierStatus.hasFullWhiteLabel}     lockedNote="White Label tier" />
        <FeatureRow icon="🔗" label="Custom Domain Ready"       enabled={tierStatus.hasCustomDomain}       lockedNote="White Label tier" />
        <FeatureRow icon="🧭" label="Onboarding Wizard"         enabled={tierStatus.hasOnboardingWizard}   lockedNote="White Label tier" />
        <FeatureRow icon="🎯" label="SLA Support Layer"         enabled={tierStatus.hasSlaSupportLayer}    lockedNote="White Label tier" />

        {wlEdit ? (
          <div style={{ marginTop: 14 }}>
            {field('Public Product Name',    'publicProductName',     wlEdit, setWlEdit)}
            {field('Support Email',          'supportEmail',           wlEdit, setWlEdit, { type: 'email', placeholder: 'support@youragency.com' })}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                Show Kyzel Kreates™ Branding in Reports
              </label>
              <select value={wlEdit.showKyzelBrandingInReports ? 'yes' : 'no'}
                onChange={(e) => setWlEdit((s) => ({ ...s, showKyzelBrandingInReports: e.target.value === 'yes' }))}
                className="form-input">
                <option value="yes">Yes — always show (recommended)</option>
                <option value="no">No — hide in client-facing reports (requires White Label tier)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={saveWhiteLabel} className="btn btn-primary" style={{ fontSize: 13 }}>Save White Label Settings</button>
              <button onClick={cancelEditWhiteLabel} className="btn" style={{ fontSize: 13, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={startEditWhiteLabel} className="btn" style={{ marginTop: 14, fontSize: 13, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
            Edit White Label Settings
          </button>
        )}
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 4. Report Branding Preview                                           */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Report Branding Preview" icon="📋">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          Preview of how a client-facing report header/footer may appear with agency branding applied.
          This is a visual preview only — no reports are generated in this panel.
        </div>
        <div style={{
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          background: 'var(--bg-tertiary)',
        }}>
          {/* Report header */}
          <div style={{
            background: `linear-gradient(135deg, ${agencySettings.agencyPrimaryColor}18, ${agencySettings.agencyAccentColor}12)`,
            borderBottom: `2px solid ${agencySettings.agencyPrimaryColor}44`,
            padding: '18px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: agencySettings.agencyPrimaryColor, marginBottom: 3 }}>
                  {wlSettings.enabled ? agencySettings.agencyDisplayName : wlSettings.publicProductName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {wlSettings.publicBrandLine}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Prepared for</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>[ Client Organisation ]</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>
          </div>
          {/* Report body preview */}
          <div style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Quantum Readiness Assessment — Initial Review
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 20px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>⚛ Quantum Readiness</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6' }}>—%</div>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 20px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>🛡 Security Score</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>—%</div>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 20px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>📂 Evidence Completion</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#f97316' }}>—%</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              [ Report summary and recommendations would appear here in a generated report ]
            </div>
          </div>
          {/* Report footer */}
          <div style={{
            borderTop: `1px solid ${agencySettings.agencyPrimaryColor}22`,
            padding: '10px 24px',
            background: 'var(--bg-secondary)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {wlPreview.reportFooter}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Prepared by {agencySettings.agencyContactName} · {agencySettings.agencyContactEmail}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Full report export and PDF generation are reserved for a future upgrade run.
          Ownership line is always preserved on client-facing materials in this run.
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 5. Portfolio Analytics Preview                                       */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Portfolio Analytics Preview" icon="📊">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.7 }}>
          Aggregated analytics from local/demo client, report, and evidence data.
          No backend required. Live backend analytics are reserved for a future run.
        </div>
        {!tierStatus.hasPortfolioAnalytics && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(107,114,128,0.06)', border: '1px solid rgba(107,114,128,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
            🔒 Full portfolio analytics are part of the Agency upgrade path and are prepared for a future run. Preview data shown below.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <MetricTile label="Total Clients"    value={portfolio.totalClients}            colour="var(--accent)" icon="👥" />
          <MetricTile label="Active"           value={portfolio.activeClients}           colour="#10b981"       icon="✅" />
          <MetricTile label="Archived"         value={portfolio.archivedClients}         colour="#6b7280"       icon="📦" />
          <MetricTile label="High Risk"        value={portfolio.highRiskClients}         colour="#ef4444"       icon="🔴" />
          <MetricTile label="Avg Quantum"      value={portfolio.avgQuantumScore   != null ? `${portfolio.avgQuantumScore}%`   : '—'} colour="#8b5cf6" icon="⚛" />
          <MetricTile label="Avg Security"     value={portfolio.avgSecurityScore  != null ? `${portfolio.avgSecurityScore}%`  : '—'} colour="#3b82f6" icon="🛡" />
          <MetricTile label="Avg Evidence"     value={portfolio.avgEvidenceCompletion != null ? `${portfolio.avgEvidenceCompletion}%` : '—'} colour="#f97316" icon="📂" />
          <MetricTile label="Total Reports"    value={portfolio.totalReports}            colour="#D4AF37"       icon="📄" />
          <MetricTile label="Missing Evidence" value={portfolio.missingEvidenceItems}    colour="#ef4444"       icon="❌" />
          <MetricTile label="Priority Actions" value={portfolio.priorityActionCount}     colour="#f97316"       icon="⚡" />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Analytics are calculated from local/demo data. Load demo data from the Client Hub to see sample metrics.
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 6. Client Archive Management                                         */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Client Archive Management" icon="📦">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.7 }}>
          Archived clients are hidden from active workflows but preserved for history and reporting.
          Archive preserves client history. Permanent deletion is not included in this run.
        </div>
        {!tierStatus.hasClientArchive && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(107,114,128,0.06)', border: '1px solid rgba(107,114,128,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
            🔒 Enhanced archive management is part of the Agency upgrade path and is prepared for a future run.
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, fontWeight: 600 }}>
          {archivedClients.length} archived client{archivedClients.length !== 1 ? 's' : ''}
        </div>
        {archivedClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 13,
            background: 'var(--bg-tertiary)', border: '1px dashed var(--border-muted)', borderRadius: 'var(--radius-lg)' }}>
            No archived clients. Archive a client from the Client Hub to preserve their history.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {archivedClients.map((client) => {
              const rColour = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' }[client.riskLevel] || '#6b7280';
              return (
                <div key={client.id} style={{
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-md)', padding: '12px 16px',
                  display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{client.name}</span>
                      {client.riskLevel && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                          background: `${rColour}18`, color: rColour, border: `1px solid ${rColour}44` }}>
                          {client.riskLevel.charAt(0).toUpperCase() + client.riskLevel.slice(1)} Risk
                        </span>
                      )}
                      {client.isDemo && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                          background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
                          Demo
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {client.sector && <span>{client.sector}</span>}
                      {client.lastAssessmentDate && <span>Last: {client.lastAssessmentDate}</span>}
                      {client.quantumReadinessScore != null && <span style={{ color: '#8b5cf6' }}>⚛ {client.quantumReadinessScore}%</span>}
                      {client.securityScore != null && <span style={{ color: '#3b82f6' }}>🛡 {client.securityScore}%</span>}
                    </div>
                  </div>
                  <button onClick={() => handleRestoreClient(client.id)} style={{
                    fontSize: 12, padding: '5px 14px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10b981', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    ↺ Restore
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 7. Custom Domain Placeholder                                         */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Custom Domain Readiness" icon="🌐">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, padding: '8px 12px',
          background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.15)', borderRadius: 'var(--radius-sm)', lineHeight: 1.7 }}>
          Custom domain connection is not active in this local/demo run. This panel prepares the settings structure
          for a future deployment/backend run. No DNS logic, Vercel API logic, or domain verification calls are active.
        </div>
        {[
          ['Desired Domain',    wlSettings.customDomainValue || 'Not configured',  '🌐'],
          ['Domain Status',     'Not configured',                                   '📋'],
          ['DNS Setup Status',  'Placeholder only',                                 '🔧'],
          ['SSL Status',        'Reserved for future deployment run',               '🔒'],
          ['Deployment Status', 'Reserved for future deployment run',               '🚀'],
        ].map(([label, value, icon]) => (
          <div key={label} style={{
            display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0',
            borderBottom: '1px solid var(--border-muted)', fontSize: 12,
          }}>
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{icon}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: 160 }}>{label}</span>
            <span style={{ color: 'var(--text-muted)' }}>{value}</span>
          </div>
        ))}
        <LockedRow icon="🔗" label="Activate Custom Domain" reason="Custom domain connection and DNS management are reserved for a future deployment run with backend integration." />
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 8. Onboarding Wizard Placeholder                                     */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Onboarding Wizard" icon="🧭">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
          Onboarding wizard is prepared as a future upgrade path. No automated setup is active in this run.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ONBOARDING_STEPS.map((step) => (
            <div key={step.id} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px',
              background: step.future ? 'rgba(107,114,128,0.04)' : (step.done ? 'rgba(16,185,129,0.04)' : 'var(--bg-tertiary)'),
              border: `1px solid ${step.future ? 'rgba(107,114,128,0.15)' : (step.done ? 'rgba(16,185,129,0.2)' : 'var(--border-muted)')}`,
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step.future ? 'rgba(107,114,128,0.1)' : (step.done ? 'rgba(16,185,129,0.15)' : 'var(--bg-elevated)'),
                border: `2px solid ${step.future ? 'rgba(107,114,128,0.3)' : (step.done ? '#10b981' : 'var(--border-default)')}`,
                fontSize: 11, fontWeight: 800,
                color: step.future ? '#6b7280' : (step.done ? '#10b981' : 'var(--text-muted)'),
              }}>
                {step.done ? '✓' : step.id}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: step.future ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {step.label}
                  </span>
                  {step.future && <LockedPill label="Future Run" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.note}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 9. SLA / Support Placeholder                                         */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="SLA & Support" icon="🎯">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, padding: '8px 12px',
          background: 'rgba(107,114,128,0.04)', border: '1px solid rgba(107,114,128,0.15)', borderRadius: 'var(--radius-sm)', lineHeight: 1.7 }}>
          SLA support is a commercial white-label feature reserved for a future run. No real support workflow is active yet.
        </div>
        {[
          ['Support Tier',      tierStatus.hasSlaSupportLayer ? 'White Label SLA' : 'Standard (no SLA)',  '🎯'],
          ['Support Email',     wlSettings.supportEmail || 'Not configured',                              '📧'],
          ['Response Target',   'Reserved for future run',                                                 '⏱'],
          ['Escalation Notes',  'Reserved for future run',                                                 '📋'],
          ['SLA Status',        'Not active in this run',                                                  '🔒'],
        ].map(([label, value, icon]) => (
          <div key={label} style={{
            display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0',
            borderBottom: '1px solid var(--border-muted)', fontSize: 12,
          }}>
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{icon}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: 160 }}>{label}</span>
            <span style={{ color: 'var(--text-muted)' }}>{value}</span>
          </div>
        ))}
        <LockedRow icon="🎯" label="Activate SLA Support Workflow"
          reason="SLA support layer requires backend and commercial white-label setup — reserved for a future run." />
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 10. Agency Feature Gates summary                                     */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <SectionCard title="Agency Feature Gates" icon="🔑">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          Feature availability based on current plan: <strong style={{ color: 'var(--accent)' }}>{tierStatus.planName}</strong>.
          Agency and White Label tiers are prepared for future activation.
        </div>
        <FeatureRow icon="📊" label="Portfolio Analytics"        enabled={tierStatus.hasPortfolioAnalytics} lockedNote="Agency tier" />
        <FeatureRow icon="📦" label="Client Archive Management"  enabled={tierStatus.hasClientArchive}      lockedNote="Agency tier" />
        <FeatureRow icon="⚡" label="Priority Actions Dashboard" enabled={tierStatus.hasPriorityActions}   lockedNote="Agency tier" />
        <FeatureRow icon="🏷️" label="White-Label Reports"       enabled={tierStatus.hasWhiteLabelReports}  lockedNote="Agency tier" />
        <FeatureRow icon="🌐" label="Full White-Label Mode"      enabled={tierStatus.hasFullWhiteLabel}     lockedNote="White Label tier" />
        <FeatureRow icon="🔗" label="Custom Domain"              enabled={tierStatus.hasCustomDomain}       lockedNote="White Label tier" />
        <FeatureRow icon="🧭" label="Onboarding Wizard"          enabled={tierStatus.hasOnboardingWizard}   lockedNote="White Label tier" />
        <FeatureRow icon="🎯" label="SLA Support Layer"          enabled={tierStatus.hasSlaSupportLayer}    lockedNote="White Label tier" />
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Agency features: white-label reports, client archive, portfolio analytics, priority actions.
          White Label features: full white-label mode, custom domain, onboarding wizard, SLA support layer.
        </div>
      </SectionCard>

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* Footer ownership — always preserved                                  */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 24, padding: '12px 16px', textAlign: 'center', fontSize: 11,
        color: 'var(--text-muted)', borderTop: '1px solid var(--border-muted)', lineHeight: 1.8,
      }}>
        Quantum Compliance OS™ · Run 13 — Agency + White Label Settings ·
        Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™ ·
        Local-first · No backend · No Supabase · RLS not applicable ·
        All agency/white-label settings are local/demo-safe in this run.
      </div>
    </div>
  );
}
