/**
 * QUANTUM COMPLIANCE OS™ — targetAssessmentScoring.js
 * Run 9: Target Assessment Engine — Scoring Module
 *
 * Pure functions only. No side effects. No localStorage access.
 * Defensive advisory scoring only — no offensive logic.
 * All scores are explainable, advisory, and evidence-dependent.
 */

import { CHECKLIST_SECTIONS, FINDING_CATEGORIES } from './targetAssessmentRules.js';

// ─── Score clamp helper ────────────────────────────────────────────────────────
function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }

// ─── Checklist completeness helpers ───────────────────────────────────────────
function answered(val) { return val && val !== 'unknown'; }
function isPositive(val) { return val === 'yes' || val === 'na'; }
function isNegative(val) { return val === 'no'; }

// ─── Core Scoring Engine ───────────────────────────────────────────────────────
/**
 * Compute all four scores from checklist responses and evidence.
 *
 * @param {object} checklistResponses  — { [checkId]: { answer, notes } }
 * @param {Array}  evidenceItems       — targetEvidence array for this target
 * @param {Array}  findings            — targetFindings array for this target
 * @returns {object} scores + explanation fields
 */
export function computeTargetScores(checklistResponses = {}, evidenceItems = [], findings = []) {
  const responses = checklistResponses || {};

  // ── 1. Build a lookup of all check items ────────────────────────────────
  const allItems = CHECKLIST_SECTIONS.flatMap((s) => s.items);
  const totalItems = allItems.length;

  // ── 2. Categorise answers ────────────────────────────────────────────────
  const answeredItems      = allItems.filter((i) => answered(responses[i.id]?.answer));
  const positiveItems      = allItems.filter((i) => isPositive(responses[i.id]?.answer));
  const negativeItems      = allItems.filter((i) => isNegative(responses[i.id]?.answer));
  const unansweredItems    = allItems.filter((i) => !answered(responses[i.id]?.answer));

  const securityItems      = allItems.filter((i) => !['Quantum Readiness'].includes(i.category));
  const quantumItems       = allItems.filter((i) => i.category === 'Quantum Readiness' ||
    ['pqc_assessment','crypto_inventory','hndl_awareness','pqc_migration_plan','crypto_agility'].includes(i.id));
  const evidenceItems2     = allItems.filter((i) => ['Evidence Gap','Compliance Gap'].includes(i.category));
  const complianceItems    = allItems.filter((i) => ['Compliance Gap','Data Protection','Authentication'].includes(i.category));

  // ── 3. Security Readiness Score ──────────────────────────────────────────
  const secAnswered = securityItems.filter((i) => answered(responses[i.id]?.answer));
  const secPositive = securityItems.filter((i) => isPositive(responses[i.id]?.answer));
  const secNegative = securityItems.filter((i) => isNegative(responses[i.id]?.answer));

  // Base: positive answers / total security items (penalise unknowns and negatives)
  const secBase = securityItems.length > 0
    ? ((secPositive.length - secNegative.length * 0.5) / securityItems.length) * 80
    : 0;

  // Evidence bonus: up to 15 points
  const evidenceBonus = Math.min(15, evidenceItems.filter((e) =>
    e.status !== 'rejected'
  ).length * 3);

  // Finding penalty: deduct per finding by severity
  const findingPenalty = findings.reduce((acc, f) => {
    if (f.isDemo) return acc;
    const lv = (f.riskLevel || '').toLowerCase();
    return acc + (lv === 'critical' ? 15 : lv === 'high' ? 8 : lv === 'medium' ? 4 : 2);
  }, 0);

  const securityScore = clamp(secBase + evidenceBonus - findingPenalty);

  // ── 4. Quantum Readiness Score ───────────────────────────────────────────
  const qAnswered = quantumItems.filter((i) => answered(responses[i.id]?.answer));
  const qPositive = quantumItems.filter((i) => isPositive(responses[i.id]?.answer));
  const qNegative = quantumItems.filter((i) => isNegative(responses[i.id]?.answer));

  const qBase = quantumItems.length > 0
    ? ((qPositive.length - qNegative.length * 0.7) / quantumItems.length) * 85
    : 0;

  const quantumScore = clamp(qBase);

  // ── 5. Evidence Completeness Score ──────────────────────────────────────
  const openFindings = findings.filter((f) => f.status === 'Open' || f.status === 'In Progress');
  const evidenceNeeded = openFindings.length;
  const evidenceAttached = evidenceItems.filter((e) => e.status !== 'rejected').length;
  const evCompletenessBase = evidenceNeeded > 0
    ? Math.min(100, (evidenceAttached / evidenceNeeded) * 100)
    : evidenceAttached > 0 ? 80 : 40; // 40 if no findings but no evidence either

  // Also consider answered items with evidence linked
  const answeredWithEvidence = answeredItems.filter((i) =>
    evidenceItems.some((e) => e.checkItemId === i.id)
  ).length;
  const answerBonus = answeredItems.length > 0
    ? (answeredWithEvidence / answeredItems.length) * 20
    : 0;

  const evidenceScore = clamp(evCompletenessBase * 0.8 + answerBonus);

  // ── 6. Compliance Readiness Score ───────────────────────────────────────
  const compAnswered = complianceItems.filter((i) => answered(responses[i.id]?.answer));
  const compPositive = complianceItems.filter((i) => isPositive(responses[i.id]?.answer));
  const compNegative = complianceItems.filter((i) => isNegative(responses[i.id]?.answer));

  const compBase = complianceItems.length > 0
    ? ((compPositive.length - compNegative.length * 0.5) / complianceItems.length) * 80
    : 0;

  const complianceScore = clamp(compBase + (evidenceAttached > 2 ? 10 : 0));

  // ── 7. Overall Risk Level ────────────────────────────────────────────────
  const overall = (securityScore + quantumScore + evidenceScore + complianceScore) / 4;
  let overallRiskLevel;
  if (overall >= 75)     overallRiskLevel = 'Low';
  else if (overall >= 50) overallRiskLevel = 'Medium';
  else if (overall >= 30) overallRiskLevel = 'High';
  else                    overallRiskLevel = 'Critical';

  // ── 8. Explanations ──────────────────────────────────────────────────────
  const positiveFactors = positiveItems
    .slice(0, 5)
    .map((i) => allItems.find((x) => x.id === i.id)?.label)
    .filter(Boolean);

  const negativeFactors = negativeItems
    .slice(0, 5)
    .map((i) => allItems.find((x) => x.id === i.id)?.label)
    .filter(Boolean);

  const missingEvidence = openFindings
    .slice(0, 5)
    .map((f) => f.evidenceRequired)
    .filter(Boolean);

  const priorityFixes = findings
    .filter((f) => f.status === 'Open')
    .sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (order[a.riskLevel] ?? 4) - (order[b.riskLevel] ?? 4);
    })
    .slice(0, 4)
    .map((f) => f.recommendedFix || f.title)
    .filter(Boolean);

  // Confidence
  const answeredPct = totalItems > 0 ? answeredItems.length / totalItems : 0;
  let confidenceLevel;
  if (answeredPct >= 0.75 && evidenceAttached >= 3) confidenceLevel = 'High';
  else if (answeredPct >= 0.4 || evidenceAttached >= 1) confidenceLevel = 'Medium';
  else confidenceLevel = 'Low';

  return {
    securityReadinessScore:   securityScore,
    quantumReadinessScore:    quantumScore,
    evidenceCompletenessScore: evidenceScore,
    complianceReadinessScore:  complianceScore,
    overallRiskLevel,
    positiveFactors,
    negativeFactors,
    missingEvidence,
    priorityFixes,
    confidenceLevel,
    calculatedAt: new Date().toISOString(),
    meta: {
      totalChecks:   totalItems,
      answered:      answeredItems.length,
      positive:      positiveItems.length,
      negative:      negativeItems.length,
      unanswered:    unansweredItems.length,
      evidenceCount: evidenceAttached,
      findingCount:  findings.length,
    },
  };
}

