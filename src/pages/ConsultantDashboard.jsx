/**
 * QUANTUM COMPLIANCE OS™ — ConsultantDashboard.jsx
 * Run 5: Consultant / Agency Dashboard
 * =============================================
 * Multi-client overview, analytics, risk comparison,
 * deployment checklist, and commercial tier info.
 *
 * DEFENSIVE USE ONLY. No backend. No payments. No offensive tools.
 * All data local-first via consultantStorage.js + storage.js.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../styles/cards.css';
import '../styles/forms.css';
import '../styles/navigation.css';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import {
  getConsultantState, subscribeConsultant, setConsultantState,
  createClient, updateClient, archiveClient, restoreClient, deleteClientPermanently,
  switchToClient, syncClientState, computeConsultantAnalytics,
  exportFullBackup, importFullBackup, updateDeploymentChecklistItem,
  getClientState, COMMERCIAL_TIERS, saveConsultantState,
  saveClientState, deleteClientState,
} from '../core/consultantStorage.js';
import {
  getState, saveState, forceReloadState,
  loadDemoPortfolio, resetDemoPortfolio, getDemoClients, getDemoPortfolioMetrics,
} from '../core/storage.js';
import { getScoreThreshold } from '../core/scoringEngine.js';
import { getQuantumScoreThreshold } from '../core/quantumScoringEngine.js';
import { timeAgo } from '../utils/date.js';
import { PAGES } from '../core/constants.js';
import { WORKSPACE_MODE, filterClientsByMode, clientIsDemo, MODE_META } from '../core/workspaceMode.js';

const TAB = { OVERVIEW: 'overview', CLIENTS: 'clients', COMPARE: 'compare', CHECKLIST: 'checklist', TIERS: 'tiers', DEMO: 'demo' };

export default function ConsultantDashboard({ onNavigate, onClientSwitch, workspaceMode }) {
  const [cs, setCs]          = useState(() => getConsultantState());
  const [mainState, setMain] = useState(() => getState());
  const [activeTab, setTab]  = useState(TAB.OVERVIEW);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(null);
  const [showArchived, setShowArchived]     = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(null);
  const [importError, setImportError]       = useState('');
  const [demoMessage, setDemoMessage]       = useState('');
  const [confirmResetDemo, setConfirmResetDemo] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeConsultant((s) => setCs({ ...s }));
    return unsub;
  }, []);

  // Run 8.5: filter clients by workspace mode
  // In Product Mode, demo clients are hidden from active views.
  // In Demo Mode, all clients are shown (demo + real).
  const effectiveMode  = workspaceMode || 'demo';
  const allClients     = cs.clients || [];
  const visibleClients = filterClientsByMode(allClients, effectiveMode, { includeArchived: false });
  const archivedVisible = filterClientsByMode(allClients.filter(c => c.archived), effectiveMode, { includeArchived: true });

  // Run 8.5: use mode-filtered visible clients (computed above from visibleClients/effectiveMode)
  const activeClients  = useMemo(() => visibleClients, [visibleClients]);
  const archivedClients = useMemo(() => archivedVisible, [archivedVisible]);
  const analytics = useMemo(() => computeConsultantAnalytics(cs.clients, mainState), [cs.clients, mainState]);
  const tier = COMMERCIAL_TIERS.find((t) => t.id === cs.tier) || COMMERCIAL_TIERS[0];

  const handleSwitchClient = (clientId) => {
    const current = getState();
    switchToClient(clientId, current, saveState);
    forceReloadState();
    if (onClientSwitch) onClientSwitch(clientId);
    // Navigate to dashboard after switch
    if (onNavigate) onNavigate(PAGES.DASHBOARD);
  };

  const handleSwitchOwn = () => {
    const current = getState();
    switchToClient(null, current, saveState);
    forceReloadState();
    if (onClientSwitch) onClientSwitch(null);
    if (onNavigate) onNavigate(PAGES.DASHBOARD);
  };

  const handleExportBackup = () => {
    const backup = exportFullBackup(mainState);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `qcos-full-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    updateDeploymentChecklistItem('export_backup', true);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importFullBackup(ev.target.result, () => window.location.reload());
      if (!result.success) setImportError(result.error || 'Import failed');
    };
    reader.readAsText(file);
  };

  const TABS = [
    { id: TAB.OVERVIEW,  label: 'Overview' },
    { id: TAB.CLIENTS,   label: `Clients (${activeClients.length})` },
    { id: TAB.COMPARE,   label: 'Risk Comparison' },
    { id: TAB.CHECKLIST, label: 'Deployment Checklist' },
    { id: TAB.TIERS,     label: 'Commercial Tiers' },
    { id: TAB.DEMO,      label: '🎯 Demo Controls' },
  ];

  return (
    <div>
      <PageHeader
        icon="🏢"
        title="Consultant Dashboard"
        subtitle={`${cs.firmName || 'Your Workspace'} · ${tier.name} · Local-First Consultant Mode`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {cs.activeClientId && (
              <ActionButton variant="secondary" onClick={handleSwitchOwn}>← Own Workspace</ActionButton>
            )}
            <ActionButton variant="ghost" size="sm" onClick={handleExportBackup}>⬇ Export Backup</ActionButton>
            <ActionButton variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>⬆ Import Backup</ActionButton>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportBackup} />
            <ActionButton variant="primary" onClick={() => setShowNewClient(true)}>+ New Client</ActionButton>
          </div>
        }
      />

      {/* Run 8.5: Workspace Mode Banner */}
      <ConsultantModeBanner
        workspaceMode={effectiveMode}
        allClientCount={(cs.clients || []).filter(c => !c.archived).length}
        visibleClientCount={activeClients.length}
        onNavigate={onNavigate}
      />

      {/* Active client banner */}
      {cs.activeClientId && (() => {
        const client = cs.clients.find((c) => c.id === cs.activeClientId);
        return client ? (
          <div style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>🔵</span>
            <span style={{ fontSize: '13px', color: clientIsDemo(client) ? 'var(--warning)' : '#8b5cf6', fontWeight: 600 }}>
              Active Client: <strong>{client.name}</strong>
              {clientIsDemo(client) && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(245,158,11,0.2)', padding: '2px 7px', borderRadius: '999px', color: 'var(--warning)' }}>DEMO CLIENT</span>}
              {' '}— All assessment data is for this client.
            </span>
            <div style={{ flex: 1 }} />
            <ActionButton variant="ghost" size="sm" onClick={handleSwitchOwn}>← Switch to Own Workspace</ActionButton>
          </div>
        ) : null;
      })()}

      {importError && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: 'var(--danger)', display: 'flex', justifyContent: 'space-between' }}>
          Import error: {importError}
          <button onClick={() => setImportError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-nav">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-nav__item${activeTab === t.id ? ' tab-nav__item--active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === TAB.OVERVIEW && (
        <OverviewTab analytics={analytics} cs={cs} activeClients={activeClients} onNavigate={onNavigate} onSwitchClient={handleSwitchClient} />
      )}

      {/* ── Clients ── */}
      {activeTab === TAB.CLIENTS && (
        <ClientsTab
          activeClients={activeClients} archivedClients={archivedClients}
          showArchived={showArchived} setShowArchived={setShowArchived}
          activeClientId={cs.activeClientId}
          onSwitch={handleSwitchClient} onSwitchOwn={handleSwitchOwn}
          onEdit={setShowEditClient} onArchive={archiveClient}
          onRestore={restoreClient} onDelete={setConfirmDelete}
          onNew={() => setShowNewClient(true)}
        />
      )}

      {/* ── Risk Comparison ── */}
      {activeTab === TAB.COMPARE && (
        <CompareTab clients={activeClients} />
      )}

      {/* ── Deployment Checklist ── */}
      {activeTab === TAB.CHECKLIST && (
        <ChecklistTab checklist={cs.deploymentChecklist} onNavigate={onNavigate} onToggle={updateDeploymentChecklistItem} />
      )}

      {/* ── Tiers ── */}
      {activeTab === TAB.TIERS && (
        <TiersTab currentTier={cs.tier} />
      )}

      {activeTab === TAB.DEMO && (
        <DemoControlsTab
          cs={cs}
          demoMessage={demoMessage}
          setDemoMessage={setDemoMessage}
          confirmResetDemo={confirmResetDemo}
          setConfirmResetDemo={setConfirmResetDemo}
          onNavigate={onNavigate}
          onClientSwitch={onClientSwitch}
          handleSwitchClient={handleSwitchClient}
        />
      )}

      {/* ── Modals ── */}
      {showNewClient && (
        <ClientFormModal
          title="New Client"
          onSave={(data) => { createClient(data); setShowNewClient(false); }}
          onClose={() => setShowNewClient(false)}
        />
      )}

      {showEditClient && (
        <ClientFormModal
          title="Edit Client"
          initial={showEditClient}
          onSave={(data) => { updateClient(showEditClient.id, data); setShowEditClient(null); }}
          onClose={() => setShowEditClient(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Permanently Delete Client?"
          message={`This will permanently delete "${confirmDelete.name}" and all their assessment data. This cannot be undone.`}
          confirmLabel="Delete Permanently"
          onConfirm={() => { deleteClientPermanently(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
// ─── Consultant Mode Banner (Run 8.5) ─────────────────────────────────────────
function ConsultantModeBanner({ workspaceMode, allClientCount, visibleClientCount, onNavigate }) {
  const hiddenCount = allClientCount - visibleClientCount;
  if (workspaceMode === 'demo') {
    return (
      <div style={{
        padding: '8px 16px', marginBottom: '16px',
        background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>🎯</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--warning)' }}>Demo Mode</strong> — Showing demo clients and fictional data. All demo content is labelled.
          </span>
        </div>
        {onNavigate && (
          <button onClick={() => onNavigate('settings')} style={{
            fontSize: '11px', color: 'var(--warning)', background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)',
            padding: '3px 10px', cursor: 'pointer', flexShrink: 0, fontWeight: 700,
          }}>Switch to Product Mode →</button>
        )}
      </div>
    );
  }
  // Product mode
  return (
    <div style={{
      padding: '8px 16px', marginBottom: '16px',
      background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px',
      alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--success)' }}>Product Mode</strong> — Showing real clients only.
          {hiddenCount > 0 && (
            <span style={{ color: 'var(--text-muted)' }}> {hiddenCount} demo client{hiddenCount !== 1 ? 's' : ''} hidden.</span>
          )}
        </span>
      </div>
      {onNavigate && hiddenCount > 0 && (
        <button onClick={() => onNavigate('settings')} style={{
          fontSize: '11px', color: 'var(--text-muted)', background: 'transparent',
          border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0,
        }}>View demo clients in Settings</button>
      )}
    </div>
  );
}

function OverviewTab({ analytics, cs, activeClients, onNavigate, onSwitchClient }) {
  return (
    <div>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Clients', value: analytics.totalClients, colour: 'var(--text-primary)', icon: '👥' },
          { label: 'High-Risk Clients', value: analytics.highRiskClients, colour: analytics.highRiskClients > 0 ? 'var(--danger)' : 'var(--success)', icon: '⚠️' },
          { label: 'Assessments Done', value: analytics.assessmentsDone, colour: 'var(--info)', icon: '✅' },
          { label: 'Reports Ready', value: analytics.reportsReady, colour: 'var(--success)', icon: '📋' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{kpi.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: kpi.colour, lineHeight: 1 }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Score averages */}
      {(analytics.avgSecScore != null || analytics.avgQScore != null) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {analytics.avgSecScore != null && (
            <div style={{ background: 'var(--bg-secondary)', border: `1px solid ${getScoreThreshold(analytics.avgSecScore).colour}44`, borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Avg Security Score (across clients)</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: getScoreThreshold(analytics.avgSecScore).colour, lineHeight: 1 }}>{analytics.avgSecScore}%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{getScoreThreshold(analytics.avgSecScore).label}</div>
            </div>
          )}
          {analytics.avgQScore != null && (
            <div style={{ background: 'var(--bg-secondary)', border: `1px solid ${getQuantumScoreThreshold(analytics.avgQScore).colour}44`, borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Avg Quantum Readiness (across clients)</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: getQuantumScoreThreshold(analytics.avgQScore).colour, lineHeight: 1 }}>{analytics.avgQScore}%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{getQuantumScoreThreshold(analytics.avgQScore).label}</div>
            </div>
          )}
        </div>
      )}

      {/* Recent client activity */}
      <SectionCard title="Recent Client Activity" icon="⏱">
        {activeClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
            No clients yet. Add your first client to begin multi-client consultant mode.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...activeClients].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)).slice(0, 8).map((client) => {
              const data = getClientState(client.id);
              const secScore = data?.assessmentState?.securityAssessment?.securityImplementationScore;
              const qScore   = data?.assessmentState?.quantumReadiness?.quantumReadinessScore;
              const riskCount = data?.riskModel?.riskEntries?.length || 0;
              const hasCritical = (data?.riskModel?.riskEntries || []).some((r) => r.inherentRisk === 'critical');
              return (
                <div key={client.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `1px solid ${hasCritical ? 'rgba(239,68,68,0.25)' : 'var(--border-muted)'}` }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: 'var(--accent)', flexShrink: 0 }}>
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{client.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.sector} · {timeAgo(client.lastActivity)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {secScore != null && <span style={{ fontSize: '12px', fontWeight: 700, color: getScoreThreshold(secScore).colour }}>🛡 {secScore}%</span>}
                    {qScore != null && <span style={{ fontSize: '12px', fontWeight: 700, color: getQuantumScoreThreshold(qScore).colour }}>⚛ {qScore}%</span>}
                    {hasCritical && <RiskBadge level="critical" />}
                    {!hasCritical && riskCount > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{riskCount} risks</span>}
                  </div>
                  <ActionButton variant="ghost" size="sm" onClick={() => onSwitchClient(client.id)}>Open →</ActionButton>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Next commercial actions */}
      <SectionCard title="Next Actions" icon="📌">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            activeClients.length === 0 && { icon: '👥', text: 'Add your first client profile', action: 'Add Client', tab: TAB.CLIENTS },
            activeClients.length > 0 && analytics.assessmentsDone === 0 && { icon: '🛡️', text: 'Run your first security assessment for a client', action: 'Open Client', tab: null },
            analytics.highRiskClients > 0 && { icon: '⚠️', text: `${analytics.highRiskClients} client(s) have critical risk items — generate reports`, action: 'View Reports', nav: PAGES.REPORTS },
            activeClients.length >= 2 && analytics.reportsReady === 0 && { icon: '📋', text: 'Generate client reports to demonstrate value', action: 'Reports', nav: PAGES.REPORTS },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)' }}>{item.text}</span>
            </div>
          ))}
          {activeClients.length >= 1 && analytics.assessmentsDone > 0 && (
            <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--success)' }}>
              ✅ Great progress — {analytics.assessmentsDone} client(s) assessed, {analytics.reportsReady} report(s) ready.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────
// ─── Clients Empty State (Run 8.5) ───────────────────────────────────────────
function ClientsEmptyState({ onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 32px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.35 }}>👥</div>
      <h3 style={{ marginBottom: '10px' }}>No real clients yet</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto 16px' }}>
        Add your first client to begin a defensive readiness assessment. Each client gets an isolated workspace — their own systems, assessments, risk register, and reports.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 auto 24px', maxWidth: '380px', lineHeight: 1.5 }}>
        To explore the platform with fictional demo data, go to <strong>Settings → Workspace Mode</strong> and switch to Demo Mode.
      </p>
      <ActionButton variant="primary" onClick={onNew}>+ Add First Real Client</ActionButton>
    </div>
  );
}

function ClientsTab({ activeClients, archivedClients, showArchived, setShowArchived, activeClientId, onSwitch, onSwitchOwn, onEdit, onArchive, onRestore, onDelete, onNew }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{activeClients.length} active client{activeClients.length !== 1 ? 's' : ''}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {archivedClients.length > 0 && (
            <ActionButton variant="ghost" size="sm" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? 'Hide Archived' : `Show Archived (${archivedClients.length})`}
            </ActionButton>
          )}
          <ActionButton variant="primary" size="sm" onClick={onNew}>+ New Client</ActionButton>
        </div>
      </div>

      {activeClients.length === 0 && (
        <ClientsEmptyState onNew={onNew} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeClients.map((client) => (
          <ClientRow key={client.id} client={client} isActive={activeClientId === client.id} onSwitch={onSwitch} onSwitchOwn={onSwitchOwn} onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
        ))}

        {showArchived && archivedClients.map((client) => (
          <ClientRow key={client.id} client={client} archived isActive={false} onSwitch={onSwitch} onSwitchOwn={onSwitchOwn} onEdit={onEdit} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function ClientRow({ client, isActive, archived, onSwitch, onEdit, onArchive, onRestore, onDelete }) {
  const data     = getClientState(client.id);
  const secScore = data?.assessmentState?.securityAssessment?.securityImplementationScore;
  const qScore   = data?.assessmentState?.quantumReadiness?.quantumReadinessScore;
  const riskCount= data?.riskModel?.riskEntries?.length || 0;
  const hasCrit  = (data?.riskModel?.riskEntries || []).some((r) => r.inherentRisk === 'critical');

  return (
    <div style={{
      background: isActive ? 'rgba(139,92,246,0.08)' : archived ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      border: `1px solid ${isActive ? 'rgba(139,92,246,0.4)' : archived ? 'var(--border-muted)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)', padding: '14px 18px',
      opacity: archived ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: isActive ? 'rgba(139,92,246,0.2)' : 'var(--accent-dim)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: isActive ? '#8b5cf6' : 'var(--accent)', flexShrink: 0 }}>
          {client.name.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{client.name}</span>
            {isActive && <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '1px 7px', borderRadius: '999px', fontWeight: 700 }}>Active</span>}
            {clientIsDemo(client) && <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', padding: '1px 7px', borderRadius: '999px', fontWeight: 700 }}>🎯 Demo</span>}
            {archived && <span style={{ fontSize: '10px', background: 'var(--bg-elevated)', color: 'var(--text-muted)', padding: '1px 7px', borderRadius: '999px' }}>Archived</span>}
            {hasCrit && <RiskBadge level="critical" />}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {client.sector && <span>{client.sector}</span>}
            {client.contactName && <span>{client.contactName}</span>}
            <span>Last active: {timeAgo(client.lastActivity)}</span>
            {secScore != null && <span style={{ color: getScoreThreshold(secScore).colour }}>🛡 {secScore}%</span>}
            {qScore != null && <span style={{ color: getQuantumScoreThreshold(qScore).colour }}>⚛ {qScore}%</span>}
            {riskCount > 0 && <span>{riskCount} risk item{riskCount !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {!archived && !isActive && <ActionButton variant="secondary" size="sm" onClick={() => onSwitch(client.id)}>Open</ActionButton>}
          {!archived && <ActionButton variant="ghost" size="sm" onClick={() => onEdit(client)}>Edit</ActionButton>}
          {!archived && <ActionButton variant="ghost" size="sm" onClick={() => onArchive(client.id)}>Archive</ActionButton>}
          {archived && <ActionButton variant="ghost" size="sm" onClick={() => onRestore(client.id)}>Restore</ActionButton>}
          {archived && <ActionButton variant="ghost" size="sm" onClick={() => onDelete(client)}>Delete</ActionButton>}
        </div>
      </div>
      {/* Copilot Banner */}
      {onNavigate && (
        <div style={{
          padding: '16px 20px', marginTop: '8px',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(0,212,255,0.02) 100%)',
          border: '1px solid rgba(0,212,255,0.25)', borderRadius: 'var(--radius-lg)',
          display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>Consultant Copilot Available</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Generate executive summaries, technical remediation plans, meeting talking points, and more from the active client's assessment data. Local-first — no external AI API required.
              </div>
            </div>
          </div>
          <button onClick={() => onNavigate('consultant-copilot')} style={{
            padding: '8px 20px', background: 'var(--accent)', color: '#0d1117', border: 'none',
            borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 800, cursor: 'pointer', flexShrink: 0,
          }}>
            🤖 Open Copilot →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Risk Comparison Tab ──────────────────────────────────────────────────────
function CompareTab({ clients }) {
  const rows = useMemo(() => clients.map((client) => {
    const data      = getClientState(client.id);
    const secScore  = data?.assessmentState?.securityAssessment?.securityImplementationScore;
    const qScore    = data?.assessmentState?.quantumReadiness?.quantumReadinessScore;
    const hndlRisk  = data?.assessmentState?.quantumReadiness?.hndlRiskScore;
    const riskCount = data?.riskModel?.riskEntries?.length || 0;
    const critCount = (data?.riskModel?.riskEntries || []).filter((r) => r.inherentRisk === 'critical').length;
    const highCount = (data?.riskModel?.riskEntries || []).filter((r) => r.inherentRisk === 'high').length;
    const recCount  = (data?.recommendationModel?.recommendations || []).length;
    const evItems   = data?.evidencePack?.items?.length || 0;
    const secThresh = secScore != null ? getScoreThreshold(secScore) : null;
    const qThresh   = qScore != null ? getQuantumScoreThreshold(qScore) : null;
    return { client, secScore, qScore, hndlRisk, riskCount, critCount, highCount, recCount, evItems, secThresh, qThresh };
  }), [clients]);

  if (clients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 32px', color: 'var(--text-muted)', fontSize: '14px' }}>
        Add at least two clients and run assessments to compare their risk profiles.
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
        Cross-client risk comparison. Only clients with completed assessments show scores.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
              {['Client', 'Security Score', 'Quantum Score', 'HNDL Risk', 'Risk Items', 'Critical', 'High', 'Recommendations', 'Evidence'].map((h) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client, secScore, qScore, hndlRisk, riskCount, critCount, highCount, recCount, evItems, secThresh, qThresh }, i) => (
              <tr key={client.id} style={{ borderBottom: '1px solid var(--border-muted)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                <td style={{ padding: '10px 10px', fontWeight: 600 }}>
                  <div>{client.name}</div>
                  {client.sector && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{client.sector}</div>}
                </td>
                <td style={{ padding: '10px 10px' }}>
                  {secScore != null ? <span style={{ fontWeight: 700, color: secThresh?.colour }}>{secScore}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ padding: '10px 10px' }}>
                  {qScore != null ? <span style={{ fontWeight: 700, color: qThresh?.colour }}>{qScore}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ padding: '10px 10px' }}>
                  {hndlRisk != null ? (
                    <span style={{ fontWeight: 700, color: hndlRisk >= 70 ? 'var(--danger)' : hndlRisk >= 40 ? 'var(--warning)' : 'var(--success)' }}>{hndlRisk}/100</span>
                  ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ padding: '10px 10px', color: riskCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{riskCount || '—'}</td>
                <td style={{ padding: '10px 10px' }}>{critCount > 0 ? <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{critCount}</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}</td>
                <td style={{ padding: '10px 10px' }}>{highCount > 0 ? <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{highCount}</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}</td>
                <td style={{ padding: '10px 10px', color: 'var(--text-muted)' }}>{recCount || '—'}</td>
                <td style={{ padding: '10px 10px', color: 'var(--text-muted)' }}>{evItems || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Deployment Checklist Tab ─────────────────────────────────────────────────
function ChecklistTab({ checklist, onNavigate, onToggle }) {
  const done  = checklist.filter((i) => i.done).length;
  const total = checklist.length;
  const pct   = Math.round((done / total) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>Deployment Readiness</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{done}/{total} complete</span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--accent)', borderRadius: '999px', transition: 'width 0.4s' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {checklist.map((item) => (
          <div key={item.id} style={{
            display: 'flex', gap: '12px', padding: '12px 16px',
            background: item.done ? 'rgba(16,185,129,0.06)' : 'var(--bg-secondary)',
            border: `1px solid ${item.done ? 'rgba(16,185,129,0.3)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)', alignItems: 'center',
          }}>
            <div onClick={() => onToggle(item.id, !item.done)} style={{
              width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
              border: `2px solid ${item.done ? 'var(--success)' : 'var(--border-default)'}`,
              background: item.done ? 'var(--success)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.12s',
            }}>
              {item.done && <span style={{ color: '#000', fontSize: '12px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: item.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{item.note}</div>
            </div>
            {item.page && !item.done && onNavigate && (
              <ActionButton variant="ghost" size="sm" onClick={() => { onToggle(item.id, true); onNavigate(item.page); }}>Go →</ActionButton>
            )}
          </div>
        ))}
      </div>
      {pct === 100 && (
        <div style={{ marginTop: '16px', padding: '16px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
          <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '15px' }}>Deployment Complete!</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>All deployment steps complete. Quantum Compliance OS™ is fully operational.</div>
        </div>
      )}
    </div>
  );
}

// ─── Tiers Tab ────────────────────────────────────────────────────────────────
function TiersTab({ currentTier }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        Commercial tiers are shown for planning purposes. No payment processing is included in this local-first build. All tiers are placeholder only.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {COMMERCIAL_TIERS.map((tier) => {
          const isCurrent = tier.id === currentTier;
          return (
            <div key={tier.id} style={{
              background: isCurrent ? `${tier.colour}0d` : 'var(--bg-secondary)',
              border: `2px solid ${isCurrent ? tier.colour : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-lg)', padding: '20px 24px',
              position: 'relative',
            }}>
              {isCurrent && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, background: tier.colour, color: '#000', padding: '2px 8px', borderRadius: '999px' }}>Current</div>
              )}
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{tier.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: tier.colour, marginBottom: '4px' }}>{tier.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: 600 }}>{tier.priceNote}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {tier.features.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: tier.colour, fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{
                padding: '8px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '12px', fontWeight: 700,
                background: isCurrent ? tier.colour : 'var(--bg-elevated)',
                color: isCurrent ? '#000' : 'var(--text-muted)',
                border: `1px solid ${isCurrent ? tier.colour : 'var(--border-default)'}`,
              }}>{tier.cta}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '20px', padding: '14px 18px', background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--info)' }}>ℹ Placeholder only.</strong>{' '}
        No billing, payment processing, or account management is implemented in this local-first build. All data remains on your device.
        Commercial tier upgrades will be available in a future hosted version.
      </div>
    </div>
  );
}

// ─── Client Form Modal ────────────────────────────────────────────────────────
const BLANK = { name: '', sector: '', contactName: '', contactEmail: '', notes: '', tags: '' };

function ClientFormModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial
    ? { name: initial.name, sector: initial.sector, contactName: initial.contactName, contactEmail: initial.contactEmail, notes: initial.notes, tags: (initial.tags || []).join(', ') }
    : BLANK
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '480px', maxWidth: '95vw' }}>
        <h3 style={{ marginBottom: '20px' }}>{title}</h3>
        <div className="form" style={{ gap: '12px' }}>
          <div className="form-field">
            <label className="form-label">Client / Organisation Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Acme Corp Ltd" maxLength={150} />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Sector</label>
              <input className="form-input" value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} placeholder="e.g. Financial Services" maxLength={100} />
            </div>
            <div className="form-field">
              <label className="form-label">Contact Name</label>
              <input className="form-input" value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} placeholder="e.g. Jane Smith" maxLength={100} />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Contact Email</label>
            <input className="form-input" type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} placeholder="jane@example.com" maxLength={150} />
          </div>
          <div className="form-field">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any context about this client…" maxLength={500} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={() => { if (!form.name.trim()) return; onSave({ ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] }); }} disabled={!form.name.trim()}>
            {initial ? 'Save Changes' : 'Create Client'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '440px', width: '90%' }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--danger)' }}>⚠ {title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
          <ActionButton variant="danger" onClick={onConfirm}>{confirmLabel}</ActionButton>
        </div>
      </div>
    </div>
  );
}


// ─── Demo Controls Tab ────────────────────────────────────────────────────────
function DemoControlsTab({ cs, demoMessage, setDemoMessage, confirmResetDemo, setConfirmResetDemo, onNavigate, onClientSwitch, handleSwitchClient }) {
  // Uses top-level imports: loadDemoPortfolio, resetDemoPortfolio, saveClientState, setConsultantState, getConsultantState, deleteClientState

  const activeClients = (cs.clients || []).filter((c) => !c.archived);
  const demoClientIds = ['demo_client_meridian','demo_client_vantage','demo_client_apex','demo_client_helix','demo_client_clearline'];
  const loadedDemoClients = activeClients.filter((c) => demoClientIds.includes(c.id));
  const demoLoaded = loadedDemoClients.length > 0;

  const DEMO_PROFILES = [
    { id: 'demo_client_meridian',  name: 'Meridian Legal Partners LLP',    risk: 'high',   sector: 'Legal',                sec: 28,  q: 15,  overall: 22,  badge: '⚠️ High Risk'    },
    { id: 'demo_client_vantage',   name: 'Vantage SaaS Technologies Ltd',   risk: 'medium', sector: 'Technology',           sec: 62,  q: 48,  overall: 57,  badge: '⚡ Medium Risk'  },
    { id: 'demo_client_apex',      name: 'Apex Managed Services Ltd',       risk: 'low',    sector: 'Technology (MSP)',     sec: 88,  q: 74,  overall: 83,  badge: '✅ Low Risk'     },
    { id: 'demo_client_helix',     name: 'Helix Health Analytics CIC',      risk: 'high',   sector: 'Healthcare',           sec: 52,  q: 18,  overall: 38,  badge: '🏥 Regulated'   },
    { id: 'demo_client_clearline', name: 'Clearline Business Services Ltd', risk: 'medium', sector: 'Professional Services',sec: 67,  q: 42,  overall: 58,  badge: '🎯 Showcase'    },
  ];

  const riskColour = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' };

  return (
    <div>
      {demoMessage && (
        <div style={{ padding: '10px 16px', marginBottom: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
          {demoMessage}
        </div>
      )}

      <SectionCard title="Demo Portfolio Controls" icon="🎯">
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
          Load 5 realistic SME demo clients to demonstrate the full platform capability to clients or investors.
          Each demo client has complete assessment data, risk registers, reports, and evidence packs.
        </div>

        {/* Portfolio status */}
        <div style={{ padding: '14px 18px', background: 'var(--bg-tertiary)', border: `1px solid ${demoLoaded ? 'rgba(16,185,129,0.3)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>
              Demo Portfolio
              <span style={{ marginLeft: '8px', fontSize: '11px', padding: '1px 8px', borderRadius: '999px', fontWeight: 700, background: demoLoaded ? 'rgba(16,185,129,0.12)' : 'var(--bg-secondary)', color: demoLoaded ? 'var(--success)' : 'var(--text-muted)' }}>
                {demoLoaded ? `${loadedDemoClients.length}/5 clients loaded` : 'Not loaded'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Includes high, medium, and low-risk examples across legal, tech, healthcare, and professional services sectors.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {!demoLoaded ? (
              <ActionButton variant="primary" size="sm" onClick={() => {
                loadDemoPortfolio(saveClientState, setConsultantState, getConsultantState);
                setDemoMessage('✅ Demo portfolio loaded — 5 clients added. Switch clients to explore.');
                setTimeout(() => setDemoMessage(''), 6000);
              }}>Load Demo Portfolio</ActionButton>
            ) : (
              <ActionButton variant="danger" size="sm" onClick={() => setConfirmResetDemo(true)}>Reset Portfolio</ActionButton>
            )}
          </div>
        </div>

        {/* Demo client list */}
        {demoLoaded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Demo Clients — Click to Switch</div>
            {DEMO_PROFILES.map((p) => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)',
                gap: '12px', flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
                  <span style={{ fontSize: '13px' }}>{p.badge}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.sector}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right', fontSize: '12px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Sec <strong style={{ color: 'var(--text-primary)' }}>{p.sec}</strong> · Q <strong style={{ color: 'var(--text-primary)' }}>{p.q}</strong> · Overall <strong style={{ color: riskColour[p.risk] }}>{p.overall}</strong></div>
                  </div>
                  {handleSwitchClient && (
                    <ActionButton variant="ghost" size="sm" onClick={() => handleSwitchClient(p.id)}>Switch →</ActionButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Demo walk-through guide */}
      <SectionCard title="Demo Walk-Through Guide" icon="📋">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { n: '1', t: 'Load the portfolio',          d: 'Click "Load Demo Portfolio" above to populate 5 SME client profiles.' },
            { n: '2', t: 'Switch to Meridian Legal',     d: 'High-risk client. Shows critical MFA gap, missing encryption, HNDL concern. Great for demonstrating risk urgency.' },
            { n: '3', t: 'Tour Security Assessment',     d: 'Shows completed assessment with scores, risk register, and recommendations pre-populated.' },
            { n: '4', t: 'Open Quantum Readiness',       d: 'Demonstrates HNDL scoring, RSA/ECC exposure, and migration priority output.' },
            { n: '5', t: 'Open Consultant Copilot',      d: 'AI-style recommendation engine generates executive summaries, talking points, and remediation drafts from stored data.' },
            { n: '6', t: 'Generate a Report',            d: 'Reports page → select type → Generate. Shows print-ready output with JSON/CSV export.' },
            { n: '7', t: 'Switch to Apex MSP',           d: 'Low-risk / best-practice client. Demonstrates the high-score end of the spectrum.' },
            { n: '8', t: 'Show Risk Comparison',         d: 'Comparison tab shows all clients ranked by score — powerful portfolio view.' },
          ].map(({ n, t, d }) => (
            <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{n}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{t}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Reset confirm modal */}
      {confirmResetDemo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '440px', width: '90%' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--warning)' }}>⚠ Reset Demo Portfolio?</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7 }}>
              This will remove all 5 demo clients from the Consultant Hub and restore the default state.
              Any live client data you added will be preserved. Demo data will be removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <ActionButton variant="ghost" onClick={() => setConfirmResetDemo(false)}>Cancel</ActionButton>
              <ActionButton variant="danger" onClick={() => {
                resetDemoPortfolio(saveClientState, setConsultantState, deleteClientState);
                setConfirmResetDemo(false);
                setDemoMessage('Demo portfolio reset. Default state restored.');
                setTimeout(() => setDemoMessage(''), 5000);
              }}>Reset Portfolio</ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
