/**
 * QUANTUM COMPLIANCE OS™ — EvidencePack.jsx
 * Run 4: Evidence Pack Builder
 * =====================================
 * Compliance evidence preparation tracker. Defensive readiness only.
 * Does NOT claim formal certification.
 *
 * DEFENSIVE USE ONLY. No offensive tools.
 */

import React, { useState, useEffect, useMemo } from 'react';
import '../styles/forms.css';
import '../styles/cards.css';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import { getState, subscribe, addEvidenceItem, updateEvidenceItem, deleteEvidenceItem, markEvidencePackReady, scaffoldEvidencePack } from '../core/storage.js';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';
import { timeAgo } from '../utils/date.js';

const EVIDENCE_TYPES = [
  { value: 'policy', label: 'Policy Document' },
  { value: 'configuration', label: 'Configuration Export' },
  { value: 'audit_log', label: 'Audit / Log Evidence' },
  { value: 'contract', label: 'Contract / Agreement' },
  { value: 'training_record', label: 'Training Record' },
  { value: 'screenshot', label: 'Screenshot / Visual' },
  { value: 'report', label: 'Report / Assessment' },
  { value: 'document', label: 'Document / Artefact' },
  { value: 'test_record', label: 'Test Record' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', colour: 'var(--text-muted)' },
  { value: 'in_progress', label: 'In Progress', colour: 'var(--warning)' },
  { value: 'collected', label: 'Collected', colour: 'var(--info)' },
  { value: 'reviewed', label: 'Reviewed', colour: 'var(--success)' },
  { value: 'not_applicable', label: 'N/A', colour: 'var(--text-muted)' },
];

const BLANK_FORM = { controlName: '', evidenceType: 'document', status: 'not_started', owner: '', notes: '', framework: '' };

export default function EvidencePack({ workspaceMode, onNavigate }) {
  const [state, setLocalState] = useState(() => getState());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [confirmScaffold, setConfirmScaffold] = useState(false);

  useEffect(() => {
    const unsub = subscribe((s) => setLocalState({ ...s }));
    return unsub;
  }, []);

  const items = useMemo(() => state.evidencePack?.items || [], [state.evidencePack]);
  const isDemo    = workspaceMode === WORKSPACE_MODE.DEMO || state.clientMode?.isDemoMode || state.settings?.demoMode;
  const isProduct = workspaceMode === WORKSPACE_MODE.PRODUCT && !state.clientMode?.isDemoMode;
  const packStatus = state.evidencePack?.status || 'not_started';

  const filtered = useMemo(() => items.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterType !== 'all' && item.evidenceType !== filterType) return false;
    return true;
  }), [items, filterStatus, filterType]);

  const stats = useMemo(() => {
    const total = items.length;
    const collected = items.filter((i) => ['collected', 'reviewed'].includes(i.status)).length;
    const reviewed = items.filter((i) => i.status === 'reviewed').length;
    const notStarted = items.filter((i) => i.status === 'not_started').length;
    const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
    return { total, collected, reviewed, notStarted, pct };
  }, [items]);

  const handleSubmit = () => {
    if (!form.controlName.trim()) return;
    if (editId) {
      updateEvidenceItem(editId, form);
    } else {
      addEvidenceItem(form);
    }
    setForm(BLANK_FORM);
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setForm({ controlName: item.controlName, evidenceType: item.evidenceType, status: item.status, owner: item.owner, notes: item.notes, framework: item.framework || '' });
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScaffold = () => {
    const riskEntries = state.riskModel?.riskEntries || [];
    const recs = state.recommendationModel?.recommendations || [];
    scaffoldEvidencePack(recs, riskEntries);
    setConfirmScaffold(false);
  };

  const statusOption = (val) => STATUS_OPTIONS.find((s) => s.value === val) || STATUS_OPTIONS[0];

  return (
    <div>
      <PageHeader
        icon="📁"
        title="Evidence Pack"
        subtitle="Compliance evidence preparation and readiness tracking. This platform supports evidence preparation only — it does not certify formal compliance."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {items.length === 0 && (
              <ActionButton variant="secondary" onClick={() => setConfirmScaffold(true)}>
                ⚡ Scaffold from Assessment
              </ActionButton>
            )}
            {items.length > 0 && packStatus !== 'ready' && (
              <ActionButton variant="secondary" onClick={markEvidencePackReady}>Mark Pack Ready</ActionButton>
            )}
            <ActionButton variant="primary" onClick={() => { setShowForm(true); setEditId(null); setForm(BLANK_FORM); }}>
              + Add Evidence Item
            </ActionButton>
          </div>
        }
      />

      {/* Run 8.5: Mode banner for evidence pack */}
      {isDemo && items.length > 0 && (
        <div style={{ padding: '8px 16px', marginBottom: '12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>🎯</span>
          <span><strong style={{ color: 'var(--warning)' }}>Demo Mode</strong> — Evidence items below are <strong>fictional sample data</strong>. They do not represent real evidence artefacts.</span>
        </div>
      )}

      {/* Defensive disclaimer */}
      <div style={{ background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--info)' }}>ℹ Evidence Preparation Only.</strong>{' '}
        This tool helps you organise and track evidence artefacts for defensive readiness and compliance preparation purposes.
        It does not constitute formal certification, audit, or legal compliance. Evidence should be reviewed by qualified compliance professionals.
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Items', value: stats.total, colour: 'var(--text-primary)' },
          { label: 'Collected / Reviewed', value: stats.collected, colour: 'var(--info)' },
          { label: 'Fully Reviewed', value: stats.reviewed, colour: 'var(--success)' },
          { label: 'Not Started', value: stats.notStarted, colour: stats.notStarted > 0 ? 'var(--warning)' : 'var(--text-muted)' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{kpi.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: kpi.colour, lineHeight: 1 }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {stats.total > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Evidence Collection Progress</span>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stats.pct}% collected</span>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stats.pct}%`, background: stats.pct === 100 ? 'var(--success)' : 'var(--accent)', borderRadius: '999px', transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <SectionCard title={editId ? 'Edit Evidence Item' : 'Add Evidence Item'} icon="✏️">
          <div className="form">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Control / Evidence Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-input" value={form.controlName} onChange={(e) => setForm((f) => ({ ...f, controlName: e.target.value }))} placeholder="e.g. MFA Policy Document" maxLength={200} />
              </div>
              <div className="form-field">
                <label className="form-label">Evidence Type</label>
                <select className="form-select" value={form.evidenceType} onChange={(e) => setForm((f) => ({ ...f, evidenceType: e.target.value }))}>
                  {EVIDENCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Owner</label>
                <input className="form-input" value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} placeholder="e.g. IT Manager / CISO" maxLength={100} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Framework Mapping</label>
              <input className="form-input" value={form.framework} onChange={(e) => setForm((f) => ({ ...f, framework: e.target.value }))} placeholder="e.g. ISO 27001 A.9 / NCSC Cyber Essentials" maxLength={200} />
            </div>
            <div className="form-field">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Evidence location, gaps, review notes…" maxLength={1000} />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <ActionButton variant="ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK_FORM); }}>Cancel</ActionButton>
              <ActionButton variant="primary" onClick={handleSubmit} disabled={!form.controlName.trim()}>{editId ? 'Save Changes' : 'Add Item'}</ActionButton>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Empty state — mode-aware (Run 8.5) */}
      {items.length === 0 && !showForm && (
        <SectionCard title={isProduct ? "No Real Evidence Items Yet" : "No Evidence Items Yet"} icon="📁">
          <div style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.35 }}>📁</div>
            {isProduct ? (
              <>
                <h3 style={{ marginBottom: '10px' }}>No evidence items yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto 24px' }}>
                  Add policy documents, configuration exports, audit logs, and other control evidence as you build the real evidence pack for this client. Complete a security assessment first to scaffold automatically.
                </p>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '10px' }}>Build your evidence pack</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto 24px' }}>
                  Add evidence items manually, or scaffold a starting list automatically from your assessment results. Each item tracks control name, evidence type, status, owner, and framework mapping.
                </p>
              </>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <ActionButton variant="secondary" onClick={() => setConfirmScaffold(true)}>⚡ Scaffold from Assessment</ActionButton>
              <ActionButton variant="primary" onClick={() => setShowForm(true)}>+ Add First Item</ActionButton>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Filter bar */}
      {items.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: 'auto', minWidth: '160px' }}>
              <option value="all">All Types</option>
              {EVIDENCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length} of {items.length} shown</span>
            <div style={{ flex: 1 }} />
            <ActionButton variant="ghost" size="sm" onClick={() => setConfirmScaffold(true)}>⚡ Re-scaffold</ActionButton>
          </div>

          {/* Evidence table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map((item) => {
              const statusOpt = statusOption(item.status);
              const typeLabel = EVIDENCE_TYPES.find((t) => t.value === item.evidenceType)?.label || item.evidenceType;
              return (
                <div key={item.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{item.controlName}</span>
                        <span style={{ fontSize: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '1px 7px', color: 'var(--text-muted)' }}>{typeLabel}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: statusOpt.colour }}>● {statusOpt.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        {item.owner && <span>Owner: {item.owner}</span>}
                        {item.framework && <span>📋 {item.framework}</span>}
                        <span>Added {timeAgo(item.dateAdded)}</span>
                        {item.lastReviewed && <span>Reviewed {timeAgo(item.lastReviewed)}</span>}
                      </div>
                      {item.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>{item.notes}</div>}
                    </div>
                    {/* Quick status toggle */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
                      <select
                        className="form-select"
                        value={item.status}
                        onChange={(e) => updateEvidenceItem(item.id, { status: e.target.value })}
                        style={{ fontSize: '11px', padding: '3px 6px', width: 'auto', minWidth: '110px', color: statusOpt.colour }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <ActionButton variant="ghost" size="sm" onClick={() => handleEdit(item)}>Edit</ActionButton>
                      <ActionButton variant="ghost" size="sm" onClick={() => setConfirmDeleteId(item.id)}>✕</ActionButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Confirm scaffold */}
      {confirmScaffold && (
        <ConfirmModal
          title={items.length > 0 ? 'Re-scaffold Evidence Pack?' : 'Scaffold Evidence Pack?'}
          message={items.length > 0
            ? 'This will replace all existing evidence items with a new scaffold generated from your assessment results. This cannot be undone.'
            : 'This will create a set of evidence items based on your assessment findings and risk register. You can edit, add, and remove items afterwards.'}
          confirmLabel="Scaffold Evidence Pack"
          onConfirm={handleScaffold}
          onCancel={() => setConfirmScaffold(false)}
        />
      )}

      {/* Confirm delete */}
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Evidence Item?"
          message="This evidence item will be permanently removed from your pack."
          confirmLabel="Delete"
          onConfirm={() => { deleteEvidenceItem(confirmDeleteId); setConfirmDeleteId(null); }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '440px', width: '90%' }}>
        <h3 style={{ marginBottom: '12px' }}>⚠ {title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
          <ActionButton variant="danger" onClick={onConfirm}>{confirmLabel}</ActionButton>
        </div>
      </div>
    </div>
  );
}
