/**
 * QUANTUM COMPLIANCE OS™ — ClientHub.jsx
 * Run 11 + Run 12: Multi-Client Consultant Hub + Reports, Evidence + Risk Comparison
 * =====================================================================================
 * Full multi-client management hub with report history, evidence archive,
 * assessment snapshots, risk comparison dashboard, and urgent actions.
 * Manages all records locally via consultantStorage.js (SSOT extension).
 * Client limit enforcement uses Run 10 plans.js config.
 *
 * Features:
 * - Client registry with summary cards
 * - Add / Edit / Archive / Restore client flows
 * - Client workspace with report history, evidence archive, snapshot timeline
 * - Risk Comparison dashboard
 * - Urgent Actions panel
 * - Missing Evidence panel
 * - Demo client/report/evidence/snapshot seed data
 * - Search, filter, sort
 * - Client limit enforcement (starter=1, pro=10, agency=50, wl=unlimited)
 *
 * SAFETY:
 * - No backend / Supabase / Firebase / OpenAI
 * - No real payments
 * - No offensive scanning
 * - All demo data clearly labelled isDemo: true
 * - No raw localStorage access — all state via consultantStorage.js
 * - No duplicate state store created
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import StatusPill from '../components/StatusPill.jsx';
import {
  getConsultantState, subscribeConsultant,
  createClient, updateClient, archiveClient, restoreClient,
  loadDemoHubClients, clearDemoHubClients, getDemoHubClients,
  updateReportRecord, updateEvidenceRecord,
  loadDemoReportHistory, clearDemoReportHistory,
} from '../core/consultantStorage.js';
import { getState, subscribe } from '../core/storage.js';
import {
  getCurrentPlan, isAtClientLimit, formatClientLimit,
  getClientLimitForPlan, PLANS,
} from '../core/plans.js';
import { DEMO_HUB_CLIENTS, DEMO_HUB_CLIENT_IDS } from '../core/clientHubSeedData.js';
import {
  DEMO_REPORTS, DEMO_EVIDENCE_ITEMS, DEMO_SNAPSHOTS,
  DEMO_REPORT_IDS, DEMO_EVIDENCE_IDS, DEMO_SNAPSHOT_IDS,
} from '../core/reportHistoryData.js';
import {
  getReportsByClientId, getLatestReportForClient,
  getEvidenceByClientId, getMissingEvidenceForClient,
  getEvidenceCompletionForClient, getSnapshotsByClientId,
  getPriorityActionsForClient, getAllUrgentActions,
  getPortfolioRiskSummary, compareClientsByRisk,
  sortClientsByQuantumReadiness, sortClientsBySecurityScore,
  getClientsNeedingReview, getClientsWithMissingEvidence,
} from '../core/reportHistoryHelpers.js';
import { timeAgo } from '../utils/date.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const RISK_COLOURS = {
  high:    '#ef4444',
  medium:  '#f59e0b',
  low:     '#10b981',
  unknown: '#6b7280',
};

const RISK_LABELS = {
  high: 'High', medium: 'Medium', low: 'Low', unknown: 'Unknown',
};

const EVIDENCE_LABELS = {
  complete: 'Complete', partial: 'Partial', incomplete: 'Incomplete', missing: 'Missing',
};

const EVIDENCE_COLOURS = {
  complete: '#10b981', partial: '#f59e0b', incomplete: '#f97316', missing: '#ef4444',
};

const ASSESSMENT_LABELS = {
  'not-started':   'Not Started',
  'in-progress':   'In Progress',
  'review-needed': 'Review Needed',
  'complete':      'Complete',
};

const ASSESSMENT_COLOURS = {
  'not-started':   '#6b7280',
  'in-progress':   '#3b82f6',
  'review-needed': '#f59e0b',
  'complete':      '#10b981',
};

const FILTER = {
  ALL:              'all',
  ACTIVE:           'active',
  ARCHIVED:         'archived',
  HIGH_RISK:        'high-risk',
  NEEDS_REVIEW:     'needs-review',
  MISSING_EVIDENCE: 'missing-evidence',
};

const SORT = {
  NAME:              'name',
  RISK:              'riskLevel',
  QUANTUM:           'quantumReadinessScore',
  SECURITY:          'securityScore',
  LAST_ASSESSMENT:   'lastAssessmentDate',
};

const VIEW = {
  LIST:        'list',
  WORKSPACE:   'workspace',
  ADD:         'add',
  EDIT:        'edit',
  RISK_COMPARE:'risk-compare',
  URGENT:      'urgent',
  MISSING_EV:  'missing-evidence',
};

const BLANK_FORM = {
  name:                  '',
  sector:                '',
  contactName:           '',
  contactEmail:          '',
  riskLevel:             'unknown',
  quantumReadinessScore: '',
  securityScore:         '',
  evidenceStatus:        'missing',
  assessmentStatus:      'not-started',
  lastAssessmentDate:    '',
  notes:                 '',
};

// ─── Score bar component ──────────────────────────────────────────────────────
function ScoreBar({ score, colour, label }) {
  const pct = score != null ? Math.min(100, Math.max(0, score)) : null;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: colour, fontWeight: 700 }}>{pct != null ? `${pct}%` : '—'}</span>
      </div>
      <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden' }}>
        {pct != null && (
          <div style={{ height: '100%', width: `${pct}%`, background: colour, borderRadius: 999, transition: 'width 0.4s' }} />
        )}
      </div>
    </div>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskChip({ level }) {
  const colour = RISK_COLOURS[level] || RISK_COLOURS.unknown;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px',
      borderRadius: 999, border: `1px solid ${colour}44`,
      background: `${colour}18`, color: colour,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>{RISK_LABELS[level] || level}</span>
  );
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status, colours, labels }) {
  const colour = colours[status] || '#6b7280';
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 7px',
      borderRadius: 999, border: `1px solid ${colour}44`,
      background: `${colour}14`, color: colour,
    }}>{labels[status] || status}</span>
  );
}

// ─── Demo badge ───────────────────────────────────────────────────────────────
function DemoBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '1px 7px',
      borderRadius: 999, background: 'rgba(245,158,11,0.15)',
      color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)',
    }}>🎯 Demo</span>
  );
}

// ─── Plan limit banner ────────────────────────────────────────────────────────
function PlanLimitBanner({ activePlanId, realClientCount }) {
  const plan = getCurrentPlan(activePlanId);
  const limit = getClientLimitForPlan(activePlanId);
  const atLimit = isAtClientLimit(activePlanId, realClientCount);

  if (limit === null) return null; // unlimited

  const colour = atLimit ? '#ef4444' : (realClientCount >= limit * 0.8 ? '#f59e0b' : '#10b981');

  return (
    <div style={{
      padding: '8px 14px', marginBottom: 14,
      background: `${colour}10`, border: `1px solid ${colour}33`,
      borderRadius: 'var(--radius-md)', fontSize: 12,
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    }}>
      <span style={{ color: colour, fontWeight: 700 }}>
        {atLimit ? '⛔' : '📊'} Plan: {plan.name}
      </span>
      <span style={{ color: 'var(--text-muted)' }}>
        {realClientCount} / {limit} live client{limit !== 1 ? 's' : ''} used
      </span>
      {atLimit && (
        <span style={{ color: colour, fontSize: 11 }}>
          Client limit reached for the current plan. Upgrade path is prepared for a future run.
        </span>
      )}
      {!atLimit && (
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
          · Multi-client hub foundation prepared. Plan enforcement is connected to the central tier config and will be expanded in future upgrade runs.
        </span>
      )}
    </div>
  );
}

// ─── Metrics row ─────────────────────────────────────────────────────────────
function MetricsRow({ clients }) {
  const active = clients.filter((c) => !c.archived);
  const archived = clients.filter((c) => c.archived);
  const highRisk = active.filter((c) => c.riskLevel === 'high');
  const needsReview = active.filter((c) => c.assessmentStatus === 'review-needed');
  const missingEvidence = active.filter((c) => ['missing', 'incomplete'].includes(c.evidenceStatus));

  const qScores = active.map((c) => c.quantumReadinessScore).filter((s) => s != null);
  const sScores = active.map((c) => c.securityScore).filter((s) => s != null);
  const avgQ = qScores.length ? Math.round(qScores.reduce((a, b) => a + b, 0) / qScores.length) : null;
  const avgS = sScores.length ? Math.round(sScores.reduce((a, b) => a + b, 0) / sScores.length) : null;

  const metric = (label, value, colour, icon) => (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)', padding: '12px 16px', textAlign: 'center', flex: '1 1 120px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{icon} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: colour || 'var(--text-primary)' }}>{value ?? '—'}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
      {metric('Total Clients',       clients.length,         'var(--accent)',   '👥')}
      {metric('Active',              active.length,          '#10b981',        '✅')}
      {metric('Archived',            archived.length,        '#6b7280',        '🗂')}
      {metric('High Risk',           highRisk.length,        '#ef4444',        '🔴')}
      {metric('Avg Quantum Score',   avgQ != null ? `${avgQ}%` : '—', '#8b5cf6', '⚛')}
      {metric('Avg Security Score',  avgS != null ? `${avgS}%` : '—', '#3b82f6', '🛡')}
      {metric('Needs Review',        needsReview.length,     '#f59e0b',        '⚠')}
      {metric('Evidence Gaps',       missingEvidence.length, '#f97316',        '📂')}
    </div>
  );
}

// ─── Client card ──────────────────────────────────────────────────────────────
function ClientCard({ client, isSelected, onOpen, onEdit, onArchive, onRestore }) {
  const archived = client.archived || client.status === 'archived';
  const qColour = client.quantumReadinessScore != null
    ? (client.quantumReadinessScore >= 70 ? '#10b981' : client.quantumReadinessScore >= 40 ? '#f59e0b' : '#ef4444')
    : '#6b7280';
  const sColour = client.securityScore != null
    ? (client.securityScore >= 70 ? '#10b981' : client.securityScore >= 40 ? '#f59e0b' : '#ef4444')
    : '#6b7280';

  return (
    <div style={{
      background:   isSelected ? 'rgba(139,92,246,0.07)' : archived ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      border:       `1px solid ${isSelected ? 'rgba(139,92,246,0.4)' : archived ? 'var(--border-muted)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)',
      padding:      '16px 20px',
      opacity:      archived ? 0.65 : 1,
      transition:   'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--radius-md)',
          background: isSelected ? 'rgba(139,92,246,0.2)' : 'var(--accent-dim)',
          border: '1px solid var(--border-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15,
          color: isSelected ? '#8b5cf6' : 'var(--accent)',
          flexShrink: 0,
        }}>
          {client.name.slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: name + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{client.name}</span>
            <RiskChip level={client.riskLevel || 'unknown'} />
            {client.isDemo && <DemoBadge />}
            {archived && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 999, padding: '1px 7px' }}>Archived</span>
            )}
          </div>

          {/* Row 2: sector, contact, last activity */}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            {client.sector && <span>🏢 {client.sector}</span>}
            {client.contactName && <span>👤 {client.contactName}</span>}
            {client.lastAssessmentDate && <span>📅 {client.lastAssessmentDate}</span>}
            {client.reportCount > 0 && <span>📄 {client.reportCount} report{client.reportCount !== 1 ? 's' : ''}</span>}
          </div>

          {/* Row 3: scores */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
            <div style={{ flex: '1 1 140px' }}>
              <ScoreBar score={client.quantumReadinessScore} colour={qColour} label="Quantum Readiness" />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <ScoreBar score={client.securityScore} colour={sColour} label="Security Score" />
            </div>
          </div>

          {/* Row 4: status chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <StatusChip status={client.evidenceStatus   || 'missing'}      colours={EVIDENCE_COLOURS}   labels={EVIDENCE_LABELS}   />
            <StatusChip status={client.assessmentStatus || 'not-started'}  colours={ASSESSMENT_COLOURS} labels={ASSESSMENT_LABELS} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {!archived && (
            <ActionButton variant="secondary" size="sm" onClick={() => onOpen(client)}>Open</ActionButton>
          )}
          {!archived && (
            <ActionButton variant="ghost" size="sm" onClick={() => onEdit(client)}>Edit</ActionButton>
          )}
          {!archived && (
            <ActionButton variant="ghost" size="sm" onClick={() => onArchive(client.id)}>Archive</ActionButton>
          )}
          {archived && (
            <ActionButton variant="ghost" size="sm" onClick={() => onRestore(client.id)}>Restore</ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Client Workspace Panel ───────────────────────────────────────────────────
function ClientWorkspace({ client, reports = [], evidenceItems = [], snapshots = [], onBack, onEdit, onReportStatusChange, onEvidenceStatusChange }) {
  const qColour = client.quantumReadinessScore != null
    ? (client.quantumReadinessScore >= 70 ? '#10b981' : client.quantumReadinessScore >= 40 ? '#f59e0b' : '#ef4444')
    : '#6b7280';
  const sColour = client.securityScore != null
    ? (client.securityScore >= 70 ? '#10b981' : client.securityScore >= 40 ? '#f59e0b' : '#ef4444')
    : '#6b7280';

  const infoRow = (label, value, colour) => value != null && value !== '' ? (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-muted)', fontSize: 13 }}>
      <span style={{ color: 'var(--text-muted)', minWidth: 170, flexShrink: 0 }}>{label}</span>
      <span style={{ color: colour || 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  ) : null;

  return (
    <div>
      {/* Back nav */}
      <div style={{ marginBottom: 18 }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--accent)',
          cursor: 'pointer', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 6,
        }}>← Back to Client List</button>
      </div>

      {/* Header */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{client.name}</h2>
              <RiskChip level={client.riskLevel || 'unknown'} />
              {client.isDemo && <DemoBadge />}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {client.sector && <span>🏢 {client.sector}&nbsp;&nbsp;</span>}
              {client.contactName && <span>👤 {client.contactName}&nbsp;&nbsp;</span>}
              {client.contactEmail && <span>✉ {client.contactEmail}</span>}
            </div>
          </div>
          <ActionButton variant="secondary" size="sm" onClick={() => onEdit(client)}>Edit Client</ActionButton>
        </div>

        {/* Scores */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <ScoreBar score={client.quantumReadinessScore} colour={qColour} label="Quantum Readiness Score" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <ScoreBar score={client.securityScore} colour={sColour} label="Security Score" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Client details */}
        <SectionCard title="Client Details" icon="📋">
          {infoRow('Organisation',       client.name)}
          {infoRow('Sector',             client.sector)}
          {infoRow('Contact Name',       client.contactName)}
          {infoRow('Contact Email',      client.contactEmail)}
          {infoRow('Status',             client.archived ? 'Archived' : 'Active')}
          {infoRow('Created',            client.createdAt?.slice(0,10))}
          {infoRow('Last Updated',       client.updatedAt?.slice(0,10))}
          {client.notes && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Notes</strong>
              {client.notes}
            </div>
          )}
        </SectionCard>

        {/* Assessment status */}
        <SectionCard title="Assessment Status" icon="📊">
          {infoRow('Risk Level',         RISK_LABELS[client.riskLevel] || '—',         RISK_COLOURS[client.riskLevel])}
          {infoRow('Assessment Status',  ASSESSMENT_LABELS[client.assessmentStatus] || '—',  ASSESSMENT_COLOURS[client.assessmentStatus])}
          {infoRow('Evidence Status',    EVIDENCE_LABELS[client.evidenceStatus] || '—',      EVIDENCE_COLOURS[client.evidenceStatus])}
          {infoRow('Last Assessment',    client.lastAssessmentDate || '—')}
          {infoRow('Quantum Readiness',  client.quantumReadinessScore != null ? `${client.quantumReadinessScore}%` : '—', qColour)}
          {infoRow('Security Score',     client.securityScore != null ? `${client.securityScore}%` : '—', sColour)}
          {infoRow('Reports Generated',  client.reportCount ?? 0)}

          <div style={{
            marginTop: 14, padding: '10px 12px', background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--radius-sm)',
            fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            Selected client context is prepared for future report and assessment linking. Existing assessment tools remain unchanged in this run.
          </div>
        </SectionCard>

        {/* ── Report History ── */}
        <ReportHistoryPanel
          reports={reports}
          clientId={client.id}
          onStatusChange={(id, status) => updateReportRecord(id, { status })}
        />

        {/* ── Evidence Archive ── */}
        <EvidenceArchivePanel
          evidenceItems={evidenceItems}
          clientId={client.id}
          onStatusChange={(id, status) => updateEvidenceRecord(id, { status })}
        />

        {/* ── Snapshot Timeline ── */}
        <SnapshotTimelinePanel snapshots={snapshots} clientId={client.id} />

        {/* ── Future runs ── */}
        <SectionCard title="Coming in Future Runs" icon="🔮">
          {[
            ['☁ Backend Sync',           'Backend sync will be added in a future run.'],
            ['🤖 AI-Assisted Insights',   'AI-assisted client insights will be added in a future run.'],
          ].map(([label, note]) => (
            <div key={label} style={{
              display: 'flex', gap: 10, padding: '9px 0',
              borderBottom: '1px solid var(--border-muted)', fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', minWidth: 170 }}>{label}</span>
              <span>{note}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Demo Mode shows the product. Live Mode runs the product. Backend connection will scale this consultant hub into a live SaaS platform in a future run.
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Client form (add / edit) ─────────────────────────────────────────────────
function ClientForm({ initial, onSave, onCancel, title }) {
  const [form, setForm] = useState(initial
    ? {
        name:                  initial.name                   || '',
        sector:                initial.sector                 || '',
        contactName:           initial.contactName            || '',
        contactEmail:          initial.contactEmail           || '',
        riskLevel:             initial.riskLevel              || 'unknown',
        quantumReadinessScore: initial.quantumReadinessScore  != null ? String(initial.quantumReadinessScore) : '',
        securityScore:         initial.securityScore          != null ? String(initial.securityScore)         : '',
        evidenceStatus:        initial.evidenceStatus         || 'missing',
        assessmentStatus:      initial.assessmentStatus       || 'not-started',
        lastAssessmentDate:    initial.lastAssessmentDate     || '',
        notes:                 initial.notes                  || '',
      }
    : { ...BLANK_FORM }
  );
  const [errors, setErrors] = useState({});
  const [saved, setSaved]   = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim())   e.name   = 'Client name is required.';
    if (!form.sector.trim()) e.sector = 'Sector is required.';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      e.contactEmail = 'Enter a valid email address.';
    }
    if (form.quantumReadinessScore !== '' && (isNaN(Number(form.quantumReadinessScore)) || Number(form.quantumReadinessScore) < 0 || Number(form.quantumReadinessScore) > 100)) {
      e.quantumReadinessScore = 'Score must be 0–100.';
    }
    if (form.securityScore !== '' && (isNaN(Number(form.securityScore)) || Number(form.securityScore) < 0 || Number(form.securityScore) > 100)) {
      e.securityScore = 'Score must be 0–100.';
    }
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = {
      ...form,
      quantumReadinessScore: form.quantumReadinessScore !== '' ? Number(form.quantumReadinessScore) : null,
      securityScore:         form.securityScore !== ''         ? Number(form.securityScore)         : null,
    };
    onSave(payload);
    setSaved(true);
  }

  const field = (label, key, opts = {}) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
        {label}{opts.required && <span style={{ color: 'var(--danger)' }}> *</span>}
      </label>
      {opts.type === 'select' ? (
        <select className="form-input" value={form[key]}
          onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((err) => ({ ...err, [key]: undefined })); }}
          style={{ width: '100%' }}>
          {opts.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : opts.type === 'textarea' ? (
        <textarea className="form-textarea" rows={3} value={form[key]} maxLength={opts.maxLength || 500}
          placeholder={opts.placeholder}
          onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); }}
          style={{ width: '100%', resize: 'vertical' }} />
      ) : (
        <input className="form-input" type={opts.inputType || 'text'} value={form[key]}
          placeholder={opts.placeholder} maxLength={opts.maxLength || 150}
          onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((err) => ({ ...err, [key]: undefined })); }}
          style={{ width: '100%' }} />
      )}
      {errors[key] && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 3 }}>{errors[key]}</div>}
    </div>
  );

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)', padding: '24px 28px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
      </div>

      {saved && (
        <div style={{ marginBottom: 14, padding: '8px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#10b981', fontWeight: 600 }}>
          ✅ {initial ? 'Client updated successfully.' : 'Client added successfully.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 20px' }}>
        {field('Client / Organisation Name', 'name',   { required: true, placeholder: 'e.g. Acme Manufacturing Ltd' })}
        {field('Sector',                     'sector', { required: true, placeholder: 'e.g. Manufacturing' })}
        {field('Contact Name',   'contactName',   { placeholder: 'e.g. Alex Morgan' })}
        {field('Contact Email',  'contactEmail',  { inputType: 'email', placeholder: 'alex@example.com' })}
        {field('Risk Level',     'riskLevel',     { type: 'select', options: [['unknown','Unknown'],['low','Low'],['medium','Medium'],['high','High']] })}
        {field('Assessment Status', 'assessmentStatus', { type: 'select', options: [['not-started','Not Started'],['in-progress','In Progress'],['review-needed','Review Needed'],['complete','Complete']] })}
        {field('Evidence Status',   'evidenceStatus',   { type: 'select', options: [['missing','Missing'],['incomplete','Incomplete'],['partial','Partial'],['complete','Complete']] })}
        {field('Last Assessment Date', 'lastAssessmentDate', { inputType: 'date' })}
        {field('Quantum Readiness Score (0–100)', 'quantumReadinessScore', { inputType: 'number', placeholder: '0–100' })}
        {field('Security Score (0–100)',           'securityScore',         { inputType: 'number', placeholder: '0–100' })}
      </div>
      {field('Notes', 'notes', { type: 'textarea', placeholder: 'Context, priorities, follow-up actions…', maxLength: 1000 })}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
        <ActionButton variant="primary" onClick={handleSave}>
          {initial ? 'Save Changes' : 'Add Client'}
        </ActionButton>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyClients({ onAdd, onLoadDemo, isProductMode = false }) {
  if (isProductMode) {
    return (
      <div style={{
        textAlign: 'center', padding: '48px 24px',
        background: 'var(--bg-secondary)', border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💾</div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--text-secondary)' }}>
          No live clients yet
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, maxWidth: 420, margin: '0 auto 8px', lineHeight: 1.7 }}>
          Demo records are hidden while Product Mode is active.
          Add a real client record to begin live operation.
        </div>
        <div style={{
          margin: '12px auto 20px', maxWidth: 440, padding: '10px 14px',
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, textAlign: 'left',
        }}>
          <strong style={{ color: 'var(--accent)' }}>ℹ Live/Local Mode</strong><br />
          Records created here are stored locally in your browser.
          They are labelled <em>live/local pending backend sync</em> until a backend provider is connected and tested.
          Connect Supabase or another backend via <strong>Settings → Backend Config</strong> to enable real multi-user operation.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <ActionButton variant="primary" onClick={onAdd}>+ Add Real Client</ActionButton>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--bg-secondary)', border: '1px dashed var(--border-default)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>No clients found</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
        Add a client or enable demo data to preview the consultant hub.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <ActionButton variant="primary" onClick={onAdd}>+ Add Client</ActionButton>
        <ActionButton variant="secondary" onClick={onLoadDemo}>🎯 Load Demo Clients</ActionButton>
      </div>
    </div>
  );
}

