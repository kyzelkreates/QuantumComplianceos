/**
 * QUANTUM COMPLIANCE OS™ — copilotEngine.js
 * Run 8: Local-First Consultant Copilot Engine
 * =============================================
 * Deterministic template-based recommendation engine.
 * Uses stored assessment data ONLY — no external AI API calls.
 * No live scanning. No offensive logic. Defensive guidance only.
 *
 * All outputs are clearly labelled "Based on supplied assessment data."
 * Generated text is guidance only — not legally binding advice.
 *
 * ARCHITECTURE:
 *   - Pure functions (no state mutations)
 *   - All input from existing storage.js state shape
 *   - All output is plain text / structured objects
 *   - No localStorage access here — caller passes state
 *   - No side effects
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const COPILOT_DISCLAIMER =
  'This Copilot uses local assessment data and deterministic templates to help draft defensive readiness ' +
  'guidance. It does not perform live testing, offensive scanning, exploitation, or guarantee compliance. ' +
  'All recommendations should be reviewed by a qualified security professional before use.';

export const ASSESSMENT_BASIS = 'Based on the supplied assessment data';

const TONE_OPENERS = {
  professional:  'Based on the supplied assessment data,',
  plain:         'Looking at the assessment results,',
  technical:     'Analysis of the supplied assessment responses indicates that',
  sales:         'The assessment findings show that',
};

const AUDIENCE_CONTEXT = {
  'SME business owner':    'non-technical business audience',
  'technical manager':     'technical management audience',
  'board/investor':        'board and investor audience',
  'consultant internal note': 'internal consultant reference',
};

// ─── Score Interpretation ─────────────────────────────────────────────────────

export function interpretScore(score) {
  if (score == null) return { band: 'unknown', label: 'Not assessed', colour: 'muted', urgency: 'low', maturity: 'Unknown' };
  if (score >= 80) return { band: 'stronger',     label: 'Stronger Readiness',     colour: 'success', urgency: 'low',      maturity: 'Developing toward stronger posture' };
  if (score >= 60) return { band: 'developing',   label: 'Developing',             colour: 'info',    urgency: 'medium',   maturity: 'Controls in place but gaps remain' };
  if (score >= 40) return { band: 'improvement',  label: 'Needs Improvement',      colour: 'warning', urgency: 'high',     maturity: 'Multiple control gaps identified' };
  return             { band: 'concern',      label: 'High Concern',           colour: 'danger',  urgency: 'critical', maturity: 'Significant readiness gaps — immediate action recommended' };
}

export function interpretQuantumScore(score) {
  if (score == null) return { band: 'unknown', label: 'Not assessed', hndlLevel: 'Unknown', migrationUrgency: 'Unknown' };
  if (score >= 70) return { band: 'aware',      label: 'Quantum-Aware Posture',      hndlLevel: 'Lower',    migrationUrgency: 'Plan and monitor' };
  if (score >= 45) return { band: 'developing', label: 'Migration Planning Started', hndlLevel: 'Moderate', migrationUrgency: 'Accelerate planning' };
  if (score >= 20) return { band: 'exposed',    label: 'Significant Exposure',       hndlLevel: 'Elevated', migrationUrgency: 'Prioritise migration planning' };
  return             { band: 'critical',    label: 'Critical Quantum Exposure',  hndlLevel: 'High',     migrationUrgency: 'Urgent — begin inventory and planning immediately' };
}

// ─── Snapshot Builder ─────────────────────────────────────────────────────────

/**
 * buildClientRiskSnapshot — assembles all relevant data from a state object
 * into a clean, flat snapshot that all generation functions consume.
 * @param {object} state — a full storage.js state object
 * @returns {object} snapshot
 */
export function buildClientRiskSnapshot(state) {
  if (!state) return null;

  const org         = state.organisation || {};
  const systems     = (state.systemProfiles || []).filter((s) => !s.archived);
  const sa          = state.assessmentState?.securityAssessment || {};
  const qr          = state.assessmentState?.quantumReadiness   || {};
  const risks       = state.riskModel?.riskEntries || [];
  const recs        = state.recommendationModel?.recommendations || [];
  const actions     = state.recommendationModel?.priorityActions || [];
  const evidence    = state.evidencePack?.items || [];
  const reports     = state.reportModel?.history || [];

  // Scores — from history snapshot (most reliable) or assessmentState
  const latestReport = reports[reports.length - 1];
  const snap         = latestReport?.scoreSnapshot || {};

  const secScore     = snap.securityImplementationScore ?? sa.securityImplementationScore ?? null;
  const qScore       = snap.quantumReadinessScore       ?? qr.quantumReadinessScore       ?? null;
  const overallScore = snap.overallReadinessScore       ?? null;
  const prevScore    = sa.preventativeControlScore ?? null;
  const agilityScore = qr.cryptoAgilityScore ?? null;
  const hndlScore    = qr.hndlRiskScore ?? null;

  // Risk counts
  const openRisks    = risks.filter((r) => r.status === 'open' || r.status === 'in_progress');
  const critRisks    = openRisks.filter((r) => r.inherentRisk === 'critical');
  const highRisks    = openRisks.filter((r) => r.inherentRisk === 'high');
  const medRisks     = openRisks.filter((r) => r.inherentRisk === 'medium');
  const lowRisks     = openRisks.filter((r) => r.inherentRisk === 'low');

  // Evidence status
  const missingEvidence   = evidence.filter((e) => e.status === 'missing');
  const plannedEvidence   = evidence.filter((e) => e.status === 'planned');
  const incompleteEvidence = evidence.filter((e) => e.status === 'in_progress' || e.status === 'needs_review');
  const completeEvidence  = evidence.filter((e) => e.status === 'complete');

  // Quantum responses
  const qResponses   = qr.responses || {};
  const rsaUse       = qResponses.rsa_use;
  const eccUse       = qResponses.ecc_use;
  const tlsVersion   = qResponses.tls_version;
  const dataShelfLife = qResponses.data_shelf_life;
  const hndlAwareness = qResponses.hndl_awareness;
  const pqcAwareness  = qResponses.pqc_awareness;
  const migrationPlan = qResponses.migration_plan;
  const cryptoAgility = qResponses.crypto_agility;
  const certInventory = qResponses.cert_inventory;

  // Security responses
  const sResponses   = sa.responses || {};
  const mfaCoverage  = sResponses.mfa_coverage;
  const encryptRest  = sResponses.encryption_rest;
  const backupTested = sResponses.backup_tested;
  const incidentPlan = sResponses.incident_plan;
  const irTested     = sResponses.ir_tested;
  const logging      = sResponses.logging;
  const siem         = sResponses.siem;

  // Critical systems
  const critSystems  = systems.filter((s) => s.criticality === 'critical');
  const topSystems   = systems.slice(0, 3).map((s) => s.name);

  // Top recs by priority
  const critRecs     = recs.filter((r) => r.priority === 'critical' || r.priority === 'high').slice(0, 5);
  const topActions   = actions.filter((a) => a.urgency === 'critical' || a.urgency === 'high').slice(0, 5);

  // Compliance needs
  const complianceNeeds = org.complianceNeeds || [];
  const hasGDPR       = complianceNeeds.some((n) => n.toLowerCase().includes('gdpr'));
  const hasISO27001   = complianceNeeds.some((n) => n.toLowerCase().includes('27001'));
  const hasNCE        = complianceNeeds.some((n) => n.toLowerCase().includes('cyber essentials'));
  const hasNHS        = complianceNeeds.some((n) => n.toLowerCase().includes('nhs') || n.toLowerCase().includes('dspt'));

  // Data shelf life label
  const SHELF_LIFE_LABELS = {
    over_20_years: 'over 20 years',
    over_10_years: 'over 10 years',
    '3_to_7_years': '3–7 years',
    under_3_years: 'under 3 years',
    unknown: 'unknown retention period',
  };
  const shelfLifeLabel = SHELF_LIFE_LABELS[dataShelfLife] || (dataShelfLife ? dataShelfLife.replace(/_/g, ' ') : 'an unknown period');

  return {
    // Identity
    orgName:           org.name || 'This organisation',
    sector:            org.sector || 'Unknown sector',
    size:              org.size || '',
    country:           org.country || '',
    dataSensitivity:   org.dataSensitivityLevel || '',
    complianceNeeds,
    hasGDPR, hasISO27001, hasNCE, hasNHS,
    notes:             org.notes || '',

    // Scores
    secScore, qScore, overallScore, prevScore, agilityScore, hndlScore,
    secInterp:   interpretScore(secScore),
    qInterp:     interpretQuantumScore(qScore),
    overallInterp: interpretScore(overallScore),
    hasSecAssessment:  sa.status === 'complete',
    hasQrAssessment:   qr.status === 'complete',

    // Systems
    systems, critSystems, topSystems,
    systemCount:  systems.length,
    critSystemCount: critSystems.length,

    // Risks
    risks, openRisks, critRisks, highRisks, medRisks, lowRisks,
    topRisks: [...critRisks, ...highRisks].slice(0, 5),

    // Recs & actions
    recs, critRecs, topActions,

    // Evidence
    evidence, missingEvidence, plannedEvidence, incompleteEvidence, completeEvidence,
    evidenceTotal: evidence.length,
    evidenceCompleteCount: completeEvidence.length,

    // Quantum specifics
    rsaUse, eccUse, tlsVersion, dataShelfLife, shelfLifeLabel,
    hndlAwareness, pqcAwareness, migrationPlan, cryptoAgility, certInventory,

    // Security specifics
    mfaCoverage, encryptRest, backupTested, incidentPlan, irTested, logging, siem,

    // Flags
    hasMFAGap:     !mfaCoverage || mfaCoverage === 'none' || mfaCoverage === 'partial_senior',
    hasEncryptGap: !encryptRest || encryptRest === 'no' || encryptRest === 'none',
    hasBackupGap:  backupTested === 'no' || !backupTested,
    hasIRGap:      incidentPlan === 'no' || !incidentPlan,
    hasLoggingGap: !logging || logging === 'none',
    hasRSA:        rsaUse && rsaUse !== 'no',
    hasECC:        eccUse && eccUse !== 'no' && eccUse !== 'unknown',
    hasHNDLConcern: dataShelfLife === 'over_20_years' || dataShelfLife === 'over_10_years',
    hasMigrationPlan: migrationPlan === 'active' || migrationPlan === 'started',
    hasCryptoAgility: cryptoAgility === 'yes' || cryptoAgility === 'partial',
    hasCertInventory: certInventory === 'full' || certInventory === 'partial',

    // Reports
    reports, latestReport,
    hasReports: reports.length > 0,
    reportCount: reports.length,
  };
}

