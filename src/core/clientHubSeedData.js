/**
 * QUANTUM COMPLIANCE OS™ — clientHubSeedData.js
 * Run 11: Multi-Client Consultant Hub — Demo Seed Data
 * =====================================================
 * Five fictional demo clients for the Multi-Client Consultant Hub.
 * All records are clearly labelled isDemo: true.
 * Do NOT use these for real client assessment storage.
 *
 * These clients represent the five demo presentation scenarios:
 *  1. High-risk manufacturing client
 *  2. Medium-risk financial services client
 *  3. High-risk healthcare client
 *  4. Low-risk logistics client
 *  5. Review-needed public sector / SaaS client
 *
 * Data is entirely fictional and for demonstration purposes only.
 * No real organisations, individuals, or assessment data is represented.
 *
 * Architecture: Local-first. Defensive use only.
 * No backend. No Supabase. No external API.
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

const NOW = '2026-06-04T00:00:00.000Z';

export const DEMO_HUB_CLIENTS = [
  // ── 1. High-risk — Manufacturing ──────────────────────────────────────────
  {
    id:                    'hub_demo_acme_manufacturing',
    name:                  'Acme Manufacturing Ltd',
    sector:                'Manufacturing',
    contactName:           'Alex Morgan',
    contactEmail:          'alex.morgan@acme-example.demo',
    notes:                 'Legacy OT/IT environment. No post-quantum cryptography inventory. RSA-2048 in use across production systems. Supplier evidence gaps identified. Priority: cryptography audit and HNDL risk assessment.',
    tags:                  ['high-risk', 'legacy-systems', 'manufacturing', 'demo'],
    branding:              null,
    archived:              false,
    status:                'active',
    riskLevel:             'high',
    quantumReadinessScore: 18,
    securityScore:         41,
    evidenceStatus:        'incomplete',
    assessmentStatus:      'in-progress',
    lastAssessmentDate:    '2026-05-28',
    reportCount:           1,
    isDemo:                true,
    createdAt:             '2026-03-15T09:00:00.000Z',
    updatedAt:             NOW,
    lastActivity:          NOW,
    clientMeta: {
      mode:            'demo',
      isDemoMode:      true,
      demoDataLoaded:  true,
      isRealClient:    false,
      migratedAt:      NOW,
    },
  },

  // ── 2. Medium-risk — Financial Services ───────────────────────────────────
  {
    id:                    'hub_demo_northbridge_finance',
    name:                  'Northbridge Finance Group',
    sector:                'Financial Services',
    contactName:           'Samira Patel',
    contactEmail:          'samira.patel@northbridge-example.demo',
    notes:                 'Moderate exposure to harvest-now-decrypt-later risk via archive datasets. AES-256 implemented for at-rest data. TLS 1.3 in use for transit. Regulatory compliance review due Q3 2026. Partial evidence pack submitted.',
    tags:                  ['medium-risk', 'financial', 'regulatory', 'demo'],
    branding:              null,
    archived:              false,
    status:                'active',
    riskLevel:             'medium',
    quantumReadinessScore: 44,
    securityScore:         67,
    evidenceStatus:        'partial',
    assessmentStatus:      'in-progress',
    lastAssessmentDate:    '2026-06-01',
    reportCount:           2,
    isDemo:                true,
    createdAt:             '2026-02-20T10:30:00.000Z',
    updatedAt:             NOW,
    lastActivity:          NOW,
    clientMeta: {
      mode:            'demo',
      isDemoMode:      true,
      demoDataLoaded:  true,
      isRealClient:    false,
      migratedAt:      NOW,
    },
  },

  // ── 3. High-risk — Healthcare ─────────────────────────────────────────────
  {
    id:                    'hub_demo_greenline_health',
    name:                  'Greenline Health Systems',
    sector:                'Healthcare',
    contactName:           'Dr. Olivia Chen',
    contactEmail:          'olivia.chen@greenline-example.demo',
    notes:                 'Patient data encrypted at rest but legacy cryptographic algorithms in use across EHR integration middleware. High HNDL risk — historical patient records at long-term exposure risk. ICO compliance requirements apply. Evidence pack missing supplier declarations.',
    tags:                  ['high-risk', 'healthcare', 'hndl', 'demo'],
    branding:              null,
    archived:              false,
    status:                'active',
    riskLevel:             'high',
    quantumReadinessScore: 22,
    securityScore:         53,
    evidenceStatus:        'missing',
    assessmentStatus:      'review-needed',
    lastAssessmentDate:    '2026-05-15',
    reportCount:           1,
    isDemo:                true,
    createdAt:             '2026-01-10T08:00:00.000Z',
    updatedAt:             NOW,
    lastActivity:          NOW,
    clientMeta: {
      mode:            'demo',
      isDemoMode:      true,
      demoDataLoaded:  true,
      isRealClient:    false,
      migratedAt:      NOW,
    },
  },

  // ── 4. Low-risk — Logistics ───────────────────────────────────────────────
  {
    id:                    'hub_demo_securepath_logistics',
    name:                  'SecurePath Logistics',
    sector:                'Logistics',
    contactName:           'James O\'Brien',
    contactEmail:          'james.obrien@securepath-example.demo',
    notes:                 'Good baseline security posture. TLS 1.3 everywhere. Recent cryptographic audit completed. NIST SP 800-131A alignment in progress. Minimal sensitive long-duration data — low HNDL exposure. Evidence pack substantially complete.',
    tags:                  ['low-risk', 'logistics', 'well-managed', 'demo'],
    branding:              null,
    archived:              false,
    status:                'active',
    riskLevel:             'low',
    quantumReadinessScore: 71,
    securityScore:         84,
    evidenceStatus:        'partial',
    assessmentStatus:      'complete',
    lastAssessmentDate:    '2026-06-02',
    reportCount:           3,
    isDemo:                true,
    createdAt:             '2026-04-01T11:00:00.000Z',
    updatedAt:             NOW,
    lastActivity:          NOW,
    clientMeta: {
      mode:            'demo',
      isDemoMode:      true,
      demoDataLoaded:  true,
      isRealClient:    false,
      migratedAt:      NOW,
    },
  },

  // ── 5. Review-needed — Public Sector / SaaS ───────────────────────────────
  {
    id:                    'hub_demo_civiccloud_services',
    name:                  'CivicCloud Services',
    sector:                'Public Sector / SaaS',
    contactName:           'Marcus Webb',
    contactEmail:          'marcus.webb@civiccloud-example.demo',
    notes:                 'Government-adjacent SaaS provider. Data sovereignty requirements apply. Mixed cryptographic posture — some services fully updated, others pending migration. Security assessment complete but technical review of quantum migration plan required. Board sign-off pending.',
    tags:                  ['review-needed', 'public-sector', 'saas', 'demo'],
    branding:              null,
    archived:              false,
    status:                'active',
    riskLevel:             'medium',
    quantumReadinessScore: 38,
    securityScore:         61,
    evidenceStatus:        'incomplete',
    assessmentStatus:      'review-needed',
    lastAssessmentDate:    '2026-05-30',
    reportCount:           2,
    isDemo:                true,
    createdAt:             '2026-03-22T14:00:00.000Z',
    updatedAt:             NOW,
    lastActivity:          NOW,
    clientMeta: {
      mode:            'demo',
      isDemoMode:      true,
      demoDataLoaded:  true,
      isRealClient:    false,
      migratedAt:      NOW,
    },
  },
];

// ─── Lookup helper ────────────────────────────────────────────────────────────
export function getDemoHubClientById(id) {
  return DEMO_HUB_CLIENTS.find((c) => c.id === id) || null;
}

// ─── Demo client IDs (for fast set operations) ────────────────────────────────
export const DEMO_HUB_CLIENT_IDS = new Set(DEMO_HUB_CLIENTS.map((c) => c.id));
