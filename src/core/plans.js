/**
 * QUANTUM COMPLIANCE OS™ — plans.js
 * Run 10: Commercial Tier + Feature Gate Foundation
 *
 * Central single source of truth for commercial plan/tier configuration.
 * All plan limits, feature keys, and tier status come from this file.
 *
 * IMPORTANT:
 * - No backend connection. No real payments. No authentication required.
 * - Coming-soon tiers are advisory placeholders only.
 * - Default active plan is always "starter".
 * - Safe to import anywhere — no side effects.
 *
 * Architecture: Local-first. Defensive use only.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 */

// ─── Feature Keys ─────────────────────────────────────────────────────────────
// Centralised feature key registry.
// Add new keys here as features are built in future runs.
export const FEATURE_KEYS = {
  // ── Starter features (active now) ────────────────────────────────────────
  SINGLE_CLIENT_WORKSPACE:    'singleClientWorkspace',
  DEMO_DATA:                  'demoData',
  BASIC_DASHBOARD:            'basicDashboard',
  BASIC_REPORT_PREVIEW:       'basicReportPreview',
  LOCAL_FIRST_MODE:           'localFirstMode',
  SECURITY_ASSESSMENT:        'securityAssessment',
  QUANTUM_READINESS:          'quantumReadiness',
  EVIDENCE_PACK:              'evidencePack',
  RECOMMENDATIONS:            'recommendations',
  CONSULTANT_COPILOT:         'consultantCopilot',
  TARGET_ASSESSMENTS:         'targetAssessments',
  WORKSPACE_MODE_TOGGLE:      'workspaceModeToggle',
  DEPLOYMENT_READINESS:       'deploymentReadiness',

  // ── Pro Consultant features (coming soon — Run 11) ────────────────────────
  MULTI_CLIENT_HUB:           'multiClientHub',
  PER_CLIENT_BRANDING:        'perClientBranding',
  REPORT_HISTORY:             'reportHistory',
  RISK_COMPARISON:            'riskComparison',

  // ── Agency features (coming soon — future run) ────────────────────────────
  WHITE_LABEL_REPORTS:        'whiteLabelReports',
  CLIENT_ARCHIVE:             'clientArchive',
  PORTFOLIO_ANALYTICS:        'portfolioAnalytics',
  PRIORITY_ACTIONS:           'priorityActions',

  // ── White Label features (coming soon — future run) ───────────────────────
  FULL_WHITE_LABEL_MODE:      'fullWhiteLabelMode',
  CUSTOM_DOMAIN_READY:        'customDomainReady',
  ONBOARDING_WIZARD:          'onboardingWizard',
  SLA_SUPPORT_LAYER:          'slaSupportLayer',
};

// ─── Plan Status Values ───────────────────────────────────────────────────────
export const PLAN_STATUS = {
  ACTIVE:       'active',
  COMING_SOON:  'comingSoon',
  ARCHIVED:     'archived',
};

