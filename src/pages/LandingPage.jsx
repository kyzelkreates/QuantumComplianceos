/**
 * QUANTUM COMPLIANCE OS™ — LandingPage.jsx
 * Run 28: Full Homepage / Investor Explainer Page Upgrade.
 * =========================================================
 * Sections:
 *   Hero · What It Does · Why It Is Needed · Who Needs It ·
 *   What A Mistake Can Cost · The Reason For The Product ·
 *   Technology Stack · AI Agents · Demo vs Live · Investor Explainer ·
 *   Final CTA
 *
 * Navigation:
 *   - onEnter()           → enter app (standard)
 *   - onLoadDemo()        → enable demo mode + enter app
 *   - onNavigateTo(page)  → enter app and navigate to a specific page
 *
 * Props:
 *   onEnter       — () => void          — enter platform
 *   onLoadDemo    — () => void          — load demo portfolio
 *   onNavigateTo  — (page: string) => void — enter + navigate to page (Run 28)
 *
 * No pricing. No fake backend. No compliance guarantees.
 * All statements use careful advisory wording.
 *
 * DEFENSIVE USE ONLY. No tracking. No external requests. No fake certifications.
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect, useRef } from 'react';
import ActionButton from '../components/ActionButton.jsx';
import { enableDemoMode } from '../core/storage.js';
import { PAGES, APP_VERSION, APP_RUN_LEVEL } from '../core/constants.js';

// ─── Small reusable components (scoped to homepage only) ─────────────────────

function HPCard({ icon, title, children, accent }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${accent ? `${accent}33` : 'var(--border-muted)'}`,
      borderRadius: 12,
      padding: '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {icon && <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>}
      {title && <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>{title}</div>}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function SectionWrap({ id, children, style = {} }) {
  return (
    <section
      id={id}
      style={{
        padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 32px)',
        maxWidth: 1040,
        margin: '0 auto',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionHeading({ label, title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      {label && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
          borderRadius: 999, padding: '3px 14px',
          fontSize: 11, fontWeight: 700, color: 'var(--accent)',
          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14,
        }}>
          {label}
        </div>
      )}
      <h2 style={{
        fontSize: 'clamp(20px, 3.5vw, 32px)',
        fontWeight: 900, lineHeight: 1.2,
        letterSpacing: '-0.3px', marginBottom: 12,
        color: 'var(--text-primary)',
      }}>
        {title}
      </h2>
      {sub && (
        <p style={{
          fontSize: 14, color: 'var(--text-muted)',
          lineHeight: 1.7, maxWidth: 680, margin: '0 auto',
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border-muted)', maxWidth: 1040, margin: '0 auto' }} />;
}

// ─── Shortcut button helper ───────────────────────────────────────────────────

/**
 * Creates a shortcut CTA that either:
 *  - calls onNavigateTo(page) if the page exists in PAGES
 *  - falls back to onEnter() if no specific target
 */
