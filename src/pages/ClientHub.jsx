/**
 * QUANTUM COMPLIANCE OS™ — ClientHub.jsx
 * Run 11: Multi-Client Consultant Hub
 * =====================================
 * Full multi-client management hub for the Pro Consultant tier.
 * Manages client records locally via consultantStorage.js (SSOT extension).
 * Client limit enforcement uses Run 10 plans.js config.
 *
 * Features:
 * - Client registry with summary cards
 * - Add / Edit / Archive / Restore client flows
 * - Client workspace detail panel
 * - Demo client seed data (5 fictional clients)
 * - Search, filter, sort
 * - Client limit enforcement (starter=1, pro=10, agency=50, wl=unlimited)
 * - Future placeholders for report history, risk comparison, backend sync, AI
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
} from '../core/consultantStorage.js';
import { getState, subscribe } from '../core/storage.js';
import {
  getCurrentPlan, isAtClientLimit, formatClientLimit,
  getClientLimitForPlan, PLANS,
} from '../core/plans.js';
import { DEMO_HUB_CLIENTS, DEMO_HUB_CLIENT_IDS } from '../core/clientHubSeedData.js';
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
  LIST:      'list',
  WORKSPACE: 'workspace',
  ADD:       'add',
  EDIT:      'edit',
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
function ClientWorkspace({ client, onBack, onEdit }) {
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

        {/* Future placeholders */}
        <SectionCard title="Coming in Future Runs" icon="🔮">
          {[
            ['📄 Report History',          'Report history will be added in Run 12.'],
            ['📊 Risk Comparison',          'Risk comparison will be added in Run 12.'],
            ['☁ Backend Sync',              'Backend sync will be added in a future run.'],
            ['🤖 AI-Assisted Insights',     'AI-assisted client insights will be added in a future run.'],
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
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
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
function EmptyClients({ onAdd, onLoadDemo }) {
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
      setDemoMsg('Demo clients loaded successfully.');
      setFilter(FILTER.ACTIVE);
      setTimeout(() => setDemoMsg(''), 3500);
    } catch (err) {
      setErrorMsg('Could not load demo clients. ' + err.message);
    }
  }

  function handleClearDemo() {
    try {
      clearDemoHubClients(DEMO_HUB_CLIENTS);
      setDemoMsg('Demo clients cleared.');
      if (selected && selected.isDemo) { setSelected(null); setView(VIEW.LIST); }
      setTimeout(() => setDemoMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Could not clear demo clients.');
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
          onBack={() => { setSelected(null); setView(VIEW.LIST); }}
          onEdit={handleStartEdit}
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
        <EmptyClients onAdd={() => setView(VIEW.ADD)} onLoadDemo={handleLoadDemo} />
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
        Local-first · No backend · No Supabase · RLS not applicable ·
        All client data stored in browser localStorage via consultantStorage.js ·
        Demo Mode shows the product. Live Mode runs the product. Backend connection will scale this consultant hub into a live SaaS platform in a future run.
      </div>
    </div>
  );
}