// ─── Central Plan Configuration ───────────────────────────────────────────────
export const PLANS = {
  starter: {
    id:           'starter',
    name:         'Starter / Demo',
    subtitle:     'Local single-client workspace',
    clientLimit:  1,
    status:       PLAN_STATUS.ACTIVE,
    price:        null,       // free / local-only
    pricingNote:  'Free — local-first, no backend required',
    description:  'Single-client local/demo workspace for quantum-readiness and security assessment previews.',
    icon:         '🟢',
    accent:       '#10b981',  // success green
    features: [
      { key: FEATURE_KEYS.SINGLE_CLIENT_WORKSPACE, label: 'Single client workspace' },
      { key: FEATURE_KEYS.DEMO_DATA,               label: 'Demo data' },
      { key: FEATURE_KEYS.BASIC_DASHBOARD,         label: 'Basic dashboard' },
      { key: FEATURE_KEYS.BASIC_REPORT_PREVIEW,    label: 'Basic report preview' },
      { key: FEATURE_KEYS.LOCAL_FIRST_MODE,        label: 'Local-first mode' },
    ],
    // All feature keys this plan can access (includes everything in starter)
    featureAccess: new Set([
      FEATURE_KEYS.SINGLE_CLIENT_WORKSPACE,
      FEATURE_KEYS.DEMO_DATA,
      FEATURE_KEYS.BASIC_DASHBOARD,
      FEATURE_KEYS.BASIC_REPORT_PREVIEW,
      FEATURE_KEYS.LOCAL_FIRST_MODE,
      FEATURE_KEYS.SECURITY_ASSESSMENT,
      FEATURE_KEYS.QUANTUM_READINESS,
      FEATURE_KEYS.EVIDENCE_PACK,
      FEATURE_KEYS.RECOMMENDATIONS,
      FEATURE_KEYS.CONSULTANT_COPILOT,
      FEATURE_KEYS.TARGET_ASSESSMENTS,
      FEATURE_KEYS.WORKSPACE_MODE_TOGGLE,
      FEATURE_KEYS.DEPLOYMENT_READINESS,
    ]),
  },

  proConsultant: {
    id:           'proConsultant',
    name:         'Pro Consultant',
    subtitle:     'Up to 10 client workspaces',
    clientLimit:  10,
    status:       PLAN_STATUS.COMING_SOON,
    price:        null,       // TBD when backend is connected
    pricingNote:  'Coming soon — reserved for future run',
    description:  'For independent consultants managing up to 10 client assessments.',
    icon:         '🔷',
    accent:       '#8b5cf6',  // purple
    comingSoonNote: 'Multi-client hub and per-client branding will be delivered in Run 11.',
    features: [
      { key: FEATURE_KEYS.MULTI_CLIENT_HUB,    label: 'Multi-client hub' },
      { key: FEATURE_KEYS.PER_CLIENT_BRANDING, label: 'Per-client branding' },
      { key: FEATURE_KEYS.REPORT_HISTORY,      label: 'Report history' },
      { key: FEATURE_KEYS.RISK_COMPARISON,     label: 'Risk comparison' },
    ],
    featureAccess: new Set([
      // Inherits all starter features
      FEATURE_KEYS.SINGLE_CLIENT_WORKSPACE,
      FEATURE_KEYS.DEMO_DATA,
      FEATURE_KEYS.BASIC_DASHBOARD,
      FEATURE_KEYS.BASIC_REPORT_PREVIEW,
      FEATURE_KEYS.LOCAL_FIRST_MODE,
      FEATURE_KEYS.SECURITY_ASSESSMENT,
      FEATURE_KEYS.QUANTUM_READINESS,
      FEATURE_KEYS.EVIDENCE_PACK,
      FEATURE_KEYS.RECOMMENDATIONS,
      FEATURE_KEYS.CONSULTANT_COPILOT,
      FEATURE_KEYS.TARGET_ASSESSMENTS,
      FEATURE_KEYS.WORKSPACE_MODE_TOGGLE,
      FEATURE_KEYS.DEPLOYMENT_READINESS,
      // Pro additions (not yet built)
      FEATURE_KEYS.MULTI_CLIENT_HUB,
      FEATURE_KEYS.PER_CLIENT_BRANDING,
      FEATURE_KEYS.REPORT_HISTORY,
      FEATURE_KEYS.RISK_COMPARISON,
    ]),
  },

  agency: {
    id:           'agency',
    name:         'Agency',
    subtitle:     'Up to 50 client workspaces',
    clientLimit:  50,
    status:       PLAN_STATUS.COMING_SOON,
    price:        null,
    pricingNote:  'Coming soon — reserved for future run',
    description:  'For small agencies and advisory teams managing up to 50 clients.',
    icon:         '🔶',
    accent:       '#f59e0b',  // amber/gold
    comingSoonNote: 'White-label reports and agency analytics are reserved for a future run.',
    features: [
      { key: FEATURE_KEYS.WHITE_LABEL_REPORTS,  label: 'White-label reports' },
      { key: FEATURE_KEYS.CLIENT_ARCHIVE,       label: 'Client archive' },
      { key: FEATURE_KEYS.PORTFOLIO_ANALYTICS,  label: 'Portfolio analytics' },
      { key: FEATURE_KEYS.PRIORITY_ACTIONS,     label: 'Priority actions' },
    ],
    featureAccess: new Set([
      // Inherits all starter + pro features
      FEATURE_KEYS.SINGLE_CLIENT_WORKSPACE,
      FEATURE_KEYS.DEMO_DATA,
      FEATURE_KEYS.BASIC_DASHBOARD,
      FEATURE_KEYS.BASIC_REPORT_PREVIEW,
      FEATURE_KEYS.LOCAL_FIRST_MODE,
      FEATURE_KEYS.SECURITY_ASSESSMENT,
      FEATURE_KEYS.QUANTUM_READINESS,
      FEATURE_KEYS.EVIDENCE_PACK,
      FEATURE_KEYS.RECOMMENDATIONS,
      FEATURE_KEYS.CONSULTANT_COPILOT,
      FEATURE_KEYS.TARGET_ASSESSMENTS,
      FEATURE_KEYS.WORKSPACE_MODE_TOGGLE,
      FEATURE_KEYS.DEPLOYMENT_READINESS,
      FEATURE_KEYS.MULTI_CLIENT_HUB,
      FEATURE_KEYS.PER_CLIENT_BRANDING,
      FEATURE_KEYS.REPORT_HISTORY,
      FEATURE_KEYS.RISK_COMPARISON,
      // Agency additions (not yet built)
      FEATURE_KEYS.WHITE_LABEL_REPORTS,
      FEATURE_KEYS.CLIENT_ARCHIVE,
      FEATURE_KEYS.PORTFOLIO_ANALYTICS,
      FEATURE_KEYS.PRIORITY_ACTIONS,
    ]),
  },

  whiteLabel: {
    id:           'whiteLabel',
    name:         'White Label',
    subtitle:     'Unlimited clients — full white-label',
    clientLimit:  null,       // null = unlimited
    status:       PLAN_STATUS.COMING_SOON,
    price:        null,
    pricingNote:  'Coming soon — reserved for future run',
    description:  'For full white-label deployment with unlimited clients and custom deployment options.',
    icon:         '💎',
    accent:       '#e5c77b',  // metallic gold
    comingSoonNote: 'Full white-label mode requires backend connection — reserved for a future run.',
    features: [
      { key: FEATURE_KEYS.FULL_WHITE_LABEL_MODE, label: 'Full white-label mode' },
      { key: FEATURE_KEYS.CUSTOM_DOMAIN_READY,   label: 'Custom domain ready' },
      { key: FEATURE_KEYS.ONBOARDING_WIZARD,     label: 'Onboarding wizard' },
      { key: FEATURE_KEYS.SLA_SUPPORT_LAYER,     label: 'SLA support layer' },
    ],
    featureAccess: new Set([
      // Inherits everything
      ...Object.values(FEATURE_KEYS),
    ]),
  },
};

