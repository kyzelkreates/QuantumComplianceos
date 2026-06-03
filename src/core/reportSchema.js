/**
 * QUANTUM COMPLIANCE OS™ — reportSchema.js
 * Report section definitions. Used in Run 4 for full report generation.
 * Defensive assessment reports only.
 */

export const REPORT_SECTIONS = [
  {
    id: 'executive_summary',
    order: 1,
    title: 'Executive Summary',
    description:
      'High-level overview of organisational security readiness, quantum exposure risk, and priority action areas for senior leadership.',
    futureRun: 4,
    requiredData: ['organisation', 'assessmentState', 'riskModel'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'organisation_profile',
    order: 2,
    title: 'Organisation Profile',
    description:
      'Summary of the assessed organisation including sector, size, compliance obligations, and data sensitivity classification.',
    futureRun: 1,
    requiredData: ['organisation'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'system_inventory',
    order: 3,
    title: 'System Inventory',
    description:
      'Inventory of critical systems, their environments, data types processed, authentication methods, encryption posture, and backup status.',
    futureRun: 1,
    requiredData: ['systemProfiles'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'security_assessment',
    order: 4,
    title: 'Security Implementation Assessment',
    description:
      'Detailed findings across all defensive security assessment domains including identity, encryption, backup, cloud posture, logging, and incident response.',
    futureRun: 2,
    requiredData: ['assessmentState.securityAssessment', 'riskModel'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'quantum_readiness',
    order: 5,
    title: 'Quantum Readiness Assessment',
    description:
      'Assessment of post-quantum cryptography exposure, harvest-now-decrypt-later risk, crypto-agility posture, and migration planning readiness.',
    futureRun: 2,
    requiredData: ['assessmentState.quantumReadiness', 'riskModel'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'preventative_measures',
    order: 6,
    title: 'Preventative Measures',
    description:
      'Defensive controls already in place, their effectiveness assessment, and gaps identified during the assessment process.',
    futureRun: 3,
    requiredData: ['assessmentState', 'riskModel'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'risk_register',
    order: 7,
    title: 'Risk Register',
    description:
      'Consolidated register of identified defensive readiness risks, categorised by domain, severity, likelihood, and recommended mitigation approach.',
    futureRun: 3,
    requiredData: ['riskModel'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'priority_action_plan',
    order: 8,
    title: 'Priority Action Plan',
    description:
      'Ranked list of recommended defensive actions, migration steps, and readiness improvements with estimated effort and priority indicators.',
    futureRun: 3,
    requiredData: ['recommendationModel'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'nist_ncsc_alignment',
    order: 9,
    title: 'NIST / NCSC Alignment Notes',
    description:
      'Mapping of assessment findings to NIST Cybersecurity Framework, NIST SP 800-208, NIST PQC standards (FIPS 203/204/205), and NCSC guidance documents.',
    futureRun: 4,
    requiredData: ['assessmentState', 'riskModel'],
    defensiveOnly: true,
    includeByDefault: true,
  },
  {
    id: 'evidence_pack',
    order: 10,
    title: 'Evidence Pack',
    description:
      'Summary of compliance evidence items prepared, document references, and evidence gap analysis for applicable frameworks.',
    futureRun: 4,
    requiredData: ['evidencePack'],
    defensiveOnly: true,
    includeByDefault: false,
  },
  {
    id: 'technical_remediation',
    order: 11,
    title: 'Technical Remediation Checklist',
    description:
      'Granular technical checklist of remediation tasks, configuration changes, and migration steps for technical teams implementing defensive recommendations.',
    futureRun: 3,
    requiredData: ['recommendationModel'],
    defensiveOnly: true,
    includeByDefault: false,
  },
  {
    id: 'disclaimer',
    order: 12,
    title: 'Disclaimer',
    description:
      'Mandatory disclaimer confirming the defensive and planning-only nature of this assessment. Required in all reports.',
    futureRun: 4,
    requiredData: [],
    defensiveOnly: true,
    includeByDefault: true,
    mandatory: true,
    content:
      'This report is produced by Quantum Compliance OS™ for defensive security readiness assessment and post-quantum migration planning purposes only. It does not constitute legal, regulatory, or professional compliance advice. No offensive testing, exploitation, or unauthorised scanning was performed. All findings and recommendations should be reviewed by qualified security and compliance professionals before any operational decisions are made. Compliance with any regulatory framework cannot be guaranteed by this assessment alone.',
  },
];

export const getReportSectionById = (id) =>
  REPORT_SECTIONS.find((s) => s.id === id) || null;

export const getSectionsByRun = (runLevel) =>
  REPORT_SECTIONS.filter((s) => s.futureRun <= runLevel);

export const getDefaultSections = () =>
  REPORT_SECTIONS.filter((s) => s.includeByDefault);

export const getMandatorySections = () =>
  REPORT_SECTIONS.filter((s) => s.mandatory === true);
