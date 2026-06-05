/**
 * QUANTUM COMPLIANCE OS™ — backendConfigGuard.js
 * Run 23 (8.6): Product Mode Backend Provider Configuration
 * =========================================================
 * Dedicated API config guard, secret detection, provider validation,
 * and readiness labelling.
 *
 * SAFETY:
 * - Never stores, logs, or returns dangerous secrets
 * - Blocks service role keys, private keys, DB URLs, JWT secrets
 * - Only public/client-safe values may pass
 * - All validation returns {valid, warnings, errors, safeToSave, readiness}
 * - No external network calls
 * - No SDK imports
 *
 * DISCLAIMER:
 * Backend configuration is saved locally only. Full live sync requires
 * a future backend migration run. RLS and backend security policies must
 * be reviewed before production use. Risk scores and recommendations are
 * advisory and require qualified human review.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER IDs
// ─────────────────────────────────────────────────────────────────────────────

export const PROVIDER_IDS = {
  LOCAL_ONLY:   'localOnly',
  SUPABASE:     'supabase',
  FIREBASE:     'firebase',
  CUSTOM_REST:  'customRest',
  AWS:          'awsEnterprise',
};

// ─────────────────────────────────────────────────────────────────────────────
// READINESS LABELS
// ─────────────────────────────────────────────────────────────────────────────

export const READINESS = {
  NOT_CONFIGURED:       'not-configured',
  PARTIAL:              'partial',
  FORMAT_VALID:         'format-valid',
  UNSAFE:               'unsafe',
  READY_FOR_LIVE_TEST:  'ready-for-live-test',
  ACTIVE:               'active',
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKED SECRET PATTERNS
// These must NEVER appear in frontend config
// ─────────────────────────────────────────────────────────────────────────────

const BLOCKED_KEY_NAMES = [
  'supabase_service_role_key',
  'service_role_key',
  'serviceRoleKey',
  'service_role',
  'openai_api_key',
  'openaiApiKey',
  'groq_api_key',
  'groqApiKey',
  'stripe_secret_key',
  'stripeSecretKey',
  'stripe_secret',
  'database_url',
  'databaseUrl',
  'DATABASE_URL',
  'jwt_secret',
  'jwtSecret',
  'JWT_SECRET',
  'private_key',
  'privateKey',
  'PRIVATE_KEY',
  'webhook_secret',
  'webhookSecret',
  'WEBHOOK_SECRET',
  'admin_token',
  'adminToken',
  'root_key',
  'rootKey',
  'server_secret',
  'serverSecret',
  'aws_secret_access_key',
  'awsSecretAccessKey',
  'AWS_SECRET_ACCESS_KEY',
  'secret_access_key',
  'secretAccessKey',
  'access_key_secret',
];

// Suspicious value patterns
const BLOCKED_VALUE_PATTERNS = [
  { pattern: /^-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/i, label: 'Private key (PEM)' },
  { pattern: /^eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}$/, label: 'JWT (possible service token — use anon/public key only)' },
  { pattern: /supabase.*service_role/i,          label: 'Supabase service role keyword' },
  { pattern: /^sk-[a-zA-Z0-9]{20,}/,            label: 'OpenAI-style secret key' },
  { pattern: /^gsk_[a-zA-Z0-9]{20,}/,           label: 'Groq API key' },
  { pattern: /^sk_live_[a-zA-Z0-9]{20,}/,       label: 'Stripe live secret key' },
  { pattern: /^sk_test_[a-zA-Z0-9]{20,}/,       label: 'Stripe test secret key' },
  { pattern: /postgres:\/\/|postgresql:\/\//i,   label: 'PostgreSQL database URL' },
  { pattern: /mongodb(\+srv)?:\/\//i,            label: 'MongoDB connection string' },
  { pattern: /mysql:\/\/|mariadb:\/\//i,         label: 'MySQL database URL' },
  { pattern: /redis:\/\//i,                      label: 'Redis connection URL' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECRET DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check a single string value for dangerous secret patterns.
 * @param {string} value
 * @returns {{ blocked: boolean, reason: string, label: string }}
 */
export function isLikelyServiceRoleKey(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  // Service role JWTs for Supabase contain "role":"service_role" in payload
  try {
    const parts = v.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
      if (payload?.role === 'service_role') return true;
    }
  } catch { /* ignore */ }
  return /service_role/i.test(v);
}

export function isLikelyPrivateKey(value) {
  if (!value || typeof value !== 'string') return false;
  return /-----BEGIN.*PRIVATE KEY-----/i.test(value.trim());
}

