import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';

const EVIDENCE_CATEGORIES = [
  { icon: '📄', label: 'Policies & Procedures', desc: 'Security policies, acceptable use, incident response plans' },
  { icon: '📊', label: 'Risk Assessments', desc: 'Risk registers, threat models, assessment outputs' },
  { icon: '🔐', label: 'Access Control Records', desc: 'IAM configurations, privilege reviews, MFA evidence' },
  { icon: '💾', label: 'Backup & Recovery Evidence', desc: 'Backup logs, restore test records, RTO/RPO documentation' },
  { icon: '🔑', label: 'Encryption Certificates', desc: 'TLS certificates, key management records, algorithm inventory' },
  { icon: '📡', label: 'Audit Logs', desc: 'SIEM outputs, access logs, change management records' },
  { icon: '⚛️', label: 'Quantum Readiness Artefacts', desc: 'Cryptographic inventory, migration roadmap, NIST alignment docs' },
  { icon: '🔗', label: 'Supplier Assurance', desc: 'Vendor assessments, contracts, third-party audit reports' },
];

export default function EvidencePackPlaceholder({ onNavigate }) {
  return (
    <div>
      <PageHeader
        icon="📁"
        title="Evidence Pack"
        subtitle="Compliance evidence preparation and gap analysis — available in Run 4. Structure your evidence pack for audits and regulatory reviews."
      />
      <SectionCard title="Evidence Pack Builder — Run 4" icon="📁"
        actions={<span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', padding: '2px 10px', fontSize: '12px', color: 'var(--text-muted)' }}>Coming in Run 4</span>}>
        <div style={{ textAlign: 'center', padding: '40px 32px', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📁</div>
          <h3 style={{ marginBottom: '8px' }}>Evidence Pack Builder</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', fontSize: '14px', lineHeight: 1.6 }}>
            Run 4 will provide a structured evidence pack builder mapped to your compliance frameworks, with gap analysis and document checklist generation.
          </p>
        </div>
        <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Evidence Categories</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {EVIDENCE_CATEGORIES.map((cat) => (
            <div key={cat.label} style={{
              background: 'var(--bg-tertiary)', border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px',
              display: 'flex', gap: '12px', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{cat.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>{cat.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
