/**
 * QUANTUM COMPLIANCE OS™ — riskTaxonomy.js
 * Defensive risk categories only. No offensive security tools.
 * All categories are readiness, assessment, and migration planning focused.
 */

export const RISK_TAXONOMY = [
  {
    id: 'iac',
    name: 'Identity & Access Control',
    description:
      'Assessment of authentication mechanisms, access management, privilege control, and identity governance. Covers MFA adoption, least-privilege enforcement, and privileged access management (PAM) readiness.',
    riskLevelDefault: 'high',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['ISO 27001 A.9', 'NIST CSF PR.AC', 'CIS Control 5-6', 'NCSC Cyber Essentials'],
    quantumRelevance: false,
    icon: '🔐',
  },
  {
    id: 'ekm',
    name: 'Encryption & Key Management',
    description:
      'Evaluation of encryption standards in use across systems, key lifecycle management, certificate management, and algorithm agility. Identifies use of deprecated algorithms (e.g. RSA-2048, ECC) vulnerable to quantum threats.',
    riskLevelDefault: 'critical',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['ISO 27001 A.10', 'NIST SP 800-57', 'NIST SP 800-208', 'NCSC Post-Quantum Guidance'],
    quantumRelevance: true,
    icon: '🔑',
  },
  {
    id: 'dsr',
    name: 'Data Sensitivity & Retention',
    description:
      'Assessment of data classification schemes, retention policies, data minimisation practices, and sensitivity of data assets at risk from quantum-enabled decryption attacks (harvest-now-decrypt-later threats).',
    riskLevelDefault: 'high',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['UK GDPR', 'ISO 27001 A.8', 'NIST CSF ID.AM', 'NCSC Data Security Guidance'],
    quantumRelevance: true,
    icon: '📊',
  },
  {
    id: 'bar',
    name: 'Backup & Recovery',
    description:
      'Readiness review of backup coverage, recovery time objectives (RTO), recovery point objectives (RPO), immutable backup practices, and tested restoration procedures. Assesses resilience against ransomware and data loss events.',
    riskLevelDefault: 'high',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['ISO 27001 A.12.3', 'NIST CSF RC', 'CIS Control 11', 'NCSC Cyber Essentials'],
    quantumRelevance: false,
    icon: '💾',
  },
  {
    id: 'cip',
    name: 'Cloud & Infrastructure Posture',
    description:
      'Evaluation of cloud configuration hygiene, network segmentation, exposure surface, misconfiguration risk, and security baseline compliance across cloud and hybrid environments.',
    riskLevelDefault: 'high',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['CIS Benchmarks', 'NIST CSF PR.IP', 'ISO 27001 A.13', 'CSA CCM'],
    quantumRelevance: false,
    icon: '☁️',
  },
  {
    id: 'lam',
    name: 'Logging & Monitoring',
    description:
      'Assessment of security event logging coverage, SIEM integration, alerting thresholds, log retention periods, and detection capability maturity for identifying threats and anomalous behaviour.',
    riskLevelDefault: 'medium',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['ISO 27001 A.12.4', 'NIST CSF DE.CM', 'CIS Control 8', 'NCSC Logging Guidance'],
    quantumRelevance: false,
    icon: '📡',
  },
  {
    id: 'irp',
    name: 'Incident Response',
    description:
      'Readiness review of incident response plans, playbook coverage, communication procedures, forensic capability, and post-incident review practices. Assesses preparedness for security events and breach scenarios.',
    riskLevelDefault: 'high',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['ISO 27001 A.16', 'NIST CSF RS', 'NCSC Incident Management', 'CIS Control 17'],
    quantumRelevance: false,
    icon: '🚨',
  },
  {
    id: 'vmp',
    name: 'Vulnerability Management',
    description:
      'Assessment of vulnerability identification, prioritisation, and remediation processes. Covers patch management cadence, asset discovery completeness, and risk-based remediation planning. Defensive readiness only — no live scanning.',
    riskLevelDefault: 'high',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['ISO 27001 A.12.6', 'NIST CSF ID.RA', 'CIS Control 7', 'NCSC Vulnerability Management'],
    quantumRelevance: false,
    icon: '🩺',
  },
  {
    id: 'str',
    name: 'Supplier & Third-Party Risk',
    description:
      'Evaluation of third-party and supply chain security posture, vendor due diligence processes, contractual security requirements, and ongoing supplier assurance activities.',
    riskLevelDefault: 'medium',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['ISO 27001 A.15', 'NIST CSF ID.SC', 'NCSC Supply Chain Guidance', 'NIS2 Article 21'],
    quantumRelevance: false,
    icon: '🔗',
  },
  {
    id: 'pqr',
    name: 'Post-Quantum Readiness',
    description:
      'Assessment of organisational readiness for the quantum computing threat to current public-key cryptography. Evaluates awareness, inventory of quantum-vulnerable systems, and migration planning progress toward NIST PQC standards.',
    riskLevelDefault: 'critical',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['NIST SP 800-208', 'NIST FIPS 203/204/205', 'NCSC Post-Quantum Guidance', 'ENISA PQC Guidance'],
    quantumRelevance: true,
    icon: '⚛️',
  },
  {
    id: 'cag',
    name: 'Crypto-Agility',
    description:
      'Assessment of the organisation\'s ability to rapidly replace cryptographic algorithms without significant operational disruption. Evaluates hardcoded algorithm dependencies, protocol flexibility, and migration readiness.',
    riskLevelDefault: 'critical',
    defensiveOnly: true,
    futureRun: 2,
    relatedFrameworks: ['NIST SP 800-208', 'NCSC Post-Quantum Guidance', 'BSI TR-02102', 'ETSI QSC'],
    quantumRelevance: true,
    icon: '🔄',
  },
  {
    id: 'cep',
    name: 'Compliance Evidence Preparedness',
    description:
      'Readiness review of documentation, evidence artefacts, audit trails, and policy documentation required to demonstrate compliance with applicable frameworks. Assesses the completeness and accessibility of evidence packs.',
    riskLevelDefault: 'medium',
    defensiveOnly: true,
    futureRun: 4,
    relatedFrameworks: ['ISO 27001', 'SOC 2', 'UK GDPR', 'NCSC Cyber Essentials', 'DORA', 'NIS2'],
    quantumRelevance: false,
    icon: '📁',
  },
];

export const getRiskCategoryById = (id) =>
  RISK_TAXONOMY.find((cat) => cat.id === id) || null;

export const getQuantumRelevantCategories = () =>
  RISK_TAXONOMY.filter((cat) => cat.quantumRelevance === true);

export const getCategoriesByRun = (runLevel) =>
  RISK_TAXONOMY.filter((cat) => cat.futureRun <= runLevel);
