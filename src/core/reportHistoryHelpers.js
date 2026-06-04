/**
 * QUANTUM COMPLIANCE OS™ — reportHistoryHelpers.js
 * Run 12: Reports, Evidence History + Risk Comparison — Helper Functions
 * =======================================================================
 * Pure helper functions for report history, evidence archive, assessment
 * snapshots, risk comparison, urgent actions, and portfolio summaries.
 *
 * All helpers fail safely — if data is missing or malformed, they return
 * sensible empty/zero defaults and never throw.
 *
 * No side effects. No localStorage access. No state mutations.
 * Safe to import anywhere.
 *
 * IMPORTANT DISCLAIMER:
 * Risk scores and recommendations are advisory and require qualified
 * human review. Quantum-readiness guidance does not guarantee legal,
 * regulatory, or security compliance.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

// ─── Report helpers ───────────────────────────────────────────────────────────

/**
 * Return all reports for a given clientId, newest first.
 */
export function getReportsByClientId(reports = [], clientId) {
  if (!clientId || !Array.isArray(reports)) return [];
  return [...reports]
    .filter((r) => r && r.clientId === clientId)
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

/**
 * Return the most recent (non-archived) report for a client.
 */
export function getLatestReportForClient(reports = [], clientId) {
  const clientReports = getReportsByClientId(reports, clientId)
    .filter((r) => r.status !== 'archived');
  return clientReports[0] || null;
}

/**
 * Return all reports with a given status.
 */
export function getReportsByStatus(reports = [], status) {
  return (reports || []).filter((r) => r && r.status === status);
}

// ─── Evidence helpers ─────────────────────────────────────────────────────────

/**
 * Return all evidence items for a given clientId, sorted by priority then date.
 */
export function getEvidenceByClientId(evidenceItems = [], clientId) {
  if (!clientId || !Array.isArray(evidenceItems)) return [];
  const ORDER = { high: 0, medium: 1, low: 2 };
  return [...evidenceItems]
    .filter((e) => e && e.clientId === clientId)
    .sort((a, b) => {
      const pa = ORDER[a.priority] ?? 2;
      const pb = ORDER[b.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
    });
}

/**
 * Return evidence items for a clientId filtered by status.
 */
export function getMissingEvidenceForClient(evidenceItems = [], clientId) {
  return getEvidenceByClientId(evidenceItems, clientId)
    .filter((e) => ['missing', 'incomplete'].includes(e.status));
}

/**
 * Calculate evidence completion percentage for a client (0–100).
 * complete=100%, partial=50%, incomplete/missing/not-required=0%.
 */
export function getEvidenceCompletionForClient(evidenceItems = [], clientId) {
  const items = getEvidenceByClientId(evidenceItems, clientId)
    .filter((e) => e.status !== 'not-required');
  if (items.length === 0) return null;
  const score = items.reduce((acc, e) => {
    if (e.status === 'complete')    return acc + 100;
    if (e.status === 'partial')     return acc + 50;
    return acc;
  }, 0);
  return Math.round(score / items.length);
}

/**
 * Return all evidence items for a report.
 */
export function getEvidenceByReportId(evidenceItems = [], reportId) {
  return (evidenceItems || []).filter((e) => e && e.reportId === reportId);
}

// ─── Snapshot helpers ─────────────────────────────────────────────────────────

/**
 * Return all snapshots for a clientId, newest first.
 */
export function getSnapshotsByClientId(snapshots = [], clientId) {
  if (!clientId || !Array.isArray(snapshots)) return [];
  return [...snapshots]
    .filter((s) => s && s.clientId === clientId)
    .sort((a, b) => (b.snapshotDate || '').localeCompare(a.snapshotDate || ''));
}

/**
 * Return the latest snapshot for a client.
 */
export function getLatestSnapshotForClient(snapshots = [], clientId) {
  return getSnapshotsByClientId(snapshots, clientId)[0] || null;
}

// ─── Priority / urgent action helpers ────────────────────────────────────────

/**
 * Calculate priority actions for a single client.
 * Returns an array of advisory action objects.
 * Always advisory — require human consultant review.
 */
export function getPriorityActionsForClient(client, evidenceItems = [], reports = []) {
  if (!client) return [];
  const actions = [];

  const clientEvidence = getEvidenceByClientId(evidenceItems, client.id);
  const missingEvidence = clientEvidence.filter((e) => e.status === 'missing');
  const latestReport = getLatestReportForClient(reports, client.id);

  if (client.riskLevel === 'high') {
    actions.push({
      id:          `action_high_risk_${client.id}`,
      clientId:    client.id,
      clientName:  client.name,
      title:       'High Risk Client Requires Immediate Attention',
      reason:      'Client is classified as high risk. Immediate review and remediation planning is required.',
      priority:    'high',
      linkedReport: latestReport?.id || null,
      suggestion:  'Schedule priority review meeting and initiate cryptography audit.',
    });
  }

  if (client.securityScore != null && client.securityScore < 50) {
    actions.push({
      id:          `action_low_sec_${client.id}`,
      clientId:    client.id,
      clientName:  client.name,
      title:       'Security Score Below Threshold',
      reason:      `Security score of ${client.securityScore}% is below the 50% advisory threshold.`,
      priority:    'high',
      linkedReport: latestReport?.id || null,
      suggestion:  'Review security assessment findings and prioritise remediation of critical gaps.',
    });
  }

  if (client.quantumReadinessScore != null && client.quantumReadinessScore < 30) {
    actions.push({
      id:          `action_low_qr_${client.id}`,
      clientId:    client.id,
      clientName:  client.name,
      title:       'Quantum Readiness Score Critically Low',
      reason:      `Quantum readiness score of ${client.quantumReadinessScore}% indicates critical post-quantum exposure.`,
      priority:    'high',
      linkedReport: latestReport?.id || null,
      suggestion:  'Initiate cryptography inventory and post-quantum migration planning immediately.',
    });
  }

  if (client.assessmentStatus === 'review-needed') {
    actions.push({
      id:          `action_review_${client.id}`,
      clientId:    client.id,
      clientName:  client.name,
      title:       'Assessment Awaiting Review',
      reason:      'Client assessment is marked as review-needed and requires consultant sign-off.',
      priority:    'medium',
      linkedReport: latestReport?.id || null,
      suggestion:  'Review assessment findings and update status or generate final report.',
    });
  }

  if (missingEvidence.length > 0) {
    actions.push({
      id:          `action_missing_ev_${client.id}`,
      clientId:    client.id,
      clientName:  client.name,
      title:       `${missingEvidence.length} Missing Evidence Item${missingEvidence.length > 1 ? 's' : ''}`,
      reason:      `Evidence items are missing: ${missingEvidence.slice(0,2).map((e) => e.title).join(', ')}${missingEvidence.length > 2 ? ` +${missingEvidence.length - 2} more` : ''}.`,
      priority:    missingEvidence.some((e) => e.priority === 'high') ? 'high' : 'medium',
      linkedReport: latestReport?.id || null,
      suggestion:  'Chase outstanding evidence from client and update records when received.',
    });
  }

  // Overdue evidence
  const today = new Date().toISOString().slice(0, 10);
  const overdue = clientEvidence.filter((e) => e.dueDate && e.dueDate < today && !['complete','not-required'].includes(e.status));
  if (overdue.length > 0) {
    actions.push({
      id:          `action_overdue_${client.id}`,
      clientId:    client.id,
      clientName:  client.name,
      title:       `${overdue.length} Overdue Evidence Item${overdue.length > 1 ? 's' : ''}`,
      reason:      `${overdue.length} evidence item${overdue.length > 1 ? 's are' : ' is'} past due date.`,
      priority:    'high',
      linkedReport: latestReport?.id || null,
      suggestion:  'Follow up with client immediately regarding overdue evidence submissions.',
    });
  }

  return actions;
}

/**
 * Return all urgent actions across all active clients.
 */
export function getAllUrgentActions(clients = [], evidenceItems = [], reports = []) {
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  return clients
    .filter((c) => !c.archived && c.status !== 'archived')
    .flatMap((c) => getPriorityActionsForClient(c, evidenceItems, reports))
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));
}

