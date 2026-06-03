/**
 * QUANTUM COMPLIANCE OS™ — targetAssessmentStorage.js
 * Run 9: Target Assessment Engine — SSOT Extension
 *
 * All operations delegate to the core storage.js setState/getState.
 * No raw localStorage access in this file.
 * Defensive use only. No offensive scanning. No external calls.
 */

import { getState, setState, addActivityLog } from './storage.js';
import { DEMO_TARGETS, DEMO_FINDINGS, DEMO_SCORES } from './targetAssessmentRules.js';
import { computeTargetScores, generateFindingsFromChecklist, generateGapFindings } from './targetAssessmentScoring.js';

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Target Shell (initial state extension) ──────────────────────────────────
export function getTargetAssessmentShell() {
  return {
    targetAssessments: [],
    targetFindings:    [],
    targetEvidence:    [],
    targetScores:      [],
    assessmentSettings: {
      passiveChecksEnabled:         true,
      manualEvidenceEnabled:        true,
      questionnaireEnabled:         true,
      reportIntegrationEnabled:     true,
      allowDemoTargets:             true,
      showBrowserLimitationWarning: true,
    },
    demoTargetsLoaded: false,
  };
}

// ─── Ensure target assessment fields exist in state ──────────────────────────
export function ensureTargetAssessmentState() {
  const s = getState();
  if (!s.targetAssessments) {
    setState((cur) => ({
      ...cur,
      ...getTargetAssessmentShell(),
    }));
  }
}

// ─── Demo targets ─────────────────────────────────────────────────────────────
export function loadDemoTargets() {
  ensureTargetAssessmentState();
  const s = getState();
  if (s.demoTargetsLoaded) return;

  const existingIds = new Set((s.targetAssessments || []).map((t) => t.id));
  const newTargets  = DEMO_TARGETS.filter((t) => !existingIds.has(t.id));
  const existingFindingIds = new Set((s.targetFindings || []).map((f) => f.id));
  const newFindings = DEMO_FINDINGS.filter((f) => !existingFindingIds.has(f.id));
  const existingScoreIds = new Set((s.targetScores || []).map((sc) => sc.id));
  const newScores = DEMO_SCORES.filter((sc) => !existingScoreIds.has(sc.id));

  setState((cur) => ({
    ...cur,
    targetAssessments: [...(cur.targetAssessments || []), ...newTargets],
    targetFindings:    [...(cur.targetFindings    || []), ...newFindings],
    targetScores:      [...(cur.targetScores      || []), ...newScores],
    demoTargetsLoaded: true,
  }));
  addActivityLog({ type: 'demo_targets_loaded', message: 'Demo target assessments loaded.' });
}

export function clearDemoTargets() {
  ensureTargetAssessmentState();
  setState((cur) => ({
    ...cur,
    targetAssessments: (cur.targetAssessments || []).filter((t) => !t.isDemo),
    targetFindings:    (cur.targetFindings    || []).filter((f) => !f.isDemo),
    targetEvidence:    (cur.targetEvidence    || []).filter((e) => !e.isDemo),
    targetScores:      (cur.targetScores      || []).filter((sc) => !sc.isDemo),
    demoTargetsLoaded: false,
  }));
  addActivityLog({ type: 'demo_targets_cleared', message: 'Demo target assessments cleared.' });
}

// ─── Target CRUD ──────────────────────────────────────────────────────────────
export function createTarget(payload) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  const target = {
    id:                    uid('target'),
    clientId:              payload.clientId              || null,
    targetName:            payload.targetName            || '',
    targetType:            payload.targetType            || 'website',
    targetUrl:             payload.targetUrl             || '',
    businessOwner:         payload.businessOwner         || '',
    technicalContact:      payload.technicalContact      || '',
    assessmentPurpose:     payload.assessmentPurpose     || '',
    assessmentScope:       payload.assessmentScope       || '',
    scanMode:              payload.scanMode              || 'manual_evidence',
    status:                'draft',
    tags:                  Array.isArray(payload.tags) ? payload.tags : [],
    notes:                 payload.notes                 || '',
    authorisationConfirmed:    false,
    authorisationConfirmedAt:  null,
    authorisedBy:          payload.authorisedBy          || '',
    checklistResponses:    {},
    createdAt:             now,
    updatedAt:             now,
    isDemo:                payload.isDemo                || false,
  };

  // If authorisation was confirmed on creation
  if (payload.authorisationConfirmed) {
    target.authorisationConfirmed   = true;
    target.authorisationConfirmedAt = now;
    target.status = 'awaiting_authorisation'; // still needs explicit advance
  }

  setState((cur) => ({
    ...cur,
    targetAssessments: [...(cur.targetAssessments || []), target],
  }));
  addActivityLog({ type: 'target_created', message: `Target "${target.targetName}" created.` });
  return target;
}

