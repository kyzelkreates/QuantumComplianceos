/**
 * QUANTUM COMPLIANCE OS™ — quantumScoringEngine.js
 * Quantum Readiness Scoring Engine — Run 3
 * ==========================================
 * Pure functions only. No side effects. No localStorage access.
 * All state passed in; results returned for storage.js to persist.
 *
 * DEFENSIVE USE ONLY.
 * No live cryptographic attack testing. No offensive tools.
 * No "quantum-proof" claims — only readiness and migration assessment.
 *
 * References:
 *   NIST SP 800-208, FIPS 203/204/205
 *   NCSC Post-Quantum Cryptography Guidance (2024)
 *   ENISA Post-Quantum Cryptography Integration Study (2024)
 */

import { QUANTUM_ASSESSMENT_CATEGORIES, getQuantumCategoryById, NIST_PQC_STANDARDS, NCSC_MIGRATION_PHASES } from './quantumSchema.js';

// ─── Score Thresholds (quantum-specific labels) ───────────────────────────────
export const QUANTUM_SCORE_THRESHOLDS = {
  ADVANCED:     { min: 80, label: 'Advanced',       colour: '#10b981', icon: '🟢', ncscPhase: 3 },
  PROGRESSING:  { min: 60, label: 'Progressing',    colour: '#3b82f6', icon: '🔵', ncscPhase: 2 },
  EMERGING:     { min: 40, label: 'Emerging',       colour: '#f59e0b', icon: '🟡', ncscPhase: 2 },
  INITIAL:      { min: 20, label: 'Initial',        colour: '#f97316', icon: '🟠', ncscPhase: 1 },
  UNPREPARED:   { min: 0,  label: 'Unprepared',     colour: '#ef4444', icon: '🔴', ncscPhase: 1 },
};

export function getQuantumScoreThreshold(score) {
  if (score >= QUANTUM_SCORE_THRESHOLDS.ADVANCED.min)    return QUANTUM_SCORE_THRESHOLDS.ADVANCED;
  if (score >= QUANTUM_SCORE_THRESHOLDS.PROGRESSING.min) return QUANTUM_SCORE_THRESHOLDS.PROGRESSING;
  if (score >= QUANTUM_SCORE_THRESHOLDS.EMERGING.min)    return QUANTUM_SCORE_THRESHOLDS.EMERGING;
  if (score >= QUANTUM_SCORE_THRESHOLDS.INITIAL.min)     return QUANTUM_SCORE_THRESHOLDS.INITIAL;
  return QUANTUM_SCORE_THRESHOLDS.UNPREPARED;
}

// ─── Category Score ───────────────────────────────────────────────────────────
export function scoreQuantumCategory(categoryId, responses) {
  const category = getQuantumCategoryById(categoryId);
  if (!category) return { rawScore: 0, maxScore: 0, percentage: 0, answeredCount: 0, totalCount: 0 };

  let rawScore = 0;
  let maxScore = 0;
  let answeredCount = 0;
  const unanswered = [];

  for (const question of category.questions) {
    const answer = responses?.[question.id];
    maxScore += 4;
    if (answer) {
      const option = question.options.find((o) => o.value === answer);
      if (option) { rawScore += option.score; answeredCount++; }
      else unanswered.push(question.id);
    } else {
      unanswered.push(question.id);
    }
  }

  const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
  return {
    rawScore, maxScore, percentage, answeredCount,
    totalCount: category.questions.length,
    requiredCount: category.questions.filter((q) => q.required).length,
    unanswered,
    categoryWeight: category.weight,
  };
}

// ─── Overall Quantum Readiness Score (0–100) ──────────────────────────────────
export function computeQuantumReadinessScore(responses) {
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const cat of QUANTUM_ASSESSMENT_CATEGORIES) {
    const catR = responses?.[cat.id] || {};
    const result = scoreQuantumCategory(cat.id, catR);
    totalWeighted += result.percentage * cat.weight;
    totalWeight += cat.weight;
  }

  return totalWeight > 0 ? Math.round(totalWeighted / totalWeight) : 0;
}