// ─── Executive Summary Draft ──────────────────────────────────────────────────

/**
 * generateExecutiveSummaryDraft
 * Non-technical, client-facing executive summary for business decision-makers.
 */
export function generateExecutiveSummaryDraft(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available. Complete an assessment to generate this summary.]';

  const { tone = 'professional', audience = 'SME business owner', includeQuantumNotes = true } = settings;
  const opener = TONE_OPENERS[tone] || TONE_OPENERS.professional;
  const { orgName, sector, secScore, qScore, overallScore, secInterp, qInterp, overallInterp,
          critRisks, highRisks, topRisks, critRecs, missingEvidence, hasSecAssessment,
          hasQrAssessment, complianceNeeds, shelfLifeLabel, hasHNDLConcern } = snapshot;

  const lines = [];

  lines.push(`EXECUTIVE SUMMARY — ${orgName.toUpperCase()}`);
  lines.push(`Prepared for: ${AUDIENCE_CONTEXT[audience] || audience}`);
  lines.push(`Assessment basis: Supplied assessment responses (self-reported). Defensive planning use only.`);
  lines.push('');

  // Overall posture
  if (overallScore != null) {
    lines.push(`OVERALL READINESS POSTURE`);
    lines.push(`${opener} ${orgName} has an overall readiness score of ${overallScore}/100, placing the organisation in the "${overallInterp.label}" band.`);
  } else if (secScore != null) {
    lines.push(`SECURITY IMPLEMENTATION POSTURE`);
    lines.push(`${opener} ${orgName} has a security implementation score of ${secScore}/100, placing it in the "${secInterp.label}" band.`);
  } else {
    lines.push(`POSTURE OVERVIEW`);
    lines.push(`An assessment has not yet been fully completed for ${orgName}. The summary below reflects available data only.`);
  }
  lines.push('');

  // Strengths
  const strengths = _deriveStrengths(snapshot);
  if (strengths.length > 0) {
    lines.push(`KEY STRENGTHS`);
    strengths.forEach((s) => lines.push(`  • ${s}`));
    lines.push('');
  }

  // Key concerns
  const concerns = _deriveKeyConcerns(snapshot);
  if (concerns.length > 0) {
    lines.push(`KEY CONCERNS`);
    concerns.slice(0, 5).forEach((c) => lines.push(`  • ${c}`));
    lines.push('');
  }

  // Risk summary
  if (topRisks.length > 0) {
    lines.push(`RISK SUMMARY`);
    lines.push(`The assessment has identified ${critRisks.length} critical and ${highRisks.length} high-priority risk items that require management attention.`);
    topRisks.slice(0, 3).forEach((r) => {
      lines.push(`  • ${r.domain}: ${r.controlGap?.slice(0, 120) || 'Risk identified — see risk register.'}${(r.controlGap?.length || 0) > 120 ? '…' : ''}`);
    });
    lines.push('');
  }

  // Quantum concern
  if (includeQuantumNotes && hasQrAssessment) {
    lines.push(`POST-QUANTUM READINESS`);
    if (qScore != null) {
      lines.push(`The quantum-readiness score is ${qScore}/100 (${qInterp.label}).`);
    }
    if (hasHNDLConcern) {
      lines.push(`Data retained for ${shelfLifeLabel} is at elevated risk from harvest-now-decrypt-later (HNDL) attacks — adversaries may be collecting encrypted data today to decrypt when quantum computing matures. This represents a time-sensitive planning concern.`);
    } else {
      lines.push(`While immediate HNDL risk appears lower given data retention periods, organisations should begin post-quantum migration planning now given NIST's publication of post-quantum cryptography standards (FIPS 203/204/205).`);
    }
    lines.push('');
  }

  // Priority next steps
  if (critRecs.length > 0) {
    lines.push(`PRIORITY NEXT STEPS`);
    critRecs.slice(0, 4).forEach((r, i) => {
      lines.push(`  ${i + 1}. ${r.title} (${r.timeframe || r.priority + ' priority'}) — ${r.domain}`);
    });
    lines.push('');
  }

  // Compliance context
  if (complianceNeeds.length > 0) {
    lines.push(`COMPLIANCE CONTEXT`);
    lines.push(`${orgName} has identified the following compliance obligations: ${complianceNeeds.join(', ')}.`);
    if (missingEvidence.length > 0) {
      lines.push(`${missingEvidence.length} evidence item(s) are currently missing that may be required for compliance demonstration.`);
    }
    lines.push('');
  }

  lines.push(`DISCLAIMER`);
  lines.push(COPILOT_DISCLAIMER);

  return lines.join('\n');
}

// ─── Technical Remediation Draft ─────────────────────────────────────────────