export function updateTarget(id, payload) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  setState((cur) => ({
    ...cur,
    targetAssessments: (cur.targetAssessments || []).map((t) =>
      t.id === id ? { ...t, ...payload, id, updatedAt: now } : t
    ),
  }));
  addActivityLog({ type: 'target_updated', message: `Target "${payload.targetName || id}" updated.` });
}

export function deleteTarget(id) {
  ensureTargetAssessmentState();
  const state = getState();
  const target = (state.targetAssessments || []).find((t) => t.id === id);
  setState((cur) => ({
    ...cur,
    targetAssessments: (cur.targetAssessments || []).filter((t) => t.id !== id),
    targetFindings:    (cur.targetFindings    || []).filter((f) => f.targetId !== id),
    targetEvidence:    (cur.targetEvidence    || []).filter((e) => e.targetId !== id),
    targetScores:      (cur.targetScores      || []).filter((sc) => sc.targetId !== id),
  }));
  addActivityLog({ type: 'target_deleted', message: `Target "${target?.targetName || id}" deleted.` });
}

// ─── Authorisation ────────────────────────────────────────────────────────────
export function confirmAuthorisation(targetId, authorisedBy) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  const state = getState();
  const target = (state.targetAssessments || []).find((t) => t.id === targetId);
  if (!target) return;

  setState((cur) => ({
    ...cur,
    targetAssessments: (cur.targetAssessments || []).map((t) =>
      t.id === targetId
        ? {
            ...t,
            authorisationConfirmed:   true,
            authorisationConfirmedAt: now,
            authorisedBy:             authorisedBy || t.authorisedBy,
            status: 'ready_for_review',
            updatedAt: now,
          }
        : t
    ),
  }));
  addActivityLog({ type: 'target_authorised', message: `Target "${target.targetName}" authorisation confirmed.` });
}

// ─── Status transitions ────────────────────────────────────────────────────────
export function advanceTargetStatus(targetId, newStatus) {
  ensureTargetAssessmentState();
  const state = getState();
  const target = (state.targetAssessments || []).find((t) => t.id === targetId);
  if (!target) return { ok: false, reason: 'Target not found.' };

  // Block if authorisation required
  if (newStatus !== 'draft' && newStatus !== 'awaiting_authorisation' &&
      !target.authorisationConfirmed) {
    return { ok: false, reason: 'Assessment blocked. You must confirm ownership or written authorisation before running any review.' };
  }

  const now = new Date().toISOString();
  setState((cur) => ({
    ...cur,
    targetAssessments: (cur.targetAssessments || []).map((t) =>
      t.id === targetId ? { ...t, status: newStatus, updatedAt: now } : t
    ),
  }));
  addActivityLog({ type: 'target_status_changed', message: `Target "${target.targetName}" → ${newStatus}.` });
  return { ok: true };
}

// ─── Checklist Responses ──────────────────────────────────────────────────────
export function saveChecklistResponse(targetId, checkItemId, answer, notes = '') {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  setState((cur) => ({
    ...cur,
    targetAssessments: (cur.targetAssessments || []).map((t) =>
      t.id === targetId
        ? {
            ...t,
            checklistResponses: {
              ...t.checklistResponses,
              [checkItemId]: { answer, notes, updatedAt: now },
            },
            updatedAt: now,
          }
        : t
    ),
  }));
}