// ─── Crypto-Agility Score (0–100) ─────────────────────────────────────────────
// Specifically measures agility to replace algorithms — subset of readiness
const AGILITY_QUESTIONS = [
  { catId: 'crypto_agility',    qId: 'agility_architecture' },
  { catId: 'crypto_agility',    qId: 'agility_dependency' },
  { catId: 'crypto_agility',    qId: 'agility_protocols' },
  { catId: 'key_rotation',      qId: 'key_rotation_speed' },
  { catId: 'key_rotation',      qId: 'key_hardcoded' },
  { catId: 'migration_planning', qId: 'migration_plan_status' },
  { catId: 'vendor_dependency', qId: 'vendor_lock_in' },
];

export function computeCryptoAgilityScore(responses) {
  let score = 0;
  let max = 0;
  let answered = 0;

  for (const { catId, qId } of AGILITY_QUESTIONS) {
    const cat = getQuantumCategoryById(catId);
    if (!cat) continue;
    const question = cat.questions.find((q) => q.id === qId);
    if (!question) continue;
    const answer = responses?.[catId]?.[qId];
    max += 4;
    if (answer) {
      const option = question.options.find((o) => o.value === answer);
      if (option) { score += option.score; answered++; }
    }
  }

  return {
    score: Math.round((score / Math.max(max, 1)) * 100),
    answeredCount: answered,
    totalCount: AGILITY_QUESTIONS.length,
  };
}

// ─── HNDL Risk Score (higher = worse) ────────────────────────────────────────
// Returns a 0–100 risk score (not a readiness score — inverted)
export function computeHndlRiskScore(responses, organisation) {
  const hndlR = responses?.hndl_risk || {};

  // Data shelf-life weight
  const shelfMap = { lt2yr: 0, '2to5yr': 20, '5to10yr': 50, '10to25yr': 85, gt25yr: 100, unknown: 60 };
  const shelf = shelfMap[hndlR.hndl_data_shelf_life] ?? 50;

  // Regulated data weight
  const regMap = { none: 0, commercial_only: 10, gdpr_health: 60, financial_legal: 60, national_security: 100, unknown: 40 };
  const regulated = regMap[hndlR.hndl_regulated_data] ?? 40;

  // Archive encryption
  const archMap = { pqc_or_sym256: 0, sym_key_via_rsa: 70, rsa_ecc_direct: 100, unknown: 60 };
  const archive = archMap[hndlR.hndl_archive_encryption] ?? 60;

  // Traffic exposure
  const trafficMap = { low_value_only: 0, assessed_acceptable: 10, high_value_assessed: 50, high_value_unassessed: 90, unknown: 50 };
  const traffic = trafficMap[hndlR.hndl_traffic_exposure] ?? 50;

  // Sensitivity multiplier from org profile
  const sensMultiplier = { public: 0.6, internal: 0.8, confidential: 1.0, restricted: 1.2, critical: 1.4 };
  const multiplier = sensMultiplier[organisation?.dataSensitivityLevel] || 1.0;

  const raw = (shelf * 0.35 + regulated * 0.25 + archive * 0.25 + traffic * 0.15) * multiplier;
  return Math.min(100, Math.round(raw));
}

// ─── Quantum Weakness Detection ───────────────────────────────────────────────
export function detectQuantumWeaknesses(responses) {
  const weaknesses = [];

  for (const cat of QUANTUM_ASSESSMENT_CATEGORIES) {
    const catR = responses?.[cat.id] || {};
    for (const question of cat.questions) {
      const answer = catR[question.id];
      if (!answer) continue;
      const option = question.options.find((o) => o.value === answer);
      if (!option || !option.isWeakness) continue;

      const severity = option.riskWeight >= 0.9 ? 'critical'
        : option.riskWeight >= 0.7 ? 'high'
        : option.riskWeight >= 0.4 ? 'medium'
        : 'low';

      weaknesses.push({
        categoryId:    cat.id,
        categoryLabel: cat.label,
        categoryIcon:  cat.icon,
        questionId:    question.id,
        questionLabel: question.label,
        answer,
        answerLabel:   option.label,
        riskWeight:    option.riskWeight,
        severity,
        nistAlignment: cat.nistAlignment,
        ncscRef:       cat.ncscRef,
        domain:        'quantum',
      });
    }
  }

  return weaknesses.sort((a, b) => b.riskWeight - a.riskWeight);
}

