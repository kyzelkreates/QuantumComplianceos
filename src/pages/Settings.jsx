/**
 * QUANTUM COMPLIANCE OS™ — Settings.jsx
 * Run 8.5: Workspace Mode (Demo / Product) toggle added.
 * All storage access via storage.js and consultantStorage.js only (SSOT).
 * Defensive use only. No backend. No external calls.
 */

import React, { useState, useEffect } from 'react';
import '../styles/forms.css';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import FormField from '../components/FormField.jsx';
import ActionButton from '../components/ActionButton.jsx';
import {
  getState, subscribe, updateSettings, updateBranding,
  clearDemoData, restoreDemoData,
  loadDemoPortfolio, resetDemoPortfolio, getDemoClients,
  setWorkspaceMode, enableDemoMode, enableProductMode,
  getWorkspaceMode, clearDemoPortfolio, createCleanProductWorkspace,
  exportWorkspaceBackup,
} from '../core/storage.js';
import {
  getConsultantState, setConsultantState,
  saveClientState, deleteClientState,
} from '../core/consultantStorage.js';
import { validateHexColour, sanitiseText } from '../core/validators.js';
import { DEFENSIVE_DISCLAIMER, PAGES, APP_VERSION, APP_RUN_LEVEL } from '../core/constants.js';
import { WORKSPACE_MODE, MODE_META } from '../core/workspaceMode.js';
import PlanCards from '../components/PlanCards.jsx';

