/**
 * QUANTUM COMPLIANCE OS™ — aiAgents.js
 * Run 16: Built-In AI Agents + Open-Source AI Provider Options
 * =============================================================
 * AI settings model, provider registry (8 providers), agent registry
 * (7 agents), guardrail system, mock response engine, secret blocking,
 * and all AI helper functions.
 *
 * SAFETY RULES (always enforced):
 * - Mock/Demo AI is always the default and fallback provider
 * - No external AI calls in mock mode (zero network traffic)
 * - No autonomous record deletion, mutation, or backend writes
 * - No legal/compliance/security guarantees in any response
 * - No evidence fabrication
 * - No exposure of backend secrets in prompts
 * - Blocked secrets are never saved, logged, or included in prompts
 * - Every AI response includes advisory + human review wording
 * - AI cannot make final compliance/legal/security decisions
 * - Human confirmation required for any record change suggestions
 *
 * DISCLAIMER:
 * AI outputs are advisory and require qualified human review.
 * Quantum-readiness guidance does not guarantee legal, regulatory,
 * or security compliance. AI agents must not fabricate evidence or
 * certify compliance. External AI providers may process submitted
 * prompts according to their own policies.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import { getState, setState, addActivityLog } from './storage.js';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const AI_PROVIDER_ID = {
  MOCK:              'mock',
  OPENAI_COMPATIBLE: 'openaiCompatible',
  OLLAMA:            'ollama',
  LM_STUDIO:         'lmStudio',
  OPEN_ROUTER:       'openRouter',
  GROQ:              'groq',
  HUGGING_FACE:      'huggingFace',
  CUSTOM_ENDPOINT:   'customEndpoint',
};

export const AI_PROVIDER_TYPE = {
  LOCAL_DEMO:  'local-demo',
  LOCAL_API:   'local-api',
  REMOTE_API:  'remote-api',
  CUSTOM_API:  'custom-api',
};

export const AI_AGENT_ID = {
  COMPLIANCE_GAP:      'complianceGapAgent',
  QUANTUM_READINESS:   'quantumReadinessAgent',
  SECURITY_EVIDENCE:   'securityEvidenceAgent',
  CONSULTANT_REPORT:   'consultantReportAgent',
  CLIENT_ONBOARDING:   'clientOnboardingAgent',
  BACKEND_SETUP:       'backendSetupAgent',
  WHITE_LABEL_SETUP:   'whiteLabelSetupAgent',
};

export const AI_CONFIDENCE = {
  LOW:    'low',
  MEDIUM: 'medium',
  HIGH:   'high',
};

export const AI_CONTEXT_KEY = {
  CURRENT_CLIENT:    'currentClient',
  CURRENT_REPORT:    'currentReport',
  EVIDENCE_ITEMS:    'evidenceItems',
  RISK_SUMMARY:      'riskSummary',
  URGENT_ACTIONS:    'urgentActions',
  MISSING_EVIDENCE:  'missingEvidence',
  AGENCY_SETTINGS:   'agencySettings',
  WHITE_LABEL:       'whiteLabelSettings',
  BACKEND_STATUS:    'backendStatus',
  PRODUCT_MODE:      'productMode',
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKED SECRET PATTERNS (AI-specific extension of backendSync.js patterns)
// ─────────────────────────────────────────────────────────────────────────────

const AI_BLOCKED_PATTERNS = [
  /service_role/i,
  /database_url/i,
  /jwt_secret/i,
  /private_key/i,
  /webhook_secret/i,
  /admin_token/i,
  /secret_key/i,
  /stripe_secret/i,
  /aws_secret_access_key/i,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/i,
  /firebase.*admin.*private/i,
];

function isSupabaseServiceRole(value) {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  try { return JSON.parse(atob(parts[1]))?.role === 'service_role'; } catch { return false; }
}

/**
 * detectBlockedAISecrets — checks if a string value is a blocked secret.
 * Returns { blocked: boolean, reason: string }.
 * Never logs the value.
 */