// ─── Quantum Risk Register Population ────────────────────────────────────────
export function buildQuantumRiskRegister(weaknesses, organisation, hndlRiskScore) {
  return weaknesses.map((w, i) => ({
    id:        `qrisk_${w.categoryId}_${w.questionId}`,
    ref:        `QR${String(i + 1).padStart(3, '0')}`,
    domain:     w.categoryLabel,
    domainIcon: w.categoryIcon,
    domainType: 'quantum',
    description: buildQuantumRiskDesc(w, hndlRiskScore),
    likelihood:  mapRiskWeightToLikelihood(w.riskWeight),
    impact:      mapQuantumSeverityToImpact(w.severity, organisation),
    inherentRisk: w.severity,
    controlGap:  w.answerLabel,
    nistAlignment: w.nistAlignment,
    ncscRef:     w.ncscRef,
    status:      'open',
    mitigationStatus: 'not_started',
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  }));
}

function buildQuantumRiskDesc(w, hndlRiskScore) {
  const hndlNote = w.categoryId === 'hndl_risk'
    ? ` HNDL composite risk score: ${hndlRiskScore}/100.`
    : '';
  return `[Quantum] ${w.categoryLabel}: ${w.questionLabel} — current posture: "${w.answerLabel}". Risk weighting: ${Math.round(w.riskWeight * 100)}%.${hndlNote}`;
}

function mapRiskWeightToLikelihood(rw) {
  return rw >= 0.9 ? 'Very Likely' : rw >= 0.7 ? 'Likely' : rw >= 0.4 ? 'Possible' : 'Unlikely';
}

function mapQuantumSeverityToImpact(severity, org) {
  // Quantum risks have escalating impact as data shelf-life increases
  const base = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  return base[severity] || 'Medium';
}

// ─── Migration Priority Engine ────────────────────────────────────────────────
/**
 * Determine PQC migration priorities based on weaknesses + context.
 * Returns ordered list of migration actions.
 */
