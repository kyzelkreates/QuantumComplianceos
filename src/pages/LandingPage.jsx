/**
 * QUANTUM COMPLIANCE OS™ — LandingPage.jsx
 * Run 7: Polished sales landing page with demo launch path.
 * =========================================================
 * Shown before onboarding on first visit.
 * Includes PWA install, full feature overview, demo CTAs, and pricing placeholders.
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

  const TIERS = [
    { name: 'Starter',       icon: '🌱', max: '1 client',         features: ['All assessments', 'JSON/CSV export', 'Basic reports', 'Evidence pack'],            colour: '#10b981', price: 'Local use — free' },
    { name: 'Pro Consultant',icon: '🚀', max: '10 clients',        features: ['Multi-client hub', 'Per-client branding', 'Report history', 'Risk comparison'],    colour: '#3b82f6', price: 'Coming soon',       badge: 'Popular' },
    { name: 'Agency',        icon: '🏢', max: '50 clients',        features: ['White-label', 'Client archive', 'Portfolio analytics', 'Priority actions'],       colour: '#8b5cf6', price: 'Coming soon' },
    { name: 'White Label',   icon: '🎨', max: 'Unlimited clients', features: ['Full white-label', 'Custom domain', 'Onboarding wizard', 'SLA support'],          colour: '#f59e0b', price: 'Enterprise — contact us' },
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

      {/* ── Pricing Placeholders ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 60px', maxWidth: '1040px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 24px)', marginBottom: '8px' }}>
          Built for every scale
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Full functionality is available in local-first mode today. Commercial SaaS tiers are coming soon.
        </p>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--warning)', fontWeight: 700, marginBottom: '28px' }}>
          Demo commercial model only — payments are not connected
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {TIERS.map(({ name, icon, max, features, colour, price, badge }) => (
            <div key={name} style={{
              background: 'var(--bg-secondary)', border: `1px solid ${colour}33`,
              borderRadius: 'var(--radius-lg)', padding: '24px', position: 'relative',
            }}>
              {badge && (
                <div style={{
                  position: 'absolute', top: '-10px', right: '16px',
                  background: colour, color: '#0d1117', fontSize: '10px', fontWeight: 800,
                  padding: '2px 10px', borderRadius: '999px',
                }}>{badge}</div>
              )}
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: colour, marginBottom: '4px' }}>{name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{max}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
                {features.map((f) => (
                  <div key={f} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: colour, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{
                padding: '6px 12px', background: `${colour}15`, border: `1px solid ${colour}33`,
                borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 700,
                color: colour, textAlign: 'center',
              }}>{price}</div>
            </div>
          ))}
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
          Quantum Compliance OS™ v9.0.0 · Local-First · No Backend · No Supabase · RLS Not Applicable
        </p>
      </footer>
    </div>
  );
}
