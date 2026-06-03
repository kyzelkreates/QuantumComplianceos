/**
 * QUANTUM COMPLIANCE OS™ — Recommendations.jsx
 * Run 4: Recommendation Centre & Priority Action Plan
 * ====================================================
 * Consolidated view of all security and quantum recommendations,
 * risk heatmap, priority action plan, and technical remediation checklist.
 *
 * DEFENSIVE USE ONLY. No offensive tools. No live scanning.
 */

import React, { useState, useEffect, useMemo } from 'react';
import '../styles/forms.css';
import '../styles/cards.css';
import '../styles/navigation.css';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { getState, subscribe, updateRecommendationStatus } from '../core/storage.js';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';
import { PAGES } from '../core/constants.js';

const EFFORT_ORDER = { Low: 0, Medium: 1, High: 2 };
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const EFFORT_COLOUR = { Low: 'var(--success)', Medium: 'var(--warning)', High: 'var(--danger)' };

// Heatmap: likelihood × impact cells
const HEATMAP_LEVELS = ['Critical', 'High', 'Medium', 'Low'];
const HEATMAP_LIKELIHOOD = ['Very Likely', 'Likely', 'Possible', 'Unlikely'];
const HEATMAP_COLOUR = {
  'Critical-Very Likely': '#ef4444', 'Critical-Likely': '#ef4444', 'Critical-Possible': '#f97316', 'Critical-Unlikely': '#f97316',
  'High-Very Likely': '#f97316', 'High-Likely': '#f97316', 'High-Possible': '#eab308', 'High-Unlikely': '#eab308',
  'Medium-Very Likely': '#eab308', 'Medium-Likely': '#eab308', 'Medium-Possible': '#3b82f6', 'Medium-Unlikely': '#10b981',
  'Low-Very Likely': '#eab308', 'Low-Likely': '#3b82f6', 'Low-Possible': '#10b981', 'Low-Unlikely': '#10b981',
};

