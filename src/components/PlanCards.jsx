/**
 * QUANTUM COMPLIANCE OS™ — PlanCards.jsx
 * Run 10: Commercial Tier + Feature Gate Foundation
 *
 * Renders the full commercial tier UI:
 * - Current active plan display (Starter / Demo)
 * - Upgrade tier cards (Pro Consultant, Agency, White Label) — all Coming Soon
 * - Context note about Demo/Live/Backend progression
 *
 * SAFETY:
 * - No navigation to broken pages
 * - Locked buttons show advisory message only
 * - No real payment, backend, or auth calls
 * - Safe fallback if plan config fails to load
 * - All coming-soon features clearly labelled
 *
 * Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™
 */
import React, { useState } from 'react';
import {
  PLANS, PLAN_ORDER, PLAN_STATUS,
  getCurrentPlan, getUpgradePlans, formatClientLimit, isPlanComingSoon,
} from '../core/plans.js';

// ─── Locked feature toast ──────────────────────────────────────────────────────
function LockedToast({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)',
      boxShadow: 'var(--shadow-lg)', zIndex: 9999,
      color: 'var(--text-secondary)', fontSize: 'var(--text-sm)',
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      maxWidth: 480,
    }}>
      <span style={{ color: 'var(--warning)', fontSize: 'var(--text-lg)', lineHeight: 1 }}>🔒</span>
      <span>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', fontSize: 'var(--text-lg)', lineHeight: 1, padding: 0, marginLeft: 4,
      }}>×</button>
    </div>
  );
}

// ─── Single plan card ─────────────────────────────────────────────────────────
function PlanCard({ plan, isActive, onLockedClick }) {
  const isComingSoon = plan.status === PLAN_STATUS.COMING_SOON;
  const limit        = formatClientLimit(plan.id);

  const borderColor  = isActive
    ? plan.accent
    : isComingSoon
      ? 'var(--border-default)'
      : 'var(--border-default)';

  const cardBg = isActive
    ? `linear-gradient(135deg, var(--bg-secondary) 0%, rgba(${hexToRgb(plan.accent)}, 0.06) 100%)`
    : 'var(--bg-secondary)';

  return (
    <div style={{
      background:    cardBg,
      border:        `1px solid ${borderColor}`,
      borderRadius:  'var(--radius-lg)',
      padding:       'var(--space-5)',
      display:       'flex',
      flexDirection: 'column',
      gap:           'var(--space-3)',
      position:      'relative',
      transition:    'border-color 0.2s, box-shadow 0.2s',
      boxShadow:     isActive ? `0 0 0 2px ${plan.accent}33` : 'none',
      minWidth:      0,
    }}>

      {/* Active badge */}
      {isActive && (
        <div style={{
          position: 'absolute', top: -1, right: 16,
          background: plan.accent, color: '#000', fontWeight: 800,
          fontSize: 'var(--text-xs)', padding: '3px 10px',
          borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
          letterSpacing: '0.05em',
        }}>CURRENT PLAN</div>
      )}

      {/* Coming soon badge */}
      {isComingSoon && (
        <div style={{
          position: 'absolute', top: -1, right: 16,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-muted)', fontWeight: 700,
          fontSize: 'var(--text-xs)', padding: '3px 10px',
          borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
          letterSpacing: '0.04em',
        }}>COMING SOON</div>
      )}

      {/* Plan header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>{plan.icon}</span>
          <span style={{ fontWeight: 800, fontSize: 'var(--text-md)', color: isActive ? plan.accent : 'var(--text-primary)' }}>
            {plan.name}
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
          {plan.subtitle}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `rgba(${hexToRgb(plan.accent)}, 0.12)`,
          border: `1px solid rgba(${hexToRgb(plan.accent)}, 0.3)`,
          borderRadius: 'var(--radius-full)',
          padding: '3px 10px',
          fontSize: 'var(--text-xs)', fontWeight: 700,
          color: plan.accent,
        }}>
          👥 {limit}
        </div>
      </div>

      {/* Feature list */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1 }}>
        {plan.features.map((f) => (
          <li key={f.key} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            fontSize: 'var(--text-sm)', color: isComingSoon ? 'var(--text-muted)' : 'var(--text-secondary)',
            padding: '3px 0',
            lineHeight: 1.5,
          }}>
            <span style={{ color: isActive ? plan.accent : (isComingSoon ? 'var(--text-muted)' : 'var(--success)'), marginTop: 1, flexShrink: 0 }}>
              {isComingSoon ? '○' : '✓'}
            </span>
            {f.label}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isActive ? (
        <div style={{
          marginTop: 'var(--space-1)',
          background: `rgba(${hexToRgb(plan.accent)}, 0.1)`,
          border: `1px solid rgba(${hexToRgb(plan.accent)}, 0.25)`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-xs)', color: plan.accent, fontWeight: 600,
          textAlign: 'center',
        }}>
          ✅ Active — local-first, no backend required
        </div>
      ) : (
        <button
          onClick={() => onLockedClick(plan)}
          style={{
            marginTop: 'var(--space-1)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600,
            cursor: 'pointer', width: '100%',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = plan.accent; e.currentTarget.style.color = plan.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          🔒 Reserved for future upgrade
        </button>
      )}
    </div>
  );
}

