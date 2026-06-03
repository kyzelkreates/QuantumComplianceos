/**
 * QUANTUM COMPLIANCE OS™ — TargetAssessments.jsx
 * Run 9: Target Assessment Engine
 *
 * Passive-only, defensive, advisory. Authorised targets only.
 * No offensive scanning. No exploit checks. No credential testing.
 * No automated crawling. No payload injection.
 *
 * Sub-views rendered inline (registry, add, detail, checklist, findings, evidence, report).
 */
import React, { useState, useEffect, useCallback } from 'react';
import PageHeader    from '../components/PageHeader.jsx';
import SectionCard   from '../components/SectionCard.jsx';
import ActionButton  from '../components/ActionButton.jsx';
import EmptyState    from '../components/EmptyState.jsx';
import FormField     from '../components/FormField.jsx';
import RiskBadge     from '../components/RiskBadge.jsx';
import StatCard      from '../components/StatCard.jsx';

import {
  getTargets, getTarget, getTargetFindings, getTargetEvidence, getTargetScore,
  createTarget, updateTarget, deleteTarget,
  confirmAuthorisation, advanceTargetStatus,
  saveAllChecklistResponses, generateFindings,
  addManualFinding, updateFinding, deleteFinding,
  addEvidence, deleteEvidence,
  recomputeScores, loadDemoTargets, clearDemoTargets,
} from '../core/targetAssessmentStorage.js';

import {
  TARGET_TYPES, SCAN_MODES, TARGET_STATUS_LABELS,
  CHECKLIST_SECTIONS, CHECK_ANSWERS, FINDING_CATEGORIES,
  RISK_LEVELS, CONFIDENCE_LEVELS, FINDING_STATUSES,
} from '../core/targetAssessmentRules.js';

import { scoreColour, riskColour, confidenceLabel } from '../core/targetAssessmentScoring.js';
import { getState, subscribe } from '../core/storage.js';

// ─── Disclaimer / Safety Banner ───────────────────────────────────────────────
const ADVISORY_NOTE = 'This module is advisory only. All assessments require ownership or written authorisation. Browser-based passive checks may be limited. No legal or security guarantee is provided. Critical systems should be reviewed by qualified professionals.';
const REPORT_DISCLAIMER = 'This assessment is advisory and based on authorised passive review, questionnaire data, and uploaded evidence. It does not guarantee legal, regulatory, or security compliance. Critical systems should be reviewed by qualified security and compliance professionals.';
const BROWSER_LIMITATION = 'Browser-based passive checks may be limited by security restrictions (CORS). Scores and findings depend on the evidence and questionnaire answers you provide. Add manual evidence to improve confidence.';

// ─── View constants ───────────────────────────────────────────────────────────
const VIEW = {
  REGISTRY:  'registry',
  ADD:       'add',
  DETAIL:    'detail',
  CHECKLIST: 'checklist',
  FINDINGS:  'findings',
  EVIDENCE:  'evidence',
  REPORT:    'report',
};

