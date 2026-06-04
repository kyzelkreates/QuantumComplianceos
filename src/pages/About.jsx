/**
 * QUANTUM COMPLIANCE OS™ — About.jsx
 * Run 8: Updated platform overview, build roadmap, and architecture summary.
 * Defensive use only. No fake certifications. No compliance guarantees.
 *
 * Run 8 Status Sync: Updated subtitle, RUNS_COMPLETE, FUTURE_RUNS, and
 * architecture table to reflect Run 8 completion.
 */

import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import { DEFENSIVE_DISCLAIMER, APP_VERSION, APP_RUN_LEVEL } from '../core/constants.js';

// ─── Build Roadmap ────────────────────────────────────────────────────────────
const RUNS_COMPLETE = [
  { run: 1,     label: 'Core Foundation',
    desc: 'Local-first PWA, storage.js SSOT, organisation profile, system inventory, dashboard, settings, risk taxonomy.' },
  { run: 2,     label: 'Security Assessment Engine',
    desc: 'Scored defensive security assessment (47 questions, 12 domains), risk model population, preventative recommendations.' },
  { run: 3,     label: 'Quantum Readiness Engine',
    desc: 'Post-quantum exposure model, HNDL risk scoring, crypto-agility assessment, NIST FIPS 203/204/205 alignment.' },
  { run: 4,     label: 'Reports & Evidence Pack',
    desc: 'Executive and technical report generation, JSON/CSV export, evidence pack builder, print layout, report history.' },
  { run: 5,     label: 'Consultant Layer',
    desc: 'Multi-client workspace, client switcher, risk comparison, per-client isolation, backup/restore, onboarding wizard, sales landing page.' },
  { run: '5.5', label: 'Validation & Hardening',
    desc: 'Full import audit, SSOT enforcement, mobile sidebar fix, corrupted state recovery, importFullBackup hardening, responsive CSS extension.' },
  { run: 6,     label: 'Demo Portfolio & Sales Polish',
    desc: '5 realistic SME demo clients (high/medium/low risk), sample reports, evidence packs, consultant dashboard metrics, landing page polish.' },
  { run: 7,     label: 'Deployment Packaging',
    desc: 'Vercel/static deployment config, PWA hardening, SW update notifications, index.html metadata, README, DeploymentReadiness page.' },
  { run: 8,     label: 'AI Recommendation Assistant / Consultant Copilot',
    desc: 'Local-first deterministic Consultant Copilot. Executive summary drafts, technical remediation plans, meeting talking points, evidence gap summaries, quantum-readiness explanations. No external AI API required. No offensive tools. Template-driven local logic only.' },
  { run: '8.5', label: 'Global Demo Mode / Product Mode Toggle',
    desc: 'Global workspace mode switch between Demo Mode (investor/client showcase) and Product Mode (real-user workspace). workspaceMode stored in storage.js SSOT. All demo content labelled. All pages, components, and Copilot respect mode filtering. No demo data deleted without confirmation.' },
  { run: 9,     label: 'Target Assessment Engine',
    desc: 'Passive, authorised target assessment for websites, web apps, SaaS platforms, APIs, and internal systems. Authorisation gate (ownership/permission required). Passive checklist (HTTPS, TLS, headers, auth, encryption, backup, vendor risk, quantum readiness, evidence). Rule-based recommendation and finding engine. Explainable 4-score model (Security, Quantum, Evidence, Compliance). Evidence panel. Report preview with advisory disclaimer. Demo/product mode aware. Defensive use only. No offensive scanning, no exploit tools, no credential testing.' },
  { run: 10,    label: 'Commercial Tier + Feature Gate Foundation',
    desc: 'Central plans.js config (Starter, Pro Consultant, Agency, White Label). Feature key registry. Helper functions (getCurrentPlan, canUseFeature, getClientLimitForPlan, isPlanComingSoon, getUpgradePlans). Plan cards UI with active/locked/coming-soon states. activePlanId added to storage.js SSOT. Settings page Plans & Upgrade section. No backend, no payments, no auth. Starter is active by default. Pro/Agency/White Label locked with advisory messages.' },
  { run: 11,    label: 'Multi-Client Consultant Hub',
    desc: 'ClientHub.jsx — full multi-client management hub. clientHubSeedData.js — 5 fictional demo clients (Acme Manufacturing/high, Northbridge Finance/medium, Greenline Health/high, SecurePath Logistics/low, CivicCloud Services/review-needed). Client data model extended with riskLevel, quantumReadinessScore, securityScore, evidenceStatus, assessmentStatus, lastAssessmentDate, reportCount, isDemo, status. consultantStorage.js extended with loadDemoHubClients, clearDemoHubClients, getDemoHubClients. Add/Edit/Archive/Restore flows. Search, filter, sort. Client workspace. Plan limit enforcement. 8-metric overview. No backend. No Supabase. No payments. No AI APIs.' },
  { run: 12,    label: 'Reports, Evidence History + Risk Comparison',
    desc: 'reportHistoryData.js (7 reports, 12 evidence items, 6 snapshots). reportHistoryHelpers.js (pure helpers). consultantStorage.js extended with reports[], evidenceItems[], snapshots[] + CRUD. ClientHub.jsx extended: ReportHistoryPanel, EvidenceArchivePanel, SnapshotTimelinePanel, RiskComparisonDashboard, UrgentActionsPanel, MissingEvidencePanel, quick-nav buttons. Local/demo-safe. No backend. No AI APIs.' },
  { run: 13,    label: 'Agency + White Label Settings',
    desc: 'agencyHelpers.js — pure helpers. AgencySettings.jsx — 10-section page: Agency Profile, Branding Controls, White Label Settings, Report Branding Preview, Portfolio Analytics Preview, Client Archive Management, Custom Domain Placeholder, Onboarding Wizard Placeholder, SLA/Support Placeholder, Agency Feature Gates. consultantStorage.js: agencySettings + whiteLabelSettings. constants.js: PAGES.AGENCY_SETTINGS. All local/demo-safe. No backend. Kyzel Kreates™ / 4P3X Intelligent AI™ ownership preserved.' },
  { run: 14,    label: 'Demo/Live Toggle + Data Provider Architecture',
    desc: 'dataProviders.js — data provider registry (localStorage active; supabase/firebase/aws/customApi as placeholders), PRODUCT_MODE model, helpers. ProductModeSettings.jsx — 6-section page: Mode Banner, Product Mode Panel, Data Provider Readiness, Data Separation Diagnostics, 4P3X API Config Guard™, Backend Future Notice. storage.js: productMode + activeDataProvider in settings + migration step 9. PAGES.PRODUCT_MODE nav. Mode switching reuses Run 8.5 setWorkspaceMode. No backend. No credentials. No external APIs.' },
  { run: 15,    label: 'Backend Connectors + Live Sync Layer',
    desc: 'backendSync.js — detectBlockedSecrets, validatePublicConfig, maskProviderConfig, saveBackendProviderConfig, testBackendConnection (config-shape only), setActiveBackendProvider, runManualSync, queueSyncEvent, markSyncEventSynced/Failed, getBackendReadinessStatus, getSyncStatusSummary. BackendConnectorSettings.jsx — 7-section page: Status, Supabase (URL+AnonKey, per-field secret detection), Firebase (6 fields), AWS placeholder, Custom REST placeholder, Sync Control, SQL Setup Reference. SUPABASE_SETUP_RUN_15.sql — 8 tables, 24 indexes, 8 triggers, RLS ENABLED on all 8 tables, 32 RLS policies, verification queries, rollback (commented). storage.js: backendSettings + syncSettings + syncQueue + migration step 10. PAGES.BACKEND_CONNECTORS nav. No real SDK. No service role keys.' },
  { run: 16,    label: 'Built-In AI Agents + Open-Source AI Provider Options',
    desc: 'aiAgents.js — AI provider registry (8 providers: mock/openaiCompatible/ollama/lmStudio/openRouter/groq/huggingFace/customEndpoint), AI agent registry (7 agents: complianceGapAgent/quantumReadinessAgent/securityEvidenceAgent/consultantReportAgent/clientOnboardingAgent/backendSetupAgent/whiteLabelSetupAgent), detectBlockedAISecrets (blocks service_role/jwt_secret/private_key/webhook_secret/etc), validateAIProviderConfig, maskAIProviderConfig, saveAIProviderConfig, setActiveAIProvider, applyAIGuardrails (10 guardrails), generateMockAIResponse (7 agent templates), buildAgentContext, runAIAgent, getAISettings/Providers/Status/SafetySummary/Agents. AISettings.jsx — 4-section page: AI Status Overview (10 tiles), AI Provider Settings (8 providers with edit/save/set-active), 4P3X Intelligent AI™ Advisory Agents (7 agent cards with allowed/forbidden/context/Ask button + modal chat panel), AI Safety Summary (12 guardrail rows + API Config Guard extension). storage.js: aiSettings + aiProviders + aiAgentSessions + migration step 11. PAGES.AI_SETTINGS nav. Mock/Demo AI always active as default + fallback. No real AI SDK. All agents advisory-only. Human review required. No evidence fabrication. No destructive actions.' },
];

