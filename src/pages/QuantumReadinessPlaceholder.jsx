import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import { PAGES } from '../core/constants.js';
import { getQuantumRelevantCategories } from '../core/riskTaxonomy.js';

export default function QuantumReadinessPlaceholder({ onNavigate }) {
  const quantumCategories = getQuantumRelevantCategories();

  return (
    <div>
      <PageHeader
        icon="⚛️"
        title="Quantum Readiness Assessment"
        subtitle="Post-quantum cryptography exposure and migration readiness — available in Run 2. Assesses harvest-now-decrypt-later risk and crypto-agility posture."
      />

      <SectionCard
        title="Quantum Readiness Engine — Run 2"
        icon="⚛️"
        actions={
          <span style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-full)', padding: '2px 10px',
            fontSize: '12px', color: 'var(--text-muted)',
          }}>
            Coming in Run 2
          </span>
        }
      >
        <div style={{
          background: 'var(--bg-tertiary)', border: '1px dashed var(--border-default)',
          borderRadius: 'var(--radius-lg)', padding: '40px 32px', textAlign: 'center', marginBottom: '24px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>⚛️</div>
          <h3 style={{ marginBottom: '8px' }}>Post-Quantum Readiness Engine</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 20px', fontSize: '14px', lineHeight: 1.6 }}>
            Run 2 will assess your organisation's exposure to quantum computing threats against current
            public-key cryptography, harvest-now-decrypt-later (HNDL) risk across sensitive data assets,
            and readiness to migrate to NIST-standardised post-quantum algorithms (FIPS 203, 204, 205).
          </p>
          <ActionButton variant="secondary" onClick={() => onNavigate(PAGES.ORGANISATION)}>
            ← Complete Organisation Profile First
          </ActionButton>
        </div>

        <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '13px',
          textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Quantum Assessment Domains (Run 2)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {quantumCategories.map((cat) => (
            <div key={cat.id} style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent)' }}>{cat.name}</span>
                  <span style={{
                    marginLeft: '10px', fontSize: '11px', background: 'rgba(239,68,68,0.15)',
                    color: '#ef4444', padding: '1px 6px', borderRadius: '999px', fontWeight: 700,
                  }}>
                    {cat.riskLevelDefault.toUpperCase()}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {cat.description}
              </p>
              {cat.relatedFrameworks && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {cat.relatedFrameworks.map((f) => (
                    <span key={f} style={{
                      fontSize: '11px', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '999px', padding: '1px 8px', color: 'var(--text-muted)',
                    }}>{f}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '24px', padding: '16px', background: 'var(--info-dim)',
          border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--info)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ℹ NIST Post-Quantum Standards
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            NIST finalised its post-quantum cryptography standards in 2024: <strong style={{ color: 'var(--text-primary)' }}>FIPS 203</strong> (ML-KEM / Kyber),{' '}
            <strong style={{ color: 'var(--text-primary)' }}>FIPS 204</strong> (ML-DSA / Dilithium), and{' '}
            <strong style={{ color: 'var(--text-primary)' }}>FIPS 205</strong> (SLH-DSA / SPHINCS+).
            Migration planning should begin immediately for systems with long data-protection requirements.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