export function saveAllChecklistResponses(targetId, responses) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  setState((cur) => ({
    ...cur,
    targetAssessments: (cur.targetAssessments || []).map((t) =>
      t.id === targetId
        ? { ...t, checklistResponses: responses, updatedAt: now }
        : t
    ),
  }));
  addActivityLog({ type: 'checklist_saved', message: `Checklist responses saved for target.` });
}

// ─── Generate findings from checklist ─────────────────────────────────────────
export function generateFindings(targetId) {
  ensureTargetAssessmentState();
  const state = getState();
  const target = (state.targetAssessments || []).find((t) => t.id === targetId);
  if (!target) return;

  if (!target.authorisationConfirmed) {
    return { ok: false, reason: 'Assessment blocked. You must confirm ownership or written authorisation before running any review.' };
  }

  const newFindings = generateFindingsFromChecklist(
    target.checklistResponses || {},
    targetId,
    target.isDemo || false
  );
  const gapFindings = generateGapFindings(
    target.checklistResponses || {},
    targetId,
    target.isDemo || false
  );

  // Remove previously auto-generated findings for this target (keep manual ones)
  const existing = (state.targetFindings || []).filter(
    (f) => f.targetId !== targetId || !['checklist', 'gap_analysis'].includes(f.generatedFrom)
  );

  setState((cur) => ({
    ...cur,
    targetFindings: [...existing, ...newFindings, ...gapFindings],
    targetAssessments: (cur.targetAssessments || []).map((t) =>
      t.id === targetId
        ? { ...t, status: 'recommendations_generated', updatedAt: new Date().toISOString() }
        : t
    ),
  }));

  // Recompute scores
  recomputeScores(targetId);
  addActivityLog({ type: 'findings_generated', message: `${newFindings.length + gapFindings.length} findings generated for target "${target.targetName}".` });
  return { ok: true, count: newFindings.length + gapFindings.length };
}

// ─── Findings CRUD ────────────────────────────────────────────────────────────
export function addManualFinding(targetId, payload) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  const state = getState();
  const target = (state.targetAssessments || []).find((t) => t.id === targetId);
  if (!target?.authorisationConfirmed) {
    return { ok: false, reason: 'Assessment blocked until authorisation is confirmed.' };
  }

  const finding = {
    id:                       uid('finding'),
    targetId,
    checkItemId:              null,
    title:                    payload.title                    || '',
    category:                 payload.category                 || 'Manual Review',
    riskLevel:                payload.riskLevel                || 'Medium',
    businessImpact:           payload.businessImpact           || '',
    technicalExplanation:     payload.technicalExplanation     || '',
    complianceRelevance:      payload.complianceRelevance      || '',
    quantumReadinessRelevance:payload.quantumReadinessRelevance|| '',
    recommendedFix:           payload.recommendedFix           || '',
    evidenceRequired:         payload.evidenceRequired         || '',
    priority:                 payload.priority                 || 99,
    confidenceLevel:          payload.confidenceLevel          || 'Medium',
    status:                   'Open',
    createdAt:                now,
    updatedAt:                now,
    isDemo:                   target.isDemo || false,
    generatedFrom:            'manual',
  };

  setState((cur) => ({
    ...cur,
    targetFindings: [...(cur.targetFindings || []), finding],
  }));
  recomputeScores(targetId);
  addActivityLog({ type: 'finding_added', message: `Manual finding "${finding.title}" added.` });
  return { ok: true, finding };
}

export function updateFinding(id, payload) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  const state = getState();
  const finding = (state.targetFindings || []).find((f) => f.id === id);
  setState((cur) => ({
    ...cur,
    targetFindings: (cur.targetFindings || []).map((f) =>
      f.id === id ? { ...f, ...payload, id, updatedAt: now } : f
    ),
  }));
  if (finding?.targetId) recomputeScores(finding.targetId);
}

export function deleteFinding(id) {
  ensureTargetAssessmentState();
  const state = getState();
  const finding = (state.targetFindings || []).find((f) => f.id === id);
  setState((cur) => ({
    ...cur,
    targetFindings: (cur.targetFindings || []).filter((f) => f.id !== id),
  }));
  if (finding?.targetId) recomputeScores(finding.targetId);
}

