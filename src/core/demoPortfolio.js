/**
 * QUANTUM COMPLIANCE OS™ — demoPortfolio.js
 * Run 6: Demo Data + Sales Demo Polish
 * ========================================
 * Five realistic SME demo clients with full assessment data.
 * ALL DATA IS FICTIONAL. No real companies. No real persons.
 *
 * Defensive use only. No offensive tooling. No scanning.
 * Based on supplied demo assessment information only.
 */

// ─── Shared date helpers ──────────────────────────────────────────────────────
const d = (daysAgo) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString();
};

const dateStr = (daysAgo) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toLocaleDateString('en-GB');
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT 1 — HIGH RISK: Meridian Legal Partners LLP
// Small legal/accountancy firm. Sensitive long-life client records.
// Weak MFA, poor crypto inventory, low quantum readiness.
// ═══════════════════════════════════════════════════════════════════════════════

export const CLIENT_MERIDIAN = {
  id: 'demo_client_meridian',
  name: 'Meridian Legal Partners LLP',
  sector: 'Legal',
  contactRole: 'Operations Director',
  tier: 'starter',
  lastActivity: d(2),
  archived: false,
  notes: 'High-risk demo client. Small legal firm handling long-retention client records with significant HNDL exposure.',
  riskBand: 'high',
};