/**
 * Generate findings from checklist answers.
 * Only generates findings for 'no' answers where a finding template is defined.
 *
 * @param {object} checklistResponses
 * @param {string} targetId
 * @param {boolean} isDemo
 * @returns {Array} array of finding objects ready to save
 */
export function generateFindingsFromChecklist(checklistResponses = {}, targetId, isDemo = false) {
  const allItems = CHECKLIST_SECTIONS.flatMap((s) => s.items);
  const now = new Date().toISOString();
  const findings = [];

  for (const item of allItems) {
    const resp = checklistResponses[item.id];
    if (!resp || resp.answer !== 'no') continue;
    if (!item.finding) continue;

    const id = `finding_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${item.id}`;
    findings.push({
      id,
      targetId,
      checkItemId: item.id,
      title: item.finding.title,
      category: item.category,
      riskLevel: item.riskIfNo || 'Medium',
      businessImpact: item.finding.businessImpact,
      technicalExplanation: item.finding.technicalExplanation,
      complianceRelevance: item.finding.complianceRelevance,
      quantumReadinessRelevance: item.finding.quantumReadinessRelevance,
      recommendedFix: item.finding.recommendedFix,
      evidenceRequired: item.finding.evidenceRequired,
      priority: findings.length + 1,
      confidenceLevel: 'Medium',
      status: 'Open',
      createdAt: now,
      updatedAt: now,
      isDemo,
      generatedFrom: 'checklist',
    });
  }

  // Sort by risk severity
  const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  findings.sort((a, b) => (order[a.riskLevel] ?? 4) - (order[b.riskLevel] ?? 4));
  findings.forEach((f, i) => { f.priority = i + 1; });

  return findings;
}

