/**
 * QUANTUM COMPLIANCE OS™ — seedData.js
 * Demo data for initial load. Defensive use only.
 */

export const SEED_DATA = {
  organisation: {
    id: 'org_demo_001',
    name: 'Demo Organisation Ltd',
    sector: 'Professional Services',
    size: 'Medium (50–249 employees)',
    country: 'United Kingdom',
    contactName: 'Alex Reynolds',
    contactEmail: 'alex.reynolds@demo-org.example.com',
    complianceNeeds: ['ISO 27001', 'UK GDPR', 'NCSC Cyber Essentials'],
    dataSensitivityLevel: 'confidential',
    notes:
      'Demonstration organisation for Quantum Compliance OS. Medium-sized professional services firm operating in the United Kingdom. Processes commercially sensitive client data and personal information.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isComplete: true,
  },

  systemProfiles: [
    {
      id: 'sys_demo_001',
      name: 'Client Portal',
      type: 'Web Application',
      owner: 'IT Department',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Personal Data (PII)', 'Commercially Sensitive', 'Authentication Credentials'],
      encryptionKnown: 'TLS 1.3 in transit; AES-256 at rest',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Single Sign-On (SSO)'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated & Tested',
      notes:
        'Primary client-facing portal. Handles client data submission, reporting access, and secure document exchange. High sensitivity — critical to operations.',
      archived: false,
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sys_demo_002',
      name: 'Email & Identity Platform',
      type: 'Identity & Access Management',
      owner: 'IT Department',
      environment: 'Production',
      criticality: 'high',
      dataTypes: ['Personal Data (PII)', 'Authentication Credentials'],
      encryptionKnown: 'TLS 1.3; DKIM/DMARC/SPF configured',
      authMethods: ['Multi-Factor Authentication (MFA)', 'Single Sign-On (SSO)', 'OAuth 2.0'],
      cloudProvider: 'Microsoft Azure',
      backupStatus: 'Automated & Tested',
      notes:
        'Microsoft 365 tenant. Manages all internal and external communications, identity provisioning, and access control via Entra ID.',
      archived: false,
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sys_demo_003',
      name: 'Finance Records System',
      type: 'ERP System',
      owner: 'Finance Department',
      environment: 'Production',
      criticality: 'critical',
      dataTypes: ['Financial Data', 'Personal Data (PII)', 'Commercially Sensitive'],
      encryptionKnown: 'Unknown — vendor-managed encryption',
      authMethods: ['Username & Password', 'Multi-Factor Authentication (MFA)'],
      cloudProvider: 'On-Premise Only',
      backupStatus: 'Automated (Untested)',
      notes:
        'Legacy on-premise finance system. Encryption posture partially unknown — vendor documentation pending review. Backup restore has not been tested in 18 months.',
      archived: false,
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  activityLog: [
    {
      id: 'log_demo_001',
      type: 'demo_loaded',
      message: 'Quantum Compliance OS initialised with demo data.',
      timestamp: new Date().toISOString(),
      meta: null,
    },
  ],
};
