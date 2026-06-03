/**
 * QUANTUM COMPLIANCE OS™ — SecurityAssessment.jsx
 * Run 2: Security Assessment Engine
 * ==========================================
 * Full defensive questionnaire, save/resume, per-category scoring,
 * progress tracking, and results view.
 *
 * DEFENSIVE USE ONLY. No offensive testing. No live scanning.
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
import StatusPill from '../components/StatusPill.jsx';
import { getState, subscribe, saveAssessmentCategoryResponses, commitAssessmentResults, resetSecurityAssessment } from '../core/storage.js';
import { ASSESSMENT_CATEGORIES, getCategoryById } from '../core/assessmentSchema.js';
import { computeFullAssessmentResult, getScoreThreshold, SCORE_THRESHOLDS } from '../core/scoringEngine.js';

// ─── Views ────────────────────────────────────────────────────────────────────
const VIEW = { OVERVIEW: 'overview', CATEGORY: 'category', RESULTS: 'results' };

export default function SecurityAssessment() {
  const [state, setLocalState] = useState(() => getState());
  const [view, setView] = useState(VIEW.OVERVIEW);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [localDraft, setLocalDraft] = useState({});   // unsaved draft for current category
  const [confirmReset, setConfirmReset] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  useEffect(() => {
    const unsub = subscribe((s) => setLocalState({ ...s }));
    return unsub;
  }, []);

  const assessment = state.assessmentState?.securityAssessment || {};
  const responses = assessment.responses || {};
  const organisation = state.organisation;

  // Pre-compute progress
  const totalCategories = ASSESSMENT_CATEGORIES.length;
  const completedCategories = (assessment.completedSections || []).length;
  const hasScore = assessment.securityImplementationScore != null;
  const overallScore = assessment.securityImplementationScore;

  // ─── Open a category for answering
  const openCategory = useCallback((categoryId) => {
    const existing = responses[categoryId] || {};
    setLocalDraft({ ...existing });
    setActiveCategoryId(categoryId);
    setView(VIEW.CATEGORY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [responses]);

  // ─── Save draft for current category and go back
  const handleSaveCategory = useCallback(() => {
    if (!activeCategoryId) return;
    saveAssessmentCategoryResponses(activeCategoryId, localDraft);

    // Auto-score after each save
    const updatedResponses = {
      ...responses,
      [activeCategoryId]: { ...(responses[activeCategoryId] || {}), ...localDraft },
    };
    const result = computeFullAssessmentResult(updatedResponses, organisation);
    commitAssessmentResults(result, updatedResponses);

    setView(VIEW.OVERVIEW);
    setActiveCategoryId(null);
    setLocalDraft({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategoryId, localDraft, responses, organisation]);

  const handleCancelCategory = useCallback(() => {
    setView(VIEW.OVERVIEW);
    setActiveCategoryId(null);
    setLocalDraft({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnswerChange = useCallback((questionId, value) => {
    setLocalDraft((d) => ({ ...d, [questionId]: value }));
  }, []);

  // ─── Compute and persist full score
  const handleRunScoring = useCallback(() => {
    setIsScoring(true);
    setTimeout(() => {
      const result = computeFullAssessmentResult(responses, organisation);
      commitAssessmentResults(result, responses);
      setIsScoring(false);
      setView(VIEW.RESULTS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }, [responses, organisation]);

  const handleReset = useCallback(() => {
    resetSecurityAssessment();
    setConfirmReset(false);
    setView(VIEW.OVERVIEW);
    setLocalDraft({});
  }, []);

  // ─── Render
  if (view === VIEW.CATEGORY && activeCategoryId) {
    return (
      <CategoryView
        categoryId={activeCategoryId}
        draft={localDraft}
        onAnswer={handleAnswerChange}
        onSave={handleSaveCategory}
        onCancel={handleCancelCategory}
        savedResponses={responses[activeCategoryId] || {}}
      />
    );
  }

  if (view === VIEW.RESULTS) {
    return (
      <ResultsView
        assessment={assessment}
        riskModel={state.riskModel}
        recommendationModel={state.recommendationModel}
        onBack={() => setView(VIEW.OVERVIEW)}
        onReset={() => setConfirmReset(true)}
        onOpenCategory={openCategory}
      />
    );
  }

  // ─── Overview
  const answeredCount = Object.values(responses).reduce(
    (acc, catR) => acc + Object.keys(catR).length, 0
  );
  const totalQuestions = ASSESSMENT_CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0);
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div>
      <PageHeader
        icon="🛡️"
        title="Security Assessment"
        subtitle="Defensive security implementation assessment across 12 control domains. All data saved locally."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {hasScore && (
              <ActionButton variant="secondary" onClick={() => setView(VIEW.RESULTS)}>
                View Results
              </ActionButton>
            )}
            {answeredCount > 0 && (
              <ActionButton variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
                Reset
              </ActionButton>
            )}
            <ActionButton
              variant="primary"
              onClick={handleRunScoring}
              loading={isScoring}
              disabled={answeredCount === 0}
            >
              {hasScore ? '⟳ Rescore' : '▶ Score Assessment'}
            </ActionButton>
          </div>
        }
      />

      {/* Disclaimer */}
      <div style={{
        background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '24px',
        fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--info)' }}>⚠ Defensive assessment only.</strong>{' '}
        This tool assesses your security readiness by questionnaire. No live scanning, offensive testing,
        exploitation, or access to your systems is performed. Answers are stored locally in your browser only.
      </div>

      {/* Score summary (if scored) */}
      {hasScore && <ScoreSummaryBar assessment={assessment} onViewResults={() => setView(VIEW.RESULTS)} />}

      {/* Progress bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Assessment Progress
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {answeredCount} / {totalQuestions} questions answered ({progressPct}%)
          </span>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, #0088ff 100%)',
            borderRadius: '999px', transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Category grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {ASSESSMENT_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            responses={responses[cat.id] || {}}
            isCompleted={(assessment.completedSections || []).includes(cat.id)}
            onClick={() => openCategory(cat.id)}
          />
        ))}
      </div>

      {/* Reset confirmation */}
      {confirmReset && (
        <ConfirmModal
          title="Reset Security Assessment?"
          message="This will clear all your assessment responses, scores, risk items, and recommendations. This cannot be undone."
          confirmLabel="Reset Assessment"
          confirmVariant="danger"
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}

// ─── Score Summary Bar ────────────────────────────────────────────────────────
function ScoreSummaryBar({ assessment, onViewResults }) {
  const score = assessment.securityImplementationScore;
  const prevScore = assessment.preventativeControlScore;
  const threshold = getScoreThreshold(score);
  const prevThreshold = getScoreThreshold(prevScore ?? 0);

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
      marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'center',
      cursor: 'pointer',
    }} onClick={onViewResults}>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: `conic-gradient(${threshold.colour} ${score}%, var(--bg-elevated) 0%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: '58px', height: '58px', borderRadius: '50%',
            background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: threshold.colour, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>/ 100</span>
          </div>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: threshold.colour, marginTop: '6px' }}>
          {threshold.label}
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <Kpi label="Security Score" value={`${score}%`} colour={threshold.colour} />
        <Kpi label="Preventative Controls" value={`${prevScore ?? '—'}%`} colour={prevThreshold.colour} />
        <Kpi label="Scored" value={new Date(assessment.computedAt).toLocaleDateString('en-GB')} colour="var(--text-secondary)" />
      </div>

      <div style={{ flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: 'var(--accent)' }}>View Full Results →</span>
      </div>
    </div>
  );
}

function Kpi({ label, value, colour }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: colour || 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ category, responses, isCompleted, onClick }) {
  const answered = Object.keys(responses).length;
  const total = category.questions.length;
  const required = category.questions.filter((q) => q.required).length;
  const answeredRequired = category.questions.filter((q) => q.required && responses[q.id]).length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.4)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
      cursor: 'pointer', transition: 'all 0.15s ease',
    }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = isCompleted ? 'rgba(16,185,129,0.4)' : 'var(--border-default)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{category.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{category.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {answered}/{total} answered · {answeredRequired}/{required} required
            </div>
          </div>
        </div>
        {isCompleted
          ? <span style={{ fontSize: '16px' }}>✅</span>
          : answered > 0
            ? <span style={{ fontSize: '11px', background: 'var(--warning-dim)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>In Progress</span>
            : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Not started</span>
        }
      </div>

      <div style={{ height: '3px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: isCompleted ? 'var(--success)' : 'var(--accent)',
          borderRadius: '999px', transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {category.frameworks.slice(0, 2).map((f) => (
          <span key={f} style={{ fontSize: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)', borderRadius: '999px', padding: '1px 6px', color: 'var(--text-muted)' }}>{f}</span>
        ))}
        {category.frameworks.length > 2 && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{category.frameworks.length - 2} more</span>
        )}
      </div>
    </div>
  );
}

// ─── Category View (Questionnaire) ────────────────────────────────────────────
function CategoryView({ categoryId, draft, onAnswer, onSave, onCancel, savedResponses }) {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  const allRequired = category.questions.filter((q) => q.required);
  const allRequiredAnswered = allRequired.every((q) => draft[q.id]);
  const answeredCount = Object.keys(draft).length;

  return (
    <div>
      <PageHeader
        icon={category.icon}
        title={category.label}
        subtitle={category.description}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
            <ActionButton variant="primary" onClick={onSave}>
              Save & Continue
            </ActionButton>
          </div>
        }
      />

      {/* Defensive note */}
      <div style={{
        background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '20px',
        fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5,
      }}>
        🛡️ <strong style={{ color: 'var(--text-secondary)' }}>Defensive scope:</strong> {category.defensiveNote}
      </div>

      {/* Framework tags */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {category.frameworks.map((f) => (
          <span key={f} style={{ fontSize: '11px', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', borderRadius: '999px', padding: '2px 8px', color: 'var(--accent)' }}>{f}</span>
        ))}
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {category.questions.map((question, idx) => (
          <QuestionCard
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
          {answeredCount} of {category.questions.length} answered
          {!allRequiredAnswered && (
            <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>
              · {allRequired.length - allRequired.filter((q) => draft[q.id]).length} required remaining
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={onSave}>Save & Continue</ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ question, index, selectedValue, onSelect }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)', padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: 'var(--radius-md)',
          background: selectedValue ? 'var(--accent-dim)' : 'var(--bg-elevated)',
          border: `1px solid ${selectedValue ? 'var(--accent)' : 'var(--border-default)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
          color: selectedValue ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0,
        }}>
          {index}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
            {question.label}
            {question.required && <span style={{ color: 'var(--danger)', marginLeft: '4px', fontSize: '12px' }}>*</span>}
          </div>
          {question.hint && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{question.hint}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          const scoreColour = option.score >= 3 ? 'var(--success)'
            : option.score >= 2 ? 'var(--info)'
            : option.score >= 1 ? 'var(--warning)'
            : option.isWeakness ? 'var(--danger)' : 'var(--text-muted)';

          return (
            <div
              key={option.value}
              onClick={() => onSelect(option.value)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => e.key === ' ' && onSelect(option.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-muted)'}`,
                background: isSelected ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                cursor: 'pointer', transition: 'all 0.12s ease',
              }}
            >
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-default)'}`,
                background: isSelected ? 'var(--accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ flex: 1, fontSize: '13px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {option.label}
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 700, color: scoreColour,
                background: `${scoreColour}20`, padding: '2px 6px',
                borderRadius: '999px', flexShrink: 0,
              }}>
                {option.score}/4
              </span>
              {option.isWeakness && (
                <span style={{ fontSize: '10px', color: 'var(--danger)', flexShrink: 0 }}>⚠</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────
function ResultsView({ assessment, riskModel, recommendationModel, onBack, onReset, onOpenCategory }) {
  const [activeTab, setActiveTab] = useState('summary');
  const score = assessment.securityImplementationScore;
  const prevScore = assessment.preventativeControlScore;
  const threshold = getScoreThreshold(score ?? 0);
  const prevThreshold = getScoreThreshold(prevScore ?? 0);
  const categoryScores = assessment.categoryScores || [];
  const riskEntries = riskModel?.riskEntries || [];
  const recommendations = recommendationModel?.recommendations || [];
  const weaknesses = riskModel?.weaknesses || [];

  const criticalRisks = riskEntries.filter((r) => r.inherentRisk === 'critical');
  const highRisks = riskEntries.filter((r) => r.inherentRisk === 'high');
  const priorityActions = recommendationModel?.priorityActions || [];

  const TABS = [
    { id: 'summary', label: 'Summary' },
    { id: 'categories', label: `Domain Scores (${categoryScores.length})` },
    { id: 'risks', label: `Risk Register (${riskEntries.length})` },
    { id: 'recommendations', label: `Recommendations (${recommendations.length})` },
  ];

  return (
    <div>
      <PageHeader
        icon="📊"
        title="Assessment Results"
        subtitle={`Security implementation assessment — scored ${new Date(assessment.computedAt).toLocaleDateString('en-GB')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionButton variant="ghost" size="sm" onClick={onReset}>Reset</ActionButton>
            <ActionButton variant="secondary" onClick={onBack}>← Back to Assessment</ActionButton>
          </div>
        }
      />

      {/* Score hero */}
      <div style={{
        background: 'var(--bg-secondary)', border: `1px solid ${threshold.colour}44`,
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: '24px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr', gap: '24px', alignItems: 'center',
      }}>
        <ScoreRing score={score ?? 0} threshold={threshold} label="Security Implementation Score" />
        <div />
        <ScoreRing score={prevScore ?? 0} threshold={prevThreshold} label="Preventative Control Score" />
        <div />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Risk Items</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: riskEntries.length > 10 ? 'var(--danger)' : riskEntries.length > 5 ? 'var(--warning)' : 'var(--success)', lineHeight: 1 }}>
            {riskEntries.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {criticalRisks.length} critical · {highRisks.length} high
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Priority Actions</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {priorityActions.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>immediate focus</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-nav__item${activeTab === t.id ? ' tab-nav__item--active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary tab */}
      {activeTab === 'summary' && (
        <div>
          {/* Priority actions */}
          {priorityActions.length > 0 && (
            <SectionCard title="Priority Actions" icon="🚨">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {priorityActions.slice(0, 8).map((rec, i) => (
                  <div key={rec.id} style={{
                    display: 'flex', gap: '12px', padding: '12px 14px',
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${rec.priority === 'critical' ? 'rgba(239,68,68,0.3)' : 'var(--border-muted)'}`,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', width: '24px', flexShrink: 0, marginTop: '2px' }}>{i + 1}.</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{rec.title}</span>
                        <RiskBadge level={rec.priority} />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {rec.detail.slice(0, 160)}…
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {rec.domainIcon} {rec.domain} · Effort: {rec.effort} · Impact: {rec.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Weaknesses summary */}
          {weaknesses.length > 0 && (
            <SectionCard title={`Control Gaps Identified (${weaknesses.length})`} icon="⚠️">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {weaknesses.slice(0, 10).map((w) => (
                  <div key={`${w.categoryId}_${w.questionId}`} style={{
                    display: 'flex', gap: '10px', padding: '10px 12px',
                    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-muted)', alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>{w.categoryIcon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{w.categoryLabel}: {w.questionLabel}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Current: "{w.answerLabel}"</div>
                    </div>
                    <RiskBadge level={w.severity} />
                  </div>
                ))}
                {weaknesses.length > 10 && (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', paddingTop: '8px' }}>
                    + {weaknesses.length - 10} more — see Risk Register tab
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {weaknesses.length === 0 && (
            <SectionCard title="No Weaknesses Detected" icon="✅">
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Excellent security posture</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No control gaps were detected in the answers provided. Continue to re-assess regularly as your environment evolves.</div>
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* Domain Scores tab */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoryScores.map((cat) => (
            <div key={cat.categoryId} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>{cat.categoryIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{cat.categoryLabel}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {cat.answeredCount}/{cat.totalCount} answered
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: cat.threshold?.colour || 'var(--text-muted)', lineHeight: 1 }}>
                    {cat.percentage}%
                  </div>
                  <div style={{ fontSize: '11px', color: cat.threshold?.colour || 'var(--text-muted)', fontWeight: 600 }}>
                    {cat.threshold?.label}
                  </div>
                </div>
              </div>
              <div style={{ height: '5px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${cat.percentage}%`,
                  background: cat.threshold?.colour || 'var(--text-muted)',
                  borderRadius: '999px', transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onOpenCategory(cat.categoryId)}
                  style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Edit responses →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Register tab */}
      {activeTab === 'risks' && (
        <div>
          {riskEntries.length === 0 ? (
            <SectionCard title="Risk Register" icon="📋">
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
                No risk items identified. Complete the assessment to populate the risk register.
              </div>
            </SectionCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {riskEntries.map((risk) => (
                <div key={risk.id} style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 18px',
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>{risk.ref}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{risk.domain}</span>
                        <RiskBadge level={risk.inherentRisk} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Likelihood: {risk.likelihood} · Impact: {risk.impact}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>{risk.description}</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {risk.frameworks?.slice(0, 3).map((f) => (
                          <span key={f} style={{ fontSize: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)', borderRadius: '999px', padding: '1px 6px', color: 'var(--text-muted)' }}>{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations tab */}
      {activeTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.length === 0 ? (
            <SectionCard title="Recommendations" icon="💡">
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
                No recommendations generated. Complete the assessment to generate recommendations.
              </div>
            </SectionCard>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)', padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{rec.domainIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{rec.title}</span>
                      <RiskBadge level={rec.priority} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      {rec.domain} · Effort: <strong style={{ color: 'var(--text-secondary)' }}>{rec.effort}</strong> · Impact: <strong style={{ color: 'var(--text-secondary)' }}>{rec.impact}</strong>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                  {rec.detail}
                </div>
                {rec.frameworks?.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {rec.frameworks.slice(0, 3).map((f) => (
                      <span key={f} style={{ fontSize: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)', borderRadius: '999px', padding: '1px 6px', color: 'var(--text-muted)' }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, threshold, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>{label}</div>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto',
        background: `conic-gradient(${threshold.colour} ${score}%, var(--bg-elevated) 0%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: threshold.colour, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, color: threshold.colour }}>
        {threshold.label}
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmVariant, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '440px', width: '90%',
      }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--danger)' }}>⚠ {title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
          <ActionButton variant={confirmVariant || 'danger'} onClick={onConfirm}>{confirmLabel}</ActionButton>
        </div>
      </div>
    </div>
  );
}
