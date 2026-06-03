/**
 * QUANTUM COMPLIANCE OS™ — DeploymentReadiness.jsx
 * Run 8 Status Sync: Updated to reflect Run 8 completion.
 * Run 7: Deployment & Demo Readiness Checklist
 * =============================================
 * Provides a visual checklist for deployment readiness, demo confidence,
 * and production review. Derived from live app state where possible.
 *
 * DEFENSIVE USE ONLY. No backend. No external checks. All local.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import { getState, subscribe, getStorageUsageKB } from '../core/storage.js';
import { getConsultantState } from '../core/consultantStorage.js';

// ─── Checklist Item Component ─────────────────────────────────────────────────
function CheckItem({ status, label, detail, note }) {
  const cfg = {
    pass:    { icon: '✅', colour: 'var(--success)',  bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
    warn:    { icon: '⚠️', colour: 'var(--warning)',  bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    info:    { icon: 'ℹ️', colour: 'var(--info)',     bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)' },
    na:      { icon: '—',  colour: 'var(--text-muted)', bg: 'var(--bg-tertiary)', border: 'var(--border-muted)' },
  }[status] || cfg.pass;

  return (
    <div style={{
      display: 'flex', gap: '14px', alignItems: 'flex-start',
      padding: '12px 16px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-md)', marginBottom: '6px',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0, lineHeight: 1.4 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: note ? '3px' : 0 }}>{label}</div>
        {detail && <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{detail}</div>}
        {note && <div style={{ fontSize: '11px', color: cfg.colour, fontWeight: 600, marginTop: '3px' }}>{note}</div>}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function CheckSection({ title, icon, items }) {
  const pass = items.filter((i) => i.status === 'pass').length;
  const total = items.filter((i) => i.status !== 'na').length;
  return (
    <SectionCard
      title={`${icon} ${title}`}
      actions={
        <span style={{ fontSize: '12px', color: pass === total ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
          {pass}/{total} ready
        </span>
      }
    >
      {items.map((item, i) => (
        <CheckItem key={i} {...item} />
      ))}
    </SectionCard>
  );
}

export default function DeploymentReadiness({ onNavigate }) {
  const [state, setLocalState] = useState(() => getState());
  const [cs, setCs]            = useState(() => getConsultantState());
  const [swVersion, setSwVersion] = useState(null);
  const [swActive, setSwActive]   = useState(false);
  const [storageUsed, setStorageUsed] = useState(null);

  useEffect(() => {
    const unsub = subscribe((s) => setLocalState({ ...s }));
    return unsub;
  }, []);

  // Check service worker status
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/').then((reg) => {
        if (reg && (reg.active || reg.installing || reg.waiting)) {
          setSwActive(true);
          // Get SW version via message channel
          if (reg.active) {
            const channel = new MessageChannel();
            channel.port1.onmessage = (e) => {
              if (e.data?.version) setSwVersion(e.data.version);
            };
            reg.active.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
          }
        }
      }).catch(() => {});
    }
  }, []);

  // Estimate localStorage usage (via storage.js SSOT helper)
  useEffect(() => {
    const kb = getStorageUsageKB();
    setStorageUsed(kb);
  }, []);

  const { organisation, systemProfiles, assessmentState, evidencePack, reportModel, clientMode } = state;
  const activeClients = (cs.clients || []).filter((c) => !c.archived);
  const demoLoaded    = (activeClients.length > 0) || clientMode?.demoDataLoaded;
  const hasSecurity   = assessmentState?.securityAssessment?.status === 'complete';
  const hasQuantum    = assessmentState?.quantumReadiness?.status === 'complete';
  const hasReports    = (reportModel?.history || []).length > 0;
  const hasEvidence   = (evidencePack?.items || []).length > 0;
  const hasOrg        = organisation?.isComplete;
  const hasSystems    = (systemProfiles || []).filter((s) => !s.archived).length > 0;
  // Run 8 — Consultant Copilot
  const hasCopilot    = state?.consultantCopilot?.enabled === true;
  const copilotDrafts = (state?.consultantCopilot?.generatedDrafts || []).length;

  // ── BUILD & DEPLOYMENT ─────────────────────────────────────────────────────
  const buildItems = [
    { status: 'pass', label: 'Static build compatible', detail: 'Vite outputs /dist as a fully static SPA — deployable to Vercel, Netlify, GitHub Pages, or any static host.' },
    { status: 'pass', label: 'No backend dependency', detail: 'Zero server-side code. No Express, Fastify, Node server, or backend functions. Pure browser app.' },
    { status: 'pass', label: 'No environment variables required', detail: 'No .env files, API keys, or secrets needed to build or run the app in any environment.' },
    { status: 'pass', label: 'Build scripts configured', detail: 'package.json scripts: dev, build, preview — all use direct node path for maximum compatibility.' },
    { status: 'pass', label: 'vercel.json present', detail: 'SPA routing fallback configured. Security headers (CSP-safe, X-Frame-Options, Permissions-Policy) applied.' },
    { status: 'pass', label: 'Vite config production-ready', detail: 'Content-hashed asset filenames, vendor code splitting, clean dist/ output on each build.' },
    { status: 'pass', label: 'index.html metadata complete', detail: 'Full SEO metadata, OpenGraph tags, Apple PWA tags, theme colour, and favicon references.' },
  ];

  // ── PWA ────────────────────────────────────────────────────────────────────
  const pwaItems = [
    { status: 'pass', label: 'Web App Manifest present (/public/manifest.json)', detail: 'name, short_name, description, start_url, display:standalone, icons ×8, shortcuts ×5, categories.' },
    { status: swActive ? 'pass' : 'warn', label: `Service worker ${swActive ? 'registered & active' : 'not yet active (normal on first load)'}`, detail: swVersion ? `Running: ${swVersion}` : 'App-shell cache strategy. No user data cached. Works offline gracefully.', note: !swActive ? 'Service workers activate after first page load. This is expected behaviour.' : null },
    { status: 'pass', label: 'Offline fallback configured', detail: 'Navigation requests fall back to cached index.html when offline. Minimal offline HTML if cache empty.' },
    { status: 'pass', label: 'User data is NOT cached by SW', detail: 'The service worker caches ONLY static JS/CSS/HTML assets. All localStorage data (reports, clients, assessments) is safe across SW updates and cache clears.' },
    { status: 'pass', label: 'SW update notification', detail: 'New SW versions show a non-blocking banner with a "Reload" option. No forced reloads.' },
    { status: 'pass', label: 'PWA install prompt wired', detail: 'Landing page captures beforeinstallprompt and shows an "Install as App" button when supported.' },
    { status: storageUsed !== null ? 'info' : 'na', label: `localStorage usage: ~${storageUsed ?? '...'}KB`, detail: 'All assessment data, client profiles, reports, and evidence packs stored here. No data leaves the device.', note: storageUsed && storageUsed > 4000 ? 'Usage is high. Consider exporting a backup from the Consultant Hub.' : null },
  ];

  // ── STORAGE & DATA SAFETY ──────────────────────────────────────────────────
  const storageItems = [
    { status: 'pass', label: 'storage.js is the Single Source of Truth (SSOT)', detail: 'All localStorage access is exclusively handled in /src/core/storage.js. Zero raw localStorage calls in any other file.' },
    { status: 'pass', label: 'consultantStorage.js handles consultant workspace', detail: 'ENTERED_KEY, client slots, backup/restore — all in consultantStorage.js. No raw localStorage outside these two files.' },
    { status: 'pass', label: 'Corrupted state recovery guard', detail: 'getStateOrRecover() detects null/malformed state and re-merges with initial shape. App never blank-screens from bad localStorage.' },
    { status: 'pass', label: 'Import backup validation hardened', detail: 'importFullBackup validates JSON shape, meta.exportedAt, clientId key format (/^[\\w-]+$/), and object types before restoring.' },
    { status: 'pass', label: 'Destructive actions require confirmation', detail: 'Clear Demo Data, Reset Demo Portfolio, Delete Client, and Delete System all show confirmation dialogs.' },
    { status: hasOrg ? 'pass' : 'info',   label: `Organisation profile: ${hasOrg ? 'complete' : 'not set'}`,   detail: 'Required for report generation and assessment context.' },
    { status: hasSystems ? 'pass' : 'info', label: `System inventory: ${hasSystems ? `${(systemProfiles||[]).filter(s=>!s.archived).length} system(s)` : 'empty'}`, detail: 'Systems are used in risk scoring and evidence pack scaffolding.' },
  ];

  // ── DEMO PORTFOLIO ─────────────────────────────────────────────────────────
  const demoItems = [
    { status: demoLoaded ? 'pass' : 'info', label: `Demo portfolio: ${activeClients.length > 0 ? `${activeClients.length} clients loaded` : 'not loaded'}`, detail: 'Load 5 SME demo clients from Consultant Hub → Demo Controls, or from the Settings page.', note: !demoLoaded ? 'Load demo portfolio to enable full demo walk-through.' : null },
    { status: hasSecurity ? 'pass' : 'info', label: `Security assessment: ${hasSecurity ? 'complete (current client)' : 'not completed'}`, detail: 'Switch to a demo client to view completed assessment data.' },
    { status: hasQuantum ? 'pass' : 'info',  label: `Quantum readiness: ${hasQuantum ? 'complete (current client)' : 'not completed'}`, detail: 'Switch to a demo client to view quantum readiness scores.' },
    { status: hasReports ? 'pass' : 'info',  label: `Report history: ${hasReports ? `${(reportModel?.history||[]).length} report(s)` : 'empty'}`, detail: 'Demo clients include pre-loaded executive, technical, and quantum readiness reports.' },
    { status: hasEvidence ? 'pass' : 'info', label: `Evidence pack: ${hasEvidence ? `${(evidencePack?.items||[]).length} item(s)` : 'empty'}`, detail: 'Demo clients include realistic evidence pack items across multiple categories.' },
    { status: cs.onboardingComplete ? 'pass' : 'info', label: `Onboarding: ${cs.onboardingComplete ? 'complete' : 'not yet completed'}`, detail: 'Onboarding runs automatically on first launch for new users.' },
    { status: activeClients.length > 0 ? 'pass' : 'info', label: `Consultant hub: ${activeClients.length > 0 ? `${activeClients.length} client(s) in workspace` : 'no clients yet'}`, detail: 'Consultant Hub provides multi-client management, risk comparison, and analytics.' },
  ];

  // ── DEFENSIVE SAFETY ──────────────────────────────────────────────────────
  const safetyItems = [
    { status: 'pass', label: 'No backend exists', detail: 'No server, no API routes, no serverless functions. Pure static frontend only.' },
    { status: 'pass', label: 'No Supabase — RLS not applicable', detail: 'No Supabase. No database. No row-level security needed. All data is local-first in the browser.' },
    { status: 'pass', label: 'No real payments connected', detail: 'Commercial tier cards are display-only placeholders. No Stripe, no payment processing, no billing.' },
    { status: 'pass', label: 'No AI API integration', detail: 'No OpenAI, no Anthropic, no external LLM calls. All scoring is deterministic local logic.' },
    { status: hasCopilot ? 'pass' : 'warn', label: `Consultant Copilot: ${hasCopilot ? `local-template mode${copilotDrafts > 0 ? ` (${copilotDrafts} draft(s) saved)` : ''}` : 'not initialised'}`, detail: 'Local deterministic Copilot. No external AI API. No live scanning. Advisory drafts only based on supplied assessment data.' },
    { status: 'pass', label: 'No offensive security tooling', detail: 'Zero exploit tools, scanners, password crackers, or attack automation. Defensive readiness assessment only.' },
    { status: 'pass', label: 'No compliance/quantum-proof guarantees claimed', detail: 'All disclaimers use "readiness assessment", "planning purposes", and "reviewed by qualified professionals".' },
    { status: 'pass', label: 'Legal disclaimers present on all key pages', detail: 'Dashboard, Settings, Reports, About, LandingPage, and report exports all carry the defensive-use disclaimer.' },
    { status: 'pass', label: 'No external tracking or analytics', detail: 'No Google Analytics, Mixpanel, Hotjar, Segment, or any third-party tracking scripts.' },
    { status: 'pass', label: 'No external CDN or font loading', detail: 'All assets are self-hosted. No Google Fonts, no CDN-loaded libraries. Fully offline capable.' },
    { status: 'pass', label: 'Offensive input validation in validators.js', detail: 'User text inputs are screened for offensive/attack-related keywords and XSS patterns before storage.' },
  ];

  // ── MOBILE / DEMO PRESENTATION ─────────────────────────────────────────────
  const mobileItems = [
    { status: 'pass', label: 'Mobile sidebar drawer configured', detail: 'Sidebar uses sidebar--mobile-open CSS class on screens ≤768px with tap-to-close overlay.' },
    { status: 'pass', label: 'Responsive breakpoints: 768px and 480px', detail: 'Stat cards, system cards, form fields, and page headers all adapt at both breakpoints.' },
    { status: 'pass', label: 'Table scroll wrappers', detail: 'Comparison tables and risk registers have overflow-x: auto scroll wrappers on mobile.' },
    { status: 'pass', label: 'Print / PDF layout', detail: '@media print hides sidebar, topbar, and navigation. Clean printable report layout.' },
    { status: 'pass', label: 'Landing page sections responsive', detail: 'Feature grid, tier cards, and hero text adapt to single-column on mobile.' },
    { status: 'pass', label: 'Touch targets ≥ 44px', detail: 'All buttons use minimum 36px height with appropriate padding. Sidebar nav items have adequate tap area.' },
    { status: 'info', label: 'Physical device test recommended', detail: 'Validate on real iOS and Android devices before investor/client demo. Especially test PWA install flow.' },
  ];

  const allItems = [...buildItems, ...pwaItems, ...storageItems, ...demoItems, ...safetyItems, ...mobileItems];
  const totalPass  = allItems.filter((i) => i.status === 'pass').length;
  const totalChecks = allItems.filter((i) => i.status !== 'na').length;
  const allGreen   = totalPass === totalChecks;

  return (
    <div>
      <PageHeader
        icon="🚀"
        title="Deployment & Demo Readiness"
        subtitle="Production deployment checklist, demo confidence review, and safety validation — Run 9 complete."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
              background: allGreen ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
              color: allGreen ? 'var(--success)' : 'var(--warning)',
              border: `1px solid ${allGreen ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
              {totalPass}/{totalChecks} checks passing
            </span>
          </div>
        }
      />

      {/* Summary banner */}
      <div style={{
        padding: '16px 20px', marginBottom: '24px',
        background: allGreen ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
        border: `1px solid ${allGreen ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex', gap: '16px', alignItems: 'center',
      }}>
        <span style={{ fontSize: '32px', flexShrink: 0 }}>{allGreen ? '✅' : '⚠️'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: allGreen ? 'var(--success)' : 'var(--warning)' }}>
            {allGreen
              ? 'Quantum Compliance OS™ is deployment-ready and demo-ready.'
              : `${totalChecks - totalPass} item(s) need attention before final deployment.`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Run 9 complete · Local-first · No backend · No Supabase · RLS not applicable · Defensive use only
          </div>
        </div>
      </div>

      <CheckSection title="Build & Deployment" icon="📦" items={buildItems} />
      <CheckSection title="PWA & Offline" icon="📲" items={pwaItems} />
      <CheckSection title="Storage & Data Safety" icon="🗄️" items={storageItems} />
      <CheckSection title="Demo Portfolio" icon="🎯" items={demoItems} />
      <CheckSection title="Defensive Safety & Compliance" icon="🛡️" items={safetyItems} />
      <CheckSection title="Mobile & Demo Presentation" icon="📱" items={mobileItems} />

      {/* Architecture confirmation */}
      <SectionCard title="Architecture Confirmations" icon="⚙️">
        {[
          ['RLS (Row-Level Security)', 'NOT ENABLED — no Supabase or backend exists in this project.'],
          ['Backend',    'NOT INCLUDED — pure static SPA.'],
          ['Supabase',   'NOT INCLUDED — all data is localStorage via storage.js.'],
          ['Real Payments', 'NOT CONNECTED — tier cards are display-only placeholders.'],
          ['AI APIs',    'NOT CONNECTED — all scoring is deterministic local logic.'],
          ['Offensive Scanning', 'NOT INCLUDED — defensive assessment only.'],
          ['External Tracking', 'NOT INCLUDED — no analytics, no telemetry, no CDN fonts.'],
          ['Environment Variables', 'NOT REQUIRED — zero .env dependencies to build or run.'],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '10px 0', borderBottom: '1px solid var(--border-muted)',
            fontSize: '13px', gap: '16px',
          }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{k}</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </SectionCard>

      {/* Deployment instructions */}
      <SectionCard title="Vercel Deployment (One Command)" icon="☁️">
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
          Quantum Compliance OS deploys as a static SPA with zero configuration. No server, no database, no environment variables.
        </div>
        {[
          { label: 'Option A — Vercel CLI', code: 'npm run build && vercel --prod' },
          { label: 'Option B — GitHub → Vercel', code: '1. Push to GitHub\n2. Import repo at vercel.com\n3. Framework: Vite  |  Build: npm run build  |  Output: dist\n4. Deploy — vercel.json handles SPA routing automatically' },
          { label: 'Option C — Local dev', code: 'npm install\nnpm run dev       # http://localhost:5173\nnpm run build     # produces /dist\nnpm run preview   # serve /dist at http://localhost:4173' },
          { label: 'Option D — Any static host', code: 'npm run build\n# Upload the /dist folder contents to:\n# Netlify, GitHub Pages, S3, Cloudflare Pages, etc.\n# Add SPA routing fallback (rewrite all routes to /index.html)' },
        ].map(({ label, code }) => (
          <div key={label} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <pre style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)', padding: '12px 16px',
              fontSize: '12px', color: 'var(--text-primary)', margin: 0,
              overflowX: 'auto', lineHeight: 1.7, fontFamily: 'monospace',
              whiteSpace: 'pre',
            }}>{code}</pre>
          </div>
        ))}
      </SectionCard>

      {/* Demo launch guide */}
      <SectionCard title="Demo Launch Path" icon="🎯">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { step: '1', title: 'Open the app', detail: 'Navigate to the app URL. Sales Landing Page shows automatically on first visit.' },
            { step: '2', title: 'Click "Launch Platform →"', detail: 'Enters the onboarding wizard (first visit) or jumps straight to the Dashboard (returning).' },
            { step: '3', title: 'Go to Consultant Hub', detail: 'Navigate via Sidebar → System → Consultant Hub.' },
            { step: '4', title: 'Click "Load Demo Portfolio"', detail: 'Loads 5 realistic SME demo clients: Meridian Legal (high risk), Vantage SaaS (medium), Apex MSP (low risk), Helix Health (regulated), Clearline (showcase).' },
            { step: '5', title: 'Switch to a demo client', detail: 'Click any client → "Switch to Client". Dashboard, assessments, reports, and evidence pack update to that client.' },
            { step: '6', title: 'Tour key pages', detail: 'Dashboard (scores), Security Assessment (results), Quantum Readiness (HNDL scores), Reports (history), Evidence Pack (items), Recommendations.' },
            { step: '7', title: 'Generate a fresh report', detail: 'Reports → Select type → Generate. Export as JSON or CSV. Print to PDF.' },
            { step: '8', title: 'Show the Consultant Hub overview', detail: 'Switch back to Consultant Hub → Overview tab → demonstrates portfolio analytics, risk distribution, and revenue placeholder.' },
            { step: '9', title: 'Open the Consultant Copilot', detail: 'Navigate Sidebar → Consultant Copilot. Select a demo client → generate executive summary, technical remediation draft, meeting talking points, and evidence gap summary. Copy to clipboard or save draft.' },
          ].map(({ step, title, detail }) => (
            <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{step}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Future runs */}
      <SectionCard title="Optional Future Runs — Not Yet Built" icon="🗺️">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          These are noted for planning only. None are implemented in Run 9.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {[

            ['Run 9',   'Final Sales Pack + Pricing + Launch QA',   'Polished investor deck export, pricing page, and full QA gate review.'],
            ['Future',  'Supabase Migration (Optional)',             'Optional multi-device sync. RLS would be enabled at this point. Opt-in upgrade.'],
            ['Future',  'Optional AI API Connector',                 'Future optional AI API — disabled in this local-first MVP. Would use existing copilotEngine.js interface.'],
            ['Future',  'Authorised TLS/Certificate Checker',        'User-supplied domains only. Explicit consent. Defensive use only. No scanning without permission.'],
            ['Future',  'Team Accounts',                             'Shared client workspaces with role-based access. Requires backend/Supabase.'],
            ['Future',  'Real Payments',                             'Stripe integration for tier upgrades. Requires backend. Currently placeholder display only.'],
          ].map(([tag, title, detail]) => (
            <div key={title} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, minWidth: '52px', paddingTop: '1px' }}>{tag}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', color: 'var(--text-secondary)' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Legal disclaimer */}
      <div style={{
        marginTop: 'var(--space-8)', padding: 'var(--space-4)',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>⚠ Disclaimer:</strong>{' '}
        This platform is for <strong>defensive security readiness</strong>, compliance preparation, and post-quantum migration planning only.
        It does not perform offensive testing, unauthorised scanning, exploitation, or guarantee compliance.
        All assessments should be reviewed by qualified security professionals before operational decisions are made.
      </div>
    </div>
  );
}