export function buildQuantumMigrationPriorities(weaknesses, responses, organisation, hndlRiskScore) {
  const REC_MAP = {
    pke_awareness: {
      title: 'Conduct a full cryptographic asset inventory',
      detail: 'Enumerate all systems, applications, and protocols using public-key cryptography (RSA, ECDH, ECDSA, DH). This is the foundational step in any PQC migration programme. Use tools such as NIST\'s Cryptographic Module Validation Program (CMVP) and your network traffic analysis for TLS inspection. NCSC recommends beginning this inventory immediately.',
      effort: 'Medium', impact: 'Critical',
      nist: ['SP 800-208 §3.1'],
      ncsc: 'NCSC PQC Guidance: Step 1 — Discover',
    },
    pke_rsa_usage: {
      title: 'Document and prioritise all RSA usage for migration',
      detail: 'Create a prioritised registry of all RSA usage. Prioritise: (1) internet-facing key exchange, (2) systems handling long-lived sensitive data, (3) code signing infrastructure. Target migration to ML-KEM (FIPS 203) for key exchange and ML-DSA (FIPS 204) for signatures.',
      effort: 'High', impact: 'Critical',
      nist: ['FIPS 203', 'FIPS 204', 'SP 800-208'],
      ncsc: 'NCSC: RSA is quantum-vulnerable — begin migration planning now',
    },
    pke_ecc_usage: {
      title: 'Document and prioritise all ECC usage for migration',
      detail: 'ECC (ECDH, ECDSA) is equally vulnerable to Shor\'s algorithm as RSA. Map all ECC usage and plan migration to ML-KEM (FIPS 203) for key exchange and ML-DSA (FIPS 204) or SLH-DSA (FIPS 205) for signatures. ECC P-256 and P-384 are both quantum-vulnerable.',
      effort: 'High', impact: 'Critical',
      nist: ['FIPS 203', 'FIPS 204', 'SP 800-208'],
      ncsc: 'NCSC: All ECC variants are quantum-vulnerable — no exceptions',
    },
    pke_internet_facing: {
      title: 'Deploy hybrid PQC key exchange on all internet-facing services',
      detail: 'Internet-facing TLS is the highest-priority HNDL target. Deploy hybrid key exchange (X25519 + ML-KEM or P-256 + ML-KEM) on all public-facing web services, APIs, and email gateways. Modern TLS 1.3 stacks support hybrid PQC via IANA-registered groups. This provides quantum-safe forward secrecy for all new connections immediately.',
      effort: 'High', impact: 'Critical',
      nist: ['FIPS 203', 'SP 800-208 §4'],
      ncsc: 'NCSC: Prioritise internet-facing services for hybrid deployment',
    },
    cert_inventory_completeness: {
      title: 'Build a complete certificate and key inventory',
      detail: 'Deploy a Certificate Lifecycle Management (CLM) tool (DigiCert CertCentral, Venafi, Keyfactor) to achieve full visibility of all certificates including key type, algorithm, and key length. This is prerequisite to identifying all quantum-vulnerable certificates. Aim for automated discovery covering internal CAs, cloud PKI, and third-party certificates.',
      effort: 'Medium', impact: 'High',
      nist: ['SP 800-57 Part 1', 'SP 800-208 §3.1'],
      ncsc: 'NCSC: Certificate inventory is a prerequisite for migration planning',
    },
    cert_key_types: {
      title: 'Plan certificate migration to PQC or hybrid algorithms',
      detail: 'Develop a certificate migration plan targeting ML-DSA (FIPS 204) for new certificate issuance. In the interim, deploy hybrid certificates (classical + ML-DSA) where CA/browser support allows. Engage your CA vendor for their PQC issuance timeline. Internal PKI should begin piloting PQC certificate issuance immediately.',
      effort: 'High', impact: 'High',
      nist: ['FIPS 204', 'FIPS 205', 'SP 800-208'],
      ncsc: 'NCSC: Plan for hybrid cert deployment ahead of full PQC availability',
    },
    key_rotation_freq: {
      title: 'Implement automated cryptographic key rotation',
      detail: 'Implement automated key rotation for all asymmetric keys using a cloud KMS (AWS KMS, Azure Key Vault, Google Cloud KMS) or HashiCorp Vault. Regular rotation limits exposure from any single key compromise and builds the operational muscle memory needed for rapid PQC migration when required.',
      effort: 'Medium', impact: 'High',
      nist: ['SP 800-57 Part 1 §5.3'],
      ncsc: 'NCSC: Automated key rotation is a prerequisite for rapid algorithm migration',
    },
    key_rotation_speed: {
      title: 'Build an emergency key rotation capability',
      detail: 'Develop and test an emergency cryptographic key rotation runbook capable of rotating all keys across all systems within 24–72 hours. This capability is critical for response to algorithm compromise announcements — similar to how organisations responded to Heartbleed and POODLE.',
      effort: 'High', impact: 'High',
      nist: ['SP 800-208 §4.2'],
      ncsc: 'NCSC: Emergency rotation capability is critical for quantum transition readiness',
    },
    key_hardcoded: {
      title: 'Eliminate hardcoded cryptographic keys and algorithm identifiers',
      detail: 'Scan all codebases for hardcoded cryptographic keys, algorithm names, and key sizes (e.g. "RSA/2048", hardcoded moduli, embedded certificates). Use SAST tools with cryptographic detection rules. Refactor to use configurable crypto providers, environment-sourced keys, and abstracted algorithm references. Hardcoded crypto is the primary blocker to rapid PQC migration.',
      effort: 'High', impact: 'Critical',
      nist: ['SP 800-208 §4.1', 'NIST IR 8547'],
      ncsc: 'NCSC: Hardcoded crypto is identified as a critical migration barrier',
    },
    hndl_data_shelf_life: {
      title: 'Prioritise PQC migration for long-lived sensitive data',
      detail: 'Data requiring confidentiality beyond 5–10 years is at significant harvest-now-decrypt-later (HNDL) risk. Immediately prioritise: (1) protecting key exchange for systems transmitting this data using hybrid PQC, (2) re-encrypting archived data holding long-term sensitive information with AES-256 wrapped by ML-KEM keys, and (3) assessing what historical encrypted traffic may already have been collected.',
      effort: 'High', impact: 'Critical',
      nist: ['NIST IR 8413', 'SP 800-208 §2.4'],
      ncsc: 'NCSC: HNDL is a present-day threat — act now for long-lived data',
    },
    hndl_regulated_data: {
      title: 'Protect regulated data categories from HNDL attack',
      detail: 'Regulated and special-category data (health records, legal privilege, financial data) is a priority target for nation-state HNDL attacks. Immediately deploy hybrid PQC key exchange for all systems transmitting this data. Review what historical archives of this data exist and assess re-encryption options.',
      effort: 'High', impact: 'Critical',
      nist: ['NIST IR 8413', 'FIPS 203'],
      ncsc: 'NCSC: Regulated data is highest priority for HNDL mitigation',
    },
    hndl_archive_encryption: {
      title: 'Re-encrypt critical archives with quantum-resistant symmetric encryption',
      detail: 'Archives where bulk data is protected by RSA or ECC (even as a key-wrapping mechanism) are vulnerable to HNDL attack. Re-encrypt critical archives using AES-256 with keys protected by ML-KEM (FIPS 203) rather than RSA. Prioritise archives containing regulated or long-lived confidential data.',
      effort: 'High', impact: 'Critical',
      nist: ['FIPS 203', 'SP 800-208 §4.3'],
      ncsc: 'NCSC: Re-encryption of archives is a critical early migration step',
    },
    agility_architecture: {
      title: 'Refactor cryptographic implementations for algorithm agility',
      detail: 'Architect systems so cryptographic algorithms are selected via a configurable abstraction layer rather than being hardcoded. Use provider patterns (JCA/JCE in Java, OpenSSL EVP in C/C++, .NET CNG, Go crypto/tls config). This is the single most impactful architectural change for enabling rapid PQC migration and is recommended as an immediate action regardless of quantum timelines.',
      effort: 'High', impact: 'Critical',
      nist: ['NIST IR 8547', 'SP 800-208 §4.1'],
      ncsc: 'NCSC: Crypto-agility is the #1 architectural prerequisite for PQC transition',
    },
    agility_dependency: {
      title: 'Update cryptographic libraries to PQC-capable versions',
      detail: 'Ensure all cryptographic libraries are current: OpenSSL 3.x (supports ML-KEM/Kyber via OQS Provider), BoringSSL (Google), liboqs (Open Quantum Safe), or Bouncy Castle 1.8+ (Java). Library currency is prerequisite for any PQC deployment. Audit all transitive dependencies for outdated crypto library usage.',
      effort: 'Medium', impact: 'High',
      nist: ['SP 800-208 §4.1'],
      ncsc: 'NCSC: PQC-capable libraries are a prerequisite for any technical migration',
    },
    agility_protocols: {
      title: 'Enable PQC extension support in TLS and other protocols',
      detail: 'Ensure TLS 1.3 is deployed (prerequisite for PQC extensions). Test hybrid key exchange groups (X25519MLKEM768, SecP256r1MLKEM768) in your TLS stack. For SSH, test PQC key exchange algorithms in OpenSSH 9.0+ (sntrup761x25519). For code signing, test ML-DSA signing in your CI/CD pipeline.',
      effort: 'Medium', impact: 'High',
      nist: ['FIPS 203', 'FIPS 204', 'SP 800-208'],
      ncsc: 'NCSC: Protocol-level hybrid PQC is available now for TLS and SSH',
    },
    vendor_pqc_assessed: {
      title: 'Conduct PQC vendor due diligence for all critical suppliers',
      detail: 'Request PQC migration roadmaps from: cloud providers (AWS, Azure, GCP all have PQC programmes), HSM vendors (Thales, Utimaco, nCipher), PKI/CA vendors, VPN/network vendors, and any vendor providing cryptographic services. Include PQC readiness as a supplier assessment criterion. Escalate dependencies on vendors with no credible PQC roadmap.',
      effort: 'Medium', impact: 'High',
      nist: ['SP 800-208 §5'],
      ncsc: 'NCSC: Supply chain PQC readiness is a key migration dependency',
    },
    vendor_lock_in: {
      title: 'Reduce proprietary cryptographic dependencies',
      detail: 'Proprietary HSMs, custom crypto modules, or vendor-specific PKI with no PQC roadmap are critical migration blockers. Engage vendors immediately for their PQC support timelines. Begin architectural planning to replace or supplement proprietary components with open-standards alternatives that support PQC.',
      effort: 'High', impact: 'High',
      nist: ['SP 800-208 §4.1', 'NIST IR 8547'],
      ncsc: 'NCSC: Proprietary crypto dependencies are a major migration risk factor',
    },
    migration_plan_status: {
      title: 'Develop a formal PQC migration roadmap',
      detail: 'Develop a structured PQC migration roadmap aligned to NCSC\'s four phases: (1) Discover & Classify, (2) Plan & Prioritise, (3) Pilot Hybrid Approaches, (4) Full Migration. Set milestones, assign owners, and align with the NIST SP 800-208 migration guidance. Brief the CISO and board on the programme. NCSC guidance and the NIST PQC Migration Playbook are freely available.',
      effort: 'Medium', impact: 'Critical',
      nist: ['SP 800-208', 'NIST IR 8413'],
      ncsc: 'NCSC: A formal migration roadmap is a mandatory first step',
    },
    migration_exec_sponsorship: {
      title: 'Secure board-level sponsorship for PQC migration',
      detail: 'PQC migration is a multi-year, cross-organisational programme requiring sustained investment. Brief the board on the quantum threat, HNDL risk, and NCSC/NIST guidance. Secure explicit executive sponsorship and multi-year budget commitment. Frame as a risk management imperative — analogous to Y2K in scope but more technically complex.',
      effort: 'Low', impact: 'Critical',
      nist: ['SP 800-208 §6'],
      ncsc: 'NCSC: Executive awareness and sponsorship is critical for programme success',
    },
    migration_nist_awareness: {
      title: 'Train teams on NIST PQC standards (FIPS 203, 204, 205)',
      detail: 'Ensure security architects, developers, and cryptography-adjacent staff understand the three finalised NIST PQC standards: FIPS 203 (ML-KEM/Kyber — key exchange), FIPS 204 (ML-DSA/Dilithium — digital signatures), FIPS 205 (SLH-DSA/SPHINCS+ — stateless hash-based signatures). NIST publishes all standards freely. Consider specialist PQC training from SANS, (ISC)², or academic programmes.',
      effort: 'Low', impact: 'High',
      nist: ['FIPS 203', 'FIPS 204', 'FIPS 205'],
      ncsc: 'NCSC: Technical awareness is prerequisite to successful migration',
    },
    migration_hybrid_tested: {
      title: 'Begin hybrid PQC testing in non-production environments',
      detail: 'Pilot hybrid PQC schemes immediately using Open Quantum Safe (liboqs) or cloud provider PQC previews (AWS Certificate Manager, Azure hybrid PQC TLS). Hybrid schemes combine classical (X25519, P-256) with PQC (ML-KEM) algorithms, providing protection against both classical and quantum attacks. Test in staging before production deployment.',
      effort: 'Medium', impact: 'High',
      nist: ['FIPS 203', 'SP 800-208 §4.2'],
      ncsc: 'NCSC: Hybrid deployment is the recommended near-term migration strategy',
    },
    posture_internal_expertise: {
      title: 'Build or acquire post-quantum cryptography expertise',
      detail: 'PQC migration requires specialist knowledge distinct from general security expertise. Options: (1) train existing cryptography staff via NIST/SANS/academic PQC courses, (2) engage specialist PQC consultants (ISARA, PQShield, evolutionQ, SandboxAQ), (3) create a dedicated PQC programme team. Lack of expertise is the most common PQC migration failure mode.',
      effort: 'High', impact: 'High',
      nist: ['SP 800-208 §6'],
      ncsc: 'NCSC: Internal expertise or trusted advisor engagement is a critical success factor',
    },
    posture_timeline: {
      title: 'Establish and commit to a PQC migration target timeline',
      detail: 'NCSC guidance and NIST SP 800-208 both recommend critical systems be migrated well before 2030. Set formal target dates: cryptographic inventory complete by Q4 2025, hybrid pilots in critical systems by Q2 2026, all internet-facing services migrated by 2027, full enterprise migration by 2029. Document these targets and track progress quarterly.',
      effort: 'Low', impact: 'Critical',
      nist: ['SP 800-208 §2.3'],
      ncsc: 'NCSC: 2030 is the NCSC guidance target — plan backward from this date',
    },
  };

  return weaknesses
    .map((w) => {
      const template = REC_MAP[w.questionId] || {
        title: `Address quantum readiness gap: ${w.questionLabel}`,
        detail: `Current posture: "${w.answerLabel}". Review and improve your quantum readiness in the ${w.categoryLabel} domain. Consult NIST SP 800-208 and NCSC Post-Quantum Cryptography Guidance for specific remediation steps.`,
        effort: 'Medium', impact: w.severity.charAt(0).toUpperCase() + w.severity.slice(1),
        nist: w.nistAlignment || [],
        ncsc: w.ncscRef || '',
      };

      return {
        id:           `qrec_${w.categoryId}_${w.questionId}`,
        priority:     w.severity,
        priorityOrder: { critical: 0, high: 1, medium: 2, low: 3 }[w.severity] ?? 2,
        domain:       w.categoryLabel,
        domainIcon:   w.categoryIcon,
        domainType:   'quantum',
        title:        template.title,
        detail:       template.detail,
        effort:       template.effort,
        impact:       template.impact,
        nistAlignment: template.nist,
        ncscRef:       template.ncsc,
        status:        'open',
        createdAt:     new Date().toISOString(),
      };
    })
    .sort((a, b) => {
      if (a.priorityOrder !== b.priorityOrder) return a.priorityOrder - b.priorityOrder;
      return b.riskWeight - a.riskWeight;
    });
}