function ShortcutButton({ children, page, onNavigateTo, onEnter, variant = 'secondary', style = {} }) {
  const handle = () => {
    if (page && onNavigateTo) {
      onNavigateTo(page);
    } else if (onEnter) {
      onEnter();
    }
  };
  return (
    <button
      onClick={handle}
      aria-label={typeof children === 'string' ? children : undefined}
      style={{
        padding: '10px 16px',
        fontSize: 13,
        fontWeight: 700,
        borderRadius: 8,
        cursor: 'pointer',
        minHeight: 40,
        border: variant === 'primary'
          ? '1px solid var(--accent)'
          : '1px solid var(--border-default)',
        background: variant === 'primary'
          ? 'var(--accent-dim)'
          : 'var(--bg-elevated)',
        color: variant === 'primary' ? 'var(--accent)' : 'var(--text-secondary)',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = variant === 'primary' ? 'var(--accent)' : 'var(--border-default)';
        e.currentTarget.style.color = variant === 'primary' ? 'var(--accent)' : 'var(--text-secondary)';
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandingPage({ onEnter, onLoadDemo, onNavigateTo }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled,   setPwaInstalled]   = useState(false);
  const [installDone,    setInstallDone]    = useState(false);
  const [scrolled,       setScrolled]       = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.matchMedia('(display-mode: standalone)').matches) setPwaInstalled(true);
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setPwaInstalled(true); setInstallDone(true); }
    setDeferredPrompt(null);
  };

  // Navigate into dashboard at a specific page
  const goTo = (page) => {
    if (onNavigateTo) {
      onNavigateTo(page);
    } else if (onEnter) {
      onEnter();
    }
  };

  const loadDemo = () => {
    enableDemoMode();
    if (onLoadDemo) onLoadDemo();
    else if (onEnter) onEnter();
  };

  // ── Section: What It Does ──────────────────────────────────────────────────
  const PLATFORM_MODULES = [
    { icon: '⚛️', title: 'Quantum Readiness Assessment',     desc: 'HNDL risk scoring, crypto-agility review, RSA/ECC exposure mapping, and NIST FIPS 203/204/205 migration priority guidance.' },
    { icon: '🛡️', title: 'Cryptographic Inventory Planning', desc: 'Map encryption use across systems, APIs, certificates, suppliers, and data flows. Identify what needs migrating first.' },
    { icon: '📁', title: 'Compliance Evidence Capture',      desc: 'Framework-mapped evidence tracker auto-scaffolded from assessment results. ISO 27001, NCSC, NIST aligned. Status tracked per item.' },
    { icon: '🏢', title: 'Supplier & System Risk Review',    desc: 'Assess supplier dependencies, third-party exposure, system inventory, and vendor risk across your client or organisation.' },
    { icon: '🔐', title: 'Data Sensitivity Mapping',         desc: 'Identify data types, shelf-life, sensitivity and residual quantum risk from harvest-now-decrypt-later scenarios.' },
    { icon: '🗺️', title: 'Post-Quantum Migration Planning',  desc: 'Staged migration planning from current posture to PQC-ready architecture — short, medium and long-term action planning.' },
    { icon: '📋', title: 'Consultant-Ready Reports',         desc: 'Auto-generated executive and technical reports. JSON/CSV export. Print-ready layout. Multi-client portfolio management.' },
    { icon: '💼', title: 'Board / Investor Explanation',     desc: 'Turn complex quantum risk into boardroom-ready summaries and investor-facing readiness briefings.' },
    { icon: '🔄', title: 'Demo / Live Product Switching',    desc: 'Demo Mode shows the full product workflow safely. Live Mode runs with real data when the backend is configured.' },
    { icon: '🤖', title: 'AI-Assisted Recommendations',      desc: 'Seven 4P3X Intelligent AI™ advisory agents provide readiness analysis, gap commentary, and action guidance. All advisory. All human-reviewed.' },
  ];

  // ── Section: Who Needs It ─────────────────────────────────────────────────
  const WHO_CARDS = [
    { icon: '🤝', title: 'Cyber & IT Consultants',            desc: 'Build professional quantum-readiness and compliance assessments for SME clients. Generate branded reports. Manage multi-client portfolios locally.' },
    { icon: '📜', title: 'Compliance Consultants',            desc: 'ISO 27001, NCSC Cyber Essentials, UK GDPR readiness. Evidence pack builder. Framework gap analysis. Audit trail support.' },
    { icon: '🛡️', title: 'MSPs / IT Providers',               desc: 'Add quantum-readiness and post-quantum compliance advisory services to your existing client offering without new infrastructure.' },
    { icon: '🏥', title: 'Healthcare & Care Organisations',    desc: 'Sensitive data holders with strict governance obligations. Map encryption exposure, evidence compliance posture, and migration needs.' },
    { icon: '⚖️', title: 'Legal & Financial Firms',           desc: 'High data sensitivity, long retention periods, and growing regulatory expectations around cyber governance and post-quantum readiness.' },
    { icon: '🏛️', title: 'Public Sector Suppliers',           desc: 'Organisations supplying to government, NHS, or regulated public bodies increasingly need cyber assurance evidence for tender and procurement.' },
    { icon: '🎓', title: 'Education Providers',               desc: 'Manage data governance, system inventory, and cyber readiness evidence. Support inspection, grant, and funding compliance workflows.' },
    { icon: '💙', title: 'Charities & Grant-Funded Orgs',     desc: 'Grant funders, insurers and enterprise partner organisations increasingly require stronger cyber governance and evidence from funded bodies.' },
    { icon: '💻', title: 'SaaS & Software Companies',         desc: 'Customers and enterprise buyers are asking harder questions about cryptographic posture, encryption migration plans, and supply chain security.' },
    { icon: '🏭', title: 'Enterprise Supply-Chain Teams',     desc: 'Supplier assurance, vendor quantum risk review, and post-quantum cryptographic inventory for complex supply-chain governance.' },
    { icon: '🔬', title: 'Security Practitioners',            desc: 'Deep post-quantum cryptography assessment, NIST PQC migration analysis, crypto-agility scoring and technical risk mapping.' },
    { icon: '📊', title: 'Audit / Tender / Funding Prep',     desc: 'Organisations preparing for audits, tender submissions, cyber insurance applications, or funding rounds that require evidence-backed cyber assurance.' },
  ];

  // ── Section: AI Agents ────────────────────────────────────────────────────
  const AI_AGENT_CARDS = [
    {
      icon: '🔍', colour: '#3b82f6',
      name: '4P3X Intelligent AI™ 1 — Compliance Gap Agent',
      purpose: 'Reviews compliance gaps, missing controls, weak evidence records, and highlights consultant review actions based on visible assessment data.',
      output: 'Gap summary, missing control flags, advisory next-action recommendations.',
    },
    {
      icon: '⚛️', colour: '#8b5cf6',
      name: '4P3X Intelligent AI™ 2 — Quantum Readiness Agent',
      purpose: 'Explains quantum-readiness risk, cryptography inventory gaps, supplier dependencies, harvest-now-decrypt-later exposure, and migration planning priorities.',
      output: 'Advisory readiness score commentary, migration priority suggestions, missing information warnings.',
    },
    {
      icon: '📂', colour: '#f59e0b',
      name: '4P3X Intelligent AI™ 3 — Security Evidence Agent',
      purpose: 'Reviews evidence completeness, flags missing documentation, identifies weak evidence records, and explains audit-readiness gaps from visible data.',
      output: 'Evidence gap list, audit-readiness commentary, evidence collection task suggestions.',
    },
    {
      icon: '📄', colour: '#10b981',
      name: '4P3X Intelligent AI™ 4 — Consultant Report Agent',
      purpose: 'Helps draft client-ready report language from existing data, rewrites recommendations clearly, and produces advisory report sections for human review.',
      output: 'Report section drafts, executive summary language, recommendation rewrites.',
    },
    {
      icon: '🚀', colour: '#ec4899',
      name: '4P3X Intelligent AI™ 5 — Client Onboarding Agent',
      purpose: 'Guides client profile completion, highlights missing organisation, system or supplier information, and suggests onboarding next steps.',
      output: 'Profile completeness commentary, missing information flags, suggested next onboarding actions.',
    },
    {
      icon: '💼', colour: '#f97316',
      name: '4P3X Intelligent AI™ 6 — Portfolio Analyst Agent',
      purpose: 'Summarises risk posture across a consultant\'s client portfolio. Highlights highest-risk clients, evidence gaps, and portfolio-level migration priorities.',
      output: 'Portfolio risk summary, client comparison commentary, priority action recommendations.',
    },
    {
      icon: '🎯', colour: '#06b6d4',
      name: '4P3X Intelligent AI™ 7 — Risk Explanation Agent',
      purpose: 'Translates technical risk flags and assessment findings into plain language for boards, investors, funders and non-technical decision-makers.',
      output: 'Plain-language risk explanation, board briefing language, investor-ready risk summary.',
    },
  ];

  // ── Mistake costs ─────────────────────────────────────────────────────────
  const COST_ITEMS = [
    { icon: '💸', label: 'Breach Response Cost',         desc: 'Incident response, forensics, legal, notification and remediation costs from a single breach event.' },
    { icon: '📄', label: 'Lost Contracts & Tenders',     desc: 'Failure to demonstrate adequate cyber posture in procurement, public sector, or enterprise supply-chain assurance questions.' },
    { icon: '🛡️', label: 'Insurance Complications',      desc: 'Cyber insurers increasingly require evidence of controls, encryption practice, and incident readiness — missing evidence can affect cover.' },
    { icon: '⚖️', label: 'Regulatory Exposure',          desc: 'ICO enforcement, GDPR fines, and regulatory sanctions where inadequate data protection measures contributed to a breach.' },
    { icon: '📉', label: 'Reputational Damage',          desc: 'Client and partner trust loss, press coverage, and long-term commercial damage following a publicised security incident.' },
    { icon: '🔧', label: 'Emergency Remediation',        desc: 'Rushed system changes, re-encryption projects, emergency certificate replacements, and unplanned infrastructure upgrades.' },
    { icon: '⚠️', label: 'Delayed PQC Migration',        desc: 'Organisations that have not inventoried their cryptographic assets will face harder, more expensive migration when quantum threats materialise.' },
    { icon: '🏭', label: 'Supply Chain Trust Loss',      desc: 'Enterprise and regulated buyers increasingly audit supplier cyber posture. Failing a supplier assessment can terminate commercial relationships.' },
  ];

  // ── Tech stack ────────────────────────────────────────────────────────────
  const STACK_ITEMS = [
    { label: 'Frontend',           value: 'React + Vite · PWA-ready · Responsive mobile-first layout' },
    { label: 'Architecture',       value: 'Local-first · No server · No login · No telemetry · 100% offline capable' },
    { label: 'State Layer (SSOT)', value: 'storage.js · consultantStorage.js — single source of truth for all state, migrations, auth config and feature flags' },
    { label: 'Demo / Live Toggle', value: 'workspaceMode.js — global demo/live SSOT. Demo mode uses safe sample data. Live mode uses real client records.' },
    { label: 'Role & Permissions', value: 'authRoles.js — 7 roles, 26 permissions, permission matrix, auth state model. UI-level gating only — backend enforcement required for production.' },
    { label: 'AI Agent Layer',     value: 'aiAgents.js — 7 advisory agents, 8 provider configs, guardrails, mock mode default. No external AI calls in demo mode.' },
    { label: 'Report / Evidence',  value: 'reportSchema.js — structured report model with AI advisory observations. Evidence pack auto-scaffolded from assessment data.' },
    { label: 'Backend-Ready',      value: 'Supabase-ready SQL schema (8 tables, 32 RLS policies). backendSync.js + backendConfigGuard.js — 4P3X API Config Guard™ blocks backend-only secrets.' },
    { label: 'API Config Guard',   value: '4P3X API Config Guard™ — blocks SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, JWT_SECRET, DATABASE_URL and 10+ other backend-only patterns from frontend config.' },
    { label: 'Security Headers',   value: 'Vercel: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy (camera/mic/payment blocked).' },
    { label: 'Deployment',         value: 'Vercel static deploy. vercel.json rewrites, asset caching, service worker cache control. GitHub auto-deploy on push.' },
    { label: 'Version',            value: `v${APP_VERSION} · Run ${APP_RUN_LEVEL} · 104 modules · Zero build errors` },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      overflowX: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ── Sticky Nav ──────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap',
        padding: '10px clamp(12px, 3vw, 32px)',
        borderBottom: '1px solid var(--border-muted)',
        position: 'sticky', top: 0,
        background: scrolled ? 'rgba(13,17,23,0.97)' : 'rgba(13,17,23,0.85)',
        backdropFilter: 'blur(14px)', zIndex: 50,
        transition: 'background 0.2s',
        gap: 12,
      }}>
        <div style={{
          fontWeight: 900, fontSize: 16,
          color: 'var(--accent)', letterSpacing: '-0.5px',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span aria-hidden="true">⬡</span> Quantum Compliance OS™
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {deferredPrompt && !pwaInstalled && (
            <ActionButton variant="ghost" size="sm" onClick={handleInstallPWA}>📲 Install</ActionButton>
          )}
          {(pwaInstalled || installDone) && (
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>✅ Installed</span>
          )}
          <ActionButton variant="secondary" size="sm" onClick={loadDemo}>🎯 Demo Mode</ActionButton>
          <ActionButton variant="primary"   size="sm" onClick={() => goTo(PAGES.DASHBOARD)}>Launch Platform →</ActionButton>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(56px, 9vw, 104px) clamp(16px, 4vw, 32px) clamp(48px, 7vw, 88px)',
        textAlign: 'center', maxWidth: 900, margin: '0 auto',
      }}>
        {/* Demo/Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(90deg, rgba(0,212,255,0.1) 0%, rgba(139,92,246,0.1) 100%)',
          border: '1px solid rgba(139,92,246,0.35)',
          borderRadius: 999, padding: '5px 18px',
          fontSize: 12, fontWeight: 800, marginBottom: 28,
          color: 'var(--text-secondary)', letterSpacing: '0.3px',
        }}>
          <span style={{ color: 'var(--accent)' }}>◉</span>
          Demo Mode shows the product.&nbsp;
          <span style={{ color: '#8b5cf6' }}>Live Mode runs the product.</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 58px)', fontWeight: 900,
          lineHeight: 1.08, marginBottom: 20, letterSpacing: '-1px',
        }}>
          Quantum Compliance OS™
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: 'var(--text-muted)', lineHeight: 1.75,
          maxWidth: 700, margin: '0 auto 16px',
          fontWeight: 500,
        }}>
          Defensive Quantum-Readiness, Cyber Compliance &amp; Post-Quantum Migration Planning
        </p>

        <p style={{
          fontSize: 13,
          color: 'rgba(139,92,246,0.9)',
          fontWeight: 700, marginBottom: 32, letterSpacing: '0.2px',
        }}>
          Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
        </p>

        <p style={{
          fontSize: 'clamp(13px, 1.6vw, 15px)',
          color: 'var(--text-muted)', lineHeight: 1.8,
          maxWidth: 680, margin: '0 auto 44px',
        }}>
          Quantum Compliance OS™ helps organisations understand where their systems, suppliers,
          encryption, data handling, policies and compliance evidence may be exposed to future
          quantum-era cyber risk. It turns complex post-quantum readiness into a structured dashboard,
          client assessment workflow, evidence pack, scoring system and advisory AI guidance layer.
        </p>

        {/* Primary CTA row */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <ActionButton variant="primary"    onClick={() => goTo(PAGES.DASHBOARD)}>🚀 Open Main Dashboard</ActionButton>
          <ActionButton variant="secondary"  onClick={loadDemo}>🎯 Load Demo Portfolio</ActionButton>
          <ActionButton variant="ghost"      onClick={() => goTo(PAGES.BACKEND_CONFIG)}>⚙️ Configure Live Mode</ActionButton>
          {deferredPrompt && !pwaInstalled && (
            <ActionButton variant="ghost" onClick={handleInstallPWA}>📲 Install as PWA</ActionButton>
          )}
        </div>

        {/* Trust pills */}
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center',
          flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', marginTop: 8,
        }}>
          {['No account required', 'Works 100% offline', 'Data stays on device', 'No backend required for demo'].map((t) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--success)' }}>✓</span> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Dashboard Shortcut Row ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-muted)',
        borderBottom: '1px solid var(--border-muted)',
      }}>
        <div style={{
          maxWidth: 1040, margin: '0 auto',
          padding: 'clamp(16px, 3vw, 28px) clamp(12px, 4vw, 32px)',
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginRight: 4, whiteSpace: 'nowrap' }}>
            QUICK ACCESS:
          </span>
          <ShortcutButton page={PAGES.DASHBOARD}           onNavigateTo={goTo} onEnter={onEnter} variant="primary">
            ⬡ Main Dashboard
          </ShortcutButton>
          <ShortcutButton page={PAGES.QUANTUM_READINESS}   onNavigateTo={goTo} onEnter={onEnter}>
            ⚛️ Quantum Readiness
          </ShortcutButton>
          <ShortcutButton page={PAGES.SECURITY_ASSESSMENT} onNavigateTo={goTo} onEnter={onEnter}>
            🛡️ Security Assessment
          </ShortcutButton>
          <ShortcutButton page={PAGES.REPORTS}             onNavigateTo={goTo} onEnter={onEnter}>
            📋 Reports &amp; Evidence
          </ShortcutButton>
          <ShortcutButton page={PAGES.AI_SETTINGS}         onNavigateTo={goTo} onEnter={onEnter}>
            🤖 AI Agent Console
          </ShortcutButton>
          <ShortcutButton page={PAGES.BACKEND_CONFIG}      onNavigateTo={goTo} onEnter={onEnter}>
            ⚙️ Backend Configuration
          </ShortcutButton>
          <ShortcutButton page={null} onNavigateTo={null}  onEnter={loadDemo}>
            🎯 Demo Dashboard
          </ShortcutButton>
        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — What This Platform Does                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="what-it-does">
        <SectionHeading
          label="Platform Overview"
          title="What Quantum Compliance OS™ Does"
          sub="Instead of leaving quantum-readiness as a vague technical problem, the platform turns it into a visible operating system: assess, score, prioritise, document, report and prepare."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 16,
        }}>
          {PLATFORM_MODULES.map((m) => (
            <HPCard key={m.title} icon={m.icon} title={m.title}>{m.desc}</HPCard>
          ))}
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Why It Is Needed                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="why-needed">
        <SectionHeading
          label="The Context"
          title="Why This Platform Is Needed"
          sub="Quantum risk is not only a future technology issue. It is a planning, evidence, supplier, compliance and governance issue starting now."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {[
            {
              icon: '🔐', title: 'Encryption Everywhere — and Not Inventoried',
              body: 'Most organisations depend on encryption, certificates, API keys, cloud identity, payment platforms and supplier systems — many of which rely on public-key cryptography that future large-scale quantum computers may threaten. Most organisations do not have a complete picture of where that cryptography sits.',
            },
            {
              icon: '⏱️', title: 'Migration Is Not Instant',
              body: 'The UK National Cyber Security Centre describes post-quantum cryptography migration as a multi-year technology change programme. NIST released finalised post-quantum encryption standards in 2024 and encouraged early planning. UK NCSC migration roadmap targets include estate-wide planning by 2028, highest-priority services by 2031, and full migration by 2035. Organisations that start late face harder, more expensive transitions.',
            },
            {
              icon: '📊', title: 'Governance, Evidence and Assurance Expectations Are Rising',
              body: 'Regulators, insurers, enterprise buyers, funders and public-sector procurement teams are increasingly asking harder questions about cyber governance, cryptographic posture, and evidence of controls. Organisations need a structured way to gather, document and present readiness evidence.',
            },
            {
              icon: '🏭', title: 'Supply-Chain Risk Is Underassessed',
              body: 'Quantum risk is not only about your own systems. Suppliers, cloud providers, identity platforms, payment processors and SaaS tools all form part of your cryptographic exposure. Supply-chain quantum risk assessment is rarely structured or evidenced.',
            },
            {
              icon: '📋', title: 'No Affordable Structured Tooling for SMEs',
              body: 'Large enterprises can commission bespoke quantum-readiness reviews. SMEs, charities, care organisations, public-sector suppliers and growing businesses typically cannot — but face the same governance questions and the same migration requirements.',
            },
            {
              icon: '🤝', title: 'Consultants Need Repeatable, Structured Tooling',
              body: 'Cyber and compliance consultants supporting multiple clients need a workflow that is consistent, evidence-backed, and reportable. Building this from scratch for every client engagement is expensive. A structured platform enables repeatable, scalable advisory delivery.',
            },
          ].map((c) => (
            <HPCard key={c.title} icon={c.icon} title={c.title}>{c.body}</HPCard>
          ))}
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 12, padding: '24px 28px',
          fontSize: 15, lineHeight: 1.8,
          color: 'var(--text-secondary)', fontStyle: 'italic',
          textAlign: 'center',
        }}>
          "Preparing early reduces rushed migration risk later — and reduces the likelihood of
          compounding failures across evidence, governance, supplier assurance, insurance and
          operational continuity at the same time."
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Who Needs It                                           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="who-needs-it">
        <SectionHeading
          label="Audience"
          title="Who Needs This Platform"
          sub="Quantum-readiness and cyber compliance evidence is not only a large-enterprise problem. Any organisation handling sensitive data, serving regulated clients, or managing supplier relationships should be planning now."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
          gap: 14,
        }}>
          {WHO_CARDS.map((c) => (
            <HPCard key={c.title} icon={c.icon} title={c.title}>{c.desc}</HPCard>
          ))}
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — What A Mistake Can Cost                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="cost-of-mistakes">
        <SectionHeading
          label="Risk Reality"
          title="What A Mistake Can Cost"
          sub="The cost of being unprepared is often not one single event. It can be a chain reaction: poor evidence, weak controls, unclear suppliers, missing encryption inventory, delayed migration planning, failed assurance questions and rushed expensive fixes."
        />

        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12, padding: '20px 24px',
          marginBottom: 28,
          fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)',
        }}>
          <strong style={{ color: '#ef4444' }}>⚠ Reference statistic:</strong>{' '}
          IBM's 2025 Cost of a Data Breach report placed the global average cost of a data breach
          at approximately USD $4.4 million. Quantum Compliance OS™ does not claim to prevent every
          breach, but it helps organisations organise the evidence, readiness checks, risk visibility
          and migration planning needed to reduce avoidable exposure.
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
          gap: 14, marginBottom: 28,
        }}>
          {COST_ITEMS.map((c) => (
            <HPCard key={c.label} icon={c.icon} title={c.label}>{c.desc}</HPCard>
          ))}
        </div>

        <div style={{
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12, padding: '18px 22px',
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75,
        }}>
          <strong style={{ color: 'var(--warning)' }}>⚠ Advisory note:</strong>{' '}
          These are recognised categories of risk and consequence. Quantum Compliance OS™ does not
          guarantee protection against any of these outcomes. All assessments are advisory and should
          be reviewed by qualified professionals. No compliance guarantee is made or implied.
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — Reason For The Product                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="product-reason">
        <SectionHeading
          label="Origin & Purpose"
          title="The Reason For This Product"
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
          gap: 20,
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-muted)',
            borderRadius: 12, padding: '28px 24px',
          }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>💡</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Built for Organisations Without Large Security Teams
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75 }}>
              Quantum Compliance OS™ was created to make advanced cyber and post-quantum readiness
              understandable for organisations that do not have large internal security teams. It gives
              consultants, SMEs and decision-makers a structured way to see risk, explain risk,
              prioritise action and produce evidence-ready reports — without needing a full-time
              security function to operate it.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 12, padding: '28px 24px',
          }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>🌐</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Part of the 4P3X Verse™ Ecosystem
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75 }}>
              Created as part of the <strong style={{ color: '#8b5cf6' }}>4P3X Verse™</strong> modular
              AI-powered engineering ecosystem, this platform demonstrates how one reusable product
              architecture can be refactored into sector-specific compliance, safety, training, welfare,
              routing and operational intelligence tools. One architecture, many deployments.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
              Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
            </p>
          </div>
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — Technology Stack / Architecture                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="tech-stack">
        <SectionHeading
          label="Architecture"
          title="Technology Stack & System Architecture"
          sub="Demo Mode shows the product using safe example data. Live Mode is designed to run the product with real clients, real assessments, real evidence, authentication, persistent records and backend/API integrations once the relevant backend provider is configured."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 12, marginBottom: 28,
        }}>
          {STACK_ITEMS.map((s) => (
            <div key={s.label} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-muted)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 12, padding: '18px 22px',
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75,
        }}>
          <strong style={{ color: 'var(--success)' }}>🔒 No backend-only secrets in frontend.</strong>{' '}
          The 4P3X API Config Guard™ blocks SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, JWT_SECRET,
          DATABASE_URL, STRIPE_SECRET_KEY and 10+ additional patterns from being saved in frontend
          configuration. Backend integration requires a properly secured server-side environment.
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — AI Agents                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="ai-agents">
        <SectionHeading
          label="AI Advisory Layer"
          title="Onboard 4P3X Intelligent AI™ Advisory Agents"
          sub="Seven specialised advisory agents support assessment analysis, evidence review, report drafting, and migration planning. All agents are advisory. All outputs require human review."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 14, marginBottom: 28,
        }}>
          {AI_AGENT_CARDS.map((a) => (
            <div key={a.name} style={{
              background: 'var(--bg-secondary)',
              border: `1px solid ${a.colour}33`,
              borderRadius: 12, padding: '18px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${a.colour}20`,
                  border: `1px solid ${a.colour}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {a.icon}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {a.name}
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 8 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Purpose:</strong> {a.purpose}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Output:</strong> {a.output}
              </p>
            </div>
          ))}
        </div>

        {/* AI Safety Disclaimer */}
        <div style={{
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 12, padding: '18px 22px',
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
          <div>
            <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: 6 }}>
              AI Safety Disclosure
            </strong>
            All AI agents are advisory. They do not guarantee legal, regulatory, cyber insurance or
            quantum-safe compliance. All AI outputs are presented as advisory observations only and
            require human review before any action is taken. Final decisions must remain with qualified
            human professionals. No AI agent on this platform has autonomous authority to certify,
            guarantee or enforce compliance. In Demo Mode, all AI responses are simulated and contain
            no real client data.
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <ShortcutButton page={PAGES.AI_SETTINGS} onNavigateTo={goTo} onEnter={onEnter} variant="primary">
            🤖 Open AI Agent Console →
          </ShortcutButton>
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 8 — Demo vs Live Mode                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="demo-vs-live">
        <SectionHeading
          label="Product Modes"
          title="Demo Mode vs Live Product Mode"
          sub="The platform operates in two modes. Demo Mode shows the product safely. Live Mode runs the product with real data once the backend is correctly configured and tested."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
          gap: 20, marginBottom: 28,
        }}>
          {/* Demo Mode */}
          <div style={{
            background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: 14, padding: '28px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>🎯</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--accent)' }}>Demo Mode</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Shows the product</div>
              </div>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Uses safe example clients and sample data',
                'Sample scores, reports and evidence',
                'No real client data required',
                'No backend credentials required',
                'Safe for investor and client demonstrations',
                'Shows the full product assessment workflow',
                'AI responses are simulated in demo mode',
                'Can be switched on/off without data loss',
              ].map((item) => (
                <li key={item} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={loadDemo}
              style={{
                marginTop: 20, width: '100%', padding: '10px',
                background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                borderRadius: 8, fontSize: 13, fontWeight: 700,
                color: 'var(--accent)', cursor: 'pointer',
              }}
            >
              🎯 Load Demo Portfolio
            </button>
          </div>

          {/* Live Mode */}
          <div style={{
            background: 'rgba(139,92,246,0.04)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 14, padding: '28px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>⚙️</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#8b5cf6' }}>Live / Product Mode</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Runs the product</div>
              </div>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Demo data is removed or disabled globally',
                'Real clients and assessments can be added',
                'Backend provider can be configured (Supabase / REST / Custom)',
                'Real reports and evidence can be stored',
                'Authentication layer active when backend is connected',
                'APIs can be connected where configured',
                'Row Level Security enforced at database layer',
                'Suitable for deployment after security validation',
              ].map((item) => (
                <li key={item} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: '#8b5cf6', flexShrink: 0 }}>◈</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => goTo(PAGES.BACKEND_CONFIG)}
              style={{
                marginTop: 20, width: '100%', padding: '10px',
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.35)',
                borderRadius: 8, fontSize: 13, fontWeight: 700,
                color: '#8b5cf6', cursor: 'pointer',
              }}
            >
              ⚙️ Configure Backend / Live Mode
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '14px 18px',
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#ef4444' }}>⚠ Important:</strong>{' '}
          Live Mode must only be used after backend, authentication, permissions, data protection,
          security and compliance settings have been correctly configured and tested.
          The interface role gate helps guide users to the right areas. Production access control
          must be enforced by backend authentication, Row Level Security, database policies,
          and secure API rules.
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 9 — Investor / Funder Ready                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="investor">
        <SectionHeading
          label="Commercial Potential"
          title="Why This Matters Commercially"
          sub="Commercial potential depends on deployment model, backend configuration, support level, compliance scope, target sector, pricing strategy and validation with real users."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {[
            {
              icon: '📊', title: 'A Genuine Market Gap',
              desc: 'There is no affordable, structured, consultant-ready post-quantum compliance assessment platform designed for SMEs, charities, care providers, public-sector suppliers and growing businesses. Enterprise solutions exist but are out of reach for most organisations.',
            },
            {
              icon: '🤝', title: 'Consultant & MSP Tooling',
              desc: 'Cyber and compliance consultants need repeatable, evidence-backed assessment workflows. Quantum Compliance OS™ provides a structured platform that enables consistent advisory delivery across multiple clients from a single local or deployed instance.',
            },
            {
              icon: '🏛️', title: 'Public Sector & Regulated Supply Chain',
              desc: 'Government, NHS, regulated public bodies and enterprise supply-chain teams are increasingly requiring stronger cyber assurance evidence from suppliers and partners. This platform supports structured assurance preparation.',
            },
            {
              icon: '🔄', title: 'Modular Refactorable Architecture',
              desc: 'The platform architecture can be refactored into sector-specific compliance, safety, welfare, training, routing or operational intelligence tools faster than rebuilding from scratch. One reusable product engine, many potential deployment contexts.',
            },
            {
              icon: '☁️', title: 'Multiple Deployment Models',
              desc: 'Can be deployed as SaaS, consultant toolkit, white-label compliance portal, grant-funded public-benefit tool, enterprise readiness dashboard, or government supply-chain assurance platform — depending on backend, support, pricing and target sector strategy.',
            },
            {
              icon: '🌍', title: 'Growing Regulatory Tailwind',
              desc: 'Post-quantum migration requirements, cyber insurance expectations, public-sector supplier assurance, NHS DSPT, GDPR evidence expectations and sector-specific cyber standards are all driving demand for structured readiness evidence and reporting tools.',
            },
          ].map((c) => (
            <HPCard key={c.title} icon={c.icon} title={c.title}>{c.desc}</HPCard>
          ))}
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(139,92,246,0.06) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 14, padding: '28px 28px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 700, margin: '0 auto', marginBottom: 20 }}>
            <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 15, marginBottom: 10 }}>
              First-of-its-kind modular AI-assisted quantum-readiness compliance architecture
            </strong>
            Designed to support organisations, consultants and decision-makers with a structured,
            evidence-backed, AI-assisted approach to post-quantum readiness and cyber compliance
            preparation — built to be backend-ready, demo-ready, investor-ready, and commercially
            deployable across multiple sectors and models.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <ShortcutButton page={PAGES.DEPLOYMENT} onNavigateTo={goTo} onEnter={onEnter} variant="primary">
              📋 View Deployment Readiness →
            </ShortcutButton>
            <ShortcutButton page={PAGES.ABOUT} onNavigateTo={goTo} onEnter={onEnter}>
              ℹ️ About This Project
            </ShortcutButton>
          </div>
        </div>
      </SectionWrap>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 10 — Final CTA                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SectionWrap id="cta">
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 16, padding: 'clamp(32px, 5vw, 56px) clamp(20px, 4vw, 48px)',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 36px)',
            fontWeight: 900, marginBottom: 14, lineHeight: 1.2,
          }}>
            Start with the dashboard. Run the demo.<br />
            <span style={{ color: '#8b5cf6' }}>Switch to Live Mode only when the backend is configured.</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 36px' }}>
            Quantum Compliance OS™ is demo-ready now. The investor demo shows the full product
            workflow using sample data. Live Mode is designed to run with real clients, real evidence,
            and real backend infrastructure once correctly configured and tested.
          </p>

          {/* Main CTA grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
            gap: 12, maxWidth: 720, margin: '0 auto 28px',
          }}>
            {[
              { label: '⬡ Open Main Dashboard',       page: PAGES.DASHBOARD },
              { label: '⚛️ Start Assessment',           page: PAGES.QUANTUM_READINESS },
              { label: '📋 View Reports',               page: PAGES.REPORTS },
              { label: '📁 View Evidence Pack',         page: PAGES.EVIDENCE_PACK },
              { label: '🤖 AI Agent Console',           page: PAGES.AI_SETTINGS },
              { label: '⚙️ Configure Live Mode',        page: PAGES.BACKEND_CONFIG },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => goTo(b.page)}
                aria-label={b.label}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 10, fontSize: 13, fontWeight: 700,
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-dim)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Demo button */}
          <ActionButton variant="primary" onClick={loadDemo} style={{ fontSize: 15, padding: '12px 32px' }}>
            🎯 Load Demo Portfolio — See It In Action
          </ActionButton>

          {deferredPrompt && !pwaInstalled && (
            <div style={{ marginTop: 16 }}>
              <ActionButton variant="ghost" onClick={handleInstallPWA}>📲 Install as PWA</ActionButton>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
                Install locally where supported by your browser or device. If the install prompt does
                not appear, use your browser menu and choose "Add to Home Screen" or "Install App"
                where available.
              </p>
            </div>
          )}
        </div>
      </SectionWrap>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border-muted)',
        padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 32px)',
        maxWidth: 1040, margin: '0 auto',
      }}>
        <p style={{
          fontSize: 11, color: 'var(--text-muted)',
          lineHeight: 1.75, textAlign: 'center', marginBottom: 12,
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>⚠ Defensive Use Only.</strong>{' '}
          Quantum Compliance OS™ is a defensive security readiness assessment and post-quantum
          migration planning platform. It does not perform offensive testing, exploitation, live
          scanning, or guarantee regulatory compliance. All assessments are self-reported and should
          be reviewed by qualified security and compliance professionals before operational decisions
          are made. This platform does not process personal data on any server. All data remains in
          your browser unless you configure and connect an external backend provider.{' '}
          <strong>This is not a security certification. No compliance guarantee is made or implied.</strong>
        </p>
        <p style={{
          fontSize: 11, color: 'var(--text-muted)',
          textAlign: 'center', lineHeight: 1.7,
        }}>
          Quantum Compliance OS™ v{APP_VERSION} · Run {APP_RUN_LEVEL} · Local-First · No Backend Required for Demo ·
          Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™
        </p>
      </footer>
    </div>
  );
}
