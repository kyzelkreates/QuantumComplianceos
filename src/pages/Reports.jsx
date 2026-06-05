/**
 * QUANTUM COMPLIANCE OS™ — Reports.jsx
 * Run 4: Executive & Technical Report Engine
 * ==========================================
 * Full report rendering with JSON/CSV export, print layout,
 * white-label branding, and disclaimer injection.
 *
 * DEFENSIVE USE ONLY. No backend. No Supabase. All local.
 * Does not claim formal certification.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../styles/cards.css';
import '../styles/navigation.css';
import '../styles/forms.css';
import PageHeader from '../components/PageHeader.jsx';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import { getState, subscribe, saveReportSnapshot } from '../core/storage.js';
import { REPORT_SECTIONS } from '../core/reportSchema.js';
import { getScoreThreshold } from '../core/scoringEngine.js';
import { getQuantumScoreThreshold, computeOverallReadinessScore } from '../core/quantumScoringEngine.js';
import { formatDate } from '../utils/date.js';

const REPORT_TYPES = [
  { id: 'executive', label: 'Executive Summary', icon: '📊', desc: 'High-level overview for board and senior leadership.' },
  { id: 'technical', label: 'Technical Report', icon: '🔧', desc: 'Full technical detail for security and IT teams.' },
  { id: 'full', label: 'Full Report', icon: '📋', desc: 'Complete report — all sections included.' },
];

export default function Reports({ onNavigate, workspaceMode }) {
  const [state, setLocalState] = useState(() => getState());
  const [view, setView] = useState('builder'); // builder | report | history
  const [reportType, setReportType] = useState('full');
  const [includeSections, setIncludeSections] = useState(() => {
    const defaults = new Set(REPORT_SECTIONS.filter((s) => s.includeByDefault).map((s) => s.id));
    return defaults;
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const unsub = subscribe((s) => setLocalState({ ...s }));
    return unsub;
  }, []);

  const { organisation, systemProfiles, assessmentState, riskModel, recommendationModel, evidencePack, branding, settings, reportModel } = state;

  const secAssessment = assessmentState?.securityAssessment || {};
  const qReadiness    = assessmentState?.quantumReadiness || {};
  const secScore      = secAssessment.securityImplementationScore;
  const qScore        = qReadiness.quantumReadinessScore;
  const prevScore     = secAssessment.preventativeControlScore;
  const overallScore  = computeOverallReadinessScore(secScore, qScore);
  const hasAnyScore   = secScore != null || qScore != null;

  const reportHistory = reportModel?.history || [];

  // Run 8.5 — workspace mode
  const isDemo    = workspaceMode === WORKSPACE_MODE.DEMO || state.clientMode?.isDemoMode || state.settings?.demoMode;
  const isProduct = workspaceMode === WORKSPACE_MODE.PRODUCT && !state.clientMode?.isDemoMode;

  const handleGenerate = () => {
    const sections = Array.from(includeSections);
    const scoreSnapshot = { secScore, qScore, prevScore, overallScore, computedAt: new Date().toISOString() };
    const snapshot = saveReportSnapshot({ type: reportType, label: `${REPORT_TYPES.find(t => t.id === reportType)?.label} — ${new Date().toLocaleDateString('en-GB')}`, sections, scoreSnapshot, branding });
    setGeneratedReport({ type: reportType, sections, scoreSnapshot, snapshot });
    setView('report');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleExportJSON = () => {
    const data = buildExportData(state, Array.from(includeSections));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `qcos-report-${Date.now()}.json`);
  };

  const handleExportCSV = () => {
    const csv = buildCSVExport(state);
    const blob = new Blob([csv], { type: 'text/csv' });
    triggerDownload(blob, `qcos-risk-register-${Date.now()}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (id) => {
    const mandatory = REPORT_SECTIONS.find((s) => s.id === id)?.mandatory;
    if (mandatory) return;
    setIncludeSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (view === 'report' && generatedReport) {
    return (
      <ReportView
        state={state}
        reportConfig={generatedReport}
        branding={branding}
        settings={settings}
        onBack={() => setView('builder')}
        onPrint={handlePrint}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
        printRef={printRef}
      />
    );
  }

  if (view === 'history') {
    return (
      <ReportHistoryView
        history={reportHistory}
        onBack={() => setView('builder')}
        branding={branding}
      />
    );
  }

  // Builder view
  return (
    <div>
      <PageHeader
        icon="📋"
        title="Reports"
        subtitle="Generate executive and technical readiness reports. Export JSON or CSV. Print-ready layout included."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onNavigate && (
              <ActionButton variant="ghost" size="sm" onClick={() => onNavigate('consultant-copilot')}>🤖 Open Copilot</ActionButton>
            )}
            {reportHistory.length > 0 && (
              <ActionButton variant="ghost" size="sm" onClick={() => setView('history')}>History ({reportHistory.length})</ActionButton>
            )}
            <ActionButton variant="secondary" onClick={handleExportJSON}>⬇ Export JSON</ActionButton>
            <ActionButton variant="secondary" onClick={handleExportCSV}>⬇ Export CSV</ActionButton>
            <ActionButton variant="primary" onClick={handleGenerate}>Generate Report →</ActionButton>
          </div>
        }
      />

      {/* Run 8.5 — Mode banner */}
      {isDemo && (
        <div style={{ padding: '8px 16px', marginBottom: '12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>🎯</span>
          <span><strong style={{ color: 'var(--warning)' }}>Demo Mode</strong> — Report data is sourced from <strong>fictional demo client data</strong>. Not a real assessment output.</span>
        </div>
      )}
      {isProduct && !hasAnyScore && (
        <div style={{ padding: '8px 16px', marginBottom: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>🟢</span>
          <span><strong style={{ color: 'var(--success)' }}>Product Mode</strong> — No real assessments completed yet. Run security and quantum readiness assessments to generate real reports.</span>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--info)' }}>ℹ Readiness Assessment Only.</strong>{' '}
        Reports generated by this platform reflect defensive readiness posture based on self-reported assessment answers.
        They do not constitute formal audit, certification, or legal compliance.
        All reports include the mandatory defensive use disclaimer and should be reviewed by qualified security professionals.
      </div>

      {/* Data readiness */}
      <DataReadinessBar secScore={secScore} qScore={qScore} riskCount={riskModel?.riskEntries?.length} evCount={evidencePack?.items?.length} />

      {/* Report type */}
      <SectionCard title="Report Type" icon="📊">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {REPORT_TYPES.map((rt) => (
            <div key={rt.id} onClick={() => setReportType(rt.id)} style={{
              padding: '16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              border: `2px solid ${reportType === rt.id ? 'var(--accent)' : 'var(--border-muted)'}`,
              background: reportType === rt.id ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
              transition: 'all 0.12s',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{rt.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{rt.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rt.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section picker */}
      <SectionCard title="Report Sections" icon="📑">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {REPORT_SECTIONS.map((sec) => {
            const included = includeSections.has(sec.id);
            const mandatory = sec.mandatory;
            return (
              <div key={sec.id} onClick={() => toggleSection(sec.id)} style={{
                display: 'flex', gap: '12px', padding: '10px 14px',
                borderRadius: 'var(--radius-md)', cursor: mandatory ? 'default' : 'pointer',
                border: `1px solid ${included ? 'var(--border-accent)' : 'var(--border-muted)'}`,
                background: included ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                transition: 'all 0.12s', alignItems: 'center',
              }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: `2px solid ${included ? 'var(--accent)' : 'var(--border-default)'}`, background: included ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {included && <span style={{ color: '#000', fontSize: '10px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    {sec.order}. {sec.title}
                    {mandatory && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--danger)', fontWeight: 700 }}>Required</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{sec.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Branding preview */}
      <SectionCard title="Report Branding" icon="🎨">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
          {[
            ['Product Name', branding?.productName || 'Quantum Compliance OS'],
            ['Tagline', branding?.tagline || ''],
            ['Accent Colour', branding?.accentColour || '#00d4ff'],
            ['Organisation', organisation?.name || 'Not set'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      {/* ── Run 20: Handoff / Export Readiness Summary ──────────────────── */}
      <SectionCard title="Handoff Readiness Summary" icon="📋">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.7 }}>
          A quick handoff snapshot derived from current local records — no backend required.
          Copy or include in a client handover package.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
          {[
            { label: 'Client / Workspace',     value: state.branding?.logoText || state.branding?.productName || 'Current workspace' },
            { label: 'Security Score',          value: state.securityAssessment?.overallScore != null ? `${state.securityAssessment.overallScore}%` : '—' },
            { label: 'Quantum Readiness',       value: state.quantumReadiness?.overallScore   != null ? `${state.quantumReadiness.overallScore}%`   : '—' },
            { label: 'Risk Level',              value: state.securityAssessment?.riskLevel || '—' },
            { label: 'Evidence Items',          value: Array.isArray(state.evidenceItems) ? `${state.evidenceItems.length} items` : '—' },
            { label: 'Report History',          value: Array.isArray(state.reports) ? `${state.reports.length} reports` : '—' },
            { label: 'Product Mode',            value: state.settings?.workspaceMode === 'demo' ? '🎯 Demo Mode' : '💾 Live Local', colour: state.settings?.workspaceMode === 'demo' ? '#f59e0b' : '#00d4ff' },
            { label: 'Backend Status',          value: state.backendSettings ? '⚙ Config saved' : 'LocalStorage active' },
            { label: 'Date Generated',          value: new Date().toLocaleDateString('en-GB') },
            { label: 'Advisory Notice',         value: 'Human review required', colour: '#f59e0b' },
          ].map(({ label, value, colour }) => (
            <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: colour || 'var(--accent)' }}>{String(value)}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6, padding: '6px 10px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-sm)' }}>
          ⚠ Advisory only. Human review required. Full PDF export reserved for a future run.
          JSON/CSV export is available via the export buttons above.
        </div>
      </SectionCard>


    </div>
  );
}

// ─── Data Readiness Bar ───────────────────────────────────────────────────────
function DataReadinessBar({ secScore, qScore, riskCount, evCount }) {
  const items = [
    { label: 'Security Score', ready: secScore != null, value: secScore != null ? `${secScore}%` : 'Not run' },
    { label: 'Quantum Score', ready: qScore != null, value: qScore != null ? `${qScore}%` : 'Not run' },
    { label: 'Risk Items', ready: (riskCount || 0) > 0, value: riskCount || 0 },
    { label: 'Evidence Items', ready: (evCount || 0) > 0, value: evCount || 0 },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
      {items.map((it) => (
        <div key={it.label} style={{ background: 'var(--bg-secondary)', border: `1px solid ${it.ready ? 'rgba(16,185,129,0.3)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px' }}>{it.ready ? '✅' : '⭕'}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{it.label}</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: it.ready ? 'var(--success)' : 'var(--text-muted)' }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Report View ──────────────────────────────────────────────────────────────
function ReportView({ state, reportConfig, branding, settings, onBack, onPrint, onExportJSON, onExportCSV, printRef }) {
  const { organisation, systemProfiles, assessmentState, riskModel, recommendationModel, evidencePack } = state;
  const secA = assessmentState?.securityAssessment || {};
  const qR   = assessmentState?.quantumReadiness || {};
  const secScore = secA.securityImplementationScore;
  const qScore   = qR.quantumReadinessScore;
  const prevScore = secA.preventativeControlScore;
  const overallScore = computeOverallReadinessScore(secScore, qScore);
  const secThresh  = secScore != null ? getScoreThreshold(secScore) : null;
  const qThresh    = qScore != null ? getQuantumScoreThreshold(qScore) : null;
  const accentColour = branding?.accentColour || '#00d4ff';

  const sections = reportConfig.sections;
  const allRecs = [...(recommendationModel?.recommendations || []), ...(recommendationModel?.migrationPriorities || [])].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: #000 !important; }
          .print-page { background: white !important; color: #000 !important; padding: 24px !important; }
          .report-section { page-break-inside: avoid; }
          .report-section + .report-section { page-break-before: auto; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <ActionButton variant="ghost" onClick={onBack}>← Back to Builder</ActionButton>
        <div style={{ flex: 1 }} />
        <ActionButton variant="secondary" onClick={onExportJSON}>⬇ JSON</ActionButton>
        <ActionButton variant="secondary" onClick={onExportCSV}>⬇ CSV</ActionButton>
        <ActionButton variant="primary" onClick={onPrint}>🖨 Print / PDF</ActionButton>
      </div>

      {/* Report document */}
      <div className="print-page" ref={printRef} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '40px 48px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Report header / cover */}
        <div style={{ borderBottom: `3px solid ${accentColour}`, paddingBottom: '28px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '22px', color: accentColour, letterSpacing: '-0.3px', marginBottom: '4px' }}>
                {branding?.productName || 'Quantum Compliance OS™'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{branding?.tagline || 'Defensive Quantum-Readiness & Security Assessment'}</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {REPORT_TYPES.find(t => t.id === reportConfig.type)?.label || 'Full Report'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {organisation?.name || 'Organisation Name Not Set'} · Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
            {/* Score summary */}
            {(secScore != null || qScore != null) && (
              <div style={{ display: 'flex', gap: '16px' }}>
                {secScore != null && (
                  <div style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `1px solid ${secThresh?.colour}44` }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: secThresh?.colour, lineHeight: 1 }}>{secScore}%</div>
                    <div style={{ fontSize: '10px', color: secThresh?.colour, fontWeight: 700, textTransform: 'uppercase' }}>Security</div>
                  </div>
                )}
                {qScore != null && (
                  <div style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `1px solid ${qThresh?.colour}44` }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: qThresh?.colour, lineHeight: 1 }}>{qScore}%</div>
                    <div style={{ fontSize: '10px', color: qThresh?.colour, fontWeight: 700, textTransform: 'uppercase' }}>Quantum</div>
                  </div>
                )}
                {overallScore != null && (
                  <div style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `1px solid ${accentColour}44` }}>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: accentColour, lineHeight: 1 }}>{overallScore}%</div>
                    <div style={{ fontSize: '10px', color: accentColour, fontWeight: 700, textTransform: 'uppercase' }}>Overall</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        {sections.includes('executive_summary') && (
          <ReportSection title="Executive Summary" order={1} colour={accentColour}>
            <ExecutiveSummaryContent org={organisation} secScore={secScore} qScore={qScore} prevScore={prevScore} overallScore={overallScore} secThresh={secThresh} qThresh={qThresh} riskCount={riskModel?.riskEntries?.length || 0} recCount={allRecs.length} critCount={allRecs.filter(r => r.priority === 'critical').length} />
          </ReportSection>
        )}

        {sections.includes('organisation_profile') && (
          <ReportSection title="Organisation Profile" order={2} colour={accentColour}>
            <OrgProfileContent org={organisation} systems={systemProfiles} />
          </ReportSection>
        )}

        {sections.includes('system_inventory') && (
          <ReportSection title="System Inventory" order={3} colour={accentColour}>
            <SystemInventoryContent systems={systemProfiles} />
          </ReportSection>
        )}

        {sections.includes('security_assessment') && (
          <ReportSection title="Security Implementation Assessment" order={4} colour={accentColour}>
            <SecurityAssessmentContent secA={secA} secScore={secScore} secThresh={secThresh} prevScore={prevScore} />
          </ReportSection>
        )}

        {sections.includes('quantum_readiness') && (
          <ReportSection title="Quantum Readiness Assessment" order={5} colour={accentColour}>
            <QuantumReadinessContent qR={qR} qScore={qScore} qThresh={qThresh} />
          </ReportSection>
        )}

        {sections.includes('risk_register') && (
          <ReportSection title="Risk Register" order={7} colour={accentColour}>
            <RiskRegisterContent riskEntries={riskModel?.riskEntries || []} />
          </ReportSection>
        )}

        {sections.includes('priority_action_plan') && (
          <ReportSection title="Priority Action Plan" order={8} colour={accentColour}>
            <PriorityActionContent recs={allRecs} />
          </ReportSection>
        )}

        {sections.includes('nist_ncsc_alignment') && (
          <ReportSection title="NIST / NCSC Alignment Notes" order={9} colour={accentColour}>
            <NistAlignmentContent recs={allRecs} riskEntries={riskModel?.riskEntries || []} />
          </ReportSection>
        )}

        {sections.includes('evidence_pack') && (
          <ReportSection title="Evidence Pack Summary" order={10} colour={accentColour}>
            <EvidencePackContent evidencePack={evidencePack} />
          </ReportSection>
        )}

        {sections.includes('technical_remediation') && (
          <ReportSection title="Technical Remediation Checklist" order={11} colour={accentColour}>
            <TechRemediationContent recs={allRecs} />
          </ReportSection>
        )}

        {/* Mandatory disclaimer — always last */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
          <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>⚠ Mandatory Disclaimer</div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            {settings?.reportDisclaimer || 'This report is produced by Quantum Compliance OS™ for defensive security readiness assessment and post-quantum migration planning purposes only. It does not constitute legal, regulatory, or professional compliance advice. No offensive testing, exploitation, or unauthorised scanning was performed. All findings and recommendations should be reviewed by qualified security and compliance professionals before any operational decisions are made. Compliance with any regulatory framework cannot be guaranteed by this assessment alone.'}
          </p>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Generated: {new Date().toISOString()} · {branding?.productName || 'Quantum Compliance OS™'} — Local-First, No Backend, Defensive Assessment Only
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Report Section Wrapper ───────────────────────────────────────────────────
function ReportSection({ title, order, colour, children }) {
  return (
    <div className="report-section" style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: `${colour}22`, border: `1px solid ${colour}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: colour, flexShrink: 0 }}>{order}</div>
        <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-muted)' }} />
      </div>
      {children}
    </div>
  );
}

// ─── Section Content Components ───────────────────────────────────────────────

function ExecutiveSummaryContent({ org, secScore, qScore, prevScore, overallScore, secThresh, qThresh, riskCount, recCount, critCount }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
        This report presents the defensive security readiness and post-quantum cryptographic exposure assessment for <strong>{org?.name || '[Organisation Name]'}</strong>
        {org?.sector ? `, operating in the ${org.sector} sector` : ''}{org?.country ? ` in ${org.country}` : ''}.
        The assessment was conducted using the Quantum Compliance OS™ platform and reflects self-reported defensive readiness posture across {secScore != null ? '12 security control domains' : 'the completed assessment domains'}.
      </p>
      {/* Score table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Security Implementation Score', value: secScore != null ? `${secScore}% — ${secThresh?.label}` : 'Not assessed', colour: secThresh?.colour },
          { label: 'Preventative Control Score', value: prevScore != null ? `${prevScore}%` : 'Not assessed', colour: null },
          { label: 'Quantum Readiness Score', value: qScore != null ? `${qScore}% — ${qThresh?.label}` : 'Not assessed', colour: qThresh?.colour },
          { label: 'Overall Readiness Score', value: overallScore != null ? `${overallScore}%` : 'Not assessed', colour: 'var(--accent)' },
          { label: 'Risk Items Identified', value: riskCount, colour: riskCount > 10 ? 'var(--danger)' : riskCount > 5 ? 'var(--warning)' : 'var(--success)' },
          { label: 'Priority Recommendations', value: `${recCount} total, ${critCount} critical`, colour: critCount > 0 ? 'var(--danger)' : 'var(--text-muted)' },
        ].map(({ label, value, colour }) => (
          <div key={label} style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: colour || 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
      {org?.complianceNeeds?.length > 0 && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Applicable frameworks:</strong>{' '}
          {org.complianceNeeds.join(' · ')}
        </div>
      )}
    </div>
  );
}

function OrgProfileContent({ org, systems }) {
  if (!org?.name) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Organisation profile not completed.</p>;
  const activeSystems = (systems || []).filter(s => !s.archived);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
      {[
        ['Organisation', org.name], ['Sector', org.sector], ['Size', org.size], ['Country', org.country],
        ['Contact', org.contactName], ['Data Sensitivity', org.dataSensitivityLevel],
        ['Active Systems', activeSystems.length], ['Compliance Needs', org.complianceNeeds?.join(', ')],
      ].map(([k, v]) => v ? (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-muted)', paddingBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
          <span style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
        </div>
      ) : null)}
    </div>
  );
}

function SystemInventoryContent({ systems }) {
  const active = (systems || []).filter(s => !s.archived);
  if (active.length === 0) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No systems in inventory.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {active.map((sys) => (
        <div key={sys.id} style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>{sys.name}</span>
            <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '1px 7px', fontSize: '10px', color: 'var(--text-muted)' }}>{sys.type}</span>
            <RiskBadge level={sys.criticality} />
            <span style={{ color: 'var(--text-muted)' }}>{sys.environment}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span>Cloud: {sys.cloudProvider}</span>
            <span>Backup: {sys.backupStatus}</span>
            <span>Auth: {sys.authMethods?.slice(0, 2).join(', ')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityAssessmentContent({ secA, secScore, secThresh, prevScore }) {
  if (secScore == null) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Security assessment not yet completed.</p>;
  const catScores = secA.categoryScores || [];
  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: secThresh?.colour, lineHeight: 1 }}>{secScore}%</div>
          <div style={{ fontSize: '11px', color: secThresh?.colour, fontWeight: 600 }}>Security Score — {secThresh?.label}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--info)', lineHeight: 1 }}>{prevScore ?? '—'}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Preventative Control Score</div>
        </div>
      </div>
      {catScores.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
          {catScores.map((cat) => (
            <div key={cat.categoryId} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>{cat.categoryIcon}</span>
              <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{cat.categoryLabel}</span>
              <span style={{ fontWeight: 700, color: cat.threshold?.colour }}>{cat.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuantumReadinessContent({ qR, qScore, qThresh }) {
  if (qScore == null) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quantum readiness assessment not yet completed.</p>;
  const catScores = qR.categoryScores || [];
  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { label: `Quantum Readiness — ${qThresh?.label}`, value: `${qScore}%`, colour: qThresh?.colour },
          { label: 'Crypto-Agility Score', value: qR.cryptoAgilityScore != null ? `${qR.cryptoAgilityScore}%` : '—', colour: 'var(--text-primary)' },
          { label: 'HNDL Risk Score', value: qR.hndlRiskScore != null ? `${qR.hndlRiskScore}/100` : '—', colour: (qR.hndlRiskScore || 0) >= 70 ? 'var(--danger)' : 'var(--warning)' },
        ].map(({ label, value, colour }) => (
          <div key={label} style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: colour, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>
      {qR.ncscPhase && (
        <div style={{ padding: '10px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#8b5cf6' }}>NCSC Phase Alignment:</strong> Phase {qR.ncscPhase.phase} — {qR.ncscPhase.label} ({qR.ncscPhase.timeline})
        </div>
      )}
      {catScores.length > 0 && (
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
          {catScores.map((cat) => (
            <div key={cat.categoryId} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>{cat.categoryIcon}</span>
              <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{cat.categoryLabel}</span>
              <span style={{ fontWeight: 700, color: cat.threshold?.colour }}>{cat.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RiskRegisterContent({ riskEntries }) {
  if (riskEntries.length === 0) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No risk items generated. Complete an assessment first.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
            {['Ref', 'Domain', 'Severity', 'Likelihood', 'Impact', 'Control Gap', 'Type'].map((h) => (
              <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.5px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {riskEntries.map((r, i) => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-muted)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
              <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: r.domainType === 'quantum' ? '#8b5cf6' : 'var(--accent)' }}>{r.ref}</td>
              <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{r.domainIcon} {r.domain}</td>
              <td style={{ padding: '6px 8px' }}><RiskBadge level={r.inherentRisk} /></td>
              <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{r.likelihood}</td>
              <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{r.impact}</td>
              <td style={{ padding: '6px 8px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.controlGap}</td>
              <td style={{ padding: '6px 8px' }}><span style={{ fontSize: '9px', fontWeight: 700, color: r.domainType === 'quantum' ? '#8b5cf6' : 'var(--accent)' }}>{r.domainType === 'quantum' ? '⚛ PQC' : '🛡 Sec'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriorityActionContent({ recs }) {
  const priority = recs.filter(r => ['critical', 'high'].includes(r.priority));
  if (priority.length === 0) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No priority actions. Excellent security posture — no critical/high gaps identified.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {priority.slice(0, 15).map((rec, i) => (
        <div key={rec.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '12px', border: `1px solid ${rec.priority === 'critical' ? 'rgba(239,68,68,0.25)' : 'var(--border-muted)'}` }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', width: '24px', flexShrink: 0 }}>{i + 1}.</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.title}</span>
              <RiskBadge level={rec.priority} />
              {rec.domainType === 'quantum' && <span style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 700 }}>⚛ PQC</span>}
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{rec.detail?.slice(0, 200)}{rec.detail?.length > 200 ? '…' : ''}</div>
            <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(rec.nistAlignment || rec.frameworks || []).slice(0, 3).map(f => (
                <span key={f} style={{ fontSize: '9px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '1px 5px', color: 'var(--text-muted)' }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0, fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
            <div>Effort: {rec.effort}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NistAlignmentContent({ recs, riskEntries }) {
  const frameworks = {};
  for (const rec of recs) {
    for (const f of (rec.nistAlignment || rec.frameworks || [])) {
      if (!frameworks[f]) frameworks[f] = [];
      frameworks[f].push(rec.title);
    }
  }
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
        The following framework mappings have been identified based on assessment findings. These mappings are indicative only and do not constitute formal compliance verification.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(frameworks).slice(0, 15).map(([framework, titles]) => (
          <div key={framework} style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>{framework}</div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{titles.slice(0, 3).join(' · ')}{titles.length > 3 ? ` +${titles.length - 3} more` : ''}</div>
          </div>
        ))}
        {Object.keys(frameworks).length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Complete an assessment to generate framework alignment notes.</p>}
      </div>
      <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
        <strong style={{ color: '#8b5cf6' }}>NIST PQC Standards:</strong> FIPS 203 (ML-KEM/Kyber) · FIPS 204 (ML-DSA/Dilithium) · FIPS 205 (SLH-DSA/SPHINCS+) — Finalised August 2024
      </div>
    </div>
  );
}

function EvidencePackContent({ evidencePack }) {
  const items = evidencePack?.items || [];
  const collected = items.filter(i => ['collected', 'reviewed'].includes(i.status)).length;
  if (items.length === 0) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Evidence pack not yet built. Use the Evidence Pack page to add items.</p>;
  return (
    <div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{items.length} items tracked · {collected} collected or reviewed ({items.length > 0 ? Math.round((collected / items.length) * 100) : 0}% complete)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
        {items.map((item) => {
          const statusColour = item.status === 'reviewed' ? 'var(--success)' : item.status === 'collected' ? 'var(--info)' : item.status === 'in_progress' ? 'var(--warning)' : 'var(--text-muted)';
          return (
            <div key={item.id} style={{ display: 'flex', gap: '10px', padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: statusColour, width: '70px', flexShrink: 0 }}>{item.status.replace('_', ' ')}</span>
              <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{item.controlName}</span>
              {item.framework && <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{item.framework.split('/')[0].trim()}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TechRemediationContent({ recs }) {
  if (recs.length === 0) return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No remediation items. Complete an assessment to generate the technical checklist.</p>;
  const byDomain = {};
  for (const r of recs) {
    if (!byDomain[r.domain]) byDomain[r.domain] = [];
    byDomain[r.domain].push(r);
  }
  return (
    <div>
      {Object.entries(byDomain).map(([domain, items]) => (
        <div key={domain} style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '1px solid var(--border-muted)' }}>
            {items[0]?.domainIcon} {domain}
          </div>
          {items.map((rec, i) => (
            <div key={rec.id} style={{ display: 'flex', gap: '8px', padding: '6px 0', fontSize: '12px', borderBottom: '1px solid var(--border-muted)', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', width: '20px', flexShrink: 0 }}>□</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{rec.title}</span>
                <span style={{ marginLeft: '8px' }}><RiskBadge level={rec.priority} /></span>
                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>Effort: {rec.effort}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Report History View ──────────────────────────────────────────────────────
function ReportHistoryView({ history, onBack, branding }) {
  return (
    <div>
      <PageHeader icon="📋" title="Report History" subtitle={`${history.length} reports generated`}
        actions={<ActionButton variant="secondary" onClick={onBack}>← Back to Builder</ActionButton>} />
      {history.length === 0 ? (
        <SectionCard title="No Reports Generated" icon="📋">
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Generate your first report from the Reports builder.</div>
        </SectionCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((snap) => (
            <div key={snap.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{snap.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(snap.generatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {snap.scoreSnapshot?.secScore != null && ` · Security: ${snap.scoreSnapshot.secScore}%`}
                  {snap.scoreSnapshot?.qScore != null && ` · Quantum: ${snap.scoreSnapshot.qScore}%`}
                </div>
              </div>
              <div style={{ fontSize: '11px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '2px 10px', color: 'var(--text-muted)', flexShrink: 0 }}>{snap.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Export Helpers ───────────────────────────────────────────────────────────
function buildExportData(state, sections) {
  const { organisation, systemProfiles, assessmentState, riskModel, recommendationModel, evidencePack, branding, settings } = state;
  return {
    meta: { exportedAt: new Date().toISOString(), platform: 'Quantum Compliance OS™', version: '4.0', defensiveOnly: true },
    organisation,
    branding: { productName: branding?.productName, accentColour: branding?.accentColour },
    scores: {
      securityImplementationScore: assessmentState?.securityAssessment?.securityImplementationScore,
      preventativeControlScore: assessmentState?.securityAssessment?.preventativeControlScore,
      quantumReadinessScore: assessmentState?.quantumReadiness?.quantumReadinessScore,
      cryptoAgilityScore: assessmentState?.quantumReadiness?.cryptoAgilityScore,
      hndlRiskScore: assessmentState?.quantumReadiness?.hndlRiskScore,
      overallReadinessScore: assessmentState?.overallReadinessScore,
    },
    systems: systemProfiles,
    riskRegister: riskModel?.riskEntries || [],
    recommendations: recommendationModel?.recommendations || [],
    migrationPriorities: recommendationModel?.migrationPriorities || [],
    evidencePack: evidencePack?.items || [],
    disclaimer: settings?.reportDisclaimer || 'This export is for defensive readiness assessment purposes only. No offensive testing was performed.',
  };
}

function buildCSVExport(state) {
  const riskEntries = state.riskModel?.riskEntries || [];
  const header = ['Ref', 'Domain', 'Type', 'Severity', 'Likelihood', 'Impact', 'Control Gap', 'Status'].join(',');
  const rows = riskEntries.map((r) =>
    [r.ref, `"${r.domain}"`, r.domainType || 'security', r.inherentRisk, r.likelihood, r.impact, `"${(r.controlGap || '').replace(/"/g, '""')}"`, r.status || 'open'].join(',')
  );
  const allRecs = [...(state.recommendationModel?.recommendations || []), ...(state.recommendationModel?.migrationPriorities || [])].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
  const recHeader = '\n\nRecommendations\nPriority,Domain,Title,Effort,Impact,Status';
  const recRows = allRecs.map((r) =>
    [r.priority, `"${r.domain}"`, `"${(r.title || '').replace(/"/g, '""')}"`, r.effort, r.impact, r.status || 'open'].join(',')
  );
  return [header, ...rows, recHeader, ...recRows].join('\n');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