// ─── Ordered plan list (for UI rendering) ────────────────────────────────────
export const PLAN_ORDER = ['starter', 'proConsultant', 'agency', 'whiteLabel'];

// ─── Default active plan ──────────────────────────────────────────────────────
export const DEFAULT_PLAN_ID = 'starter';

/**
 * planLimits — alias config for Run 19 plan-gating logic.
 * Maps planId → maxClients (null = unlimited, number = hard limit).
 * Source of truth: PLANS[id].clientLimit — this is a convenience map.
 */
export const planLimits = {
  starter:       { maxClients: 1 },
  proConsultant: { maxClients: 10 },
  agency:        { maxClients: 50 },
  whiteLabel:    { maxClients: null },   // null = unlimited
};

/**
 * Per-client branding safety rules (Run 19).
 * Client branding is a client-facing LAYER only — never overwrites product identity.
 */
export const BRANDING_SAFETY = {
  productNameLocked:    true,   // 'Quantum Compliance OS™' cannot be overwritten globally
  ownershipLineLocked:  true,   // 'Powered by 4P3X Intelligent AI™ Created by Kyzel Kreates™'
  clientBrandingLayer:  'client-only',   // logo/name/accent apply to client workspace, not app shell
  fallbackToDefaultStyle: true, // missing client branding falls back to 4P3X Verse™ styling
};

