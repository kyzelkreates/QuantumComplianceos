/**
 * QUANTUM COMPLIANCE OS™ — constants.js
 * Application-wide constants. Immutable reference values.
 */

// ─── App Identity ─────────────────────────────────────────────────────────────
export const APP_NAME = 'Quantum Compliance OS';
export const APP_VERSION = '12.0.0';
export const APP_RUN_LEVEL = 12;
export const APP_TAGLINE = 'Defensive Quantum-Readiness & Security Implementation Assessment';

// ─── Defensive Disclaimer ─────────────────────────────────────────────────────
export const DEFENSIVE_DISCLAIMER =
  'This platform is for defensive security readiness, compliance preparation, and post-quantum migration planning only. It does not perform offensive testing, unauthorised scanning, exploitation, or guarantee compliance. All assessments should be reviewed by qualified security professionals before operational decisions are made.';

// ─── Navigation Pages ─────────────────────────────────────────────────────────
export const PAGES = {
  CLIENT_HUB: 'client-hub',
  CONSULTANT: 'consultant',
  TARGET_ASSESSMENTS: 'target-assessments',
  DASHBOARD: 'dashboard',
  ORGANISATION: 'organisation',
  SYSTEM_INVENTORY: 'system-inventory',
  SECURITY_ASSESSMENT: 'security-assessment',
  QUANTUM_READINESS: 'quantum-readiness',
  RECOMMENDATIONS: 'recommendations',
  REPORTS: 'reports',
  EVIDENCE_PACK: 'evidence-pack',
  DEPLOYMENT: 'deployment-readiness',
  COPILOT: 'consultant-copilot',
  SETTINGS: 'settings',
  ABOUT: 'about',
};

export const NAV_ITEMS = [
  {
    id: PAGES.DASHBOARD,
    label: 'Dashboard',
    icon: '⬡',
    group: 'main',
    description: 'Overview and setup checklist',
  },
  {
    id: PAGES.ORGANISATION,
    label: 'Organisation Profile',
    icon: '🏢',
    group: 'main',
    description: 'Organisation details and compliance needs',
  },
  {
    id: PAGES.SYSTEM_INVENTORY,
    label: 'System Inventory',
    icon: '🗄️',
    group: 'main',
    description: 'Critical systems and infrastructure',
  },
  {
    id: PAGES.SECURITY_ASSESSMENT,
    label: 'Security Assessment',
    icon: '🛡️',
    group: 'assessments',
    description: 'Security implementation assessment',
  },
  {
    id: PAGES.QUANTUM_READINESS,
    label: 'Quantum Readiness',
    icon: '⚛️',
    group: 'assessments',
    description: 'Post-quantum exposure and readiness',
  },
  {
    id: PAGES.TARGET_ASSESSMENTS,
    label: 'Target Assessments',
    icon: '🎯',
    group: 'assessments',
    description: 'Passive, authorised assessment of websites, web apps, and APIs',
  },
  {
    id: PAGES.RECOMMENDATIONS,
    label: 'Recommendations',
    icon: '💡',
    group: 'outputs',
    description: 'Prioritised defensive recommendations',
  },
  {
    id: PAGES.REPORTS,
    label: 'Reports',
    icon: '📋',
    group: 'outputs',
    description: 'Assessment reports and export',
  },
  {
    id: PAGES.EVIDENCE_PACK,
    label: 'Evidence Pack',
    icon: '📁',
    group: 'outputs',
    description: 'Compliance evidence preparation',
  },
  {
    id: PAGES.CLIENT_HUB,
    label: 'Client Hub',
    icon: '🏢',
    group: 'consultant',
    description: 'Multi-Client Consultant Hub — manage client records, risk, scores, evidence',
  },
  {
    id: PAGES.CONSULTANT,
    label: 'Consultant Hub',
    icon: '👥',
    group: 'system',
    description: 'Multi-client management, tiers, and deployment checklist',
  },
  {
    id: PAGES.SETTINGS,
    label: 'Settings',
    icon: '⚙️',
    group: 'system',
    description: 'App configuration and branding',
  },
  {
    id: PAGES.ABOUT,
    label: 'About',
    icon: 'ℹ️',
    group: 'system',
    description: 'Platform information and disclaimer',
  },
  {
    id: PAGES.COPILOT,
    label: 'Copilot',
    icon: '🤖',
    group: 'outputs',
    description: 'AI-style Consultant Copilot — local deterministic recommendation engine',
  },
  {
    id: PAGES.DEPLOYMENT,
    label: 'Deploy & Demo',
    icon: '🚀',
    group: 'system',
    description: 'Deployment readiness checklist and demo launch guide',
  },
];