// ─── Portfolio helpers ────────────────────────────────────────────────────────

/**
 * Return a full portfolio risk summary from all active clients.
 */
export function getPortfolioRiskSummary(clients = [], evidenceItems = [], reports = []) {
  const active = (clients || []).filter((c) => !c.archived && c.status !== 'archived');
  if (active.length === 0) {
    return {
      total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, unknownRisk: 0,
      avgQuantumScore: null, avgSecurityScore: null, avgEvidenceCompletion: null,
      totalMissingEvidence: 0, totalPriorityActions: 0,
      needsReview: 0, missingEvidenceClients: 0,
    };
  }

  const highRisk   = active.filter((c) => c.riskLevel === 'high').length;
  const mediumRisk = active.filter((c) => c.riskLevel === 'medium').length;
  const lowRisk    = active.filter((c) => c.riskLevel === 'low').length;
  const unknownRisk = active.filter((c) => !c.riskLevel || c.riskLevel === 'unknown').length;
  const needsReview = active.filter((c) => c.assessmentStatus === 'review-needed').length;

  const qScores = active.map((c) => c.quantumReadinessScore).filter((s) => s != null);
  const sScores = active.map((c) => c.securityScore).filter((s) => s != null);
  const evComps = active.map((c) => getEvidenceCompletionForClient(evidenceItems, c.id)).filter((s) => s != null);

  const avgQ = qScores.length ? Math.round(qScores.reduce((a, b) => a + b, 0) / qScores.length) : null;
  const avgS = sScores.length ? Math.round(sScores.reduce((a, b) => a + b, 0) / sScores.length) : null;
  const avgEv = evComps.length ? Math.round(evComps.reduce((a, b) => a + b, 0) / evComps.length) : null;

  const totalMissingEvidence = active.reduce((acc, c) =>
    acc + getMissingEvidenceForClient(evidenceItems, c.id).length, 0);
  const missingEvidenceClients = active.filter((c) =>
    getMissingEvidenceForClient(evidenceItems, c.id).length > 0).length;
  const totalPriorityActions = getAllUrgentActions(active, evidenceItems, reports).length;

  return {
    total: active.length, highRisk, mediumRisk, lowRisk, unknownRisk,
    avgQuantumScore: avgQ, avgSecurityScore: avgS, avgEvidenceCompletion: avgEv,
    totalMissingEvidence, totalPriorityActions, needsReview, missingEvidenceClients,
  };
}