export function generateTechnicalRemediationDraft(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available.]';

  const { tone = 'technical', includeQuantumNotes = true, includeEvidenceNotes = true } = settings;
  const { orgName, secScore, qScore, secInterp, topRisks, critRecs, topActions,
          missingEvidence, incompleteEvidence, hasHNDLConcern, shelfLifeLabel,
          hasMFAGap, hasEncryptGap, hasBackupGap, hasIRGap, hasLoggingGap,
          hasRSA, hasMigrationPlan, hasCryptoAgility, hasCertInventory, systems } = snapshot;

  const lines = [];

  lines.push(`TECHNICAL REMEDIATION PLAN — ${orgName.toUpperCase()}`);
  lines.push(`Classification: Defensive Readiness Planning — Internal Use`);
  lines.push(`Basis: Supplied self-reported assessment responses. Not a penetration test or security audit.`);
  lines.push('');

  // Security fixes
  lines.push(`══ SECURITY IMPLEMENTATION FIXES ══`);
  lines.push('');

  const secFixes = _buildSecurityFixes(snapshot);
  secFixes.forEach(({ priority, title, detail, owner, timeframe }) => {
    lines.push(`[${priority.toUpperCase()}] ${title}`);
    lines.push(`  Owner:     ${owner}`);
    lines.push(`  Timeframe: ${timeframe}`);
    lines.push(`  Action:    ${detail}`);
    lines.push('');
  });

  // Quantum fixes
  if (includeQuantumNotes) {
    lines.push(`══ POST-QUANTUM READINESS FIXES ══`);
    lines.push('');

    const qFixes = _buildQuantumFixes(snapshot);
    qFixes.forEach(({ priority, title, detail, owner, timeframe }) => {
      lines.push(`[${priority.toUpperCase()}] ${title}`);
      lines.push(`  Owner:     ${owner}`);
      lines.push(`  Timeframe: ${timeframe}`);
      lines.push(`  Action:    ${detail}`);
      lines.push('');
    });
  }

  // 30/60/90 plan
  lines.push(`══ 30 / 60 / 90 DAY ACTION PLAN ══`);
  lines.push('');

  const plan = _build306090Plan(snapshot);
  plan.forEach(({ period, items }) => {
    lines.push(`${period}`);
    items.forEach((item) => lines.push(`  • ${item}`));
    lines.push('');
  });

  // Evidence
  if (includeEvidenceNotes && (missingEvidence.length > 0 || incompleteEvidence.length > 0)) {
    lines.push(`══ EVIDENCE COLLECTION PRIORITIES ══`);
    lines.push('');
    missingEvidence.slice(0, 5).forEach((e) => {
      lines.push(`  [MISSING]    ${e.controlName} — ${e.framework || 'See evidence pack'}`);
    });
    incompleteEvidence.slice(0, 4).forEach((e) => {
      lines.push(`  [INCOMPLETE] ${e.controlName} — ${e.notes?.slice(0, 80) || 'Review required'}${(e.notes?.length || 0) > 80 ? '…' : ''}`);
    });
    lines.push('');
  }

  lines.push(`DISCLAIMER`);
  lines.push(COPILOT_DISCLAIMER);

  return lines.join('\n');
}

// ─── Meeting Talking Points ───────────────────────────────────────────────────

export function generateMeetingTalkingPoints(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available.]';

  const { tone = 'professional', audience = 'SME business owner', includeQuantumNotes = true, includeCommercialActions = true } = settings;
  const { orgName, sector, secScore, qScore, overallScore, secInterp, qInterp,
          topRisks, critRecs, hasMFAGap, hasEncryptGap, hasHNDLConcern, shelfLifeLabel,
          missingEvidence, evidenceCompleteCount, evidenceTotal } = snapshot;

  const lines = [];

  lines.push(`CONSULTANT MEETING TALKING POINTS — ${orgName.toUpperCase()}`);
  lines.push(`Audience: ${AUDIENCE_CONTEXT[audience] || audience}`);
  lines.push('');

  // Opener
  lines.push(`MEETING OPENER`);
  lines.push(`"Thank you for the opportunity to review ${orgName}'s security and readiness posture. `);
  lines.push(`We've analysed your responses across ${snapshot.hasSecAssessment ? 'the full security assessment (47 questions, 12 domains)' : 'the available assessment data'}, and I'd like to walk you through the key findings today."`);
  lines.push('');

  // Score framing
  lines.push(`SCORE FRAMING — NON-TECHNICAL`);
  if (overallScore != null) {
    lines.push(`"Your overall readiness score is ${overallScore}/100 — ${overallInterpreter(overallScore)}. `);
    lines.push(`What this means in practical terms is that [see Key Risk Message below]."`);
  } else if (secScore != null) {
    lines.push(`"Your security implementation score is ${secScore}/100. ${secInterp.maturity}. `);
    lines.push(`This gives us a clear picture of where to focus effort for the greatest risk reduction."`);
  }
  lines.push('');

  // Key risk message
  lines.push(`KEY RISK MESSAGE`);
  const riskMsg = _buildRiskMessage(snapshot, tone);
  lines.push(riskMsg);
  lines.push('');

  // Security implementation
  lines.push(`SECURITY IMPLEMENTATION EXPLANATION`);
  if (hasMFAGap) {
    lines.push(`"One of the most impactful actions you can take today is enforcing multi-factor authentication (MFA) across all accounts. This single control prevents the majority of credential-based breaches and is the foundation of Cyber Essentials compliance."`);
  }
  if (hasEncryptGap) {
    lines.push(`"We've noted that encryption at rest is incomplete or missing on some systems. This means sensitive data stored on those systems is accessible if physical or logical access is gained — which is an unnecessary risk that can be closed relatively quickly."`);
  }
  if (topRisks.length > 0) {
    lines.push(`"The top risk items identified are:"`)
    topRisks.slice(0, 3).forEach((r) => {
      lines.push(`  • ${r.domain}: ${r.controlGap?.slice(0, 100) || 'See risk register.'}${(r.controlGap?.length || 0) > 100 ? '…' : ''}`);
    });
  }
  lines.push('');

  // Quantum readiness
  if (includeQuantumNotes) {
    lines.push(`QUANTUM-READINESS EXPLANATION`);
    if (hasHNDLConcern) {
      lines.push(`"I want to highlight a specific concern around post-quantum cryptography. Your organisation retains sensitive data for ${shelfLifeLabel}. There is a documented attack strategy called 'harvest now, decrypt later' — where adversaries collect encrypted data today, knowing they will be able to decrypt it once quantum computers become powerful enough. NIST's new post-quantum standards (FIPS 203/204/205) have now been published. We recommend beginning a review of your cryptographic assets and planning a migration roadmap."`);
    } else {
      lines.push(`"Post-quantum computing is a forward-looking concern. NIST has now published post-quantum cryptography standards (FIPS 203/204/205), and the UK's NCSC recommends organisations begin migration planning now, even if the immediate risk to your data is lower. We'd suggest including this in your 12-month security roadmap."`);
    }
    if (qScore != null) {
      lines.push(`"Your current quantum-readiness score is ${qScore}/100 — ${qInterp.label}. ${qInterp.migrationUrgency}."`);
    }
    lines.push('');
  }

  // Evidence pack
  lines.push(`EVIDENCE PACK EXPLANATION`);
  if (evidenceTotal > 0) {
    lines.push(`"We've prepared an evidence pack with ${evidenceTotal} items mapped to the relevant compliance frameworks. ${evidenceCompleteCount} of these are currently complete or available. ${missingEvidence.length > 0 ? `The ${missingEvidence.length} missing items are the priority — without these, it's harder to demonstrate the controls you have in place to auditors or customers.` : 'The evidence pack is in good shape — the next step is keeping it up to date and accessible.'}"`);
  } else {
    lines.push(`"We'd recommend building out an evidence pack as part of this engagement. This gives you documented proof of the controls you have in place — which is essential for ISO 27001, Cyber Essentials, or any customer due diligence questionnaire."`);
  }
  lines.push('');

  // Recommended next steps
  lines.push(`RECOMMENDED NEXT STEPS`);
  if (critRecs.length > 0) {
    lines.push(`"Based on the assessment, the highest-impact next steps are:"`);
    critRecs.slice(0, 4).forEach((r, i) => {
      lines.push(`  ${i + 1}. ${r.title} — ${r.timeframe || r.priority + ' priority'}`);
    });
  } else {
    lines.push(`"We'd recommend scheduling a follow-up to prioritise the risk register items and assign ownership to each action."`);
  }
  lines.push('');

  // Commercial framing
  if (includeCommercialActions) {
    lines.push(`SERVICE OPPORTUNITY FRAMING`);
    lines.push(_buildServiceOpportunity(snapshot));
    lines.push('');
  }

  // Safe close
  lines.push(`SAFE CLOSING STATEMENT`);
  lines.push(`"This assessment gives you a clear, evidence-based view of where you are today and what to prioritise. We're here to help you make the right decisions — not to alarm you, but to help you take control of your risk posture with confidence. The next step is [agree an action plan with the client]."`);
  lines.push('');

  lines.push(`IMPORTANT: These talking points are based on supplied assessment data. Always review findings with the client before the meeting and adjust based on any new information.`);

  return lines.join('\n');
}