export function isLikelyDatabaseUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return /^(postgres|postgresql|mysql|mariadb|mongodb|redis):\/\//i.test(value.trim());
}

export function isLikelyServerSecret(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  return (
    /^(sk-|gsk_|sk_live_|sk_test_)/i.test(v) ||
    isLikelyPrivateKey(v) ||
    isLikelyDatabaseUrl(v) ||
    isLikelyServiceRoleKey(v)
  );
}

/**
 * Scan a value or object for unsafe secrets.
 * @param {string|object} valueOrObject
 * @returns {{ safe: boolean, blocked: boolean, reason: string, detectedIn: string[] }}
 */
export function scanForUnsafeSecrets(valueOrObject) {
  const detectedIn = [];
  const reasons    = [];

  function checkValue(key, val) {
    if (!val || typeof val !== 'string') return;
    const v = val.trim();
    if (!v) return;

    // Check key name
    const keyLower = String(key).toLowerCase().replace(/[-_\s]/g, '');
    for (const blocked of BLOCKED_KEY_NAMES) {
      if (keyLower === blocked.toLowerCase().replace(/[-_\s]/g, '')) {
        detectedIn.push(key);
        reasons.push(`Field name "${key}" matches a blocked secret name.`);
        return;
      }
    }

    // Check value pattern
    for (const { pattern, label } of BLOCKED_VALUE_PATTERNS) {
      if (pattern.test(v)) {
        detectedIn.push(key);
        reasons.push(`Field "${key}" contains a value that looks like: ${label}. This must not be stored in frontend config.`);
        return;
      }
    }

    // Additional checks
    if (isLikelyServiceRoleKey(v)) {
      detectedIn.push(key);
      reasons.push(`Field "${key}" appears to be a Supabase service role key. This must only be used server-side.`);
    }
  }

  if (typeof valueOrObject === 'string') {
    checkValue('value', valueOrObject);
  } else if (valueOrObject && typeof valueOrObject === 'object') {
    for (const [k, v] of Object.entries(valueOrObject)) {
      if (v && typeof v === 'object') {
        for (const [k2, v2] of Object.entries(v)) {
          checkValue(`${k}.${k2}`, v2);
        }
      } else {
        checkValue(k, v);
      }
    }
  }

  const blocked = detectedIn.length > 0;
  return {
    safe:       !blocked,
    blocked,
    reason:     reasons.join(' | ') || '',
    detectedIn,
    reasons,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MASK SENSITIVE VALUES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mask a sensitive value for safe display (never show full token).
 * @param {string} value
 * @returns {string}
 */
export function maskSensitiveValue(value) {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim();
  if (v.length <= 8) return '••••••••';
  return v.slice(0, 6) + '••••••••' + v.slice(-4);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export function getDefaultBackendConfig() {
  return {
    activeProvider:                 PROVIDER_IDS.LOCAL_ONLY,
    productModeBackendEnabled:      false,
    lastUpdatedAt:                  null,
    lastTestedAt:                   null,
    frontendOnlyWarningAccepted:    false,
    providerStatus: {
      [PROVIDER_IDS.SUPABASE]:      'not-configured',
      [PROVIDER_IDS.FIREBASE]:      'not-configured',
      [PROVIDER_IDS.CUSTOM_REST]:   'not-configured',
      [PROVIDER_IDS.LOCAL_ONLY]:    'active',
      [PROVIDER_IDS.AWS]:           'not-configured',
    },
    providers: {
      [PROVIDER_IDS.LOCAL_ONLY]: {
        providerEnabled:          true,
        modeName:                 'Local-Only',
        backupReminderEnabled:    false,
        exportBackupFrequency:    'manual',
        importExportEnabled:      true,
        notes:                    '',
        configured:               true,
        status:                   'active',
      },
      [PROVIDER_IDS.SUPABASE]: {
        providerEnabled:          false,
        projectUrl:               '',
        anonPublicKey:            '',
        databaseRegion:           '',
        projectRef:               '',
        authEnabled:              false,
        realtimeEnabled:          false,
        storageEnabled:           false,
        edgeFunctionsPlanned:     false,
        notes:                    '',
        configured:               false,
        status:                   'not-configured',
        lastTestedAt:             null,
        lastTestResult:           null,
        lastTestMessage:          '',
      },
      [PROVIDER_IDS.FIREBASE]: {
        providerEnabled:          false,
        apiKey:                   '',
        authDomain:               '',
        projectId:                '',
        storageBucket:            '',
        messagingSenderId:        '',
        appId:                    '',
        measurementId:            '',
        authEnabled:              false,
        firestorePlanned:         false,
        realtimeDatabasePlanned:  false,
        storageEnabled:           false,
        notes:                    '',
        configured:               false,
        status:                   'not-configured',
        lastTestedAt:             null,
        lastTestResult:           null,
        lastTestMessage:          '',
      },
      [PROVIDER_IDS.CUSTOM_REST]: {
        providerEnabled:          false,
        baseUrl:                  '',
        healthCheckPath:          '/health',
        authType:                 'none',
        publicApiKeyAllowed:      false,
        headerName:               '',
        tokenPlaceholder:         '',
        syncEndpointPath:         '/sync',
        reportEndpointPath:       '/reports',
        evidenceEndpointPath:     '/evidence',
        notes:                    '',
        configured:               false,
        status:                   'not-configured',
        lastTestedAt:             null,
        lastTestResult:           null,
        lastTestMessage:          '',
      },
      [PROVIDER_IDS.AWS]: {
        providerEnabled:          false,
        region:                   '',
        apiGatewayBaseUrl:        '',
        cognitoUserPoolId:        '',
        cognitoClientId:          '',
        s3BucketName:             '',
        dynamoPlanned:            false,
        notes:                    '',
        configured:               false,
        status:                   'not-configured',
        lastTestedAt:             null,
        lastTestResult:           null,
        lastTestMessage:          '',
      },
    },
    safety: {
      secretScanEnabled:            true,
      unsafeSecretsBlocked:         true,
      frontendOnlyWarningAccepted:  false,
    },
    connectionTests: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

function makeResult(valid, errors, warnings, safeToSave, readiness) {
  return { valid, errors, warnings, safeToSave, readiness };
}

export function validateLocalOnlyConfig(config) {
  return makeResult(true, [], [], true, READINESS.ACTIVE);
}

export function validateSupabaseConfig(config) {
  const errors   = [];
  const warnings = [];

  if (!config) return makeResult(false, ['No config provided.'], [], false, READINESS.NOT_CONFIGURED);

  // Secret scan first
  const scan = scanForUnsafeSecrets(config);
  if (scan.blocked) {
    return makeResult(false, scan.reasons, [], false, READINESS.UNSAFE);
  }

  // Required fields
  if (!config.projectUrl?.trim())   errors.push('Project URL is required (e.g. https://xyz.supabase.co).');
  if (!config.anonPublicKey?.trim()) errors.push('Anon / Public Key is required.');

  // URL format
  if (config.projectUrl?.trim()) {
    try {
      const url = new URL(config.projectUrl.trim());
      if (!url.hostname.includes('supabase')) {
        warnings.push('URL does not look like a Supabase project URL. Confirm it matches your Supabase project settings.');
      }
      if (url.protocol !== 'https:') {
        errors.push('Project URL must use HTTPS.');
      }
    } catch {
      errors.push('Project URL is not a valid URL.');
    }
  }

  // Anon key — should be a JWT (3 parts)
  if (config.anonPublicKey?.trim()) {
    if (isLikelyServiceRoleKey(config.anonPublicKey)) {
      return makeResult(false,
        ['This looks like a Supabase SERVICE ROLE KEY. This must NEVER be used in frontend code. Use the anon/public key from Project Settings → API.'],
        [], false, READINESS.UNSAFE);
    }
    const parts = config.anonPublicKey.trim().split('.');
    if (parts.length !== 3) {
      warnings.push('Anon key does not look like a JWT (3-part token). Verify you are using the anon/public key from Supabase Project Settings → API.');
    }
  }

  if (errors.length > 0) return makeResult(false, errors, warnings, false, READINESS.PARTIAL);

  const readiness = warnings.length === 0 ? READINESS.READY_FOR_LIVE_TEST : READINESS.FORMAT_VALID;
  return makeResult(true, [], warnings, true, readiness);
}

export function validateFirebaseConfig(config) {
  const errors   = [];
  const warnings = [];

  if (!config) return makeResult(false, ['No config provided.'], [], false, READINESS.NOT_CONFIGURED);

  const scan = scanForUnsafeSecrets(config);
  if (scan.blocked) {
    return makeResult(false, scan.reasons, [], false, READINESS.UNSAFE);
  }

  const required = ['apiKey', 'authDomain', 'projectId'];
  for (const f of required) {
    if (!config[f]?.trim()) errors.push(`Firebase "${f}" is required.`);
  }

  if (config.apiKey?.trim() && isLikelyServerSecret(config.apiKey)) {
    return makeResult(false,
      ['The API Key field appears to contain a server-side secret. Use only the Firebase web app public API key.'],
      [], false, READINESS.UNSAFE);
  }

  warnings.push('Firebase Security Rules must be configured in the Firebase Console before going live. This frontend config does not set security rules.');

  if (errors.length > 0) return makeResult(false, errors, warnings, false, READINESS.PARTIAL);
  return makeResult(true, [], warnings, true, READINESS.FORMAT_VALID);
}

export function validateCustomRestConfig(config) {
  const errors   = [];
  const warnings = [];

  if (!config) return makeResult(false, ['No config provided.'], [], false, READINESS.NOT_CONFIGURED);

  const scan = scanForUnsafeSecrets(config);
  if (scan.blocked) {
    return makeResult(false, scan.reasons, [], false, READINESS.UNSAFE);
  }

  if (!config.baseUrl?.trim()) {
    errors.push('Base URL is required (e.g. https://api.yourdomain.com).');
  } else {
    try {
      const url = new URL(config.baseUrl.trim());
      if (url.protocol !== 'https:') {
        warnings.push('Base URL should use HTTPS for production use.');
      }
    } catch {
      errors.push('Base URL is not a valid URL.');
    }
  }

  if (config.tokenPlaceholder?.trim()) {
    warnings.push('Tokens stored in frontend config must be public/client-safe only. Backend-only bearer tokens must be stored server-side.');
  }

  if (errors.length > 0) return makeResult(false, errors, warnings, false, READINESS.PARTIAL);
  return makeResult(true, [], warnings, true, READINESS.FORMAT_VALID);
}

export function validateAwsEnterpriseConfig(config) {
  const errors   = [];
  const warnings = [];

  if (!config) return makeResult(false, ['No config provided.'], [], false, READINESS.NOT_CONFIGURED);

  const scan = scanForUnsafeSecrets(config);
  if (scan.blocked) {
    return makeResult(false, scan.reasons, [], false, READINESS.UNSAFE);
  }

  warnings.push('AWS_SECRET_ACCESS_KEY is blocked from frontend config. Server-side IAM auth is required for production AWS integration.');
  warnings.push('AWS / Amplify integration is reserved for a future enterprise backend run. Config saved locally as a placeholder.');

  if (config.apiGatewayBaseUrl?.trim()) {
    try {
      new URL(config.apiGatewayBaseUrl.trim());
    } catch {
      errors.push('API Gateway Base URL is not a valid URL.');
    }
  }

  if (errors.length > 0) return makeResult(false, errors, warnings, false, READINESS.PARTIAL);
  return makeResult(true, [], warnings, true, READINESS.FORMAT_VALID);
}

/**
 * Validate any provider config by provider ID.
 */
export function validateProviderConfig(providerId, config) {
  switch (providerId) {
    case PROVIDER_IDS.LOCAL_ONLY:   return validateLocalOnlyConfig(config);
    case PROVIDER_IDS.SUPABASE:     return validateSupabaseConfig(config);
    case PROVIDER_IDS.FIREBASE:     return validateFirebaseConfig(config);
    case PROVIDER_IDS.CUSTOM_REST:  return validateCustomRestConfig(config);
    case PROVIDER_IDS.AWS:          return validateAwsEnterpriseConfig(config);
    default:
      return makeResult(false, [`Unknown provider: ${providerId}`], [], false, READINESS.NOT_CONFIGURED);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTION TEST RESULT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a standardised connection test result object.
 */
export function buildConnectionTestResult(providerId, status, message, details = {}) {
  return {
    id:         `test_${providerId}_${Date.now()}`,
    providerId,
    status,   // 'success' | 'warning' | 'failed' | 'validation-only'
    message,
    details,
    testedAt:   new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER READINESS LABEL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a human-readable readiness label for a provider.
 */
export function getProviderReadinessLabel(providerId, config) {
  if (providerId === PROVIDER_IDS.LOCAL_ONLY) return 'Active — Local Storage';
  if (!config || (!config.providerEnabled && providerId !== PROVIDER_IDS.LOCAL_ONLY)) {
    return 'Not configured';
  }
  const result = validateProviderConfig(providerId, config);
  switch (result.readiness) {
    case READINESS.ACTIVE:              return 'Active';
    case READINESS.READY_FOR_LIVE_TEST: return 'Format valid — ready to test';
    case READINESS.FORMAT_VALID:        return 'Format valid — review warnings';
    case READINESS.PARTIAL:             return 'Partially configured';
    case READINESS.UNSAFE:              return '⚠ Unsafe — blocked secret detected';
    case READINESS.NOT_CONFIGURED:
    default:                            return 'Not configured';
  }
}
