# Quantum Compliance OS™

**Defensive Quantum-Readiness & Security Implementation Assessment Platform**

> Version **v9.0.0** · Run 9 — Target Assessment Engine · Local-first PWA

---

## What is this?

Quantum Compliance OS™ is a local-first, browser-based compliance and security readiness assessment platform for SMEs, consultants, and internal teams.

It helps organisations understand their current security posture, assess quantum-readiness risk, manage compliance gaps, and prepare for post-quantum cryptography migration — all without any backend, database, or external API.

---

## Current Build

| Field | Value |
|---|---|
| **Version** | v9.0.0 |
| **Current Run** | Run 9 — Target Assessment Engine |
| **Completed Runs** | 1 · 2 · 3 · 4 · 5 · 5.5 · 6 · 7 · 8 · 8.5 · 9 |
| **Architecture** | Local-first PWA (React + Vite) |
| **Storage** | Browser localStorage (storage.js SSOT) |
| **Backend** | ❌ Not included |
| **Supabase** | ❌ Not included |
| **RLS** | ❌ Not applicable — no Supabase/backend |
| **Real Payments** | ❌ Not included |
| **External AI APIs** | ❌ Not included |
| **Offensive Scanning** | ❌ Not included — defensive use only |

---

## Completed Runs

| Run | Label | Summary |
|---|---|---|
| **1** | Core Foundation | Local-first PWA, storage.js SSOT, organisation profile, system inventory, dashboard, settings, risk taxonomy |
| **2** | Security Assessment Engine | Scored defensive security assessment (47 questions, 12 domains), risk model, recommendations |
| **3** | Quantum Readiness Engine | Post-quantum exposure model, HNDL risk scoring, NIST FIPS 203/204/205 alignment |
| **4** | Reports & Evidence Pack | Report generation, JSON/CSV export, evidence pack builder, print layout |
| **5** | Consultant Layer | Multi-client workspace, client switcher, risk comparison, onboarding wizard, sales landing page |
| **5.5** | Validation & Hardening | SSOT enforcement, mobile fix, state recovery, responsive CSS |
| **6** | Demo Portfolio | 5 realistic SME demo clients (high/medium/low risk), sample reports and evidence packs |
| **7** | Deployment Packaging | Vercel/static deployment, PWA hardening, SW update notifications, DeploymentReadiness page |
| **8** | Consultant Copilot | Local-first deterministic copilot — executive summaries, remediation plans, quantum explanations |
| **8.5** | Workspace Mode Toggle | Global Demo/Product mode switch — all pages, components, and Copilot respect mode filtering |
| **9** | Target Assessment Engine | Passive, authorised target assessment with authorisation gate, checklist, recommendation engine, scoring, evidence panel, report preview |

---

## Run 9 — Target Assessment Engine

New in Run 9:

- **Target Registry** — add and manage assessment targets (websites, web apps, SaaS, APIs, internal systems, cloud environments)
- **Authorisation Gate** — ownership or written permission must be confirmed before any assessment is generated
- **Passive Checklist** — structured checks across: HTTPS/TLS, security headers, authentication, encryption, data protection, backup/recovery, vendor risk, quantum readiness, evidence gaps
- **Recommendation Engine** — rule-based findings generated from checklist answers; each finding includes risk level, business impact, technical explanation, compliance relevance, quantum relevance, recommended fix, evidence required
- **4-Dimension Scoring** — Security Readiness, Quantum Readiness, Evidence Completeness, Compliance Readiness (all 0–100, advisory, explainable)
- **Evidence Panel** — attach notes, screenshots, documents, configuration exports, or reports per finding
- **Report Preview** — print/PDF-ready advisory report with scope, authorisation, scores, findings, evidence, priority action plan, and disclaimer
- **Demo/Product Mode Aware** — demo targets clearly labelled; hidden in product mode
- **No offensive scanning** — purely passive, advisory, questionnaire-driven

### What is NOT included

- No automated HTTP requests or crawling from the browser
- No exploit testing, vulnerability exploitation, or payload injection
- No credential or login testing
- No brute force tools
- No port scanning
- No certificate "guarantee" or compliance certification
- No external AI APIs
- No backend, Supabase, or RLS

