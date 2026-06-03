/**
 * QUANTUM COMPLIANCE OS™ — quantumSchema.js
 * Quantum Readiness Engine — Run 3
 * ==========================================
 * Defines all quantum readiness assessment categories, questions,
 * scoring weights, NIST PQC alignment notes, and NCSC roadmap mappings.
 *
 * DEFENSIVE USE ONLY.
 * No live cryptographic attack testing. No offensive tools.
 * No claim of "quantum-proof" protection — only readiness assessment.
 *
 * References:
 *   NIST FIPS 203 (ML-KEM / Kyber)    — Key Encapsulation
 *   NIST FIPS 204 (ML-DSA / Dilithium) — Digital Signatures
 *   NIST FIPS 205 (SLH-DSA / SPHINCS+) — Stateless Hash-Based Signatures
 *   NIST SP 800-208                    — PQC Migration Guidance
 *   NCSC Post-Quantum Cryptography Guidance (2023/2024)
 *   ENISA Post-Quantum Cryptography Integration Study (2024)
 */

// ─── NIST PQC Standards Reference ────────────────────────────────────────────
export const NIST_PQC_STANDARDS = [
  {
    id: 'fips203',
    name: 'FIPS 203 — ML-KEM (Kyber)',
    purpose: 'Key encapsulation / key exchange',
    replaces: 'RSA key exchange, ECDH, DH',
    status: 'Final (2024)',
    icon: '🔑',
    ncscGuidance: 'Recommended for all new key exchange implementations. Prioritise migration for long-lived secrets.',
  },
  {
    id: 'fips204',
    name: 'FIPS 204 — ML-DSA (Dilithium)',
    purpose: 'Digital signatures',
    replaces: 'RSA signatures, ECDSA, DSA',
    status: 'Final (2024)',
    icon: '✍️',
    ncscGuidance: 'Recommended for certificate signing, code signing, and authentication tokens.',
  },
  {
    id: 'fips205',
    name: 'FIPS 205 — SLH-DSA (SPHINCS+)',
    purpose: 'Stateless hash-based signatures',
    replaces: 'RSA signatures, ECDSA (stateless alternative)',
    status: 'Final (2024)',
    icon: '🌲',
    ncscGuidance: 'Conservative stateless option. Larger signatures but well-understood security properties.',
  },
];

// ─── Quantum-Vulnerable Algorithm Reference ───────────────────────────────────
export const QUANTUM_VULNERABLE_ALGORITHMS = [
  { name: 'RSA (any key size)', threat: 'Critical', reason: "Shor's algorithm breaks RSA efficiently on a sufficiently powerful quantum computer.", timeline: 'NCSC: begin migration planning now for data requiring >10 year confidentiality.' },
  { name: 'ECDH / ECDSA (all curves)', threat: 'Critical', reason: "Shor's algorithm also breaks elliptic curve discrete logarithm problem.", timeline: 'Same urgency as RSA — all ECC variants are quantum-vulnerable.' },
  { name: 'DH / DHE (Diffie-Hellman)', threat: 'Critical', reason: 'Discrete logarithm problem solved by quantum computing.', timeline: 'Replace with ML-KEM (Kyber) for key exchange.' },
  { name: 'DSA', threat: 'Critical', reason: 'Discrete logarithm — vulnerable to same quantum attacks as DH.', timeline: 'Replace with ML-DSA (Dilithium) or SLH-DSA (SPHINCS+).' },
  { name: 'AES-128', threat: 'Low', reason: "Grover's algorithm halves effective key strength to ~64-bit equivalent.", timeline: 'Migrate to AES-256 as a precautionary measure.' },
  { name: 'SHA-256', threat: 'Low', reason: "Grover's algorithm reduces collision resistance. SHA-384/SHA-512 recommended.", timeline: 'Consider SHA-384 or SHA-512 for new implementations.' },
  { name: 'AES-256 / SHA-384 / SHA-512', threat: 'Minimal', reason: 'Symmetric and hash algorithms are quantum-resistant with sufficient key/digest length.', timeline: 'No immediate migration required.' },
];

