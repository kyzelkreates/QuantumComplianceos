/**
 * QUANTUM COMPLIANCE OS™ — Onboarding.jsx
 * Run 5: First-run onboarding wizard
 * ====================================
 * Shown on first launch. Collects consultant name/firm,
 * sets branding, and marks onboarding complete.
 *
 * DEFENSIVE USE ONLY. No backend. No data sent externally.
 */

import React, { useState } from 'react';
import '../styles/forms.css';
import ActionButton from '../components/ActionButton.jsx';
import {
  setConsultantState, saveConsultantState,
  ONBOARDING_STEPS,
} from '../core/consultantStorage.js';
import { setState as setAppState, enableDemoMode } from '../core/storage.js';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';

export default function Onboarding({ onComplete, workspaceMode }) {
  const [step, setStep]   = useState(0);
  const [useType, setUseType] = useState('self'); // 'self' | 'consultant'
  const [form, setForm]   = useState({
    consultantName: '',
    firmName: '',
    firmEmail: '',
    productName: 'Quantum Compliance OS™',
    tagline: 'Defensive Quantum-Readiness & Security Assessment',
    accentColour: '#00d4ff',
  });

  const stepDef = ONBOARDING_STEPS[step];

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Final step — commit and launch
      setConsultantState((s) => ({
        ...s,
        consultantName:   form.consultantName,
        firmName:         form.firmName || form.consultantName,
        firmEmail:        form.firmEmail,
        onboardingComplete: true,
        onboardingStep:   ONBOARDING_STEPS.length,
        branding: {
          productName:  form.productName,
          tagline:      form.tagline,
          logoText:     form.productName.split(' ').map((w) => w[0]).join('').slice(0, 4).toUpperCase() || 'QCOS',
          accentColour: form.accentColour,
        },
      }));
      // Push branding into main app state too
      setAppState((s) => ({
        ...s,
        branding: {
          ...s.branding,
          productName:  form.productName,
          tagline:      form.tagline,
          accentColour: form.accentColour,
          logoText:     form.productName.split(' ').map((w) => w[0]).join('').slice(0, 4).toUpperCase() || 'QCOS',
        },
      }));
      if (onComplete) onComplete();
    }
  };

  const canProceed = () => {
    if (step === 1) return true; // use type selection always valid
    return true;
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '24px',
    }}>
      {/* Progress dots */}
      <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {ONBOARDING_STEPS.map((_, i) => (
          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= step ? 'var(--accent)' : 'var(--border-default)', transition: 'background 0.2s' }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        {/* Card */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '40px 48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', textAlign: 'center' }}>{stepDef.icon}</div>
          <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '22px', fontWeight: 800 }}>{stepDef.title}</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px', lineHeight: 1.6 }}>{stepDef.subtitle}</p>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '8px' }}>
              {stepDef.content}
            </div>
          )}

          {/* Step 1: Use type */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
              {[
                { id: 'self', label: 'Assessing my own organisation', icon: '🏢', desc: 'Single-client mode — one organisation, all assessments.' },
                { id: 'consultant', label: 'Consultant / advisor managing clients', icon: '🤝', desc: 'Multi-client mode — manage multiple client profiles.' },
              ].map((opt) => (
                <div key={opt.id} onClick={() => setUseType(opt.id)} style={{
                  padding: '14px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: `2px solid ${useType === opt.id ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: useType === opt.id ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '22px' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <input className="form-input" value={form.consultantName} onChange={(e) => setForm((f) => ({ ...f, consultantName: e.target.value }))} placeholder={useType === 'consultant' ? 'Your name (optional)' : 'Your name (optional)'} maxLength={100} />
                <input className="form-input" value={form.firmName} onChange={(e) => setForm((f) => ({ ...f, firmName: e.target.value }))} placeholder={useType === 'consultant' ? 'Firm / practice name (optional)' : 'Organisation name (optional)'} maxLength={150} />
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
              <div className="form-field">
                <label className="form-label">Product Name</label>
                <input className="form-input" value={form.productName} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))} placeholder="Quantum Compliance OS" maxLength={60} />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Shown in reports and the top-left logo</div>
              </div>
              <div className="form-field">
                <label className="form-label">Tagline (optional)</label>
                <input className="form-input" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Defensive Quantum-Readiness Assessment" maxLength={120} />
              </div>
              <div className="form-field">
                <label className="form-label">Accent Colour</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" value={form.accentColour} onChange={(e) => setForm((f) => ({ ...f, accentColour: e.target.value }))} style={{ width: '48px', height: '36px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', padding: '2px' }} />
                  <input className="form-input" value={form.accentColour} onChange={(e) => setForm((f) => ({ ...f, accentColour: e.target.value }))} placeholder="#00d4ff" maxLength={20} style={{ flex: 1 }} />
                  {/* Preview */}
                  <div style={{ padding: '6px 14px', background: `${form.accentColour}22`, border: `1px solid ${form.accentColour}66`, borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, color: form.accentColour, flexShrink: 0 }}>Preview</div>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>You can change all branding at any time in Settings → Branding.</p>
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
                {stepDef.content}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  '🏢 Organisation Profile → start here',
                  '🗄️ System Inventory → document your systems',
                  '🛡️ Security Assessment → 47 defensive questions',
                  '⚛️ Quantum Readiness → post-quantum exposure',
                  '📋 Reports → export JSON, CSV, or print',
                  '🎯 Demo Portfolio → explore with realistic SME examples',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Demo mode launcher (Run 8.5) */}
          {step === 3 && (
            <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--warning)', marginBottom: '3px' }}>🎯 Explore with Demo Data First?</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Load 5 fictional SME clients to explore all features before entering real data. You can switch to Product Mode anytime in Settings.</div>
              </div>
              <button onClick={() => { enableDemoMode(); if (onComplete) onComplete(); }} style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, color: 'var(--warning)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                Load Demo Portfolio
              </button>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: step > 0 ? 'space-between' : 'flex-end', marginTop: '24px' }}>
            {step > 0 && (
              <ActionButton variant="ghost" onClick={() => setStep((s) => s - 1)}>← Back</ActionButton>
            )}
            <ActionButton variant="primary" onClick={handleNext} disabled={!canProceed()}>
              {stepDef.action}
            </ActionButton>
          </div>
        </div>

        {/* Skip link */}
        {step === 0 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={onComplete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'underline' }}>
              Skip setup and launch directly
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