export const STATE_MERIDIAN = {
  organisation: {
    id: 'org_meridian_001',
    name: 'Meridian Legal Partners LLP',
    sector: 'Legal',
    size: 'Small (10–49 employees)',
    country: 'United Kingdom',
    contactName: 'Sarah Okafor',
    contactEmail: 'sarah.okafor@meridian-legal.example.com',
    complianceNeeds: ['UK GDPR', 'NCSC Cyber Essentials', 'SRA Requirements'],
    dataSensitivityLevel: 'restricted',
    notes: 'Specialist litigation and corporate law firm. Processes privileged legal correspondence, client financial records, and personally identifiable information with retention periods of 7–15 years. Significant harvest-now-decrypt-later exposure due to long data shelf-life.',
    createdAt: d(45),
    updatedAt: d(2),
    isComplete: true,
  },
  systemProfiles: [
    {
      id: 'sys_mer_001',
      name: 'Case Management System',
      type: 'Web Application',
      owner: 'IT Manager',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive', 'Special Category Data'],
      encryptionKnown: 'Unknown — vendor-managed. TLS version not confirmed.',
      authMethods: ['Username & Password'],
      cloudProvider: 'Unknown',
      backupStatus: 'Manual',
      notes: 'Legacy SaaS case management. Vendor has not provided encryption documentation. MFA not enabled. Backup is manual and untested.',
      archived: false, createdAt: d(45), updatedAt: d(2),
    },
    {
      id: 'sys_mer_002',
      name: 'Email Platform (Microsoft 365)',
      type: 'Email Platform',
      owner: 'IT Manager',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive', 'Authentication Credentials'],
      encryptionKnown: 'TLS in transit. Rest encryption assumed but not verified.',
      authMethods: ['Username & Password', 'Multi-Factor Authentication (MFA)'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated (Untested)',
      notes: 'MFA enabled only for senior partners. 60% of staff use password-only access. No Conditional Access Policies configured.',
      archived: false, createdAt: d(45), updatedAt: d(5),
    },
    {
      id: 'sys_mer_003',
      name: 'Network File Share (On-Premise)',
      type: 'Storage System',
      owner: 'IT Manager',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive', 'Special Category Data', 'Intellectual Property'],
      encryptionKnown: 'No encryption at rest. Server located in office server room.',
      authMethods: ['Username & Password'],
      cloudProvider: 'On-Premise Only',
      backupStatus: 'Manual',
      notes: 'Primary document repository. No encryption at rest. Physical access controlled only by door lock. No offsite backup.',
      archived: false, createdAt: d(45), updatedAt: d(10),
    },
  ],
  assessmentState: {
    securityAssessment: {
      status: 'complete',
      lastUpdated: d(3),
      completedSections: ['mfa', 'password_policy', 'access_control', 'encryption_transit', 'encryption_rest', 'backups', 'logging_monitoring', 'incident_response', 'vulnerability_management', 'third_party', 'device_user_security', 'cloud_posture'],
      responses: {
        mfa_coverage: 'partial_senior', mfa_phishing_resistant: 'no', mfa_all_systems: 'no',
        password_policy: 'basic', password_manager: 'no', password_min_length: '8',
        encryption_transit: 'partial', encryption_rest: 'no', encryption_key_mgmt: 'none',
        backup_frequency: 'weekly', backup_tested: 'no', backup_offsite: 'no',
        logging: 'none', siem: 'no', incident_plan: 'no', ir_tested: 'no',
        vuln_scan: 'no', patch_cycle: 'ad_hoc', endpoint_protection: 'av_basic',
        supplier_review: 'no', dpa_in_place: 'partial', cyber_insurance: 'no',
        training: 'annual_basic', phishing_test: 'no',
      },
    },
    quantumReadiness: {
      status: 'complete',
      lastUpdated: d(3),
      completedSections: ['pke_exposure', 'cert_key_inventory', 'hndl_risk', 'crypto_agility', 'migration_planning'],
      responses: {
        rsa_use: 'yes', ecc_use: 'unknown', tls_version: 'unknown', cert_inventory: 'no',
        data_shelf_life: 'over_10_years', hndl_awareness: 'no', pqc_awareness: 'no',
        migration_plan: 'no', crypto_agility: 'no', nist_pqc_review: 'no',
      },
    },
  },
  riskModel: {
    riskEntries: [
      { id: 're_mer_001', ref: 'MLP-R-001', domain: 'Identity & Access Control', domainType: 'security', inherentRisk: 'critical', likelihood: 5, impact: 5, controlGap: 'MFA not enforced for all staff. Password-only access to case management and file share systems containing privileged legal correspondence.', status: 'open', owner: 'IT Manager', createdAt: d(3) },
      { id: 're_mer_002', ref: 'MLP-R-002', domain: 'Encryption & Key Management', domainType: 'quantum', inherentRisk: 'critical', likelihood: 5, impact: 5, controlGap: 'No encryption at rest on primary document repository. Encryption posture on case management system unknown. RSA usage suspected but not inventoried.', status: 'open', owner: 'IT Manager', createdAt: d(3) },
      { id: 're_mer_003', ref: 'MLP-R-003', domain: 'Backup & Recovery', domainType: 'security', inherentRisk: 'high', likelihood: 4, impact: 5, controlGap: 'Manual-only backup with no offsite copy. Backup restore never tested. Single point of failure for all client data.', status: 'open', owner: 'IT Manager', createdAt: d(3) },
      { id: 're_mer_004', ref: 'MLP-R-004', domain: 'Quantum Exposure (HNDL)', domainType: 'quantum', inherentRisk: 'critical', likelihood: 4, impact: 5, controlGap: 'Legal records retained 7–15 years. Adversaries harvesting encrypted data today could decrypt in 5–10 years using CRQC. No quantum migration plan in place.', status: 'open', owner: 'Operations Director', createdAt: d(3) },
      { id: 're_mer_005', ref: 'MLP-R-005', domain: 'Incident Response', domainType: 'security', inherentRisk: 'high', likelihood: 4, impact: 4, controlGap: 'No documented incident response plan. No tabletop exercise conducted. No cyber insurance in place.', status: 'open', owner: 'Operations Director', createdAt: d(3) },
      { id: 're_mer_006', ref: 'MLP-R-006', domain: 'Logging & Monitoring', domainType: 'security', inherentRisk: 'high', likelihood: 4, impact: 4, controlGap: 'No centralised logging. No SIEM. Anomalous access to client records would go undetected.', status: 'open', owner: 'IT Manager', createdAt: d(3) },
    ],
    lastUpdated: d(3),
  },
  recommendationModel: {
    recommendations: [
      { id: 'rec_mer_001', priority: 'critical', domain: 'Identity & Access Control', title: 'Enforce MFA for all staff immediately', detail: 'Enable multi-factor authentication for all Microsoft 365 accounts and the case management system. Prioritise phishing-resistant MFA (FIDO2/Passkey) for senior staff with access to privileged client records. Implement Conditional Access Policies to block legacy authentication.', effort: 'Low', impact: 'Critical', status: 'open', timeframe: 'Within 2 weeks', framework: 'NCSC Cyber Essentials / ISO 27001 A.9' },
      { id: 'rec_mer_002', priority: 'critical', domain: 'Encryption & Key Management', title: 'Encrypt file server at rest (BitLocker / VeraCrypt)', detail: 'Immediately enable full-disk encryption on the on-premise file server. Evaluate migration of file share to an encrypted cloud storage solution (e.g. SharePoint with appropriate controls) to reduce physical access risk. Document all encryption keys and establish a key management process.', effort: 'Medium', impact: 'Critical', status: 'open', timeframe: 'Within 1 month', framework: 'ISO 27001 A.10 / NCSC' },
      { id: 'rec_mer_003', priority: 'high', domain: 'Backup & Recovery', title: 'Implement automated, tested, offsite backup', detail: 'Replace manual backup with automated daily backup to an offsite or cloud location. Test restore quarterly. Document recovery time objectives for client data. Consider immutable backup solution for ransomware resilience.', effort: 'Medium', impact: 'High', status: 'open', timeframe: 'Within 1 month', framework: 'ISO 27001 A.12.3 / NCSC' },
      { id: 'rec_mer_004', priority: 'high', domain: 'Quantum Readiness', title: 'Initiate HNDL risk assessment and crypto inventory', detail: 'Given 7–15 year data retention, begin an inventory of all cryptographic algorithms in use across the case management system and email platform. Assess which data assets are at highest risk from harvest-now-decrypt-later attacks. Engage vendor for post-quantum migration roadmap.', effort: 'Medium', impact: 'High', status: 'open', timeframe: 'Within 3 months', framework: 'NIST SP 800-208 / NCSC PQC Guidance' },
      { id: 'rec_mer_005', priority: 'high', domain: 'Incident Response', title: 'Create and test incident response plan', detail: 'Draft a documented incident response plan covering breach notification (ICO / SRA), evidence preservation, client communication, and business continuity. Conduct an annual tabletop exercise. Obtain cyber liability insurance appropriate to legal sector risk.', effort: 'Low', impact: 'High', status: 'open', timeframe: 'Within 2 months', framework: 'ISO 27001 A.16 / ICO Guidance' },
    ],
    priorityActions: [
      { id: 'pa_mer_001', title: 'Enable MFA for all 100% of staff accounts', urgency: 'critical', assignedTo: 'IT Manager', dueDate: dateStr(0) },
      { id: 'pa_mer_002', title: 'Encrypt on-premise file server (BitLocker)', urgency: 'critical', assignedTo: 'IT Manager', dueDate: dateStr(-7) },
      { id: 'pa_mer_003', title: 'Set up automated offsite backup', urgency: 'high', assignedTo: 'IT Manager', dueDate: dateStr(-14) },
      { id: 'pa_mer_004', title: 'Request encryption documentation from case management vendor', urgency: 'high', assignedTo: 'Operations Director', dueDate: dateStr(-5) },
    ],
    lastUpdated: d(3),
  },
  evidencePack: {
    status: 'in_progress',
    lastUpdated: d(3),
    items: [
      { id: 'ev_mer_001', controlName: 'Multi-Factor Authentication Policy', evidenceType: 'policy', status: 'missing', owner: 'IT Manager', notes: 'No MFA policy exists. Enforcement is ad hoc for senior staff only.', framework: 'NCSC Cyber Essentials / ISO 27001 A.9', domain: 'mfa', dateAdded: d(3), lastReviewed: null, updatedAt: d(3) },
      { id: 'ev_mer_002', controlName: 'Encryption at Rest — File Server', evidenceType: 'configuration', status: 'missing', owner: 'IT Manager', notes: 'File server has no encryption at rest. No evidence available.', framework: 'ISO 27001 A.10', domain: 'encryption_rest', dateAdded: d(3), lastReviewed: null, updatedAt: d(3) },
      { id: 'ev_mer_003', controlName: 'Backup Policy & Restore Test Records', evidenceType: 'audit_log', status: 'planned', owner: 'IT Manager', notes: 'Manual backup only. No documented policy. Restore test planned for next quarter.', framework: 'ISO 27001 A.12.3', domain: 'backups', dateAdded: d(3), lastReviewed: null, updatedAt: d(3) },
      { id: 'ev_mer_004', controlName: 'Incident Response Plan', evidenceType: 'policy', status: 'missing', owner: 'Operations Director', notes: 'No documented IRP. Drafting in progress with external consultant.', framework: 'ISO 27001 A.16', domain: 'incident_response', dateAdded: d(3), lastReviewed: null, updatedAt: d(3) },
      { id: 'ev_mer_005', controlName: 'Cryptographic Asset Inventory', evidenceType: 'audit_log', status: 'missing', owner: 'IT Manager', notes: 'No crypto inventory exists. Vendor documentation requested — pending.', framework: 'NIST SP 800-208', domain: 'pke_exposure', dateAdded: d(3), lastReviewed: null, updatedAt: d(3) },
      { id: 'ev_mer_006', controlName: 'Data Shelf-Life & HNDL Risk Assessment', evidenceType: 'policy', status: 'missing', owner: 'Operations Director', notes: 'Data retained 7–15 years. HNDL risk not yet formally assessed.', framework: 'NIST IR 8413 / NCSC PQC', domain: 'hndl_risk', dateAdded: d(3), lastReviewed: null, updatedAt: d(3) },
      { id: 'ev_mer_007', controlName: 'Security Awareness Training Records', evidenceType: 'training_record', status: 'in_progress', owner: 'Operations Director', notes: 'Annual awareness training completed by 12 of 18 staff. Phishing simulation not conducted.', framework: 'ISO 27001 A.7', domain: 'training', dateAdded: d(3), lastReviewed: d(30), updatedAt: d(3) },
      { id: 'ev_mer_008', controlName: 'UK GDPR Data Processing Register (Article 30)', evidenceType: 'document', status: 'in_progress', owner: 'Operations Director', notes: 'Article 30 register partially drafted. Missing several processing activities.', framework: 'UK GDPR Article 30', domain: 'data_protection', dateAdded: d(3), lastReviewed: d(60), updatedAt: d(3) },
    ],
  },
  reportModel: {
    status: 'ready',
    lastGenerated: d(2),
    sections: [],
    history: [
      {
        id: 'report_mer_001',
        generatedAt: d(2),
        type: 'executive',
        label: 'Executive Readiness Report — Meridian Legal Partners',
        scoreSnapshot: {
          securityImplementationScore: 28,
          quantumReadinessScore: 15,
          overallReadinessScore: 22,
          riskBand: 'high',
        },
        consultantNotes: 'Client is at significant risk. Immediate action required on MFA and encryption at rest before any compliance assessment can proceed. HNDL exposure is severe given legal retention periods.',
        disclaimer: 'Based on supplied assessment information only. This report does not constitute a formal security audit or legal compliance certification.',
      },
      {
        id: 'report_mer_002',
        generatedAt: d(2),
        type: 'technical',
        label: 'Technical Remediation Plan — Meridian Legal Partners',
        scoreSnapshot: {
          securityImplementationScore: 28,
          quantumReadinessScore: 15,
          overallReadinessScore: 22,
          riskBand: 'high',
        },
        consultantNotes: '6 critical/high risk items identified. MFA enforcement, file server encryption, and backup overhaul are immediate priorities. Estimated remediation timeline: 3–4 months for critical items.',
        disclaimer: 'Based on supplied assessment information only.',
      },
    ],
    config: {},
  },
  activityLog: [
    { id: 'log_mer_001', type: 'assessment_complete', message: 'Security assessment completed. Score: 28/100. High-risk band.', timestamp: d(3), meta: null },
    { id: 'log_mer_002', type: 'quantum_complete', message: 'Quantum readiness assessment completed. Score: 15/100. Critical HNDL exposure.', timestamp: d(3), meta: null },
    { id: 'log_mer_003', type: 'report_generated', message: 'Executive Readiness Report generated.', timestamp: d(2), meta: null },
    { id: 'log_mer_004', type: 'report_generated', message: 'Technical Remediation Plan generated.', timestamp: d(2), meta: null },
    { id: 'log_mer_005', type: 'evidence_scaffolded', message: 'Evidence pack scaffolded with 8 items.', timestamp: d(3), meta: null },
    { id: 'log_mer_006', type: 'client_note', message: 'Client notified of critical MFA gap. Follow-up scheduled in 2 weeks.', timestamp: d(1), meta: null },
  ],
  clientMode: { isDemoMode: true, demoDataLoaded: true },
  branding: { productName: 'Quantum Compliance OS', tagline: 'Defensive Security & Quantum-Readiness Assessment', logoText: 'QC-OS', accentColour: '#00d4ff', logoUrl: null },
  settings: { theme: 'dark', demoMode: true, autosave: true, language: 'en-GB', dateFormat: 'DD/MM/YYYY' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT 2 — MEDIUM RISK: Vantage SaaS Technologies Ltd
// Growing SaaS company. Partial MFA, mixed cloud controls.
// Moderate evidence maturity, some encryption awareness.
// ═══════════════════════════════════════════════════════════════════════════════

export const CLIENT_VANTAGE = {
  id: 'demo_client_vantage',
  name: 'Vantage SaaS Technologies Ltd',
  sector: 'Technology',
  contactRole: 'Head of Engineering',
  tier: 'pro_consultant',
  lastActivity: d(1),
  archived: false,
  notes: 'Medium-risk demo client. Growing SaaS business. Good engineering culture but compliance and quantum posture needs maturation.',
  riskBand: 'medium',
};

export const STATE_VANTAGE = {
  organisation: {
    id: 'org_vantage_001',
    name: 'Vantage SaaS Technologies Ltd',
    sector: 'Technology',
    size: 'Medium (50–249 employees)',
    country: 'United Kingdom',
    contactName: 'Marcus Chen',
    contactEmail: 'marcus.chen@vantage-saas.example.com',
    complianceNeeds: ['ISO 27001', 'UK GDPR', 'SOC 2 Type II', 'NCSC Cyber Essentials Plus'],
    dataSensitivityLevel: 'confidential',
    notes: 'B2B SaaS platform providing workflow automation to mid-market clients. Processes customer business data and some employee PII. Working toward ISO 27001 certification. Engineering team has strong DevSecOps culture but compliance documentation lags behind.',
    createdAt: d(60),
    updatedAt: d(1),
    isComplete: true,
  },
  systemProfiles: [
    {
      id: 'sys_van_001',
      name: 'SaaS Platform (Production)',
      type: 'Web Application',
      owner: 'Engineering Team',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive', 'Authentication Credentials'],
      encryptionKnown: 'TLS 1.3 in transit. AES-256 at rest (PostgreSQL encryption). RSA-2048 TLS certificates.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'OAuth 2.0', 'Single Sign-On (SSO)'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: 'Kubernetes-hosted on AWS. WAF in place. MFA enforced for all customer accounts. RSA-2048 certificates due for renewal — quantum migration path not yet considered.',
      archived: false, createdAt: d(60), updatedAt: d(5),
    },
    {
      id: 'sys_van_002',
      name: 'CI/CD Pipeline (GitHub Actions + AWS)',
      type: 'CI/CD Pipeline',
      owner: 'Engineering Team',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Authentication Credentials', 'Encryption Keys / Secrets'],
      encryptionKnown: 'AWS Secrets Manager for secrets. Some developer machines store API keys locally.',
      authMethods: ['OAuth 2.0', 'API Key'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: 'Secrets managed via AWS Secrets Manager. Some legacy secrets in .env files not yet rotated. Developer workstations not centrally managed.',
      archived: false, createdAt: d(60), updatedAt: d(10),
    },
    {
      id: 'sys_van_003',
      name: 'Internal Admin Tools',
      type: 'Web Application',
      owner: 'Product Team',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Personal Data (PII)', 'Authentication Credentials'],
      encryptionKnown: 'TLS 1.2. Internal tool — not customer facing.',
      authMethods: ['Single Sign-On (SSO)', 'Multi-Factor Authentication (MFA)'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: 'Internal admin console. SSO enforced but some service accounts use password-only auth. Audit logging enabled.',
      archived: false, createdAt: d(60), updatedAt: d(15),
    },
    {
      id: 'sys_van_004',
      name: 'Data Warehouse (Snowflake)',
      type: 'Database',
      owner: 'Data Team',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive', 'Financial Data'],
      encryptionKnown: 'Snowflake managed encryption at rest and in transit.',
      authMethods: ['Single Sign-On (SSO)', 'Multi-Factor Authentication (MFA)'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: 'Customer analytics and billing data. MFA enforced. Row-level security implemented for client data segregation. Column masking for PII fields.',
      archived: false, createdAt: d(60), updatedAt: d(20),
    },
  ],
  assessmentState: {
    securityAssessment: {
      status: 'complete',
      lastUpdated: d(7),
      completedSections: ['mfa', 'password_policy', 'access_control', 'encryption_transit', 'encryption_rest', 'backups', 'logging_monitoring', 'incident_response', 'vulnerability_management', 'third_party', 'device_user_security', 'cloud_posture'],
      responses: {
        mfa_coverage: 'all_cloud', mfa_phishing_resistant: 'partial', mfa_all_systems: 'partial',
        password_policy: 'strong', password_manager: 'partial', encryption_transit: 'full_tls13',
        encryption_rest: 'partial', encryption_key_mgmt: 'cloud_managed',
        backup_frequency: 'daily', backup_tested: 'yes', backup_offsite: 'yes',
        logging: 'partial_siem', siem: 'yes', incident_plan: 'yes', ir_tested: 'partial',
        vuln_scan: 'quarterly', patch_cycle: 'automated', endpoint_protection: 'edr',
        supplier_review: 'annual', dpa_in_place: 'yes', cyber_insurance: 'yes',
        training: 'quarterly', phishing_test: 'yes',
      },
    },
    quantumReadiness: {
      status: 'complete',
      lastUpdated: d(7),
      completedSections: ['pke_exposure', 'cert_key_inventory', 'hndl_risk', 'crypto_agility', 'migration_planning'],
      responses: {
        rsa_use: 'yes_rsa2048', ecc_use: 'yes', tls_version: 'tls13_partial',
        cert_inventory: 'partial', data_shelf_life: '3_to_7_years',
        hndl_awareness: 'yes', pqc_awareness: 'yes',
        migration_plan: 'started', crypto_agility: 'partial', nist_pqc_review: 'yes',
      },
    },
  },
  riskModel: {
    riskEntries: [
      { id: 're_van_001', ref: 'VST-R-001', domain: 'Encryption & Key Management', domainType: 'quantum', inherentRisk: 'high', likelihood: 3, impact: 4, controlGap: 'RSA-2048 TLS certificates in use across production platform. No post-quantum migration timeline defined for certificate infrastructure despite NIST FIPS 203/204 publication.', status: 'open', owner: 'Engineering Team', createdAt: d(7) },
      { id: 're_van_002', ref: 'VST-R-002', domain: 'Identity & Access Control', domainType: 'security', inherentRisk: 'medium', likelihood: 3, impact: 3, controlGap: 'Service accounts in CI/CD pipeline use API key authentication without rotation schedule. Some legacy .env files on developer workstations.', status: 'in_progress', owner: 'Engineering Team', createdAt: d(7) },
      { id: 're_van_003', ref: 'VST-R-003', domain: 'Quantum Readiness (HNDL)', domainType: 'quantum', inherentRisk: 'medium', likelihood: 3, impact: 4, controlGap: 'Customer data retained 3–7 years. HNDL risk acknowledged but formal data shelf-life assessment not documented. PQC migration roadmap in early draft only.', status: 'in_progress', owner: 'Head of Engineering', createdAt: d(7) },
      { id: 're_van_004', ref: 'VST-R-004', domain: 'Third-Party / Supply Chain', domainType: 'security', inherentRisk: 'medium', likelihood: 3, impact: 3, controlGap: 'Annual supplier review exists but does not include quantum-readiness posture of key vendors. Two tier-1 vendors have not provided PQC transition timelines.', status: 'open', owner: 'Head of Engineering', createdAt: d(7) },
      { id: 're_van_005', ref: 'VST-R-005', domain: 'Endpoint Security', domainType: 'security', inherentRisk: 'medium', likelihood: 3, impact: 3, controlGap: 'Developer workstations not centrally managed via MDM. No disk encryption policy enforced for contractor laptops.', status: 'open', owner: 'Head of Engineering', createdAt: d(7) },
    ],
    lastUpdated: d(7),
  },
  recommendationModel: {
    recommendations: [
      { id: 'rec_van_001', priority: 'high', domain: 'Encryption & Key Management', title: 'Begin post-quantum certificate migration planning', detail: 'Inventory all RSA-2048 and ECC certificates across production infrastructure. Engage CA for timeline on PQC hybrid certificates (e.g. X.509 with ML-KEM). Assess cloud provider (AWS) PQC roadmap and align certificate renewal cycles with NIST FIPS 203 adoption.', effort: 'Medium', impact: 'High', status: 'open', timeframe: 'Within 3 months', framework: 'NIST SP 800-208 / NIST FIPS 203' },
      { id: 'rec_van_002', priority: 'medium', domain: 'Identity & Access Control', title: 'Implement secrets rotation and workstation MDM', detail: 'Rotate all legacy .env API keys. Implement automated secrets rotation via AWS Secrets Manager for all service accounts. Deploy MDM (e.g. Jamf/Intune) and enforce disk encryption on all developer workstations including contractors.', effort: 'Medium', impact: 'Medium', status: 'in_progress', timeframe: 'Within 2 months', framework: 'CIS Control 4 / ISO 27001 A.9' },
      { id: 'rec_van_003', priority: 'medium', domain: 'Quantum Readiness', title: 'Formalise HNDL data shelf-life assessment', detail: 'Document a formal data shelf-life assessment for all customer data categories. Classify which datasets have HNDL relevance given 3–7 year retention. Include findings in PQC migration roadmap and communicate to enterprise customers.', effort: 'Low', impact: 'Medium', status: 'in_progress', timeframe: 'Within 2 months', framework: 'NIST IR 8413 / NCSC PQC Guidance' },
      { id: 'rec_van_004', priority: 'medium', domain: 'Third-Party Security', title: 'Extend supplier review to include PQC posture', detail: 'Add post-quantum cryptography readiness questions to annual supplier review questionnaire. Request PQC transition timelines from tier-1 vendors. Include quantum risk in Data Processing Agreement reviews.', effort: 'Low', impact: 'Medium', status: 'open', timeframe: 'Within 3 months', framework: 'ISO 27001 A.15 / NIS2 Article 21' },
    ],
    priorityActions: [
      { id: 'pa_van_001', title: 'Complete PQC certificate inventory', urgency: 'high', assignedTo: 'Engineering Team', dueDate: dateStr(-21) },
      { id: 'pa_van_002', title: 'Rotate all legacy .env API keys', urgency: 'medium', assignedTo: 'Engineering Team', dueDate: dateStr(-14) },
      { id: 'pa_van_003', title: 'Deploy MDM to all developer workstations', urgency: 'medium', assignedTo: 'Head of Engineering', dueDate: dateStr(-30) },
    ],
    lastUpdated: d(7),
  },
  evidencePack: {
    status: 'in_progress',
    lastUpdated: d(5),
    items: [
      { id: 'ev_van_001', controlName: 'MFA Policy & Configuration Export', evidenceType: 'configuration', status: 'complete', owner: 'Engineering Team', notes: 'AWS IAM MFA enforcement documented. SSO configuration exported from Okta. Customer-facing MFA enforcement verified via penetration test report.', framework: 'ISO 27001 A.9 / NCSC CE', domain: 'mfa', dateAdded: d(30), lastReviewed: d(7), updatedAt: d(7) },
      { id: 'ev_van_002', controlName: 'TLS Configuration & Certificate Records', evidenceType: 'configuration', status: 'complete', owner: 'Engineering Team', notes: 'TLS 1.3 enforced. Certificate inventory partially complete. 3 legacy RSA-2048 certs identified for rotation.', framework: 'ISO 27001 A.10 / NCSC TLS Guidance', domain: 'encryption_transit', dateAdded: d(30), lastReviewed: d(7), updatedAt: d(7) },
      { id: 'ev_van_003', controlName: 'Backup & Restore Test Records', evidenceType: 'audit_log', status: 'complete', owner: 'Engineering Team', notes: 'Automated daily backups to S3 cross-region. Quarterly restore test conducted. RTO < 4 hours verified.', framework: 'ISO 27001 A.12.3', domain: 'backups', dateAdded: d(30), lastReviewed: d(14), updatedAt: d(14) },
      { id: 'ev_van_004', controlName: 'Incident Response Plan', evidenceType: 'policy', status: 'needs_review', owner: 'Head of Engineering', notes: 'IRP documented v1.2. Tabletop exercise completed but plan needs update following team restructure.', framework: 'ISO 27001 A.16', domain: 'incident_response', dateAdded: d(90), lastReviewed: d(90), updatedAt: d(7) },
      { id: 'ev_van_005', controlName: 'Vulnerability Scan Reports', evidenceType: 'audit_log', status: 'complete', owner: 'Engineering Team', notes: 'Quarterly automated scans (Tenable). Last scan: no critical findings. 3 high-severity issues remediated within SLA.', framework: 'ISO 27001 A.12.6 / CIS Control 7', domain: 'vulnerability_management', dateAdded: d(30), lastReviewed: d(14), updatedAt: d(14) },
      { id: 'ev_van_006', controlName: 'Cryptographic Asset Inventory', evidenceType: 'audit_log', status: 'in_progress', owner: 'Engineering Team', notes: 'Partial inventory. RSA-2048 TLS certs mapped. Internal service-to-service encryption not yet fully documented.', framework: 'NIST SP 800-208', domain: 'pke_exposure', dateAdded: d(14), lastReviewed: null, updatedAt: d(7) },
      { id: 'ev_van_007', controlName: 'PQC Migration Roadmap (Draft)', evidenceType: 'policy', status: 'in_progress', owner: 'Head of Engineering', notes: 'Draft roadmap v0.2 in progress. Certificate migration phase 1 scoped. Awaiting AWS PQC GA announcement.', framework: 'NIST SP 800-208 / NCSC PQC', domain: 'migration_planning', dateAdded: d(21), lastReviewed: null, updatedAt: d(7) },
      { id: 'ev_van_008', controlName: 'Supplier Security Due Diligence Records', evidenceType: 'contract', status: 'needs_review', owner: 'Head of Engineering', notes: 'Annual supplier review completed for 8 of 11 vendors. PQC posture not yet included in questionnaire.', framework: 'ISO 27001 A.15', domain: 'third_party', dateAdded: d(90), lastReviewed: d(60), updatedAt: d(7) },
      { id: 'ev_van_009', controlName: 'ISO 27001 Risk Assessment Register', evidenceType: 'audit_log', status: 'in_progress', owner: 'Head of Engineering', notes: 'Risk register maintained. 5 risks identified and assessed in this assessment cycle. Quantum risks being added.', framework: 'ISO 27001 §6', domain: 'governance', dateAdded: d(30), lastReviewed: d(7), updatedAt: d(7) },
    ],
  },
  reportModel: {
    status: 'ready',
    lastGenerated: d(5),
    sections: [],
    history: [
      {
        id: 'report_van_001',
        generatedAt: d(5),
        type: 'executive',
        label: 'Executive Readiness Report — Vantage SaaS Technologies',
        scoreSnapshot: { securityImplementationScore: 62, quantumReadinessScore: 48, overallReadinessScore: 57, riskBand: 'medium' },
        consultantNotes: 'Client demonstrates a maturing security posture with strong engineering practices. Key gaps are post-quantum certificate migration planning and workstation MDM. ISO 27001 readiness trajectory is positive.',
        disclaimer: 'Based on supplied assessment information only. Does not constitute formal certification or audit.',
      },
      {
        id: 'report_van_002',
        generatedAt: d(5),
        type: 'quantum',
        label: 'Quantum Readiness Assessment — Vantage SaaS Technologies',
        scoreSnapshot: { securityImplementationScore: 62, quantumReadinessScore: 48, overallReadinessScore: 57, riskBand: 'medium' },
        consultantNotes: 'RSA-2048 usage is the primary quantum concern. HNDL risk is moderate given 3–7 year retention. Client is aware and beginning planning — ahead of most peers in this sector.',
        disclaimer: 'Based on supplied assessment information only. Quantum timeline estimates are industry projections only.',
      },
    ],
    config: {},
  },
  activityLog: [
    { id: 'log_van_001', type: 'assessment_complete', message: 'Security assessment completed. Score: 62/100. Medium-risk band.', timestamp: d(7), meta: null },
    { id: 'log_van_002', type: 'quantum_complete', message: 'Quantum readiness assessment completed. Score: 48/100. Moderate HNDL exposure.', timestamp: d(7), meta: null },
    { id: 'log_van_003', type: 'report_generated', message: 'Executive Readiness Report generated.', timestamp: d(5), meta: null },
    { id: 'log_van_004', type: 'report_generated', message: 'Quantum Readiness Assessment Report generated.', timestamp: d(5), meta: null },
    { id: 'log_van_005', type: 'evidence_update', message: 'PQC Migration Roadmap (Draft) evidence item added.', timestamp: d(7), meta: null },
  ],
  clientMode: { isDemoMode: true, demoDataLoaded: true },
  branding: { productName: 'Quantum Compliance OS', tagline: 'Defensive Security & Quantum-Readiness Assessment', logoText: 'QC-OS', accentColour: '#00d4ff', logoUrl: null },
  settings: { theme: 'dark', demoMode: true, autosave: true, language: 'en-GB', dateFormat: 'DD/MM/YYYY' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT 3 — LOW RISK: Apex Managed Services Ltd
// Mature IT/MSP. Strong MFA, clear cert ownership, higher scores.
// ═══════════════════════════════════════════════════════════════════════════════

export const CLIENT_APEX = {
  id: 'demo_client_apex',
  name: 'Apex Managed Services Ltd',
  sector: 'Technology',
  contactRole: 'Chief Information Security Officer',
  tier: 'agency',
  lastActivity: d(4),
  archived: false,
  notes: 'Low-risk demo client. Mature MSP with strong security controls and active PQC migration planning.',
  riskBand: 'low',
};

export const STATE_APEX = {
  organisation: {
    id: 'org_apex_001',
    name: 'Apex Managed Services Ltd',
    sector: 'Technology',
    size: 'Medium (50–249 employees)',
    country: 'United Kingdom',
    contactName: 'Dr. James Whitfield',
    contactEmail: 'james.whitfield@apex-ms.example.com',
    complianceNeeds: ['ISO 27001', 'NCSC Cyber Essentials Plus', 'SOC 2 Type II', 'NIST CSF', 'NIS2'],
    dataSensitivityLevel: 'confidential',
    notes: 'Managed services provider delivering IT support, cloud management, and security monitoring to 35+ SME clients. ISO 27001 certified. Security-first culture. Active participant in NCSC Cyber Information Sharing Partnership (CiSP). Proactively engaging with NIST post-quantum guidance.',
    createdAt: d(90),
    updatedAt: d(4),
    isComplete: true,
  },
  systemProfiles: [
    {
      id: 'sys_apx_001',
      name: 'Client Management Platform (PSA)',
      type: 'Web Application',
      owner: 'CISO',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive', 'Authentication Credentials'],
      encryptionKnown: 'TLS 1.3 in transit. AES-256 at rest. Keys managed via Azure Key Vault. Certificates inventoried quarterly.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Single Sign-On (SSO)', 'Hardware Token'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated & Tested',
      notes: 'FIDO2 hardware tokens for all admin access. Conditional Access Policies enforced. Quarterly certificate review in place. PQC hybrid cert pilot planned for Q3.',
      archived: false, createdAt: d(90), updatedAt: d(4),
    },
    {
      id: 'sys_apx_002',
      name: 'Security Operations Platform (SIEM)',
      type: 'Monitoring System',
      owner: 'CISO',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Authentication Credentials', 'Commercially Sensitive'],
      encryptionKnown: 'TLS 1.3. Log data encrypted at rest. Key rotation automated.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Certificate-Based Auth', 'Hardware Token'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated & Tested',
      notes: 'Microsoft Sentinel. 24/7 monitoring. Alert rules tuned for client environments. Log retention 12 months. IR playbooks linked.',
      archived: false, createdAt: d(90), updatedAt: d(10),
    },
    {
      id: 'sys_apx_003',
      name: 'PKI & Certificate Management',
      type: 'Identity & Access Management',
      owner: 'CISO',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Encryption Keys / Secrets', 'Authentication Credentials'],
      encryptionKnown: 'Azure Key Vault HSM. ECDSA P-384 for internal CA. External certs: RSA-4096 (planned PQC migration Q3).',
      authMethods: ['Certificate-Based Auth', 'Hardware Token', 'Multi-Factor Authentication (MFA)'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated & Tested',
      notes: 'Certificate inventory maintained in Azure Key Vault. All certs tagged with expiry alerts. Preparing hybrid PQC cert pilot with DigiCert.',
      archived: false, createdAt: d(90), updatedAt: d(4),
    },
    {
      id: 'sys_apx_004',
      name: 'Endpoint Management (Intune/Defender)',
      type: 'Endpoint / Workstation',
      owner: 'CISO',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Authentication Credentials', 'Personal Data (PII)'],
      encryptionKnown: 'BitLocker enforced on all devices. TPM 2.0 required. Defender EDR deployed.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Passwordless', 'Single Sign-On (SSO)'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated & Tested',
      notes: 'All endpoints managed via Intune. Passwordless authentication rolled out to 90% of staff. Compliance policies enforced.',
      archived: false, createdAt: d(90), updatedAt: d(4),
    },
  ],
  assessmentState: {
    securityAssessment: {
      status: 'complete',
      lastUpdated: d(10),
      completedSections: ['mfa', 'password_policy', 'access_control', 'encryption_transit', 'encryption_rest', 'backups', 'logging_monitoring', 'incident_response', 'vulnerability_management', 'third_party', 'device_user_security', 'cloud_posture'],
      responses: {
        mfa_coverage: 'all_phishing_resistant', mfa_phishing_resistant: 'yes', mfa_all_systems: 'yes',
        password_policy: 'passwordless', password_manager: 'yes', encryption_transit: 'full_tls13',
        encryption_rest: 'full_hsm', encryption_key_mgmt: 'hsm',
        backup_frequency: 'continuous', backup_tested: 'yes', backup_offsite: 'yes',
        logging: 'full_siem', siem: 'yes', incident_plan: 'yes', ir_tested: 'yes',
        vuln_scan: 'continuous', patch_cycle: 'automated_24h', endpoint_protection: 'edr_xdr',
        supplier_review: 'quarterly', dpa_in_place: 'yes', cyber_insurance: 'yes',
        training: 'continuous', phishing_test: 'monthly',
      },
    },
    quantumReadiness: {
      status: 'complete',
      lastUpdated: d(10),
      completedSections: ['pke_exposure', 'cert_key_inventory', 'hndl_risk', 'crypto_agility', 'migration_planning'],
      responses: {
        rsa_use: 'yes_rsa4096', ecc_use: 'yes_p384', tls_version: 'tls13_full',
        cert_inventory: 'full', data_shelf_life: 'under_3_years',
        hndl_awareness: 'yes', pqc_awareness: 'yes',
        migration_plan: 'active', crypto_agility: 'yes', nist_pqc_review: 'yes',
      },
    },
  },
  riskModel: {
    riskEntries: [
      { id: 're_apx_001', ref: 'AMS-R-001', domain: 'Encryption & Key Management', domainType: 'quantum', inherentRisk: 'medium', likelihood: 2, impact: 3, controlGap: 'External-facing TLS certificates currently RSA-4096 — quantum-vulnerable despite larger key size. PQC hybrid migration planned Q3 but not yet active.', status: 'in_progress', owner: 'CISO', createdAt: d(10) },
      { id: 're_apx_002', ref: 'AMS-R-002', domain: 'Third-Party / Supply Chain', domainType: 'security', inherentRisk: 'medium', likelihood: 2, impact: 3, controlGap: 'Two supply chain vendors lack formal quantum-readiness assessments. Risk accepted pending 2025 vendor review cycle.', status: 'accepted', owner: 'CISO', createdAt: d(10) },
      { id: 're_apx_003', ref: 'AMS-R-003', domain: 'Client Quantum Exposure', domainType: 'quantum', inherentRisk: 'low', likelihood: 2, impact: 2, controlGap: 'Some managed client environments still operate TLS 1.2 and RSA-2048. Client quantum migration advisory service being launched Q2.', status: 'in_progress', owner: 'CISO', createdAt: d(10) },
    ],
    lastUpdated: d(10),
  },
  recommendationModel: {
    recommendations: [
      { id: 'rec_apx_001', priority: 'medium', domain: 'Quantum Readiness', title: 'Accelerate PQC hybrid certificate pilot to GA', detail: 'The Q3 hybrid cert pilot with DigiCert is well-planned. Consider accelerating to Q2 given NIST FIPS 203 publication. Document migration playbook for replication across client environments. This will differentiate Apex as a quantum-ready MSP.', effort: 'Medium', impact: 'High', status: 'in_progress', timeframe: 'Within 3 months', framework: 'NIST FIPS 203 / NCSC PQC Guidance' },
      { id: 'rec_apx_002', priority: 'low', domain: 'Third-Party Security', title: 'Add quantum-readiness to vendor assessment framework', detail: 'Include NIST post-quantum migration status and timeline in quarterly vendor assessments. Request NIST SP 800-208 alignment evidence from tier-1 technology vendors.', effort: 'Low', impact: 'Medium', status: 'open', timeframe: 'Next review cycle', framework: 'ISO 27001 A.15 / NIST SP 800-208' },
      { id: 'rec_apx_003', priority: 'low', domain: 'Client Services', title: 'Launch quantum readiness advisory service for MSP clients', detail: 'Package this quantum compliance assessment methodology as an advisory service for managed clients. Estimated 60–70% of SME clients will need quantum migration guidance within 3 years.', effort: 'Medium', impact: 'High', status: 'planned', timeframe: 'Q2 2026', framework: 'Commercial — NCSC Guidance Based' },
    ],
    priorityActions: [
      { id: 'pa_apx_001', title: 'Finalise PQC hybrid cert pilot scope', urgency: 'medium', assignedTo: 'CISO', dueDate: dateStr(-30) },
      { id: 'pa_apx_002', title: 'Add PQC questions to vendor assessment template', urgency: 'low', assignedTo: 'CISO', dueDate: dateStr(-60) },
    ],
    lastUpdated: d(10),
  },
  evidencePack: {
    status: 'ready',
    lastUpdated: d(4),
    items: [
      { id: 'ev_apx_001', controlName: 'MFA Policy & FIDO2 Configuration', evidenceType: 'configuration', status: 'complete', owner: 'CISO', notes: 'FIDO2 enforced for all admin access. Conditional Access Policy exports attached. MFA coverage: 100% of staff.', framework: 'ISO 27001 A.9 / NCSC CE Plus', domain: 'mfa', dateAdded: d(90), lastReviewed: d(10), updatedAt: d(10) },
      { id: 'ev_apx_002', controlName: 'TLS Configuration & Certificate Inventory', evidenceType: 'configuration', status: 'complete', owner: 'CISO', notes: 'Full certificate inventory maintained in Azure Key Vault. TLS 1.3 enforced. Quarterly review process documented. All certs tagged and expiry alerts active.', framework: 'ISO 27001 A.10 / NCSC TLS', domain: 'encryption_transit', dateAdded: d(90), lastReviewed: d(4), updatedAt: d(4) },
      { id: 'ev_apx_003', controlName: 'Encryption at Rest — HSM Evidence', evidenceType: 'configuration', status: 'complete', owner: 'CISO', notes: 'Azure Key Vault HSM configuration exported. All data at rest AES-256. Key rotation automated quarterly.', framework: 'ISO 27001 A.10', domain: 'encryption_rest', dateAdded: d(90), lastReviewed: d(10), updatedAt: d(10) },
      { id: 'ev_apx_004', controlName: 'Backup & Restore Test Records', evidenceType: 'audit_log', status: 'complete', owner: 'CISO', notes: 'Continuous backup. Monthly restore tests documented. Last test: RTO < 1 hour achieved. Offsite Azure geo-redundant storage confirmed.', framework: 'ISO 27001 A.12.3', domain: 'backups', dateAdded: d(90), lastReviewed: d(14), updatedAt: d(14) },
      { id: 'ev_apx_005', controlName: 'Incident Response Plan & Tabletop Records', evidenceType: 'policy', status: 'complete', owner: 'CISO', notes: 'IRP v3.1 current. Annual tabletop exercise completed. External IR retainer in place (CrowdStrike).', framework: 'ISO 27001 A.16', domain: 'incident_response', dateAdded: d(90), lastReviewed: d(30), updatedAt: d(30) },
      { id: 'ev_apx_006', controlName: 'Cryptographic Asset Inventory', evidenceType: 'audit_log', status: 'complete', owner: 'CISO', notes: 'Full crypto inventory. RSA-4096 external certs identified for PQC migration. ECDSA P-384 internal CA. Key Vault export attached.', framework: 'NIST SP 800-208', domain: 'pke_exposure', dateAdded: d(60), lastReviewed: d(4), updatedAt: d(4) },
      { id: 'ev_apx_007', controlName: 'PQC Migration Roadmap', evidenceType: 'policy', status: 'in_progress', owner: 'CISO', notes: 'Roadmap v1.0 approved. Phase 1 (cert migration) scoped for Q3. Client advisory service planned Q2. NIST FIPS 203 alignment documented.', framework: 'NIST SP 800-208 / NCSC PQC', domain: 'migration_planning', dateAdded: d(30), lastReviewed: d(4), updatedAt: d(4) },
      { id: 'ev_apx_008', controlName: 'Supplier Security Due Diligence', evidenceType: 'contract', status: 'complete', owner: 'CISO', notes: 'Quarterly vendor reviews completed. DPAs in place with all processors. 2 vendors pending PQC posture disclosure.', framework: 'ISO 27001 A.15', domain: 'third_party', dateAdded: d(90), lastReviewed: d(10), updatedAt: d(10) },
      { id: 'ev_apx_009', controlName: 'ISO 27001 Risk Assessment Register', evidenceType: 'audit_log', status: 'complete', owner: 'CISO', notes: 'Maintained. Annual review completed. 3 residual risks accepted with sign-off. Quantum risks added to register.', framework: 'ISO 27001 §6', domain: 'governance', dateAdded: d(90), lastReviewed: d(10), updatedAt: d(10) },
      { id: 'ev_apx_010', controlName: 'Data Shelf-Life & HNDL Assessment', evidenceType: 'policy', status: 'complete', owner: 'CISO', notes: 'Formal HNDL assessment completed. Data retention <3 years for most categories. Low residual HNDL risk documented and accepted.', framework: 'NIST IR 8413 / NCSC PQC', domain: 'hndl_risk', dateAdded: d(30), lastReviewed: d(4), updatedAt: d(4) },
    ],
  },
  reportModel: {
    status: 'ready',
    lastGenerated: d(4),
    sections: [],
    history: [
      {
        id: 'report_apx_001',
        generatedAt: d(4),
        type: 'executive',
        label: 'Executive Readiness Report — Apex Managed Services',
        scoreSnapshot: { securityImplementationScore: 88, quantumReadinessScore: 74, overallReadinessScore: 83, riskBand: 'low' },
        consultantNotes: 'Apex demonstrates a mature, well-documented security posture. ISO 27001 certified. PQC migration planning is ahead of sector peers. Residual risks are low and well-managed. Recommended for case study use.',
        disclaimer: 'Based on supplied assessment information only.',
      },
      {
        id: 'report_apx_002',
        generatedAt: d(4),
        type: 'quantum',
        label: 'Quantum Readiness Assessment — Apex Managed Services',
        scoreSnapshot: { securityImplementationScore: 88, quantumReadinessScore: 74, overallReadinessScore: 83, riskBand: 'low' },
        consultantNotes: 'Quantum readiness is strong. Full crypto inventory, active PQC migration planning, and crypto-agility architecture in place. RSA-4096 migration is the only material remaining gap.',
        disclaimer: 'Based on supplied assessment information only. Quantum timeline estimates are industry projections.',
      },
      {
        id: 'report_apx_003',
        generatedAt: d(30),
        type: 'evidence',
        label: 'Evidence Pack Snapshot — Apex Managed Services (Q1)',
        scoreSnapshot: { securityImplementationScore: 85, quantumReadinessScore: 68, overallReadinessScore: 78, riskBand: 'low' },
        consultantNotes: 'Evidence pack Q1 snapshot. 9 of 10 items complete or in progress. Presented to ISO 27001 internal audit.',
        disclaimer: 'Based on supplied assessment information only.',
      },
    ],
    config: {},
  },
  activityLog: [
    { id: 'log_apx_001', type: 'assessment_complete', message: 'Security assessment completed. Score: 88/100. Low-risk band.', timestamp: d(10), meta: null },
    { id: 'log_apx_002', type: 'quantum_complete', message: 'Quantum readiness completed. Score: 74/100. Low HNDL exposure.', timestamp: d(10), meta: null },
    { id: 'log_apx_003', type: 'report_generated', message: 'Executive Readiness Report generated.', timestamp: d(4), meta: null },
    { id: 'log_apx_004', type: 'report_generated', message: 'Quantum Readiness Assessment Report generated.', timestamp: d(4), meta: null },
    { id: 'log_apx_005', type: 'report_generated', message: 'Evidence Pack Snapshot generated (Q1).', timestamp: d(30), meta: null },
    { id: 'log_apx_006', type: 'evidence_update', message: 'PQC Migration Roadmap evidence marked in_progress.', timestamp: d(4), meta: null },
  ],
  clientMode: { isDemoMode: true, demoDataLoaded: true },
  branding: { productName: 'Quantum Compliance OS', tagline: 'Defensive Security & Quantum-Readiness Assessment', logoText: 'QC-OS', accentColour: '#00d4ff', logoUrl: null },
  settings: { theme: 'dark', demoMode: true, autosave: true, language: 'en-GB', dateFormat: 'DD/MM/YYYY' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT 4 — REGULATED DATA: Helix Health Analytics CIC
// Healthcare-adjacent. Long retention, high HNDL concern.
// ═══════════════════════════════════════════════════════════════════════════════

export const CLIENT_HELIX = {
  id: 'demo_client_helix',
  name: 'Helix Health Analytics CIC',
  sector: 'Healthcare',
  contactRole: 'Data Protection Officer',
  tier: 'pro_consultant',
  lastActivity: d(3),
  archived: false,
  notes: 'Regulated-data demo client. Health analytics CIC with NHS data sharing agreements. Very high HNDL concern.',
  riskBand: 'high',
};

export const STATE_HELIX = {
  organisation: {
    id: 'org_helix_001',
    name: 'Helix Health Analytics CIC',
    sector: 'Healthcare',
    size: 'Small (10–49 employees)',
    country: 'United Kingdom',
    contactName: 'Dr. Priya Nair',
    contactEmail: 'priya.nair@helix-health.example.com',
    complianceNeeds: ['UK GDPR', 'NHS DSP Toolkit', 'ISO 27001', 'NCSC Cyber Essentials Plus', 'NIS2'],
    dataSensitivityLevel: 'restricted',
    notes: 'Community Interest Company providing anonymised health outcome analytics to NHS trusts and commissioners. Processes pseudonymised patient-level data under NHS data sharing agreements. Data retention up to 20 years for longitudinal studies. Extremely high harvest-now-decrypt-later exposure. NHS DSP Toolkit submission due in 8 weeks.',
    createdAt: d(30),
    updatedAt: d(3),
    isComplete: true,
  },
  systemProfiles: [
    {
      id: 'sys_hlx_001',
      name: 'Analytics Platform (AWS)',
      type: 'Web Application',
      owner: 'Data Engineering Team',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Health Records', 'Personal Data (PII)', 'Special Category Data'],
      encryptionKnown: 'TLS 1.3 in transit. AES-256 at rest via AWS KMS. RSA-2048 data signing keys.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Single Sign-On (SSO)'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: 'Processes pseudonymised NHS data. AWS KMS encryption. RSA-2048 used for data signing — not yet assessed for quantum migration. NHS IG compliance review underway.',
      archived: false, createdAt: d(30), updatedAt: d(5),
    },
    {
      id: 'sys_hlx_002',
      name: 'Secure Data Transfer Portal',
      type: 'Web Application',
      owner: 'Data Engineering Team',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Health Records', 'Special Category Data', 'Authentication Credentials'],
      encryptionKnown: 'TLS 1.3. End-to-end encrypted file transfer. PGP signing of data packages.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Certificate-Based Auth'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: 'NHS trust data ingestion. PGP keys used for data package signing. PGP key management process informal — no expiry tracking.',
      archived: false, createdAt: d(30), updatedAt: d(10),
    },
    {
      id: 'sys_hlx_003',
      name: 'Longitudinal Research Database',
      type: 'Database',
      owner: 'Data Engineering Team',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Health Records', 'Special Category Data', 'Personal Data (PII)'],
      encryptionKnown: 'AWS RDS encrypted at rest. Pseudonymisation applied. Re-identification keys held separately.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'API Key'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: '20-year longitudinal dataset. Re-identification risk if decryption keys compromised. Extremely high HNDL exposure. Harvest-now attack on this dataset could enable patient re-identification in 5–10 years.',
      archived: false, createdAt: d(30), updatedAt: d(3),
    },
  ],
  assessmentState: {
    securityAssessment: {
      status: 'complete',
      lastUpdated: d(5),
      completedSections: ['mfa', 'password_policy', 'access_control', 'encryption_transit', 'encryption_rest', 'backups', 'logging_monitoring', 'incident_response', 'vulnerability_management', 'third_party', 'device_user_security', 'cloud_posture'],
      responses: {
        mfa_coverage: 'all_cloud', mfa_phishing_resistant: 'no', mfa_all_systems: 'partial',
        password_policy: 'strong', password_manager: 'yes', encryption_transit: 'full_tls13',
        encryption_rest: 'full_cloud', encryption_key_mgmt: 'cloud_managed',
        backup_frequency: 'daily', backup_tested: 'yes', backup_offsite: 'yes',
        logging: 'full_siem', siem: 'yes', incident_plan: 'yes', ir_tested: 'partial',
        vuln_scan: 'monthly', patch_cycle: 'monthly', endpoint_protection: 'edr',
        supplier_review: 'annual', dpa_in_place: 'yes', cyber_insurance: 'yes',
        training: 'annual', phishing_test: 'partial',
      },
    },
    quantumReadiness: {
      status: 'complete',
      lastUpdated: d(5),
      completedSections: ['pke_exposure', 'cert_key_inventory', 'hndl_risk', 'crypto_agility', 'migration_planning'],
      responses: {
        rsa_use: 'yes_rsa2048', ecc_use: 'unknown', tls_version: 'tls13_partial',
        cert_inventory: 'partial', data_shelf_life: 'over_20_years',
        hndl_awareness: 'yes', pqc_awareness: 'partial',
        migration_plan: 'no', crypto_agility: 'no', nist_pqc_review: 'no',
      },
    },
  },
  riskModel: {
    riskEntries: [
      { id: 're_hlx_001', ref: 'HHA-R-001', domain: 'Quantum Exposure (HNDL)', domainType: 'quantum', inherentRisk: 'critical', likelihood: 5, impact: 5, controlGap: 'Longitudinal health data retained 20+ years. RSA-2048 data signing keys could be broken by CRQC within data lifetime. Harvest-now attack on pseudonymised data could enable patient re-identification. No quantum migration plan exists.', status: 'open', owner: 'DPO', createdAt: d(5) },
      { id: 're_hlx_002', ref: 'HHA-R-002', domain: 'Encryption & Key Management', domainType: 'quantum', inherentRisk: 'critical', likelihood: 4, impact: 5, controlGap: 'RSA-2048 data signing keys — quantum-vulnerable. PGP signing keys have no expiry tracking or quantum migration plan. Re-identification keys stored without post-quantum protection.', status: 'open', owner: 'Data Engineering Team', createdAt: d(5) },
      { id: 're_hlx_003', ref: 'HHA-R-003', domain: 'Regulatory Compliance', domainType: 'security', inherentRisk: 'high', likelihood: 4, impact: 4, controlGap: 'NHS DSP Toolkit submission due in 8 weeks. Three mandatory evidence items currently incomplete. Non-submission risks data access suspension.', status: 'open', owner: 'DPO', createdAt: d(5) },
      { id: 're_hlx_004', ref: 'HHA-R-004', domain: 'Data Subject Rights', domainType: 'security', inherentRisk: 'high', likelihood: 3, impact: 4, controlGap: 'Re-identification risk if decryption keys ever compromised. Data subject right-to-erasure process not formally documented for all processing activities.', status: 'open', owner: 'DPO', createdAt: d(5) },
    ],
    lastUpdated: d(5),
  },
  recommendationModel: {
    recommendations: [
      { id: 'rec_hlx_001', priority: 'critical', domain: 'Quantum Readiness (HNDL)', title: 'Immediate HNDL risk assessment for longitudinal dataset', detail: 'Commission an immediate data shelf-life and HNDL risk assessment for the 20-year longitudinal dataset. Engage AWS and NCSC guidance on post-quantum encryption for health data. Develop an emergency PQC migration roadmap for re-identification keys and RSA-2048 signing infrastructure.', effort: 'High', impact: 'Critical', status: 'open', timeframe: 'Within 4 weeks', framework: 'NIST IR 8413 / NCSC PQC / NHS DSPT' },
      { id: 'rec_hlx_002', priority: 'critical', domain: 'Regulatory', title: 'Complete NHS DSP Toolkit submission (8-week deadline)', detail: 'Prioritise completion of three outstanding DSP Toolkit evidence items. Assign DPO as submission lead. Engage NHS Digital support line if required. Non-submission risks suspension of data sharing agreements affecting research continuity.', effort: 'Medium', impact: 'Critical', status: 'open', timeframe: 'Within 8 weeks', framework: 'NHS Data Security & Protection Toolkit' },
      { id: 'rec_hlx_003', priority: 'high', domain: 'Encryption & Key Management', title: 'Implement PQC signing key migration plan', detail: 'Replace RSA-2048 data signing keys with hybrid post-quantum alternatives (e.g. ML-DSA per NIST FIPS 204). Implement formal key lifecycle management with expiry tracking and quantum-safe re-keying procedures. Review AWS KMS post-quantum roadmap.', effort: 'High', impact: 'Critical', status: 'open', timeframe: 'Within 3 months', framework: 'NIST FIPS 204 / NIST SP 800-208' },
    ],
    priorityActions: [
      { id: 'pa_hlx_001', title: 'Commission HNDL risk assessment for longitudinal dataset', urgency: 'critical', assignedTo: 'DPO', dueDate: dateStr(-7) },
      { id: 'pa_hlx_002', title: 'Complete outstanding NHS DSP Toolkit evidence items', urgency: 'critical', assignedTo: 'DPO', dueDate: dateStr(-14) },
      { id: 'pa_hlx_003', title: 'Inventory all RSA-2048 and PGP signing keys', urgency: 'critical', assignedTo: 'Data Engineering Team', dueDate: dateStr(-7) },
    ],
    lastUpdated: d(5),
  },
  evidencePack: {
    status: 'in_progress',
    lastUpdated: d(3),
    items: [
      { id: 'ev_hlx_001', controlName: 'NHS DSP Toolkit — Data Security Standards Evidence', evidenceType: 'audit_log', status: 'in_progress', owner: 'DPO', notes: 'Submission due 8 weeks. 7 of 10 mandatory items complete. 3 outstanding: staff training records, IG training completion, and data flow mapping update.', framework: 'NHS DSPT', domain: 'regulatory', dateAdded: d(30), lastReviewed: d(3), updatedAt: d(3) },
      { id: 'ev_hlx_002', controlName: 'Data Shelf-Life & HNDL Risk Assessment', evidenceType: 'policy', status: 'missing', owner: 'DPO', notes: 'Not completed. Critical gap given 20-year data retention and RSA-2048 usage. Commission immediately.', framework: 'NIST IR 8413 / NCSC PQC', domain: 'hndl_risk', dateAdded: d(5), lastReviewed: null, updatedAt: d(5) },
      { id: 'ev_hlx_003', controlName: 'Cryptographic Asset Inventory (PGP & RSA Keys)', evidenceType: 'audit_log', status: 'planned', owner: 'Data Engineering Team', notes: 'PGP keys not inventoried. RSA-2048 signing keys identified but not formally documented. Inventory planned for next sprint.', framework: 'NIST SP 800-57 / SP 800-208', domain: 'pke_exposure', dateAdded: d(5), lastReviewed: null, updatedAt: d(5) },
      { id: 'ev_hlx_004', controlName: 'Data Processing Register (UK GDPR Article 30)', evidenceType: 'document', status: 'needs_review', owner: 'DPO', notes: 'Register exists but incomplete — longitudinal study processing activity needs updating with correct legal basis and retention schedule.', framework: 'UK GDPR Article 30', domain: 'data_protection', dateAdded: d(30), lastReviewed: d(90), updatedAt: d(5) },
      { id: 'ev_hlx_005', controlName: 'Encryption at Rest — AWS KMS Configuration', evidenceType: 'configuration', status: 'complete', owner: 'Data Engineering Team', notes: 'AWS KMS AES-256 encryption confirmed. Key policy export attached. Cross-region key replication enabled.', framework: 'ISO 27001 A.10 / NHS DSPT', domain: 'encryption_rest', dateAdded: d(30), lastReviewed: d(14), updatedAt: d(14) },
      { id: 'ev_hlx_006', controlName: 'Incident Response Plan (Health Data Breach)', evidenceType: 'policy', status: 'needs_review', owner: 'DPO', notes: 'IRP v1.1 exists but does not include NHS DSP Toolkit breach reporting procedures or ICO 72-hour notification workflow. Update required before DSP submission.', framework: 'ISO 27001 A.16 / NHS DSPT', domain: 'incident_response', dateAdded: d(90), lastReviewed: d(90), updatedAt: d(3) },
    ],
  },
  reportModel: {
    status: 'ready',
    lastGenerated: d(3),
    sections: [],
    history: [
      {
        id: 'report_hlx_001',
        generatedAt: d(3),
        type: 'executive',
        label: 'Executive Readiness Report — Helix Health Analytics',
        scoreSnapshot: { securityImplementationScore: 52, quantumReadinessScore: 18, overallReadinessScore: 38, riskBand: 'high' },
        consultantNotes: 'Critical HNDL exposure due to 20-year health data retention. NHS DSP Toolkit deadline in 8 weeks is the immediate priority. Quantum migration for signing keys must be treated as urgent given the data lifetime.',
        disclaimer: 'Based on supplied assessment information only. Does not constitute NHS DSP Toolkit certification.',
      },
      {
        id: 'report_hlx_002',
        generatedAt: d(3),
        type: 'quantum',
        label: 'Quantum Readiness Assessment — Helix Health Analytics',
        scoreSnapshot: { securityImplementationScore: 52, quantumReadinessScore: 18, overallReadinessScore: 38, riskBand: 'high' },
        consultantNotes: 'Quantum score: 18/100. The 20-year data shelf-life combined with RSA-2048 usage creates the most severe HNDL profile seen in this assessment portfolio. Immediate action required.',
        disclaimer: 'Based on supplied assessment information only. Quantum timeline estimates are NIST/NCSC projections.',
      },
    ],
    config: {},
  },
  activityLog: [
    { id: 'log_hlx_001', type: 'assessment_complete', message: 'Security assessment completed. Score: 52/100.', timestamp: d(5), meta: null },
    { id: 'log_hlx_002', type: 'quantum_complete', message: 'Quantum readiness completed. Score: 18/100. Critical HNDL exposure — 20-year data.', timestamp: d(5), meta: null },
    { id: 'log_hlx_003', type: 'report_generated', message: 'Executive Readiness Report generated.', timestamp: d(3), meta: null },
    { id: 'log_hlx_004', type: 'client_note', message: 'NHS DSP Toolkit deadline flagged — 8 weeks. DPO engaged.', timestamp: d(3), meta: null },
  ],
  clientMode: { isDemoMode: true, demoDataLoaded: true },
  branding: { productName: 'Quantum Compliance OS', tagline: 'Defensive Security & Quantum-Readiness Assessment', logoText: 'QC-OS', accentColour: '#00d4ff', logoUrl: null },
  settings: { theme: 'dark', demoMode: true, autosave: true, language: 'en-GB', dateFormat: 'DD/MM/YYYY' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT 5 — SHOWCASE: Clearline Business Services Ltd
// Balanced demo client designed for sales walkthroughs.
// Clean reports, evidence items, and action plan.
// ═══════════════════════════════════════════════════════════════════════════════

export const CLIENT_CLEARLINE = {
  id: 'demo_client_clearline',
  name: 'Clearline Business Services Ltd',
  sector: 'Professional Services',
  contactRole: 'IT Director',
  tier: 'pro_consultant',
  lastActivity: d(0),
  archived: false,
  notes: 'Showcase demo client — balanced risk profile, ideal for sales walkthroughs and investor demos.',
  riskBand: 'medium',
};

export const STATE_CLEARLINE = {
  organisation: {
    id: 'org_clearline_001',
    name: 'Clearline Business Services Ltd',
    sector: 'Professional Services',
    size: 'Medium (50–249 employees)',
    country: 'United Kingdom',
    contactName: 'Claire Watkins',
    contactEmail: 'claire.watkins@clearline-biz.example.com',
    complianceNeeds: ['ISO 27001', 'UK GDPR', 'NCSC Cyber Essentials Plus'],
    dataSensitivityLevel: 'confidential',
    notes: 'Mid-size business consultancy processing client commercially sensitive data and personal information. ISO 27001 certification in progress. Strong executive buy-in for security investment. Ideal showcase client demonstrating the full value of a structured readiness assessment.',
    createdAt: d(20),
    updatedAt: d(0),
    isComplete: true,
  },
  systemProfiles: [
    {
      id: 'sys_clr_001',
      name: 'Client Collaboration Portal',
      type: 'Web Application',
      owner: 'IT Director',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive'],
      encryptionKnown: 'TLS 1.3 in transit. SharePoint Online with Microsoft encryption at rest.',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Single Sign-On (SSO)'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated & Tested',
      notes: 'SharePoint-based client portal. MFA enforced. Conditional Access in place. Certificate inventory not yet reviewed for quantum exposure.',
      archived: false, createdAt: d(20), updatedAt: d(2),
    },
    {
      id: 'sys_clr_002',
      name: 'CRM Platform (Salesforce)',
      type: 'CRM System',
      owner: 'Sales Director',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive'],
      encryptionKnown: 'Salesforce Shield encryption enabled. TLS in transit.',
      authMethods: ['Single Sign-On (SSO)', 'Multi-Factor Authentication (MFA)'],
      cloudProvider: 'Not Applicable',
      backupStatus: 'Automated & Tested',
      notes: 'Salesforce with Shield encryption. SSO via Azure AD. Good baseline but no review of Salesforce post-quantum roadmap.',
      archived: false, createdAt: d(20), updatedAt: d(5),
    },
    {
      id: 'sys_clr_003',
      name: 'Finance & HR System (Cloud ERP)',
      type: 'ERP System',
      owner: 'Finance Director',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Financial Data', 'Personal Data (PII)', 'Special Category Data'],
      encryptionKnown: 'Vendor-managed encryption. TLS in transit confirmed. At-rest documentation requested.',
      authMethods: ['Single Sign-On (SSO)', 'Multi-Factor Authentication (MFA)'],
      cloudProvider: 'AWS',
      backupStatus: 'Automated & Tested',
      notes: 'Cloud ERP for finance, payroll, and HR. SSO enforced. Encryption at rest documentation pending from vendor.',
      archived: false, createdAt: d(20), updatedAt: d(5),
    },
  ],
  assessmentState: {
    securityAssessment: {
      status: 'complete',
      lastUpdated: d(7),
      completedSections: ['mfa', 'password_policy', 'access_control', 'encryption_transit', 'encryption_rest', 'backups', 'logging_monitoring', 'incident_response', 'vulnerability_management', 'third_party', 'device_user_security', 'cloud_posture'],
      responses: {
        mfa_coverage: 'all_cloud', mfa_phishing_resistant: 'partial', mfa_all_systems: 'yes',
        password_policy: 'strong', password_manager: 'yes', encryption_transit: 'full_tls13',
        encryption_rest: 'partial', encryption_key_mgmt: 'cloud_managed',
        backup_frequency: 'daily', backup_tested: 'yes', backup_offsite: 'yes',
        logging: 'partial_siem', siem: 'partial', incident_plan: 'yes', ir_tested: 'partial',
        vuln_scan: 'quarterly', patch_cycle: 'monthly', endpoint_protection: 'edr',
        supplier_review: 'annual', dpa_in_place: 'yes', cyber_insurance: 'yes',
        training: 'annual', phishing_test: 'yes',
      },
    },
    quantumReadiness: {
      status: 'complete',
      lastUpdated: d(7),
      completedSections: ['pke_exposure', 'cert_key_inventory', 'hndl_risk', 'crypto_agility', 'migration_planning'],
      responses: {
        rsa_use: 'yes_rsa2048', ecc_use: 'partial', tls_version: 'tls13_partial',
        cert_inventory: 'partial', data_shelf_life: '3_to_7_years',
        hndl_awareness: 'partial', pqc_awareness: 'partial',
        migration_plan: 'no', crypto_agility: 'no', nist_pqc_review: 'no',
      },
    },
  },
  riskModel: {
    riskEntries: [
      { id: 're_clr_001', ref: 'CBS-R-001', domain: 'Encryption & Key Management', domainType: 'quantum', inherentRisk: 'high', likelihood: 3, impact: 4, controlGap: 'RSA-2048 certificates in use across client portal and ERP system. Certificate inventory incomplete. No post-quantum migration plan in place.', status: 'open', owner: 'IT Director', createdAt: d(7) },
      { id: 're_clr_002', ref: 'CBS-R-002', domain: 'Quantum Readiness (HNDL)', domainType: 'quantum', inherentRisk: 'medium', likelihood: 3, impact: 3, controlGap: 'Client engagement data retained 5–7 years. HNDL risk acknowledged but not formally assessed. No PQC migration roadmap.', status: 'open', owner: 'IT Director', createdAt: d(7) },
      { id: 're_clr_003', ref: 'CBS-R-003', domain: 'Logging & Monitoring', domainType: 'security', inherentRisk: 'medium', likelihood: 3, impact: 3, controlGap: 'Partial SIEM coverage. Microsoft Sentinel in evaluation. Gaps in logging for SaaS applications.', status: 'in_progress', owner: 'IT Director', createdAt: d(7) },
      { id: 're_clr_004', ref: 'CBS-R-004', domain: 'Incident Response', domainType: 'security', inherentRisk: 'medium', likelihood: 3, impact: 3, controlGap: 'IRP documented but not tested in 18 months. No external IR retainer. Tabletop exercise overdue.', status: 'open', owner: 'IT Director', createdAt: d(7) },
    ],
    lastUpdated: d(7),
  },
  recommendationModel: {
    recommendations: [
      { id: 'rec_clr_001', priority: 'high', domain: 'Encryption & Key Management', title: 'Complete certificate inventory and initiate PQC migration planning', detail: 'Conduct a full certificate inventory across the client portal, CRM, and ERP systems. Identify all RSA-2048 usage. Develop a post-quantum migration roadmap aligned to NIST FIPS 203 and engage Microsoft/Salesforce/ERP vendor for their PQC transition timelines. Adopt crypto-agile design principles for new integrations.', effort: 'Medium', impact: 'High', status: 'open', timeframe: 'Within 3 months', framework: 'NIST SP 800-208 / NCSC PQC Guidance' },
      { id: 'rec_clr_002', priority: 'medium', domain: 'Logging & Monitoring', title: 'Complete Microsoft Sentinel SIEM deployment', detail: 'Complete the Sentinel evaluation and deploy to cover all Microsoft 365, Azure, and SaaS application log sources. Define alert rules for anomalous access, privilege escalation, and data exfiltration patterns. Set log retention to minimum 12 months.', effort: 'Medium', impact: 'Medium', status: 'in_progress', timeframe: 'Within 6 weeks', framework: 'ISO 27001 A.12.4 / NIST CSF DE.CM' },
      { id: 'rec_clr_003', priority: 'medium', domain: 'Incident Response', title: 'Conduct tabletop exercise and update IRP', detail: 'Schedule an IRP tabletop exercise simulating a ransomware incident and data breach notification scenario. Update the IRP based on lessons learned. Consider an external IR retainer given data sensitivity.', effort: 'Low', impact: 'Medium', status: 'open', timeframe: 'Within 6 weeks', framework: 'ISO 27001 A.16 / NIST CSF RS' },
      { id: 'rec_clr_004', priority: 'medium', domain: 'Quantum Readiness', title: 'Formalise HNDL risk assessment and PQC awareness', detail: 'Engage the board on harvest-now-decrypt-later risk for client engagement data retained 5–7 years. Document a formal HNDL risk assessment. Share this report with key SaaS vendors and request their post-quantum migration timelines.', effort: 'Low', impact: 'Medium', status: 'open', timeframe: 'Within 2 months', framework: 'NIST IR 8413 / NCSC PQC Guidance' },
    ],
    priorityActions: [
      { id: 'pa_clr_001', title: 'Complete certificate inventory (portal + CRM + ERP)', urgency: 'high', assignedTo: 'IT Director', dueDate: dateStr(-21) },
      { id: 'pa_clr_002', title: 'Deploy Microsoft Sentinel to all log sources', urgency: 'medium', assignedTo: 'IT Director', dueDate: dateStr(-42) },
      { id: 'pa_clr_003', title: 'Schedule IRP tabletop exercise', urgency: 'medium', assignedTo: 'IT Director', dueDate: dateStr(-14) },
      { id: 'pa_clr_004', title: 'Present HNDL risk briefing to board', urgency: 'medium', assignedTo: 'IT Director', dueDate: dateStr(-28) },
    ],
    lastUpdated: d(7),
  },
  evidencePack: {
    status: 'in_progress',
    lastUpdated: d(5),
    items: [
      { id: 'ev_clr_001', controlName: 'MFA Policy & Configuration Export', evidenceType: 'configuration', status: 'complete', owner: 'IT Director', notes: 'MFA enforced via Azure AD Conditional Access for all staff. Configuration export attached. Phishing-resistant MFA rollout in progress.', framework: 'ISO 27001 A.9 / NCSC CE Plus', domain: 'mfa', dateAdded: d(20), lastReviewed: d(7), updatedAt: d(7) },
      { id: 'ev_clr_002', controlName: 'TLS Configuration & Certificate Records', evidenceType: 'configuration', status: 'in_progress', owner: 'IT Director', notes: 'TLS 1.3 confirmed on client portal. Certificate inventory in progress — 2 of 6 systems documented.', framework: 'ISO 27001 A.10', domain: 'encryption_transit', dateAdded: d(20), lastReviewed: d(7), updatedAt: d(7) },
      { id: 'ev_clr_003', controlName: 'Backup & Restore Test Records', evidenceType: 'audit_log', status: 'complete', owner: 'IT Director', notes: 'Automated daily backups. Last restore test: successful, RTO 2 hours. Offsite replication to Azure geo-redundant storage confirmed.', framework: 'ISO 27001 A.12.3', domain: 'backups', dateAdded: d(20), lastReviewed: d(14), updatedAt: d(14) },
      { id: 'ev_clr_004', controlName: 'Incident Response Plan', evidenceType: 'policy', status: 'needs_review', owner: 'IT Director', notes: 'IRP v2.0 documented. Tabletop exercise overdue (18 months). Update and test required.', framework: 'ISO 27001 A.16', domain: 'incident_response', dateAdded: d(90), lastReviewed: d(90), updatedAt: d(7) },
      { id: 'ev_clr_005', controlName: 'Vulnerability Scan Reports', evidenceType: 'audit_log', status: 'in_progress', owner: 'IT Director', notes: 'Quarterly scans scheduled. Last scan: 2 medium findings remediated. Next scan due in 3 weeks.', framework: 'ISO 27001 A.12.6 / CIS Control 7', domain: 'vulnerability_management', dateAdded: d(20), lastReviewed: d(30), updatedAt: d(7) },
      { id: 'ev_clr_006', controlName: 'Cryptographic Asset Inventory', evidenceType: 'audit_log', status: 'planned', owner: 'IT Director', notes: 'Not yet started. Planned for next quarter as part of ISO 27001 preparation.', framework: 'NIST SP 800-208', domain: 'pke_exposure', dateAdded: d(7), lastReviewed: null, updatedAt: d(7) },
      { id: 'ev_clr_007', controlName: 'Data Shelf-Life & HNDL Risk Note', evidenceType: 'policy', status: 'planned', owner: 'IT Director', notes: 'To be completed following board HNDL briefing. Planned within 2 months.', framework: 'NIST IR 8413 / NCSC PQC', domain: 'hndl_risk', dateAdded: d(7), lastReviewed: null, updatedAt: d(7) },
      { id: 'ev_clr_008', controlName: 'UK GDPR Article 30 Processing Register', evidenceType: 'document', status: 'complete', owner: 'IT Director', notes: 'Register maintained and current. Reviewed by external DPO last month. All processing activities documented.', framework: 'UK GDPR Article 30', domain: 'data_protection', dateAdded: d(90), lastReviewed: d(30), updatedAt: d(30) },
      { id: 'ev_clr_009', controlName: 'Supplier Security Due Diligence', evidenceType: 'contract', status: 'in_progress', owner: 'IT Director', notes: 'Annual review in progress. Microsoft, Salesforce, and ERP vendor assessed. PQC posture questions being added to framework.', framework: 'ISO 27001 A.15', domain: 'third_party', dateAdded: d(20), lastReviewed: d(7), updatedAt: d(7) },
      { id: 'ev_clr_010', controlName: 'Security Awareness Training Records', evidenceType: 'training_record', status: 'complete', owner: 'IT Director', notes: 'Annual training completed by 100% staff. Phishing simulation conducted quarterly — click rate reduced from 18% to 4% over 12 months.', framework: 'ISO 27001 A.7', domain: 'training', dateAdded: d(20), lastReviewed: d(14), updatedAt: d(14) },
    ],
  },
  reportModel: {
    status: 'ready',
    lastGenerated: d(1),
    sections: [],
    history: [
      {
        id: 'report_clr_001',
        generatedAt: d(1),
        type: 'executive',
        label: 'Executive Readiness Report — Clearline Business Services',
        scoreSnapshot: { securityImplementationScore: 67, quantumReadinessScore: 42, overallReadinessScore: 58, riskBand: 'medium' },
        consultantNotes: 'Clearline demonstrates strong security foundations with clear executive commitment. Key gaps are certificate inventory completion, SIEM deployment, and post-quantum migration planning. Well-positioned to achieve Cyber Essentials Plus and progress ISO 27001 within 12 months.',
        disclaimer: 'Based on supplied assessment information only. Does not constitute ISO 27001 certification.',
      },
      {
        id: 'report_clr_002',
        generatedAt: d(1),
        type: 'quantum',
        label: 'Quantum Readiness Assessment — Clearline Business Services',
        scoreSnapshot: { securityImplementationScore: 67, quantumReadinessScore: 42, overallReadinessScore: 58, riskBand: 'medium' },
        consultantNotes: 'RSA-2048 usage confirmed but scope not fully inventoried. 5–7 year data retention creates moderate HNDL exposure. Recommend initiating migration planning now to stay ahead of regulatory pressure.',
        disclaimer: 'Based on supplied assessment information only. Quantum timeline estimates are NIST/NCSC projections.',
      },
      {
        id: 'report_clr_003',
        generatedAt: d(7),
        type: 'evidence',
        label: 'Evidence Pack Review — Clearline Business Services (Interim)',
        scoreSnapshot: { securityImplementationScore: 65, quantumReadinessScore: 38, overallReadinessScore: 54, riskBand: 'medium' },
        consultantNotes: 'Interim evidence pack review prior to ISO 27001 gap analysis. Good baseline on MFA, backup, and training. Certificate inventory and HNDL assessment are the key remaining gaps.',
        disclaimer: 'Based on supplied assessment information only.',
      },
    ],
    config: {},
  },
  activityLog: [
    { id: 'log_clr_001', type: 'org_complete', message: 'Organisation profile completed.', timestamp: d(20), meta: null },
    { id: 'log_clr_002', type: 'assessment_complete', message: 'Security assessment completed. Score: 67/100. Medium-risk band.', timestamp: d(7), meta: null },
    { id: 'log_clr_003', type: 'quantum_complete', message: 'Quantum readiness completed. Score: 42/100. Moderate HNDL exposure.', timestamp: d(7), meta: null },
    { id: 'log_clr_004', type: 'report_generated', message: 'Executive Readiness Report generated.', timestamp: d(1), meta: null },
    { id: 'log_clr_005', type: 'report_generated', message: 'Quantum Readiness Assessment generated.', timestamp: d(1), meta: null },
    { id: 'log_clr_006', type: 'report_generated', message: 'Evidence Pack Interim Review generated.', timestamp: d(7), meta: null },
    { id: 'log_clr_007', type: 'client_note', message: 'Board HNDL briefing scheduled. ISO 27001 gap analysis booked for next month.', timestamp: d(0), meta: null },
  ],
  clientMode: { isDemoMode: true, demoDataLoaded: true },
  branding: { productName: 'Quantum Compliance OS', tagline: 'Defensive Security & Quantum-Readiness Assessment', logoText: 'QC-OS', accentColour: '#00d4ff', logoUrl: null },
  settings: { theme: 'dark', demoMode: true, autosave: true, language: 'en-GB', dateFormat: 'DD/MM/YYYY' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO EXPORT — used by loadDemoPortfolio() in storage.js
// ═══════════════════════════════════════════════════════════════════════════════

export const DEMO_CLIENTS = [
  CLIENT_MERIDIAN,
  CLIENT_VANTAGE,
  CLIENT_APEX,
  CLIENT_HELIX,
  CLIENT_CLEARLINE,
];

export const DEMO_CLIENT_STATES = {
  [CLIENT_MERIDIAN.id]: STATE_MERIDIAN,
  [CLIENT_VANTAGE.id]:  STATE_VANTAGE,
  [CLIENT_APEX.id]:     STATE_APEX,
  [CLIENT_HELIX.id]:    STATE_HELIX,
  [CLIENT_CLEARLINE.id]: STATE_CLEARLINE,
};

/**
 * computeDemoMetrics — derive portfolio-level analytics from the demo portfolio.
 * Used by ConsultantDashboard when in demo mode.
 */
export function computeDemoMetrics() {
  const states = Object.values(DEMO_CLIENT_STATES);

  const securityScores = states.map((s) =>
    s.assessmentState?.securityAssessment?.status === 'complete'
      ? s.reportModel?.history?.[0]?.scoreSnapshot?.securityImplementationScore ?? 0 : 0
  );
  const qScores = states.map((s) =>
    s.assessmentState?.quantumReadiness?.status === 'complete'
      ? s.reportModel?.history?.[0]?.scoreSnapshot?.quantumReadinessScore ?? 0 : 0
  );
  const overallScores = states.map((s) =>
    s.reportModel?.history?.[0]?.scoreSnapshot?.overallReadinessScore ?? 0
  );

  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const highRisk    = DEMO_CLIENTS.filter((c) => c.riskBand === 'high').length;
  const mediumRisk  = DEMO_CLIENTS.filter((c) => c.riskBand === 'medium').length;
  const lowRisk     = DEMO_CLIENTS.filter((c) => c.riskBand === 'low').length;
  const reportsGenerated = states.reduce((n, s) => n + (s.reportModel?.history?.length || 0), 0);
  const evidenceComplete = states.reduce((n, s) => n + (s.evidencePack?.items || []).filter((i) => i.status === 'complete').length, 0);
  const urgentActions    = states.reduce((n, s) => n + (s.recommendationModel?.priorityActions || []).filter((a) => a.urgency === 'critical').length, 0);

  return {
    totalClients:         DEMO_CLIENTS.length,
    highRisk,
    mediumRisk,
    lowRisk,
    avgSecurityScore:     avg(securityScores),
    avgQuantumScore:      avg(qScores),
    avgOverallScore:      avg(overallScores),
    reportsGenerated,
    evidenceComplete,
    urgentActions,
    clientsNeedingReview: states.filter((s) => (s.reportModel?.history?.[0]?.scoreSnapshot?.overallReadinessScore ?? 100) < 50).length,
    revenuePlaceholder: '£45,000 – £85,000', // Placeholder only — no billing connected
  };
}
