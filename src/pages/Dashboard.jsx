import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import '../styles/cards.css';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { getState, subscribe } from '../core/storage.js';
import { SETUP_CHECKLIST, PAGES, DEFENSIVE_DISCLAIMER } from '../core/constants.js';
import { getSetupProgress, getActiveSystemCount, getCriticalSystemCount } from '../utils/scoreHelpers.js';
import { timeAgo } from '../utils/date.js';
import { getScoreThreshold } from '../core/scoringEngine.js';
import { buildClientRiskSnapshot } from '../core/copilotEngine.js';
import { getAuthConfig } from '../core/storage.js';
import { ROLE_META, getRoleLabel, getRoleColour, computeAuthState, AUTH_STATE_META } from '../core/authRoles.js';
import { WORKSPACE_MODE, isDemoMode as checkDemoMode } from '../core/workspaceMode.js';
import { getQuantumScoreThreshold, computeOverallReadinessScore } from '../core/quantumScoringEngine.js';

const ACTIVITY_DOT_TYPE = {
  org_created: 'success', org_updated: 'success',
  system_created: 'info', system_updated: 'info',
  system_deleted: 'danger', system_archived: 'warning',
  system_restored: 'success', settings_updated: 'default',
  branding_updated: 'default', demo_loaded: 'default',
  demo_cleared: 'warning', demo_restored: 'info',
  assessment_progress: 'info', assessment_scored: 'success',
  assessment_reset: 'warning',
  default: 'default',
};

// ─── Workspace Mode Banner ───────────────────────────────────────────────────
function WorkspaceModeBanner({ workspaceMode, isDemo, onNavigate }) {
  const WORKSPACE_MODE_REF = { DEMO: 'demo', PRODUCT: 'product' };
  if (!workspaceMode) return null;

  if (workspaceMode === WORKSPACE_MODE_REF.DEMO) {
    return (
      <div style={{
        padding: '8px 16px', marginBottom: '16px',
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
      }} role="status" aria-label="Demo Mode active">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px' }}>🎯</span>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '12px' }}>DEMO MODE — </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing fictional demo clients and sample data. All demo content is labelled. For real client work, switch to Product Mode.
            </span>
          </div>
        </div>
        {onNavigate && (
          <button onClick={() => onNavigate('settings')} style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--warning)',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 'var(--radius-md)', padding: '3px 10px', cursor: 'pointer', flexShrink: 0,
          }}>Switch to Product Mode →</button>
        )}
      </div>
    );
  }

  // Product mode — subtle confirmation
  return (
    <div style={{
      padding: '8px 16px', marginBottom: '16px',
      background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px',
      alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
    }} role="status" aria-label="Product Mode active">
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0, display: 'inline-block' }} aria-hidden="true" />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--success)' }}>Product Mode</strong> — Real client workspace. Demo data is hidden.{' '}
          No real data yet? Configure a backend in <strong>Settings → Backend Config</strong>.
        </span>
      </div>
      {onNavigate && (
        <button onClick={() => onNavigate('settings')} style={{
          fontSize: '11px', color: 'var(--text-muted)', background: 'transparent',
          border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0,
        }}>Demo Mode available in Settings</button>
      )}
    </div>
  );
}