// ─── Assessment Progress ──────────────────────────────────────────────────────
export function computeQuantumAssessmentProgress(responses) {
  let answeredRequired = 0;
  let totalRequired = 0;
  let answeredAll = 0;
  let totalAll = 0;
  const completedCategories = [];

  for (const cat of QUANTUM_ASSESSMENT_CATEGORIES) {
    const catR = responses?.[cat.id] || {};
    let catRequired = 0;
    let catRequiredAnswered = 0;

    for (const q of cat.questions) {
      totalAll++;
      if (q.required) { totalRequired++; catRequired++; }
      if (catR[q.id]) {
        answeredAll++;
        if (q.required) { answeredRequired++; catRequiredAnswered++; }
      }
    }

    if (catRequired > 0 && catRequiredAnswered === catRequired) {
      completedCategories.push(cat.id);
    }
  }

  return {
    answeredRequired, totalRequired, answeredAll, totalAll,
    percentRequired: totalRequired > 0 ? Math.round((answeredRequired / totalRequired) * 100) : 0,
    percentAll: totalAll > 0 ? Math.round((answeredAll / totalAll) * 100) : 0,
    completedCategories,
  };
}

// ─── NCSC Phase Alignment ─────────────────────────────────────────────────────
export function getNcscPhaseAlignment(quantumScore) {
  const threshold = getQuantumScoreThreshold(quantumScore);
  return NCSC_MIGRATION_PHASES.find((p) => p.phase === threshold.ncscPhase)
    || NCSC_MIGRATION_PHASES[0];
}