---

## Architecture

```
quantum-compliance-os/
  src/
    core/
      storage.js                   ← SSOT for ALL state
      constants.js                 ← PAGES, NAV, APP_VERSION
      workspaceMode.js             ← Demo/Product mode logic
      targetAssessmentRules.js     ← Passive checklists, finding templates, demo data
      targetAssessmentScoring.js   ← Advisory scoring engine (pure functions)
      targetAssessmentStorage.js   ← SSOT extension — target CRUD, findings, evidence
      copilotEngine.js             ← Local deterministic Copilot
      assessmentSchema.js          ← Security assessment questions
      quantumSchema.js             ← Quantum readiness questions
      scoringEngine.js             ← Security scoring
      quantumScoringEngine.js      ← Quantum scoring
      consultantStorage.js         ← Multi-client consultant layer
      demoPortfolio.js             ← 5 fictional SME demo clients
      seedData.js                  ← Default seed data
      validators.js                ← Input validation
      riskTaxonomy.js              ← Risk categories
      reportSchema.js              ← Report structure
    pages/
      Dashboard.jsx
      TargetAssessments.jsx        ← Run 9: Target Assessment Engine
      SecurityAssessment.jsx
      QuantumReadiness.jsx
      Recommendations.jsx
      Reports.jsx
      EvidencePack.jsx
      ConsultantDashboard.jsx
      ConsultantCopilot.jsx
      Settings.jsx
      About.jsx
      DeploymentReadiness.jsx
      OrganisationProfile.jsx
      SystemInventory.jsx
      Onboarding.jsx
      LandingPage.jsx
    components/
      AppShell.jsx
      Sidebar.jsx
      TopBar.jsx
      SectionCard.jsx
      PageHeader.jsx
      StatCard.jsx
      ActionButton.jsx
      FormField.jsx
      EmptyState.jsx
      RiskBadge.jsx
      StatusPill.jsx
```

---

## Data Model (localStorage via storage.js SSOT)

All state is stored under `qcos_v1_state` in browser localStorage.

Key state fields:

```js
{
  appMeta:             { version, buildRun, latestCompletedRun, ... },
  completedRuns:       [...],
  moduleStatus:        { ..., targetAssessmentEngine: 'complete' },
  featureFlags:        { ..., targetAssessmentEngine: true, supabaseEnabled: false, ... },
  organisation:        { ... },
  systemProfiles:      [...],
  assessmentState:     { securityAssessment, quantumReadiness },
  targetAssessments:   [...],   // Run 9
  targetFindings:      [...],   // Run 9
  targetEvidence:      [...],   // Run 9
  targetScores:        [...],   // Run 9
  assessmentSettings:  { ... }, // Run 9
  evidencePack:        { ... },
  consultantCopilot:   { ... },
  settings:            { workspaceMode: 'demo' | 'product', ... },
}
```

---

## Deploy

**Vercel (recommended):**

```bash
npm install
npm run build
# Push to GitHub → connect to Vercel → auto-deploy
```

**Local dev:**

```bash
npm install
npm run dev
```

---

## Safety Declarations

- ✅ Defensive use only — no offensive tools, no exploit scanning
- ✅ No backend — all data stays in browser localStorage
- ✅ No Supabase — RLS is not applicable (no backend exists)
- ✅ No external API calls — no AI API, no scanner, no cloud
- ✅ No real payments — placeholder only
- ✅ Authorisation gate — assessment generation requires confirmed ownership or written permission
- ✅ Advisory scores only — no "certified secure" or "guaranteed compliant" claims
- ✅ All demo data clearly labelled
- ✅ SSOT enforced — only storage.js and targetAssessmentStorage.js touch localStorage

---

## Disclaimer

This platform is for defensive security readiness, compliance preparation, and post-quantum migration planning only. It does not perform offensive testing, unauthorised scanning, exploitation, or guarantee compliance. All assessments should be reviewed by qualified security professionals before operational decisions are made.
