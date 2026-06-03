/**
 * QUANTUM COMPLIANCE OS™ — QuantumReadiness.jsx
 * Run 3: Post-Quantum Readiness Engine
 * =========================================
 * Defensive cryptographic exposure assessment, HNDL risk model,
 * crypto-agility scoring, migration priority engine, and NIST/NCSC alignment.
 *
 * DEFENSIVE USE ONLY.
 * No live cryptographic attack testing. No key extraction. No offensive tools.
 * No "quantum-proof" claims — readiness and migration assessment only.
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/forms.css';
import '../styles/cards.css';
import '../styles/dashboard.css';
import '../styles/navigation.css';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import { getState, subscribe, saveQuantumCategoryResponses, commitQuantumResults, resetQuantumAssessment } from '../core/storage.js';
import { QUANTUM_ASSESSMENT_CATEGORIES, getQuantumCategoryById, NIST_PQC_STANDARDS, NCSC_MIGRATION_PHASES } from '../core/quantumSchema.js';
import { computeFullQuantumResult, getQuantumScoreThreshold, computeOverallReadinessScore } from '../core/quantumScoringEngine.js';

const VIEW = { OVERVIEW: 'overview', CATEGORY: 'category', RESULTS: 'results', REFERENCE: 'reference' };

export default function QuantumReadiness() {
  const [state, setLocalState]   = useState(() => getState());
  const [view, setView]          = useState(VIEW.OVERVIEW);
  const [activeCatId, setActiveCatId] = useState(null);
  const [localDraft, setLocalDraft]   = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [isScoring, setIsScoring]     = useState(false);

  useEffect(() => {
    const unsub = subscribe((s) => setLocalState({ ...s }));
    return unsub;
  }, []);

  const quantum     = state.assessmentState?.quantumReadiness || {};
  const responses   = quantum.responses || {};
  const organisation = state.organisation;
  const hasScore    = quantum.quantumReadinessScore != null;

  const totalCats      = QUANTUM_ASSESSMENT_CATEGORIES.length;
  const completedCats  = (quantum.completedSections || []).length;
  const answeredCount  = Object.values(responses).reduce((acc, r) => acc + Object.keys(r).length, 0);
  const totalQs        = QUANTUM_ASSESSMENT_CATEGORIES.reduce((a, c) => a + c.questions.length, 0);
  const progressPct    = totalQs > 0 ? Math.round((answeredCount / totalQs) * 100) : 0;

  const openCategory = useCallback((catId) => {
    setLocalDraft({ ...(responses[catId] || {}) });
    setActiveCatId(catId);
    setView(VIEW.CATEGORY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [responses]);

  const handleSaveCategory = useCallback(() => {
    if (!activeCatId) return;
    saveQuantumCategoryResponses(activeCatId, localDraft);
    const updatedResponses = { ...responses, [activeCatId]: { ...(responses[activeCatId] || {}), ...localDraft } };
    const result = computeFullQuantumResult(updatedResponses, organisation);
    commitQuantumResults(result, updatedResponses);
    setView(VIEW.OVERVIEW);
    setActiveCatId(null);
    setLocalDraft({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCatId, localDraft, responses, organisation]);

  const handleCancel = useCallback(() => {
    setView(VIEW.OVERVIEW);
    setActiveCatId(null);
    setLocalDraft({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnswerChange = useCallback((qId, val) => {
    setLocalDraft((d) => ({ ...d, [qId]: val }));
  }, []);

  const handleRunScoring = useCallback(() => {
    setIsScoring(true);
    setTimeout(() => {
      const result = computeFullQuantumResult(responses, organisation);
      commitQuantumResults(result, responses);
      setIsScoring(false);
      setView(VIEW.RESULTS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }, [responses, organisation]);

  const handleReset = useCallback(() => {
    resetQuantumAssessment();
    setConfirmReset(false);
    setView(VIEW.OVERVIEW);
    setLocalDraft({});
  }, []);

  // ── Category view
  if (view === VIEW.CATEGORY && activeCatId) {
    return (
      <QuantumCategoryView
        categoryId={activeCatId}
        draft={localDraft}
        onAnswer={handleAnswerChange}
        onSave={handleSaveCategory}
        onCancel={handleCancel}
      />
    );
  }

  // ── Results view
  if (view === VIEW.RESULTS) {
    return (
      <QuantumResultsView
        quantum={quantum}
        riskModel={state.riskModel}
        recommendationModel={state.recommendationModel}
        securityScore={state.assessmentState?.securityAssessment?.securityImplementationScore}
        onBack={() => setView(VIEW.OVERVIEW)}
        onReset={() => setConfirmReset(true)}
        onOpenCategory={openCategory}
        onReference={() => setView(VIEW.REFERENCE)}
      />
    );
  }

  // ── Reference view
  if (view === VIEW.REFERENCE) {
    return <NistReferenceView onBack={() => setView(hasScore ? VIEW.RESULTS : VIEW.OVERVIEW)} />;
  }

  // ── Overview
  return (
    <div>
      <PageHeader
        icon="⚛️"
        title="Quantum Readiness Assessment"
        subtitle="Post-quantum cryptographic exposure, HNDL risk, crypto-agility, and NIST/NCSC migration alignment. Defensive assessment only."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ActionButton variant="ghost" size="sm" onClick={() => setView(VIEW.REFERENCE)}>NIST/NCSC Reference</ActionButton>
            {hasScore && (
              <ActionButton variant="secondary" onClick={() => setView(VIEW.RESULTS)}>View Results</ActionButton>
            )}
            {answeredCount > 0 && (
              <ActionButton variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>Reset</ActionButton>
            )}
            <ActionButton variant="primary" onClick={handleRunScoring} loading={isScoring} disabled={answeredCount === 0}>
              {hasScore ? '⟳ Rescore' : '▶ Score Assessment'}
            </ActionButton>
          </div>
        }
      />

      {/* Defensive disclaimer */}
      <div style={{
        background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px',
        fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--info)' }}>⚛️ Defensive assessment only.</strong>{' '}
        This tool assesses your post-quantum readiness by questionnaire only. No live cryptographic scanning,
        key extraction, decryption, or offensive testing is performed. Answers are stored locally only.
        This assessment does not guarantee or certify any level of quantum protection.
        Always consult qualified cryptography professionals before making migration decisions.
      </div>

      {/* Score summary */}
      {hasScore && <QuantumScoreSummaryBar quantum={quantum} securityScore={state.assessmentState?.securityAssessment?.securityImplementationScore} onViewResults={() => setView(VIEW.RESULTS)} />}

      {/* Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Assessment Progress</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {answeredCount} / {totalQs} questions · {completedCats}/{totalCats} categories complete
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
            borderRadius: '999px', transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Category grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {QUANTUM_ASSESSMENT_CATEGORIES.map((cat) => (
          <QuantumCategoryCard
            key={cat.id}
            category={cat}
            responses={responses[cat.id] || {}}
            isCompleted={(quantum.completedSections || []).includes(cat.id)}
            onClick={() => openCategory(cat.id)}
          />
        ))}
      </div>

      {/* NCSC phase indicator */}
      {!hasScore && (
        <div style={{ marginTop: '24px', padding: '16px 20px', background: 'var(--bg-secondary)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
            ⚛️ NCSC PQC Migration Phases
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {NCSC_MIGRATION_PHASES.map((ph) => (
              <div key={ph.phase} style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)', padding: '10px 12px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#8b5cf6', marginBottom: '4px' }}>Phase {ph.phase}</div>
                <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>{ph.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{ph.desc.slice(0, 80)}…</div>
                <div style={{ fontSize: '10px', color: '#8b5cf6', marginTop: '6px', fontWeight: 600 }}>{ph.timeline}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmReset && (
        <ConfirmModal
          title="Reset Quantum Readiness Assessment?"
          message="This will clear all quantum assessment responses, quantum risk items, and migration recommendations. Security assessment data is preserved."
          confirmLabel="Reset Quantum Assessment"
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}

// ─── Score Summary Bar ────────────────────────────────────────────────────────
function QuantumScoreSummaryBar({ quantum, securityScore, onViewResults }) {
  const qScore      = quantum.quantumReadinessScore;
  const agilityScore = quantum.cryptoAgilityScore;
  const hndlRisk    = quantum.hndlRiskScore;
  const threshold   = getQuantumScoreThreshold(qScore ?? 0);
  const overallScore = computeOverallReadinessScore(securityScore, qScore);

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: `1px solid ${threshold.colour}44`,
      borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '24px',
      display: 'flex', gap: '24px', alignItems: 'center', cursor: 'pointer',
    }} onClick={onViewResults}>
      {/* Quantum readiness ring */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: `conic-gradient(${threshold.colour} ${qScore}%, var(--bg-elevated) 0%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: threshold.colour, lineHeight: 1 }}>{qScore}</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: threshold.colour, marginTop: '6px' }}>{threshold.label}</div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
        <MiniKpi label="Quantum Readiness" value={`${qScore}%`} colour={threshold.colour} />
        <MiniKpi label="Crypto-Agility" value={`${agilityScore ?? '—'}%`} colour={getQuantumScoreThreshold(agilityScore ?? 0).colour} />
        <MiniKpi label="HNDL Risk" value={`${hndlRisk ?? '—'}/100`} colour={hndlRisk >= 70 ? 'var(--danger)' : hndlRisk >= 40 ? 'var(--warning)' : 'var(--success)'} />
        {overallScore != null && <MiniKpi label="Overall Readiness" value={`${overallScore}%`} colour={getQuantumScoreThreshold(overallScore).colour} />}
      </div>

      <div style={{ flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: '#8b5cf6' }}>View Full Results →</span>
      </div>
    </div>
  );
}

function MiniKpi({ label, value, colour }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: colour || 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function QuantumCategoryCard({ category, responses, isCompleted, onClick }) {
  const answered  = Object.keys(responses).length;
  const total     = category.questions.length;
  const required  = category.questions.filter((q) => q.required).length;
  const answeredR = category.questions.filter((q) => q.required && responses[q.id]).length;
  const pct       = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${isCompleted ? 'rgba(139,92,246,0.4)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
      cursor: 'pointer', transition: 'all 0.15s ease',
    }}
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = isCompleted ? 'rgba(139,92,246,0.4)' : 'var(--border-default)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}>{category.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{category.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {answered}/{total} answered · {answeredR}/{required} required
            </div>
          </div>
        </div>
        {isCompleted
          ? <span style={{ fontSize: '16px' }}>✅</span>
          : answered > 0
            ? <span style={{ fontSize: '11px', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>In Progress</span>
            : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Not started</span>
        }
      </div>

      <div style={{ height: '3px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: isCompleted ? '#8b5cf6' : 'var(--accent)',
          borderRadius: '999px', transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {category.nistAlignment.slice(0, 2).map((n) => (
          <span key={n} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '999px', padding: '1px 6px', color: '#8b5cf6' }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Category View (Questionnaire) ───────────────────────────────────────────
function QuantumCategoryView({ categoryId, draft, onAnswer, onSave, onCancel }) {
  const category = getQuantumCategoryById(categoryId);
  if (!category) return null;

  const allRequired    = category.questions.filter((q) => q.required);
  const answeredCount  = Object.keys(draft).length;
  const allRequiredAns = allRequired.every((q) => draft[q.id]);

  return (
    <div>
      <PageHeader
        icon={category.icon}
        title={category.label}
        subtitle={category.description}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
            <ActionButton variant="primary" onClick={onSave}>Save & Continue</ActionButton>
          </div>
        }
      />

      {/* Defensive note */}
      <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        ⚛️ <strong style={{ color: 'var(--text-secondary)' }}>Defensive scope:</strong> {category.defensiveNote}
      </div>

      {/* NIST / NCSC alignment tags */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {category.nistAlignment.map((n) => (
          <span key={n} style={{ fontSize: '11px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '999px', padding: '2px 8px', color: '#8b5cf6' }}>{n}</span>
        ))}
        {category.ncscRef && (
          <span style={{ fontSize: '11px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '2px 8px', color: 'var(--text-muted)' }}>{category.ncscRef}</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {category.questions.map((question, idx) => (
          <QuantumQuestionCard
            key={question.id}
            question={question}
            index={idx + 1}
            selectedValue={draft[question.id] || ''}
            onSelect={(val) => onAnswer(question.id, val)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-muted)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {answeredCount}/{category.questions.length} answered
          {!allRequiredAns && <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>· {allRequired.length - allRequired.filter((q) => draft[q.id]).length} required remaining</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={onSave}>Save & Continue</ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Quantum Question Card ────────────────────────────────────────────────────
function QuantumQuestionCard({ question, index, selectedValue, onSelect }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: 'var(--radius-md)', flexShrink: 0,
          background: selectedValue ? 'rgba(139,92,246,0.15)' : 'var(--bg-elevated)',
          border: `1px solid ${selectedValue ? '#8b5cf6' : 'var(--border-default)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
          color: selectedValue ? '#8b5cf6' : 'var(--text-muted)',
        }}>
          {index}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
            {question.label}
            {question.required && <span style={{ color: 'var(--danger)', marginLeft: '4px', fontSize: '12px' }}>*</span>}
          </div>
          {question.hint && <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{question.hint}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {question.options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          const scoreColour = opt.score >= 3 ? 'var(--success)'
            : opt.score >= 2 ? 'var(--info)'
            : opt.score >= 1 ? 'var(--warning)'
            : opt.isWeakness ? 'var(--danger)' : 'var(--text-muted)';

          return (
            <div key={opt.value}
              onClick={() => onSelect(opt.value)}
              role="radio" aria-checked={isSelected} tabIndex={0}
              onKeyDown={(e) => e.key === ' ' && onSelect(opt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: `1px solid ${isSelected ? '#8b5cf6' : 'var(--border-muted)'}`,
                background: isSelected ? 'rgba(139,92,246,0.12)' : 'var(--bg-tertiary)',
                cursor: 'pointer', transition: 'all 0.12s ease',
              }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${isSelected ? '#8b5cf6' : 'var(--border-default)'}`,
                background: isSelected ? '#8b5cf6' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ flex: 1, fontSize: '13px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: scoreColour, background: `${scoreColour}20`, padding: '2px 6px', borderRadius: '999px', flexShrink: 0 }}>{opt.score}/4</span>
              {opt.isWeakness && <span style={{ fontSize: '10px', color: 'var(--danger)', flexShrink: 0 }}>⚠</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────
function QuantumResultsView({ quantum, riskModel, recommendationModel, securityScore, onBack, onReset, onOpenCategory, onReference }) {
  const [activeTab, setActiveTab] = useState('summary');

  const qScore       = quantum.quantumReadinessScore ?? 0;
  const agilityScore = quantum.cryptoAgilityScore   ?? 0;
  const hndlRisk     = quantum.hndlRiskScore        ?? 0;
  const overallScore = computeOverallReadinessScore(securityScore, qScore);
  const threshold    = getQuantumScoreThreshold(qScore);
  const ncscPhase    = quantum.ncscPhase;

  const qRiskItems   = (riskModel?.riskEntries || []).filter((r) => r.domainType === 'quantum');
  const qRecs        = (recommendationModel?.migrationPriorities || []);
  const priorityActs = qRecs.filter((r) => ['critical', 'high'].includes(r.priority));

  const TABS = [
    { id: 'summary',    label: 'Summary' },
    { id: 'categories', label: `Domain Scores (${(quantum.categoryScores || []).length})` },
    { id: 'hndl',       label: 'HNDL Risk' },
    { id: 'migration',  label: `Migration Priorities (${qRecs.length})` },
    { id: 'risk',       label: `Quantum Risk Register (${qRiskItems.length})` },
  ];

  return (
    <div>
      <PageHeader
        icon="📊"
        title="Quantum Readiness Results"
        subtitle={`Post-quantum readiness assessment — scored ${new Date(quantum.computedAt).toLocaleDateString('en-GB')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionButton variant="ghost" size="sm" onClick={onReference}>NIST/NCSC Reference</ActionButton>
            <ActionButton variant="ghost" size="sm" onClick={onReset}>Reset</ActionButton>
            <ActionButton variant="secondary" onClick={onBack}>← Back</ActionButton>
          </div>
        }
      />

      {/* Score hero */}
      <div style={{
        background: 'var(--bg-secondary)', border: `1px solid ${threshold.colour}44`,
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: '24px',
        display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr', gap: '24px', alignItems: 'center',
      }}>
        <QuantumRing score={qScore} threshold={threshold} label="Quantum Readiness" />
        <ScoreKpi label="Crypto-Agility Score" value={`${agilityScore}%`} colour={getQuantumScoreThreshold(agilityScore).colour} sub={getQuantumScoreThreshold(agilityScore).label} />
        <ScoreKpi label="HNDL Risk Score" value={`${hndlRisk}/100`}
          colour={hndlRisk >= 70 ? 'var(--danger)' : hndlRisk >= 40 ? 'var(--warning)' : 'var(--success)'}
          sub={hndlRisk >= 70 ? 'Critical HNDL exposure' : hndlRisk >= 40 ? 'Moderate HNDL risk' : 'Low HNDL risk'} />
        {overallScore != null && (
          <ScoreKpi label="Overall Readiness" value={`${overallScore}%`} colour={getQuantumScoreThreshold(overallScore).colour} sub="Security + Quantum combined" />
        )}
        <ScoreKpi label="NCSC Phase Alignment" value={`Phase ${ncscPhase?.phase || '—'}`} colour="#8b5cf6" sub={ncscPhase?.label || '—'} />
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-nav__item${activeTab === t.id ? ' tab-nav__item--active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Summary */}
      {activeTab === 'summary' && (
        <div>
          {priorityActs.length > 0 && (
            <SectionCard title="Top Migration Priorities" icon="🚀">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {priorityActs.slice(0, 6).map((rec, i) => (
                  <div key={rec.id} style={{
                    display: 'flex', gap: '12px', padding: '14px 16px',
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${rec.priority === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.2)'}`,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', width: '24px', flexShrink: 0, marginTop: '2px' }}>{i + 1}.</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{rec.title}</span>
                        <RiskBadge level={rec.priority} />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '6px' }}>{rec.detail.slice(0, 180)}…</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {rec.nistAlignment?.slice(0, 3).map((n) => (
                          <span key={n} style={{ fontSize: '10px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '999px', padding: '1px 6px', color: '#8b5cf6' }}>{n}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <div>{rec.domainIcon}</div>
                      <div style={{ marginTop: '4px' }}>Effort: {rec.effort}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* NCSC Phase */}
          {ncscPhase && (
            <SectionCard title="NCSC Migration Phase Alignment" icon="🗺️">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {NCSC_MIGRATION_PHASES.map((ph) => {
                  const isCurrent = ph.phase === ncscPhase.phase;
                  return (
                    <div key={ph.phase} style={{
                      background: isCurrent ? 'rgba(139,92,246,0.1)' : 'var(--bg-tertiary)',
                      border: `1px solid ${isCurrent ? 'rgba(139,92,246,0.5)' : 'var(--border-muted)'}`,
                      borderRadius: 'var(--radius-md)', padding: '14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: '#8b5cf6' }}>Phase {ph.phase}</span>
                        {isCurrent && <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', padding: '1px 6px', borderRadius: '999px', fontWeight: 700 }}>Current</span>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>{ph.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{ph.desc}</div>
                      <div style={{ fontSize: '10px', color: '#8b5cf6', marginTop: '8px', fontWeight: 600 }}>{ph.timeline}</div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Weakness quick view */}
          {(riskModel?.weaknesses || []).filter((w) => w.domain === 'quantum').length > 0 && (
            <SectionCard title={`Quantum Control Gaps (${(riskModel?.weaknesses || []).filter(w => w.domain === 'quantum').length})`} icon="⚠️">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(riskModel?.weaknesses || []).filter((w) => w.domain === 'quantum').slice(0, 8).map((w) => (
                  <div key={`${w.categoryId}_${w.questionId}`} style={{
                    display: 'flex', gap: '10px', padding: '10px 12px',
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>{w.categoryIcon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{w.categoryLabel}: {w.questionLabel}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>"{w.answerLabel}"</div>
                    </div>
                    <RiskBadge level={w.severity} />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* Domain Scores */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(quantum.categoryScores || []).map((cat) => (
            <div key={cat.categoryId} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>{cat.categoryIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{cat.categoryLabel}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.answeredCount}/{cat.totalCount} answered</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: cat.threshold?.colour, lineHeight: 1 }}>{cat.percentage}%</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: cat.threshold?.colour }}>{cat.threshold?.label}</div>
                </div>
              </div>
              <div style={{ height: '5px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${cat.percentage}%`, background: cat.threshold?.colour || '#8b5cf6', borderRadius: '999px', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => onOpenCategory(cat.categoryId)} style={{ fontSize: '12px', color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Edit responses →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HNDL Risk Deep-Dive */}
      {activeTab === 'hndl' && (
        <SectionCard title="Harvest-Now-Decrypt-Later (HNDL) Risk Analysis" icon="⏳">
          <div style={{ background: hndlRisk >= 70 ? 'rgba(239,68,68,0.08)' : hndlRisk >= 40 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${hndlRisk >= 70 ? 'rgba(239,68,68,0.3)' : hndlRisk >= 40 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '48px', fontWeight: 900, color: hndlRisk >= 70 ? 'var(--danger)' : hndlRisk >= 40 ? 'var(--warning)' : 'var(--success)', lineHeight: 1 }}>{hndlRisk}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>HNDL Risk Score</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                  {hndlRisk >= 70 ? '🔴 Critical HNDL Exposure — Immediate action required' : hndlRisk >= 40 ? '🟡 Moderate HNDL Risk — Near-term action recommended' : '🟢 Low HNDL Risk — Continue monitoring'}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {hndlRisk >= 70
                    ? 'Your organisation handles long-lived sensitive data and/or regulated data under quantum-vulnerable encryption. Nation-state adversaries may already be collecting encrypted traffic for future decryption. Hybrid PQC key exchange for internet-facing services and re-encryption of archives should be treated as immediate priorities.'
                    : hndlRisk >= 40
                    ? 'Your organisation has some exposure to harvest-now-decrypt-later attacks. Review your data shelf-life requirements and begin planning hybrid PQC deployment for any systems transmitting data requiring >5 years of confidentiality.'
                    : 'Your current data handling and encryption posture presents low HNDL risk. Continue to monitor the quantum threat landscape and revisit when transmitting higher-value long-lived data.'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>What is HNDL?</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Harvest Now, Decrypt Later (HNDL)</strong> is an attack strategy where adversaries collect and store encrypted network traffic today, with the intent to decrypt it once a cryptographically-relevant quantum computer (CRQC) becomes available. This is a present-day threat — not a future one — for any organisation whose encrypted data must remain confidential for 5–10+ years. NIST IR 8413 and NCSC guidance both identify HNDL as an immediate concern requiring action now.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Migration Priorities */}
      {activeTab === 'migration' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {qRecs.length === 0 ? (
            <SectionCard title="Migration Priorities" icon="🗺️">
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No migration priorities generated. Complete the assessment first.</div>
            </SectionCard>
          ) : (
            qRecs.map((rec) => (
              <div key={rec.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{rec.domainIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{rec.title}</span>
                      <RiskBadge level={rec.priority} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Effort: {rec.effort} · Impact: {rec.impact}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', marginBottom: '10px' }}>
                  {rec.detail}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {rec.nistAlignment?.map((n) => (
                    <span key={n} style={{ fontSize: '10px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '999px', padding: '1px 7px', color: '#8b5cf6' }}>{n}</span>
                  ))}
                </div>
                {rec.ncscRef && <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>📋 {rec.ncscRef}</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Quantum Risk Register */}
      {activeTab === 'risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {qRiskItems.length === 0 ? (
            <SectionCard title="Quantum Risk Register" icon="📋">
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No quantum risk items. Complete the assessment to populate.</div>
            </SectionCard>
          ) : (
            qRiskItems.map((risk) => (
              <div key={risk.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#8b5cf6', flexShrink: 0, marginTop: '2px' }}>{risk.ref}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{risk.domain}</span>
                      <RiskBadge level={risk.inherentRisk} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Likelihood: {risk.likelihood} · Impact: {risk.impact}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>{risk.description}</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {risk.nistAlignment?.slice(0, 3).map((n) => (
                        <span key={n} style={{ fontSize: '10px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '999px', padding: '1px 6px', color: '#8b5cf6' }}>{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── NIST / NCSC Reference View ───────────────────────────────────────────────
function NistReferenceView({ onBack }) {
  return (
    <div>
      <PageHeader icon="📚" title="NIST PQC & NCSC Reference"
        subtitle="Standardised post-quantum cryptography algorithms and NCSC migration guidance. Defensive reference only."
        actions={<ActionButton variant="secondary" onClick={onBack}>← Back</ActionButton>}
      />

      <SectionCard title="NIST PQC Standards — Finalised August 2024" icon="⚛️">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {NIST_PQC_STANDARDS.map((std) => (
            <div key={std.id} style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>{std.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#8b5cf6' }}>{std.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Status: <strong style={{ color: 'var(--success)' }}>{std.status}</strong></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Purpose:</span> <span style={{ color: 'var(--text-secondary)' }}>{std.purpose}</span></div>
                <div><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Replaces:</span> <span style={{ color: 'var(--text-secondary)' }}>{std.replaces}</span></div>
              </div>
              <div style={{ marginTop: '10px', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, borderLeft: '3px solid #8b5cf6' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>NCSC guidance:</strong> {std.ncscGuidance}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="NCSC Migration Roadmap" icon="🗺️">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {NCSC_MIGRATION_PHASES.map((ph) => (
            <div key={ph.phase} style={{ display: 'flex', gap: '16px', padding: '14px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', color: '#8b5cf6', flexShrink: 0 }}>{ph.phase}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{ph.label}</span>
                  <span style={{ fontSize: '11px', color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '1px 8px', borderRadius: '999px', fontWeight: 600 }}>{ph.timeline}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{ph.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Important Disclaimers" icon="⚠️">
        <div style={{ padding: '16px 20px', background: 'var(--bg-tertiary)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 10px' }}><strong style={{ color: 'var(--danger)' }}>No quantum-proof guarantees.</strong> This platform does not claim to make any system quantum-proof or quantum-resistant. All assessments are self-reported readiness evaluations and should be validated by qualified cryptography professionals before any migration decisions are made.</p>
          <p style={{ margin: '0 0 10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Timeline uncertainty.</strong> The timeline for cryptographically-relevant quantum computers (CRQCs) is uncertain. NCSC and NIST guidance is to begin planning now regardless, as migration is a multi-year programme.</p>
          <p style={{ margin: 0 }}><strong style={{ color: 'var(--text-secondary)' }}>Standards evolution.</strong> NIST PQC standards are finalised (FIPS 203/204/205) as of August 2024, but guidance and best practices will continue to evolve. Always consult the latest NIST and NCSC publications.</p>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function QuantumRing({ score, threshold, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{label}</div>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto', background: `conic-gradient(${threshold.colour} ${score}%, var(--bg-elevated) 0%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: threshold.colour, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, color: threshold.colour }}>{threshold.label}</div>
    </div>
  );
}

function ScoreKpi({ label, value, colour, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: colour || 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
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