// ─── Run 12: Report History Panel ────────────────────────────────────────────
const REPORT_STATUS_COLOURS = {
  draft:          '#6b7280',
  'review-needed':'#f59e0b',
  final:          '#10b981',
  archived:       '#4b5563',
};
const REPORT_STATUS_LABELS = {
  draft: 'Draft', 'review-needed': 'Review Needed', final: 'Final', archived: 'Archived',
};
const REPORT_TYPE_LABELS = {
  'quantum-readiness': 'Quantum Readiness', 'security-assessment': 'Security Assessment',
  'evidence-pack': 'Evidence Pack', 'executive-summary': 'Executive Summary',
  'supplier-risk': 'Supplier Risk', 'migration-plan': 'Migration Plan',
};

function ReportHistoryPanel({ reports = [], clientId, onStatusChange }) {
  const [expanded, setExpanded] = React.useState(null);
  const [statusMsg, setStatusMsg] = React.useState('');
  const clientReports = getReportsByClientId(reports, clientId);
  // Sort by date descending for movement comparison
  const sortedReports = [...clientReports].sort((a, b) => new Date(b.generatedAt || b.createdAt || 0) - new Date(a.generatedAt || a.createdAt || 0));

  function getRiskMovement(idx) {
    if (idx >= sortedReports.length - 1) return null;           // no previous
    const curr = sortedReports[idx];
    const prev = sortedReports[idx + 1];
    const currScore = curr.securityScore ?? curr.overallScore ?? null;
    const prevScore = prev.securityScore ?? prev.overallScore ?? null;
    if (currScore == null || prevScore == null) return null;
    if (currScore > prevScore) return { label: '↑ Improved',  colour: '#10b981' };
    if (currScore < prevScore) return { label: '↓ Worsened',  colour: '#ef4444' };
    return { label: '→ Unchanged', colour: '#6b7280' };
  }

  function handleStatus(id, status) {
    onStatusChange(id, status);
    setStatusMsg('Report status updated.');
    setTimeout(() => setStatusMsg(''), 2500);
  }

  return (
    <SectionCard title="Report History" icon="📄">
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10, lineHeight:1.6,
        padding:'8px 12px', background:'rgba(0,212,255,0.04)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:'var(--radius-sm)' }}>
        Risk scores and recommendations are advisory and require qualified human review.
        Evidence status reflects records currently available in the system and may be incomplete.
      </div>

      {statusMsg && (
        <div style={{ marginBottom:10, padding:'6px 12px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius-sm)', fontSize:12, color:'#10b981', fontWeight:600 }}>
          ✅ {statusMsg}
        </div>
      )}

      {clientReports.length === 0 ? (
        <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-muted)', fontSize:13 }}>
          No reports found for this client yet.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {clientReports.map((r) => {
            const isOpen = expanded === r.id;
            const rColour = RISK_COLOURS[r.riskLevel] || '#6b7280';
            const sColour = REPORT_STATUS_COLOURS[r.status] || '#6b7280';
            return (
              <div key={r.id} style={{
                background:'var(--bg-tertiary)', border:`1px solid ${sColour}33`,
                borderRadius:'var(--radius-md)', overflow:'hidden',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : r.id)}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:3 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{r.title}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:999,
                        background:`${sColour}18`, color:sColour, border:`1px solid ${sColour}44` }}>
                        {REPORT_STATUS_LABELS[r.status] || r.status}
                      </span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:999,
                        background:`${rColour}18`, color:rColour, border:`1px solid ${rColour}44` }}>
                        {RISK_LABELS[r.riskLevel] || '—'} Risk
                      </span>
                      {r.isDemo && <DemoBadge />}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', gap:10, flexWrap:'wrap' }}>
                      <span>{REPORT_TYPE_LABELS[r.type] || r.type}</span>
                      <span>Created: {r.createdAt}</span>
                      <span>Updated: {r.updatedAt}</span>
                      {r.quantumReadinessScore != null && <span style={{ color:'#8b5cf6' }}>⚛ {r.quantumReadinessScore}%</span>}
                      {r.securityScore != null && <span style={{ color:'#3b82f6' }}>🛡 {r.securityScore}%</span>}
                      {(() => { const idx = sortedReports.indexOf(r); const mv = getRiskMovement(idx); return mv ? <span style={{ fontSize:10, fontWeight:700, color: mv.colour }}>{mv.label}</span> : null; })()}
                    </div>
                  </div>
                  <span style={{ color:'var(--text-muted)', fontSize:12, flexShrink:0 }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {isOpen && (
                  <div style={{ padding:'0 16px 16px', borderTop:'1px solid var(--border-muted)' }}>
                    <div style={{ marginTop:12, fontSize:12, color:'var(--text-secondary)', lineHeight:1.8,
                      background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)', padding:'10px 12px', marginBottom:12 }}>
                      <strong style={{ color:'var(--text-primary)', display:'block', marginBottom:4 }}>Summary</strong>
                      {r.summary}
                    </div>
                    {r.recommendations && r.recommendations.length > 0 && (
                      <div style={{ marginBottom:12 }}>
                        <strong style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Recommendations</strong>
                        <ul style={{ margin:0, paddingLeft:18, display:'flex', flexDirection:'column', gap:4 }}>
                          {r.recommendations.map((rec, i) => (
                            <li key={i} style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.6 }}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:11, color:'var(--text-muted)', marginRight:4 }}>Mark as:</span>
                      {['draft','review-needed','final'].map((st) => (
                        <button key={st} onClick={() => handleStatus(r.id, st)} style={{
                          fontSize:11, padding:'3px 10px', borderRadius:'var(--radius-md)',
                          background: r.status === st ? `${REPORT_STATUS_COLOURS[st]}22` : 'var(--bg-elevated)',
                          border:`1px solid ${r.status === st ? REPORT_STATUS_COLOURS[st] : 'var(--border-muted)'}`,
                          color: r.status === st ? REPORT_STATUS_COLOURS[st] : 'var(--text-muted)',
                          cursor:'pointer', fontWeight: r.status === st ? 700 : 400,
                        }}>
                          {REPORT_STATUS_LABELS[st]}
                        </button>
                      ))}
                      <span style={{ fontSize:10, color:'var(--text-muted)', marginLeft:'auto',
                        fontStyle:'italic' }}>
                        Export-ready report generation is reserved for a future upgrade run.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Run 12: Evidence Archive Panel ──────────────────────────────────────────
const EV_STATUS_COLOURS = {
  complete:'#10b981', partial:'#f59e0b', incomplete:'#f97316', missing:'#ef4444', 'not-required':'#6b7280',
};
const EV_STATUS_LABELS = {
  complete:'Complete', partial:'Partial', incomplete:'Incomplete', missing:'Missing', 'not-required':'Not Required',
};
const EV_CATEGORY_LABELS = {
  cryptography:'Cryptography', 'identity-access':'Identity & Access', 'supplier-risk':'Supplier Risk',
  infrastructure:'Infrastructure', 'data-protection':'Data Protection', 'incident-response':'Incident Response',
  compliance:'Compliance', policy:'Policy', training:'Training', other:'Other',
};
const EV_PRIORITY_COLOURS = { high:'#ef4444', medium:'#f59e0b', low:'#6b7280' };

function EvidenceArchivePanel({ evidenceItems = [], clientId, onStatusChange }) {
  const [statusMsg, setStatusMsg] = React.useState('');
  const ORDER = { high:0, medium:1, low:2 };
  const items = getEvidenceByClientId(evidenceItems, clientId);
  const today = new Date().toISOString().slice(0,10);

  function handleStatus(id, status) {
    onStatusChange(id, status);
    setStatusMsg('Record updated successfully.');
    setTimeout(() => setStatusMsg(''), 2500);
  }

  return (
    <SectionCard title="Evidence Archive" icon="📂">
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10, lineHeight:1.6,
        padding:'8px 12px', background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:'var(--radius-sm)' }}>
        Evidence status reflects records currently available in the system and may be incomplete.
        Evidence file upload and backend storage are reserved for a future run.
      </div>

      {statusMsg && (
        <div style={{ marginBottom:10, padding:'6px 12px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius-sm)', fontSize:12, color:'#10b981', fontWeight:600 }}>
          ✅ {statusMsg}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-muted)', fontSize:13 }}>
          No evidence records found for this client yet.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {items.map((ev) => {
            const sc = EV_STATUS_COLOURS[ev.status] || '#6b7280';
            const pc = EV_PRIORITY_COLOURS[ev.priority] || '#6b7280';
            const isOverdue = ev.dueDate && ev.dueDate < today && !['complete','not-required'].includes(ev.status);
            return (
              <div key={ev.id} style={{
                background:'var(--bg-tertiary)', border:`1px solid ${sc}33`,
                borderRadius:'var(--radius-md)', padding:'12px 16px',
              }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start', flexWrap:'wrap' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{ev.title}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:999,
                        background:`${sc}18`, color:sc, border:`1px solid ${sc}44` }}>
                        {EV_STATUS_LABELS[ev.status] || ev.status}
                      </span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:999,
                        background:`${pc}18`, color:pc, border:`1px solid ${pc}44` }}>
                        {ev.priority?.charAt(0).toUpperCase() + ev.priority?.slice(1)} Priority
                      </span>
                      {isOverdue && (
                        <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:999,
                          background:'rgba(239,68,68,0.15)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.4)' }}>
                          ⚠ Overdue
                        </span>
                      )}
                      {ev.isDemo && <DemoBadge />}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                      <span>📁 {EV_CATEGORY_LABELS[ev.category] || ev.category}</span>
                      {ev.owner && <span>👤 {ev.owner}</span>}
                      {ev.dueDate && <span style={{ color: isOverdue ? '#ef4444' : 'inherit' }}>Due: {ev.dueDate}</span>}
                      <span>Updated: {ev.lastUpdated}</span>
                    </div>
                    {ev.notes && (
                      <div style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.6,
                        background:'var(--bg-secondary)', borderRadius:'var(--radius-sm)', padding:'6px 10px', marginBottom:8 }}>
                        {ev.notes}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>Update status:</span>
                      {['complete','partial','incomplete','missing'].map((st) => (
                        <button key={st} onClick={() => handleStatus(ev.id, st)} style={{
                          fontSize:10, padding:'2px 8px', borderRadius:'var(--radius-md)',
                          background: ev.status === st ? `${EV_STATUS_COLOURS[st]}22` : 'var(--bg-elevated)',
                          border:`1px solid ${ev.status === st ? EV_STATUS_COLOURS[st] : 'var(--border-muted)'}`,
                          color: ev.status === st ? EV_STATUS_COLOURS[st] : 'var(--text-muted)',
                          cursor:'pointer', fontWeight: ev.status === st ? 700 : 400,
                        }}>
                          {EV_STATUS_LABELS[st]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Run 12: Snapshot Timeline Panel ─────────────────────────────────────────
function SnapshotTimelinePanel({ snapshots = [], clientId }) {
  const clientSnaps = getSnapshotsByClientId(snapshots, clientId);
  return (
    <SectionCard title="Assessment Snapshot Timeline" icon="📈">
      {clientSnaps.length === 0 ? (
        <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-muted)', fontSize:13 }}>
          No assessment snapshots recorded for this client yet.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {clientSnaps.map((snap, i) => {
            const rColour = RISK_COLOURS[snap.riskLevel] || '#6b7280';
            const qColour = snap.quantumReadinessScore != null
              ? (snap.quantumReadinessScore >= 70 ? '#10b981' : snap.quantumReadinessScore >= 40 ? '#f59e0b' : '#ef4444')
              : '#6b7280';
            const sColour = snap.securityScore != null
              ? (snap.securityScore >= 70 ? '#10b981' : snap.securityScore >= 40 ? '#f59e0b' : '#ef4444')
              : '#6b7280';
            const evColour = snap.evidenceCompletionPercent != null
              ? (snap.evidenceCompletionPercent >= 70 ? '#10b981' : snap.evidenceCompletionPercent >= 40 ? '#f59e0b' : '#ef4444')
              : '#6b7280';
            return (
              <div key={snap.id} style={{
                display:'flex', gap:14, padding:'12px 16px',
                background: i === 0 ? 'rgba(0,212,255,0.04)' : 'var(--bg-tertiary)',
                border:`1px solid ${i === 0 ? 'rgba(0,212,255,0.2)' : 'var(--border-muted)'}`,
                borderRadius:'var(--radius-md)',
              }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background: i === 0 ? 'var(--accent)' : 'var(--border-default)', border:`2px solid ${i === 0 ? 'var(--accent)' : 'var(--border-muted)'}` }} />
                  {i < clientSnaps.length - 1 && <div style={{ width:2, flex:1, background:'var(--border-muted)', minHeight:20 }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{snap.snapshotDate}</span>
                    {i === 0 && <span style={{ fontSize:10, background:'rgba(0,212,255,0.15)', color:'var(--accent)', padding:'1px 7px', borderRadius:999, fontWeight:700 }}>Latest</span>}
                    <RiskChip level={snap.riskLevel} />
                    {snap.isDemo && <DemoBadge />}
                  </div>
                  <div style={{ display:'flex', gap:18, flexWrap:'wrap', marginBottom:6 }}>
                    {snap.quantumReadinessScore != null && <span style={{ fontSize:11, color:qColour, fontWeight:600 }}>⚛ Quantum: {snap.quantumReadinessScore}%</span>}
                    {snap.securityScore        != null && <span style={{ fontSize:11, color:sColour, fontWeight:600 }}>🛡 Security: {snap.securityScore}%</span>}
                    {snap.evidenceCompletionPercent != null && <span style={{ fontSize:11, color:evColour, fontWeight:600 }}>📂 Evidence: {snap.evidenceCompletionPercent}%</span>}
                    {snap.priorityActionCount  != null && <span style={{ fontSize:11, color:'#f97316', fontWeight:600 }}>⚡ Actions: {snap.priorityActionCount}</span>}
                  </div>
                  {snap.notes && <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>{snap.notes}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Run 12: Risk Comparison Dashboard ───────────────────────────────────────
function RiskComparisonDashboard({ clients = [], evidenceItems = [], reports = [] }) {
  const [compFilter, setCompFilter] = React.useState('all');
  const [compSort,   setCompSort]   = React.useState('risk');

  const summary = getPortfolioRiskSummary(clients, evidenceItems, reports);

  let rows = clients.filter((c) => !c.archived && c.status !== 'archived');
  if (compFilter === 'high')      rows = rows.filter((c) => c.riskLevel === 'high');
  if (compFilter === 'medium')    rows = rows.filter((c) => c.riskLevel === 'medium');
  if (compFilter === 'low')       rows = rows.filter((c) => c.riskLevel === 'low');
  if (compFilter === 'missing')   rows = rows.filter((c) => getMissingEvidenceForClient(evidenceItems, c.id).length > 0);
  if (compFilter === 'review')    rows = rows.filter((c) => c.assessmentStatus === 'review-needed');

  if (compSort === 'risk')         rows = compareClientsByRisk(rows);
  else if (compSort === 'quantum') rows = sortClientsByQuantumReadiness(rows);
  else if (compSort === 'security')rows = sortClientsBySecurityScore(rows);
  else if (compSort === 'missing') rows = [...rows].sort((a,b) => getMissingEvidenceForClient(evidenceItems, b.id).length - getMissingEvidenceForClient(evidenceItems, a.id).length);

  const metric = (label, value, colour, icon) => (
    <div style={{
      background:'var(--bg-secondary)', border:'1px solid var(--border-default)',
      borderRadius:'var(--radius-md)', padding:'10px 14px', textAlign:'center', flex:'1 1 110px',
    }}>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{icon} {label}</div>
      <div style={{ fontSize:20, fontWeight:800, color: colour || 'var(--text-primary)' }}>{value ?? '—'}</div>
    </div>
  );

  return (
    <div>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14, padding:'8px 12px',
        background:'rgba(139,92,246,0.04)', border:'1px solid rgba(139,92,246,0.15)', borderRadius:'var(--radius-sm)', lineHeight:1.7 }}>
        Risk scores and recommendations are advisory and require qualified human review.
        Quantum-readiness guidance does not guarantee legal, regulatory, or security compliance.
        Backend sync, verified evidence storage, and live audit trails are reserved for future upgrade runs.
      </div>

      {/* Portfolio metrics */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
        {metric('Total Clients',     summary.total,                       'var(--accent)',  '👥')}
        {metric('High Risk',         summary.highRisk,                    '#ef4444',       '🔴')}
        {metric('Medium Risk',       summary.mediumRisk,                  '#f59e0b',       '🟡')}
        {metric('Low Risk',          summary.lowRisk,                     '#10b981',       '🟢')}
        {metric('Avg Quantum Score', summary.avgQuantumScore != null ? `${summary.avgQuantumScore}%` : '—', '#8b5cf6', '⚛')}
        {metric('Avg Security Score',summary.avgSecurityScore != null ? `${summary.avgSecurityScore}%` : '—', '#3b82f6', '🛡')}
        {metric('Avg Evidence',      summary.avgEvidenceCompletion != null ? `${summary.avgEvidenceCompletion}%` : '—', '#f97316', '📂')}
        {metric('Missing Evidence',  summary.totalMissingEvidence,        '#ef4444',       '❌')}
        {metric('Priority Actions',  summary.totalPriorityActions,        '#f97316',       '⚡')}
      </div>

      {/* Filters + Sort */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14, alignItems:'center' }}>
        <select value={compFilter} onChange={(e) => setCompFilter(e.target.value)} className="form-input" style={{ flex:'0 0 150px' }}>
          <option value="all">All Clients</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
          <option value="missing">Missing Evidence</option>
          <option value="review">Needs Review</option>
        </select>
        <select value={compSort} onChange={(e) => setCompSort(e.target.value)} className="form-input" style={{ flex:'0 0 200px' }}>
          <option value="risk">Sort: Highest Risk First</option>
          <option value="quantum">Sort: Lowest Quantum Score</option>
          <option value="security">Sort: Lowest Security Score</option>
          <option value="missing">Sort: Most Missing Evidence</option>
        </select>
      </div>

      {/* Comparison table */}
      {rows.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)', fontSize:13,
          background:'var(--bg-secondary)', border:'1px dashed var(--border-muted)', borderRadius:'var(--radius-lg)' }}>
          No clients available for comparison.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {rows.map((client) => {
            const qColour = client.quantumReadinessScore != null
              ? (client.quantumReadinessScore >= 70 ? '#10b981' : client.quantumReadinessScore >= 40 ? '#f59e0b' : '#ef4444')
              : '#6b7280';
            const sColour = client.securityScore != null
              ? (client.securityScore >= 70 ? '#10b981' : client.securityScore >= 40 ? '#f59e0b' : '#ef4444')
              : '#6b7280';
            const evComp = getEvidenceCompletionForClient(evidenceItems, client.id);
            const evColour = evComp != null
              ? (evComp >= 70 ? '#10b981' : evComp >= 40 ? '#f59e0b' : '#ef4444')
              : '#6b7280';
            const missCount = getMissingEvidenceForClient(evidenceItems, client.id).length;
            const latestRpt = getLatestReportForClient(reports, client.id);
            const actions   = getPriorityActionsForClient(client, evidenceItems, reports);

            return (
              <div key={client.id} style={{
                background:'var(--bg-secondary)', border:'1px solid var(--border-default)',
                borderRadius:'var(--radius-lg)', padding:'14px 18px',
              }}>
                <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ flex:'1 1 160px' }}>
                    <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap', marginBottom:3 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{client.name}</span>
                      <RiskChip level={client.riskLevel} />
                      {client.isDemo && <DemoBadge />}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{client.sector}</div>
                  </div>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap', flex:'2 1 300px', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:qColour, fontWeight:700, minWidth:80 }}>⚛ {client.quantumReadinessScore != null ? `${client.quantumReadinessScore}%` : '—'}</span>
                    <span style={{ fontSize:12, color:sColour, fontWeight:700, minWidth:70 }}>🛡 {client.securityScore != null ? `${client.securityScore}%` : '—'}</span>
                    <span style={{ fontSize:12, color:evColour, fontWeight:700, minWidth:80 }}>📂 {evComp != null ? `${evComp}%` : '—'}</span>
                    {missCount > 0 && <span style={{ fontSize:12, color:'#ef4444', fontWeight:700 }}>❌ {missCount} missing</span>}
                    {actions.length > 0 && <span style={{ fontSize:12, color:'#f97316', fontWeight:700 }}>⚡ {actions.length} action{actions.length > 1 ? 's' : ''}</span>}
                    {latestRpt && (
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                        {REPORT_STATUS_LABELS[latestRpt.status] || latestRpt.status} · {latestRpt.updatedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Run 12: Urgent Actions Panel ────────────────────────────────────────────
function UrgentActionsPanel({ clients = [], evidenceItems = [], reports = [] }) {
  const activeClients = clients.filter((c) => !c.archived && c.status !== 'archived');
  const actions = getAllUrgentActions(activeClients, evidenceItems, reports);
  const PC = { high:'#ef4444', medium:'#f59e0b', low:'#6b7280' };

  return (
    <div>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14, padding:'8px 12px',
        background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'var(--radius-sm)', lineHeight:1.7 }}>
        These actions are advisory and require human consultant review. Risk scores and recommendations do not
        guarantee legal, regulatory, or security compliance.
      </div>

      {actions.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)', fontSize:13,
          background:'var(--bg-secondary)', border:'1px dashed var(--border-muted)', borderRadius:'var(--radius-lg)' }}>
          <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
          No urgent actions found across current active clients.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {actions.map((action) => {
            const pc = PC[action.priority] || '#6b7280';
            return (
              <div key={action.id} style={{
                background:'var(--bg-secondary)', border:`1px solid ${pc}33`,
                borderRadius:'var(--radius-lg)', padding:'14px 18px',
                borderLeft:`3px solid ${pc}`,
              }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{action.title}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:999,
                        background:`${pc}18`, color:pc, border:`1px solid ${pc}44`,
                        textTransform:'uppercase', letterSpacing:'0.04em' }}>
                        {action.priority}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4 }}>
                      <strong style={{ color:'var(--text-muted)' }}>Client:</strong> {action.clientName}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:6, lineHeight:1.6 }}>
                      {action.reason}
                    </div>
                    <div style={{ fontSize:11, color:'var(--accent)', fontStyle:'italic' }}>
                      💡 {action.suggestion}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Run 12: Missing Evidence Panel ──────────────────────────────────────────
function MissingEvidencePanel({ clients = [], evidenceItems = [], onStatusChange }) {
  const [statusMsg, setStatusMsg] = React.useState('');
  const today = new Date().toISOString().slice(0,10);

  const activeClients = clients.filter((c) => !c.archived && c.status !== 'archived');
  const allMissing = activeClients.flatMap((c) => {
    const missing = getMissingEvidenceForClient(evidenceItems, c.id);
    return missing.map((e) => ({ ...e, _clientName: c.name }));
  }).sort((a,b) => {
    const po = { high:0, medium:1, low:2 };
    return (po[a.priority] ?? 2) - (po[b.priority] ?? 2);
  });

  function handleStatus(id, status) {
    onStatusChange(id, status);
    setStatusMsg('Record updated successfully.');
    setTimeout(() => setStatusMsg(''), 2500);
  }

  return (
    <div>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14, padding:'8px 12px',
        background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:'var(--radius-sm)', lineHeight:1.7 }}>
        Evidence status reflects records currently available in the system and may be incomplete.
        Evidence file upload and backend storage are reserved for a future run.
      </div>

      {statusMsg && (
        <div style={{ marginBottom:12, padding:'6px 12px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius-sm)', fontSize:12, color:'#10b981', fontWeight:600 }}>
          ✅ {statusMsg}
        </div>
      )}

      {allMissing.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)', fontSize:13,
          background:'var(--bg-secondary)', border:'1px dashed var(--border-muted)', borderRadius:'var(--radius-lg)' }}>
          <div style={{ fontSize:32, marginBottom:10 }}>📂</div>
          No missing or incomplete evidence items found across active clients.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {allMissing.map((ev) => {
            const sc = EV_STATUS_COLOURS[ev.status] || '#6b7280';
            const pc = EV_PRIORITY_COLOURS[ev.priority] || '#6b7280';
            const isOverdue = ev.dueDate && ev.dueDate < today;
            return (
              <div key={ev.id} style={{
                background:'var(--bg-secondary)', border:`1px solid ${sc}33`,
                borderRadius:'var(--radius-lg)', padding:'12px 16px',
                borderLeft:`3px solid ${sc}`,
              }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{ev.title}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:999,
                        background:`${sc}18`, color:sc, border:`1px solid ${sc}44` }}>
                        {EV_STATUS_LABELS[ev.status] || ev.status}
                      </span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:999,
                        background:`${pc}18`, color:pc, border:`1px solid ${pc}44` }}>
                        {ev.priority?.charAt(0).toUpperCase() + ev.priority?.slice(1)} Priority
                      </span>
                      {isOverdue && (
                        <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:999,
                          background:'rgba(239,68,68,0.15)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.4)' }}>⚠ Overdue</span>
                      )}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                      <strong style={{ color:'var(--accent)' }}>{ev._clientName}</strong>
                      <span>📁 {EV_CATEGORY_LABELS[ev.category] || ev.category}</span>
                      {ev.owner && <span>👤 {ev.owner}</span>}
                      {ev.dueDate && <span style={{ color: isOverdue ? '#ef4444' : 'inherit' }}>Due: {ev.dueDate}</span>}
                    </div>
                    {ev.notes && (
                      <div style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:8 }}>
                        {ev.notes}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>Update:</span>
                      {['complete','partial','incomplete','missing','not-required'].map((st) => (
                        <button key={st} onClick={() => handleStatus(ev.id, st)} style={{
                          fontSize:10, padding:'2px 8px', borderRadius:'var(--radius-md)',
                          background: ev.status === st ? `${EV_STATUS_COLOURS[st]}22` : 'var(--bg-elevated)',
                          border:`1px solid ${ev.status === st ? EV_STATUS_COLOURS[st] : 'var(--border-muted)'}`,
                          color: ev.status === st ? EV_STATUS_COLOURS[st] : 'var(--text-muted)',
                          cursor:'pointer', fontWeight: ev.status === st ? 700 : 400,
                        }}>
                          {EV_STATUS_LABELS[st]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main ClientHub component ─────────────────────────────────────────────────
export default function ClientHub({ workspaceMode, onNavigate }) {
  const [cs,        setCs]        = useState(() => getConsultantState());
  const [mainState, setMainState] = useState(() => getState());
  const [view,      setView]      = useState(VIEW.LIST);
  const [selected,  setSelected]  = useState(null);   // client being viewed in workspace
  const [editing,   setEditing]   = useState(null);   // client being edited
  const [filter,    setFilter]    = useState(FILTER.ACTIVE);
  const [search,    setSearch]    = useState('');
  const [sortBy,    setSortBy]    = useState(SORT.NAME);
  const [demoMsg,   setDemoMsg]   = useState('');
  const [errorMsg,  setErrorMsg]  = useState('');
  // Run 12 — Report/Evidence/Snapshot data (from consultantStorage)
  const reports       = cs.reports       || [];
  const evidenceItems = cs.evidenceItems || [];
  const snapshots     = cs.snapshots     || [];

  const isDemo    = workspaceMode === 'demo';
  const isProduct = workspaceMode === 'product';
  const activePlanId = mainState?.settings?.activePlanId || 'starter';

  // Subscribe to consultant state changes
  useEffect(() => {
    const unsub1 = subscribeConsultant((s) => setCs(s));
    const unsub2 = subscribe((s) => setMainState(s));
    return () => { unsub1(); unsub2(); };
  }, []);

  // All clients, filtered by workspace mode
  const allClients = useMemo(() => {
    const clients = cs.clients || [];
    if (isProduct) return clients.filter((c) => !c.isDemo);
    return clients;
  }, [cs.clients, isProduct]);

  // Real (non-demo) active client count for plan limit
  const realClientCount = useMemo(() =>
    (cs.clients || []).filter((c) => !c.isDemo && !c.archived).length,
    [cs.clients]
  );

  // Apply filter → search → sort
  const visibleClients = useMemo(() => {
    let list = allClients;

    // Filter
    switch (filter) {
      case FILTER.ACTIVE:           list = list.filter((c) => !c.archived && c.status !== 'archived'); break;
      case FILTER.ARCHIVED:         list = list.filter((c) => c.archived || c.status === 'archived');  break;
      case FILTER.HIGH_RISK:        list = list.filter((c) => c.riskLevel === 'high' && !c.archived);   break;
      case FILTER.NEEDS_REVIEW:     list = list.filter((c) => c.assessmentStatus === 'review-needed' && !c.archived); break;
      case FILTER.MISSING_EVIDENCE: list = list.filter((c) => ['missing','incomplete'].includes(c.evidenceStatus) && !c.archived); break;
      default: break; // ALL
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (c.name         || '').toLowerCase().includes(q) ||
        (c.sector       || '').toLowerCase().includes(q) ||
        (c.contactName  || '').toLowerCase().includes(q) ||
        (c.contactEmail || '').toLowerCase().includes(q)
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case SORT.RISK: {
          const order = { high: 0, medium: 1, low: 2, unknown: 3 };
          return (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3);
        }
        case SORT.QUANTUM:
          return (b.quantumReadinessScore ?? -1) - (a.quantumReadinessScore ?? -1);
        case SORT.SECURITY:
          return (b.securityScore ?? -1) - (a.securityScore ?? -1);
        case SORT.LAST_ASSESSMENT:
          return (b.lastAssessmentDate || '').localeCompare(a.lastAssessmentDate || '');
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return list;
  }, [allClients, filter, search, sortBy]);

  // Handlers
  function handleLoadDemo() {
    try {
      loadDemoHubClients(DEMO_HUB_CLIENTS);
      loadDemoReportHistory(DEMO_REPORTS, DEMO_EVIDENCE_ITEMS, DEMO_SNAPSHOTS);
      setDemoMsg('Demo clients, reports, evidence, and snapshots loaded successfully.');
      setFilter(FILTER.ACTIVE);
      setTimeout(() => setDemoMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Could not load demo data. ' + err.message);
    }
  }

  function handleClearDemo() {
    try {
      clearDemoHubClients(DEMO_HUB_CLIENTS);
      clearDemoReportHistory(DEMO_REPORT_IDS, DEMO_EVIDENCE_IDS, DEMO_SNAPSHOT_IDS);
      setDemoMsg('Demo clients, reports, evidence, and snapshots cleared.');
      if (selected && selected.isDemo) { setSelected(null); setView(VIEW.LIST); }
      if ([VIEW.RISK_COMPARE, VIEW.URGENT, VIEW.MISSING_EV].includes(view)) setView(VIEW.LIST);
      setTimeout(() => setDemoMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Could not clear demo data.');
    }
  }

  function handleAdd(formData) {
    const limit = getClientLimitForPlan(activePlanId);
    if (limit !== null && realClientCount >= limit) {
      setErrorMsg('Client limit reached for the current plan. Upgrade path is prepared for a future run.');
      return;
    }
    try {
      createClient({ ...formData, isDemo: false });
      setView(VIEW.LIST);
      setFilter(FILTER.ACTIVE);
    } catch (err) {
      setErrorMsg('Could not add client. ' + err.message);
    }
  }

  function handleEdit(formData) {
    try {
      updateClient(editing.id, formData);
      // Update selected if viewing this client's workspace
      if (selected?.id === editing.id) {
        setSelected((prev) => ({ ...prev, ...formData }));
      }
      setEditing(null);
      setView(selected ? VIEW.WORKSPACE : VIEW.LIST);
    } catch (err) {
      setErrorMsg('Could not update client. ' + err.message);
    }
  }

  function handleOpenWorkspace(client) {
    setSelected(client);
    setView(VIEW.WORKSPACE);
  }

  function handleArchive(clientId) {
    archiveClient(clientId);
    if (selected?.id === clientId) { setSelected(null); setView(VIEW.LIST); }
  }

  function handleRestore(clientId) {
    restoreClient(clientId);
  }

  function handleStartEdit(client) {
    setEditing(client);
    setView(VIEW.EDIT);
  }

  // ── Render: client workspace ────────────────────────────────────────────────
  if (view === VIEW.WORKSPACE && selected) {
    return (
      <div>
        <PageHeader
          title="Client Workspace"
          subtitle="Quantum Compliance OS™ · Powered by 4P3X Intelligent AI™"
        />
        <ClientWorkspace
          client={selected}
          reports={reports}
          evidenceItems={evidenceItems}
          snapshots={snapshots}
          onBack={() => { setSelected(null); setView(VIEW.LIST); }}
          onEdit={handleStartEdit}
          onReportStatusChange={(id, status) => updateReportRecord(id, { status })}
          onEvidenceStatusChange={(id, status) => updateEvidenceRecord(id, { status })}
        />
      </div>
    );
  }

  // ── Render: add form ────────────────────────────────────────────────────────
  if (view === VIEW.ADD) {
    return (
      <div>
        <PageHeader title="Add Client" subtitle="Multi-Client Consultant Hub · Run 11" />
        <ClientForm
          title="New Client"
          onSave={handleAdd}
          onCancel={() => setView(VIEW.LIST)}
        />
      </div>
    );
  }

  // ── Render: edit form ───────────────────────────────────────────────────────
  if (view === VIEW.EDIT && editing) {
    return (
      <div>
        <PageHeader title="Edit Client" subtitle={editing.name} />
        <ClientForm
          title={`Edit — ${editing.name}`}
          initial={editing}
          onSave={handleEdit}
          onCancel={() => { setEditing(null); setView(selected ? VIEW.WORKSPACE : VIEW.LIST); }}
        />
      </div>
    );
  }

  // ── Render: risk comparison ────────────────────────────────────────────────
  if (view === VIEW.RISK_COMPARE) {
    return (
      <div>
        <PageHeader title="Risk Comparison Dashboard" subtitle="Portfolio-wide risk, scores, and evidence overview" />
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setView(VIEW.LIST)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, padding:0, display:'flex', alignItems:'center', gap:6 }}>
            ← Back to Client Hub
          </button>
        </div>
        <RiskComparisonDashboard clients={allClients} evidenceItems={evidenceItems} reports={reports} />
      </div>
    );
  }

  // ── Render: urgent actions ──────────────────────────────────────────────────
  if (view === VIEW.URGENT) {
    return (
      <div>
        <PageHeader title="Urgent Actions" subtitle="Advisory priority actions requiring consultant review" />
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setView(VIEW.LIST)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, padding:0, display:'flex', alignItems:'center', gap:6 }}>
            ← Back to Client Hub
          </button>
        </div>
        <UrgentActionsPanel clients={allClients} evidenceItems={evidenceItems} reports={reports} />
      </div>
    );
  }

  // ── Render: missing evidence ────────────────────────────────────────────────
  if (view === VIEW.MISSING_EV) {
    return (
      <div>
        <PageHeader title="Missing Evidence" subtitle="All clients with missing or incomplete evidence items" />
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setView(VIEW.LIST)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, padding:0, display:'flex', alignItems:'center', gap:6 }}>
            ← Back to Client Hub
          </button>
        </div>
        <MissingEvidencePanel clients={allClients} evidenceItems={evidenceItems} onStatusChange={(id, status) => updateEvidenceRecord(id, { status })} />
      </div>
    );
  }

  // ── Render: main list ───────────────────────────────────────────────────────
  const demoClientCount = allClients.filter((c) => c.isDemo).length;

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Multi-Client Consultant Hub"
        subtitle="Manage client assessments, risk status, quantum-readiness scores, and evidence progress from one consultant workspace."
      />

      {/* ── Workspace mode banner ────────────────────────────────────────── */}
      {isDemo && (
        <div style={{
          padding: '8px 14px', marginBottom: 14,
          background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 'var(--radius-md)', fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span>🎯</span>
          <span style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--warning)' }}>Demo Mode</strong> — Demo clients are shown. All demo content is labelled.
          </span>
          {demoClientCount === 0 ? (
            <button onClick={handleLoadDemo} style={{
              fontSize: 11, color: 'var(--warning)', background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)',
              padding: '3px 10px', cursor: 'pointer', fontWeight: 700, marginLeft: 'auto',
            }}>Load Demo Clients →</button>
          ) : (
            <button onClick={handleClearDemo} style={{
              fontSize: 11, color: 'var(--text-muted)', background: 'transparent',
              border: 'none', cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto',
            }}>Clear Demo Clients</button>
          )}
        </div>
      )}
      {isProduct && (
        <div style={{
          padding: '8px 14px', marginBottom: 14,
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span style={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: '#10b981' }}>Product Mode</strong> — Showing live clients only. Demo clients are hidden.
          </span>
        </div>
      )}

      {/* ── Plan limit banner ────────────────────────────────────────────── */}
      <PlanLimitBanner activePlanId={activePlanId} realClientCount={realClientCount} />

      {/* ── Feedback messages ────────────────────────────────────────────── */}
      {demoMsg && (
        <div style={{ marginBottom: 12, padding: '8px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#10b981', fontWeight: 600 }}>
          ✅ {demoMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ marginBottom: 12, padding: '8px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* ── Metrics ──────────────────────────────────────────────────────── */}
      {allClients.length > 0 && <MetricsRow clients={allClients} />}

      {/* ── Run 12 quick-nav panel ─────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <button onClick={() => setView(VIEW.RISK_COMPARE)} style={{
          fontSize:12, padding:'6px 14px', borderRadius:'var(--radius-md)',
          background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)',
          color:'#8b5cf6', cursor:'pointer', fontWeight:700,
        }}>📊 Risk Comparison</button>
        <button onClick={() => setView(VIEW.URGENT)} style={{
          fontSize:12, padding:'6px 14px', borderRadius:'var(--radius-md)',
          background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)',
          color:'#ef4444', cursor:'pointer', fontWeight:700,
        }}>⚡ Urgent Actions</button>
        <button onClick={() => setView(VIEW.MISSING_EV)} style={{
          fontSize:12, padding:'6px 14px', borderRadius:'var(--radius-md)',
          background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.3)',
          color:'#f97316', cursor:'pointer', fontWeight:700,
        }}>📂 Missing Evidence</button>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="form-input"
          style={{ flex: '1 1 200px', maxWidth: 280 }}
        />

        {/* Filter */}
        <select className="form-input" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: '0 0 160px' }}>
          <option value={FILTER.ALL}>All Clients</option>
          <option value={FILTER.ACTIVE}>Active</option>
          <option value={FILTER.ARCHIVED}>Archived</option>
          <option value={FILTER.HIGH_RISK}>High Risk</option>
          <option value={FILTER.NEEDS_REVIEW}>Needs Review</option>
          <option value={FILTER.MISSING_EVIDENCE}>Evidence Gaps</option>
        </select>

        {/* Sort */}
        <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ flex: '0 0 190px' }}>
          <option value={SORT.NAME}>Sort: Name</option>
          <option value={SORT.RISK}>Sort: Risk Level</option>
          <option value={SORT.QUANTUM}>Sort: Quantum Score</option>
          <option value={SORT.SECURITY}>Sort: Security Score</option>
          <option value={SORT.LAST_ASSESSMENT}>Sort: Last Assessment</option>
        </select>

        {/* Add client */}
        <ActionButton variant="primary" onClick={() => setView(VIEW.ADD)} style={{ flexShrink: 0 }}>
          + Add Client
        </ActionButton>
      </div>

      {/* ── Client list ──────────────────────────────────────────────────── */}
      {allClients.length === 0 ? (
        <EmptyClients onAdd={() => setView(VIEW.ADD)} onLoadDemo={handleLoadDemo} isProductMode={isProduct} />
      ) : visibleClients.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 24px',
          background: 'var(--bg-secondary)', border: '1px dashed var(--border-muted)',
          borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontSize: 13,
        }}>
          No clients match the current filter or search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isSelected={selected?.id === client.id}
              onOpen={handleOpenWorkspace}
              onEdit={handleStartEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 24, padding: '10px 14px',
        background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-muted)',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Quantum Compliance OS™</strong> ·
        Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™ ·
        Local-first · localStorage SSOT · Demo Mode shows the product · Product Mode runs the product.
        Records created in Product Mode are labelled live/local pending backend sync until a backend provider is connected.
        Connect Supabase via Settings → Backend Config to enable real multi-user sync.
        Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™
      </div>
    </div>
  );
}