export default function Recommendations({ onNavigate, workspaceMode }) {
  const [state, setLocalState] = useState(() => getState());
  const [activeTab, setActiveTab] = useState('priority');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRec, setExpandedRec] = useState(null);

  useEffect(() => {
    const unsub = subscribe((s) => setLocalState({ ...s }));
    return unsub;
  }, []);

  const isDemo    = workspaceMode === WORKSPACE_MODE.DEMO || state.clientMode?.isDemoMode || state.settings?.demoMode;

  const allRecs = useMemo(() => {
    const recs = state.recommendationModel?.recommendations || [];
    const migration = state.recommendationModel?.migrationPriorities || [];
    // Deduplicate by id — migration priorities may already be in recs
    const seen = new Set();
    const combined = [...recs, ...migration].filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    return combined.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 3;
      const pb = PRIORITY_ORDER[b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      const ea = EFFORT_ORDER[a.effort] ?? 1;
      const eb = EFFORT_ORDER[b.effort] ?? 1;
      return ea - eb;
    });
  }, [state.recommendationModel]);

  const riskEntries = useMemo(() => state.riskModel?.riskEntries || [], [state.riskModel]);

  const domains = useMemo(() => {
    const d = new Set(allRecs.map((r) => r.domain).filter(Boolean));
    return ['all', ...Array.from(d)];
  }, [allRecs]);

  const filtered = useMemo(() => allRecs.filter((r) => {
    if (filterDomain !== 'all' && r.domain !== filterDomain) return false;
    if (filterPriority !== 'all' && r.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && (r.status || 'open') !== filterStatus) return false;
    return true;
  }), [allRecs, filterDomain, filterPriority, filterStatus]);

  const priorityActions = allRecs.filter((r) => ['critical', 'high'].includes(r.priority));
  const secScore = state.assessmentState?.securityAssessment?.securityImplementationScore;
  const qScore = state.assessmentState?.quantumReadiness?.quantumReadinessScore;
  const hasData = allRecs.length > 0;

  const TABS = [
    { id: 'priority', label: `Priority Actions (${priorityActions.length})` },
    { id: 'all', label: `All Recommendations (${allRecs.length})` },
    { id: 'heatmap', label: `Risk Heatmap (${riskEntries.length})` },
    { id: 'checklist', label: 'Technical Checklist' },
  ];

  return (
    <div>
      <PageHeader
        icon="💡"
        title="Recommendations"
        subtitle="Priority action plan, risk heatmap, and technical remediation checklist derived from your security and quantum assessments."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onNavigate && (
              <ActionButton variant="ghost" size="sm" onClick={() => onNavigate('consultant-copilot')}>🤖 Copilot</ActionButton>
            )}
            {onNavigate && !hasData && (
              <ActionButton variant="primary" onClick={() => onNavigate(PAGES.SECURITY_ASSESSMENT)}>
                Run Security Assessment →
              </ActionButton>
            )}
          </div>
        }
      />

      {/* Run 8.5 — Mode banner */}
      {isDemo && hasData && (
        <div style={{ padding: '8px 16px', marginBottom: '12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>🎯 <strong style={{ color: 'var(--warning)' }}>Demo Mode</strong> — Recommendations are derived from <strong>fictional demo assessment data</strong>. Not real security findings.</span>
        </div>
      )}

      {!hasData ? (
        <EmptyState onNavigate={onNavigate} workspaceMode={workspaceMode} />
      ) : (
        <>
          {/* Score context bar */}
          <ScoreContextBar secScore={secScore} qScore={qScore} totalRecs={allRecs.length} critCount={priorityActions.filter(r => r.priority === 'critical').length} />

          {/* Tabs */}
          <div className="tab-nav">
            {TABS.map((t) => (
              <button key={t.id} className={`tab-nav__item${activeTab === t.id ? ' tab-nav__item--active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {/* Priority Actions */}
          {activeTab === 'priority' && (
            <PriorityActionsPanel recs={priorityActions} expandedRec={expandedRec} setExpandedRec={setExpandedRec} onStatusChange={(id, s) => updateRecommendationStatus(id, s)} />
          )}

          {/* All Recommendations */}
          {activeTab === 'all' && (
            <AllRecsPanel recs={filtered} domains={domains} filterDomain={filterDomain} setFilterDomain={setFilterDomain}
              filterPriority={filterPriority} setFilterPriority={setFilterPriority}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              expandedRec={expandedRec} setExpandedRec={setExpandedRec}
              onStatusChange={(id, s) => updateRecommendationStatus(id, s)} />
          )}

          {/* Risk Heatmap */}
          {activeTab === 'heatmap' && (
            <RiskHeatmap riskEntries={riskEntries} />
          )}

          {/* Technical Checklist */}
          {activeTab === 'checklist' && (
            <TechnicalChecklist recs={allRecs} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onNavigate, workspaceMode }) {
  const isProduct = workspaceMode === 'product';
  return (
    <SectionCard title={isProduct ? "No Real Recommendations Yet" : "No Recommendations Yet"} icon="💡">
      <div style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.4 }}>💡</div>
        <h3 style={{ marginBottom: '10px' }}>
          {isProduct ? 'Complete a real assessment first' : 'Complete your assessments first'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, maxWidth: '460px', margin: '0 auto 24px' }}>
          {isProduct
            ? 'Recommendations are generated from real security and quantum readiness assessment results. Complete at least one real client assessment to populate this section.'
            : 'Recommendations are automatically generated from your Security Assessment and Quantum Readiness Assessment results. Complete at least one assessment and click "Score Assessment" to populate this section.'
          }
        </p>
        {onNavigate && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <ActionButton variant="primary" onClick={() => onNavigate(PAGES.SECURITY_ASSESSMENT)}>Security Assessment →</ActionButton>
            <ActionButton variant="secondary" onClick={() => onNavigate(PAGES.QUANTUM_READINESS)}>Quantum Readiness →</ActionButton>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─── Score Context Bar ────────────────────────────────────────────────────────
function ScoreContextBar({ secScore, qScore, totalRecs, critCount }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
      {[
        { label: 'Security Score', value: secScore != null ? `${secScore}%` : '—', colour: secScore >= 70 ? 'var(--success)' : secScore >= 50 ? 'var(--warning)' : 'var(--danger)' },
        { label: 'Quantum Readiness', value: qScore != null ? `${qScore}%` : '—', colour: qScore >= 60 ? 'var(--success)' : qScore >= 40 ? 'var(--warning)' : 'var(--danger)' },
        { label: 'Total Recommendations', value: totalRecs, colour: 'var(--text-primary)' },
        { label: 'Critical Priority', value: critCount, colour: critCount > 0 ? 'var(--danger)' : 'var(--success)' },
      ].map((kpi) => (
        <div key={kpi.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{kpi.label}</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: kpi.colour, lineHeight: 1 }}>{kpi.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Priority Actions Panel ───────────────────────────────────────────────────
function PriorityActionsPanel({ recs, expandedRec, setExpandedRec, onStatusChange }) {
  if (recs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
        No critical or high priority items. Your security posture is strong — continue to reassess regularly.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {recs.map((rec, idx) => (
        <RecCard key={rec.id} rec={rec} index={idx + 1} expanded={expandedRec === rec.id} onToggle={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}

// ─── All Recommendations Panel ────────────────────────────────────────────────
function AllRecsPanel({ recs, domains, filterDomain, setFilterDomain, filterPriority, setFilterPriority, filterStatus, setFilterStatus, expandedRec, setExpandedRec, onStatusChange }) {
  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select className="form-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="form-select" value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} style={{ width: 'auto', minWidth: '160px' }}>
          {domains.map((d) => <option key={d} value={d}>{d === 'all' ? 'All Domains' : d}</option>)}
        </select>
        <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="complete">Complete</option>
          <option value="accepted_risk">Accepted Risk</option>
        </select>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '4px' }}>{recs.length} shown</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recs.map((rec, idx) => (
          <RecCard key={rec.id} rec={rec} index={idx + 1} expanded={expandedRec === rec.id} onToggle={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)} onStatusChange={onStatusChange} />
        ))}
        {recs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>No recommendations match the selected filters.</div>
        )}
      </div>
    </div>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────
function RecCard({ rec, index, expanded, onToggle, onStatusChange }) {
  const isQuantum = rec.domainType === 'quantum' || rec.id?.startsWith('qrec_');
  const accentColour = isQuantum ? '#8b5cf6' : 'var(--accent)';
  const status = rec.status || 'open';

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${rec.priority === 'critical' ? 'rgba(239,68,68,0.3)' : expanded ? accentColour + '44' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'border-color 0.15s',
    }}>
      {/* Header — always visible */}
      <div style={{ display: 'flex', gap: '12px', padding: '14px 18px', cursor: 'pointer', alignItems: 'flex-start' }} onClick={onToggle}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', width: '28px', flexShrink: 0, marginTop: '2px' }}>
          {String(index).padStart(2, '0')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{rec.title}</span>
            <RiskBadge level={rec.priority} />
            {isQuantum && <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '999px', padding: '1px 6px', color: '#8b5cf6', fontWeight: 700 }}>⚛ PQC</span>}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>{rec.domainIcon} {rec.domain}</span>
            <span style={{ color: EFFORT_COLOUR[rec.effort] || 'var(--text-muted)' }}>Effort: {rec.effort}</span>
            <span>Impact: {rec.impact}</span>
            <span style={{ color: status === 'complete' ? 'var(--success)' : status === 'in_progress' ? 'var(--warning)' : 'var(--text-muted)' }}>
              {status === 'complete' ? '✓ Complete' : status === 'in_progress' ? '⟳ In Progress' : status === 'accepted_risk' ? '⚠ Accepted Risk' : '○ Open'}
            </span>
          </div>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-muted)', padding: '16px 18px 18px', background: 'var(--bg-tertiary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 14px' }}>{rec.detail}</p>

          {/* NIST/NCSC tags */}
          {(rec.nistAlignment?.length > 0 || rec.frameworks?.length > 0) && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {(rec.nistAlignment || rec.frameworks || []).map((f) => (
                <span key={f} style={{ fontSize: '10px', background: isQuantum ? 'rgba(139,92,246,0.1)' : 'var(--accent-dim)', border: `1px solid ${isQuantum ? 'rgba(139,92,246,0.3)' : 'var(--border-accent)'}`, borderRadius: '999px', padding: '1px 7px', color: isQuantum ? '#8b5cf6' : 'var(--accent)' }}>{f}</span>
              ))}
              {rec.ncscRef && <span style={{ fontSize: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '1px 7px', color: 'var(--text-muted)' }}>📋 {rec.ncscRef}</span>}
            </div>
          )}

          {/* Status control */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            {['open', 'in_progress', 'complete', 'accepted_risk'].map((s) => (
              <button key={s} onClick={() => onStatusChange(rec.id, s)} style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '999px', cursor: 'pointer',
                fontWeight: status === s ? 700 : 400,
                background: status === s ? (s === 'complete' ? 'rgba(16,185,129,0.15)' : s === 'in_progress' ? 'rgba(245,158,11,0.15)' : s === 'accepted_risk' ? 'rgba(239,68,68,0.1)' : 'var(--bg-elevated)') : 'transparent',
                border: `1px solid ${status === s ? (s === 'complete' ? 'var(--success)' : s === 'in_progress' ? 'var(--warning)' : s === 'accepted_risk' ? 'rgba(239,68,68,0.4)' : 'var(--accent)') : 'var(--border-default)'}`,
                color: status === s ? (s === 'complete' ? 'var(--success)' : s === 'in_progress' ? 'var(--warning)' : s === 'accepted_risk' ? 'var(--danger)' : 'var(--accent)') : 'var(--text-muted)',
              }}>
                {s === 'open' ? 'Open' : s === 'in_progress' ? 'In Progress' : s === 'complete' ? 'Complete' : 'Accepted Risk'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Risk Heatmap ─────────────────────────────────────────────────────────────
function RiskHeatmap({ riskEntries }) {
  const [selectedCell, setSelectedCell] = useState(null);

  const cellRisks = useMemo(() => {
    const map = {};
    for (const risk of riskEntries) {
      const key = `${risk.impact || 'Medium'}-${risk.likelihood || 'Possible'}`;
      if (!map[key]) map[key] = [];
      map[key].push(risk);
    }
    return map;
  }, [riskEntries]);

  const selectedRisks = selectedCell ? (cellRisks[selectedCell] || []) : [];

  return (
    <div>
      <SectionCard title="Risk Heatmap" icon="🗺️">
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          Click a cell to see risk items at that severity/likelihood intersection. Axes represent inherent risk before mitigation.
        </p>
        {/* Heatmap grid */}
        <div style={{ display: 'flex', gap: '0' }}>
          {/* Y-axis label */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '10px' }}>
            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Likelihood →</div>
          </div>
          <div style={{ flex: 1 }}>
            {/* Column headers (Impact) */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(4, 1fr)', gap: '3px', marginBottom: '3px' }}>
              <div />
              {HEATMAP_LEVELS.map((l) => (
                <div key={l} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px' }}>{l}</div>
              ))}
            </div>
            {/* Rows */}
            {HEATMAP_LIKELIHOOD.map((likelihood) => (
              <div key={likelihood} style={{ display: 'grid', gridTemplateColumns: '80px repeat(4, 1fr)', gap: '3px', marginBottom: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, paddingRight: '8px' }}>{likelihood}</div>
                {HEATMAP_LEVELS.map((impact) => {
                  const key = `${impact}-${likelihood}`;
                  const colour = HEATMAP_COLOUR[key] || '#6b7280';
                  const count = (cellRisks[key] || []).length;
                  const isSelected = selectedCell === key;
                  return (
                    <div key={key} onClick={() => setSelectedCell(isSelected ? null : key)} style={{
                      height: '52px', borderRadius: 'var(--radius-md)',
                      background: count > 0 ? `${colour}33` : 'var(--bg-elevated)',
                      border: `2px solid ${isSelected ? colour : count > 0 ? colour + '88' : 'var(--border-muted)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: count > 0 ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                    }}>
                      {count > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: colour, lineHeight: 1 }}>{count}</div>
                          <div style={{ fontSize: '9px', color: colour, fontWeight: 600 }}>item{count !== 1 ? 's' : ''}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected cell drill-down */}
        {selectedCell && selectedRisks.length > 0 && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
              {selectedCell.replace('-', ' Impact / ')} Likelihood — {selectedRisks.length} risk item{selectedRisks.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedRisks.map((r) => (
                <div key={r.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{r.ref}</span>
                  <span style={{ flex: 1 }}>{r.domainIcon} {r.domain}: {r.controlGap}</span>
                  <RiskBadge level={r.inherentRisk} />
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Full risk register table */}
      <SectionCard title={`Full Risk Register (${riskEntries.length} items)`} icon="📋">
        {riskEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No risk items. Complete an assessment first.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {['Ref', 'Domain', 'Severity', 'Likelihood', 'Impact', 'Control Gap', 'Type'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riskEntries.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-muted)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: r.domainType === 'quantum' ? '#8b5cf6' : 'var(--text-muted)' }}>{r.ref}</td>
                    <td style={{ padding: '8px 10px' }}>{r.domainIcon} {r.domain}</td>
                    <td style={{ padding: '8px 10px' }}><RiskBadge level={r.inherentRisk} /></td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{r.likelihood}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{r.impact}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.controlGap}</td>
                    <td style={{ padding: '8px 10px' }}>
                      {r.domainType === 'quantum'
                        ? <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>⚛ PQC</span>
                        : <span style={{ fontSize: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>🛡 Security</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Technical Checklist ──────────────────────────────────────────────────────
function TechnicalChecklist({ recs }) {
  const [checked, setChecked] = useState({});

  const byDomain = useMemo(() => {
    const map = {};
    for (const r of recs) {
      const domain = r.domain || 'General';
      if (!map[domain]) map[domain] = [];
      map[domain].push(r);
    }
    return map;
  }, [recs]);

  const totalItems = recs.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 700, color: checkedCount === totalItems ? 'var(--success)' : 'var(--text-primary)' }}>{checkedCount}</span>/{totalItems} items checked
        </div>
        <div style={{ height: '6px', width: '200px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%`, background: 'var(--success)', borderRadius: '999px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {Object.entries(byDomain).map(([domain, items]) => (
        <div key={domain} style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-muted)' }}>
            {items[0]?.domainIcon} {domain}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((rec) => (
              <label key={rec.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px 10px', background: checked[rec.id] ? 'rgba(16,185,129,0.06)' : 'var(--bg-secondary)', border: `1px solid ${checked[rec.id] ? 'rgba(16,185,129,0.3)' : 'var(--border-muted)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.12s' }}>
                <input type="checkbox" checked={!!checked[rec.id]} onChange={(e) => setChecked((c) => ({ ...c, [rec.id]: e.target.checked }))} style={{ marginTop: '2px', flexShrink: 0, accentColor: 'var(--success)', width: '14px', height: '14px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: checked[rec.id] ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: checked[rec.id] ? 'line-through' : 'none' }}>{rec.title}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <RiskBadge level={rec.priority} />
                    <span style={{ fontSize: '11px', color: EFFORT_COLOUR[rec.effort] || 'var(--text-muted)' }}>Effort: {rec.effort}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '12px' }}>
        Note: Checklist state is session-only and not persisted. Use the Reports page to export a permanent technical checklist.
      </p>
    </div>
  );
}
