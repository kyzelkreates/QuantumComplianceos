/**
 * QUANTUM COMPLIANCE OS™ — scoringEngine.js
 * Security Assessment Scoring Engine — Run 2
 * ===========================================
 * Pure functions only. No side effects. No localStorage access.
 * All state is passed in; results are returned for storage.js to persist.
 *
 * DEFENSIVE USE ONLY. No offensive tools. No live scanning.
 */

import { ASSESSMENT_CATEGORIES, getCategoryById } from './assessmentSchema.js';

// ─── Score Thresholds ─────────────────────────────────────────────────────────
export const SCORE_THRESHOLDS = {
  EXCELLENT:  { min: 85, label: 'Excellent',        colour: '#10b981', icon: '✅' },
  GOOD:       { min: 70, label: 'Good',             colour: '#3b82f6', icon: '🟦' },
  FAIR:       { min: 50, label: 'Fair',             colour: '#f59e0b', icon: '⚠️' },
  POOR:       { min: 30, label: 'Poor',             colour: '#f97316', icon: '🟠' },
  CRITICAL:   { min: 0,  label: 'Critical Risk',   colour: '#ef4444', icon: '🔴' },
};

export function getScoreThreshold(score) {
  if (score >= SCORE_THRESHOLDS.EXCELLENT.min) return SCORE_THRESHOLDS.EXCELLENT;
  if (score >= SCORE_THRESHOLDS.GOOD.min) return SCORE_THRESHOLDS.GOOD;
  if (score >= SCORE_THRESHOLDS.FAIR.min) return SCORE_THRESHOLDS.FAIR;
  if (score >= SCORE_THRESHOLDS.POOR.min) return SCORE_THRESHOLDS.POOR;
  return SCORE_THRESHOLDS.CRITICAL;
}

// ─── Category Score ───────────────────────────────────────────────────────────
/**
 * Calculate score for a single category.
 * Returns { rawScore, maxScore, percentage, answeredCount, totalCount, unanswered }
 */
export function scoreCategoryResponses(categoryId, responses) {
  const category = getCategoryById(categoryId);
  if (!category) return { rawScore: 0, maxScore: 0, percentage: 0, answeredCount: 0, totalCount: 0 };

  let rawScore = 0;
  let maxScore = 0;
  let answeredCount = 0;
  const unanswered = [];

  for (const question of category.questions) {
    const answer = responses?.[question.id];
    const maxQ = 4; // max score per question

    if (answer) {
      const option = question.options.find((o) => o.value === answer);
      if (option) {
        rawScore += option.score;
        answeredCount++;
      } else {
        unanswered.push(question.id);
      }
    } else {
      unanswered.push(question.id);
    }
    maxScore += maxQ;
  }

  // If no questions answered, treat as 0%
  const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

  return {
    rawScore,
    maxScore,
    percentage,
    answeredCount,
    totalCount: category.questions.length,
    requiredCount: category.questions.filter((q) => q.required).length,
    unanswered,
    categoryWeight: category.weight,
  };
}

// ─── Overall Security Implementation Score ────────────────────────────────────
/**
 * Calculate the overall securityImplementationScore across all categories.
 * Weighted average based on category.weight values.
 * Returns value 0–100.
 */