// ─── Overall Readiness Score (Security + Quantum combined) ────────────────────
export function computeOverallReadinessScore(securityScore, quantumScore) {
  // Security weighted at 60%, quantum at 40% for overall score
  if (securityScore == null && quantumScore == null) return null;
  const sec = securityScore ?? 0;
  const qua = quantumScore ?? 0;
  return Math.round(sec * 0.6 + qua * 0.4);
}

// ─── Full Quantum Assessment Result ──────────────────────────────────────────
export function computeFullQuantumResult(responses, organisation) {
  const quantumReadinessScore   = computeQuantumReadinessScore(responses);
  const cryptoAgilityResult     = computeCryptoAgilityScore(responses);
  const hndlRiskScore           = computeHndlRiskScore(responses, organisation);
  const weaknesses              = detectQuantumWeaknesses(responses);
  const riskItems               = buildQuantumRiskRegister(weaknesses, organisation, hndlRiskScore);
  const migrationPriorities     = buildQuantumMigrationPriorities(weaknesses, responses, organisation, hndlRiskScore);
  const progress                = computeQuantumAssessmentProgress(responses);
  const threshold               = getQuantumScoreThreshold(quantumReadinessScore);
  const ncscPhase               = getNcscPhaseAlignment(quantumReadinessScore);

  const categoryScores = QUANTUM_ASSESSMENT_CATEGORIES.map((cat) => ({
    categoryId:    cat.id,
    categoryLabel: cat.label,
    categoryIcon:  cat.icon,
    ...scoreQuantumCategory(cat.id, responses?.[cat.id] || {}),
    threshold:     getQuantumScoreThreshold(
      scoreQuantumCategory(cat.id, responses?.[cat.id] || {}).percentage
    ),
  }));

  return {
    quantumReadinessScore,
    cryptoAgilityScore:   cryptoAgilityResult.score,
    hndlRiskScore,
    threshold,
    ncscPhase,
    categoryScores,
    weaknesses,
    riskItems,
    migrationPriorities,
    priorityActions: migrationPriorities.filter((r) => ['critical', 'high'].includes(r.priority)).slice(0, 10),
    progress,
    computedAt: new Date().toISOString(),
  };
}