// ─── Organisation Options ─────────────────────────────────────────────────────
export const SECTORS = [
  'Professional Services',
  'Financial Services',
  'Healthcare',
  'Legal',
  'Government / Public Sector',
  'Education',
  'Retail & E-Commerce',
  'Technology',
  'Manufacturing',
  'Energy & Utilities',
  'Transport & Logistics',
  'Media & Communications',
  'Charity / Non-Profit',
  'Other',
];

export const ORG_SIZES = [
  'Micro (1–9 employees)',
  'Small (10–49 employees)',
  'Medium (50–249 employees)',
  'Large (250–999 employees)',
  'Enterprise (1000+ employees)',
];

export const DATA_SENSITIVITY_LEVELS = [
  { value: 'public', label: 'Public', description: 'No sensitive data processed' },
  { value: 'internal', label: 'Internal', description: 'Internal business data only' },
  { value: 'confidential', label: 'Confidential', description: 'Commercially sensitive data' },
  { value: 'restricted', label: 'Restricted', description: 'Highly sensitive or regulated data' },
  { value: 'critical', label: 'Critical', description: 'Critical national infrastructure or top-secret' },
];

export const COMPLIANCE_FRAMEWORKS = [
  'ISO 27001',
  'SOC 2 Type II',
  'GDPR',
  'UK GDPR',
  'PCI DSS',
  'HIPAA',
  'NIST CSF',
  'NIST SP 800-208',
  'NCSC Cyber Essentials',
  'NCSC Cyber Essentials Plus',
  'DORA',
  'NIS2',
  'CIS Controls',
  'FCA / PRA Requirements',
  'Other',
];

// ─── System Inventory Options ─────────────────────────────────────────────────
export const SYSTEM_TYPES = [
  'Web Application',
  'Mobile Application',
  'API / Microservice',
  'Database',
  'Identity & Access Management',
  'Email Platform',
  'Cloud Infrastructure',
  'On-Premise Server',
  'Network Device',
  'Endpoint / Workstation',
  'Storage System',
  'Backup System',
  'Third-Party SaaS',
  'ERP System',
  'CRM System',
  'Payment System',
  'CI/CD Pipeline',
  'Monitoring System',
  'Other',
];

export const ENVIRONMENTS = [
  'Production',
  'Staging',
  'Development',
  'DR / Failover',
  'Hybrid',
];

export const CRITICALITY_LEVELS = [
  { value: 'critical', label: 'Critical', colour: '#ff4444' },
  { value: 'high', label: 'High', colour: '#ff8800' },
  { value: 'medium', label: 'Medium', colour: '#ffcc00' },
  { value: 'low', label: 'Low', colour: '#00cc88' },
  { value: 'informational', label: 'Informational', colour: '#6699cc' },
];

export const DATA_TYPES = [
  'Personal Data (PII)',
  'Special Category Data',
  'Financial Data',
  'Health Records',
  'Authentication Credentials',
  'Encryption Keys / Secrets',
  'Intellectual Property',
  'Commercially Sensitive',
  'Government / Classified',
  'Publicly Available',
  'None / Not Applicable',
];