// ─── Evidence CRUD ────────────────────────────────────────────────────────────
export function addEvidence(targetId, payload) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  const state = getState();
  const target = (state.targetAssessments || []).find((t) => t.id === targetId);

  const item = {
    id:             uid('evidence'),
    targetId,
    findingId:      payload.findingId      || null,
    checkItemId:    payload.checkItemId    || null,
    evidenceTitle:  payload.evidenceTitle  || '',
    evidenceType:   payload.evidenceType   || 'note',
    description:    payload.description    || '',
    source:         payload.source         || '',
    uploadedAt:     now,
    reviewerNotes:  payload.reviewerNotes  || '',
    status:         'submitted',
    isDemo:         target?.isDemo         || false,
  };

  setState((cur) => ({
    ...cur,
    targetEvidence: [...(cur.targetEvidence || []), item],
  }));
  recomputeScores(targetId);
  addActivityLog({ type: 'evidence_added', message: `Evidence "${item.evidenceTitle}" added for target.` });
  return item;
}

export function updateEvidence(id, payload) {
  ensureTargetAssessmentState();
  const now = new Date().toISOString();
  setState((cur) => ({
    ...cur,
    targetEvidence: (cur.targetEvidence || []).map((e) =>
      e.id === id ? { ...e, ...payload, id } : e
    ),
  }));
}

export function deleteEvidence(id) {
  ensureTargetAssessmentState();
  const state = getState();
  const item = (state.targetEvidence || []).find((e) => e.id === id);
  setState((cur) => ({
    ...cur,
    targetEvidence: (cur.targetEvidence || []).filter((e) => e.id !== id),
  }));
  if (item?.targetId) recomputeScores(item.targetId);
}

// ─── Score recomputation ──────────────────────────────────────────────────────
export function recomputeScores(targetId) {
  ensureTargetAssessmentState();
  const state = getState();
  const target = (state.targetAssessments || []).find((t) => t.id === targetId);
  if (!target) return;

  const findings = (state.targetFindings || []).filter((f) => f.targetId === targetId && !f.isDemo);
  const evidence = (state.targetEvidence || []).filter((e) => e.targetId === targetId && !e.isDemo);

  const scores = computeTargetScores(
    target.checklistResponses || {},
    evidence,
    findings
  );

  const scoreRecord = {
    id:       uid('score'),
    targetId,
    ...scores,
    isDemo: target.isDemo || false,
  };

  setState((cur) => ({
    ...cur,
    targetScores: [
      ...(cur.targetScores || []).filter((sc) => sc.targetId !== targetId),
      scoreRecord,
    ],
  }));

  return scoreRecord;
}

// ─── Selectors ────────────────────────────────────────────────────────────────
export function getTargets(workspaceMode = 'product') {
  ensureTargetAssessmentState();
  const s = getState();
  const targets = s.targetAssessments || [];
  if (workspaceMode === 'demo') return targets;
  return targets.filter((t) => !t.isDemo);
}

export function getTarget(id) {
  ensureTargetAssessmentState();
  const s = getState();
  return (s.targetAssessments || []).find((t) => t.id === id) || null;
}

export function getTargetFindings(targetId) {
  ensureTargetAssessmentState();
  const s = getState();
  return (s.targetFindings || []).filter((f) => f.targetId === targetId);
}

export function getTargetEvidence(targetId) {
  ensureTargetAssessmentState();
  const s = getState();
  return (s.targetEvidence || []).filter((e) => e.targetId === targetId);
}

export function getTargetScore(targetId) {
  ensureTargetAssessmentState();
  const s = getState();
  return (s.targetScores || []).find((sc) => sc.targetId === targetId) || null;
}

export function getAssessmentSettings() {
  ensureTargetAssessmentState();
  const s = getState();
  return s.assessmentSettings || getTargetAssessmentShell().assessmentSettings;
}

export function updateAssessmentSettings(payload) {
  ensureTargetAssessmentState();
  setState((cur) => ({
    ...cur,
    assessmentSettings: { ...cur.assessmentSettings, ...payload },
  }));
}
