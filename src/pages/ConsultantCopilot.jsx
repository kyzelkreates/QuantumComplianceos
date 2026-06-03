/**
 * QUANTUM COMPLIANCE OS™ — ConsultantCopilot.jsx
 * Run 8: Local-First Consultant Copilot
 * ==========================================
 * Deterministic template-based recommendation engine.
 * Uses stored assessment data — NO external AI API calls.
 * No live scanning. No offensive logic. Defensive guidance only.
 *
 * All generated text is clearly labelled as guidance based on
 * supplied assessment data — not a security audit or legal advice.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { WORKSPACE_MODE, clientIsDemo } from '../core/workspaceMode.js';
import {
  getState, subscribe,
  saveCopilotDraft, deleteCopilotDraft,
  updateCopilotSettings, acceptCopilotDisclaimer,
  getCopilotState, addCopilotPromptHistory,
} from '../core/storage.js';
import {
  buildClientRiskSnapshot, generateCopilotBundle,
  interpretScore, interpretQuantumScore,
  COPILOT_DISCLAIMER,
} from '../core/copilotEngine.js';
import { generateId } from '../utils/id.js';
import { timeAgo } from '../utils/date.js';
import { PAGES } from '../core/constants.js';

// ─── Section Definitions ──────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'executiveSummary',           label: 'Executive Summary',             icon: '📄', desc: 'Non-technical client-facing summary for business owners and leadership.' },
  { id: 'technicalRemediation',       label: 'Technical Remediation Plan',    icon: '🔧', desc: 'Technical fix list, 30/60/90 day action plan, and evidence priorities.' },
  { id: 'meetingTalkingPoints',       label: 'Meeting Talking Points',        icon: '💬', desc: 'Consultant script: opener, risk message, quantum notes, close.' },
  { id: 'evidenceGapSummary',         label: 'Evidence Gap Summary',          icon: '📁', desc: 'Missing, incomplete, and priority evidence items.' },
  { id: 'quantumReadinessExplanation', label: 'Quantum-Readiness Explanation', icon: '⚛️', desc: 'Plain-English HNDL, RSA/ECC exposure, and NIST FIPS alignment.' },
  { id: 'priorityActionPlan',         label: 'Priority Action Plan',          icon: '📋', desc: 'Ranked immediate actions with owners and timeframes.' },
  { id: 'clientFriendlyRisk',         label: 'Plain-English Risk Explanation', icon: '🗣️', desc: 'Non-technical risk summary for business owners.' },
  { id: 'consultantNextSteps',        label: 'Consultant Next Steps',         icon: '🎯', desc: 'Internal consultant action list and service opportunity notes.' },
];

const TONE_OPTIONS     = [{ v: 'professional', l: 'Professional' }, { v: 'plain', l: 'Plain English' }, { v: 'technical', l: 'Technical' }, { v: 'sales', l: 'Sales / Demo' }];
const AUDIENCE_OPTIONS = [
  { v: 'SME business owner',    l: 'SME Business Owner' },
  { v: 'technical manager',     l: 'Technical Manager' },
  { v: 'board/investor',        l: 'Board / Investor' },
  { v: 'consultant internal note', l: 'Consultant Internal Note' },
];
const DETAIL_OPTIONS   = [{ v: 'short', l: 'Short' }, { v: 'balanced', l: 'Balanced' }, { v: 'detailed', l: 'Detailed' }];

// ─── Score Badge Component ────────────────────────────────────────────────────
function ScoreBadge({ label, score, interp, size = 'sm' }) {
  const colours = { success: 'var(--success)', info: 'var(--info)', warning: 'var(--warning)', danger: 'var(--danger)', muted: 'var(--text-muted)' };
  const c = colours[interp?.colour || 'muted'];
  const big = size === 'lg';
  return (
    <div style={{ textAlign: 'center', padding: big ? '16px 20px' : '10px 14px', background: `${c}10`, border: `1px solid ${c}40`, borderRadius: 'var(--radius-md)' }}>
      <div style={{ fontSize: big ? '32px' : '22px', fontWeight: 900, color: c, lineHeight: 1 }}>{score ?? '—'}</div>
      <div style={{ fontSize: big ? '10px' : '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>{label}</div>
      {interp && <div style={{ fontSize: '10px', color: c, fontWeight: 600, marginTop: '3px' }}>{interp.label}</div>}
    </div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for non-HTTPS / older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} style={{
      background: copied ? 'rgba(16,185,129,0.15)' : 'var(--bg-tertiary)',
      border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'var(--border-muted)'}`,
      borderRadius: 'var(--radius-md)', padding: '5px 12px',
      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
      color: copied ? 'var(--success)' : 'var(--text-muted)',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {copied ? '✓ Copied' : `📋 ${label}`}
    </button>
  );
}

// ─── Generated Section Card ───────────────────────────────────────────────────
function GeneratedSection({ section, content, onSave, saved }) {
  const [expanded, setExpanded] = useState(true);
  if (!content) return null;
  return (
    <div style={{ marginBottom: '16px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', background: 'var(--bg-secondary)', cursor: 'pointer',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>{section.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>{section.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{section.desc}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <CopyButton text={content} label="Copy" />
          <button onClick={onSave} style={{
            background: saved ? 'rgba(16,185,129,0.15)' : 'var(--bg-tertiary)',
            border: `1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'var(--border-muted)'}`,
            borderRadius: 'var(--radius-md)', padding: '5px 12px',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            color: saved ? 'var(--success)' : 'var(--text-muted)', whiteSpace: 'nowrap',
          }}>
            {saved ? '✓ Saved' : '💾 Save'}
          </button>
          <span style={{ fontSize: '18px', color: 'var(--text-muted)', marginLeft: '4px' }}>{expanded ? '▾' : '▸'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '20px', background: 'var(--bg-primary)' }}>
          <pre style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: 'ui-monospace, "Fira Code", monospace', fontSize: '12px',
            color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0,
          }}>{content}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ConsultantCopilot({ onNavigate, workspaceMode }) {
  const [state,        setLocalState]  = useState(() => getState());
  const [copilotState, setCopilotState] = useState(() => getCopilotState());
  const [bundle,       setBundle]      = useState(null);
  const [generating,   setGenerating]  = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [savedSections, setSavedSections] = useState({});
  const [showSettings, setShowSettings]   = useState(false);
  const [showSavedDrafts, setShowSavedDrafts] = useState(false);
  const [showDisclaimer, setShowDisclaimer]   = useState(false);
  const [localSettings, setLocalSettings]     = useState(null);

  useEffect(() => {
    const unsub = subscribe((s) => {
      setLocalState({ ...s });
      setCopilotState(s.consultantCopilot || {});
    });
    return unsub;
  }, []);

  // Init local settings from stored copilot settings
  useEffect(() => {
    if (!localSettings && copilotState?.settings) {
      setLocalSettings({ ...copilotState.settings });
    }
  }, [copilotState]);

  // Show disclaimer on first use
  useEffect(() => {
    if (!copilotState?.disclaimersAccepted) setShowDisclaimer(true);
  }, [copilotState?.disclaimersAccepted]);

  const snapshot = buildClientRiskSnapshot(state);

  // Run 8.5 — workspace mode awareness
  const isDemo       = workspaceMode === WORKSPACE_MODE.DEMO || state.clientMode?.isDemoMode || state.settings?.demoMode;
  const isProduct    = !isDemo;
  const activeClientIsDemoClient = isDemo; // in demo mode, active data is demo data
  const settings = localSettings || copilotState?.settings || {};

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setBundle(null);
    setSavedSections({});

    // Micro-delay for UI feedback
    setTimeout(() => {
      const result = generateCopilotBundle(state, settings);
      setBundle(result);
      setGenerating(false);
      setActiveSection(SECTIONS[0].id);

      // Log to prompt history
      addCopilotPromptHistory({
        id: generateId(),
        generatedAt: new Date().toISOString(),
        clientName: state?.organisation?.name || 'Unknown',
        settings: { ...settings },
        sectionCount: SECTIONS.length,
      });
    }, 400);
  }, [state, settings]);

  const handleSaveSection = useCallback((sectionId, content) => {
    const draft = {
      id: generateId(),
      title: SECTIONS.find((s) => s.id === sectionId)?.label || sectionId,
      type: sectionId,
      content,
      // Run 8.5 — mode metadata stamped on every draft
      workspaceMode: workspaceMode || 'demo',
      sourceClientIsDemo: activeClientIsDemoClient,
      generatedAt: new Date().toISOString(),
      clientName: state?.organisation?.name || 'Unknown',
      settings: { ...settings },
    };
    saveCopilotDraft(draft);
    setSavedSections((prev) => ({ ...prev, [sectionId]: true }));
  }, [state, settings]);

  const handleSaveSettings = useCallback(() => {
    if (localSettings) updateCopilotSettings(localSettings);
    setShowSettings(false);
  }, [localSettings]);

  const handleAcceptDisclaimer = () => {
    acceptCopilotDisclaimer();
    setShowDisclaimer(false);
  };

  const savedDrafts = copilotState?.generatedDrafts || [];
  const hasData     = snapshot && (snapshot.hasSecAssessment || snapshot.hasQrAssessment || snapshot.systemCount > 0);

  // Export copilot bundle as text
  const handleExportBundle = () => {
    if (!bundle?.sections) return;
    const lines = [
      `QUANTUM COMPLIANCE OS™ — CONSULTANT COPILOT BUNDLE`,
      `Client: ${state?.organisation?.name || 'Unknown'}`,
      `Generated: ${new Date().toLocaleString('en-GB')}`,
      `Settings: Tone=${settings.tone}, Audience=${settings.audience}`,
      ``,
      COPILOT_DISCLAIMER,
      ``,
      '═'.repeat(60),
      '',
    ];
    SECTIONS.forEach((s) => {
      if (bundle.sections[s.id]) {
        lines.push(`${'═'.repeat(60)}`);
        lines.push(`${s.icon} ${s.label.toUpperCase()}`);
        lines.push(`${'═'.repeat(60)}`);
        lines.push(bundle.sections[s.id]);
        lines.push('');
      }
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `qcos-copilot-${(state?.organisation?.name || 'client').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        icon="🤖"
        title="Consultant Copilot"
        subtitle="Local-first recommendation engine. Generates guidance from stored assessment data — no external AI calls."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {savedDrafts.length > 0 && (
              <ActionButton variant="ghost" size="sm" onClick={() => setShowSavedDrafts(true)}>
                💾 Saved Drafts ({savedDrafts.length})
              </ActionButton>
            )}
            <ActionButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              ⚙️ Settings
            </ActionButton>
            {bundle?.sections && (
              <ActionButton variant="secondary" size="sm" onClick={handleExportBundle}>
                ↓ Export Bundle
              </ActionButton>
            )}
            <ActionButton
              variant="primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? '⟳ Generating…' : bundle ? '↺ Regenerate' : '▶ Generate Guidance'}
            </ActionButton>
          </div>
        }
      />

      {/* Run 8.5 — Workspace Mode banner */}
      {isDemo ? (
        <div style={{ padding: '8px 16px', marginBottom: '12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>🎯 <strong style={{ color: 'var(--warning)' }}>Demo Mode</strong> — Copilot output is generated from <strong>fictional demo client data</strong>. Not a real assessment output. Drafts saved in Demo Mode are tagged as demo-sourced.</span>
          {onNavigate && <button onClick={() => onNavigate('settings')} style={{ fontSize: '11px', color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '3px 10px', cursor: 'pointer', fontWeight: 700 }}>Switch to Product Mode →</button>}
        </div>
      ) : (
        <div style={{ padding: '8px 16px', marginBottom: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', flexShrink: 0 }} />
          <span><strong style={{ color: 'var(--success)' }}>Product Mode</strong> — Copilot output uses real client assessment data. Drafts saved are tagged as real product-workspace drafts.</span>
        </div>
      )}

      {/* Disclaimer banner */}
      {!copilotState?.disclaimersAccepted && !showDisclaimer && (
        <div style={{
          padding: '10px 16px', marginBottom: '16px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--warning)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        }}>
          <span>⚠ Copilot is for defensive planning guidance only — not a security audit or legal advice.</span>
          <ActionButton variant="ghost" size="sm" onClick={() => setShowDisclaimer(true)}>View disclaimer</ActionButton>
        </div>
      )}

      {/* Engine status */}
      <div style={{
        padding: '12px 18px', marginBottom: '20px',
        background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Local Template Engine</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deterministic · No external AI API · All data stays local</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {[
            { k: 'Mode', v: 'local-template' },
            { k: 'API', v: 'disabled' },
            { k: 'Tone', v: settings.tone || 'professional' },
            { k: 'Audience', v: settings.audience || 'SME business owner' },
          ].map(({ k, v }) => (
            <span key={k} style={{
              fontSize: '11px', padding: '3px 10px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
              borderRadius: '999px', color: 'var(--text-muted)',
            }}>
              <strong style={{ color: 'var(--text-secondary)' }}>{k}:</strong> {v}
            </span>
          ))}
        </div>
      </div>

      {/* Client Risk Snapshot */}
      {snapshot && (
        <SectionCard title="Client Risk Snapshot" icon="📊"
          actions={
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {state?.organisation?.name || 'Current client'} · {state?.organisation?.sector || 'Unknown sector'}
            </span>
          }
        >
          {/* Scores row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <ScoreBadge label="Security" score={snapshot.secScore} interp={snapshot.secInterp} />
            <ScoreBadge label="Quantum" score={snapshot.qScore} interp={snapshot.qInterp} />
            <ScoreBadge label="Overall" score={snapshot.overallScore} interp={snapshot.overallInterp} size="lg" />
            {snapshot.agilityScore != null && (
              <ScoreBadge label="Crypto-Agility" score={snapshot.agilityScore} interp={interpretScore(snapshot.agilityScore)} />
            )}
          </div>

          {/* Risk counts */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {[
              { label: 'Critical Risks', count: snapshot.critRisks.length, colour: 'var(--danger)' },
              { label: 'High Risks',     count: snapshot.highRisks.length,  colour: 'var(--warning)' },
              { label: 'Medium Risks',   count: snapshot.medRisks.length,   colour: 'var(--info)' },
              { label: 'Missing Evidence', count: snapshot.missingEvidence.length, colour: 'var(--text-muted)' },
              { label: 'Systems',        count: snapshot.systemCount,       colour: 'var(--text-secondary)' },
            ].map(({ label, count, colour }) => (
              <div key={label} style={{ textAlign: 'center', padding: '8px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: colour }}>{count}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Assessment status */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Security Assessment', done: snapshot.hasSecAssessment },
              { label: 'Quantum Assessment',  done: snapshot.hasQrAssessment },
              { label: 'Reports Generated',   done: snapshot.hasReports },
              { label: 'Evidence Tracked',    done: snapshot.evidenceTotal > 0 },
            ].map(({ label, done }) => (
              <span key={label} style={{
                fontSize: '11px', padding: '3px 10px',
                background: done ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
                border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--border-muted)'}`,
                borderRadius: '999px', color: done ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600,
              }}>
                {done ? '✓' : '○'} {label}
              </span>
            ))}
          </div>

          {!hasData && (
            <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--warning)' }}>
              ⚠ Limited assessment data available. Complete a Security Assessment and Quantum Readiness Assessment first for the most useful Copilot output.
              {onNavigate && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <ActionButton variant="ghost" size="sm" onClick={() => onNavigate(PAGES.SECURITY_ASSESSMENT)}>Security Assessment →</ActionButton>
                  <ActionButton variant="ghost" size="sm" onClick={() => onNavigate(PAGES.QUANTUM_READINESS)}>Quantum Readiness →</ActionButton>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      )}

      {/* Generate prompt */}
      {!bundle && !generating && (
        <SectionCard title="Generate Consultant Guidance" icon="✨">
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Ready to generate guidance</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '460px', margin: '0 auto 24px' }}>
              The Copilot will analyse the current client's assessment data and generate{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>8 sections</strong> of consultant-ready guidance:
              executive summary, technical remediation, meeting talking points, evidence gaps, quantum readiness explanation, priority action plan, plain-English risk explanation, and next steps.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', padding: '4px 12px', background: 'var(--bg-tertiary)', borderRadius: '999px', color: 'var(--text-muted)' }}>No external AI API required</span>
              <span style={{ fontSize: '12px', padding: '4px 12px', background: 'var(--bg-tertiary)', borderRadius: '999px', color: 'var(--text-muted)' }}>All data stays local</span>
              <span style={{ fontSize: '12px', padding: '4px 12px', background: 'var(--bg-tertiary)', borderRadius: '999px', color: 'var(--text-muted)' }}>Defensive guidance only</span>
            </div>
            <ActionButton variant="primary" onClick={handleGenerate}>
              ▶ Generate Copilot Guidance
            </ActionButton>
          </div>
        </SectionCard>
      )}

      {/* Generating spinner */}
      {generating && (
        <SectionCard title="Generating…" icon="⟳">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-muted)' }}>
              Analysing assessment data and building guidance…
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Generating 8 sections from stored data. No external requests are being made.
            </div>
          </div>
        </SectionCard>
      )}

      {/* Generated sections */}
      {bundle && !bundle.error && (
        <>
          {/* Section nav */}
          <div style={{
            display: 'flex', gap: '6px', flexWrap: 'wrap',
            padding: '12px 16px', marginBottom: '16px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px', whiteSpace: 'nowrap' }}>Jump to:</span>
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => {
                setActiveSection(s.id);
                document.getElementById(`copilot-section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} style={{
                background: activeSection === s.id ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                border: `1px solid ${activeSection === s.id ? 'var(--border-accent)' : 'var(--border-muted)'}`,
                borderRadius: 'var(--radius-md)', padding: '4px 10px',
                fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                color: activeSection === s.id ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Generation meta — Run 8.5: mode-labelled */}
          <div style={{
            padding: '10px 16px', marginBottom: '16px',
            background: isDemo ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.06)',
            border: `1px solid ${isDemo ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.2)'}`,
            borderRadius: 'var(--radius-md)', fontSize: '12px',
            color: isDemo ? 'var(--warning)' : 'var(--success)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          }}>
            <span>
              {isDemo ? '🎯 Demo data — ' : '✓ '}
              Guidance generated from {isDemo ? <strong>fictional demo</strong> : 'real'} assessment data for <strong>{state?.organisation?.name || 'current client'}</strong>
              {isDemo && <span style={{ fontSize: '10px', marginLeft: '8px', background: 'rgba(245,158,11,0.15)', padding: '1px 7px', borderRadius: '999px', color: 'var(--warning)', fontWeight: 700 }}>FICTIONAL DATA</span>}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              Generated: {new Date().toLocaleTimeString('en-GB')} · {SECTIONS.length} sections · {settings.tone} tone
            </span>
          </div>

          {/* All sections */}
          {SECTIONS.map((section) => (
            <div key={section.id} id={`copilot-section-${section.id}`}>
              <GeneratedSection
                section={section}
                content={bundle.sections[section.id]}
                onSave={() => handleSaveSection(section.id, bundle.sections[section.id])}
                saved={savedSections[section.id]}
              />
            </div>
          ))}

          {/* Disclaimer at bottom */}
          <div style={{
            padding: '14px 18px', marginTop: '8px',
            background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--warning)' }}>⚠ Copilot Disclaimer:</strong> {COPILOT_DISCLAIMER}
          </div>
        </>
      )}

      {bundle?.error && (
        <SectionCard title="Unable to Generate" icon="⚠️">
          <div style={{ padding: '20px', color: 'var(--warning)', fontSize: '13px' }}>
            {bundle.message}
          </div>
        </SectionCard>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '480px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              ⚙️ Copilot Settings
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </h3>

            {[
              { label: 'Output Tone', field: 'tone', options: TONE_OPTIONS },
              { label: 'Target Audience', field: 'audience', options: AUDIENCE_OPTIONS },
              { label: 'Detail Level', field: 'detailLevel', options: DETAIL_OPTIONS },
            ].map(({ label, field, options }) => (
              <div key={field} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {options.map(({ v, l }) => (
                    <button key={v} onClick={() => setLocalSettings((s) => ({ ...s, [field]: v }))} style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      background: localSettings?.[field] === v ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                      border: `1px solid ${localSettings?.[field] === v ? 'var(--border-accent)' : 'var(--border-muted)'}`,
                      color: localSettings?.[field] === v ? 'var(--accent)' : 'var(--text-muted)',
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            ))}

            {/* Toggles */}
            {[
              { field: 'includeQuantumNotes', label: 'Include quantum-readiness notes' },
              { field: 'includeEvidenceNotes', label: 'Include evidence gap notes' },
              { field: 'includeCommercialActions', label: 'Include service opportunity framing' },
            ].map(({ field, label }) => (
              <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
                <button onClick={() => setLocalSettings((s) => ({ ...s, [field]: !s[field] }))} style={{
                  width: '40px', height: '22px', borderRadius: '999px', cursor: 'pointer', border: 'none',
                  background: localSettings?.[field] ? 'var(--accent)' : 'var(--border-default)', transition: 'background 0.2s',
                }} aria-checked={localSettings?.[field]} role="switch" />
              </div>
            ))}

            {/* API mode — disabled in Run 8 */}
            <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>API Mode: Disabled</strong>
              <div style={{ marginTop: '4px' }}>Future optional AI API connector — disabled in this local-first MVP (Run 8). All guidance uses deterministic local templates.</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <ActionButton variant="ghost" onClick={() => setShowSettings(false)}>Cancel</ActionButton>
              <ActionButton variant="primary" onClick={handleSaveSettings}>Save Settings</ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Saved Drafts Modal */}
      {showSavedDrafts && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '600px', maxWidth: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              💾 Saved Drafts ({savedDrafts.length})
              <button onClick={() => setShowSavedDrafts(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </h3>
            {savedDrafts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No saved drafts yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedDrafts.map((draft) => (
                  <div key={draft.id} style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>{draft.title}</span>
                          {draft.sourceClientIsDemo && <span style={{ fontSize: '9px', background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>DEMO DATA</span>}
                          {draft.workspaceMode === 'product' && <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>REAL</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {draft.clientName} · {draft.generatedAt ? timeAgo(draft.generatedAt) : 'Unknown date'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <CopyButton text={draft.content} label="Copy" />
                        <button onClick={() => deleteCopilotDraft(draft.id)} style={{
                          background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)',
                          padding: '4px 10px', fontSize: '11px', cursor: 'pointer', color: 'var(--danger)',
                        }}>Delete</button>
                      </div>
                    </div>
                    <pre style={{
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      fontFamily: 'monospace', fontSize: '11px',
                      color: 'var(--text-muted)', maxHeight: '120px', overflowY: 'auto',
                      background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-sm)',
                      margin: 0, lineHeight: 1.6,
                    }}>{draft.content?.slice(0, 300)}{(draft.content?.length || 0) > 300 ? '…' : ''}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '36px', width: '520px', maxWidth: '100%' }}>
            <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '16px' }}>🤖</div>
            <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Consultant Copilot</h3>
            <div style={{ padding: '16px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '8px' }}>⚠ Before using the Copilot:</strong>
              {COPILOT_DISCLAIMER}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {[
                'Uses stored assessment data only — no external AI API calls',
                'Generates deterministic template-based guidance',
                'All output is for defensive planning and discussion purposes',
                'Review all generated content before using with clients',
                'Does not detect live security vulnerabilities or perform scanning',
                'Does not guarantee compliance with any standard or regulation',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span> {item}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <ActionButton variant="ghost" onClick={() => setShowDisclaimer(false)}>Dismiss</ActionButton>
              <ActionButton variant="primary" onClick={handleAcceptDisclaimer}>I understand — Open Copilot</ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