export const AUTH_METHODS = [
  'Username & Password',
  'Multi-Factor Authentication (MFA)',
  'Single Sign-On (SSO)',
  'Certificate-Based Auth',
  'API Key',
  'OAuth 2.0',
  'SAML 2.0',
  'Biometric',
  'Hardware Token',
  'Passwordless',
  'No Authentication',
  'Unknown',
];

export const CLOUD_PROVIDERS = [
  'AWS',
  'Microsoft Azure',
  'Google Cloud Platform',
  'Oracle Cloud',
  'IBM Cloud',
  'Hetzner',
  'DigitalOcean',
  'On-Premise Only',
  'Hybrid',
  'Not Applicable',
  'Unknown',
];

export const BACKUP_STATUSES = [
  'Automated & Tested',
  'Automated (Untested)',
  'Manual',
  'Partial Coverage',
  'No Backup',
  'Unknown',
];

// ─── Status Values ─────────────────────────────────────────────────────────────
export const ASSESSMENT_STATUSES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  REQUIRES_REVIEW: 'requires_review',
};

export const STATUS_LABELS = {
  not_started: 'Not Started',
  draft: 'Draft',
  awaiting_authorisation: 'Awaiting Authorisation',
  ready_for_review: 'Ready for Review',
  in_review: 'In Review',
  recommendations_generated: 'Recommendations Generated',
  evidence_required: 'Evidence Required',
  report_ready: 'Report Ready',
  closed: 'Closed',
  accepted_risk: 'Accepted Risk',
  in_progress: 'In Progress',
  complete: 'Complete',
  requires_review: 'Requires Review',
  not_ready: 'Not Ready',
  ready: 'Ready',
  archived: 'Archived',
  active: 'Active',
};

export const STATUS_COLOURS = {
  not_started: '#6b7280',
  in_progress: '#f59e0b',
  complete: '#10b981',
  requires_review: '#f97316',
  not_ready: '#6b7280',
  ready: '#10b981',
  archived: '#374151',
  active: '#10b981',
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#10b981',
  informational: '#3b82f6',
};

// ─── Setup Checklist ──────────────────────────────────────────────────────────
export const SETUP_CHECKLIST = [
  {
    id: 'complete_org',
    label: 'Complete organisation profile',
    description: 'Add your organisation name, sector, country, and data sensitivity level',
    page: PAGES.ORGANISATION,
    check: (state) => state.organisation?.isComplete === true,
  },
  {
    id: 'add_systems',
    label: 'Add critical systems',
    description: 'Register at least one system in the inventory',
    page: PAGES.SYSTEM_INVENTORY,
    check: (state) => (state.systemProfiles || []).filter((s) => !s.archived).length > 0,
  },
  {
    id: 'confirm_sensitivity',
    label: 'Confirm data sensitivity',
    description: 'Set the data sensitivity level for your organisation',
    page: PAGES.ORGANISATION,
    check: (state) => !!state.organisation?.dataSensitivityLevel,
  },
  {
    id: 'security_assessment',
    label: 'Prepare security assessment',
    description: 'Complete the security implementation assessment (available in Run 2)',
    page: PAGES.SECURITY_ASSESSMENT,
    check: (state) => state.assessmentState?.securityAssessment?.status === 'complete',
  },
  {
    id: 'quantum_readiness',
    label: 'Prepare quantum-readiness assessment',
    description: 'Complete the quantum readiness review (available in Run 2)',
    page: PAGES.QUANTUM_READINESS,
    check: (state) => state.assessmentState?.quantumReadiness?.status === 'complete',
  },
  {
    id: 'evidence_pack',
    label: 'Review evidence pack structure',
    description: 'Prepare your compliance evidence pack (available in Run 4)',
    page: PAGES.EVIDENCE_PACK,
    check: (state) => (state.evidencePack?.items || []).length > 0,
  },
  {
    id: 'report_branding',
    label: 'Configure report branding',
    description: 'Customise the product name, tagline, and accent colour',
    page: PAGES.SETTINGS,
    check: (state) => !!(state.branding?.productName && state.branding?.accentColour),
  },
];