// ─── NCSC Migration Phases ────────────────────────────────────────────────────
export const NCSC_MIGRATION_PHASES = [
  { phase: 1, label: 'Discover & Classify', desc: 'Inventory all cryptographic assets. Identify where public-key cryptography is used. Classify by sensitivity and data shelf-life.', timeline: 'Start now (2024–2025)' },
  { phase: 2, label: 'Plan & Prioritise', desc: 'Prioritise systems handling long-lived sensitive data. Develop migration roadmap. Assess vendor support for PQC.', timeline: '2025–2026' },
  { phase: 3, label: 'Pilot Hybrid Approaches', desc: 'Deploy hybrid classical + PQC schemes (e.g. X25519 + ML-KEM) in non-critical systems. Build internal expertise.', timeline: '2026–2027' },
  { phase: 4, label: 'Full Migration', desc: 'Migrate all critical systems to NIST-standardised PQC algorithms. Retire quantum-vulnerable key exchange and signatures.', timeline: '2027–2030' },
];

// ─── Assessment Categories ────────────────────────────────────────────────────
export const QUANTUM_ASSESSMENT_CATEGORIES = [

  // ── 1. Public-Key Cryptography Exposure ──────────────────────────────────────
  {
    id: 'pke_exposure',
    label: 'Public-Key Cryptography Exposure',
    icon: '🔓',
    weight: 2.0,
    nistAlignment: ['SP 800-208', 'FIPS 203', 'FIPS 204'],
    ncscRef: 'NCSC Post-Quantum Cryptography Guidance — Section: Inventory',
    description:
      'Assessment of where and how quantum-vulnerable public-key cryptography (RSA, ECC, DH) is used across your organisation. This is a self-reported inventory — no live cryptographic scanning is performed.',
    defensiveNote:
      'This section assesses your awareness and inventory of public-key cryptography usage. No live scanning, decryption, or key material access is performed.',
    questions: [
      {
        id: 'pke_awareness',
        label: 'Awareness of quantum threat to public-key cryptography',
        hint: 'RSA, ECDH, ECDSA, and DH are all vulnerable to Shor\'s algorithm on a sufficiently powerful quantum computer.',
        required: true,
        options: [
          { value: 'full_inventory', label: 'Full cryptographic inventory completed — all PK usage mapped', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'partial_inventory', label: 'Partial inventory — most systems assessed, gaps known', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'aware_no_inventory', label: 'Aware of threat but no formal inventory completed', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'not_assessed', label: 'Not formally assessed', score: 0, riskWeight: 0.8, isWeakness: true },
          { value: 'unaware', label: 'Not aware of quantum threat to public-key cryptography', score: 0, riskWeight: 1.0, isWeakness: true },
        ],
      },
      {
        id: 'pke_rsa_usage',
        label: 'RSA usage across your systems',
        hint: 'Includes TLS certificates, S/MIME email, code signing, VPN authentication, SSH host keys, and API signatures using RSA.',
        required: true,
        options: [
          { value: 'none_confirmed', label: 'RSA confirmed absent or already migrated away from', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'minimal_documented', label: 'Minimal RSA use — specific cases documented', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'widespread_known', label: 'RSA in widespread use — inventory complete', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'widespread_unknown', label: 'RSA likely widespread — no formal inventory', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'RSA usage unknown', score: 0, riskWeight: 1.0, isWeakness: true },
        ],
      },
      {
        id: 'pke_ecc_usage',
        label: 'ECC (Elliptic Curve Cryptography) usage',
        hint: 'ECDH, ECDSA — used in TLS key exchange, certificates (P-256, P-384), modern SSH, JWTs, and mobile authentication.',
        required: true,
        options: [
          { value: 'none_confirmed', label: 'ECC confirmed absent or already migrated away from', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'minimal_documented', label: 'Minimal ECC use — specific cases documented', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'widespread_known', label: 'ECC in widespread use — inventory complete', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'widespread_unknown', label: 'ECC likely widespread — no inventory', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'ECC usage unknown', score: 0, riskWeight: 1.0, isWeakness: true },
        ],
      },
      {
        id: 'pke_internet_facing',
        label: 'Internet-facing services using quantum-vulnerable key exchange',
        hint: 'TLS on public web services, APIs, email gateways — these have highest HNDL exposure as traffic may already be being harvested.',
        required: true,
        options: [
          { value: 'hybrid_pqc', label: 'Hybrid PQC key exchange already deployed (e.g. X25519+ML-KEM)', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'assessed_planned', label: 'All internet-facing services assessed — migration planned', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'assessed_no_plan', label: 'Internet-facing services assessed — no migration plan yet', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'not_assessed', label: 'Internet-facing services not assessed for quantum exposure', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 1.0, isWeakness: true },
        ],
      },
    ],
  },

  // ── 2. Certificate & Key Inventory ──────────────────────────────────────────
  {
    id: 'cert_key_inventory',
    label: 'Certificate & Key Inventory',
    icon: '📜',
    weight: 1.6,
    nistAlignment: ['SP 800-57', 'SP 800-208'],
    ncscRef: 'NCSC Post-Quantum Guidance — Cryptographic Inventory',
    description:
      'Assessment of certificate inventory completeness, key type visibility, and readiness to identify and replace quantum-vulnerable certificates at scale.',
    defensiveNote:
      'No certificate access, key extraction, or cryptographic operations are performed. This section assesses inventory and management process maturity.',
    questions: [
      {
        id: 'cert_inventory_completeness',
        label: 'Certificate inventory completeness',
        hint: 'Full visibility of all TLS, code signing, S/MIME, and internal CA certificates — including key type (RSA/ECC) and key length.',
        required: true,
        options: [
          { value: 'full_automated', label: 'Full automated inventory — key type, length, expiry all tracked', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'full_manual', label: 'Full manual inventory — key types documented', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'partial', label: 'Partial inventory — external certs tracked, internal gaps', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'expiry_only', label: 'Expiry tracked only — key type/algorithm not inventoried', score: 0, riskWeight: 0.8, isWeakness: true },
          { value: 'none', label: 'No certificate inventory', score: 0, riskWeight: 1.0, isWeakness: true },
        ],
      },
      {
        id: 'cert_key_types',
        label: 'Dominant certificate key type in use',
        hint: 'RSA and ECC are both quantum-vulnerable. Ed25519/X25519 are stronger classically but still quantum-vulnerable to Shor\'s algorithm.',
        required: true,
        options: [
          { value: 'pqc_hybrid', label: 'PQC or hybrid certificates already in use / piloting', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'rsa4096', label: 'Primarily RSA-4096 (larger keys slow migration less)', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'ecc384', label: 'Primarily ECC P-384 or higher', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'rsa2048_ecc256', label: 'Primarily RSA-2048 or ECC P-256 (most common, highest exposure)', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'mixed_unknown', label: 'Mixed or unknown key types', score: 0, riskWeight: 0.9, isWeakness: true },
        ],
      },
      {
        id: 'cert_ca_control',
        label: 'Control over Certificate Authority (CA) / PKI',
        hint: 'Organisations with their own CA or using a CA that supports PQC have more migration flexibility.',
        required: false,
        options: [
          { value: 'own_ca_pqc_ready', label: 'Own CA / private PKI — PQC certificate issuance tested or planned', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'own_ca_not_assessed', label: 'Own CA / private PKI — PQC readiness not yet assessed', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'public_ca_pqc_roadmap', label: 'Public CA (DigiCert, Sectigo, etc.) — vendor has PQC roadmap', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'public_ca_unknown', label: 'Public CA — vendor PQC roadmap unknown', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
    ],
  },

  // ── 3. Key Rotation & Lifecycle ─────────────────────────────────────────────
  {
    id: 'key_rotation',
    label: 'Key Rotation & Lifecycle',
    icon: '🔄',
    weight: 1.3,
    nistAlignment: ['SP 800-57 Part 1', 'SP 800-208'],
    ncscRef: 'NCSC Post-Quantum Guidance — Key Management',
    description:
      'Assessment of cryptographic key rotation frequency, automated lifecycle management, and the ability to rapidly rotate keys in response to a cryptographic compromise event.',
    defensiveNote:
      'No key material is accessed. This section assesses key management policies and operational processes.',
    questions: [
      {
        id: 'key_rotation_freq',
        label: 'Encryption key rotation frequency',
        hint: 'Regular key rotation limits the window of exposure if a key is compromised. More critical for asymmetric keys used in long-term confidential communications.',
        required: true,
        options: [
          { value: 'automated_scheduled', label: 'Automated key rotation on a defined schedule', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'annual_manual', label: 'Annual manual key rotation', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'ad_hoc', label: 'Ad hoc — keys rotated only when issues arise', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'never', label: 'Keys never rotated', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'key_rotation_speed',
        label: 'Emergency key rotation capability',
        hint: 'How quickly can you rotate all cryptographic keys across all systems in response to a compromise or algorithm deprecation?',
        required: true,
        options: [
          { value: 'hours', label: 'Hours — automated rotation pipeline in place', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'days', label: 'Days — documented process, partially automated', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'weeks', label: 'Weeks — manual, effort-intensive process', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'months', label: 'Months or more — complex, high-risk manual process', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'key_hardcoded',
        label: 'Hardcoded cryptographic keys or algorithms',
        hint: 'Hardcoded keys or algorithm identifiers in source code or firmware prevent rapid rotation and are a crypto-agility failure.',
        required: true,
        options: [
          { value: 'none_confirmed', label: 'No hardcoded keys confirmed — scanning and policy in place', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'none_believed', label: 'Believed none — no formal scan conducted', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'some_known', label: 'Some hardcoded keys known and remediation underway', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'widespread', label: 'Hardcoded keys known to be widespread', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Not assessed', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
    ],
  },

  // ── 4. Long-Lived Confidential Data (HNDL Risk) ───────────────────────────
  {
    id: 'hndl_risk',
    label: 'Harvest-Now-Decrypt-Later Risk',
    icon: '⏳',
    weight: 2.0,
    nistAlignment: ['SP 800-208', 'NIST IR 8413'],
    ncscRef: 'NCSC Post-Quantum Guidance — Harvest Now, Decrypt Later',
    description:
      'Assessment of harvest-now-decrypt-later (HNDL) exposure. Adversaries may already be collecting encrypted traffic with the intent to decrypt it once quantum computing becomes viable. Organisations handling data requiring confidentiality beyond ~10 years face the highest HNDL risk.',
    defensiveNote:
      'This section assesses self-reported data shelf-life and HNDL exposure. No traffic analysis, decryption, or network access is performed.',
    questions: [
      {
        id: 'hndl_data_shelf_life',
        label: 'Maximum required confidentiality shelf-life for your most sensitive data',
        hint: 'If data encrypted today must remain confidential in 10–15+ years, you face HNDL risk. Cryptographically-relevant quantum computers are projected by many agencies to be viable within this timeframe.',
        required: true,
        options: [
          { value: 'lt2yr', label: 'Less than 2 years — data has short operational relevance', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: '2to5yr', label: '2–5 years', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: '5to10yr', label: '5–10 years', score: 2, riskWeight: 0.5, isWeakness: true },
          { value: '10to25yr', label: '10–25 years — significant HNDL exposure', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'gt25yr', label: '25+ years or indefinite (government, legal, health, critical infrastructure)', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Not assessed', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'hndl_regulated_data',
        label: 'Regulated or state-sensitive data under encryption',
        hint: 'Health records, legal privilege, national security, financial records, and diplomatic communications are priority HNDL targets.',
        required: true,
        options: [
          { value: 'none', label: 'No regulated or state-sensitive data under encryption', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'commercial_only', label: 'Commercial data only — no regulated categories', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'gdpr_health', label: 'GDPR special category / health records', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'financial_legal', label: 'Financial records / legal privilege data', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'national_security', label: 'Government / national security / critical infrastructure data', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Not classified', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
      {
        id: 'hndl_archive_encryption',
        label: 'Encryption of archived / backup data',
        hint: 'Archives are a primary HNDL target — large volumes of encrypted historical data that adversaries may store for future decryption.',
        required: true,
        options: [
          { value: 'pqc_or_sym256', label: 'Archives encrypted with AES-256 or PQC — PK algorithms not used for bulk data', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'sym_key_via_rsa', label: 'Symmetric encryption used, but wrapped/exchanged via RSA or ECC', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'rsa_ecc_direct', label: 'Archives encrypted directly with RSA or ECC', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown / not assessed', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'hndl_traffic_exposure',
        label: 'Internet-facing encrypted traffic exposure assessment',
        hint: 'Assumption: adversaries with nation-state capability may already be recording all internet-facing encrypted traffic. Services transmitting long-lived secrets are highest priority.',
        required: false,
        options: [
          { value: 'low_value_only', label: 'Internet-facing traffic carries short-lived, low-sensitivity data only', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'assessed_acceptable', label: 'Assessed and HNDL risk deemed acceptable for current data', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'high_value_assessed', label: 'High-value data transmitted — HNDL risk assessed, mitigation planned', score: 1, riskWeight: 0.5, isWeakness: true },
          { value: 'high_value_unassessed', label: 'High-value data transmitted — HNDL risk not assessed', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
    ],
  },

  // ── 5. Crypto-Agility ────────────────────────────────────────────────────────
  {
    id: 'crypto_agility',
    label: 'Crypto-Agility',
    icon: '⚡',
    weight: 1.8,
    nistAlignment: ['SP 800-208', 'NIST IR 8547'],
    ncscRef: 'NCSC Post-Quantum Guidance — Crypto-Agility',
    description:
      'Assessment of organisational and technical ability to rapidly replace cryptographic algorithms. Crypto-agile organisations can migrate from quantum-vulnerable algorithms to PQC standards with minimal disruption.',
    defensiveNote:
      'This section assesses architecture and process factors affecting migration speed. No system access or configuration changes are performed.',
    questions: [
      {
        id: 'agility_architecture',
        label: 'Cryptographic algorithm abstraction in your software/systems',
        hint: 'Are cryptographic algorithms referenced via a configurable layer (e.g. provider abstraction, crypto library interface) or hardcoded throughout codebases?',
        required: true,
        options: [
          { value: 'full_abstraction', label: 'Full crypto abstraction — algorithms swappable via config / provider', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'partial_abstraction', label: 'Partial abstraction — some services configurable, others hardcoded', score: 2, riskWeight: 0.4, isWeakness: true },
          { value: 'mostly_hardcoded', label: 'Mostly hardcoded — significant refactoring required to change algorithms', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'fully_hardcoded', label: 'Fully hardcoded — algorithm change requires major architectural work', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'agility_dependency',
        label: 'Cryptographic library and dependency management',
        hint: 'Organisations relying on up-to-date, actively maintained crypto libraries (OpenSSL 3.x, BoringSSL, libsodium) are better positioned for PQC migration.',
        required: true,
        options: [
          { value: 'current_pqc_capable', label: 'Current crypto libraries in use — PQC support confirmed or roadmapped', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'current_not_assessed', label: 'Current crypto libraries — PQC readiness not assessed', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'outdated_known', label: 'Outdated crypto libraries known — update plan in place', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'outdated_no_plan', label: 'Outdated crypto libraries — no update plan', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'agility_protocols',
        label: 'Protocol-level PQC readiness',
        hint: 'TLS 1.3 with hybrid PQC extensions (RFC 8446 + IETF drafts), SSH with PQC key exchange, and S/MIME with PQC certs are the key protocol migration vectors.',
        required: false,
        options: [
          { value: 'hybrid_deployed', label: 'Hybrid PQC protocols deployed (TLS + ML-KEM, etc.)', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'hybrid_piloting', label: 'Hybrid PQC protocols piloting / in test', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'tls13_ready', label: 'TLS 1.3 deployed — ready for PQC extension when available', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'not_assessed', label: 'Protocol PQC readiness not assessed', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'legacy_protocols', label: 'Legacy protocols in use that may not support PQC extensions', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
    ],
  },

  // ── 6. Vendor & Supply Chain PQC Dependency ──────────────────────────────────
  {
    id: 'vendor_dependency',
    label: 'Vendor & Supply Chain PQC Readiness',
    icon: '🔗',
    weight: 1.2,
    nistAlignment: ['SP 800-208', 'NIST CSF ID.SC'],
    ncscRef: 'NCSC Post-Quantum Guidance — Supply Chain',
    description:
      'Assessment of vendor dependency for cryptographic transitions. Organisations relying heavily on vendors for cryptographic implementations must account for vendor PQC migration timelines.',
    defensiveNote:
      'This section assesses your dependency on vendors for cryptographic transitions and their stated PQC readiness. No vendor systems are accessed.',
    questions: [
      {
        id: 'vendor_pqc_assessed',
        label: 'Vendor PQC readiness assessment status',
        hint: 'Have your critical vendors (cloud providers, HSM vendors, PKI vendors, TLS libraries, VPN vendors) been assessed for PQC migration support?',
        required: true,
        options: [
          { value: 'all_assessed', label: 'All critical vendors assessed — PQC roadmaps documented', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'major_assessed', label: 'Major vendors assessed — minor vendors not yet assessed', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'partial', label: 'Some vendors assessed — significant gaps', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'none', label: 'No vendor PQC assessment performed', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'vendor_lock_in',
        label: 'Cryptographic vendor lock-in risk',
        hint: 'Proprietary HSMs, custom cryptographic modules, or vendor-specific PKI implementations can significantly slow PQC migration if the vendor does not support PQC.',
        required: false,
        options: [
          { value: 'open_standards', label: 'Open standards and interoperable implementations — low lock-in', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'mostly_open', label: 'Mostly open standards — limited proprietary components', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'significant_lock', label: 'Significant vendor lock-in — proprietary crypto components in critical systems', score: 1, riskWeight: 0.7, isWeakness: true },
          { value: 'hsm_lock', label: 'HSM / hardware crypto lock-in — vendor PQC support unconfirmed', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
      {
        id: 'vendor_contractual',
        label: 'PQC migration requirements in vendor contracts',
        hint: 'Have you included PQC migration obligations, roadmap disclosure requirements, or cryptographic agility requirements in vendor contracts?',
        required: false,
        options: [
          { value: 'pqc_clauses', label: 'PQC migration obligations included in key vendor contracts', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'crypto_agility', label: 'Cryptographic agility requirements in contracts — PQC-specific pending', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'none', label: 'No PQC or cryptographic agility requirements in contracts', score: 0, riskWeight: 0.7, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.5, isWeakness: true },
        ],
      },
    ],
  },

  // ── 7. Migration Planning ────────────────────────────────────────────────────
  {
    id: 'migration_planning',
    label: 'Post-Quantum Migration Planning',
    icon: '🗺️',
    weight: 1.5,
    nistAlignment: ['SP 800-208', 'NIST IR 8413'],
    ncscRef: 'NCSC Post-Quantum Guidance — Migration Planning',
    description:
      'Assessment of the organisation\'s formal planning for post-quantum cryptography migration. Includes awareness, roadmap development, executive sponsorship, and budget allocation.',
    defensiveNote:
      'This section assesses migration planning maturity only. No system changes are recommended without a full risk assessment by qualified cryptography and security professionals.',
    questions: [
      {
        id: 'migration_plan_status',
        label: 'PQC migration plan / roadmap status',
        required: true,
        options: [
          { value: 'active_roadmap', label: 'Active roadmap in place with milestones and owners', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'draft_roadmap', label: 'Draft roadmap under development', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'planning_started', label: 'Planning discussions started — no formal document', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'not_started', label: 'No planning started', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
      {
        id: 'migration_exec_sponsorship',
        label: 'Executive sponsorship and awareness',
        hint: 'PQC migration is a multi-year programme requiring board and C-suite awareness and budget commitment.',
        required: true,
        options: [
          { value: 'board_aware_sponsored', label: 'Board and C-suite aware — programme sponsored and budgeted', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'ciso_aware', label: 'CISO / security leadership aware — board briefing pending', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'tech_team_only', label: 'Technical team awareness only — no executive sponsorship', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'not_aware', label: 'No executive awareness of quantum cryptography threat', score: 0, riskWeight: 1.0, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'migration_nist_awareness',
        label: 'NIST PQC standards awareness (FIPS 203/204/205)',
        hint: 'NIST finalised FIPS 203 (ML-KEM/Kyber), FIPS 204 (ML-DSA/Dilithium), and FIPS 205 (SLH-DSA/SPHINCS+) in August 2024.',
        required: true,
        options: [
          { value: 'implementing', label: 'NIST standards being implemented or piloted', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'fully_aware_planning', label: 'Fully aware of FIPS 203/204/205 — implementation planning in progress', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'aware_general', label: 'Generally aware of NIST PQC programme — not standards-specific', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'limited_awareness', label: 'Limited awareness — heard of PQC but not familiar with NIST standards', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'unaware', label: 'Not aware of NIST PQC standards', score: 0, riskWeight: 0.9, isWeakness: true },
        ],
      },
      {
        id: 'migration_hybrid_tested',
        label: 'Hybrid classical + PQC scheme testing',
        hint: 'Hybrid schemes (e.g. X25519 + ML-KEM, P-256 + ML-DSA) provide defence against both classical and quantum attacks during the transition period.',
        required: false,
        options: [
          { value: 'deployed', label: 'Hybrid PQC schemes deployed in production', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'piloting', label: 'Hybrid PQC schemes in pilot / staging environment', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'planned', label: 'Hybrid PQC testing planned — not yet started', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'not_planned', label: 'Hybrid PQC not yet in scope', score: 1, riskWeight: 0.6, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
    ],
  },

  // ── 8. PQC Readiness Planning & Hybrid Posture ───────────────────────────────
  {
    id: 'pqc_readiness_posture',
    label: 'PQC Readiness Posture',
    icon: '⚛️',
    weight: 1.6,
    nistAlignment: ['FIPS 203', 'FIPS 204', 'FIPS 205', 'SP 800-208'],
    ncscRef: 'NCSC Post-Quantum Guidance — Transition Guidance',
    description:
      'Overall readiness posture for post-quantum transition: technical capability, policy readiness, budget, and timeline alignment against NCSC guidance.',
    defensiveNote:
      'This section assesses overall PQC readiness posture. Answers are self-reported and should be validated by qualified cryptography and security professionals.',
    questions: [
      {
        id: 'posture_internal_expertise',
        label: 'Internal PQC expertise and capability',
        hint: 'PQC migration requires specialist cryptographic knowledge. Assess whether this is available internally or via trusted advisors.',
        required: true,
        options: [
          { value: 'dedicated_team', label: 'Dedicated PQC / cryptography team or specialist in place', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'trained_staff', label: 'Staff trained in PQC — no dedicated role', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'external_advisor', label: 'Relying on external advisor / consultant for PQC guidance', score: 2, riskWeight: 0.3, isWeakness: false },
          { value: 'none', label: 'No internal or external PQC expertise available', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.7, isWeakness: true },
        ],
      },
      {
        id: 'posture_budget',
        label: 'Budget allocated for PQC migration',
        required: false,
        options: [
          { value: 'allocated_multi_year', label: 'Multi-year budget allocated and approved', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'allocated_this_year', label: 'Budget allocated for current financial year', score: 3, riskWeight: 0.1, isWeakness: false },
          { value: 'in_bid', label: 'Budget bid in progress — not yet approved', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'no_budget', label: 'No budget allocated or planned', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.6, isWeakness: true },
        ],
      },
      {
        id: 'posture_timeline',
        label: 'Target timeline for critical system PQC migration',
        hint: 'NCSC guidance recommends having a plan in place now and critical systems migrated well before 2030.',
        required: true,
        options: [
          { value: 'by_2027', label: 'Critical systems targeted for migration by 2027', score: 4, riskWeight: 0.0, isWeakness: false },
          { value: 'by_2029', label: 'By 2029', score: 3, riskWeight: 0.2, isWeakness: false },
          { value: 'by_2032', label: 'By 2032', score: 2, riskWeight: 0.4, isWeakness: false },
          { value: 'no_target', label: 'No target date defined', score: 0, riskWeight: 0.9, isWeakness: true },
          { value: 'unknown', label: 'Unknown', score: 0, riskWeight: 0.8, isWeakness: true },
        ],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getQuantumCategoryById(id) {
  return QUANTUM_ASSESSMENT_CATEGORIES.find((c) => c.id === id) || null;
}

export function getTotalQuantumQuestionCount() {
  return QUANTUM_ASSESSMENT_CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
}

export function getRequiredQuantumQuestionCount() {
  return QUANTUM_ASSESSMENT_CATEGORIES.reduce(
    (acc, cat) => acc + cat.questions.filter((q) => q.required).length, 0
  );
}

export function getAllQuantumQuestions() {
  return QUANTUM_ASSESSMENT_CATEGORIES.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, categoryId: cat.id, categoryLabel: cat.label }))
  );
}