// ─── Evidence Gap Summary ─────────────────────────────────────────────────────

export function generateEvidenceGapSummary(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available.]';

  const { orgName, evidence, missingEvidence, incompleteEvidence, plannedEvidence,
          completeEvidence, evidenceTotal, evidenceCompleteCount, complianceNeeds } = snapshot;

  const lines = [];

  lines.push(`EVIDENCE GAP SUMMARY — ${orgName.toUpperCase()}`);
  lines.push(`Total evidence items tracked: ${evidenceTotal}`);
  lines.push(`Complete: ${evidenceCompleteCount}  |  In Progress / Needs Review: ${incompleteEvidence.length}  |  Planned: ${plannedEvidence.length}  |  Missing: ${missingEvidence.length}`);
  lines.push('');

  if (evidenceTotal === 0) {
    lines.push('No evidence items have been added yet.');
    lines.push('Scaffold an evidence pack from the Evidence Pack page, or from the Recommendations page after completing your assessment.');
    return lines.join('\n');
  }

  // Missing — highest priority
  if (missingEvidence.length > 0) {
    lines.push(`MISSING EVIDENCE — ACTION REQUIRED`);
    missingEvidence.forEach((e) => {
      lines.push(`  • ${e.controlName}`);
      lines.push(`    Framework: ${e.framework || 'See evidence pack'}`);
      lines.push(`    Gap: ${e.notes?.slice(0, 120) || 'Evidence not collected or documented.'}${(e.notes?.length || 0) > 120 ? '…' : ''}`);
      lines.push(`    Impact: Without this evidence, it is harder to demonstrate the associated control to auditors, customers, or regulators.`);
      lines.push('');
    });
  }

  // Incomplete / needs review
  if (incompleteEvidence.length > 0) {
    lines.push(`INCOMPLETE / NEEDS REVIEW`);
    incompleteEvidence.forEach((e) => {
      lines.push(`  • ${e.controlName} — ${e.status === 'needs_review' ? 'Requires review/update' : 'In progress'}`);
      if (e.notes) lines.push(`    Notes: ${e.notes.slice(0, 100)}${e.notes.length > 100 ? '…' : ''}`);
    });
    lines.push('');
  }

  // Priority evidence for compliance
  if (complianceNeeds.length > 0) {
    lines.push(`COMPLIANCE-ALIGNED PRIORITIES`);
    lines.push(`For ${complianceNeeds.join(', ')}, the highest-priority evidence items are typically:`);
    const priorityDomains = _getCompliancePriorityDomains(complianceNeeds);
    priorityDomains.forEach((d) => lines.push(`  • ${d}`));
    lines.push('');
  }

  // What's complete
  if (completeEvidence.length > 0) {
    lines.push(`EVIDENCE COMPLETE (${completeEvidence.length} items)`);
    completeEvidence.forEach((e) => lines.push(`  ✓ ${e.controlName}`));
    lines.push('');
  }

  lines.push(`DISCLAIMER`);
  lines.push(COPILOT_DISCLAIMER);

  return lines.join('\n');
}

// ─── Quantum-Readiness Explanation ───────────────────────────────────────────