/**
 * Return clients sorted/filtered for risk comparison.
 */
export function compareClientsByRisk(clients = []) {
  const RISK_ORDER = { high: 0, medium: 1, low: 2, unknown: 3 };
  return [...(clients || [])]
    .filter((c) => !c.archived && c.status !== 'archived')
    .sort((a, b) => {
      const ra = RISK_ORDER[a.riskLevel] ?? 3;
      const rb = RISK_ORDER[b.riskLevel] ?? 3;
      if (ra !== rb) return ra - rb;
      return (a.quantumReadinessScore ?? 999) - (b.quantumReadinessScore ?? 999);
    });
}

export function sortClientsByQuantumReadiness(clients = []) {
  return [...(clients || [])]
    .filter((c) => !c.archived)
    .sort((a, b) => (a.quantumReadinessScore ?? 999) - (b.quantumReadinessScore ?? 999));
}

export function sortClientsBySecurityScore(clients = []) {
  return [...(clients || [])]
    .filter((c) => !c.archived)
    .sort((a, b) => (a.securityScore ?? 999) - (b.securityScore ?? 999));
}

export function getClientsNeedingReview(clients = []) {
  return (clients || []).filter((c) => !c.archived && c.assessmentStatus === 'review-needed');
}

export function getClientsWithMissingEvidence(clients = [], evidenceItems = []) {
  return (clients || []).filter((c) =>
    !c.archived && getMissingEvidenceForClient(evidenceItems, c.id).length > 0);
}

// ─── consultantStorage extension helpers ──────────────────────────────────────
// These are used by consultantStorage.js setters — thin wrappers over set fn.

export function addReport(setFn, report) {
  setFn((s) => ({
    ...s,
    reports: [...(s.reports || []), { ...report, updatedAt: new Date().toISOString().slice(0,10) }],
  }));
}

export function updateReport(setFn, reportId, patch) {
  setFn((s) => ({
    ...s,
    reports: (s.reports || []).map((r) =>
      r.id === reportId ? { ...r, ...patch, updatedAt: new Date().toISOString().slice(0,10) } : r
    ),
  }));
}

export function addEvidenceItem(setFn, item) {
  setFn((s) => ({
    ...s,
    evidenceItems: [...(s.evidenceItems || []), { ...item, lastUpdated: new Date().toISOString().slice(0,10) }],
  }));
}

export function updateEvidenceItem(setFn, itemId, patch) {
  setFn((s) => ({
    ...s,
    evidenceItems: (s.evidenceItems || []).map((e) =>
      e.id === itemId ? { ...e, ...patch, lastUpdated: new Date().toISOString().slice(0,10) } : e
    ),
  }));
}

export function addSnapshot(setFn, snapshot) {
  setFn((s) => ({
    ...s,
    snapshots: [...(s.snapshots || []), snapshot],
  }));
}

export function loadDemoReportData(setFn, reports, evidenceItems, snapshots) {
  setFn((s) => {
    const existingRids = new Set((s.reports       || []).map((r) => r.id));
    const existingEids = new Set((s.evidenceItems || []).map((e) => e.id));
    const existingSids = new Set((s.snapshots     || []).map((sn) => sn.id));
    return {
      ...s,
      reports:       [...(s.reports       || []), ...reports.filter((r) => !existingRids.has(r.id))],
      evidenceItems: [...(s.evidenceItems || []), ...evidenceItems.filter((e) => !existingEids.has(e.id))],
      snapshots:     [...(s.snapshots     || []), ...snapshots.filter((sn) => !existingSids.has(sn.id))],
    };
  });
}

export function clearDemoReportData(setFn, demoReportIds, demoEvidenceIds, demoSnapshotIds) {
  setFn((s) => ({
    ...s,
    reports:       (s.reports       || []).filter((r)  => !demoReportIds.has(r.id)),
    evidenceItems: (s.evidenceItems || []).filter((e)  => !demoEvidenceIds.has(e.id)),
    snapshots:     (s.snapshots     || []).filter((sn) => !demoSnapshotIds.has(sn.id)),
  }));
}