// ─── Score bar component ──────────────────────────────────────────────────────
function ScoreBar({ label, score, confidence }) {
  const colour = scoreColour(score ?? 0);
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 'var(--text-sm)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: colour, fontWeight: 700 }}>{score ?? '—'}{score != null ? '/100' : ''}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score ?? 0}%`, background: colour, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

// ─── Demo badge ───────────────────────────────────────────────────────────────
function DemoBadge() {
  return (
    <span style={{
      fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em',
      padding: '2px 7px', borderRadius: 'var(--radius-full)',
      background: 'var(--warning-dim)', color: 'var(--warning)',
      border: '1px solid var(--warning)', marginLeft: 6,
    }}>DEMO DATA</span>
  );
}

// ─── Status pill ─────────────────────────────────────────────────────────────
function TargetStatusPill({ status }) {
  const label = TARGET_STATUS_LABELS[status] || status;
  const colours = {
    draft:                     { bg: 'var(--bg-surface)', color: 'var(--text-muted)' },
    awaiting_authorisation:    { bg: 'var(--warning-dim)', color: 'var(--warning)' },
    ready_for_review:          { bg: 'var(--info-dim)', color: 'var(--info)' },
    in_review:                 { bg: 'var(--accent-dim)', color: 'var(--accent)' },
    recommendations_generated: { bg: 'var(--success-dim)', color: 'var(--success)' },
    evidence_required:         { bg: 'var(--warning-dim)', color: 'var(--warning)' },
    report_ready:              { bg: 'var(--success-dim)', color: 'var(--success)' },
    closed:                    { bg: 'var(--bg-surface)', color: 'var(--text-muted)' },
    accepted_risk:             { bg: 'var(--danger-dim)', color: 'var(--danger)' },
  };
  const { bg, color } = colours[status] || colours.draft;
  return (
    <span style={{
      fontSize: 'var(--text-xs)', fontWeight: 600, padding: '3px 8px',
      borderRadius: 'var(--radius-full)', background: bg, color,
    }}>{label}</span>
  );
}

// ─── Auth gate banner ─────────────────────────────────────────────────────────
function AuthGateBanner() {
  return (
    <div style={{
      background: 'var(--danger-dim)', border: '1px solid var(--danger)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
      color: 'var(--danger)', fontSize: 'var(--text-sm)', fontWeight: 600,
    }}>
      🚫 Assessment blocked. You must confirm ownership or written authorisation before running any review.
    </div>
  );
}

// ─── Advisory banner ─────────────────────────────────────────────────────────
function AdvisoryBanner({ message }) {
  return (
    <div style={{
      background: 'var(--info-dim)', border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
      color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)',
    }}>ℹ️ {message}</div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function TargetAssessments({ workspaceMode = 'product', onNavigate }) {
  const isDemo    = workspaceMode === 'demo';
  const isProduct = workspaceMode === 'product';

  const [view,         setView]         = useState(VIEW.REGISTRY);
  const [activeTarget, setActiveTarget] = useState(null);  // id
  const [appState,     setAppState]     = useState(() => getState());
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = subscribe((s) => setAppState({ ...s }));
    return unsub;
  }, []);

  // Load demo targets when demo mode is on
  useEffect(() => {
    if (isDemo && !appState.demoTargetsLoaded) {
      loadDemoTargets();
    }
  }, [isDemo, appState.demoTargetsLoaded]);

  const targets = getTargets(workspaceMode);

  function openTarget(id) {
    setActiveTarget(id);
    setView(VIEW.DETAIL);
  }

  function backToRegistry() {
    setActiveTarget(null);
    setView(VIEW.REGISTRY);
  }

  // ─── Registry View ─────────────────────────────────────────────────────────
  if (view === VIEW.REGISTRY) {
    return (
      <div className="page-content">
        <PageHeader
          icon="🎯"
          title="Target Assessments"
          subtitle="Passive, authorised, defensive assessment of websites, web apps, APIs, and internal systems."
          actions={
            <ActionButton variant="primary" icon="+" onClick={() => setView(VIEW.ADD)}>
              Add Target
            </ActionButton>
          }
        />

        <AdvisoryBanner message={ADVISORY_NOTE} />

        {isDemo && (
          <div style={{
            background: 'var(--warning-dim)', border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-xs)', color: 'var(--warning)', marginBottom: 'var(--space-4)',
            fontWeight: 600,
          }}>
            🔶 Demo Mode active — targets below include fictional demo data. Switch to Product Mode to work with real targets only.
          </div>
        )}

        {isProduct && targets.length === 0 && (
          <EmptyState
            icon="🎯"
            title="No assessment targets yet"
            message="Add an authorised target to begin. You must own or have written permission to assess any target."
            action={
              <ActionButton variant="primary" onClick={() => setView(VIEW.ADD)}>
                Add First Target
              </ActionButton>
            }
          />
        )}

        {targets.length > 0 && (
          <SectionCard title="Assessment Targets" icon="🎯">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: 'left' }}>
                    {['Target', 'Type', 'Status', 'Auth', 'Overall Risk', 'Sec', 'Quantum', 'Evidence', 'Updated', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {targets.map((t) => {
                    const score = (appState.targetScores || []).find((sc) => sc.targetId === t.id);
                    const typeLabel = TARGET_TYPES.find((x) => x.value === t.targetType)?.label || t.targetType;
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-muted)', cursor: 'pointer' }}
                        onClick={() => openTarget(t.id)}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.targetName}
                          {t.isDemo && <DemoBadge />}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{typeLabel}</td>
                        <td style={{ padding: '10px 12px' }}><TargetStatusPill status={t.status} /></td>
                        <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)' }}>
                          {t.authorisationConfirmed
                            ? <span style={{ color: 'var(--success)' }}>✅ Confirmed</span>
                            : <span style={{ color: 'var(--warning)' }}>⚠ Pending</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {score ? (
                            <span style={{ color: riskColour(score.overallRiskLevel), fontWeight: 700, fontSize: 'var(--text-xs)' }}>
                              {score.overallRiskLevel}
                            </span>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: score ? scoreColour(score.securityReadinessScore) : 'var(--text-muted)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                          {score ? score.securityReadinessScore : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: score ? scoreColour(score.quantumReadinessScore) : 'var(--text-muted)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                          {score ? score.quantumReadinessScore : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: score ? scoreColour(score.evidenceCompletenessScore) : 'var(--text-muted)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                          {score ? score.evidenceCompletenessScore : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                          {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <ActionButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openTarget(t.id); }}>
                            Open →
                          </ActionButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    );
  }

  // ─── Add Target View ────────────────────────────────────────────────────────
  if (view === VIEW.ADD) {
    return <AddTargetView
      onSave={(target) => { setActiveTarget(target.id); setView(VIEW.DETAIL); }}
      onCancel={backToRegistry}
      isDemo={false}
    />;
  }

  // ─── Detail / sub-view dispatch ────────────────────────────────────────────
  if (activeTarget) {
    const target = getTarget(activeTarget);
    if (!target) { backToRegistry(); return null; }

    const findings = getTargetFindings(activeTarget);
    const evidence = getTargetEvidence(activeTarget);
    const score    = getTargetScore(activeTarget);

    const sharedProps = { target, findings, evidence, score, workspaceMode,
      onBack: backToRegistry,
      onViewChange: setView,
      onTargetUpdate: () => setAppState({ ...getState() }),
    };

    if (view === VIEW.CHECKLIST) return <ChecklistView {...sharedProps} />;
    if (view === VIEW.FINDINGS)  return <FindingsView {...sharedProps} />;
    if (view === VIEW.EVIDENCE)  return <EvidenceView {...sharedProps} />;
    if (view === VIEW.REPORT)    return <ReportView   {...sharedProps} />;
    return <DetailView {...sharedProps} />;
  }

  backToRegistry();
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD TARGET FORM
// ═══════════════════════════════════════════════════════════════════════════════
function AddTargetView({ onSave, onCancel, isDemo }) {
  const [form, setForm] = useState({
    targetName: '', targetType: 'website', targetUrl: '',
    businessOwner: '', technicalContact: '',
    assessmentPurpose: '', assessmentScope: '',
    scanMode: 'passive_web',
    authorisationConfirmed: false, authorisedBy: '',
    tags: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function f(field, val) { setForm((p) => ({ ...p, [field]: val })); }

  function validate() {
    const e = {};
    if (!form.targetName.trim())        e.targetName        = 'Target name is required.';
    if (!form.targetType)               e.targetType        = 'Target type is required.';
    if (!form.assessmentPurpose.trim()) e.assessmentPurpose = 'Assessment purpose is required.';
    if (!form.assessmentScope.trim())   e.assessmentScope   = 'Assessment scope is required.';
    if (!form.scanMode)                 e.scanMode          = 'Assessment mode is required.';
    if (form.targetType !== 'manual_only' && form.targetUrl.trim() &&
        !/^https?:\/\/.+/.test(form.targetUrl.trim())) {
      e.targetUrl = 'URL must start with https:// or http://';
    }
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const target = createTarget({ ...form, tags, isDemo });
    onSave(target);
  }

  const needsUrl = !['manual_only', 'internal_system'].includes(form.targetType);

  return (
    <div className="page-content">
      <PageHeader icon="➕" title="Add Assessment Target"
        subtitle="Add an authorised target for passive, defensive assessment."
        actions={<ActionButton variant="ghost" onClick={onCancel}>← Back</ActionButton>}
      />
      <AdvisoryBanner message={ADVISORY_NOTE} />

      <SectionCard title="Target Details" icon="🎯">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <FormField label="Target Name" required error={errors.targetName}>
            <input className="form-input" value={form.targetName}
              onChange={(e) => f('targetName', e.target.value)} placeholder="e.g. Customer Portal" />
          </FormField>
          <FormField label="Target Type" required error={errors.targetType}>
            <select className="form-select" value={form.targetType} onChange={(e) => f('targetType', e.target.value)}>
              {TARGET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </FormField>
        </div>

        {needsUrl && (
          <FormField label="Target URL / Domain" hint="e.g. https://app.example.com" error={errors.targetUrl}>
            <input className="form-input" value={form.targetUrl}
              onChange={(e) => f('targetUrl', e.target.value)} placeholder="https://" />
          </FormField>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <FormField label="Business Owner">
            <input className="form-input" value={form.businessOwner}
              onChange={(e) => f('businessOwner', e.target.value)} placeholder="Name, role" />
          </FormField>
          <FormField label="Technical Contact">
            <input className="form-input" value={form.technicalContact}
              onChange={(e) => f('technicalContact', e.target.value)} placeholder="Name, team" />
          </FormField>
        </div>

        <FormField label="Assessment Purpose" required error={errors.assessmentPurpose}
          hint="Why is this assessment being conducted?">
          <input className="form-input" value={form.assessmentPurpose}
            onChange={(e) => f('assessmentPurpose', e.target.value)}
            placeholder="e.g. Annual security review, ISO 27001 preparation" />
        </FormField>

        <FormField label="Assessment Scope" required error={errors.assessmentScope}
          hint="What is in scope? What is excluded?">
          <textarea className="form-textarea" rows={3} value={form.assessmentScope}
            onChange={(e) => f('assessmentScope', e.target.value)}
            placeholder="Describe what is in scope and any exclusions." />
        </FormField>

        <FormField label="Assessment Mode" required error={errors.scanMode}>
          <select className="form-select" value={form.scanMode} onChange={(e) => f('scanMode', e.target.value)}>
            {SCAN_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </FormField>

        <FormField label="Tags" hint="Comma-separated, e.g. gdpr, iso27001, pci">
          <input className="form-input" value={form.tags}
            onChange={(e) => f('tags', e.target.value)} placeholder="gdpr, pci, internal" />
        </FormField>

        <FormField label="Notes">
          <textarea className="form-textarea" rows={2} value={form.notes}
            onChange={(e) => f('notes', e.target.value)} />
        </FormField>
      </SectionCard>

      <SectionCard title="Authorisation" icon="✅">
        <div style={{
          background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)',
          fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7,
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> You must own this system or have written authorisation from the owner before running any assessment. Assessments without authorisation may constitute unauthorised access under applicable law.
        </div>

        <FormField label="Authorised By" hint="Name and role of the person authorising this assessment">
          <input className="form-input" value={form.authorisedBy}
            onChange={(e) => f('authorisedBy', e.target.value)} placeholder="Full name, job title" />
        </FormField>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: 'var(--space-2) 0' }}>
          <input type="checkbox" checked={form.authorisationConfirmed}
            onChange={(e) => f('authorisationConfirmed', e.target.checked)}
            style={{ marginTop: 3, accentColor: 'var(--accent)', width: 16, height: 16 }} />
          <span>
            <strong>I confirm I own this system or have written authorisation to assess it.</strong>
            <br />
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              This target will be saved as a draft. Assessment generation will be blocked until authorisation is confirmed.
            </span>
          </span>
        </label>

        {!form.authorisationConfirmed && (
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--warning)', padding: 'var(--space-2) var(--space-3)', background: 'var(--warning-dim)', borderRadius: 'var(--radius-sm)' }}>
            ⚠ Assessment generation will be blocked until authorisation is confirmed.
          </div>
        )}
      </SectionCard>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
        <ActionButton variant="primary" loading={saving} onClick={handleSave}>Save Target</ActionButton>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function DetailView({ target, findings, evidence, score, onBack, onViewChange, onTargetUpdate, workspaceMode }) {
  const [showAuthForm, setShowAuthForm]   = useState(false);
  const [authBy,       setAuthBy]         = useState(target.authorisedBy || '');
  const [generating,   setGenerating]     = useState(false);
  const [genResult,    setGenResult]      = useState(null);

  const typeLabel = TARGET_TYPES.find((x) => x.value === target.targetType)?.label || target.targetType;
  const modeLabel = SCAN_MODES.find((x) => x.value === target.scanMode)?.label || target.scanMode;
  const openFindings = findings.filter((f) => f.status === 'Open');

  function handleConfirmAuth() {
    confirmAuthorisation(target.id, authBy);
    setShowAuthForm(false);
    onTargetUpdate();
  }

  function handleGenerate() {
    setGenerating(true);
    const result = generateFindings(target.id);
    setGenResult(result);
    setGenerating(false);
    onTargetUpdate();
  }

  return (
    <div className="page-content">
      <PageHeader
        icon="🎯"
        title={<>{target.targetName}{target.isDemo && <DemoBadge />}</>}
        subtitle={`${typeLabel} · ${modeLabel}`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="ghost" size="sm" onClick={onBack}>← Registry</ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={() => onViewChange(VIEW.CHECKLIST)}>Checklist</ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={() => onViewChange(VIEW.FINDINGS)}>Findings ({findings.length})</ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={() => onViewChange(VIEW.EVIDENCE)}>Evidence ({evidence.length})</ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={() => onViewChange(VIEW.REPORT)}>Report Preview</ActionButton>
          </div>
        }
      />

      <AdvisoryBanner message={ADVISORY_NOTE} />

      {/* Authorisation status */}
      {!target.authorisationConfirmed ? (
        <div style={{
          background: 'var(--warning-dim)', border: '1px solid var(--warning)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: 'var(--text-sm)', marginBottom: 4 }}>⚠ Authorisation not yet confirmed</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Assessment generation is blocked until you confirm ownership or written authorisation.</div>
            </div>
            <ActionButton variant="primary" size="sm" onClick={() => setShowAuthForm(true)}>Confirm Authorisation</ActionButton>
          </div>
          {showAuthForm && (
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
              <FormField label="Authorised By" hint="Name and role of authorising person">
                <input className="form-input" value={authBy} onChange={(e) => setAuthBy(e.target.value)} placeholder="Full name, role" />
              </FormField>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer', marginBottom: 'var(--space-3)' }}>
                <input type="checkbox" id="auth-confirm" style={{ accentColor: 'var(--accent)' }} onChange={(e) => {
                  document.getElementById('auth-confirm-btn').disabled = !e.target.checked;
                }} />
                <span>I confirm I own this system or have written authorisation to assess it.</span>
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <ActionButton variant="ghost" size="sm" onClick={() => setShowAuthForm(false)}>Cancel</ActionButton>
                <ActionButton id="auth-confirm-btn" variant="primary" size="sm" disabled onClick={handleConfirmAuth}>Confirm</ActionButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: 'var(--success-dim)', border: '1px solid var(--success)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
          fontSize: 'var(--text-sm)', color: 'var(--success)', marginBottom: 'var(--space-4)',
          display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
        }}>
          <span>✅ Authorisation confirmed</span>
          {target.authorisedBy && <span style={{ color: 'var(--text-muted)' }}>by {target.authorisedBy}</span>}
          {target.authorisationConfirmedAt && <span style={{ color: 'var(--text-muted)' }}>on {new Date(target.authorisationConfirmedAt).toLocaleDateString('en-GB')}</span>}
        </div>
      )}

      {/* Scores */}
      {score ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <StatCard icon="🛡️" label="Security Readiness" value={`${score.securityReadinessScore}/100`} sub={`Advisory score · ${score.confidenceLevel} confidence`} />
          <StatCard icon="⚛️" label="Quantum Readiness" value={`${score.quantumReadinessScore}/100`} sub="Based on available evidence" />
          <StatCard icon="📁" label="Evidence Completeness" value={`${score.evidenceCompletenessScore}/100`} sub="Evidence coverage" />
          <StatCard icon="📋" label="Compliance Readiness" value={`${score.complianceReadinessScore}/100`} sub="Advisory only" />
          <StatCard icon="⚠️" label="Overall Risk" value={score.overallRiskLevel}
            sub={confidenceLabel(score.confidenceLevel)}
            status={<span style={{ color: riskColour(score.overallRiskLevel), fontSize: 'var(--text-xs)', fontWeight: 700 }}>●</span>} />
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)',
        }}>
          Complete the checklist and generate findings to see scores.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Overview */}
        <SectionCard title="Target Overview" icon="ℹ️">
          {[
            ['Type',         typeLabel],
            ['URL / Domain', target.targetUrl || '—'],
            ['Scope',        target.assessmentScope],
            ['Purpose',      target.assessmentPurpose],
            ['Mode',         modeLabel],
            ['Business Owner', target.businessOwner || '—'],
            ['Technical Contact', target.technicalContact || '—'],
            ['Status',       <TargetStatusPill status={target.status} />],
            ['Tags',         target.tags?.join(', ') || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 130 }}>{k}</span>
              <span style={{ color: 'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
          {target.notes && <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)' }}>{target.notes}</div>}
        </SectionCard>

        {/* Score details */}
        <SectionCard title="Score Breakdown" icon="📊">
          {score ? (
            <>
              <ScoreBar label="Security Readiness" score={score.securityReadinessScore} />
              <ScoreBar label="Quantum Readiness"  score={score.quantumReadinessScore} />
              <ScoreBar label="Evidence Completeness" score={score.evidenceCompletenessScore} />
              <ScoreBar label="Compliance Readiness" score={score.complianceReadinessScore} />

              <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {score.positiveFactors?.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <strong style={{ color: 'var(--success)' }}>✅ Positive factors:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>{score.positiveFactors.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
                {score.negativeFactors?.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <strong style={{ color: 'var(--danger)' }}>❌ Negative factors:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>{score.negativeFactors.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
                {score.priorityFixes?.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--warning)' }}>🔧 Priority fixes:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>{score.priorityFixes.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                )}
                <div style={{ marginTop: 'var(--space-3)', fontStyle: 'italic' }}>
                  {confidenceLabel(score.confidenceLevel)} · Calculated {new Date(score.calculatedAt).toLocaleDateString('en-GB')}
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-6)' }}>
              No scores yet. Complete the checklist and generate findings.
            </div>
          )}
        </SectionCard>
      </div>

      {/* Generate findings */}
      {target.authorisationConfirmed && (
        <SectionCard title="Generate Recommendations" icon="💡" style={{ marginTop: 'var(--space-4)' }}>
          <AdvisoryBanner message={BROWSER_LIMITATION} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
            Complete the passive checklist then generate findings and recommendations. Results are advisory and based on your checklist answers and uploaded evidence.
          </p>
          {genResult && (
            <div style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: genResult.ok ? 'var(--success)' : 'var(--danger)', background: genResult.ok ? 'var(--success-dim)' : 'var(--danger-dim)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
              {genResult.ok ? `✅ ${genResult.count} findings generated.` : `🚫 ${genResult.reason}`}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="secondary" onClick={() => onViewChange(VIEW.CHECKLIST)}>Open Checklist</ActionButton>
            <ActionButton variant="primary" loading={generating} onClick={handleGenerate}>Generate Findings &amp; Scores</ActionButton>
          </div>
        </SectionCard>
      )}

      {!target.authorisationConfirmed && <AuthGateBanner />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHECKLIST VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ChecklistView({ target, findings, evidence, score, onBack, onViewChange, onTargetUpdate }) {
  const [responses, setResponses] = useState(() => {
    // Deep clone to avoid mutating state
    const r = {};
    for (const [k, v] of Object.entries(target.checklistResponses || {})) {
      r[k] = { ...v };
    }
    return r;
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function setAnswer(itemId, answer) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), answer, updatedAt: new Date().toISOString() },
    }));
    setSaved(false);
  }
  function setNotes(itemId, notes) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), notes },
    }));
    setSaved(false);
  }

  function handleSave() {
    setSaving(true);
    saveAllChecklistResponses(target.id, responses);
    onTargetUpdate();
    setSaving(false);
    setSaved(true);
  }

  const totalItems    = CHECKLIST_SECTIONS.flatMap((s) => s.items).length;
  const answeredCount = Object.values(responses).filter((r) => r?.answer).length;

  return (
    <div className="page-content">
      <PageHeader
        icon="📋"
        title={`Passive Review Checklist — ${target.targetName}`}
        subtitle={`${answeredCount}/${totalItems} items answered`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="ghost" size="sm" onClick={() => onViewChange(VIEW.DETAIL)}>← Detail</ActionButton>
            <ActionButton variant="primary" size="sm" loading={saving} onClick={handleSave}>Save Checklist</ActionButton>
          </div>
        }
      />
      <AdvisoryBanner message={BROWSER_LIMITATION} />

      {!target.authorisationConfirmed && <AuthGateBanner />}

      {saved && <div style={{ marginBottom: 'var(--space-3)', color: 'var(--success)', fontSize: 'var(--text-sm)', background: 'var(--success-dim)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)' }}>✅ Checklist saved.</div>}

      {CHECKLIST_SECTIONS.map((section) => (
        <SectionCard key={section.id} title={section.label} icon={section.icon}>
          {section.items.map((item) => {
            const resp = responses[item.id] || {};
            return (
              <div key={item.id} style={{
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--border-muted)',
                display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {item.label}
                      {item.riskIfNo && (
                        <span style={{ marginLeft: 8, fontSize: 'var(--text-xs)', color: riskColour(item.riskIfNo), fontWeight: 700 }}>
                          [{item.riskIfNo} risk if No]
                        </span>
                      )}
                    </div>
                    {item.hint && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{item.hint}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                    {CHECK_ANSWERS.map((ans) => (
                      <button
                        key={ans.value}
                        onClick={() => setAnswer(item.id, ans.value)}
                        style={{
                          padding: '4px 10px', fontSize: 'var(--text-xs)', cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)', border: '1px solid',
                          borderColor: resp.answer === ans.value ? 'var(--accent)' : 'var(--border-default)',
                          background:  resp.answer === ans.value ? 'var(--accent-dim)' : 'var(--bg-surface)',
                          color:       resp.answer === ans.value ? 'var(--accent)' : 'var(--text-secondary)',
                          fontWeight:  resp.answer === ans.value ? 700 : 400,
                          transition: 'all 0.15s',
                        }}
                        title={ans.label}
                      >{ans.icon} {ans.label}</button>
                    ))}
                  </div>
                </div>
                {resp.answer && (
                  <input
                    className="form-input"
                    style={{ fontSize: 'var(--text-xs)' }}
                    placeholder="Optional notes..."
                    value={resp.notes || ''}
                    onChange={(e) => setNotes(item.id, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </SectionCard>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
        <ActionButton variant="ghost" onClick={() => onViewChange(VIEW.DETAIL)}>← Back to Detail</ActionButton>
        <ActionButton variant="primary" loading={saving} onClick={handleSave}>Save Checklist</ActionButton>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINDINGS VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function FindingsView({ target, findings, evidence, score, onBack, onViewChange, onTargetUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newF,    setNewF]    = useState({ title: '', category: 'Manual Review', riskLevel: 'Medium', businessImpact: '', recommendedFix: '', evidenceRequired: '' });

  function handleAddFinding() {
    const result = addManualFinding(target.id, newF);
    if (result.ok) { setShowAdd(false); setNewF({ title: '', category: 'Manual Review', riskLevel: 'Medium', businessImpact: '', recommendedFix: '', evidenceRequired: '' }); onTargetUpdate(); }
  }

  const sorted = [...findings].sort((a, b) => {
    const o = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return (o[a.riskLevel] ?? 4) - (o[b.riskLevel] ?? 4);
  });

  return (
    <div className="page-content">
      <PageHeader
        icon="💡"
        title={`Findings — ${target.targetName}`}
        subtitle={`${findings.length} findings · ${findings.filter((f) => f.status === 'Open').length} open`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="ghost" size="sm" onClick={() => onViewChange(VIEW.DETAIL)}>← Detail</ActionButton>
            {target.authorisationConfirmed && <ActionButton variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Add Manual Finding</ActionButton>}
          </div>
        }
      />
      <AdvisoryBanner message="Findings are advisory. Risk levels are based on available evidence and questionnaire answers. Confidence depends on evidence quality." />

      {!target.authorisationConfirmed && <AuthGateBanner />}

      {showAdd && (
        <SectionCard title="Add Manual Finding" icon="✏️">
          <FormField label="Title" required>
            <input className="form-input" value={newF.title} onChange={(e) => setNewF((p) => ({ ...p, title: e.target.value }))} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <FormField label="Category">
              <select className="form-select" value={newF.category} onChange={(e) => setNewF((p) => ({ ...p, category: e.target.value }))}>
                {FINDING_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Risk Level">
              <select className="form-select" value={newF.riskLevel} onChange={(e) => setNewF((p) => ({ ...p, riskLevel: e.target.value }))}>
                {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Business Impact">
            <textarea className="form-textarea" rows={2} value={newF.businessImpact} onChange={(e) => setNewF((p) => ({ ...p, businessImpact: e.target.value }))} />
          </FormField>
          <FormField label="Recommended Fix">
            <textarea className="form-textarea" rows={2} value={newF.recommendedFix} onChange={(e) => setNewF((p) => ({ ...p, recommendedFix: e.target.value }))} />
          </FormField>
          <FormField label="Evidence Required">
            <input className="form-input" value={newF.evidenceRequired} onChange={(e) => setNewF((p) => ({ ...p, evidenceRequired: e.target.value }))} />
          </FormField>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="ghost" onClick={() => setShowAdd(false)}>Cancel</ActionButton>
            <ActionButton variant="primary" onClick={handleAddFinding} disabled={!newF.title.trim()}>Save Finding</ActionButton>
          </div>
        </SectionCard>
      )}

      {sorted.length === 0 && (
        <EmptyState icon="💡" title="No findings yet"
          message="Complete the checklist and generate findings, or add manual findings above."
          action={<ActionButton variant="secondary" onClick={() => onViewChange(VIEW.CHECKLIST)}>Open Checklist</ActionButton>}
        />
      )}

      {sorted.map((f) => (
        <FindingCard key={f.id} finding={f} onUpdate={(payload) => { updateFinding(f.id, payload); onTargetUpdate(); }} onDelete={() => { deleteFinding(f.id); onTargetUpdate(); }} />
      ))}
    </div>
  );
}

function FindingCard({ finding, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [status,   setStatus]   = useState(finding.status);

  function handleStatusChange(s) {
    setStatus(s);
    onUpdate({ status: s });
  }

  return (
    <SectionCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
            <RiskBadge level={finding.riskLevel} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{finding.category}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Priority #{finding.priority}</span>
            {finding.isDemo && <DemoBadge />}
          </div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 4 }}>{finding.title}</div>
          {finding.businessImpact && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{finding.businessImpact}</div>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
          <select
            className="form-select"
            style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {FINDING_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <ActionButton variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>{expanded ? 'Less' : 'More'}</ActionButton>
            {!finding.isDemo && <ActionButton variant="ghost" size="sm" onClick={onDelete}>🗑</ActionButton>}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-muted)', fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            ['Technical Explanation', finding.technicalExplanation],
            ['Compliance Relevance',  finding.complianceRelevance],
            ['Quantum Relevance',     finding.quantumReadinessRelevance],
            ['Recommended Fix',       finding.recommendedFix],
            ['Evidence Required',     finding.evidenceRequired],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <strong style={{ color: 'var(--text-secondary)' }}>{k}:</strong>
              <div style={{ color: 'var(--text-primary)', marginTop: 2, lineHeight: 1.6 }}>{v}</div>
            </div>
          ))}
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Advisory finding · Confidence: {finding.confidenceLevel} · {finding.generatedFrom === 'manual' ? 'Manual' : 'Auto-generated from checklist'}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function EvidenceView({ target, findings, evidence, score, onBack, onViewChange, onTargetUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newE, setNewE] = useState({ evidenceTitle: '', evidenceType: 'note', description: '', source: '', reviewerNotes: '', findingId: '' });

  function handleAddEvidence() {
    addEvidence(target.id, newE);
    setShowAdd(false);
    setNewE({ evidenceTitle: '', evidenceType: 'note', description: '', source: '', reviewerNotes: '', findingId: '' });
    onTargetUpdate();
  }

  const EVIDENCE_TYPES = ['note', 'screenshot', 'document', 'configuration', 'report', 'log', 'certificate', 'other'];

  return (
    <div className="page-content">
      <PageHeader
        icon="📁"
        title={`Evidence — ${target.targetName}`}
        subtitle={`${evidence.length} evidence items`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="ghost" size="sm" onClick={() => onViewChange(VIEW.DETAIL)}>← Detail</ActionButton>
            <ActionButton variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Add Evidence</ActionButton>
          </div>
        }
      />
      <AdvisoryBanner message="Evidence improves score confidence. Attach documentation, screenshots, or configuration exports to support findings." />

      {showAdd && (
        <SectionCard title="Add Evidence" icon="➕">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <FormField label="Evidence Title" required>
              <input className="form-input" value={newE.evidenceTitle} onChange={(e) => setNewE((p) => ({ ...p, evidenceTitle: e.target.value }))} />
            </FormField>
            <FormField label="Evidence Type">
              <select className="form-select" value={newE.evidenceType} onChange={(e) => setNewE((p) => ({ ...p, evidenceType: e.target.value }))}>
                {EVIDENCE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Link to Finding" hint="Optional — link to a specific finding">
            <select className="form-select" value={newE.findingId} onChange={(e) => setNewE((p) => ({ ...p, findingId: e.target.value }))}>
              <option value="">— Not linked to a specific finding —</option>
              {findings.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
          </FormField>
          <FormField label="Description">
            <textarea className="form-textarea" rows={2} value={newE.description} onChange={(e) => setNewE((p) => ({ ...p, description: e.target.value }))} placeholder="What does this evidence show?" />
          </FormField>
          <FormField label="Source" hint="URL, file name, tool, or system name">
            <input className="form-input" value={newE.source} onChange={(e) => setNewE((p) => ({ ...p, source: e.target.value }))} />
          </FormField>
          <FormField label="Reviewer Notes">
            <input className="form-input" value={newE.reviewerNotes} onChange={(e) => setNewE((p) => ({ ...p, reviewerNotes: e.target.value }))} />
          </FormField>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="ghost" onClick={() => setShowAdd(false)}>Cancel</ActionButton>
            <ActionButton variant="primary" onClick={handleAddEvidence} disabled={!newE.evidenceTitle.trim()}>Save Evidence</ActionButton>
          </div>
        </SectionCard>
      )}

      {evidence.length === 0 && !showAdd && (
        <EmptyState icon="📁" title="No evidence yet"
          message="No evidence has been attached yet. Scores may have lower confidence. Add notes, screenshots, or document references to support your findings."
          action={<ActionButton variant="secondary" onClick={() => setShowAdd(true)}>Add Evidence</ActionButton>}
        />
      )}

      {evidence.map((e) => {
        const linkedFinding = findings.find((f) => f.id === e.findingId);
        return (
          <SectionCard key={e.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 'var(--radius-full)', textTransform: 'capitalize' }}>{e.evidenceType}</span>
                  {e.isDemo && <DemoBadge />}
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 4 }}>{e.evidenceTitle}</div>
                {e.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 4 }}>{e.description}</div>}
                {linkedFinding && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Linked to: {linkedFinding.title}</div>}
                {e.source && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Source: {e.source}</div>}
                {e.reviewerNotes && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>Notes: {e.reviewerNotes}</div>}
              </div>
              {!e.isDemo && (
                <ActionButton variant="ghost" size="sm" onClick={() => { deleteEvidence(e.id); onTargetUpdate(); }}>🗑</ActionButton>
              )}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function ReportView({ target, findings, evidence, score, onBack, onViewChange }) {
  const typeLabel = TARGET_TYPES.find((x) => x.value === target.targetType)?.label || target.targetType;
  const modeLabel = SCAN_MODES.find((x) => x.value === target.scanMode)?.label || target.scanMode;
  const openFindings = findings.filter((f) => f.status === 'Open');
  const now = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-content">
      <PageHeader
        icon="📄"
        title={`Report Preview — ${target.targetName}`}
        subtitle="Advisory report. For internal planning only. Not a certified security audit."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <ActionButton variant="ghost" size="sm" onClick={() => onViewChange(VIEW.DETAIL)}>← Detail</ActionButton>
            <ActionButton variant="secondary" size="sm" onClick={() => window.print()}>🖨 Print / PDF</ActionButton>
          </div>
        }
      />

      {target.isDemo && (
        <div style={{ background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--warning)', fontWeight: 700 }}>
          🔶 DEMO DATA — This report is generated from fictional demo data for demonstration purposes only.
        </div>
      )}

      <SectionCard>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-6)', borderBottom: '2px solid var(--border-default)' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>Quantum Compliance OS™</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Target Assessment Report</div>
            <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: 4 }}>{target.targetName}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{now} · Advisory · {modeLabel}</div>
            {target.isDemo && <div style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--warning)', fontWeight: 700 }}>FICTIONAL DEMO DATA — NOT A REAL ASSESSMENT</div>}
          </div>

          {/* Disclaimer */}
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Disclaimer: </strong>{REPORT_DISCLAIMER}
          </div>

          {/* Target overview */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>1. Target Overview</h2>
            {[
              ['Target Name',     target.targetName],
              ['Type',            typeLabel],
              ['URL / Domain',    target.targetUrl || 'Not specified'],
              ['Assessment Mode', modeLabel],
              ['Business Owner',  target.businessOwner || '—'],
              ['Purpose',         target.assessmentPurpose],
              ['Scope',           target.assessmentScope],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 140 }}>{k}:</span>
                <span style={{ color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Authorisation */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>2. Authorisation</h2>
            {target.authorisationConfirmed ? (
              <div style={{ background: 'var(--success-dim)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--success)' }}>
                ✅ Authorisation confirmed by {target.authorisedBy || 'unknown'} on {target.authorisationConfirmedAt ? new Date(target.authorisationConfirmedAt).toLocaleDateString('en-GB') : '—'}
              </div>
            ) : (
              <div style={{ background: 'var(--danger-dim)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>
                🚫 Authorisation not confirmed. This report should not be used without confirmed authorisation.
              </div>
            )}
          </div>

          {/* Scores */}
          {score && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>3. Advisory Scores</h2>
              <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', fontStyle: 'italic' }}>
                Scores are advisory and based on available evidence, questionnaire answers, and identified findings. {confidenceLabel(score.confidenceLevel)}.
              </div>
              <ScoreBar label="Security Readiness Score"    score={score.securityReadinessScore} />
              <ScoreBar label="Quantum Readiness Score"     score={score.quantumReadinessScore} />
              <ScoreBar label="Evidence Completeness Score" score={score.evidenceCompletenessScore} />
              <ScoreBar label="Compliance Readiness Score"  score={score.complianceReadinessScore} />
              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                <strong>Overall Risk Level:</strong>{' '}
                <span style={{ color: riskColour(score.overallRiskLevel), fontWeight: 700 }}>{score.overallRiskLevel}</span>
              </div>
            </div>
          )}

          {/* Findings */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>4. Findings &amp; Recommendations</h2>
            {openFindings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No open findings.</p>
            ) : (
              openFindings.map((f, i) => (
                <div key={f.id} style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>F{i + 1}. {f.title}</span>
                    <RiskBadge level={f.riskLevel} />
                  </div>
                  {[
                    ['Category',             f.category],
                    ['Business Impact',      f.businessImpact],
                    ['Technical Explanation',f.technicalExplanation],
                    ['Compliance Relevance', f.complianceRelevance],
                    ['Quantum Relevance',    f.quantumReadinessRelevance],
                    ['Recommended Fix',      f.recommendedFix],
                    ['Evidence Required',    f.evidenceRequired],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 'var(--text-xs)', display: 'flex', gap: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 140 }}>{k}:</span>
                      <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Evidence */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>5. Evidence Summary</h2>
            {evidence.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No evidence has been attached. Scores have lower confidence.</p>
            ) : (
              evidence.map((e) => (
                <div key={e.id} style={{ marginBottom: 8, fontSize: 'var(--text-xs)', display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 140, textTransform: 'capitalize' }}>{e.evidenceType}:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{e.evidenceTitle}{e.source ? ` — ${e.source}` : ''}</span>
                </div>
              ))
            )}
          </div>

          {/* Priority Actions */}
          {score?.priorityFixes?.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>6. Priority Action Plan</h2>
              <ol style={{ paddingLeft: 20, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 2 }}>
                {score.priorityFixes.map((fix, i) => <li key={i}>{fix}</li>)}
              </ol>
            </div>
          )}

          {/* Quantum summary */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)', paddingBottom: 8 }}>7. Quantum-Readiness Summary</h2>
            {score ? (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <p>Advisory Quantum Readiness Score: <strong style={{ color: scoreColour(score.quantumReadinessScore) }}>{score.quantumReadinessScore}/100</strong></p>
                <p>This score is based on questionnaire responses and available evidence regarding post-quantum cryptography readiness, including cryptographic inventory status, HNDL risk awareness, and PQC migration planning.</p>
                {findings.filter((f) => f.category === 'Quantum Readiness').length > 0 && (
                  <p>Quantum-related findings have been identified. Refer to the Findings section for details.</p>
                )}
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                  All quantum readiness assessments are advisory only. Engage qualified post-quantum cryptography specialists for migration planning.
                </p>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Complete the checklist to generate a quantum readiness score.</p>
            )}
          </div>

          {/* Footer disclaimer */}
          <div style={{ borderTop: '2px solid var(--border-default)', paddingTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Legal &amp; Advisory Disclaimer: </strong>{REPORT_DISCLAIMER}
            <br /><br />
            Generated by Quantum Compliance OS™ · Local-first · No backend · Defensive use only · {now}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