// ─── Helper: safe plan lookup ─────────────────────────────────────────────────
/**
 * Get plan config by ID. Returns starter if not found.
 * Never throws — safe to call even if planId is undefined.
 */
export function getPlanById(planId) {
  return PLANS[planId] || PLANS[DEFAULT_PLAN_ID];
}

/**
 * Get the currently active plan from state.
 * Falls back to starter if activePlanId is not set or unrecognised.
 * @param {string|null} activePlanId — from state.settings.activePlanId
 */
export function getCurrentPlan(activePlanId) {
  return getPlanById(activePlanId || DEFAULT_PLAN_ID);
}

/**
 * Check whether the given plan has access to a feature key.
 * Always returns true for starter features (safety net).
 * @param {string} planId
 * @param {string} featureKey
 */
export function canUseFeature(planId, featureKey) {
  const plan = getPlanById(planId || DEFAULT_PLAN_ID);
  if (!plan) return false;
  // Always allow starter features regardless of plan
  if (PLANS.starter.featureAccess.has(featureKey)) return true;
  return plan.featureAccess.has(featureKey);
}

/**
 * Get client limit for a plan.
 * Returns null for unlimited, a number otherwise.
 */
export function getClientLimitForPlan(planId) {
  const plan = getPlanById(planId);
  return plan.clientLimit ?? null;
}

/**
 * Returns true if the plan is a coming-soon placeholder.
 */
export function isPlanComingSoon(planId) {
  const plan = getPlanById(planId);
  return plan.status === PLAN_STATUS.COMING_SOON;
}

/**
 * Returns all plans that are coming soon (not yet active).
 * Used to render upgrade cards.
 */
export function getUpgradePlans() {
  return PLAN_ORDER
    .map((id) => PLANS[id])
    .filter((p) => p.status === PLAN_STATUS.COMING_SOON);
}

/**
 * Returns the current plan's client limit as a display string.
 * e.g. "1 client", "10 clients", "Unlimited"
 */
export function formatClientLimit(planId) {
  const limit = getClientLimitForPlan(planId);
  if (limit === null) return 'Unlimited';
  return limit === 1 ? '1 client' : `${limit} clients`;
}

/**
 * Returns true if the current client count is at or over the plan limit.
 * clientCount: actual number of real (non-demo) clients in workspace.
 * Returns false if unlimited.
 */
/**
 * isBrandingFieldAllowed — checks whether a branding field is allowed to override
 * the product identity. Always returns false for locked product fields.
 */
export function isBrandingFieldAllowed(fieldKey) {
  const locked = ['productName', 'ownershipLine', 'poweredBy', 'createdBy'];
  return !locked.includes(fieldKey);
}

/**
 * getClientBrandingLayer — returns a safe branding overlay for a given client.
 * Never allows overriding locked product identity fields.
 * Falls back to null for missing/unsafe values.
 */
export function getClientBrandingLayer(client) {
  if (!client) return null;
  const branding = client.branding || client.clientBranding || null;
  if (!branding) return null;
  const safe = {};
  ['logoUrl', 'clientName', 'accentColour', 'reportHeaderText'].forEach((key) => {
    if (branding[key] && isBrandingFieldAllowed(key)) safe[key] = branding[key];
  });
  return Object.keys(safe).length ? safe : null;
}

/**
 * getPlanGatingMessage — returns a safe locked-feature message for a given plan/feature.
 * Never crashes if plan is missing.
 */
export function getPlanGatingMessage(planId, featureKey) {
  const plan = getPlanById(planId || DEFAULT_PLAN_ID);
  if (plan.status === 'active' && plan.features.includes(featureKey)) return null;
  return 'This feature is part of a higher-tier upgrade path. Backend/payment integration required for live access.';
}

export function isAtClientLimit(planId, clientCount) {
  const limit = getClientLimitForPlan(planId);
  if (limit === null) return false;
  return (clientCount || 0) >= limit;
}