export function detectBlockedAISecrets(value) {
  if (!value || typeof value !== 'string') return { blocked: false, reason: '' };
  const v = value.trim();
  if (isSupabaseServiceRole(v)) {
    return { blocked: true, reason: 'Supabase service role key detected. Use only anon/public keys.' };
  }
  for (const p of AI_BLOCKED_PATTERNS) {
    if (p.test(v)) {
      return { blocked: true, reason: 'This looks like a backend-only or private secret and was not saved. Use only demo-safe or client-safe provider configuration.' };
    }
  }
  return { blocked: false, reason: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT AI SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export function getDefaultAISettings() {
  return {
    enabled:                    true,
    defaultProvider:            AI_PROVIDER_ID.MOCK,
    activeProvider:             AI_PROVIDER_ID.MOCK,
    safeModeEnabled:            true,
    humanReviewRequired:        true,
    allowRecordSuggestions:     true,
    allowDirectRecordMutation:  false,
    allowEvidenceFabrication:   false,
    allowLegalFinalAdvice:      false,
    allowComplianceGuarantees:  false,
    allowSecurityGuarantees:    false,
    showConfidenceIndicators:   true,
    showSourceContext:           true,
    logAgentMessagesLocally:    true,
    updatedAt:                  new Date().toISOString().slice(0, 10),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const AI_PROVIDERS = {
  [AI_PROVIDER_ID.MOCK]: {
    id:                   AI_PROVIDER_ID.MOCK,
    name:                 'Demo / Mock AI',
    status:               'active',
    type:                 AI_PROVIDER_TYPE.LOCAL_DEMO,
    configured:           true,
    requiresApiKey:       false,
    supportsLocalModels:  false,
    supportsStreaming:     false,
    baseUrl:              '',
    modelName:            'quantum-compliance-demo-agent',
    apiKeyMasked:         '',
    icon:                 '🤖',
    colour:               '#10b981',
    description:          'Safe demo AI responses for presentation and testing without external API calls. Always available as the default and fallback provider.',
    setupNote:            null,
    warningNote:          null,
  },
  [AI_PROVIDER_ID.OPENAI_COMPATIBLE]: {
    id:                   AI_PROVIDER_ID.OPENAI_COMPATIBLE,
    name:                 'OpenAI-Compatible API',
    status:               'not-configured',
    type:                 AI_PROVIDER_TYPE.REMOTE_API,
    configured:           false,
    requiresApiKey:       true,
    supportsLocalModels:  false,
    supportsStreaming:     true,
    baseUrl:              'https://api.openai.com/v1',
    modelName:            'gpt-4o-mini',
    apiKeyMasked:         '',
    icon:                 '⚡',
    colour:               '#6b7280',
    description:          'Generic OpenAI-compatible endpoint for hosted model providers (OpenAI, Azure OpenAI, etc.).',
    setupNote:            'Requires an API key from your provider dashboard.',
    warningNote:          'Only use keys intended for this frontend/demo environment. Do not paste backend-only secrets or private organisational keys into this app.',
  },
  [AI_PROVIDER_ID.OLLAMA]: {
    id:                   AI_PROVIDER_ID.OLLAMA,
    name:                 'Ollama Local Models',
    status:               'not-configured',
    type:                 AI_PROVIDER_TYPE.LOCAL_API,
    configured:           false,
    requiresApiKey:       false,
    supportsLocalModels:  true,
    supportsStreaming:     true,
    baseUrl:              'http://localhost:11434',
    modelName:            'llama3.1',
    apiKeyMasked:         '',
    icon:                 '🦙',
    colour:               '#6b7280',
    description:          'Local open-source model provider for Llama, Mistral, Qwen, Gemma, Phi, and compatible local models. No API key required.',
    setupNote:            'Local server must be running on this device/network. Browser access may require CORS/local server configuration.',
    warningNote:          null,
  },
  [AI_PROVIDER_ID.LM_STUDIO]: {
    id:                   AI_PROVIDER_ID.LM_STUDIO,
    name:                 'LM Studio Local Server',
    status:               'not-configured',
    type:                 AI_PROVIDER_TYPE.LOCAL_API,
    configured:           false,
    requiresApiKey:       false,
    supportsLocalModels:  true,
    supportsStreaming:     true,
    baseUrl:              'http://localhost:1234/v1',
    modelName:            '',
    apiKeyMasked:         '',
    icon:                 '🖥',
    colour:               '#6b7280',
    description:          'Local OpenAI-compatible server for running local models through LM Studio. No API key required.',
    setupNote:            'Local server must be running on this device/network. Browser access may require CORS/local server configuration.',
    warningNote:          null,
  },
  [AI_PROVIDER_ID.OPEN_ROUTER]: {
    id:                   AI_PROVIDER_ID.OPEN_ROUTER,
    name:                 'OpenRouter-Compatible',
    status:               'not-configured',
    type:                 AI_PROVIDER_TYPE.REMOTE_API,
    configured:           false,
    requiresApiKey:       true,
    supportsLocalModels:  false,
    supportsStreaming:     true,
    baseUrl:              'https://openrouter.ai/api/v1',
    modelName:            '',
    apiKeyMasked:         '',
    icon:                 '🔀',
    colour:               '#6b7280',
    description:          'Hosted model router supporting multiple commercial and open-source model families via OpenAI-compatible API.',
    setupNote:            'Requires an OpenRouter API key from openrouter.ai.',
    warningNote:          'Only use keys intended for this frontend/demo environment. Production deployments should proxy AI calls through a backend.',
  },
  [AI_PROVIDER_ID.GROQ]: {
    id:                   AI_PROVIDER_ID.GROQ,
    name:                 'Groq-Compatible',
    status:               'not-configured',
    type:                 AI_PROVIDER_TYPE.REMOTE_API,
    configured:           false,
    requiresApiKey:       true,
    supportsLocalModels:  false,
    supportsStreaming:     true,
    baseUrl:              'https://api.groq.com/openai/v1',
    modelName:            'llama-3.1-8b-instant',
    apiKeyMasked:         '',
    icon:                 '🚀',
    colour:               '#6b7280',
    description:          'Fast hosted inference provider with OpenAI-compatible API. Supports Llama and Mixtral families.',
    setupNote:            'Requires a Groq API key from console.groq.com.',
    warningNote:          'Only use keys intended for this frontend/demo environment. Production deployments should proxy AI calls through a backend.',
  },
  [AI_PROVIDER_ID.HUGGING_FACE]: {
    id:                   AI_PROVIDER_ID.HUGGING_FACE,
    name:                 'Hugging Face Endpoint',
    status:               'not-configured',
    type:                 AI_PROVIDER_TYPE.REMOTE_API,
    configured:           false,
    requiresApiKey:       true,
    supportsLocalModels:  false,
    supportsStreaming:     false,
    baseUrl:              '',
    modelName:            '',
    apiKeyMasked:         '',
    icon:                 '🤗',
    colour:               '#6b7280',
    description:          'Custom Hugging Face Inference Endpoint for suitable text-generation models.',
    setupNote:            'Requires a Hugging Face API token and a deployed Inference Endpoint URL.',
    warningNote:          'Only use tokens intended for this frontend/demo environment. Production deployments should proxy AI calls through a backend.',
  },
  [AI_PROVIDER_ID.CUSTOM_ENDPOINT]: {
    id:                   AI_PROVIDER_ID.CUSTOM_ENDPOINT,
    name:                 'Custom OpenAI-Compatible Endpoint',
    status:               'not-configured',
    type:                 AI_PROVIDER_TYPE.CUSTOM_API,
    configured:           false,
    requiresApiKey:       'optional',
    supportsLocalModels:  true,
    supportsStreaming:     false,
    baseUrl:              '',
    modelName:            '',
    apiKeyMasked:         '',
    icon:                 '🔌',
    colour:               '#6b7280',
    description:          'Custom endpoint for self-hosted or third-party OpenAI-compatible model servers.',
    setupNote:            'API key is optional. Provide the full base URL of your compatible endpoint.',
    warningNote:          'Do not use backend-only admin tokens or private secrets in frontend config.',
  },
};

export const AI_PROVIDER_ORDER = [
  AI_PROVIDER_ID.MOCK,
  AI_PROVIDER_ID.OLLAMA,
  AI_PROVIDER_ID.LM_STUDIO,
  AI_PROVIDER_ID.OPENAI_COMPATIBLE,
  AI_PROVIDER_ID.OPEN_ROUTER,
  AI_PROVIDER_ID.GROQ,
  AI_PROVIDER_ID.HUGGING_FACE,
  AI_PROVIDER_ID.CUSTOM_ENDPOINT,
];

// ─────────────────────────────────────────────────────────────────────────────
// AI AGENT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const AI_AGENTS = {
  [AI_AGENT_ID.COMPLIANCE_GAP]: {
    id:               AI_AGENT_ID.COMPLIANCE_GAP,
    displayName:      '4P3X Intelligent AI™ 1',
    title:            'Compliance Gap Agent',
    enabled:          true,
    category:         'compliance',
    icon:             '🔍',
    colour:           '#3b82f6',
    purpose:          'Explain compliance gaps, missing controls, weak evidence, and next consultant actions based on visible records.',
    allowedActions: [
      'Summarise known client and report data',
      'Highlight missing or weak evidence based on records',
      'Suggest consultant review actions',
      'Explain advisory risk flags and their meaning',
    ],
    forbiddenActions: [
      'Claim legal compliance',
      'Certify compliance to any standard',
      'Give final legal advice',
      'Invent or fabricate evidence',
      'Delete or alter records',
    ],
    defaultContext:     [AI_CONTEXT_KEY.CURRENT_CLIENT, AI_CONTEXT_KEY.CURRENT_REPORT, AI_CONTEXT_KEY.EVIDENCE_ITEMS, AI_CONTEXT_KEY.RISK_SUMMARY],
    humanReviewRequired: true,
    advisoryOnly:        true,
  },
  [AI_AGENT_ID.QUANTUM_READINESS]: {
    id:               AI_AGENT_ID.QUANTUM_READINESS,
    displayName:      '4P3X Intelligent AI™ 2',
    title:            'Quantum Readiness Agent',
    enabled:          true,
    category:         'quantum',
    icon:             '⚛',
    colour:           '#8b5cf6',
    purpose:          'Explain quantum-readiness risk, cryptography inventory gaps, supplier risk, migration planning, and post-quantum preparation guidance.',
    allowedActions: [
      'Explain quantum-readiness score meaning',
      'Suggest cryptography inventory steps',
      'Highlight supplier evidence gaps',
      'Prioritise migration planning actions',
    ],
    forbiddenActions: [
      'Certify post-quantum readiness',
      'Guarantee cryptographic safety',
      'Claim regulatory approval',
      'Recommend unsafe technical changes without human review',
    ],
    defaultContext:   [AI_CONTEXT_KEY.CURRENT_CLIENT, AI_CONTEXT_KEY.RISK_SUMMARY, AI_CONTEXT_KEY.MISSING_EVIDENCE],
    humanReviewRequired: true,
    advisoryOnly:        true,
  },
  [AI_AGENT_ID.SECURITY_EVIDENCE]: {
    id:               AI_AGENT_ID.SECURITY_EVIDENCE,
    displayName:      '4P3X Intelligent AI™ 3',
    title:            'Security Evidence Agent',
    enabled:          true,
    category:         'evidence',
    icon:             '📂',
    colour:           '#f59e0b',
    purpose:          'Review evidence completeness, flag missing documentation, identify weak evidence records, and explain audit-readiness gaps.',
    allowedActions: [
      'Summarise evidence status from visible records',
      'Flag missing, incomplete, or partial evidence items',
      'Suggest evidence collection tasks for the consultant',
      'Explain evidence archive status and gaps',
    ],
    forbiddenActions: [
      'Fabricate evidence records',
      'Mark evidence complete without user confirmation',
      'Upload or verify external evidence automatically',
      'Claim audit certification',
    ],
    defaultContext:   [AI_CONTEXT_KEY.EVIDENCE_ITEMS, AI_CONTEXT_KEY.MISSING_EVIDENCE, AI_CONTEXT_KEY.CURRENT_REPORT],
    humanReviewRequired: true,
    advisoryOnly:        true,
  },
  [AI_AGENT_ID.CONSULTANT_REPORT]: {
    id:               AI_AGENT_ID.CONSULTANT_REPORT,
    displayName:      '4P3X Intelligent AI™ 4',
    title:            'Consultant Report Agent',
    enabled:          true,
    category:         'reporting',
    icon:             '📄',
    colour:           '#10b981',
    purpose:          'Help draft client-ready report language from existing data, rewrite recommendations clearly, and produce advisory report sections.',
    allowedActions: [
      'Draft report summaries from visible records',
      'Suggest executive-level wording',
      'Rewrite recommendations in clear language',
      'Produce advisory report sections for human review',
    ],
    forbiddenActions: [
      'Claim final certification in report output',
      'Fabricate scores or facts',
      'Remove human review wording from outputs',
      'Submit or publish final reports automatically',
    ],
    defaultContext:   [AI_CONTEXT_KEY.CURRENT_REPORT, AI_CONTEXT_KEY.CURRENT_CLIENT, AI_CONTEXT_KEY.RISK_SUMMARY, AI_CONTEXT_KEY.URGENT_ACTIONS],
    humanReviewRequired: true,
    advisoryOnly:        true,
  },
  [AI_AGENT_ID.CLIENT_ONBOARDING]: {
    id:               AI_AGENT_ID.CLIENT_ONBOARDING,
    displayName:      '4P3X Intelligent AI™ 5',
    title:            'Client Onboarding Agent',
    enabled:          true,
    category:         'onboarding',
    icon:             '🧭',
    colour:           '#00d4ff',
    purpose:          'Guide consultants through adding clients, collecting assessment data, setting evidence expectations, and preparing the first report.',
    allowedActions: [
      'Explain onboarding steps and workflow',
      'Suggest client setup checklist items',
      'Explain required fields and their purpose',
      'Guide through demo/live mode differences',
    ],
    forbiddenActions: [
      'Create real clients without confirmation',
      'Send external communications on behalf of user',
      'Collect sensitive secrets or credentials',
      'Guarantee onboarding completeness',
    ],
    defaultContext:   [AI_CONTEXT_KEY.PRODUCT_MODE, AI_CONTEXT_KEY.CURRENT_CLIENT],
    humanReviewRequired: true,
    advisoryOnly:        true,
  },
  [AI_AGENT_ID.BACKEND_SETUP]: {
    id:               AI_AGENT_ID.BACKEND_SETUP,
    displayName:      '4P3X Intelligent AI™ 6',
    title:            'Backend Setup Agent',
    enabled:          true,
    category:         'backend',
    icon:             '🔌',
    colour:           '#D4AF37',
    purpose:          'Explain safe backend setup for Supabase/Firebase/AWS/custom provider using Run 15 backend settings. Guides public-config-only approach.',
    allowedActions: [
      'Explain public/client-safe config requirements',
      'Explain RLS requirement and why it matters',
      'Explain localStorage fallback behaviour',
      'Explain sync status and queue foundation',
      'Explain Supabase SQL setup file location',
    ],
    forbiddenActions: [
      'Ask for service-role keys',
      'Ask for private database URLs',
      'Ask for JWT secrets or private keys',
      'Store or expose blocked secrets',
      'Bypass or disable RLS',
    ],
    defaultContext:   [AI_CONTEXT_KEY.BACKEND_STATUS, AI_CONTEXT_KEY.PRODUCT_MODE],
    humanReviewRequired: true,
    advisoryOnly:        true,
  },
  [AI_AGENT_ID.WHITE_LABEL_SETUP]: {
    id:               AI_AGENT_ID.WHITE_LABEL_SETUP,
    displayName:      '4P3X Intelligent AI™ 7',
    title:            'White Label Setup Agent',
    enabled:          true,
    category:         'agency',
    icon:             '🏢',
    colour:           '#a78bfa',
    purpose:          'Guide agency/white-label configuration, branding preview, custom domain readiness, onboarding wizard placeholder, and SLA placeholder.',
    allowedActions: [
      'Explain agency settings and their purpose',
      'Explain white-label branding preview mode',
      'Explain branding protection rules',
      'Explain custom domain readiness status',
    ],
    forbiddenActions: [
      'Hide Kyzel Kreates™ ownership from internal app areas in this run',
      'Claim real custom domain connection is active',
      'Claim SLA support layer is active',
      'Remove ownership line from internal app areas',
    ],
    defaultContext:   [AI_CONTEXT_KEY.AGENCY_SETTINGS, AI_CONTEXT_KEY.WHITE_LABEL],
    humanReviewRequired: true,
    advisoryOnly:        true,
  },
};

export const AI_AGENT_ORDER = [
  AI_AGENT_ID.COMPLIANCE_GAP,
  AI_AGENT_ID.QUANTUM_READINESS,
  AI_AGENT_ID.SECURITY_EVIDENCE,
  AI_AGENT_ID.CONSULTANT_REPORT,
  AI_AGENT_ID.CLIENT_ONBOARDING,
  AI_AGENT_ID.BACKEND_SETUP,
  AI_AGENT_ID.WHITE_LABEL_SETUP,
];

// ─────────────────────────────────────────────────────────────────────────────
// MOCK AI RESPONSE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_RESPONSES = {
  [AI_AGENT_ID.COMPLIANCE_GAP]: (ctx) => ({
    summary: 'Based on the visible records in Quantum Compliance OS™, this advisory review identifies potential compliance gap areas requiring consultant attention.',
    observedRecords: ctx.hasClient ? `Client workspace loaded. Evidence items visible: ${ctx.evidenceCount ?? 0}. Reports visible: ${ctx.reportCount ?? 0}.` : 'No client context is currently selected.',
    potentialGaps: [
      'Missing or incomplete evidence items may indicate unverified controls.',
      'Risk entries without mitigations should be reviewed by the consultant.',
      'Incomplete evidence categories may affect audit readiness.',
    ],
    suggestedNextSteps: [
      'Review all evidence items flagged as missing or partial.',
      'Engage a qualified compliance professional to validate findings.',
      'Complete assessment sections with supporting documentation.',
    ],
    confidence: AI_CONFIDENCE.MEDIUM,
    advisoryNote: 'Advisory only. Human consultant review required. This output does not constitute legal compliance advice.',
  }),
  [AI_AGENT_ID.QUANTUM_READINESS]: (ctx) => ({
    summary: 'Advisory quantum-readiness analysis based on visible assessment data.',
    observedRecords: ctx.hasClient ? 'Quantum readiness assessment data loaded from local records.' : 'No client context selected.',
    potentialGaps: [
      'Cryptography inventory may be incomplete — identify all systems using RSA, ECC, and symmetric keys.',
      'Supplier quantum risk should be assessed — review third-party cryptographic dependencies.',
      'Post-quantum migration planning requires a documented roadmap reviewed by a qualified cryptographer.',
    ],
    suggestedNextSteps: [
      'Complete the Quantum Readiness assessment section.',
      'Engage a qualified cryptography or cybersecurity professional.',
      'Review NIST post-quantum cryptography standards (FIPS 203, 204, 205).',
    ],
    confidence: AI_CONFIDENCE.MEDIUM,
    advisoryNote: 'Advisory only. Quantum-readiness guidance does not guarantee legal, regulatory, or security compliance. Human expert review required.',
  }),
  [AI_AGENT_ID.SECURITY_EVIDENCE]: (ctx) => ({
    summary: 'Advisory evidence completeness review based on visible evidence records.',
    observedRecords: `Evidence items visible: ${ctx.evidenceCount ?? 0}.`,
    potentialGaps: [
      'Missing evidence items cannot be confirmed as collected without consultant review.',
      'Partial evidence records should be completed before an audit.',
      'Evidence archive gaps may affect compliance posture.',
    ],
    suggestedNextSteps: [
      'Review all evidence items marked as missing or partial.',
      'Collect and attach supporting documentation for each control.',
      'Engage a qualified security professional to verify evidence completeness.',
    ],
    confidence: AI_CONFIDENCE.LOW,
    advisoryNote: 'Advisory only. AI cannot fabricate, verify, or certify evidence. Human review required before any compliance submission.',
  }),
  [AI_AGENT_ID.CONSULTANT_REPORT]: (ctx) => ({
    summary: 'Advisory report language draft — based only on data visible in Quantum Compliance OS™.',
    draft: 'This advisory assessment has identified areas requiring attention across compliance controls, quantum-readiness posture, and evidence completeness. The findings summarised in this report are based on recorded assessment data and should be reviewed by a qualified security and compliance professional before any operational decisions are made.',
    suggestedNextSteps: [
      'Review this draft with the client before finalising.',
      'Add specific control references and evidence citations.',
      'Engage a qualified professional for final report sign-off.',
    ],
    confidence: AI_CONFIDENCE.MEDIUM,
    advisoryNote: 'Advisory only. AI-drafted content requires human review. Do not submit as a final certified report.',
  }),
  [AI_AGENT_ID.CLIENT_ONBOARDING]: () => ({
    summary: 'Advisory onboarding guidance for Quantum Compliance OS™.',
    steps: [
      '1. Add a client profile in the Client Hub.',
      '2. Complete the Organisation Profile for the client.',
      '3. Run the Security Assessment for the client.',
      '4. Run the Quantum Readiness Assessment.',
      '5. Review Recommendations and assign actions.',
      '6. Collect Evidence and build the Evidence Pack.',
      '7. Generate a Report from the completed assessment.',
    ],
    suggestedNextSteps: [
      'Use Demo Mode to explore the platform before adding live clients.',
      'Switch to Live Product Mode when ready to add real client data.',
    ],
    confidence: AI_CONFIDENCE.HIGH,
    advisoryNote: 'Advisory only. Onboarding steps are guidance only. Human confirmation required for all client creation and data entry.',
  }),
  [AI_AGENT_ID.BACKEND_SETUP]: () => ({
    summary: 'Advisory backend setup guidance for Quantum Compliance OS™ Run 15+.',
    steps: [
      '1. Navigate to Backend Connectors in the navigation.',
      '2. Enter your Supabase Project URL and Anon/Public Key only.',
      '3. Never paste SUPABASE_SERVICE_ROLE_KEY — it is automatically blocked.',
      '4. Run the SQL setup file (SUPABASE_SETUP_RUN_15.sql) in your Supabase SQL Editor.',
      '5. Confirm RLS is enabled on all tables before connecting.',
      '6. Test the connection config shape (real SDK connection in future run).',
      '7. LocalStorage remains active until a real backend connector is built.',
    ],
    suggestedNextSteps: [
      'Review SUPABASE_SETUP_RUN_15.sql in the repository root.',
      'Do not commit credentials to GitHub.',
      'Engage a qualified Supabase/PostgreSQL administrator before production use.',
    ],
    confidence: AI_CONFIDENCE.HIGH,
    advisoryNote: 'Advisory only. Backend configuration requires qualified technical review before production deployment.',
  }),
  [AI_AGENT_ID.WHITE_LABEL_SETUP]: () => ({
    summary: 'Advisory white-label and agency setup guidance.',
    steps: [
      '1. Navigate to Agency & White Label in the navigation.',
      '2. Fill in your Agency Profile details.',
      '3. Configure White Label Settings in preview mode.',
      '4. Branding preview shows how the platform will appear to clients.',
      '5. Kyzel Kreates™ / 4P3X Intelligent AI™ ownership is preserved in internal areas.',
      '6. Custom domain and SLA placeholders are reserved for a future run.',
    ],
    suggestedNextSteps: [
      'Complete Agency Profile before enabling white-label preview.',
      'Review branding settings with your agency identity team.',
    ],
    confidence: AI_CONFIDENCE.HIGH,
    advisoryNote: 'Advisory only. White-label configuration requires review before client-facing deployment. Kyzel Kreates™ ownership must be preserved in all internal areas.',
  }),
};

const ADVISORY_FOOTER = '\n\n---\n⚠ Advisory only. Human consultant review required. AI outputs do not constitute legal, regulatory, or compliance advice. AI agents must not fabricate evidence or certify compliance. Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™.';

/**
 * generateMockAIResponse — produces a safe local demo response for any agent.
 * No external API calls. No network traffic. Fails safely.
 */
export function generateMockAIResponse(agentId, context, userMessage) {
  const agent = AI_AGENTS[agentId];
  if (!agent) {
    return {
      role:                'assistant',
      content:             'Agent not found. Demo / Mock AI mode is active.',
      confidence:          AI_CONFIDENCE.LOW,
      requiresHumanReview: true,
      advisoryOnly:        true,
      sourceContext:       [],
      providerId:          AI_PROVIDER_ID.MOCK,
      createdAt:           new Date().toISOString(),
    };
  }

  const ctx = {
    hasClient:     !!(context?.currentClient?.id),
    evidenceCount: context?.evidenceItems?.length ?? 0,
    reportCount:   context?.reports?.length ?? 0,
    isDemo:        context?.productMode === 'demo',
  };

  const responseFn = MOCK_RESPONSES[agentId];
  const data       = responseFn ? responseFn(ctx) : { summary: 'No response template available for this agent.', confidence: AI_CONFIDENCE.LOW };

  const parts = [];
  parts.push(`**${agent.displayName} — ${agent.title}**`);
  if (ctx.isDemo) parts.push('> 🎯 Demo Mode active — reviewing demo records for presentation purposes.');
  parts.push('');
  if (data.summary)          parts.push(`**Summary:** ${data.summary}`);
  if (data.observedRecords)  parts.push(`**Observed:** ${data.observedRecords}`);
  if (data.draft)            parts.push(`**Draft language:**\n${data.draft}`);
  if (Array.isArray(data.steps)) {
    parts.push('**Guidance steps:**');
    data.steps.forEach((s) => parts.push(s));
  }
  if (Array.isArray(data.potentialGaps)) {
    parts.push('\n**Potential gaps identified:**');
    data.potentialGaps.forEach((g) => parts.push(`• ${g}`));
  }
  if (Array.isArray(data.suggestedNextSteps)) {
    parts.push('\n**Suggested next steps:**');
    data.suggestedNextSteps.forEach((s) => parts.push(`• ${s}`));
  }
  if (userMessage) parts.push(`\n*You asked:* "${userMessage}"\n*Note:* I do not have enough recorded evidence in the system to go beyond the visible records. A human consultant should review the source records.`);
  parts.push(ADVISORY_FOOTER);

  return {
    role:                'assistant',
    content:             parts.join('\n'),
    confidence:          data.confidence || AI_CONFIDENCE.MEDIUM,
    requiresHumanReview: true,
    advisoryOnly:        true,
    sourceContext:       agent.defaultContext || [],
    providerId:          AI_PROVIDER_ID.MOCK,
    createdAt:           new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAILS
// ─────────────────────────────────────────────────────────────────────────────

const GUARDRAIL_BLOCKED_INTENTS = [
  /delete.*client/i,
  /delete.*evidence/i,
  /delete.*report/i,
  /certify.*compliance/i,
  /guarantee.*secure/i,
  /guarantee.*compliant/i,
  /final.*legal.*advice/i,
  /fabricate.*evidence/i,
  /bypass.*rls/i,
  /expose.*secret/i,
  /service.?role.?key/i,
];

/**
 * applyAIGuardrails — checks user message for blocked intents.
 * Returns { blocked: boolean, reason: string }.
 */
export function applyAIGuardrails(agentId, userMessage) {
  if (!userMessage) return { blocked: false, reason: '' };
  const agent = AI_AGENTS[agentId];
  for (const p of GUARDRAIL_BLOCKED_INTENTS) {
    if (p.test(userMessage)) {
      return {
        blocked: true,
        reason:  `This request touches a guardrail. ${agent?.displayName || 'AI'} agents cannot perform destructive or final decision actions. This request requires human consultant review and cannot be treated as a final compliance decision.`,
      };
    }
  }
  return { blocked: false, reason: '' };
}

/**
 * buildAgentContext — assembles visible local data for agent context.
 * Only passes safe, non-secret fields. Never includes raw config or secrets.
 */
export function buildAgentContext(agentId, selectedContextKeys, externalContext = {}) {
  const allowed = AI_AGENTS[agentId]?.defaultContext || [];
  const safe    = {};
  for (const key of selectedContextKeys) {
    if (allowed.includes(key) && externalContext[key] !== undefined) {
      safe[key] = externalContext[key];
    }
  }
  return safe;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RUN AGENT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runAIAgent — main entry point for agent interaction.
 * In Run 16: mock mode only (no real provider calls).
 * Falls back to mock safely if anything fails.
 */
export function runAIAgent(agentId, userMessage, context) {
  const guardrail = applyAIGuardrails(agentId, userMessage);
  if (guardrail.blocked) {
    return {
      role:                'assistant',
      content:             `⚠ **Guardrail activated.** ${guardrail.reason}\n${ADVISORY_FOOTER}`,
      confidence:          AI_CONFIDENCE.LOW,
      requiresHumanReview: true,
      advisoryOnly:        true,
      guardrailBlocked:    true,
      sourceContext:       [],
      providerId:          AI_PROVIDER_ID.MOCK,
      createdAt:           new Date().toISOString(),
    };
  }

  const s = getState();
  const aiSettings   = s.aiSettings  || getDefaultAISettings();
  const activeProvider = aiSettings.activeProvider || AI_PROVIDER_ID.MOCK;

  // In Run 16, all providers fall back to mock (real SDK calls not implemented)
  const response = generateMockAIResponse(agentId, context, userMessage);

  // Log locally if enabled
  if (aiSettings.logAgentMessagesLocally) {
    addActivityLog({
      type:    'ai_agent_response',
      message: `${AI_AGENTS[agentId]?.displayName || agentId} responded. Provider: ${activeProvider} (mock in Run 16).`,
    });
  }

  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER CONFIG HELPERS (state mutations)
// ─────────────────────────────────────────────────────────────────────────────

export function maskAIProviderConfig(config) {
  if (!config) return {};
  const masked = {};
  for (const [k, v] of Object.entries(config)) {
    if (!v) { masked[k] = v; continue; }
    const s = String(v);
    if (s.startsWith('eyJ') && s.length > 20) { masked[k] = s.slice(0, 8) + '…' + '•'.repeat(8); }
    else if (k.toLowerCase().includes('key') || k.toLowerCase().includes('token')) { masked[k] = s.slice(0, 4) + '•'.repeat(Math.min(8, s.length - 4)); }
    else { masked[k] = v; }
  }
  return masked;
}

export function validateAIProviderConfig(providerId, config) {
  const errors = [], warnings = [];
  if (!config) return { valid: false, errors: ['Config must be provided.'], warnings };

  // Block secrets in all values
  for (const [k, v] of Object.entries(config)) {
    if (!v) continue;
    const det = detectBlockedAISecrets(String(v));
    if (det.blocked) errors.push(`Field "${k}": ${det.reason}`);
  }

  const p = AI_PROVIDERS[providerId];
  if (!p) return { valid: false, errors: ['Unknown provider.'], warnings };

  if (p.requiresApiKey === true && !config.apiKey) {
    errors.push('API key is required for this provider.');
  }
  if (p.type !== AI_PROVIDER_TYPE.LOCAL_DEMO && p.baseUrl !== undefined && !config.baseUrl && !p.baseUrl) {
    warnings.push('Base URL is recommended for this provider.');
  }

  if (p.warningNote) warnings.push(p.warningNote);

  return { valid: errors.length === 0, errors, warnings };
}

export function saveAIProviderConfig(providerId, config) {
  const validation = validateAIProviderConfig(providerId, config);
  if (!validation.valid) {
    return { saved: false, errors: validation.errors, warnings: validation.warnings, blocked: validation.errors.some((e) => e.includes('secret') || e.includes('blocked')) };
  }

  const masked = maskAIProviderConfig(config);
  const hasRequiredConfig = providerId === AI_PROVIDER_ID.MOCK || !AI_PROVIDERS[providerId]?.requiresApiKey
    ? true
    : !!(config.apiKey || config.baseUrl);

  setState((s) => {
    const existingProviders = s.aiProviders || {};
    return {
      ...s,
      aiProviders: {
        ...existingProviders,
        [providerId]: {
          ...(existingProviders[providerId] || {}),
          ...AI_PROVIDERS[providerId],
          publicConfig: { ...config },
          maskedConfig: masked,
          configured:   hasRequiredConfig,
          status:       hasRequiredConfig ? 'configured' : 'not-configured',
          enabled:      false,
        },
      },
    };
  });

  addActivityLog({ type: 'ai_provider_config_saved', message: `AI provider config saved: ${providerId}.` });
  return { saved: true, errors: [], warnings: validation.warnings, blocked: false };
}

export function setActiveAIProvider(providerId) {
  const p = AI_PROVIDERS[providerId];
  if (!p) return { success: false, message: 'Unknown provider.' };

  setState((s) => ({
    ...s,
    aiSettings: {
      ...(s.aiSettings || getDefaultAISettings()),
      activeProvider: providerId,
      updatedAt: new Date().toISOString().slice(0, 10),
    },
  }));

  addActivityLog({ type: 'ai_provider_changed', message: `Active AI provider set to: ${providerId}.` });
  return { success: true, message: `Active AI provider set to ${p.name}. Note: All providers fall back to mock responses in Run 16.` };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getAISettings() {
  return getState().aiSettings || getDefaultAISettings();
}

export function getAIProviders() {
  const stored = getState().aiProviders || {};
  // Merge stored config with static registry
  const result = {};
  for (const id of AI_PROVIDER_ORDER) {
    result[id] = { ...AI_PROVIDERS[id], ...(stored[id] || {}) };
  }
  return result;
}

export function getActiveAIProvider() {
  const s    = getState();
  const id   = s.aiSettings?.activeProvider || AI_PROVIDER_ID.MOCK;
  const prov = getAIProviders();
  return prov[id] || prov[AI_PROVIDER_ID.MOCK];
}

export function getAIAgents() { return AI_AGENTS; }
export function getAIAgentById(agentId) { return AI_AGENTS[agentId] || null; }
export function getAgentAllowedContext(agentId) { return AI_AGENTS[agentId]?.defaultContext || []; }

export function getAIProviderStatus() {
  const settings  = getAISettings();
  const providers = getAIProviders();
  return {
    activeProvider:    settings.activeProvider,
    isMockActive:      settings.activeProvider === AI_PROVIDER_ID.MOCK,
    configuredCount:   Object.values(providers).filter((p) => p.configured).length,
    totalProviders:    AI_PROVIDER_ORDER.length,
    safeModeEnabled:   settings.safeModeEnabled,
    humanReviewRequired: settings.humanReviewRequired,
  };
}

export function getAISafetySummary() {
  const s = getAISettings();
  return {
    safeModeEnabled:            s.safeModeEnabled,
    humanReviewRequired:        s.humanReviewRequired,
    allowDirectRecordMutation:  s.allowDirectRecordMutation,
    allowEvidenceFabrication:   s.allowEvidenceFabrication,
    allowLegalFinalAdvice:      s.allowLegalFinalAdvice,
    allowComplianceGuarantees:  s.allowComplianceGuarantees,
    allowSecurityGuarantees:    s.allowSecurityGuarantees,
    showConfidenceIndicators:   s.showConfidenceIndicators,
    logAgentMessagesLocally:    s.logAgentMessagesLocally,
    agentCount:                 AI_AGENT_ORDER.length,
    allAgentsAdvisoryOnly:      AI_AGENT_ORDER.every((id) => AI_AGENTS[id]?.advisoryOnly),
    allRequireHumanReview:      AI_AGENT_ORDER.every((id) => AI_AGENTS[id]?.humanReviewRequired),
  };
}

export function logAIMessage(sessionId, message) {
  if (!sessionId || !message) return;
  setState((s) => {
    const sessions = s.aiAgentSessions || [];
    const idx      = sessions.findIndex((sess) => sess.id === sessionId);
    if (idx < 0) return s; // session not found — safe skip
    const updatedSessions = [...sessions];
    updatedSessions[idx] = {
      ...updatedSessions[idx],
      messages:  [...(updatedSessions[idx].messages || []), message],
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    return { ...s, aiAgentSessions: updatedSessions };
  });
}

export function clearAIConversation(sessionId) {
  setState((s) => ({
    ...s,
    aiAgentSessions: (s.aiAgentSessions || []).filter((sess) => sess.id !== sessionId),
  }));
}