export function generateQuantumReadinessExplanation(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available.]';

  const { tone = 'professional', audience = 'SME business owner' } = settings;
  const opener = TONE_OPENERS[tone] || TONE_OPENERS.professional;

  const { orgName, qScore, qInterp, agilityScore, hndlScore,
          hasRSA, hasECC, tlsVersion, dataShelfLife, shelfLifeLabel,
          hasHNDLConcern, hndlAwareness, pqcAwareness, migrationPlan,
          cryptoAgility, certInventory, hasCertInventory, hasMigrationPlan,
          hasCryptoAgility, hasQrAssessment } = snapshot;

  const lines = [];

  lines.push(`QUANTUM-READINESS EXPLANATION — ${orgName.toUpperCase()}`);
  lines.push(`Audience: ${AUDIENCE_CONTEXT[audience] || audience}`);
  lines.push(`Basis: Supplied assessment responses — not a live cryptographic audit.`);
  lines.push('');

  if (!hasQrAssessment) {
    lines.push('Quantum-readiness assessment has not yet been completed for this organisation.');
    lines.push('Complete the Quantum Readiness Assessment to generate a detailed explanation.');
    return lines.join('\n');
  }

  // Score
  lines.push(`QUANTUM-READINESS SCORE: ${qScore ?? 'Not scored'}/100 — ${qInterp?.label || 'Unknown'}`);
  lines.push('');

  // Harvest-now-decrypt-later
  lines.push(`HARVEST-NOW-DECRYPT-LATER (HNDL) RISK`);
  lines.push(`${opener} ${orgName}'s sensitive data is retained for approximately ${shelfLifeLabel}.`);
  if (hasHNDLConcern) {
    lines.push(`This creates a material harvest-now-decrypt-later concern. Adversaries can capture encrypted network traffic or data stores today and hold them until a cryptographically-relevant quantum computer (CRQC) becomes available — potentially within the lifetime of this data.`);
    lines.push(`Data encrypted today with RSA-2048 or ECC could, in principle, be decrypted by a sufficiently powerful quantum computer. NIST and NCSC guidance recommends beginning migration planning now to protect long-lived sensitive data.`);
  } else {
    lines.push(`Data retention for ${shelfLifeLabel} presents a lower immediate HNDL concern compared to organisations with 10–20+ year retention. However, NIST recommends all organisations begin cryptographic inventory and migration planning regardless of data shelf-life, as transition timelines are long.`);
  }
  lines.push('');

  // RSA/ECC exposure
  lines.push(`CRYPTOGRAPHIC ALGORITHM EXPOSURE`);
  if (hasRSA) {
    lines.push(`RSA usage has been identified in supplied assessment responses. RSA (including RSA-2048 and RSA-4096) is considered quantum-vulnerable — a sufficiently large quantum computer running Shor's algorithm could break RSA encryption. RSA-4096 provides no quantum safety advantage over RSA-2048.`);
  }
  if (hasECC) {
    lines.push(`Elliptic Curve Cryptography (ECC) usage has been identified. ECC is also quantum-vulnerable to Shor's algorithm. Both ECC-256 and ECC-384 are considered quantum-vulnerable. Migration to post-quantum alternatives is required for long-term security.`);
  }
  if (!hasRSA && !hasECC) {
    lines.push(`Specific cryptographic algorithm usage was not confirmed in supplied responses. A full cryptographic asset inventory is recommended as a first step.`);
  }
  lines.push('');

  // TLS
  if (tlsVersion) {
    lines.push(`TLS POSTURE`);
    const tlsMsg = {
      'unknown': 'TLS version is unknown — a configuration review is recommended.',
      'tls13_full': 'TLS 1.3 is fully deployed — this is the current best practice. TLS 1.3 handshakes use ephemeral key exchange, but the key exchange algorithms (X25519, P-256) remain quantum-vulnerable and will require migration.',
      'tls13_partial': 'TLS 1.3 is partially deployed. Systems still running TLS 1.2 or below should be upgraded. Note: all current TLS versions use quantum-vulnerable key exchange.',
      'tls12': 'TLS 1.2 is in use. While not immediately insecure for classical threats, TLS 1.2 uses cipher suites that are quantum-vulnerable. Migration to TLS 1.3 and planning for post-quantum key exchange is recommended.',
    }[tlsVersion] || `TLS version noted as: ${tlsVersion}.`;
    lines.push(tlsMsg);
    lines.push('');
  }

  // Certificate inventory
  lines.push(`CERTIFICATE & KEY INVENTORY`);
  if (hasCertInventory) {
    lines.push(`A ${certInventory === 'full' ? 'full' : 'partial'} cryptographic asset inventory exists. ${certInventory === 'partial' ? 'Complete the inventory to ensure all quantum-vulnerable certificates and keys are tracked.' : 'Maintain this inventory and schedule regular reviews as part of a crypto-agility programme.'}`);
  } else {
    lines.push(`No cryptographic asset inventory has been documented based on supplied responses. Establishing a certificate and key inventory is the recommended first step in any post-quantum migration programme. Without knowing what cryptographic assets exist, migration planning cannot be effectively prioritised.`);
  }
  lines.push('');

  // Crypto-agility
  lines.push(`CRYPTO-AGILITY POSTURE`);
  if (hasCryptoAgility) {
    lines.push(`The organisation has some degree of crypto-agility — the ability to replace cryptographic algorithms without significant architectural disruption. This is a positive indicator for post-quantum migration readiness.`);
  } else {
    lines.push(`Crypto-agility appears limited based on supplied responses. This means replacing quantum-vulnerable algorithms (RSA, ECC) may require significant architectural changes. Improving crypto-agility — by designing systems to support algorithm replacement — is an important medium-term objective.`);
  }
  lines.push('');

  // Migration planning
  lines.push(`MIGRATION PLANNING STATUS`);
  if (hasMigrationPlan) {
    lines.push(`A post-quantum migration plan is ${migrationPlan === 'active' ? 'actively underway' : 'in the early stages'}. The next steps are to align with NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA) standards, and to establish a timeline for certificate and protocol migration.`);
  } else {
    lines.push(`No post-quantum migration plan is in place. NIST published FIPS 203, 204, and 205 in 2024, establishing ML-KEM, ML-DSA, and SLH-DSA as the new post-quantum cryptography standards. The UK's NCSC recommends organisations begin migration planning now. The recommended starting point is a cryptographic asset inventory, followed by a risk-prioritised migration roadmap.`);
  }
  lines.push('');

  // NIST/NCSC alignment
  lines.push(`NIST & NCSC ALIGNMENT GUIDANCE`);
  lines.push(`• NIST FIPS 203 (ML-KEM): Recommended post-quantum key encapsulation mechanism. Replaces RSA and ECDH for key exchange.`);
  lines.push(`• NIST FIPS 204 (ML-DSA): Recommended post-quantum digital signature algorithm. Replaces RSA signatures and ECDSA.`);
  lines.push(`• NIST FIPS 205 (SLH-DSA): Hash-based post-quantum signature scheme. Suitable for high-assurance use cases.`);
  lines.push(`• NCSC Guidance: The UK's National Cyber Security Centre recommends organisations complete a cryptographic inventory, assess HNDL exposure, and develop a migration roadmap aligned to NIST FIPS standards.`);
  lines.push(`• Important note: This platform does not detect live cryptographic configurations. All findings are based on supplied assessment responses only.`);
  lines.push('');

  lines.push(`DISCLAIMER`);
  lines.push(COPILOT_DISCLAIMER);

  return lines.join('\n');
}

// ─── Priority Action Plan ─────────────────────────────────────────────────────

export function generatePriorityActionPlan(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available.]';

  const { orgName, critRecs, topActions, topRisks, missingEvidence, hasMFAGap, hasEncryptGap,
          hasBackupGap, hasIRGap, hasLoggingGap, hasRSA, hasMigrationPlan, hasQrAssessment } = snapshot;

  const lines = [];

  lines.push(`PRIORITY ACTION PLAN — ${orgName.toUpperCase()}`);
  lines.push(`Basis: Assessment responses and risk register. Defensive planning only.`);
  lines.push('');

  // Immediate actions (critical)
  const immediateActions = [];
  if (hasMFAGap)     immediateActions.push({ title: 'Enforce MFA for all user accounts', urgency: 'CRITICAL', owner: 'IT Manager / CISO', timeframe: 'Within 2 weeks', why: 'Prevents majority of credential-based breach scenarios.' });
  if (hasEncryptGap) immediateActions.push({ title: 'Enable encryption at rest on all critical systems', urgency: 'CRITICAL', owner: 'IT Manager', timeframe: 'Within 4 weeks', why: 'Reduces exposure if physical or logical access is compromised.' });
  if (hasBackupGap)  immediateActions.push({ title: 'Implement and test automated offsite backup', urgency: 'HIGH', owner: 'IT Manager', timeframe: 'Within 4 weeks', why: 'Ensures recovery capability in ransomware or failure scenarios.' });
  if (hasIRGap)      immediateActions.push({ title: 'Create and test an Incident Response Plan', urgency: 'HIGH', owner: 'Operations/CISO', timeframe: 'Within 6 weeks', why: 'Enables structured, rapid response to security incidents.' });
  if (hasLoggingGap) immediateActions.push({ title: 'Implement centralised logging and alerting', urgency: 'HIGH', owner: 'IT Manager', timeframe: 'Within 6 weeks', why: 'Provides detection capability for anomalous activity.' });

  // Add from critRecs
  critRecs.forEach((r) => {
    if (!immediateActions.find((a) => a.title === r.title)) {
      immediateActions.push({ title: r.title, urgency: r.priority?.toUpperCase() || 'HIGH', owner: r.owner || 'IT/CISO', timeframe: r.timeframe || 'TBD', why: r.detail?.slice(0, 100) || '' });
    }
  });

  if (immediateActions.length > 0) {
    lines.push(`IMMEDIATE PRIORITY ACTIONS`);
    immediateActions.slice(0, 6).forEach((a, i) => {
      lines.push(`${i + 1}. [${a.urgency}] ${a.title}`);
      lines.push(`   Owner: ${a.owner} | Timeframe: ${a.timeframe}`);
      if (a.why) lines.push(`   Why: ${a.why}${a.why.length >= 100 ? '…' : ''}`);
      lines.push('');
    });
  }

  // Quantum actions
  if (hasQrAssessment) {
    lines.push(`POST-QUANTUM MIGRATION ACTIONS`);
    const qActions = _buildQuantumActionItems(snapshot);
    qActions.forEach((a, i) => {
      lines.push(`${i + 1}. [${a.urgency}] ${a.title}`);
      lines.push(`   Timeframe: ${a.timeframe}`);
      lines.push('');
    });
  }

  // Evidence actions
  if (missingEvidence.length > 0) {
    lines.push(`EVIDENCE COLLECTION ACTIONS`);
    missingEvidence.slice(0, 4).forEach((e) => {
      lines.push(`  • Collect: ${e.controlName} (${e.framework || 'Evidence Pack'})`);
    });
    lines.push('');
  }

  lines.push(`DISCLAIMER`);
  lines.push(COPILOT_DISCLAIMER);

  return lines.join('\n');
}

// ─── Client-Friendly Risk Explanation ────────────────────────────────────────