// ─── Hex → rgb helper (for rgba background tinting) ──────────────────────────
function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#')) return '128,128,128';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * PlanCards — full commercial tier section.
 * Props:
 *   activePlanId {string}  — from state.settings.activePlanId (defaults to 'starter')
 */
export default function PlanCards({ activePlanId = 'starter' }) {
  const [lockedToast, setLockedToast] = useState(null);

  // Safe fallback — never crash if plan config has issues
  let currentPlan, allPlans;
  try {
    currentPlan = getCurrentPlan(activePlanId);
    allPlans    = PLAN_ORDER.map((id) => PLANS[id]).filter(Boolean);
  } catch (err) {
    return (
      <div style={{
        background: 'var(--warning-dim)', border: '1px solid var(--warning)',
        borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
        fontSize: 'var(--text-sm)', color: 'var(--warning)',
      }}>
        ⚠ Plan configuration could not be loaded. Existing app functionality is unaffected.
      </div>
    );
  }

  function handleLockedClick(plan) {
    setLockedToast(
      `${plan.name} is planned for a future upgrade run. This feature is not active yet. Existing app functionality is unaffected.`
    );
  }

  return (
    <div>
      {/* ── Current plan summary ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-tertiary)',
        border: `1px solid ${currentPlan.accent}44`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-5)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 'var(--space-3)',
      }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Current Plan
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 20 }}>{currentPlan.icon}</span>
            <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: currentPlan.accent }}>
              {currentPlan.name}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)', fontWeight: 700, padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: `${currentPlan.accent}22`,
              color: currentPlan.accent,
              border: `1px solid ${currentPlan.accent}44`,
            }}>ACTIVE</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
            {currentPlan.pricingNote}
          </div>
        </div>
        <div style={{
          fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
          maxWidth: 280, lineHeight: 1.7, textAlign: 'right',
        }}>
          <em>
            Demo Mode shows the product. Live Mode runs the product. Backend connection will scale it into a real SaaS platform in a future run.
          </em>
        </div>
      </div>

      {/* ── Tier cards grid ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {allPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={plan.id === (activePlanId || 'starter')}
            onLockedClick={handleLockedClick}
          />
        ))}
      </div>

      {/* ── Upgrade path note ────────────────────────────────────────────── */}
      <div style={{
        marginTop: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Upgrade path: </strong>
        Pro Consultant (Run 11) → Agency (future) → White Label (future). All higher tiers require backend connection and are reserved for future runs.
        No backend, payments, or external API has been added in this version.
        <span style={{ marginLeft: 8, opacity: 0.7 }}>· Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™</span>
      </div>

      {/* ── Locked toast ─────────────────────────────────────────────────── */}
      {lockedToast && (
        <LockedToast
          message={lockedToast}
          onClose={() => setLockedToast(null)}
        />
      )}
    </div>
  );
}
