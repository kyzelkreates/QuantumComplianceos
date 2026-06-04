/**
 * QUANTUM COMPLIANCE OS™ — reportHistoryData.js
 * Run 12: Reports, Evidence History + Risk Comparison — Demo Seed Data
 * =====================================================================
 * Demo reports, evidence items, and assessment snapshots linked to the
 * 5 demo clients from Run 11 (clientHubSeedData.js).
 *
 * All records are clearly labelled isDemo: true.
 * These are FICTIONAL records for demonstration purposes only.
 * No real organisations, individuals, or compliance data is represented.
 *
 * Architecture: Local-first. Defensive use only.
 * No backend. No Supabase. No external API.
 *
 * IMPORTANT DISCLAIMER:
 * Risk scores and recommendations are advisory and require qualified
 * human review. Quantum-readiness guidance does not guarantee legal,
 * regulatory, or security compliance. Evidence status reflects records
 * currently available in the system and may be incomplete.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

// ─── Client ID references (from Run 11 clientHubSeedData.js) ─────────────────
const CID = {
  ACME:       'hub_demo_acme_manufacturing',
  NORTHBRIDGE:'hub_demo_northbridge_finance',
  GREENLINE:  'hub_demo_greenline_health',
  SECUREPATH: 'hub_demo_securepath_logistics',
  CIVIC:      'hub_demo_civiccloud_services',
};

// ─────────────────────────────────────────────────────────────────────────────
// DEMO REPORTS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_REPORTS = [

  // ── Acme Manufacturing — high risk ────────────────────────────────────────
  {
    id:                    'rpt_demo_acme_001',
    clientId:              CID.ACME,
    title:                 'Quantum Readiness Assessment — Initial Review',
    type:                  'quantum-readiness',
    status:                'review-needed',
    riskLevel:             'high',
    quantumReadinessScore: 18,
    securityScore:         41,
    evidenceStatus:        'incomplete',
    createdAt:             '2026-05-28',
    updatedAt:             '2026-05-28',
    generatedBy:           'Quantum Compliance OS™',
    summary:               'Initial assessment indicates high quantum exposure. RSA-2048 is in use across critical production systems with no post-quantum migration plan in place. HNDL risk is elevated due to long-duration operational data. Cryptography inventory is incomplete and supplier evidence is missing.',
    recommendations: [
      'Create a complete cryptography asset inventory covering all certificates, protocols, and dependencies.',
      'Prioritise migration planning for RSA-2048 systems to NIST FIPS 203/204/205-aligned algorithms.',
      'Request cryptography posture declarations from all tier-1 suppliers.',
      'Review TLS certificate lifecycle and identify certificates expiring within 12 months.',
      'Engage a post-quantum migration specialist for OT/IT convergence risk assessment.',
    ],
    isDemo: true,
  },

  // ── Northbridge Finance — medium risk ─────────────────────────────────────
  {
    id:                    'rpt_demo_northbridge_001',
    clientId:              CID.NORTHBRIDGE,
    title:                 'Security Implementation Assessment — Q1 2026',
    type:                  'security-assessment',
    status:                'final',
    riskLevel:             'medium',
    quantumReadinessScore: 44,
    securityScore:         67,
    evidenceStatus:        'partial',
    createdAt:             '2026-04-10',
    updatedAt:             '2026-04-18',
    generatedBy:           'Quantum Compliance OS™',
    summary:               'Security posture is moderate with good baseline controls. AES-256 is in use for at-rest data and TLS 1.3 for transit. Quantum readiness is partially addressed but HNDL risk from archive datasets has not been fully evaluated. Regulatory review is due Q3 2026.',
    recommendations: [
      'Complete HNDL risk assessment for historical archive datasets.',
      'Document cryptographic algorithm registry for regulatory review.',
      'Implement certificate rotation policy for all internet-facing services.',
      'Review supplier cryptographic standards as part of vendor management programme.',
    ],
    isDemo: true,
  },
  {
    id:                    'rpt_demo_northbridge_002',
    clientId:              CID.NORTHBRIDGE,
    title:                 'Executive Summary — Quantum Migration Readiness',
    type:                  'executive-summary',
    status:                'draft',
    riskLevel:             'medium',
    quantumReadinessScore: 44,
    securityScore:         67,
    evidenceStatus:        'partial',
    createdAt:             '2026-06-01',
    updatedAt:             '2026-06-01',
    generatedBy:           'Quantum Compliance OS™',
    summary:               'Draft executive summary prepared for board presentation. Outlines current quantum exposure, regulatory timeline, and proposed migration roadmap for senior leadership sign-off.',
    recommendations: [
      'Present migration roadmap to board for approval.',
      'Allocate Q3 2026 budget for post-quantum cryptography migration project.',
      'Engage external auditor to validate cryptographic inventory.',
    ],
    isDemo: true,
  },

  // ── Greenline Health — high risk, review-needed ───────────────────────────
  {
    id:                    'rpt_demo_greenline_001',
    clientId:              CID.GREENLINE,
    title:                 'Quantum Readiness Assessment — Healthcare Sector Review',
    type:                  'quantum-readiness',
    status:                'review-needed',
    riskLevel:             'high',
    quantumReadinessScore: 22,
    securityScore:         53,
    evidenceStatus:        'missing',
    createdAt:             '2026-05-15',
    updatedAt:             '2026-05-15',
    generatedBy:           'Quantum Compliance OS™',
    summary:               'Critical quantum exposure identified. Patient data encrypted at rest but legacy cryptographic algorithms are in use across EHR integration middleware. Long-duration patient records create significant HNDL risk. ICO compliance implications require urgent attention. Supplier declarations are missing.',
    recommendations: [
      'Immediately audit all cryptographic algorithms in use across EHR and middleware systems.',
      'Assess HNDL risk for historical patient records and estimate data longevity requirements.',
      'Obtain cryptography posture declarations from all healthcare IT suppliers.',
      'Engage Data Protection Officer regarding ICO compliance implications.',
      'Prioritise migration of highest-risk cryptographic implementations.',
    ],
    isDemo: true,
  },

  // ── SecurePath Logistics — low risk ──────────────────────────────────────
  {
    id:                    'rpt_demo_securepath_001',
    clientId:              CID.SECUREPATH,
    title:                 'Security Assessment — Post-Audit Summary',
    type:                  'security-assessment',
    status:                'final',
    riskLevel:             'low',
    quantumReadinessScore: 71,
    securityScore:         84,
    evidenceStatus:        'partial',
    createdAt:             '2026-05-20',
    updatedAt:             '2026-06-02',
    generatedBy:           'Quantum Compliance OS™',
    summary:               'Strong security posture confirmed. TLS 1.3 in use everywhere. Recent cryptographic audit completed successfully. NIST SP 800-131A alignment is in progress. Low HNDL exposure due to minimal long-duration sensitive data. Evidence pack is substantially complete with supplier declarations outstanding.',
    recommendations: [
      'Complete NIST SP 800-131A alignment documentation.',
      'Obtain final supplier cryptographic evidence to complete evidence pack.',
      'Schedule annual cryptographic posture review.',
    ],
    isDemo: true,
  },
  {
    id:                    'rpt_demo_securepath_002',
    clientId:              CID.SECUREPATH,
    title:                 'Evidence Pack — Cryptography Compliance Review',
    type:                  'evidence-pack',
    status:                'final',
    riskLevel:             'low',
    quantumReadinessScore: 71,
    securityScore:         84,
    evidenceStatus:        'partial',
    createdAt:             '2026-06-02',
    updatedAt:             '2026-06-02',
    generatedBy:           'Quantum Compliance OS™',
    summary:               'Evidence pack compiled for cryptography compliance review. Most evidence items complete. Supplier declarations from two tier-2 suppliers outstanding.',
    recommendations: [
      'Chase outstanding supplier declarations from Tier-2 suppliers.',
      'Archive completed evidence pack for future audit reference.',
    ],
    isDemo: true,
  },

  // ── CivicCloud Services — review-needed ──────────────────────────────────
  {
    id:                    'rpt_demo_civic_001',
    clientId:              CID.CIVIC,
    title:                 'Quantum Migration Plan — Initial Scope',
    type:                  'migration-plan',
    status:                'review-needed',
    riskLevel:             'medium',
    quantumReadinessScore: 38,
    securityScore:         61,
    evidenceStatus:        'incomplete',
    createdAt:             '2026-05-25',
    updatedAt:             '2026-05-30',
    generatedBy:            'Quantum Compliance OS™',
    summary:               'Initial quantum migration plan scoped for government-adjacent SaaS platform. Mixed cryptographic posture — some services fully updated, others pending migration. Government data sovereignty requirements complicate migration timeline. Board sign-off on technical remediation plan is pending.',
    recommendations: [
      'Obtain board approval for quantum migration technical plan.',
      'Map government data sovereignty requirements against proposed migration approach.',
      'Prioritise migration of services handling most sensitive government data.',
      'Engage legal counsel to confirm data residency compliance during migration.',
    ],
    isDemo: true,
  },
  {
    id:                    'rpt_demo_civic_002',
    clientId:              CID.CIVIC,
    title:                 'Supplier Risk Assessment — Government Supply Chain',
    type:                  'supplier-risk',
    status:                'draft',
    riskLevel:             'medium',
    quantumReadinessScore: 38,
    securityScore:         61,
    evidenceStatus:        'incomplete',
    createdAt:             '2026-05-30',
    updatedAt:             '2026-05-30',
    generatedBy:           'Quantum Compliance OS™',
    summary:               'Draft supplier risk assessment covering cryptographic posture of primary government supply chain. Several suppliers have not yet provided quantum-readiness declarations.',
    recommendations: [
      'Issue quantum-readiness information requests to all primary suppliers.',
      'Set 30-day deadline for supplier responses.',
      'Escalate non-responsive suppliers through procurement framework.',
    ],
    isDemo: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO EVIDENCE ITEMS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_EVIDENCE_ITEMS = [

  // ── Acme Manufacturing ────────────────────────────────────────────────────
  {
    id:          'ev_demo_acme_001',
    clientId:    CID.ACME,
    reportId:    'rpt_demo_acme_001',
    title:       'Cryptography Asset Inventory',
    category:    'cryptography',
    status:      'missing',
    priority:    'high',
    owner:       'IT Lead — Acme Manufacturing',
    dueDate:     '2026-06-20',
    lastUpdated: '2026-05-28',
    notes:       'Client has not yet supplied a complete list of cryptographic assets, certificates, protocols, and dependencies. Escalated at last review meeting.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_acme_002',
    clientId:    CID.ACME,
    reportId:    'rpt_demo_acme_001',
    title:       'Supplier Cryptography Declarations',
    category:    'supplier-risk',
    status:      'missing',
    priority:    'high',
    owner:       'Procurement — Acme Manufacturing',
    dueDate:     '2026-07-01',
    lastUpdated: '2026-05-28',
    notes:       'Tier-1 suppliers have not provided cryptographic posture declarations. Template issued but no responses received.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_acme_003',
    clientId:    CID.ACME,
    reportId:    'rpt_demo_acme_001',
    title:       'TLS Certificate Lifecycle Register',
    category:    'infrastructure',
    status:      'incomplete',
    priority:    'medium',
    owner:       'Network Team — Acme Manufacturing',
    dueDate:     '2026-06-30',
    lastUpdated: '2026-05-28',
    notes:       'Partial register provided covering 60% of internet-facing certificates. OT/IT boundary certificates not yet included.',
    isDemo:      true,
  },

  // ── Northbridge Finance ───────────────────────────────────────────────────
  {
    id:          'ev_demo_northbridge_001',
    clientId:    CID.NORTHBRIDGE,
    reportId:    'rpt_demo_northbridge_001',
    title:       'AES-256 Implementation Evidence',
    category:    'cryptography',
    status:      'complete',
    priority:    'high',
    owner:       'Security Team — Northbridge Finance',
    dueDate:     '2026-04-15',
    lastUpdated: '2026-04-14',
    notes:       'Full evidence provided. AES-256 confirmed in use for all at-rest data across core banking systems.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_northbridge_002',
    clientId:    CID.NORTHBRIDGE,
    reportId:    'rpt_demo_northbridge_001',
    title:       'Archive Dataset HNDL Risk Assessment',
    category:    'data-protection',
    status:      'incomplete',
    priority:    'high',
    owner:       'Data Governance — Northbridge Finance',
    dueDate:     '2026-07-15',
    lastUpdated: '2026-06-01',
    notes:       'HNDL risk assessment not yet complete. Data governance team have scoped the exercise but have not finalised results.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_northbridge_003',
    clientId:    CID.NORTHBRIDGE,
    reportId:    'rpt_demo_northbridge_001',
    title:       'Regulatory Compliance Framework Documentation',
    category:    'compliance',
    status:      'partial',
    priority:    'medium',
    owner:       'Compliance Team — Northbridge Finance',
    dueDate:     '2026-06-30',
    lastUpdated: '2026-06-01',
    notes:       'Framework documentation partially updated. Outstanding: quantum-readiness addendum for Q3 2026 regulatory review.',
    isDemo:      true,
  },

  // ── Greenline Health ──────────────────────────────────────────────────────
  {
    id:          'ev_demo_greenline_001',
    clientId:    CID.GREENLINE,
    reportId:    'rpt_demo_greenline_001',
    title:       'EHR Cryptography Audit Report',
    category:    'cryptography',
    status:      'missing',
    priority:    'high',
    owner:       'CTO — Greenline Health Systems',
    dueDate:     '2026-06-15',
    lastUpdated: '2026-05-15',
    notes:       'Audit of cryptographic algorithms in EHR and middleware systems not yet initiated. Critical blocker for assessment completion.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_greenline_002',
    clientId:    CID.GREENLINE,
    reportId:    'rpt_demo_greenline_001',
    title:       'Supplier Healthcare IT Cryptography Declarations',
    category:    'supplier-risk',
    status:      'missing',
    priority:    'high',
    owner:       'Procurement — Greenline Health',
    dueDate:     '2026-06-20',
    lastUpdated: '2026-05-15',
    notes:       'Information requests issued to 8 healthcare IT suppliers. No responses received to date.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_greenline_003',
    clientId:    CID.GREENLINE,
    reportId:    'rpt_demo_greenline_001',
    title:       'ICO Data Protection Impact Assessment',
    category:    'compliance',
    status:      'incomplete',
    priority:    'high',
    owner:       'DPO — Greenline Health Systems',
    dueDate:     '2026-07-01',
    lastUpdated: '2026-05-15',
    notes:       'DPIA scoped but not yet completed. DPO has flagged quantum risk as a new factor requiring assessment.',
    isDemo:      true,
  },

  // ── SecurePath Logistics ──────────────────────────────────────────────────
  {
    id:          'ev_demo_securepath_001',
    clientId:    CID.SECUREPATH,
    reportId:    'rpt_demo_securepath_001',
    title:       'TLS 1.3 Implementation Evidence',
    category:    'infrastructure',
    status:      'complete',
    priority:    'high',
    owner:       'Network Team — SecurePath Logistics',
    dueDate:     '2026-05-15',
    lastUpdated: '2026-05-14',
    notes:       'Full evidence provided. TLS 1.3 confirmed across all services. Certificate inventory complete.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_securepath_002',
    clientId:    CID.SECUREPATH,
    reportId:    'rpt_demo_securepath_001',
    title:       'Tier-2 Supplier Cryptographic Declarations',
    category:    'supplier-risk',
    status:      'partial',
    priority:    'medium',
    owner:       'Supplier Relations — SecurePath',
    dueDate:     '2026-06-10',
    lastUpdated: '2026-06-02',
    notes:       '4 of 6 tier-2 suppliers have responded. 2 outstanding. Follow-up issued.',
    isDemo:      true,
  },

  // ── CivicCloud Services ───────────────────────────────────────────────────
  {
    id:          'ev_demo_civic_001',
    clientId:    CID.CIVIC,
    reportId:    'rpt_demo_civic_001',
    title:       'Quantum Migration Technical Plan',
    category:    'policy',
    status:      'incomplete',
    priority:    'high',
    owner:       'CTO — CivicCloud Services',
    dueDate:     '2026-06-25',
    lastUpdated: '2026-05-30',
    notes:       'Technical plan drafted but not yet approved by board. Pending legal review of data sovereignty implications.',
    isDemo:      true,
  },
  {
    id:          'ev_demo_civic_002',
    clientId:    CID.CIVIC,
    reportId:    'rpt_demo_civic_002',
    title:       'Government Supplier Quantum-Readiness Declarations',
    category:    'supplier-risk',
    status:      'incomplete',
    priority:    'high',
    owner:       'Procurement — CivicCloud Services',
    dueDate:     '2026-07-01',
    lastUpdated: '2026-05-30',
    notes:       'Information requests issued. 3 of 10 primary suppliers have responded. Remaining 7 outstanding.',
    isDemo:      true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO ASSESSMENT SNAPSHOTS
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_SNAPSHOTS = [
  {
    id:                       'snap_demo_acme_001',
    clientId:                 CID.ACME,
    reportId:                 'rpt_demo_acme_001',
    snapshotDate:             '2026-05-28',
    riskLevel:                'high',
    quantumReadinessScore:    18,
    securityScore:            41,
    evidenceCompletionPercent: 15,
    priorityActionCount:      6,
    notes:                    'Baseline snapshot. Critical gaps identified. Cryptography inventory and supplier evidence missing.',
    isDemo:                   true,
  },
  {
    id:                       'snap_demo_northbridge_001',
    clientId:                 CID.NORTHBRIDGE,
    reportId:                 'rpt_demo_northbridge_001',
    snapshotDate:             '2026-04-10',
    riskLevel:                'medium',
    quantumReadinessScore:    44,
    securityScore:            67,
    evidenceCompletionPercent: 60,
    priorityActionCount:      3,
    notes:                    'Q1 2026 baseline. Good controls in place. HNDL assessment and archive risk evaluation outstanding.',
    isDemo:                   true,
  },
  {
    id:                       'snap_demo_northbridge_002',
    clientId:                 CID.NORTHBRIDGE,
    reportId:                 'rpt_demo_northbridge_002',
    snapshotDate:             '2026-06-01',
    riskLevel:                'medium',
    quantumReadinessScore:    44,
    securityScore:            67,
    evidenceCompletionPercent: 65,
    priorityActionCount:      2,
    notes:                    'Minor improvement on Q1. Archive HNDL assessment scoped. Compliance documentation in progress.',
    isDemo:                   true,
  },
  {
    id:                       'snap_demo_greenline_001',
    clientId:                 CID.GREENLINE,
    reportId:                 'rpt_demo_greenline_001',
    snapshotDate:             '2026-05-15',
    riskLevel:                'high',
    quantumReadinessScore:    22,
    securityScore:            53,
    evidenceCompletionPercent: 10,
    priorityActionCount:      7,
    notes:                    'Critical baseline. No cryptographic inventory. Supplier evidence absent. ICO DPIA not started.',
    isDemo:                   true,
  },
  {
    id:                       'snap_demo_securepath_001',
    clientId:                 CID.SECUREPATH,
    reportId:                 'rpt_demo_securepath_001',
    snapshotDate:             '2026-06-02',
    riskLevel:                'low',
    quantumReadinessScore:    71,
    securityScore:            84,
    evidenceCompletionPercent: 78,
    priorityActionCount:      1,
    notes:                    'Strong baseline. Evidence substantially complete. 2 outstanding supplier declarations.',
    isDemo:                   true,
  },
  {
    id:                       'snap_demo_civic_001',
    clientId:                 CID.CIVIC,
    reportId:                 'rpt_demo_civic_001',
    snapshotDate:             '2026-05-30',
    riskLevel:                'medium',
    quantumReadinessScore:    38,
    securityScore:            61,
    evidenceCompletionPercent: 35,
    priorityActionCount:      5,
    notes:                    'Mixed posture. Migration plan drafted. Board approval and supplier declarations pending.',
    isDemo:                   true,
  },
];

// ─── ID sets for fast de-duplication ──────────────────────────────────────────
export const DEMO_REPORT_IDS    = new Set(DEMO_REPORTS.map((r) => r.id));
export const DEMO_EVIDENCE_IDS  = new Set(DEMO_EVIDENCE_ITEMS.map((e) => e.id));
export const DEMO_SNAPSHOT_IDS  = new Set(DEMO_SNAPSHOTS.map((s) => s.id));