export function generateClientFriendlyRiskExplanation(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available.]';

  const { orgName, secScore, qScore, overallScore, secInterp, topRisks, critRisks, highRisks } = snapshot;

  const lines = [];
  lines.push(`PLAIN-ENGLISH RISK EXPLANATION — ${orgName.toUpperCase()}`);
  lines.push('');

  lines.push(`WHAT THE SCORES MEAN`);
  if (overallScore != null) {
    lines.push(`Your overall readiness score is ${overallScore}/100.`);
    lines.push(_plainScoreExplanation(overallScore, 'overall'));
  } else if (secScore != null) {
    lines.push(`Your security implementation score is ${secScore}/100.`);
    lines.push(_plainScoreExplanation(secScore, 'security'));
  }
  lines.push('');

  lines.push(`WHAT THE RISKS MEAN IN PLAIN ENGLISH`);
  if (topRisks.length === 0) {
    lines.push('No specific risk items have been identified yet. Complete a full assessment to populate the risk register.');
  } else {
    topRisks.slice(0, 4).forEach((r) => {
      lines.push(`• ${r.domain}`);
      lines.push(`  In plain terms: ${_riskToPlainEnglish(r)}`);
      lines.push('');
    });
  }

  lines.push(`WHAT HAPPENS IF WE DON'T ACT`);
  lines.push(_buildConsequenceStatement(snapshot));
  lines.push('');

  lines.push(`DISCLAIMER`);
  lines.push('This explanation is based on supplied assessment responses and is for planning and discussion purposes only. It does not constitute legal advice or a security guarantee.');

  return lines.join('\n');
}

// ─── Consultant Next Steps ────────────────────────────────────────────────────

export function generateConsultantNextSteps(snapshot, settings = {}) {
  if (!snapshot) return '[No assessment data available.]';

  const { orgName, critRisks, highRisks, missingEvidence, hasSecAssessment,
          hasQrAssessment, hasReports, reportCount, evidenceTotal } = snapshot;

  const lines = [];
  lines.push(`CONSULTANT NEXT STEPS — ${orgName.toUpperCase()}`);
  lines.push(`Internal note — not for client distribution`);
  lines.push('');

  lines.push(`ASSESSMENT STATUS`);
  lines.push(`  Security Assessment: ${hasSecAssessment ? '✓ Complete' : '✗ Not completed'}`);
  lines.push(`  Quantum Readiness:   ${hasQrAssessment ? '✓ Complete' : '✗ Not completed'}`);
  lines.push(`  Reports Generated:   ${reportCount > 0 ? `${reportCount} report(s) in history` : 'None yet'}`);
  lines.push(`  Evidence Items:      ${evidenceTotal > 0 ? `${evidenceTotal} tracked` : 'Not started'}`);
  lines.push('');

  lines.push(`IMMEDIATE CONSULTANT ACTIONS`);
  const steps = [];
  if (!hasSecAssessment) steps.push('Complete the security implementation assessment (47 questions, ~30–60 min)');
  if (!hasQrAssessment)  steps.push('Complete the quantum readiness assessment');
  if (critRisks.length > 0) steps.push(`Discuss ${critRisks.length} critical risk item(s) with client and agree ownership`);
  if (missingEvidence.length > 0) steps.push(`Request ${missingEvidence.length} missing evidence item(s) from client`);
  if (!hasReports) steps.push('Generate initial executive report and share with client');
  steps.push('Schedule risk review meeting to prioritise action plan');
  steps.push('Agree 30/60/90 day remediation timeline with client');
  steps.push('Set review date (recommend 60-90 days from initial assessment)');

  steps.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
  lines.push('');

  lines.push(`COMMERCIAL OPPORTUNITY NOTES`);
  lines.push(_buildServiceOpportunity(snapshot));
  lines.push('');

  lines.push(`REVIEW CADENCE RECOMMENDATION`);
  lines.push(`• Initial report delivery: Immediately`);
  lines.push(`• First progress review: 30 days`);
  lines.push(`• Risk register update: 60 days`);
  lines.push(`• Full reassessment: 90–120 days (or after major remediation effort)`);
  lines.push('');

  return lines.join('\n');
}

// ─── Full Copilot Bundle ──────────────────────────────────────────────────────

/**
 * generateCopilotBundle — generates all sections in one call.
 * Returns an object keyed by section name.
 */
