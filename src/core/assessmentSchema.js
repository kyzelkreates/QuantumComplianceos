/**
 * QUANTUM COMPLIANCE OS™ — assessmentSchema.js
 * Security Assessment Engine — Run 2
 * =========================================
 * Defines all 12 assessment categories, their questions,
 * answer options, scoring weights, and control mappings.
 *
 * DEFENSIVE USE ONLY.
 * No offensive scanning. No live target testing. No exploit tools.
 */

// ─── Answer Option Model ──────────────────────────────────────────────────────
// Each answer has:
//   value:        unique string key
//   label:        display text
//   score:        0–4 (0=absent, 1=partial, 2=basic, 3=good, 4=exemplary)
//   riskWeight:   contribution to risk score if low (0–1)
//   isWeakness:   true if this answer indicates a control gap

// ─── Category Definitions ─────────────────────────────────────────────────────
export const ASSESSMENT_CATEGORIES = [
  // ── 1. MFA ──────────────────────────────────────────────────────────────────
  {
    id: 'mfa',
    label: 'Multi-Factor Authentication',
    icon: '🔐',
    weight: 1.5,
    frameworks: ['NCSC Cyber Essentials', 'ISO 27001 A.9', 'NIST CSF PR.AC'],
    description:
      'Assessment of multi-factor authentication (MFA) deployment across user accounts, admin accounts, and remote access pathways.',
    defensiveNote:
      'MFA is one of the highest-impact defensive controls. This section assesses deployment coverage only — no authentication bypass testing is performed.',
    questions: [
      {
        id: 'mfa_admin',
        label: 'MFA on administrative accounts',
        hint: 'Include all accounts with elevated privileges: domain admins, cloud console admins, billing admins.',
        required: true,
        options: [
          { value: 'all', label: 'All admin accounts use MFA', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'most', label: 'Most admin accounts (>80%) use MFA', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'some', label: 'Some admin accounts use MFA (<80%)', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'none', label: 'MFA is not enforced on admin accounts', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown / Not assessed', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'mfa_users',
        label: 'MFA on all user accounts',
        hint: 'Standard user accounts across email, VPN, business applications, and cloud services.',
        required: true,
        options: [
          { value: 'all', label: 'All users are required to use MFA', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'most', label: 'Most users (>80%) use MFA', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'some', label: 'Some users use MFA (<80%)', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'MFA is not deployed for users', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'mfa_remote',
        label: 'MFA on remote access (VPN / RDP / SSH)',
        hint: 'All remote access pathways including VPN, remote desktop, and SSH access.',
        required: true,
        options: [
          { value: 'all', label: 'MFA required for all remote access', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'vpn_only', label: 'MFA on VPN only, not RDP/SSH', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'partial', label: 'MFA on some remote pathways', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No MFA on remote access', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'no_remote', label: 'No remote access permitted', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'mfa_type',
        label: 'MFA method in use',
        hint: 'Phishing-resistant methods (hardware keys, passkeys) are stronger than SMS/email OTP.',
        required: false,
        options: [
          { value: 'phishing_resistant', label: 'Phishing-resistant (FIDO2/WebAuthn/hardware keys)', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'authenticator_app', label: 'Authenticator app (TOTP)', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'push', label: 'Push notification (e.g. Microsoft Authenticator)', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'sms_email', label: 'SMS or email OTP only', score: 1, riskWeight: 0.5, isWeakness: true },
          { value: 'mixed', label: 'Mixed methods', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.5, isWeakness: true },
        ],
      },
    ],
  },

  // ── 2. Password Policy ───────────────────────────────────────────────────────
  {
    id: 'password_policy',
    label: 'Password Policy',
    icon: '🗝️',
    weight: 1.0,
    frameworks: ['NCSC Cyber Essentials', 'NIST SP 800-63B', 'ISO 27001 A.9'],
    description:
      'Assessment of password policy strength, enforcement mechanisms, and alignment with current guidance (e.g. NCSC/NIST — length over complexity, no forced rotation without breach evidence).',
    defensiveNote:
      'No password scanning or cracking is performed. This section assesses policy documentation and enforcement.',
    questions: [
      {
        id: 'pw_policy_exists',
        label: 'Password policy status',
        hint: 'NCSC recommends minimum 12 characters, no mandatory regular rotation without breach evidence.',
        required: true,
        options: [
          { value: 'enforced_technical', label: 'Policy exists and is technically enforced', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'enforced_manual', label: 'Policy exists but manually enforced only', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'documented_only', label: 'Policy documented but not enforced', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No password policy', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'pw_min_length',
        label: 'Minimum password length',
        required: true,
        options: [
          { value: 'ge16', label: '16+ characters (excellent)', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'ge12', label: '12–15 characters (recommended)', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'ge8', label: '8–11 characters (minimum acceptable)', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'lt8', label: 'Less than 8 characters', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Not set or unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
      {
        id: 'pw_breach_check',
        label: 'Compromised credential checking',
        hint: 'Checking passwords against known breach databases (e.g. HaveIBeenPwned API).',
        required: false,
        options: [
          { value: 'automated', label: 'Automated breach credential checking in place', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'periodic', label: 'Periodic manual breach checking', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'none', label: 'No breach checking performed', score: 0, riskWeight: 0.6, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.5, isWeakness: true },
        ],
      },
      {
        id: 'pw_manager',
        label: 'Password manager usage',
        required: false,
        options: [
          { value: 'mandated', label: 'Password manager mandated and enforced', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'recommended', label: 'Password manager recommended (not mandated)', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'none', label: 'No password manager guidance', score: 0, riskWeight: 0.5, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.4, isWeakness: true },
        ],
      },
    ],
  },

  // ── 3. Access Control ────────────────────────────────────────────────────────
  {
    id: 'access_control',
    label: 'Access Control',
    icon: '🚪',
    weight: 1.4,
    frameworks: ['ISO 27001 A.9', 'NIST CSF PR.AC', 'CIS Control 5-6', 'NCSC Cyber Essentials'],
    description:
      'Assessment of identity and access management (IAM) practices including least privilege, role-based access control, joiners/movers/leavers process, and privileged account management.',
    defensiveNote:
      'No unauthorised access attempts are performed. This section assesses documented and technically enforced access control practices.',
    questions: [
      {
        id: 'ac_least_privilege',
        label: 'Least-privilege principle enforcement',
        hint: 'Users should have the minimum permissions required for their role.',
        required: true,
        options: [
          { value: 'enforced', label: 'Least privilege enforced and regularly reviewed', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'partial', label: 'Partially enforced — some over-privileged accounts known', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'documented_only', label: 'Policy only — not technically enforced', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'Least privilege not applied', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'ac_jml',
        label: 'Joiners / Movers / Leavers process',
        hint: 'Process for provisioning, modifying, and revoking access when staff join, change role, or leave.',
        required: true,
        options: [
          { value: 'automated', label: 'Automated JML process with immediate revocation', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'documented_fast', label: 'Documented process, access revoked within 24 hours', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'documented_slow', label: 'Documented process, revocation takes days/weeks', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'ad_hoc', label: 'Ad hoc — no consistent process', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'ac_review',
        label: 'Access review frequency',
        hint: 'Periodic review of all user access rights to identify and remove unnecessary permissions.',
        required: true,
        options: [
          { value: 'quarterly', label: 'Quarterly or more frequently', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'biannual', label: 'Twice per year', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'annual', label: 'Annually', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'ad_hoc', label: 'Ad hoc / infrequent', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'never', label: 'Never', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'ac_pam',
        label: 'Privileged Access Management (PAM)',
        hint: 'Controls over admin/privileged accounts — separate accounts, just-in-time access, vaulting.',
        required: false,
        options: [
          { value: 'pam_solution', label: 'Dedicated PAM solution in use (CyberArk, BeyondTrust, etc.)', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'jit', label: 'Just-in-time privilege elevation used', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'separate_accounts', label: 'Separate admin accounts, no dedicated PAM tool', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'shared_admin', label: 'Shared admin accounts in use', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
    ],
  },

  // ── 4. Encryption in Transit ─────────────────────────────────────────────────
  {
    id: 'encryption_transit',
    label: 'Encryption in Transit',
    icon: '🔒',
    weight: 1.3,
    frameworks: ['ISO 27001 A.10', 'NCSC TLS Guidance', 'PCI DSS 4.0', 'NIST CSF PR.DS'],
    description:
      'Assessment of encryption for data transmitted over networks, including TLS version, certificate management, and email security controls.',
    defensiveNote:
      'No traffic interception or network scanning is performed. This section assesses documented encryption configurations and certificate management processes.',
    questions: [
      {
        id: 'tls_version',
        label: 'TLS version in use for all services',
        hint: 'TLS 1.0 and 1.1 are deprecated. NCSC recommends TLS 1.2 minimum, TLS 1.3 preferred.',
        required: true,
        options: [
          { value: 'tls13_only', label: 'TLS 1.3 only', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'tls12_13', label: 'TLS 1.2 and 1.3 (no 1.0/1.1)', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'tls12_legacy', label: 'TLS 1.2 with some TLS 1.0/1.1 still active', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'tls10_11', label: 'TLS 1.0 or 1.1 in use', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'cert_management',
        label: 'Certificate lifecycle management',
        hint: 'How TLS certificates are tracked, renewed, and revoked.',
        required: true,
        options: [
          { value: 'automated', label: 'Automated cert management (e.g. Let\'s Encrypt, cert-manager)', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'tracked', label: 'Manually managed with tracked expiry dates', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'ad_hoc', label: 'Ad hoc — certificates renewed when they expire', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'unknown', label: 'Unknown — no visibility of certificate estate', score: 0, riskWeight: 0.9, isWeakness: true },
        ],
      },
      {
        id: 'email_security',
        label: 'Email security controls (DMARC / DKIM / SPF)',
        hint: 'Email authentication controls that prevent spoofing and domain impersonation.',
        required: true,
        options: [
          { value: 'all_enforced', label: 'SPF, DKIM, and DMARC all configured with p=reject', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'dmarc_monitor', label: 'DMARC configured but policy is quarantine or none', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'partial', label: 'Some controls in place (e.g. SPF only)', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'None configured', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'internal_transit',
        label: 'Encryption of internal network traffic',
        hint: 'Encryption of traffic between internal services, APIs, and databases.',
        required: false,
        options: [
          { value: 'all', label: 'All internal traffic encrypted', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'most', label: 'Most internal traffic encrypted', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'external_only', label: 'External traffic only — internal unencrypted', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No internal encryption', score: 0, riskWeight: 0.8, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
    ],
  },

  // ── 5. Encryption at Rest ────────────────────────────────────────────────────
  {
    id: 'encryption_rest',
    label: 'Encryption at Rest',
    icon: '💿',
    weight: 1.3,
    frameworks: ['ISO 27001 A.10', 'NIST CSF PR.DS', 'NCSC Post-Quantum Guidance'],
    description:
      'Assessment of encryption applied to stored data including databases, file storage, backups, and endpoint devices. Identifies quantum-vulnerable algorithm usage.',
    defensiveNote:
      'No data access or decryption is performed. This section assesses documented encryption configurations and key management practices.',
    questions: [
      {
        id: 'rest_databases',
        label: 'Database encryption at rest',
        required: true,
        options: [
          { value: 'all_strong', label: 'All databases encrypted with AES-256 or equivalent', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'most', label: 'Most databases encrypted', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'some', label: 'Some databases encrypted', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'none', label: 'No database encryption', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'rest_endpoints',
        label: 'Endpoint / device encryption (full-disk)',
        hint: 'BitLocker, FileVault, or equivalent full-disk encryption on all endpoints.',
        required: true,
        options: [
          { value: 'all', label: 'All endpoints use full-disk encryption', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'most', label: 'Most endpoints encrypted (>80%)', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'some', label: 'Some endpoints encrypted', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'none', label: 'No endpoint encryption', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'rest_keys',
        label: 'Encryption key management',
        hint: 'How encryption keys are stored, rotated, and protected.',
        required: true,
        options: [
          { value: 'hsm', label: 'Keys managed via HSM or cloud KMS (AWS KMS, Azure Key Vault)', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'secrets_manager', label: 'Keys stored in a secrets manager (HashiCorp Vault, etc.)', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'config_files', label: 'Keys stored in config files or environment variables', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'unknown', label: 'Unknown key management approach', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'rest_backups',
        label: 'Backup encryption',
        required: false,
        options: [
          { value: 'all_encrypted', label: 'All backups encrypted at rest and in transit', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'at_rest_only', label: 'Backups encrypted at rest only', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'some', label: 'Some backups encrypted', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'Backups not encrypted', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
    ],
  },

  // ── 6. Backups & Recovery ────────────────────────────────────────────────────
  {
    id: 'backups',
    label: 'Backups & Recovery',
    icon: '💾',
    weight: 1.2,
    frameworks: ['ISO 27001 A.12.3', 'NIST CSF RC', 'CIS Control 11', 'NCSC Backup Guidance'],
    description:
      'Assessment of backup strategy, coverage, frequency, immutability, off-site storage, and recovery testing (RTO/RPO).',
    defensiveNote:
      'No data restoration or system access is performed. This section assesses documented backup and recovery procedures.',
    questions: [
      {
        id: 'backup_coverage',
        label: 'Backup coverage of critical systems',
        required: true,
        options: [
          { value: 'all', label: 'All critical systems backed up', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'most', label: 'Most critical systems backed up (>80%)', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'some', label: 'Some systems backed up', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'none', label: 'No systematic backup', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'backup_frequency',
        label: 'Backup frequency for critical data',
        required: true,
        options: [
          { value: 'continuous', label: 'Continuous / real-time replication', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'daily', label: 'Daily backups', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'weekly', label: 'Weekly backups', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'monthly', label: 'Monthly or less frequent', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No scheduled backups', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'backup_immutable',
        label: 'Immutable / offline backup copies',
        hint: 'Backups that cannot be modified or deleted by ransomware (offline, air-gapped, or WORM storage).',
        required: true,
        options: [
          { value: 'yes_tested', label: 'Immutable backups in place and regularly tested', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'yes_untested', label: 'Immutable backups in place but not tested', score: 2, riskWeight: 0.3, isWeakness: true },
          { value: 'offline_only', label: 'Offline copies only (not WORM/immutable)', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'none', label: 'No immutable or offline backup copies', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'backup_restore_test',
        label: 'Backup restore testing frequency',
        hint: 'Untested backups are not reliable backups.',
        required: true,
        options: [
          { value: 'quarterly', label: 'Restore tested quarterly or more frequently', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'biannual', label: 'Restore tested twice per year', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'annual', label: 'Restore tested annually', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'never', label: 'Restore has never been tested', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
    ],
  },

  // ── 7. Logging & Monitoring ──────────────────────────────────────────────────
  {
    id: 'logging_monitoring',
    label: 'Logging & Monitoring',
    icon: '📡',
    weight: 1.1,
    frameworks: ['ISO 27001 A.12.4', 'NIST CSF DE.CM', 'CIS Control 8', 'NCSC Logging Guidance'],
    description:
      'Assessment of security event logging coverage, centralised log management, SIEM capability, alerting, and log retention.',
    defensiveNote:
      'No access to live log data or monitored systems is performed. This section assesses logging architecture and coverage.',
    questions: [
      {
        id: 'log_coverage',
        label: 'Security event logging coverage',
        hint: 'Logs should include authentication events, privileged actions, network activity, and application errors.',
        required: true,
        options: [
          { value: 'comprehensive', label: 'Comprehensive logging across all critical systems', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'most', label: 'Most systems logged (>80%)', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'partial', label: 'Partial coverage (<80%)', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'minimal', label: 'Minimal logging — OS/app defaults only', score: 0, riskWeight: 0.8, isWeakness: true },
          { value: 'none', label: 'No security logging', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'log_centralised',
        label: 'Centralised log management / SIEM',
        required: true,
        options: [
          { value: 'siem_active', label: 'SIEM in use with active alerting and correlation', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'centralised_no_siem', label: 'Centralised log store but no SIEM', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'individual', label: 'Individual system logs — no centralisation', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'none', label: 'No centralised logging', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'log_retention',
        label: 'Log retention period',
        hint: 'NCSC and ISO 27001 generally recommend minimum 12 months. Some regulations require longer.',
        required: false,
        options: [
          { value: 'ge24m', label: '24 months or more', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'ge12m', label: '12–23 months', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'ge6m', label: '6–11 months', score: 2, riskWeight: 0.3, isWeakness: true },
          { value: 'lt6m', label: 'Less than 6 months', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'unknown', label: 'Unknown / no retention policy', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'log_alerting',
        label: 'Alerting on security-relevant events',
        required: false,
        options: [
          { value: 'automated_24_7', label: 'Automated 24/7 alerting with SOC/MDR', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'automated_business_hours', label: 'Automated alerting (business hours monitoring)', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'manual_review', label: 'Manual log review — no automated alerting', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No alerting', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
    ],
  },

  // ── 8. Incident Response ─────────────────────────────────────────────────────
  {
    id: 'incident_response',
    label: 'Incident Response',
    icon: '🚨',
    weight: 1.2,
    frameworks: ['ISO 27001 A.16', 'NIST CSF RS', 'NCSC Incident Management', 'CIS Control 17'],
    description:
      'Assessment of incident response plan completeness, playbook coverage, escalation paths, communication procedures, and post-incident review processes.',
    defensiveNote:
      'No incident simulation or active response actions are performed. This section assesses documented IR capability and readiness.',
    questions: [
      {
        id: 'ir_plan',
        label: 'Incident Response Plan status',
        required: true,
        options: [
          { value: 'tested_current', label: 'IRP exists, tested within last 12 months, and current', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'exists_untested', label: 'IRP exists but has not been tested', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'outdated', label: 'IRP exists but is outdated (>2 years)', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No incident response plan', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'ir_playbooks',
        label: 'Incident response playbook coverage',
        hint: 'Playbooks for specific scenarios: ransomware, data breach, phishing, insider threat.',
        required: true,
        options: [
          { value: 'comprehensive', label: 'Playbooks for all major incident types', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'some', label: 'Playbooks for some scenarios (e.g. ransomware only)', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'generic_only', label: 'Generic IRP only — no specific playbooks', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No playbooks', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'ir_contacts',
        label: 'External IR contacts / retainer',
        hint: 'Retainer with incident response firm, NCSC CISP membership, cyber insurer IR support.',
        required: false,
        options: [
          { value: 'retainer', label: 'IR retainer in place with specialist firm', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'insurance', label: 'Cyber insurance with IR support only', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'ncsc_cisp', label: 'NCSC CISP member — no retainer', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'none', label: 'No external IR contacts or retainer', score: 0, riskWeight: 0.7, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.5, isWeakness: true },
        ],
      },
      {
        id: 'ir_post_incident',
        label: 'Post-incident review process',
        required: false,
        options: [
          { value: 'always', label: 'Post-incident review conducted after every incident', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'major_only', label: 'Post-incident review for major incidents only', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'ad_hoc', label: 'Ad hoc — no consistent process', score: 1, riskWeight: 0.5, isWeakness: true },
          { value: 'none', label: 'No post-incident review', score: 0, riskWeight: 0.7, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.5, isWeakness: true },
        ],
      },
    ],
  },

  // ── 9. Vulnerability Management ──────────────────────────────────────────────
  {
    id: 'vulnerability_management',
    label: 'Vulnerability Management',
    icon: '🩺',
    weight: 1.2,
    frameworks: ['ISO 27001 A.12.6', 'NIST CSF ID.RA', 'CIS Control 7', 'NCSC Vulnerability Management'],
    description:
      'Assessment of vulnerability identification, prioritisation, patch management cadence, and remediation tracking. Defensive readiness assessment only — no live scanning.',
    defensiveNote:
      'No vulnerability scanning, exploitation, or unauthorised testing is performed. This section assesses vulnerability management programme maturity.',
    questions: [
      {
        id: 'vuln_scanning',
        label: 'Vulnerability scanning programme',
        hint: 'Internal/external vulnerability scanning using tools like Tenable, Qualys, Rapid7, or equivalent. Note: this platform does not perform scanning.',
        required: true,
        options: [
          { value: 'continuous', label: 'Continuous automated scanning with remediation tracking', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'scheduled', label: 'Scheduled scanning (monthly or quarterly)', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'ad_hoc', label: 'Ad hoc scanning — no regular programme', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No vulnerability scanning', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'vuln_patch_cadence',
        label: 'Patch management cadence for critical vulnerabilities',
        hint: 'NCSC Cyber Essentials requires critical patches applied within 14 days.',
        required: true,
        options: [
          { value: 'le7_days', label: 'Critical patches applied within 7 days', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'le14_days', label: 'Critical patches applied within 14 days', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'le30_days', label: 'Critical patches applied within 30 days', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'gt30_days', label: 'Critical patches take more than 30 days', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'no_process', label: 'No defined patch management process', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'vuln_asset_inventory',
        label: 'Asset inventory coverage for vulnerability management',
        hint: 'You cannot patch what you cannot find.',
        required: false,
        options: [
          { value: 'complete', label: 'Complete, automated, up-to-date asset inventory', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'mostly_complete', label: 'Mostly complete — minor gaps expected', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'partial', label: 'Partial — significant unknown assets likely', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No asset inventory', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'vuln_pentest',
        label: 'Penetration testing / external assessments',
        hint: 'Authorised penetration testing conducted by qualified third parties. This platform does not perform penetration testing.',
        required: false,
        options: [
          { value: 'annual_plus', label: 'Annual or more frequent penetration testing', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'biennial', label: 'Every 2 years', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'ad_hoc', label: 'Ad hoc — no regular schedule', score: 1, riskWeight: 0.5, isWeakness: true },
          { value: 'never', label: 'Never', score: 0, riskWeight: 0.7, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.5, isWeakness: true },
        ],
      },
    ],
  },

  // ── 10. Third-Party / Supplier Controls ──────────────────────────────────────
  {
    id: 'third_party',
    label: 'Third-Party & Supplier Controls',
    icon: '🔗',
    weight: 1.0,
    frameworks: ['ISO 27001 A.15', 'NIST CSF ID.SC', 'NCSC Supply Chain Guidance', 'NIS2 Article 21'],
    description:
      'Assessment of supply chain security practices including vendor due diligence, contractual security requirements, and ongoing supplier assurance.',
    defensiveNote:
      'No assessment of third-party systems is performed directly. This section assesses your organisation\'s supplier risk management processes.',
    questions: [
      {
        id: 'tp_due_diligence',
        label: 'Supplier security due diligence',
        hint: 'Security questionnaires, certifications review (ISO 27001, SOC 2), or NCSC Cyber Essentials checks.',
        required: true,
        options: [
          { value: 'formal_all', label: 'Formal due diligence for all significant suppliers', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'formal_critical', label: 'Formal due diligence for critical suppliers only', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'informal', label: 'Informal checks only (e.g. asking if they have ISO 27001)', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No supplier security assessment', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'tp_contractual',
        label: 'Contractual security requirements',
        hint: 'Data processing agreements, security clauses, breach notification requirements, right to audit.',
        required: true,
        options: [
          { value: 'comprehensive', label: 'Comprehensive security clauses in all supplier contracts', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'dpa_only', label: 'DPAs in place but limited security clauses', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'minimal', label: 'Minimal contractual security requirements', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No contractual security requirements', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'tp_ongoing',
        label: 'Ongoing supplier assurance',
        required: false,
        options: [
          { value: 'annual_review', label: 'Annual security review of all critical suppliers', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'certification_tracking', label: 'Track supplier certifications and expiry', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'onboarding_only', label: 'Security review at onboarding only', score: 1, riskWeight: 0.5, isWeakness: true },
          { value: 'none', label: 'No ongoing assurance', score: 0, riskWeight: 0.8, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
    ],
  },

  // ── 11. Device & User Security ────────────────────────────────────────────────
  {
    id: 'device_user_security',
    label: 'Device & User Security',
    icon: '💻',
    weight: 1.0,
    frameworks: ['NCSC Cyber Essentials', 'CIS Control 4', 'ISO 27001 A.6', 'NIST CSF PR.AT'],
    description:
      'Assessment of endpoint protection, device management, user security training, and security awareness programmes.',
    defensiveNote:
      'No device access, scanning, or monitoring is performed. This section assesses documented device management and training programmes.',
    questions: [
      {
        id: 'dev_edr',
        label: 'Endpoint Detection & Response (EDR / AV)',
        hint: 'Anti-malware, EDR, or XDR on all endpoints.',
        required: true,
        options: [
          { value: 'edr_all', label: 'EDR/XDR deployed on all endpoints', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'av_all', label: 'Anti-malware on all endpoints (no EDR)', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'partial', label: 'Endpoint protection on some devices', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'none', label: 'No endpoint protection', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'dev_mdm',
        label: 'Mobile Device Management (MDM)',
        hint: 'MDM/UEM solution for managing and securing corporate and BYOD devices.',
        required: false,
        options: [
          { value: 'mdm_all', label: 'MDM enforced on all corporate and BYOD devices', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'mdm_corporate', label: 'MDM on corporate devices only', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'byod_unmanaged', label: 'BYOD permitted but unmanaged', score: 0, riskWeight: 0.8, isWeakness: true },
          { value: 'no_mobile', label: 'No mobile access to corporate systems', score: 3, riskWeight: 0, isWeakness: false },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
      {
        id: 'dev_security_training',
        label: 'Security awareness training',
        hint: 'Phishing simulation, security training, awareness campaigns for all staff.',
        required: true,
        options: [
          { value: 'regular_all', label: 'Regular training (at least annual) for all staff', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'onboarding_only', label: 'Security training at onboarding only', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'ad_hoc', label: 'Ad hoc awareness — no structured programme', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No security training', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'dev_phishing_sim',
        label: 'Phishing simulation exercises',
        required: false,
        options: [
          { value: 'regular', label: 'Regular phishing simulations (quarterly or more)', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'occasional', label: 'Occasional phishing simulations (annual)', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'none', label: 'No phishing simulations', score: 1, riskWeight: 0.5, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.4, isWeakness: true },
        ],
      },
    ],
  },

  // ── 12. Cloud Security Posture ───────────────────────────────────────────────
  {
    id: 'cloud_posture',
    label: 'Cloud Security Posture',
    icon: '☁️',
    weight: 1.1,
    frameworks: ['CIS Benchmarks', 'CSA CCM', 'NIST CSF PR.IP', 'ISO 27001 A.13'],
    description:
      'Assessment of cloud configuration hygiene, CSPM tooling, network segmentation, public exposure, and shared responsibility model understanding.',
    defensiveNote:
      'No cloud account access, scanning, or configuration changes are performed. This section assesses documented cloud security practices and configuration management processes.',
    questions: [
      {
        id: 'cloud_cspm',
        label: 'Cloud Security Posture Management (CSPM)',
        hint: 'CSPM tools identify misconfigured cloud resources (e.g. AWS Security Hub, Microsoft Defender for Cloud, Wiz, Prisma Cloud).',
        required: true,
        options: [
          { value: 'cspm_active', label: 'CSPM tool in use with active remediation workflow', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'native_tools', label: 'Native cloud security tools used (e.g. AWS Security Hub)', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'manual', label: 'Manual configuration reviews only', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No cloud posture management', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'no_cloud', label: 'No cloud services in use', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'cloud_network',
        label: 'Network segmentation and micro-segmentation',
        hint: 'VPCs, subnets, security groups, NSGs isolating workloads from each other and the internet.',
        required: false,
        options: [
          { value: 'micro_seg', label: 'Micro-segmentation with least-privilege network policy', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'basic_seg', label: 'Basic segmentation (production/dev/management separated)', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'flat', label: 'Flat network — limited segmentation', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
      {
        id: 'cloud_public_exposure',
        label: 'Public cloud exposure management',
        hint: 'Management of publicly exposed storage (S3 buckets, blob storage), APIs, and databases.',
        required: true,
        options: [
          { value: 'monitored', label: 'Exposure continuously monitored and minimised', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'reviewed', label: 'Exposure reviewed periodically', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'ad_hoc', label: 'Exposure managed ad hoc', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'unknown', label: 'Unknown — no visibility of public exposure', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'no_cloud', label: 'No cloud — not applicable', score: 4, riskWeight: 0, isWeakness: false },
        ],
      },
      {
        id: 'cloud_iam',
        label: 'Cloud IAM and service account security',
        hint: 'Cloud-native IAM, service account key rotation, avoiding long-lived credentials.',
        required: false,
        options: [
          { value: 'workload_identity', label: 'Workload identity / role-based — no long-lived keys', score: 4, riskWeight: 0, isWeakness: false },
          { value: 'rotated', label: 'Service account keys used but rotated regularly', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'static_keys', label: 'Static long-lived keys in use', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
          { value: 'no_cloud', label: 'No cloud — not applicable', score: 4, riskWeight: 0, isWeakness: false },
        ],
      },
    ],
  },
];

// ─── Helper: get all questions flat ──────────────────────────────────────────
export function getAllQuestions() {
  return ASSESSMENT_CATEGORIES.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, categoryId: cat.id, categoryLabel: cat.label }))
  );
}

// ─── Helper: get category by id ──────────────────────────────────────────────
export function getCategoryById(id) {
  return ASSESSMENT_CATEGORIES.find((c) => c.id === id) || null;
}

// ─── Helper: get required questions for a category ───────────────────────────
export function getRequiredQuestions(categoryId) {
  const cat = getCategoryById(categoryId);
  if (!cat) return [];
  return cat.questions.filter((q) => q.required);
}

// ─── Helper: count total questions ───────────────────────────────────────────
export function getTotalQuestionCount() {
  return ASSESSMENT_CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
}

// ─── Helper: count required questions ────────────────────────────────────────
export function getRequiredQuestionCount() {
  return ASSESSMENT_CATEGORIES.reduce(
    (acc, cat) => acc + cat.questions.filter((q) => q.required).length, 0
  );
}