export function computeOverallScore(responses) {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const cat of ASSESSMENT_CATEGORIES) {
    const catResponses = responses?.[cat.id] || {};
    const result = scoreCategoryResponses(cat.id, catResponses);

    // Only include categories with at least 1 answered question in weighting
    if (result.answeredCount > 0) {
      totalWeightedScore += result.percentage * cat.weight;
      totalWeight += cat.weight;
    } else {
      // Unanswered categories count as 0 — drag score down
      totalWeightedScore += 0 * cat.weight;
      totalWeight += cat.weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round(totalWeightedScore / totalWeight);
}

// ─── Preventative Control Score ───────────────────────────────────────────────
/**
 * Measures how well basic preventative controls are in place.
 * Based on the highest-weight, most impactful questions only.
 * This is a subset score for the dashboard "preventative control" KPI.
 */
const PREVENTATIVE_QUESTIONS = [
  { catId: 'mfa', qId: 'mfa_admin' },
  { catId: 'mfa', qId: 'mfa_users' },
  { catId: 'mfa', qId: 'mfa_remote' },
  { catId: 'password_policy', qId: 'pw_policy_exists' },
  { catId: 'access_control', qId: 'ac_least_privilege' },
  { catId: 'access_control', qId: 'ac_jml' },
  { catId: 'encryption_transit', qId: 'tls_version' },
  { catId: 'encryption_rest', qId: 'rest_databases' },
  { catId: 'encryption_rest', qId: 'rest_endpoints' },
  { catId: 'backups', qId: 'backup_immutable' },
  { catId: 'backups', qId: 'backup_restore_test' },
  { catId: 'device_user_security', qId: 'dev_edr' },
];

export function computePreventativeControlScore(responses) {
  let score = 0;
  let max = 0;
  let answered = 0;

  for (const { catId, qId } of PREVENTATIVE_QUESTIONS) {
    const cat = getCategoryById(catId);
    if (!cat) continue;
    const question = cat.questions.find((q) => q.id === qId);
    if (!question) continue;

    const answer = responses?.[catId]?.[qId];
    max += 4;

    if (answer) {
      const option = question.options.find((o) => o.value === answer);
      if (option) {
        score += option.score;
        answered++;
      }
    }
  }

  return {
    score: Math.round((score / Math.max(max, 1)) * 100),
    answeredCount: answered,
    totalCount: PREVENTATIVE_QUESTIONS.length,
  };
}

// ─── Weakness Detection ───────────────────────────────────────────────────────
/**
 * Finds all answered questions that are marked as weaknesses.
 * Returns array of { categoryId, categoryLabel, questionId, questionLabel,
 *                    answer, riskWeight, severity }
 */
export function detectWeaknesses(responses) {
  const weaknesses = [];

  for (const cat of ASSESSMENT_CATEGORIES) {
    const catResponses = responses?.[cat.id] || {};

    for (const question of cat.questions) {
      const answer = catResponses[question.id];
      if (!answer) continue;

      const option = question.options.find((o) => o.value === answer);
      if (!option || !option.isWeakness) continue;

      const severity = option.riskWeight >= 0.9 ? 'critical'
        : option.riskWeight >= 0.7 ? 'high'
        : option.riskWeight >= 0.4 ? 'medium'
        : 'low';

      weaknesses.push({
        categoryId: cat.id,
        categoryLabel: cat.label,
        categoryIcon: cat.icon,
        questionId: question.id,
        questionLabel: question.label,
        answer,
        answerLabel: option.label,
        riskWeight: option.riskWeight,
        severity,
        frameworks: cat.frameworks,
      });
    }
  }

  // Sort by riskWeight descending
  return weaknesses.sort((a, b) => b.riskWeight - a.riskWeight);
}

// ─── Risk Register Population ─────────────────────────────────────────────────
/**
 * Converts weaknesses into structured risk register entries.
 */
export function buildRiskRegister(weaknesses, organisation) {
  return weaknesses.map((w, i) => ({
    id: `risk_${w.categoryId}_${w.questionId}`,
    ref: `R${String(i + 1).padStart(3, '0')}`,
    domain: w.categoryLabel,
    domainIcon: w.categoryIcon,
    description: buildRiskDescription(w),
    likelihood: mapRiskWeightToLikelihood(w.riskWeight),
    impact: mapSeverityToImpact(w.severity, organisation),
    inherentRisk: w.severity,
    controlGap: w.answerLabel,
    frameworks: w.frameworks,
    status: 'open',
    mitigationStatus: 'not_started',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function buildRiskDescription(weakness) {
  return `${weakness.categoryLabel}: ${weakness.questionLabel} — current posture: "${weakness.answerLabel}". This represents a control gap with a risk weighting of ${Math.round(weakness.riskWeight * 100)}%.`;
}

function mapRiskWeightToLikelihood(riskWeight) {
  if (riskWeight >= 0.9) return 'Very Likely';
  if (riskWeight >= 0.7) return 'Likely';
  if (riskWeight >= 0.4) return 'Possible';
  return 'Unlikely';
}

function mapSeverityToImpact(severity, organisation) {
  const sensitivityMap = {
    critical: 1.2,
    restricted: 1.1,
    confidential: 1.0,
    internal: 0.9,
    public: 0.8,
  };
  const multiplier = sensitivityMap[organisation?.dataSensitivityLevel] || 1.0;
  const base = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  // For simplicity return base — could apply multiplier to upgrade severity
  return base[severity] || 'Medium';
}

// ─── Priority Recommendations ─────────────────────────────────────────────────
/**
 * Generate prioritised plain-English recommendations from weaknesses.
 * Returns array sorted by priority (critical first).
 */
export function buildRecommendations(weaknesses) {
  const REC_MAP = {
    mfa_admin: {
      title: 'Enforce MFA on all administrative accounts immediately',
      detail: 'Administrative accounts without MFA are the single highest-risk exposure in most organisations. Enable MFA enforcement via your identity provider (Entra ID, Okta, Google Workspace) for all accounts with elevated privileges. Consider phishing-resistant FIDO2 keys for privileged admins.',
      effort: 'Low',
      impact: 'Critical',
    },
    mfa_users: {
      title: 'Deploy MFA for all user accounts',
      detail: 'Enable MFA for all standard user accounts across email, VPN, and business applications. Prioritise phishing-resistant methods (FIDO2/WebAuthn) or authenticator apps over SMS OTP.',
      effort: 'Low',
      impact: 'High',
    },
    mfa_remote: {
      title: 'Require MFA on all remote access pathways',
      detail: 'All remote access routes including VPN, RDP, and SSH must require MFA. Pay particular attention to internet-facing RDP which is a primary ransomware entry vector.',
      effort: 'Low',
      impact: 'Critical',
    },
    mfa_type: {
      title: 'Upgrade from SMS OTP to phishing-resistant MFA',
      detail: 'SMS-based OTP is vulnerable to SIM-swapping and real-time phishing attacks. Migrate to TOTP authenticator apps as a minimum, or FIDO2 hardware keys for privileged users.',
      effort: 'Medium',
      impact: 'High',
    },
    pw_policy_exists: {
      title: 'Implement and technically enforce a password policy',
      detail: 'Document and technically enforce a password policy aligned with NCSC guidance: minimum 12+ characters, no mandatory rotation without breach evidence, ban known compromised passwords. Configure enforcement in your identity provider rather than relying on manual processes.',
      effort: 'Low',
      impact: 'High',
    },
    pw_min_length: {
      title: 'Increase minimum password length to at least 12 characters',
      detail: 'NCSC and NIST both recommend minimum 12 characters. Update your technical password policy settings in all identity providers and applications.',
      effort: 'Low',
      impact: 'Medium',
    },
    pw_breach_check: {
      title: 'Implement compromised credential detection',
      detail: 'Integrate Have I Been Pwned (HIBP) API or your identity provider\'s built-in breach detection to block use of known compromised passwords. Many modern IdPs (Entra ID, Okta) include this natively.',
      effort: 'Low',
      impact: 'Medium',
    },
    ac_least_privilege: {
      title: 'Enforce least-privilege access across all systems',
      detail: 'Conduct an access review to identify and remove excessive permissions. Implement role-based access control (RBAC) and ensure users only have the minimum permissions required for their current role. Address over-privileged accounts immediately.',
      effort: 'Medium',
      impact: 'High',
    },
    ac_jml: {
      title: 'Formalise and automate your Joiners/Movers/Leavers process',
      detail: 'Establish a documented JML process with defined SLAs for access revocation (target: same-day for leavers). Integrate with your HR system to trigger automated access changes via your identity provider.',
      effort: 'Medium',
      impact: 'High',
    },
    ac_review: {
      title: 'Conduct regular access rights reviews',
      detail: 'Schedule quarterly access reviews for privileged accounts and at least annual reviews for all users. Use your IdP reporting to identify dormant accounts, excessive permissions, and accounts without MFA.',
      effort: 'Low',
      impact: 'Medium',
    },
    ac_pam: {
      title: 'Eliminate shared administrative accounts',
      detail: 'Shared admin accounts prevent accountability and create a single high-value compromise target. Assign individual admin accounts, consider a PAM solution for privileged session management, and implement just-in-time access elevation.',
      effort: 'High',
      impact: 'Critical',
    },
    tls_version: {
      title: 'Disable TLS 1.0 and 1.1 across all services',
      detail: 'TLS 1.0 and 1.1 are deprecated and vulnerable. Configure all web servers, load balancers, and services to accept TLS 1.2 minimum (TLS 1.3 preferred). Review cipher suites to remove weak algorithms.',
      effort: 'Medium',
      impact: 'High',
    },
    cert_management: {
      title: 'Implement automated certificate lifecycle management',
      detail: 'Certificate expiry is a leading cause of outages and loss of encryption assurance. Implement Let\'s Encrypt with cert-manager (Kubernetes) or AWS Certificate Manager / Azure Key Vault for automated renewal. At minimum, maintain a tracked certificate inventory with expiry alerts.',
      effort: 'Medium',
      impact: 'Medium',
    },
    email_security: {
      title: 'Configure DMARC with a reject policy to prevent email spoofing',
      detail: 'Ensure SPF, DKIM, and DMARC are all configured. Upgrade DMARC from p=none or p=quarantine to p=reject to prevent domain impersonation. Use a DMARC reporting service (e.g. dmarcian, Valimail) to monitor and tune.',
      effort: 'Low',
      impact: 'High',
    },
    rest_databases: {
      title: 'Enable encryption at rest for all databases',
      detail: 'Enable database encryption (AES-256 or equivalent) for all databases containing sensitive data. Most cloud database services offer this natively (RDS, Azure SQL, Cloud SQL). Ensure encryption keys are managed via a KMS, not the database itself.',
      effort: 'Medium',
      impact: 'High',
    },
    rest_endpoints: {
      title: 'Enable full-disk encryption on all endpoints',
      detail: 'Enable BitLocker (Windows), FileVault (macOS), or equivalent on all laptops and desktop workstations. Enforce via MDM/Group Policy and ensure recovery keys are escrowed centrally — not stored on the device.',
      effort: 'Low',
      impact: 'High',
    },
    rest_keys: {
      title: 'Move encryption keys to a dedicated KMS or HSM',
      detail: 'Encryption keys stored in config files or environment variables are at high risk of exfiltration alongside compromised data. Migrate to a cloud KMS (AWS KMS, Azure Key Vault, Google Cloud KMS) or hardware security module (HSM) for production key management.',
      effort: 'High',
      impact: 'Critical',
    },
    backup_coverage: {
      title: 'Ensure all critical systems are included in backup scope',
      detail: 'Identify any critical systems not currently backed up and add them to your backup scope. Document RPO and RTO targets for each critical system and ensure backup schedules meet those targets.',
      effort: 'Medium',
      impact: 'High',
    },
    backup_immutable: {
      title: 'Implement immutable backup copies to protect against ransomware',
      detail: 'Without immutable or offline backups, ransomware can encrypt or delete your backups as well as your live data. Implement WORM (Write Once Read Many) storage, air-gapped copies, or cloud immutability features (AWS S3 Object Lock, Azure Immutable Blob Storage).',
      effort: 'Medium',
      impact: 'Critical',
    },
    backup_restore_test: {
      title: 'Test backup restoration regularly — at least annually',
      detail: 'Untested backups frequently fail when needed most. Schedule and document restore tests for all critical systems. Test the full restore process including data integrity verification, not just backup completion status.',
      effort: 'Low',
      impact: 'High',
    },
    log_coverage: {
      title: 'Expand security event logging to all critical systems',
      detail: 'Ensure all critical systems generate security-relevant logs including authentication events, privilege escalations, configuration changes, and application errors. Define a minimum logging standard and enforce it.',
      effort: 'Medium',
      impact: 'High',
    },
    log_centralised: {
      title: 'Implement centralised log management or SIEM',
      detail: 'Centralise logs from all systems into a SIEM or log management platform (Splunk, Microsoft Sentinel, Elastic SIEM, or AWS/Azure native). This enables correlation of events across systems to detect threats that individual system logs cannot reveal.',
      effort: 'High',
      impact: 'High',
    },
    log_alerting: {
      title: 'Implement automated alerting for security events',
      detail: 'Manual log review cannot provide timely detection. Configure automated alerts for high-risk events: failed login spikes, privilege escalations, impossible travel, large data transfers, and configuration changes. Consider a Managed Detection & Response (MDR) service if internal SOC capacity is limited.',
      effort: 'High',
      impact: 'High',
    },
    ir_plan: {
      title: 'Create or update your Incident Response Plan',
      detail: 'An IRP must define incident classification, escalation paths, internal and external communication procedures, evidence preservation steps, and recovery processes. Test the plan via tabletop exercise at least annually. NCSC provides free IRP guidance and templates.',
      effort: 'Medium',
      impact: 'High',
    },
    ir_playbooks: {
      title: 'Develop scenario-specific incident response playbooks',
      detail: 'Create specific playbooks for: ransomware, data breach/exfiltration, phishing compromise, insider threat, and supply chain incident. Each playbook should define immediate containment steps, escalation contacts, evidence collection, and business continuity actions.',
      effort: 'Medium',
      impact: 'High',
    },
    vuln_scanning: {
      title: 'Establish a regular vulnerability scanning programme',
      detail: 'Implement scheduled external and internal vulnerability scanning using tools such as Tenable, Qualys, Rapid7, or open-source alternatives (OpenVAS). Ensure scanning covers all internet-facing and critical internal assets. This platform does not perform scanning — use dedicated tooling.',
      effort: 'Medium',
      impact: 'High',
    },
    vuln_patch_cadence: {
      title: 'Accelerate critical patch deployment to within 14 days',
      detail: 'NCSC Cyber Essentials requires critical and high-severity patches applied within 14 days of release. Automate patching where possible (WSUS, AWS SSM Patch Manager, Intune). Prioritise internet-facing systems and systems processing sensitive data.',
      effort: 'Medium',
      impact: 'High',
    },
    tp_due_diligence: {
      title: 'Implement formal supplier security due diligence',
      detail: 'Require security questionnaires or evidence of security certification (ISO 27001, SOC 2, NCSC Cyber Essentials) for all significant suppliers. Prioritise suppliers with access to your data or systems. NCSC\'s supplier assurance questionnaire is a free starting point.',
      effort: 'Medium',
      impact: 'High',
    },
    tp_contractual: {
      title: 'Strengthen contractual security requirements for all suppliers',
      detail: 'Include minimum security requirements in all supplier contracts: data handling obligations, breach notification timelines (within 24-72 hours), right to audit, sub-processor restrictions, and security certification requirements. Engage legal counsel to review contract templates.',
      effort: 'Medium',
      impact: 'High',
    },
    dev_edr: {
      title: 'Deploy Endpoint Detection & Response (EDR) on all endpoints',
      detail: 'Basic anti-malware is insufficient against modern threats. Deploy an EDR solution (Microsoft Defender for Endpoint, CrowdStrike Falcon, SentinelOne, or equivalent) on all endpoints. EDR provides behavioural detection, threat hunting capability, and incident response tools that signature-based AV cannot.',
      effort: 'Medium',
      impact: 'High',
    },
    dev_security_training: {
      title: 'Establish an annual security awareness training programme',
      detail: 'Human error is the leading cause of security incidents. Implement mandatory annual security training covering phishing recognition, password hygiene, data handling, incident reporting, and social engineering. Track completion and follow up with non-completers.',
      effort: 'Low',
      impact: 'High',
    },
    dev_mdm: {
      title: 'Enforce Mobile Device Management for all corporate devices',
      detail: 'Deploy MDM (Microsoft Intune, Jamf, or equivalent) for all devices accessing corporate data. Enforce: full-disk encryption, screen lock, remote wipe capability, and compliance policies. Define and enforce a BYOD policy with clear controls for personal devices.',
      effort: 'Medium',
      impact: 'Medium',
    },
    cloud_cspm: {
      title: 'Implement Cloud Security Posture Management (CSPM)',
      detail: 'Enable native CSPM tools (AWS Security Hub + Config, Microsoft Defender for Cloud, GCP Security Command Center) or a third-party CSPM solution. Address critical findings immediately — public S3 buckets, open security groups, and misconfigured IAM policies are routinely exploited.',
      effort: 'Medium',
      impact: 'Critical',
    },
    cloud_public_exposure: {
      title: 'Audit and minimise public cloud exposure',
      detail: 'Immediately audit all publicly accessible cloud resources: storage buckets, databases, APIs, admin consoles. Restrict public access to only what is explicitly required. Use Infrastructure as Code (IaC) scanning (Checkov, tfsec) to prevent new misconfigurations being deployed.',
      effort: 'Medium',
      impact: 'Critical',
    },
    cloud_iam: {
      title: 'Eliminate long-lived cloud service account credentials',
      detail: 'Rotate or eliminate static service account keys. Migrate to workload identity federation, IAM roles (AWS), Managed Identities (Azure), or Workload Identity (GCP) to eliminate long-lived credentials entirely. Audit all service accounts and remove unnecessary ones.',
      effort: 'Medium',
      impact: 'High',
    },
    internal_transit: {
      title: 'Encrypt internal network traffic between services',
      detail: 'Enable mutual TLS (mTLS) between internal services. Use a service mesh (Istio, Linkerd) in Kubernetes environments. Ensure database connections use TLS. A flat trusted internal network provides no defence against lateral movement after initial compromise.',
      effort: 'High',
      impact: 'Medium',
    },
  };

  return weaknesses
    .map((w) => {
      const template = REC_MAP[w.questionId] || {
        title: `Address control gap: ${w.questionLabel}`,
        detail: `Current posture: "${w.answerLabel}". Review and improve controls in the ${w.categoryLabel} domain to address this identified weakness.`,
        effort: 'Medium',
        impact: w.severity.charAt(0).toUpperCase() + w.severity.slice(1),
      };

      return {
        id: `rec_${w.categoryId}_${w.questionId}`,
        priority: w.severity,
        priorityOrder: { critical: 0, high: 1, medium: 2, low: 3 }[w.severity] || 2,
        domain: w.categoryLabel,
        domainIcon: w.categoryIcon,
        title: template.title,
        detail: template.detail,
        effort: template.effort,
        impact: template.impact,
        frameworks: w.frameworks,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
    })
    .sort((a, b) => {
      if (a.priorityOrder !== b.priorityOrder) return a.priorityOrder - b.priorityOrder;
      return b.riskWeight - a.riskWeight;
    });
}

// ─── Assessment Progress ──────────────────────────────────────────────────────
/**
 * Calculate overall assessment completion progress.
 * Returns { answeredRequired, totalRequired, answeredAll, totalAll, percentRequired, percentAll }
 */
export function computeAssessmentProgress(responses) {
  let answeredRequired = 0;
  let totalRequired = 0;
  let answeredAll = 0;
  let totalAll = 0;
  const completedCategories = [];

  for (const cat of ASSESSMENT_CATEGORIES) {
    const catResponses = responses?.[cat.id] || {};
    let catRequired = 0;
    let catRequiredAnswered = 0;
    let catTotal = 0;
    let catAnswered = 0;

    for (const q of cat.questions) {
      totalAll++;
      catTotal++;
      if (q.required) {
        totalRequired++;
        catRequired++;
      }

      if (catResponses[q.id]) {
        answeredAll++;
        catAnswered++;
        if (q.required) {
          answeredRequired++;
          catRequiredAnswered++;
        }
      }
    }

    if (catRequired > 0 && catRequiredAnswered === catRequired) {
      completedCategories.push(cat.id);
    }
  }

  return {
    answeredRequired,
    totalRequired,
    answeredAll,
    totalAll,
    percentRequired: totalRequired > 0 ? Math.round((answeredRequired / totalRequired) * 100) : 0,
    percentAll: totalAll > 0 ? Math.round((answeredAll / totalAll) * 100) : 0,
    completedCategories,
  };
}

// ─── Full Score Computation ───────────────────────────────────────────────────
/**
 * Master function: compute all scoring outputs from assessment responses.
 * Call this when saving assessment results to storage.
 *
 * @param {object} responses  { [categoryId]: { [questionId]: answerValue } }
 * @param {object} organisation  Organisation from state (for context-sensitive scoring)
 * @returns Full scoring result object
 */
export function computeFullAssessmentResult(responses, organisation) {
  const overallScore = computeOverallScore(responses);
  const preventativeControl = computePreventativeControlScore(responses);
  const weaknesses = detectWeaknesses(responses);
  const riskItems = buildRiskRegister(weaknesses, organisation);
  const recommendations = buildRecommendations(weaknesses);
  const progress = computeAssessmentProgress(responses);
  const threshold = getScoreThreshold(overallScore);

  // Per-category breakdown
  const categoryScores = ASSESSMENT_CATEGORIES.map((cat) => ({
    categoryId: cat.id,
    categoryLabel: cat.label,
    categoryIcon: cat.icon,
    ...scoreCategoryResponses(cat.id, responses?.[cat.id] || {}),
    threshold: getScoreThreshold(
      scoreCategoryResponses(cat.id, responses?.[cat.id] || {}).percentage
    ),
  }));

  return {
    securityImplementationScore: overallScore,
    preventativeControlScore: preventativeControl.score,
    threshold,
    categoryScores,
    weaknesses,
    riskItems,
    recommendations,
    priorityActions: recommendations.filter((r) => r.priority === 'critical' || r.priority === 'high').slice(0, 10),
    progress,
    computedAt: new Date().toISOString(),
  };
}
