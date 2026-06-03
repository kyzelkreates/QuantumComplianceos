/**
 * QUANTUM COMPLIANCE OS™ — validators.js
 * Input validation for all user-submitted data.
 * Defensive use only — no exploit or offensive logic.
 */

// ─── Text Sanitisation ────────────────────────────────────────────────────────
export function sanitiseText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // strip angle brackets
    .replace(/javascript:/gi, '') // strip JS protocol
    .replace(/on\w+\s*=/gi, '') // strip inline event handlers
    .trim()
    .slice(0, 5000); // hard cap
}

// ─── Required Field ────────────────────────────────────────────────────────────
export function validateRequired(value, fieldName = 'Field') {
  const errors = [];
  if (value === null || value === undefined || String(value).trim() === '') {
    errors.push(`${fieldName} is required.`);
  }
  return errors;
}

// ─── Email Validator ──────────────────────────────────────────────────────────
export function validateEmail(email) {
  const errors = [];
  if (!email) return errors; // optional field — only validate if provided
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(String(email).trim())) {
    errors.push('Please enter a valid email address.');
  }
  if (String(email).length > 254) {
    errors.push('Email address is too long (max 254 characters).');
  }
  return errors;
}

// ─── Organisation Validator ────────────────────────────────────────────────────
export function validateOrganisation(data) {
  const errors = {};

  // Required fields
  const nameErrors = validateRequired(data.name, 'Organisation name');
  if (nameErrors.length) errors.name = nameErrors;

  const sectorErrors = validateRequired(data.sector, 'Sector');
  if (sectorErrors.length) errors.sector = sectorErrors;

  const countryErrors = validateRequired(data.country, 'Country');
  if (countryErrors.length) errors.country = countryErrors;

  const sensitivityErrors = validateRequired(data.dataSensitivityLevel, 'Data sensitivity level');
  if (sensitivityErrors.length) errors.dataSensitivityLevel = sensitivityErrors;

  // Optional with format validation
  if (data.contactEmail) {
    const emailErrors = validateEmail(data.contactEmail);
    if (emailErrors.length) errors.contactEmail = emailErrors;
  }

  if (data.name && String(data.name).length > 200) {
    errors.name = ['Organisation name must be 200 characters or fewer.'];
  }

  if (data.notes && String(data.notes).length > 2000) {
    errors.notes = ['Notes must be 2000 characters or fewer.'];
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── System Profile Validator ──────────────────────────────────────────────────
export function validateSystemProfile(data) {
  const errors = {};

  const nameErrors = validateRequired(data.name, 'System name');
  if (nameErrors.length) errors.name = nameErrors;

  const typeErrors = validateRequired(data.type, 'System type');
  if (typeErrors.length) errors.type = typeErrors;

  const criticalityErrors = validateCriticality(data.criticality);
  if (criticalityErrors.length) errors.criticality = criticalityErrors;

  if (data.name && String(data.name).length > 200) {
    errors.name = ['System name must be 200 characters or fewer.'];
  }

  if (data.owner && String(data.owner).length > 200) {
    errors.owner = ['Owner name must be 200 characters or fewer.'];
  }

  if (data.notes && String(data.notes).length > 2000) {
    errors.notes = ['Notes must be 2000 characters or fewer.'];
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── Criticality Validator ─────────────────────────────────────────────────────
export function validateCriticality(value) {
  const errors = [];
  const valid = ['critical', 'high', 'medium', 'low', 'informational'];
  if (!value) {
    errors.push('Criticality level is required.');
  } else if (!valid.includes(value)) {
    errors.push(`Criticality must be one of: ${valid.join(', ')}.`);
  }
  return errors;
}

// ─── Data Sensitivity Validator ────────────────────────────────────────────────
export function validateDataSensitivity(value) {
  const errors = [];
  const valid = ['public', 'internal', 'confidential', 'restricted', 'critical'];
  if (!value) {
    errors.push('Data sensitivity level is required.');
  } else if (!valid.includes(value)) {
    errors.push(`Data sensitivity must be one of: ${valid.join(', ')}.`);
  }
  return errors;
}

// ─── Defensive Use Case Validator ─────────────────────────────────────────────
export function validateDefensiveUseCase(input) {
  /**
   * Ensures submitted text does not contain offensive security language.
   * This is a defensive product only.
   */
  const errors = [];
  const offensiveKeywords = [
    'exploit',
    'payload',
    'shellcode',
    'metasploit',
    'sql injection',
    'xss attack',
    'brute force attack',
    'password crack',
    'keylogger',
    'rootkit',
    'malware',
    'ransomware deploy',
    'c2 server',
    'command and control',
    'lateral movement attack',
    'privilege escalation attack',
    'zero-day exploit',
    'reverse shell',
    'bind shell',
  ];

  const lower = String(input || '').toLowerCase();
  const found = offensiveKeywords.filter((kw) => lower.includes(kw));

  if (found.length > 0) {
    errors.push(
      'This platform is for defensive security readiness assessment only. Offensive security language or tools are not supported.'
    );
  }

  return errors;
}

// ─── General Text Length Validator ────────────────────────────────────────────
export function validateTextLength(value, fieldName = 'Field', maxLength = 500) {
  const errors = [];
  if (value && String(value).length > maxLength) {
    errors.push(`${fieldName} must be ${maxLength} characters or fewer.`);
  }
  return errors;
}

// ─── Colour Hex Validator ──────────────────────────────────────────────────────
export function validateHexColour(value) {
  const errors = [];
  if (!value) return errors;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
    errors.push('Colour must be a valid hex value (e.g. #00d4ff or #0df).');
  }
  return errors;
}
