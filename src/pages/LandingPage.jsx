/**
 * QUANTUM COMPLIANCE OS™ — LandingPage.jsx
 * Run 7: Polished sales landing page with demo launch path.
 * =========================================================
 * Shown before onboarding on first visit.
 * Includes PWA install, full feature overview, demo CTAs, architecture, AI agents, and creator/investor sections.
 *
 * DEFENSIVE USE ONLY. No tracking. No external requests. No fake certifications.
 */

import React, { useState, useEffect } from 'react';
import ActionButton from '../components/ActionButton.jsx';
import { enableDemoMode } from '../core/storage.js';

export default function LandingPage({ onEnter, onLoadDemo }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled,   setPwaInstalled]   = useState(false);
  const [installDone,    setInstallDone]    = useState(false);
  const [scrolled,       setScrolled]       = useState(false);

  useEffect(() => {
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

  const MODULES = [
    { icon: '🛡️', title: 'Security Assessment', desc: '47 defensive questions across 12 control domains. ISO 27001 A-controls, NCSC Cyber Essentials, NIST CSF, and CIS Controls aligned.' },
    { icon: '⚛️', title: 'Quantum Readiness', desc: 'HNDL risk scoring, crypto-agility assessment, RSA/ECC exposure mapping, and NIST FIPS 203/204/205 migration priority guidance.' },
    { icon: '💡', title: 'Risk Register', desc: 'Likelihood × impact risk model populated automatically from assessment. Consolidated across security and quantum domains.' },
    { icon: '📋', title: 'Executive Reports', desc: 'Auto-generated executive and technical reports. JSON + CSV export. Print-ready layout. Consultant-branded. Report history preserved.' },
    { icon: '📁', title: 'Evidence Pack', desc: 'Compliance evidence tracker scaffolded from assessment results. Framework-mapped to ISO 27001, NCSC, NIST. Status tracked per item.' },
    { icon: '💡', title: 'Recommendations', desc: 'Prioritised preventative controls with effort/impact ratings, timeframes, framework references, and action plan tracking.' },
    { icon: '🏢', title: 'Multi-Client Mode', desc: 'Manage unlimited local client profiles. Per-client isolation, risk comparison dashboard, report history, and activity log.' },
    { icon: '🔒', title: 'Fully Local-First', desc: 'No account. No login. No cloud sync. No telemetry. 100% offline capable. All data stored exclusively in your browser.' },
  ];

  const PAIN_POINTS = [
    { icon: '😰', pain: 'How exposed are we to quantum-enabled decryption attacks?', solution: 'HNDL risk model quantifies your harvest-now-decrypt-later exposure based on data shelf-life and crypto posture.' },
    { icon: '📋', pain: 'We need a security report for a client/board but don\'t know where to start.', solution: 'Complete a guided assessment in under an hour. Generate a branded executive report instantly.' },
    { icon: '🔍', pain: 'ISO 27001 audit prep — we don\'t know what evidence to gather.', solution: 'Evidence pack scaffolds automatically from assessment results, mapped to ISO 27001 A-controls.' },
    { icon: '🏢', pain: 'I manage multiple SME clients and can\'t track their risk posture easily.', solution: 'Consultant Hub provides multi-client management, risk comparison, and portfolio analytics — all local, no SaaS subscription.' },
  ];

  const FOR_WHOM = [
    { icon: '🤝', title: 'IT Consultants & MSPs', desc: 'Build professional security assessments for SME clients. White-label reports. Multi-client workspace.' },
    { icon: '📜', title: 'Compliance Consultants', desc: 'ISO 27001, NCSC Cyber Essentials, and UK GDPR readiness. Evidence pack builder. Framework gap analysis.' },
    { icon: '🔬', title: 'Security Practitioners', desc: 'Post-quantum cryptography exposure assessment. NIST PQC migration planning. Crypto-agility scoring.' },
    { icon: '🏢', title: 'SME IT/Security Teams', desc: 'Self-assess your organisation\'s defensive security posture without engaging an external consultant.' },
    { icon: '💼', title: 'Investors & Evaluators', desc: 'Load the demo portfolio for an immediate view of the platform\'s capabilities and commercial potential.' },
  ];

  const STEPS = [
    { n: '1', title: 'Add your organisation', desc: 'Profile, sector, compliance needs, and data sensitivity.' },
    { n: '2', title: 'Register critical systems', desc: 'Inventory your key systems, encryption posture, and auth methods.' },
    { n: '3', title: 'Complete security assessment', desc: '47 questions across 12 domains. Takes 30–60 minutes.' },
    { n: '4', title: 'Complete quantum readiness', desc: 'HNDL risk, crypto inventory, and migration planning review.' },
    { n: '5', title: 'Review risks & recommendations', desc: 'Prioritised action plan with effort, impact, and framework refs.' },
    { n: '6', title: 'Generate reports & evidence pack', desc: 'Executive and technical reports. Evidence items auto-scaffolded.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ── Sticky Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 32px', borderBottom: '1px solid var(--border-muted)',
        position: 'sticky', top: 0,
        background: scrolled ? 'rgba(13,17,23,0.96)' : 'rgba(13,17,23,0.85)',
        backdropFilter: 'blur(12px)', zIndex: 50,
        transition: 'background 0.2s',
      }}>
        <div style={{ fontWeight: 900, fontSize: '17px', color: 'var(--accent)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span aria-hidden="true">⬡</span> Quantum Compliance OS™
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {deferredPrompt && !pwaInstalled && (
            <ActionButton variant="ghost" size="sm" onClick={handleInstallPWA}>📲 Install App</ActionButton>
          )}
          {(pwaInstalled || installDone) && (
            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700 }}>✅ Installed</span>
          )}
          <ActionButton variant="primary" size="sm" onClick={onEnter}>Launch Platform →</ActionButton>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 8vw, 96px) 32px clamp(40px, 6vw, 72px)', textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
          borderRadius: '999px', padding: '4px 16px',
          fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px',
        }}>
          <span>🛡️</span> Defensive Use Only · Local-First · No Backend · No Account
        </div>
        <h1 style={{
          fontSize: 'clamp(26px, 5.5vw, 52px)', fontWeight: 900,
          lineHeight: 1.12, marginBottom: '20px', letterSpacing: '-0.5px',
        }}>
          Post-Quantum Security Readiness<br />
          <span style={{ color: 'var(--accent)' }}>for Consultants &amp; Organisations</span>
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-muted)',
          lineHeight: 1.8, maxWidth: '620px', margin: '0 auto 36px',
        }}>
          Assess defensive security readiness, identify post-quantum cryptography exposure,
          prioritise preventative controls, and generate professional client-ready evidence
          packs and reports — completely offline, no account required.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          <ActionButton variant="primary" onClick={onEnter}>🚀 Launch Platform</ActionButton>
          <ActionButton variant="secondary" onClick={() => {
            enableDemoMode();
            if (onLoadDemo) onLoadDemo();
            else onEnter();
          }}>🎯 Load Demo Portfolio</ActionButton>
          {deferredPrompt && !pwaInstalled && (
            <ActionButton variant="ghost" onClick={handleInstallPWA}>📲 Install as PWA</ActionButton>
          )}
        </div>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          {['No account required', 'Works 100% offline', 'Data stays on device', 'No backend needed'].map((t) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--success)' }}>✓</span> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Pain Points → Solutions ─────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 24px)', marginBottom: '8px' }}>
          Built for the questions that keep security teams up at night
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Quantum Compliance OS™ turns complex readiness questions into structured assessments with clear outputs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {PAIN_POINTS.map(({ icon, pain, solution }) => (
            <div key={pain} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{pain}"
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→ </span>{solution}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Modules ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '1040px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 24px)', marginBottom: '8px' }}>
          Everything you need for defensive security readiness
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          All modules included. No paid tiers required for core functionality.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
          {MODULES.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '860px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 24px)', marginBottom: '8px' }}>
          From zero to client-ready report in one session
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Typical time to first executive report: 45–90 minutes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} style={{
              display: 'flex', gap: '16px', alignItems: 'flex-start',
              padding: '14px 18px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, color: 'var(--accent)',
              }}>{n}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who It's For ────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 24px)', marginBottom: '8px' }}>
          Who is Quantum Compliance OS™ for?
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Built for professionals who need real security intelligence, not checkbox compliance.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {FOR_WHOM.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo Mode vs Live Mode — Run 22 ─────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '32px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔀</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(17px, 3vw, 22px)', marginBottom: 10 }}>
            Demo Mode shows the product.<br />
            <span style={{ color: 'var(--accent)' }}>Live Mode runs the product.</span>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 580, margin: '0 auto 24px' }}>
            Demo Mode uses safe sample data — perfect for investors, portfolio demos, client presentations, and product evaluation.
            Live Mode turns demo data off. Real operation requires connecting a backend (Supabase, Firebase, custom REST API, or equivalent).
            Switching modes does not delete any existing data.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 520, margin: '0 auto', textAlign: 'left' }}>
            {[
              { icon: '🎯', label: 'Demo Mode', desc: 'Sample clients, reports, scores. Show the product instantly.', colour: '#f59e0b' },
              { icon: '💾', label: 'Live Local Mode', desc: 'Your real data. No backend needed to start.', colour: '#00d4ff' },
              { icon: '⚙', label: 'Backend-Ready', desc: 'Connect Supabase, Firebase, or custom API when ready.', colour: '#8b5cf6' },
              { icon: '📲', label: 'PWA-Ready', desc: 'Install locally where supported by your browser/device.', colour: '#10b981' },
            ].map(({ icon, label, desc, colour }) => (
              <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 12, color: colour }}>{label}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
            Use your browser menu and choose <em>Add to Home Screen</em> or <em>Install App</em> where available.
          </p>
        </div>
      </section>

      {/* ── Architecture Overview — Run 22 ────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(17px, 3vw, 22px)', marginBottom: 8 }}>
          System Architecture
        </h2>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 28, maxWidth: 540, margin: '0 auto 28px' }}>
          Eight modular layers working together — from local-first data to backend-ready live operation.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { n: '01', title: 'Dashboard Layer',            desc: 'Central overview — scores, risk level, evidence status, quick-action cards.', colour: '#00d4ff' },
            { n: '02', title: 'Client Hub',                 desc: 'Multi-client workspace — isolated records, risk history, per-client reports.', colour: '#3b82f6' },
            { n: '03', title: 'Assessment Engine',          desc: '47-question security assessment + quantum readiness — guided, scored, advisory.', colour: '#8b5cf6' },
            { n: '04', title: 'Risk Scoring Layer',         desc: 'Likelihood × impact model. Risk register populated from assessment results.', colour: '#f59e0b' },
            { n: '05', title: 'Evidence Pack Layer',        desc: 'Framework-mapped evidence tracking — ISO 27001, NCSC, NIST, UK GDPR.', colour: '#D4AF37' },
            { n: '06', title: 'Report & History Layer',     desc: 'Auto-generated executive + technical reports. Per-client history. Print/export.', colour: '#10b981' },
            { n: '07', title: 'Demo/Live Mode Switch',      desc: 'Toggle sample vs real data globally — no data loss when switching.', colour: '#00d4ff' },
            { n: '08', title: 'Backend/API Config Layer',   desc: 'Backend-ready config for Supabase, Firebase, or custom REST. No SDK required to start.', colour: '#8b5cf6' },
            { n: '09', title: 'AI Agent Guidance Layer',    desc: '5 onboard advisory AI agents — compliance, quantum, evidence, risk, consultant support.', colour: '#D4AF37' },
            { n: '10', title: 'PWA / Local-First Layer',    desc: 'Installable offline-capable PWA. localStorage SSOT. Works without internet.', colour: '#10b981' },
          ].map(({ n, title, desc, colour }) => (
            <div key={n} style={{ background: 'var(--bg-secondary)', border: `1px solid ${colour}22`, borderRadius: 'var(--radius-md)', padding: '14px 16px', borderTop: `2px solid ${colour}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: colour, letterSpacing: '0.08em', marginBottom: 4 }}>{n}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', marginBottom: 5 }}>{title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Agents — Run 22 ────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(17px, 3vw, 22px)', marginBottom: 8 }}>
          Onboard AI Guidance Agents
        </h2>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, maxWidth: 560, margin: '0 auto 8px' }}>
          Powered by 4P3X Intelligent AI™
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginBottom: 28, maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Advisory guidance and explanation layers only. AI agent outputs support human decision-making and do not replace qualified legal, compliance, cybersecurity, or business professionals.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 12 }}>
          {[
            { icon: '📋', title: 'Compliance Readiness Agent',         colour: '#00d4ff', desc: 'Helps review assessment responses, compliance gaps, and priority actions. Turns scattered answers into structured observations.' },
            { icon: '⚛',  title: 'Quantum Readiness Agent',            colour: '#8b5cf6', desc: 'Highlights future risks around encryption, long-life data, and post-quantum preparation. Flags HNDL exposure and migration priorities.' },
            { icon: '🗂',  title: 'Evidence Pack Agent',                colour: '#10b981', desc: 'Checks what supporting evidence exists and what is missing. Identifies gaps before compliance reviews or audits.' },
            { icon: '⚠',  title: 'Risk Explanation Agent',             colour: '#f59e0b', desc: 'Translates scoring and risk signals into clearer human-readable explanations — suitable for board-level and non-technical reviews.' },
            { icon: '👥', title: 'Consultant Support Agent',            colour: '#D4AF37', desc: 'Helps consultants prepare client summaries, understand client status, and identify next steps across a portfolio of clients.' },
            { icon: '💼', title: 'Portfolio / Investor Explanation Agent', colour: '#3b82f6', desc: 'Explains what the product does, why it matters, and how it can become a live operational compliance and security product.' },
          ].map(({ icon, title, colour, desc }) => (
            <div key={title} style={{ background: 'var(--bg-secondary)', border: `1px solid ${colour}28`, borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: colour }}>{title}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Investor Demo Section — Run 22 ────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius-xl)', padding: '32px 36px' }}>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(17px, 3vw, 22px)', marginBottom: 8, color: '#D4AF37' }}>
            🏆 Investor &amp; Portfolio Demo
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
            Quantum Compliance OS™ is designed for investor demonstration, client presentation, and portfolio review.
            It is structured for future commercialisation as a SaaS product, consultant tool, white-label platform, or internal compliance system.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { icon: '📈', label: 'Clear target markets',     desc: 'SMEs, consultants, agencies, compliance teams' },
              { icon: '🔀', label: 'Demo → live pathway',      desc: 'Backend-ready config — no rebuild required' },
              { icon: '🧩', label: 'Modular architecture',     desc: 'Reusable across 4P3X Verse™ products' },
              { icon: '📲', label: 'PWA-ready',                desc: 'Installable, works offline, no app store needed' },
              { icon: '⚛',  label: 'Quantum relevance',        desc: 'Growing future concern across every sector' },
              { icon: '🏢', label: 'Multi-client scaling',     desc: 'Consultant/agency workflow built in from Run 11' },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            This project does not make unrealistic valuation claims. It is designed for investor demonstration and structured for future commercialisation. No guarantee of investment return is made or implied.
          </div>
        </div>
      </section>

      {/* ── About The Creator — Run 22 ────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: '32px 36px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(16px, 2.5vw, 20px)', marginBottom: 6 }}>About the Creator</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 12px' }}>
            Quantum Compliance OS™ was created by <strong style={{ color: 'var(--text-primary)' }}>Ciaran / Kyzel Kreates™</strong> as part of the <strong style={{ color: '#D4AF37' }}>4P3X Verse™</strong> ecosystem — a modular collection of AI-assisted, demo/live-ready software products.
            The project demonstrates rapid learning, systems thinking, reusable architecture, AI-assisted development, and the ability to turn complex ideas into structured working product demos.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 16px' }}>
            The system is designed to show how one reusable architecture can support dashboards, reports, AI guidance, evidence capture, PWA-ready layouts, and backend-ready live operation across different sectors.
          </p>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 999, fontSize: 11, color: '#D4AF37', fontWeight: 700 }}>
            Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™
          </div>
        </div>
      </section>

      {/* ── 4P3X Verse™ Ecosystem — Run 22 ───────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius-xl)', padding: '28px 32px' }}>
          <div style={{ fontWeight: 800, fontSize: 'clamp(15px, 2.5vw, 19px)', marginBottom: 8, color: '#D4AF37' }}>
            Part of the 4P3X Verse™
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Quantum Compliance OS™ is one product direction within the <strong style={{ color: '#D4AF37' }}>4P3X Verse™</strong> — a modular AI-assisted software ecosystem built around reusable dashboards, installable PWA-ready experiences, demo/live mode switching, onboard AI guidance, and backend-ready architecture.
            Each product in the ecosystem shares core patterns — making new products faster to build, test, and commercialise.
          </p>
        </div>
      </section>

      {/* ── Local-First Trust Section ────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '740px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)', padding: '36px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
          <h3 style={{ marginBottom: '12px', fontWeight: 800, fontSize: '18px' }}>
            Truly local-first. Your data never leaves your device.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
            No account. No login. No telemetry. No external APIs. No cloud sync.
            All client data, assessments, reports, and evidence packs are stored exclusively
            in your browser's localStorage. Closing the tab does not delete data — it persists
            until you clear it or export a backup.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
            {[
              'No backend server', 'No Supabase or Firebase',
              'No offensive scanning', 'No external API calls',
              'No account required', 'No tracking or analytics',
              'Works 100% offline', 'Full data stays on device',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portfolio / Case Study — Run 20 ────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(17px, 3vw, 22px)', marginBottom: 6 }}>
            Portfolio & Case Study Overview
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Quantum Compliance OS™ demonstrates a full consultant/agency workflow — from single-client
            demo to multi-client portfolio management, white-label readiness, and advisory AI assistance.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {[
            {
              icon: '🎯',
              title: 'What It Is',
              colour: '#00d4ff',
              items: [
                'Defensive quantum-readiness + security assessment platform',
                'Multi-client consultant management dashboard',
                'Report history, evidence archive, risk comparison',
                'Advisory AI agents powered by 4P3X Intelligent AI™',
                'Local-first PWA — no account, no backend required to start',
              ],
            },
            {
              icon: '👥',
              title: 'Who It Is For',
              colour: '#10b981',
              items: [
                'Independent security consultants and advisors',
                'SME compliance and risk management teams',
                'Agency teams managing multiple clients',
                'Organisations preparing for post-quantum migration',
                'Portfolio investors and technical evaluators',
              ],
            },
            {
              icon: '🔀',
              title: 'Demo Mode vs Live Mode',
              colour: '#f59e0b',
              items: [
                'Demo Mode: shows 5 realistic SME client profiles with scores',
                'Live Mode: hides demo data — shows only real/local records',
                'Backend-ready: Supabase/Firebase config layer (Run 15)',
                'Switching mode does not delete any existing data',
                '"Demo Mode shows the product. Live Mode runs the product."',
              ],
            },
            {
              icon: '🏗',
              title: 'Architecture Highlights',
              colour: '#8b5cf6',
              items: [
                'React + Vite PWA — installable, works fully offline',
                'localStorage SSOT — zero backend dependency to start',
                'Supabase SQL schema prepared with RLS enabled (Run 15)',
                '4P3X API Config Guard™ — blocks backend-only secrets',
                'Upgrade-ready: Starter → Pro → Agency → White Label tiers',
              ],
            },
          ].map(({ icon, title, colour, items }) => (
            <div key={title} style={{
              background: 'var(--bg-secondary)', border: `1px solid ${colour}28`,
              borderRadius: 'var(--radius-lg)', padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: colour }}>{title}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {items.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <span style={{ color: colour, flexShrink: 0, marginTop: 1 }}>•</span>{item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '10px 16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong style={{ color: '#D4AF37' }}>Quantum Compliance OS™</strong>{' '}·{' '}
          Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™{' '}·{' '}
          Advisory and assessment-support software — not a guarantee of legal, regulatory, cybersecurity, or quantum-readiness compliance.
          Final decisions remain with qualified humans, organisations, and relevant professionals.
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 72px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(18px, 3vw, 26px)', marginBottom: '12px' }}>
          Ready to assess your quantum readiness?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7 }}>
          No install required. No account. Load the demo portfolio for an instant overview,
          or start a fresh assessment of your own organisation.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <ActionButton variant="primary" onClick={onEnter}>🚀 Launch Platform →</ActionButton>
          <ActionButton variant="secondary" onClick={() => { enableDemoMode(); if (onLoadDemo) onLoadDemo(); else onEnter(); }}>🎯 Load Demo Portfolio</ActionButton>
          {deferredPrompt && !pwaInstalled && (
            <ActionButton variant="ghost" onClick={handleInstallPWA}>📲 Install as App</ActionButton>
          )}
        </div>
        {pwaInstalled && (
          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--success)', fontWeight: 700 }}>
            ✅ Installed as PWA — works fully offline
          </div>
        )}
      </section>

      {/* ── Footer Disclaimer ─────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border-muted)', padding: '24px 32px', maxWidth: '960px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7, textAlign: 'center' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>⚠ Defensive Use Only.</strong>{' '}
          Quantum Compliance OS™ is a defensive security readiness assessment and post-quantum migration planning platform.
          It does not perform offensive testing, exploitation, live scanning, or guarantee regulatory compliance.
          All assessments are self-reported and should be reviewed by qualified security and compliance professionals.
          This platform does not process personal data on any server. All data remains in your browser.
          Commercial tier pricing is illustrative only — payments are not connected.{' '}
          <strong>This is not a security certification. No compliance guarantee is made or implied.</strong>
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
          Quantum Compliance OS™ v22.0.0 · Run 20 — Final Production Polish · Local-First · No Backend · No Supabase · RLS Not Applicable
        </p>
      </footer>
    </div>
  );
}