/**
 * Add gap findings for unanswered critical items.
 * Creates "Unknown/Not assessed" findings for high-risk unchecked items.
 */
export function generateGapFindings(checklistResponses = {}, targetId, isDemo = false) {
  const allItems = CHECKLIST_SECTIONS.flatMap((s) => s.items);
  const now = new Date().toISOString();
  const gaps = [];

  const highRiskItems = allItems.filter((i) =>
    ['Critical', 'High'].includes(i.riskIfNo) &&
    !checklistResponses[i.id]?.answer
  );

  for (const item of highRiskItems) {
    const id = `gap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${item.id}`;
    gaps.push({
      id,
      targetId,
      checkItemId: item.id,
      title: `Evidence gap: "${item.label}" — not assessed`,
      category: 'Evidence Gap',
      riskLevel: 'Medium',
      businessImpact: `This item has not been assessed. If the check fails, risk could be ${item.riskIfNo}.`,
      technicalExplanation: `The checklist item "${item.label}" was not completed. This creates an evidence gap that reduces confidence in the overall score.`,
      complianceRelevance: 'Incomplete assessments cannot fully support compliance claims.',
      quantumReadinessRelevance: item.category === 'Quantum Readiness'
        ? 'This is a quantum readiness check — gaps here reduce quantum readiness confidence.'
        : 'Not directly quantum-related.',
      recommendedFix: `Complete the "${item.label}" checklist item and attach relevant evidence.`,
      evidenceRequired: 'Assessment completion or evidence demonstrating the control is in place.',
      priority: 99,
      confidenceLevel: 'Low',
      status: 'Open',
      createdAt: now,
      updatedAt: now,
      isDemo,
      generatedFrom: 'gap_analysis',
    });
  }

  return gaps;
}

// ─── Score display helpers ─────────────────────────────────────────────────────
export function scoreColour(score) {
  if (score >= 75) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  if (score >= 30) return 'var(--risk-high)';
  return 'var(--risk-critical)';
}

export function riskColour(level) {
  const l = (level || '').toLowerCase();
  if (l === 'low')      return 'var(--success)';
  if (l === 'medium')   return 'var(--warning)';
  if (l === 'high')     return 'var(--risk-high)';
  if (l === 'critical') return 'var(--risk-critical)';
  return 'var(--text-muted)';
}

export function confidenceLabel(level) {
  if (level === 'High')   return 'High confidence — good evidence coverage';
  if (level === 'Medium') return 'Medium confidence — partial evidence';
  return 'Low confidence — limited evidence or many unanswered checks';
}
