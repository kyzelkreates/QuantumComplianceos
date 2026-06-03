import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import { PAGES } from '../core/constants.js';
import { RISK_TAXONOMY } from '../core/riskTaxonomy.js';

export default function SecurityAssessmentPlaceholder({ onNavigate }) {
  const securityCategories = RISK_TAXONOMY.filter(
    (c) => !c.quantumRelevance && c.futureRun === 2
  );

  return (
    <div>
      <PageHeader
        icon="🛡️"
        title="Security Assessment"
        subtitle="Security implementation assessment — available in Run 2. This module will score your defensive posture across all key security domains."
      />

      <SectionCard
        title="Assessment Engine — Run 2"
        icon="🔒"
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
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🛡️</div>
          <h3 style={{ marginBottom: '8px' }}>Security Assessment Engine</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '14px', lineHeight: 1.6 }}>
            Run 2 will introduce a full scored security assessment across all defensive domains.
            Scoring is weighted by criticality, system count, and compliance requirements.
          </p>
          <ActionButton variant="secondary" onClick={() => onNavigate(PAGES.SYSTEM_INVENTORY)}>
            ← Complete System Inventory First
          </ActionButton>
        </div>

        <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '13px',
          textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Assessment Domains (Run 2)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {securityCategories.map((cat) => (
            <div key={cat.id} style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{cat.name}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {cat.description.slice(0, 100)}…
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