const FUTURE_RUNS = [


  { run: '17',    label: 'Final Commercial Polish + Full System Validation + Deployment Readiness (Run 17)',
    desc: 'Final polish across all runs, full validation pass, production deployment checklist, performance optimisation, and first complete live commercial demo configuration.' },
  { run: 'Future', label: 'Supabase Migration (Optional)',
    desc: 'Optional multi-device sync. RLS would be enabled at this point. Opt-in upgrade path.' },
  { run: 'Future', label: 'Optional AI API Connector',
    desc: 'Future optional AI API — disabled in this local-first MVP. Would use existing copilotEngine.js interface.' },
  { run: 'Future', label: 'Authorised TLS/Certificate Checker',
    desc: 'User-supplied domains only. Explicit consent. Defensive use only. No scanning without permission.' },
  { run: 'Future', label: 'Real Payments',
    desc: 'Stripe integration for tier upgrades. Requires backend. Currently placeholder display only.' },
];

export default function About({ onNavigate }) {
  return (
    <div>
      <PageHeader
        icon="ℹ️"
        title="About Quantum Compliance OS™"
        subtitle={`Defensive quantum-readiness and security implementation assessment platform. Version ${APP_VERSION} — Run ${APP_RUN_LEVEL}.`}
      />

      {/* Platform overview */}
      <SectionCard title="Platform Overview" icon="⬡">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Product</div>
            <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--accent)', marginBottom: '4px' }}>Quantum Compliance OS™</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Defensive Quantum-Readiness &amp; Security Implementation Assessment Platform
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              ['Version',            `v${APP_VERSION} — Run ${APP_RUN_LEVEL}`],
              ['Current Build',      'Run 8 — AI Recommendation Assistant / Consultant Copilot'],
              ['Architecture',       'Local-First PWA (React + Vite)'],
              ['Storage',            'Browser localStorage — SSOT via storage.js'],
              ['Backend',            'None — fully offline capable'],
              ['Database',           'None — no Supabase, no Firebase'],
              ['RLS',                'N/A — no backend exists'],
              ['Payments',           'Not connected — placeholder display only'],
              ['AI APIs',            'Not connected — all scoring is local deterministic logic'],
              ['Consultant Copilot', 'Local deterministic mode only — no external AI calls'],
              ['Tracking',           'None — no analytics, no telemetry'],
              ['Offensive Tools',    'None — defensive assessment only'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '5px', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Run 8 Copilot Overview */}
      <SectionCard title="Consultant Copilot — Run 8 Feature" icon="🤖">
        <div style={{ padding: '14px 18px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)', marginBottom: '8px' }}>
            Local-First AI Recommendation Assistant
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            The Consultant Copilot uses <strong style={{ color: 'var(--text-secondary)' }}>deterministic local template logic</strong> to help
            consultants draft defensive readiness guidance. It does not perform live testing, offensive scanning,
            exploitation, or guarantee compliance. All drafts are based on supplied assessment data.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            '✓ Executive summary drafts (non-technical, client-ready)',
            '✓ Technical remediation drafts (30/60/90 day plans)',
            '✓ Meeting talking points (opener, risks, next steps)',
            '✓ Evidence gap summaries (missing/incomplete evidence)',
            '✓ Quantum-readiness plain-English explanations',
            '✓ Priority action plans (based on score bands)',
            '✓ Client risk snapshots (score + risk band context)',
            '✓ Consultant next steps (internal guidance)',
            '✓ Copy-to-clipboard for every generated section',
            '✓ Save drafts to local storage via storage.js SSOT',
            '✓ Works offline — no API key required',
            '✓ Tone / audience / detail-level settings',
          ].map((item) => (
            <div key={item} style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 500, lineHeight: 1.5 }}>{item}</div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--warning)' }}>Safety disclaimer:</strong> This Copilot uses local assessment data and deterministic templates to help draft defensive readiness guidance. It does not perform live testing, offensive scanning, exploitation, or guarantee compliance. Recommendations should be reviewed by a qualified security professional before use.
        </div>
      </SectionCard>

      {/* Defensive scope */}
      <SectionCard title="Defensive Scope" icon="🛡️">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            '✓ Defensive security readiness assessment (47 questions, 12 domains)',
            '✓ Post-quantum cryptography exposure mapping (HNDL, RSA/ECC)',
            '✓ Crypto-agility and PQC migration planning (NIST FIPS 203/204/205)',
            '✓ Compliance evidence preparation (ISO 27001, NCSC, UK GDPR)',
            '✓ NIST CSF / NCSC Cyber Essentials framework alignment notes',
            '✓ Risk register with likelihood × impact scoring',
            '✓ Prioritised preventative control recommendations',
            '✓ Multi-client consultant workspace (fully local)',
            '✓ Local-first Consultant Copilot (deterministic drafts only)',
          ].map((item) => (
            <div key={item} style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 500, lineHeight: 1.5 }}>{item}</div>
          ))}
        </div>
        <div style={{ height: '1px', background: 'var(--border-default)', margin: '14px 0' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            '✗ No offensive testing or exploitation tools',
            '✗ No unauthorised or live target scanning',
            '✗ No password cracking or brute force',
            '✗ No attack automation or credential harvesting',
            '✗ No compliance certification claims',
            '✗ No "quantum-proof" or breach prevention guarantees',
            '✗ No external data transmission',
            '✗ No tracking, analytics, or telemetry',
            '✗ No external AI API calls',
            '✗ No backend or Supabase',
          ].map((item) => (
            <div key={item} style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 500, lineHeight: 1.5 }}>{item}</div>
          ))}
        </div>
      </SectionCard>

      {/* Build roadmap */}
      <SectionCard title="Build Roadmap" icon="🗺️">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Completed Runs (1–8)
          </div>
          {RUNS_COMPLETE.map((r) => (
            <div key={r.run} style={{
              display: 'flex', gap: '14px', padding: '12px 16px',
              background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--success)', flexShrink: 0 }}>✓</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>
                  Run {r.run} — {r.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: '1px', background: 'var(--border-default)', margin: '16px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Optional Future Runs — Not Yet Built
          </div>
          {FUTURE_RUNS.map((r) => (
            <div key={`${r.run}-${r.label}`} style={{
              display: 'flex', gap: '14px', padding: '12px 16px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }}>{r.run}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Run {r.run} — {r.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Framework references */}
      <SectionCard title="Standards & Framework References" icon="📜">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {[
            ['NIST SP 800-208',  'Post-Quantum Cryptography Migration'],
            ['NIST IR 8413',     'Initial Public Draft — PQC Standards'],
            ['NIST FIPS 203',    'ML-KEM (Module-Lattice Key Encapsulation)'],
            ['NIST FIPS 204',    'ML-DSA (Module-Lattice Digital Signature)'],
            ['NIST FIPS 205',    'SLH-DSA (Stateless Hash-Based Signature)'],
            ['NIST CSF 2.0',     'Cybersecurity Framework'],
            ['ISO/IEC 27001',    'Information Security Management'],
            ['NCSC Cyber Essentials', 'UK Government Baseline Cyber Security'],
            ['NCSC PQC Guidance', 'Post-Quantum Cryptography Readiness'],
            ['UK GDPR',          'Data Protection Act 2018 / GDPR (UK)'],
            ['NIS2 Directive',   'EU Network & Information Security'],
            ['DORA',             'Digital Operational Resilience Act'],
          ].map(([code, desc]) => (
            <div key={code} style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--accent)', marginBottom: '3px' }}>{code}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)', padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--warning)' }}>Note:</strong> Framework references are provided for alignment and planning purposes only. This platform does not provide certified compliance, regulatory sign-off, or legally binding audit results. All assessments should be reviewed by qualified compliance and security professionals.
        </div>
      </SectionCard>

      {/* Legal disclaimer */}
      <SectionCard title="Legal & Safety Disclaimer" icon="⚖️">
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, padding: '16px 20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '10px' }}>⚠ Defensive Use Only</strong>
          {DEFENSIVE_DISCLAIMER}
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-muted)', paddingTop: '12px' }}>
            All data is stored exclusively in this browser's localStorage. No cloud sync. No backend. No external transmission. Data is cleared if browser storage is cleared or private browsing mode is used.
          </div>
        </div>

        {onNavigate && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <ActionButton variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>← Dashboard</ActionButton>
            <ActionButton variant="ghost" size="sm" onClick={() => onNavigate('settings')}>⚙️ Settings</ActionButton>
            <ActionButton variant="ghost" size="sm" onClick={() => onNavigate('deployment-readiness')}>🚀 Deployment Checklist</ActionButton>
            <ActionButton variant="ghost" size="sm" onClick={() => onNavigate('consultant-copilot')}>🤖 Consultant Copilot</ActionButton>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