export function generateCopilotBundle(state, settings = {}) {
  const snapshot = buildClientRiskSnapshot(state);
  if (!snapshot) {
    return {
      error: true,
      message: 'Unable to build snapshot — check that assessment data exists.',
      snapshot: null,
    };
  }

  return {
    error: false,
    snapshot,
    generatedAt: new Date().toISOString(),
    settings,
    sections: {
      executiveSummary:           generateExecutiveSummaryDraft(snapshot, settings),
      technicalRemediation:       generateTechnicalRemediationDraft(snapshot, settings),
      meetingTalkingPoints:       generateMeetingTalkingPoints(snapshot, settings),
      evidenceGapSummary:         generateEvidenceGapSummary(snapshot, settings),
      quantumReadinessExplanation: generateQuantumReadinessExplanation(snapshot, settings),
      priorityActionPlan:         generatePriorityActionPlan(snapshot, settings),
      clientFriendlyRisk:         generateClientFriendlyRiskExplanation(snapshot, settings),
      consultantNextSteps:        generateConsultantNextSteps(snapshot, settings),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function overallInterpreter(score) {
  if (score >= 80) return 'representing a stronger readiness posture with focused improvement areas';
  if (score >= 60) return 'representing a developing posture with identifiable gaps to address';
  if (score >= 40) return 'indicating significant improvement is needed across multiple control domains';
  return 'indicating high concern across security fundamentals — immediate action is recommended';
}

function _deriveStrengths(snapshot) {
  const strengths = [];
  const { mfaCoverage, encryptRest, backupTested, incidentPlan, siem, hasCertInventory,
          hasMigrationPlan, hasCryptoAgility, secScore, qScore, completeEvidence } = snapshot;

  if (mfaCoverage && !['none', 'partial_senior'].includes(mfaCoverage)) strengths.push('Multi-factor authentication coverage demonstrated across key systems');
  if (encryptRest === 'full_hsm' || encryptRest === 'full_cloud') strengths.push('Encryption at rest implemented across critical systems');
  if (backupTested === 'yes') strengths.push('Backup procedures are in place and have been tested');
  if (incidentPlan === 'yes') strengths.push('Incident response plan documented');
  if (siem === 'yes') strengths.push('Centralised security monitoring/SIEM in place');
  if (hasCertInventory) strengths.push('Cryptographic asset inventory maintained (partial or full)');
  if (hasMigrationPlan) strengths.push('Post-quantum migration planning has been initiated');
  if (hasCryptoAgility) strengths.push('Some degree of crypto-agility demonstrated');
  if ((secScore || 0) >= 70) strengths.push('Security implementation score indicates above-average defensive controls for sector');
  if (completeEvidence.length >= 5) strengths.push(`${completeEvidence.length} evidence items documented and available`);

  return strengths.length > 0 ? strengths : ['Assessment data does not indicate specific strengths — complete assessments for detailed analysis.'];
}

function _deriveKeyConcerns(snapshot) {
  const concerns = [];
  const { hasMFAGap, hasEncryptGap, hasBackupGap, hasIRGap, hasLoggingGap,
          hasRSA, hasHNDLConcern, hasMigrationPlan, hasCertInventory,
          critRisks, missingEvidence, shelfLifeLabel } = snapshot;

  if (hasMFAGap)       concerns.push('Multi-factor authentication is not fully enforced — significant credential breach risk');
  if (hasEncryptGap)   concerns.push('Encryption at rest is incomplete or absent on critical systems');
  if (hasBackupGap)    concerns.push('Backup processes have not been tested — recovery capability is unverified');
  if (hasIRGap)        concerns.push('No documented incident response plan — breach response capability is limited');
  if (hasLoggingGap)   concerns.push('Logging and monitoring gaps reduce visibility of anomalous activity');
  if (hasRSA && hasHNDLConcern) concerns.push(`RSA cryptography in use with ${shelfLifeLabel} data retention — harvest-now-decrypt-later exposure is material`);
  if (!hasMigrationPlan && snapshot.hasQrAssessment) concerns.push('No post-quantum migration plan in place despite NIST FIPS 203/204/205 publication');
  if (!hasCertInventory) concerns.push('No cryptographic asset inventory — unknown scope of quantum-vulnerable algorithms in use');
  if (critRisks.length > 0) concerns.push(`${critRisks.length} critical-risk item(s) identified in the risk register requiring immediate attention`);
  if (missingEvidence.length >= 3) concerns.push(`${missingEvidence.length} missing evidence items — compliance demonstration readiness is impacted`);

  return concerns;
}

function _buildSecurityFixes(snapshot) {
  const fixes = [];
  const { hasMFAGap, hasEncryptGap, hasBackupGap, hasIRGap, hasLoggingGap, critRecs } = snapshot;

  if (hasMFAGap) fixes.push({
    priority: 'CRITICAL', owner: 'IT Manager / CISO',
    title: 'Enforce MFA for all user accounts',
    detail: 'Enable multi-factor authentication across all critical systems, starting with email, VPN, and admin consoles. Prioritise phishing-resistant MFA (FIDO2/hardware tokens) for privileged users. Enforce via Conditional Access Policies where available.',
    timeframe: 'Within 2 weeks',
  });
  if (hasEncryptGap) fixes.push({
    priority: 'CRITICAL', owner: 'IT Manager',
    title: 'Implement encryption at rest on all critical systems',
    detail: 'Enable full-disk or volume encryption (BitLocker, FileVault, LUKS) on all servers and workstations. Ensure cloud storage encryption is enabled and key management is documented. Review and document encryption posture for all critical systems.',
    timeframe: 'Within 4 weeks',
  });
  if (hasBackupGap) fixes.push({
    priority: 'HIGH', owner: 'IT Manager',
    title: 'Implement automated, tested, offsite backup',
    detail: 'Replace manual backup with automated daily backup to an offsite or cloud location. Test restore procedure quarterly and document results. Define and document RTO/RPO targets. Consider immutable backup for ransomware resilience.',
    timeframe: 'Within 4 weeks',
  });
  if (hasIRGap) fixes.push({
    priority: 'HIGH', owner: 'Operations / CISO',
    title: 'Create and test an Incident Response Plan',
    detail: 'Draft an IRP covering breach detection, containment, notification (ICO 72-hour rule / SRA / NHS DSPT as applicable), and recovery. Assign incident response roles. Conduct an annual tabletop exercise.',
    timeframe: 'Within 6 weeks',
  });
  if (hasLoggingGap) fixes.push({
    priority: 'HIGH', owner: 'IT Manager',
    title: 'Deploy centralised logging and security monitoring',
    detail: 'Implement a SIEM solution or centralised log management. Define alert rules for anomalous activity. Retain logs for minimum 12 months. Cover cloud, endpoint, and network sources.',
    timeframe: 'Within 8 weeks',
  });

  // Add critical/high recs not already covered
  critRecs.forEach((r) => {
    if (!fixes.find((f) => f.title === r.title)) {
      fixes.push({ priority: r.priority?.toUpperCase() || 'HIGH', owner: 'IT/CISO', title: r.title, detail: r.detail || r.description || '', timeframe: r.timeframe || 'TBD' });
    }
  });

  return fixes;
}

function _buildQuantumFixes(snapshot) {
  const fixes = [];
  const { hasCertInventory, hasMigrationPlan, hasCryptoAgility, hasRSA, hasHNDLConcern, shelfLifeLabel } = snapshot;

  if (!hasCertInventory) fixes.push({
    priority: 'HIGH', owner: 'IT Manager / Security Lead',
    title: 'Establish a cryptographic asset inventory',
    detail: 'Document all cryptographic algorithms, certificates, and keys in use across all systems. Record key sizes, expiry dates, and algorithm types (RSA, ECC, AES, etc.). This inventory is the essential first step in any post-quantum migration programme.',
    timeframe: 'Within 6 weeks',
  });
  if (hasRSA && !hasMigrationPlan) fixes.push({
    priority: hasHNDLConcern ? 'CRITICAL' : 'HIGH', owner: 'IT Manager / CISO',
    title: 'Initiate post-quantum migration planning for RSA/ECC assets',
    detail: `RSA and ECC are quantum-vulnerable. ${hasHNDLConcern ? `Given ${shelfLifeLabel} data retention, HNDL risk is elevated. ` : ''}Develop a migration roadmap aligned to NIST FIPS 203 (ML-KEM for key exchange) and FIPS 204 (ML-DSA for signatures). Engage certificate authority for hybrid PQC certificate timeline. Align with cloud provider post-quantum roadmaps.`,
    timeframe: hasHNDLConcern ? 'Within 3 months' : 'Within 6 months',
  });
  if (!hasCryptoAgility) fixes.push({
    priority: 'MEDIUM', owner: 'Architecture / Security Lead',
    title: 'Improve crypto-agility in system design',
    detail: 'Review new and planned system integrations for hardcoded cryptographic algorithm dependencies. Design systems to support algorithm replacement without major architectural rework. This enables faster migration when post-quantum standards mature in vendor products.',
    timeframe: 'Ongoing — incorporate into development standards',
  });

  return fixes;
}

function _build306090Plan(snapshot) {
  const { hasMFAGap, hasEncryptGap, hasBackupGap, hasIRGap, hasLoggingGap,
          hasCertInventory, hasMigrationPlan, missingEvidence } = snapshot;

  const day30 = [];
  const day60 = [];
  const day90 = [];

  if (hasMFAGap)     day30.push('Enforce MFA for all user accounts');
  if (hasEncryptGap) day30.push('Begin encryption at rest implementation on critical systems');
  if (!hasCertInventory) day30.push('Start cryptographic asset inventory');
  day30.push('Review and prioritise risk register with client');
  if (missingEvidence.length > 0) day30.push(`Request ${Math.min(missingEvidence.length, 3)} priority missing evidence items from client`);

  if (hasBackupGap)  day60.push('Complete automated, tested, offsite backup implementation');
  if (hasIRGap)      day60.push('Draft and test Incident Response Plan');
  day60.push('Complete cryptographic asset inventory (if started in day 1–30)');
  day60.push('Conduct 30-day progress review with client');
  day60.push('Begin post-quantum migration roadmap draft');

  if (hasLoggingGap) day90.push('Deploy centralised logging / SIEM');
  day90.push('Complete post-quantum migration roadmap v1.0');
  day90.push('Conduct 90-day risk register review and reassessment');
  day90.push('Generate updated readiness report with progress scores');
  day90.push('Plan next assessment cycle (recommend 6-month cadence)');

  return [
    { period: '0–30 DAYS (Immediate)', items: day30 },
    { period: '30–60 DAYS (Short-term)', items: day60 },
    { period: '60–90 DAYS (Medium-term)', items: day90 },
  ];
}

function _buildQuantumActionItems(snapshot) {
  const actions = [];
  const { hasCertInventory, hasMigrationPlan, hasRSA, hasHNDLConcern } = snapshot;

  if (!hasCertInventory) actions.push({ title: 'Establish cryptographic asset inventory', urgency: 'HIGH', timeframe: 'Within 6 weeks' });
  if (!hasMigrationPlan) actions.push({ title: 'Develop post-quantum migration roadmap (aligned to NIST FIPS 203/204/205)', urgency: hasHNDLConcern ? 'HIGH' : 'MEDIUM', timeframe: 'Within 3 months' });
  if (hasRSA) actions.push({ title: 'Engage certificate authority for PQC hybrid certificate timeline', urgency: 'MEDIUM', timeframe: 'Within 6 months' });
  actions.push({ title: 'Review NCSC post-quantum migration guidance and align internal roadmap', urgency: 'MEDIUM', timeframe: 'Within 3 months' });

  return actions;
}

function _buildRiskMessage(snapshot, tone) {
  const { secScore, critRisks, highRisks, hasMFAGap, hasEncryptGap, hasHNDLConcern } = snapshot;

  if (critRisks.length > 0) {
    return tone === 'plain'
      ? `The assessment found ${critRisks.length} critical risk(s) that need immediate attention. The most important thing to understand is that these are preventable gaps — with the right controls in place, your risk exposure drops significantly.`
      : `The assessment has identified ${critRisks.length} critical and ${highRisks.length} high-priority risk items. These represent control gaps that, if addressed, would materially improve the organisation's security posture and reduce breach risk.`;
  }
  if (highRisks.length > 0) {
    return `The assessment identified ${highRisks.length} high-priority risk item(s). None are immediately critical, but addressing these in a structured way over the next 30–90 days would meaningfully improve your readiness posture.`;
  }
  return `The assessment indicates a developing security posture. The risk register reflects manageable gaps that can be addressed through prioritised, practical action.`;
}

function _buildServiceOpportunity(snapshot) {
  const { critRisks, highRisks, missingEvidence, hasSecAssessment, hasQrAssessment,
          hasMigrationPlan, hasReports, complianceNeeds } = snapshot;

  const opportunities = [];

  if (critRisks.length > 0) opportunities.push('Remediation support for critical risk items (MFA, encryption, backup)');
  if (!hasMigrationPlan) opportunities.push('Post-quantum migration planning and roadmap development');
  if (missingEvidence.length >= 3) opportunities.push('Evidence pack build-out and compliance documentation support');
  if (complianceNeeds.some((n) => n.includes('27001'))) opportunities.push('ISO 27001 gap analysis and certification preparation support');
  if (complianceNeeds.some((n) => n.toLowerCase().includes('essentials'))) opportunities.push('NCSC Cyber Essentials / Cyber Essentials Plus certification support');
  if (!hasReports) opportunities.push('Executive reporting and board-level security briefing');
  opportunities.push('Ongoing quarterly readiness review and reassessment (retainer)');

  if (opportunities.length === 0) return 'Client has a strong posture — consider a retainer for ongoing review and quantum migration guidance.';

  return 'Note for consultant: Potential service opportunities identified based on assessment gaps:\n' +
    opportunities.map((o) => `  • ${o}`).join('\n') + '\n\n' +
    'Present these ethically and based on genuine client need — not based on fear or inflated risk.';
}

function _getCompliancePriorityDomains(complianceNeeds) {
  const domains = [];
  if (complianceNeeds.some((n) => n.toLowerCase().includes('cyber essentials'))) {
    domains.push('MFA policy and configuration export (CE mandatory control)');
    domains.push('Patch management records (CE mandatory control)');
    domains.push('Firewall/network boundary configuration evidence');
  }
  if (complianceNeeds.some((n) => n.toLowerCase().includes('27001'))) {
    domains.push('Risk assessment register (ISO 27001 §6)');
    domains.push('Information Security Policy documentation');
    domains.push('Access control policy and procedure');
    domains.push('Business continuity and backup procedures');
    domains.push('Incident response plan and records');
  }
  if (complianceNeeds.some((n) => n.toLowerCase().includes('gdpr'))) {
    domains.push('Article 30 data processing register');
    domains.push('Data Protection Impact Assessment (DPIA) records');
    domains.push('Data breach response procedure and ICO notification template');
  }
  if (complianceNeeds.some((n) => n.toLowerCase().includes('nhs') || n.toLowerCase().includes('dspt'))) {
    domains.push('NHS DSP Toolkit submission evidence items');
    domains.push('IG training completion records (mandatory for DSP)');
    domains.push('Data flow mapping and data inventory');
  }
  if (domains.length === 0) {
    domains.push('MFA policy and configuration documentation');
    domains.push('Encryption at rest evidence (certificates/configuration)');
    domains.push('Incident response plan');
    domains.push('Backup policy and restore test records');
  }
  return domains;
}

function _riskToPlainEnglish(risk) {
  const domain = (risk.domain || '').toLowerCase();
  const gap    = risk.controlGap || '';

  if (domain.includes('identity') || domain.includes('access') || domain.includes('mfa')) {
    return 'Your organisation may be relying on passwords alone to protect accounts. If one password is stolen or guessed, an attacker could gain access to your systems. Adding a second verification step (like a phone app or hardware key) makes this significantly harder.';
  }
  if (domain.includes('encryption') || domain.includes('cryptog')) {
    return 'Some data stored on your systems may not be protected with encryption. This means if a device is stolen or accessed without permission, the data on it could be read directly. Encryption is like a lock on your data — without it, the data is accessible to anyone who gets to the storage.';
  }
  if (domain.includes('backup') || domain.includes('recovery')) {
    return 'Your backup processes may not have been tested, or may not cover all critical data. In the event of a ransomware attack or system failure, you may not be able to recover your data as quickly — or at all. Regular, tested backups are a key resilience control.';
  }
  if (domain.includes('quantum')) {
    return 'Some of the encryption technology protecting your data may become vulnerable to future quantum computers. While this is a future concern, organisations with long-lived sensitive data should start planning for an upgrade to quantum-resistant encryption now.';
  }
  if (domain.includes('logging') || domain.includes('monitoring')) {
    return 'Your organisation may have limited visibility into what is happening on your systems. Without logging and monitoring, it is harder to detect if someone has gained unauthorised access or if something unusual is occurring.';
  }
  if (domain.includes('incident')) {
    return 'If a security incident occurs, your team may not have a clear plan for how to respond. A documented plan reduces the time it takes to contain the incident and reduces the potential damage.';
  }
  return gap.slice(0, 150) || 'A security control gap was identified — see the risk register for details.';
}

function _buildConsequenceStatement(snapshot) {
  const { critRisks, highRisks, hasMFAGap, hasEncryptGap, hasHNDLConcern } = snapshot;
  const parts = [];

  if (hasMFAGap) parts.push('Without MFA, a single compromised password could expose sensitive data and critical systems.');
  if (hasEncryptGap) parts.push('Without encryption at rest, physical or remote access to a storage device would expose data in plain text.');
  if (hasHNDLConcern) parts.push('Long-lived sensitive data encrypted with quantum-vulnerable algorithms today may be at risk of future decryption as quantum computing matures.');
  if (critRisks.length > 0) parts.push(`The ${critRisks.length} critical risk item(s) identified represent the highest-priority areas where inaction could lead to a preventable security incident.`);

  if (parts.length === 0) return 'Addressing the identified gaps will improve overall resilience and reduce preventable risk.';
  return parts.join(' ');
}

function _plainScoreExplanation(score, type) {
  if (score >= 80) return `This indicates a stronger-than-average defensive posture. The controls that matter most appear to be in place. The focus should be on maintaining and improving those controls, and beginning post-quantum migration planning.`;
  if (score >= 60) return `This is a developing posture — controls are in place in key areas, but there are identifiable gaps that increase risk. Addressing the priority items in the action plan will move you to a stronger position.`;
  if (score >= 40) return `This score indicates multiple control gaps that need attention. This doesn't mean you've been breached — it means you have opportunities to significantly improve your resilience before a problem occurs.`;
  return `This score indicates significant gaps in ${type} controls. The good news is that many of the highest-impact fixes — like MFA and encryption — are achievable with targeted effort and relatively modest investment.`;
}