// ─── Copilot Banner ──────────────────────────────────────────────────────────
function CopilotBanner({ state, onNavigate }) {
  const snapshot = buildClientRiskSnapshot(state);
  if (!snapshot) return null;

  const hasData = snapshot.hasSecAssessment || snapshot.hasQrAssessment;
  const critCount = snapshot.critRisks?.length || 0;
  const highCount = snapshot.highRisks?.length || 0;
  const urgentCount = critCount + highCount;

  return (
    <div style={{
      padding: '14px 20px', marginBottom: '24px',
      background: hasData
        ? 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(0,212,255,0.02) 100%)'
        : 'var(--bg-secondary)',
      border: hasData ? '1px solid rgba(0,212,255,0.25)' : '1px solid var(--border-muted)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '24px' }}>🤖</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>
            Consultant Copilot {hasData ? '— guidance ready' : '— complete an assessment to unlock'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {hasData
              ? `Local-first recommendation engine · ${urgentCount > 0 ? `${urgentCount} critical/high risk item${urgentCount !== 1 ? 's' : ''} to address` : 'Assessment data available'} · Generates executive summaries, talking points, remediation plans`
              : 'Complete the Security Assessment and Quantum Readiness Assessment to generate client-ready guidance.'}
          </div>
        </div>
      </div>
      {onNavigate && (
        <button
          onClick={() => onNavigate('consultant-copilot')}
          style={{
            padding: '7px 18px', background: hasData ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: hasData ? '#0d1117' : 'var(--text-muted)', border: 'none',
            borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
          }}
        >
          {hasData ? '🤖 Open Copilot →' : 'Open Copilot'}
        </button>
      )}
    </div>
  );
}

export default function Dashboard({ onNavigate, workspaceMode }) {
  const [state, setState] = useState(() => getState());

  useEffect(() => {
    const unsub = subscribe((s) => setState({ ...s }));
    return unsub;
  }, []);

  const { organisation, systemProfiles, assessmentState, evidencePack, reportModel, activityLog, clientMode } = state;
  const isDemo    = workspaceMode === WORKSPACE_MODE.DEMO || clientMode?.isDemoMode;
  const isProduct = workspaceMode === WORKSPACE_MODE.PRODUCT && !clientMode?.isDemoMode;

  const securityAssessment = assessmentState?.securityAssessment || {};
  const hasScore = securityAssessment.securityImplementationScore != null;
  const secScore = securityAssessment.securityImplementationScore;
  const prevScore = securityAssessment.preventativeControlScore;
  const secThreshold = hasScore ? getScoreThreshold(secScore) : null;

  const quantumReadiness = assessmentState?.quantumReadiness || {};
  const hasQuantumScore = quantumReadiness.quantumReadinessScore != null;
  const qScore = quantumReadiness.quantumReadinessScore;
  const agilityScore = quantumReadiness.cryptoAgilityScore;
  const hndlRisk = quantumReadiness.hndlRiskScore;
  const qThreshold = hasQuantumScore ? getQuantumScoreThreshold(qScore) : null;
  const overallReadinessScore = computeOverallReadinessScore(
    hasScore ? secScore : null,
    hasQuantumScore ? qScore : null
  );

  const progress = getSetupProgress(state);
  const activeCount = getActiveSystemCount(systemProfiles);
  const criticalCount = getCriticalSystemCount(systemProfiles);
  const riskCount = state.riskModel?.riskEntries?.length || 0;
  const recCount = state.recommendationModel?.recommendations?.length || 0;

  const recentActivity = (activityLog || []).slice(0, 8);

  // Security score stat card content
  const secScoreValue = hasScore
    ? <span style={{ color: secThreshold.colour, fontWeight: 800 }}>{secScore}%</span>
    : <StatusPill status={securityAssessment.status || 'not_started'} />;

  const secScoreSub = hasScore
    ? `${secThreshold.label} · Preventative: ${prevScore}%`
    : 'Complete the security assessment';

  return (
    <div>
      <PageHeader
        icon="⬡"
        title={`${organisation?.name || 'Dashboard'}`}
        subtitle={
          organisation?.sector && organisation?.country
            ? `${organisation.sector} · ${organisation.country}${organisation.dataSensitivityLevel ? ' · ' + organisation.dataSensitivityLevel.charAt(0).toUpperCase() + organisation.dataSensitivityLevel.slice(1) + ' sensitivity' : ''}`
            : 'Complete your organisation profile to get started.'
        }
      />

      {/* Workspace Mode Banner */}
      <WorkspaceModeBanner workspaceMode={workspaceMode} isDemo={isDemo} onNavigate={onNavigate} />


      {/* ── Run 26: Auth + Backend Status Row ─────────────────────────── */}
      {(() => {
        const _authCfg     = getAuthConfig();
        const _authState   = computeAuthState(state);
        const _authMeta    = AUTH_STATE_META[_authState] || {};
        const _activeRole  = (isDemo ? _authCfg?.demoPreviewRole : _authCfg?.activeRole) || 'owner';
        const _roleMeta    = ROLE_META[_activeRole] || {};
        const _backendCfg  = state.backendConfig || {};
        const _hasBackend  = _backendCfg.activeProvider && _backendCfg.activeProvider !== 'localOnly';
        const _lastTest    = (_backendCfg.connectionTests || [])[0];
        const _testPassed  = _lastTest?.status === 'success';
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {/* Role tile */}
            <div style={{ flex: 1, minWidth: 140, background: 'var(--bg-secondary)', border: `1px solid ${_roleMeta.colour || '#6b7280'}28`, borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>{_roleMeta.icon || '👤'}</span>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {isDemo ? 'Demo Preview Role' : 'Account Role'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: _roleMeta.colour || 'var(--text-secondary)' }}>
                  {_roleMeta.label || 'Owner'}
                  {isDemo && <span style={{ fontSize: 9, marginLeft: 4, color: '#f59e0b', fontWeight: 400 }}>(demo)</span>}
                </div>
              </div>
            </div>
            {/* Auth state tile */}
            <div style={{ flex: 1, minWidth: 140, background: 'var(--bg-secondary)', border: `1px solid ${_authMeta.colour || '#6b7280'}28`, borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>{_authMeta.icon || '🔑'}</span>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auth Status</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: _authMeta.colour || 'var(--text-secondary)' }}>
                  {_authMeta.label || 'Demo Mode'}
                </div>
              </div>
            </div>
            {/* Backend tile */}
            <div style={{ flex: 1, minWidth: 140, background: 'var(--bg-secondary)', border: `1px solid ${_testPassed ? '#10b98128' : '#6b728028'}`, borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>{_testPassed ? '🔗' : '💾'}</span>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Backend</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: _testPassed ? '#10b981' : '#6b7280' }}>
                  {_testPassed ? 'Connected' : _hasBackend ? 'Config saved' : 'Local only'}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Stat Cards */}
      <div className="dashboard-grid">
        <StatCard
          icon="🗄️"
          label="Active Systems"
          value={activeCount}
          sub={criticalCount > 0 ? `${criticalCount} critical` : 'No critical systems'}
          onClick={() => onNavigate(PAGES.SYSTEM_INVENTORY)}
        />
        <StatCard
          icon="🛡️"
          label="Security Score"
          value={secScoreValue}
          sub={secScoreSub}
          onClick={() => onNavigate(PAGES.SECURITY_ASSESSMENT)}
        />
        <StatCard
          icon="⚠️"
          label="Risk Items"
          value={riskCount > 0 ? riskCount : '—'}
          sub={riskCount > 0 ? `${(state.riskModel?.riskEntries || []).filter(r => r.inherentRisk === 'critical').length} critical` : 'Run security assessment'}
          onClick={() => onNavigate(PAGES.SECURITY_ASSESSMENT)}
        />
        <StatCard
          icon="⚛️"
          label="Quantum Readiness"
          value={hasQuantumScore
            ? <span style={{ color: qThreshold.colour, fontWeight: 800 }}>{qScore}%</span>
            : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{quantumReadiness.status === 'in_progress' ? 'In Progress' : 'Not Started'}</span>}
          sub={hasQuantumScore
            ? `${qThreshold.label} · Agility: ${agilityScore}% · HNDL: ${hndlRisk}/100`
            : 'Complete quantum readiness assessment'}
          onClick={() => onNavigate(PAGES.QUANTUM_READINESS)}
        />
        {overallReadinessScore != null && (
          <StatCard
            icon="📊"
            label="Overall Readiness"
            value={<span style={{ color: getQuantumScoreThreshold(overallReadinessScore).colour, fontWeight: 800 }}>{overallReadinessScore}%</span>}
            sub={`${getQuantumScoreThreshold(overallReadinessScore).label} · Security 60% + Quantum 40%`}
            onClick={() => onNavigate(PAGES.REPORTS)}
          />
        )}
      </div>

      {/* Security score bar (if scored) */}
      {hasScore && (
        <div
          style={{
            background: 'var(--bg-secondary)', border: `1px solid ${secThreshold.colour}44`,
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer',
          }}
          onClick={() => onNavigate(PAGES.SECURITY_ASSESSMENT)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate(PAGES.SECURITY_ASSESSMENT)}
        >
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: secThreshold.colour, lineHeight: 1 }}>{secScore}%</div>
            <div style={{ fontSize: '11px', color: secThreshold.colour, fontWeight: 700, marginTop: '2px' }}>{secThreshold.label}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Security Implementation Score · {riskCount} risk item{riskCount !== 1 ? 's' : ''} · {recCount} recommendation{recCount !== 1 ? 's' : ''}
            </div>
            <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${secScore}%`, borderRadius: '999px',
                background: `linear-gradient(90deg, ${secThreshold.colour} 0%, ${secThreshold.colour}99 100%)`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--accent)', flexShrink: 0 }}>View results →</span>
        </div>
      )}

      {/* Main row: checklist + activity */}
      <div className="dashboard-row">
        {/* Setup Checklist */}
        <div className="checklist-card">
          <div className="checklist-header">
            <h3>Setup Checklist</h3>
            <div className="checklist-progress">
              <div className="checklist-progress__bar">
                <div
                  className="checklist-progress__fill"
                  style={{ width: `${progress.percent}%` }}
                  role="progressbar"
                  aria-valuenow={progress.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="checklist-progress__label">
                {progress.completed}/{progress.total}
              </span>
            </div>
          </div>
          <div className="checklist-items">
            {SETUP_CHECKLIST.map((item) => {
              let done = false;
              try { done = item.check(state); } catch {}
              return (
                <div
                  key={item.id}
                  className={`checklist-item${done ? ' checklist-item--done' : ''}`}
                  onClick={() => onNavigate(item.page)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onNavigate(item.page)}
                  aria-label={`${done ? 'Completed: ' : 'Incomplete: '}${item.label}`}
                >
                  <div className={`checklist-item__check checklist-item__check--${done ? 'done' : 'pending'}`} aria-hidden="true">
                    {done ? '✓' : ''}
                  </div>
                  <div className="checklist-item__text">
                    <div className="checklist-item__label">{item.label}</div>
                    <div className="checklist-item__desc">{item.description}</div>
                  </div>
                  <span className="checklist-item__arrow" aria-hidden="true">›</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="checklist-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="activity-empty">No activity yet</div>
            ) : (
              recentActivity.map((entry) => (
                <div key={entry.id} className="activity-item">
                  <div
                    className={`activity-item__dot activity-item__dot--${ACTIVITY_DOT_TYPE[entry.type] || 'default'}`}
                    aria-hidden="true"
                  />
                  <div className="activity-item__content">
                    <div className="activity-item__message">{entry.message}</div>
                    <div className="activity-item__time">{timeAgo(entry.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Copilot Banner ───────────────────────────────────────────────────── */}
      <CopilotBanner state={state} onNavigate={onNavigate} />

      {/* Disclaimer */}
      <div className="disclaimer-banner" role="note" aria-label="Defensive use disclaimer">
        <div className="disclaimer-banner__title">⚠ Defensive Use Only</div>
        <p className="disclaimer-banner__text">{DEFENSIVE_DISCLAIMER}</p>
      </div>

      {/* Legal disclaimer — required on main dashboard */}
      <div style={{
        marginTop: 'var(--space-8)',
        padding: 'var(--space-4)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>⚠ Disclaimer:</strong>{' '}
        This platform is for <strong>defensive security readiness</strong>, compliance preparation, and post-quantum migration planning only.
        It does not perform offensive testing, unauthorised scanning, exploitation, or guarantee compliance.
        All assessments should be reviewed by qualified security professionals before operational decisions are made.
      </div>
    </div>
  );
}