// ─── WorkspaceModeBadge ───────────────────────────────────────────────────────
function WorkspaceModeBadge({ mode, size = 'md' }) {
  const meta = MODE_META[mode] || MODE_META[WORKSPACE_MODE.DEMO];
  const big = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: big ? '6px 16px' : '3px 10px',
      background: meta.bg, border: `1px solid ${meta.border}`,
      borderRadius: '999px', fontSize: big ? '13px' : '11px',
      fontWeight: 700, color: meta.colour, letterSpacing: '0.3px',
    }}>
      {meta.icon} {meta.label}
    </span>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ isOpen, title, body, confirmLabel, variant = 'danger', onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(4px)', padding: '16px' }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '480px', maxWidth: '100%' }}>
        <h3 style={{ marginBottom: '12px' }}>{title}</h3>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>{body}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
          <ActionButton variant={variant} onClick={onConfirm}>{confirmLabel}</ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings({ onNavigate }) {
  const [state,         setLocalState]   = useState(() => getState());
  const [settingsForm,  setSettingsForm]  = useState(() => ({ ...getState().settings }));
  const [brandingForm,  setBrandingForm]  = useState(() => ({ ...getState().branding }));
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [errors,        setErrors]        = useState({});
  const [toast,         setToast]         = useState('');
  const [toastType,     setToastType]     = useState('success');

  // Confirmation states
  const [confirmSwitchToProduct, setConfirmSwitchToProduct] = useState(false);
  const [confirmSwitchToDemo,    setConfirmSwitchToDemo]    = useState(false);
  const [confirmClearDemo,       setConfirmClearDemo]       = useState(false);
  const [confirmCleanWorkspace,  setConfirmCleanWorkspace]  = useState(false);
  const [confirmClearSingle,     setConfirmClearSingle]     = useState(false); // legacy clear
  const [confirmResetPortfolio,  setConfirmResetPortfolio]  = useState(false);

  useEffect(() => {
    const unsub = subscribe((s) => {
      setLocalState({ ...s });
      setSettingsForm((f) => ({ ...s.settings }));
      setBrandingForm((f) => ({ ...s.branding }));
    });
    return unsub;
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 5000);
  };

  const handleSettingsChange = (field, value) => {
    setSettingsForm((f) => ({ ...f, [field]: value }));
  };

  const handleBrandingChange = (field, value) => {
    setBrandingForm((f) => ({ ...f, [field]: typeof value === 'string' ? sanitiseText(value) : value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const handleSaveSettings = () => {
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleSaveBranding = () => {
    const colourErr = validateHexColour(brandingForm.accentColour);
    if (colourErr) { setErrors({ accentColour: colourErr }); return; }
    updateBranding(brandingForm);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 3000);
  };

  // ── Workspace Mode handlers ─────────────────────────────────────────────────
  const currentMode = getWorkspaceMode();

  const handleSwitchToDemo = () => {
    if (currentMode === WORKSPACE_MODE.DEMO) {
      showToast('Already in Demo Mode.', 'info');
      return;
    }
    setConfirmSwitchToDemo(true);
  };

  const doSwitchToDemo = () => {
    enableDemoMode();
    setConfirmSwitchToDemo(false);
    showToast('✅ Switched to Demo Mode. Demo clients and sample data are now visible.', 'success');
  };

  const handleSwitchToProduct = () => {
    if (currentMode === WORKSPACE_MODE.PRODUCT) {
      showToast('Already in Product Mode.', 'info');
      return;
    }
    setConfirmSwitchToProduct(true);
  };

  const doSwitchToProduct = () => {
    enableProductMode();
    setConfirmSwitchToProduct(false);
    showToast('✅ Switched to Product Mode. Demo clients are hidden from product views. No data was deleted.', 'success');
  };

  const handleExportBackup = () => {
    try {
      const cs = getConsultantState();
      const json = exportWorkspaceBackup(cs);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `qcos-backup-${currentMode}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✅ Backup exported successfully.', 'success');
    } catch (err) {
      showToast('⚠ Export failed: ' + err.message, 'error');
    }
  };

  const handleLoadPortfolio = () => {
    loadDemoPortfolio(saveClientState, setConsultantState, getConsultantState);
    enableDemoMode();
    showToast('✅ Demo portfolio loaded — 5 SME clients added. App is now in Demo Mode.', 'success');
  };

  const handleClearDemoPortfolio = () => {
    clearDemoPortfolio(saveClientState, setConsultantState, deleteClientState);
    setConfirmClearDemo(false);
    showToast('✅ Demo data permanently cleared. App is in Product Mode.', 'success');
  };

  const handleCreateCleanWorkspace = () => {
    createCleanProductWorkspace();
    setConfirmCleanWorkspace(false);
    showToast('✅ Clean product workspace created. App is in Product Mode.', 'success');
  };

  const handleResetPortfolio = () => {
    resetDemoPortfolio(saveClientState, setConsultantState, deleteClientState);
    enableDemoMode();
    setConfirmResetPortfolio(false);
    showToast('✅ Demo portfolio reset. Default demo data restored.', 'success');
  };

  const handleClearSingleDemo = () => {
    clearDemoData();
    setConfirmClearSingle(false);
    showToast('✅ Current client demo data cleared.', 'success');
  };

  // Derived state
  const cs              = getConsultantState();
  const demoClients     = getDemoClients();
  const activeClients   = (cs.clients || []).filter((c) => !c.archived);
  const demoLoaded      = activeClients.some((c) => demoClients.some((d) => d.id === c.id));
  const realClientCount = activeClients.filter((c) => !demoClients.some((d) => d.id === c.id)).length;

  return (
    <div>
      <PageHeader
        icon="⚙️"
        title="Settings"
        subtitle="Configure application behaviour, branding, and workspace mode."
        actions={
          onNavigate && (
            <ActionButton variant="ghost" size="sm" icon="🚀" onClick={() => onNavigate(PAGES.DEPLOYMENT)}>
              Deployment Checklist
            </ActionButton>
          )
        }
      />

      {/* Toast */}
      {toast && (
        <div style={{
          padding: '10px 16px', marginBottom: '16px',
          background: toastType === 'success' ? 'rgba(16,185,129,0.1)' : toastType === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,255,0.1)',
          border: `1px solid ${toastType === 'success' ? 'rgba(16,185,129,0.3)' : toastType === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,255,0.3)'}`,
          borderRadius: 'var(--radius-md)', fontSize: '13px',
          color: toastType === 'success' ? 'var(--success)' : toastType === 'error' ? 'var(--danger)' : 'var(--info)',
          fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          WORKSPACE MODE — Primary section (Run 8.5)
         ══════════════════════════════════════════════════════════════════════ */}
      <SectionCard title="Workspace Mode" icon="🔀"
        actions={<WorkspaceModeBadge mode={currentMode} size="md" />}
      >
        {/* Current mode summary */}
        <div style={{
          padding: '16px 20px', marginBottom: '20px',
          background: MODE_META[currentMode]?.bg || 'var(--bg-tertiary)',
          border: `1px solid ${MODE_META[currentMode]?.border || 'var(--border-muted)'}`,
          borderRadius: 'var(--radius-lg)',
          display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>{MODE_META[currentMode]?.icon}</span>
              <span style={{ fontWeight: 800, fontSize: '15px', color: MODE_META[currentMode]?.colour }}>
                {MODE_META[currentMode]?.label} — Active
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px' }}>
              {MODE_META[currentMode]?.description}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {realClientCount} real client{realClientCount !== 1 ? 's' : ''}
              {demoLoaded ? ` · ${demoClients.length} demo clients loaded` : ' · No demo clients'}
            </div>
          </div>
        </div>

        {/* Mode explanation cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {/* Demo Mode card */}
          <div style={{
            padding: '16px 18px', border: `2px solid ${currentMode === WORKSPACE_MODE.DEMO ? 'rgba(245,158,11,0.5)' : 'var(--border-muted)'}`,
            borderRadius: 'var(--radius-lg)', background: currentMode === WORKSPACE_MODE.DEMO ? 'rgba(245,158,11,0.06)' : 'var(--bg-secondary)',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>🎯</span>
              <span style={{ fontWeight: 700, fontSize: '13px', color: currentMode === WORKSPACE_MODE.DEMO ? 'var(--warning)' : 'var(--text-primary)' }}>
                Demo Mode
                {currentMode === WORKSPACE_MODE.DEMO && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(245,158,11,0.2)', padding: '2px 7px', borderRadius: '999px', color: 'var(--warning)', fontWeight: 700 }}>ACTIVE</span>}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
              {MODE_META[WORKSPACE_MODE.DEMO].description}
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Fictional demo clients visible</li>
              <li>Sample scores &amp; reports shown</li>
              <li>Sales walkthrough available</li>
              <li>All demo content clearly labelled</li>
            </ul>
            {currentMode !== WORKSPACE_MODE.DEMO && (
              <div style={{ marginTop: '12px' }}>
                <ActionButton variant="secondary" size="sm" onClick={handleSwitchToDemo}>
                  Switch to Demo Mode
                </ActionButton>
              </div>
            )}
          </div>

          {/* Product Mode card */}
          <div style={{
            padding: '16px 18px', border: `2px solid ${currentMode === WORKSPACE_MODE.PRODUCT ? 'rgba(16,185,129,0.5)' : 'var(--border-muted)'}`,
            borderRadius: 'var(--radius-lg)', background: currentMode === WORKSPACE_MODE.PRODUCT ? 'rgba(16,185,129,0.06)' : 'var(--bg-secondary)',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>🟢</span>
              <span style={{ fontWeight: 700, fontSize: '13px', color: currentMode === WORKSPACE_MODE.PRODUCT ? 'var(--success)' : 'var(--text-primary)' }}>
                Product Mode
                {currentMode === WORKSPACE_MODE.PRODUCT && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(16,185,129,0.2)', padding: '2px 7px', borderRadius: '999px', color: 'var(--success)', fontWeight: 700 }}>ACTIVE</span>}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
              {MODE_META[WORKSPACE_MODE.PRODUCT].description}
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Demo clients hidden from all views</li>
              <li>Real client assessments only</li>
              <li>No sample scores or fake reports</li>
              <li>Demo data preserved — not deleted</li>
            </ul>
            {currentMode !== WORKSPACE_MODE.PRODUCT && (
              <div style={{ marginTop: '12px' }}>
                <ActionButton variant="secondary" size="sm" onClick={handleSwitchToProduct}>
                  Switch to Product Mode
                </ActionButton>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-muted)', paddingTop: '16px' }}>
          <ActionButton variant="ghost" size="sm" onClick={handleExportBackup}>
            📦 Export Backup Before Switching
          </ActionButton>
          <ActionButton variant="ghost" size="sm" onClick={handleLoadPortfolio}>
            📂 Load Demo Portfolio
          </ActionButton>
          <ActionButton variant="ghost" size="sm" onClick={() => setConfirmCleanWorkspace(true)}>
            ✨ Create Clean Product Workspace
          </ActionButton>
          <ActionButton variant="ghost" size="sm" onClick={() => setConfirmClearDemo(true)}>
            🗑 Clear Demo Data Permanently
          </ActionButton>
        </div>

        {/* Mode note */}
        <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>How mode switching works:</strong>{' '}
          Switching to Product Mode hides demo clients, sample scores, and demo reports from all active views — it does not delete them. Demo data remains in storage and can be restored at any time from this page. "Clear Demo Data Permanently" removes demo records from local storage.
        </div>
      </SectionCard>

      {/* ── General Settings ──────────────────────────────────────────────── */}
      <SectionCard title="General Settings" icon="⚙️"
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {settingsSaved && <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>✓ Saved</span>}
            <ActionButton variant="primary" size="sm" onClick={handleSaveSettings}>Save Settings</ActionButton>
          </div>
        }>
        <div className="form">
          <div className="form-row">
            <FormField label="Theme" id="setting_theme">
              <select className="form-select" value={settingsForm.theme || 'dark'}
                onChange={(e) => handleSettingsChange('theme', e.target.value)}>
                <option value="dark">Dark (Default)</option>
                <option value="dark" disabled>Light (Coming Soon)</option>
              </select>
            </FormField>
            <FormField label="Date Format" id="setting_dateformat">
              <select className="form-select" value={settingsForm.dateFormat || 'DD/MM/YYYY'}
                onChange={(e) => handleSettingsChange('dateFormat', e.target.value)}>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </FormField>
          </div>
          <FormField label="Auto-Save" hint="Automatically save changes to local storage after every edit." id="setting_autosave">
            <div style={{ display: 'flex', gap: '12px' }}>
              {[true, false].map((v) => (
                <label key={String(v)} style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="radio" name="autosave" checked={settingsForm.autosave === v} onChange={() => handleSettingsChange('autosave', v)} />
                  {v ? 'Enabled (recommended)' : 'Disabled'}
                </label>
              ))}
            </div>
          </FormField>
        </div>
      </SectionCard>

      {/* ── Branding ─────────────────────────────────────────────────────── */}
      <SectionCard title="Report Branding" icon="🎨"
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {brandingSaved && <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>✓ Saved</span>}
            <ActionButton variant="primary" size="sm" onClick={handleSaveBranding}>Save Branding</ActionButton>
          </div>
        }>
        <div className="form">
          <div className="form-row">
            <FormField label="Product Name" hint="Shown in sidebar and reports." id="brand_name">
              <input className="form-input" value={brandingForm.productName || ''}
                onChange={(e) => handleBrandingChange('productName', e.target.value)} maxLength={60} />
            </FormField>
            <FormField label="Logo Text (Abbrev.)" hint="3–4 characters, shown when collapsed." id="brand_logo">
              <input className="form-input" value={brandingForm.logoText || ''}
                onChange={(e) => handleBrandingChange('logoText', e.target.value)} maxLength={4} />
            </FormField>
          </div>
          <FormField label="Tagline" id="brand_tagline">
            <input className="form-input" value={brandingForm.tagline || ''}
              onChange={(e) => handleBrandingChange('tagline', e.target.value)} maxLength={120} />
          </FormField>
          <FormField label="Accent Colour" error={errors.accentColour} id="brand_colour">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={brandingForm.accentColour || '#00d4ff'}
                onChange={(e) => handleBrandingChange('accentColour', e.target.value)}
                style={{ width: '48px', height: '36px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', padding: '2px' }} />
              <input className={`form-input${errors.accentColour ? ' form-input--error' : ''}`}
                value={brandingForm.accentColour || ''} onChange={(e) => handleBrandingChange('accentColour', e.target.value)} maxLength={20} placeholder="#00d4ff" style={{ flex: 1 }} />
              <div style={{ padding: '6px 14px', background: `${brandingForm.accentColour}22`, border: `1px solid ${brandingForm.accentColour}66`, borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, color: brandingForm.accentColour, flexShrink: 0 }}>Preview</div>
            </div>
          </FormField>
        </div>
      </SectionCard>

      {/* ── Legacy Demo Controls ──────────────────────────────────────────── */}
      <SectionCard title="Demo Portfolio Controls" icon="🎯">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
          Manage the 5-client SME demo portfolio. Export a backup before making changes if you have real client data.
          These controls are available regardless of current workspace mode.
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <ActionButton variant="secondary" size="sm" onClick={handleLoadPortfolio}>
            📂 Load Demo Portfolio
          </ActionButton>
          <ActionButton variant="ghost" size="sm" onClick={handleExportBackup}>
            📦 Export Backup
          </ActionButton>
          {demoLoaded && (
            <ActionButton variant="ghost" size="sm" onClick={() => setConfirmResetPortfolio(true)}>
              ↺ Reset Demo Portfolio
            </ActionButton>
          )}
          <ActionButton variant="ghost" size="sm" onClick={() => setConfirmClearSingle(true)}>
            🗑 Clear Current Client Demo Data
          </ActionButton>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          All demo data is <strong style={{ color: 'var(--text-secondary)' }}>fictional</strong>. No real companies, individuals, or security data. For demonstration and evaluation purposes only.
        </div>
      </SectionCard>

      {/* ── System Status ─────────────────────────────────────────────────────── */}
      <SectionCard title="System Status" icon="📋">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            ['Build',                `Run ${APP_RUN_LEVEL} — Commercial Tier + Feature Gate Foundation`],
            ['Version',              `v${APP_VERSION}`],
            ['Architecture',         'Local-First PWA (React + Vite)'],
            ['Storage',              'Browser localStorage — SSOT via storage.js'],
            ['Backend',              '⛔ Not included'],
            ['Supabase',             '⛔ Not included'],
            ['RLS',                  '⛔ Not enabled — no Supabase/backend exists'],
            ['Payments',             '⛔ Not connected — placeholder display only'],
            ['External AI APIs',     '⛔ Not connected — Copilot uses local deterministic logic'],
            ['Consultant Copilot',   '✅ Local deterministic mode only — no external AI calls'],
            ['Offensive Scanning',   '⛔ Not included — defensive readiness only'],
            ['Telemetry/Analytics',  '⛔ None — no tracking, no external requests'],
          ].map(([label, value]) => {
            const isBlocked  = String(value).startsWith('⛔');
            const isEnabled  = String(value).startsWith('✅');
            return (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                fontSize: '12px', borderBottom: '1px solid var(--border-muted)',
                paddingBottom: '6px', paddingTop: '2px', gap: '12px',
              }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontWeight: 500 }}>{label}</span>
                <span style={{
                  color: isBlocked ? 'var(--danger)' : isEnabled ? 'var(--success)' : 'var(--accent)',
                  fontWeight: 600, textAlign: 'right',
                }}>{value}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--accent)' }}>Completed Runs:</strong> 1 · 2 · 3 · 4 · 5 · 5.5 · 6 · 7 · 8 · 8.5 · 9 · 10
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <strong style={{ color: 'var(--text-secondary)' }}>Up next (not yet built):</strong> Run 11: Multi-Client Consultant Hub · Future: Supabase (opt-in) · AI API (opt-in) · Payments (opt-in)
        </div>
      </SectionCard>

      {/* ── Plans & Upgrade ─────────────────────────────────────────────── */}
      <SectionCard title="Plans &amp; Upgrade" icon="💎">
        <div style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.7, padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Commercial tier foundation</strong> — Starter / Demo is active.
          Pro Consultant, Agency, and White Label are coming in future runs.
          No backend, payments, or external API has been added.
        </div>
        <PlanCards activePlanId={state.settings?.activePlanId || 'starter'} />
      </SectionCard>

      {/* ── Legal / Disclaimer ────────────────────────────────────────────── */}
      <SectionCard title="Legal &amp; Compliance Disclaimer" icon="⚖️">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7, padding: '14px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '8px' }}>⚠ Defensive Use Only</strong>
          {DEFENSIVE_DISCLAIMER}
          <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-muted)', paddingTop: '10px' }}>
            All data is stored exclusively in this browser&apos;s local storage. No cloud sync. No backend. No external transmission.
            Data is cleared if browser storage is cleared or private browsing mode is used.
          </div>
        </div>
      </SectionCard>

      {/* ── Confirmation Modals ────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={confirmSwitchToDemo}
        title="🎯 Switch to Demo Mode"
        body="Demo clients, sample scores, sample reports, and sample evidence will become visible across the app. All fictional data will be clearly labelled. Your real client data will not be affected."
        confirmLabel="Switch to Demo Mode"
        variant="secondary"
        onConfirm={doSwitchToDemo}
        onCancel={() => setConfirmSwitchToDemo(false)}
      />

      <ConfirmModal
        isOpen={confirmSwitchToProduct}
        title="🟢 Switch to Product Mode"
        body="Demo clients will be hidden from all active product views. Real user-entered data will be preserved. Demo data remains in local storage and can be restored at any time from this Settings page."
        confirmLabel="Switch to Product Mode"
        variant="primary"
        onConfirm={doSwitchToProduct}
        onCancel={() => setConfirmSwitchToProduct(false)}
      />

      <ConfirmModal
        isOpen={confirmClearDemo}
        title="🗑 Clear Demo Data Permanently"
        body={
          <span>
            This permanently removes all demo clients, sample reports, sample scores, and sample evidence from this browser&apos;s local storage. This action cannot be undone.
            <br /><br />
            <strong style={{ color: 'var(--warning)' }}>Export a backup first if needed.</strong>
            <br /><br />
            Real user-entered clients and data will not be affected.
          </span>
        }
        confirmLabel="Permanently Clear Demo Data"
        variant="danger"
        onConfirm={handleClearDemoPortfolio}
        onCancel={() => setConfirmClearDemo(false)}
      />

      <ConfirmModal
        isOpen={confirmCleanWorkspace}
        title="✨ Create Clean Product Workspace"
        body="This resets the main app workspace to a clean Product Mode starting point. No demo clients will be included. Your real client data in the consultant workspace will not be deleted. Demo data can still be restored from this Settings page."
        confirmLabel="Create Clean Workspace"
        variant="primary"
        onConfirm={handleCreateCleanWorkspace}
        onCancel={() => setConfirmCleanWorkspace(false)}
      />

      <ConfirmModal
        isOpen={confirmClearSingle}
        title="Clear Current Client Demo Data"
        body="This clears the demo/seed data from the current active client workspace. Real assessments you've entered will also be reset. Export a backup first if needed."
        confirmLabel="Clear Current Client Data"
        variant="danger"
        onConfirm={handleClearSingleDemo}
        onCancel={() => setConfirmClearSingle(false)}
      />

      <ConfirmModal
        isOpen={confirmResetPortfolio}
        title="↺ Reset Demo Portfolio"
        body="This removes the current demo portfolio state and restores the default demo seed data. Any changes you made to demo clients will be lost. Real client data will not be affected."
        confirmLabel="Reset Demo Portfolio"
        variant="secondary"
        onConfirm={handleResetPortfolio}
        onCancel={() => setConfirmResetPortfolio(false)}
      />
    </div>
  );
}
