import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';

export default function RecommendationsPlaceholder({ onNavigate }) {
  return (
    <div>
      <PageHeader
        icon="💡"
        title="Recommendations"
        subtitle="Prioritised defensive recommendations and action plan — available in Run 3 after assessments are complete."
      />
      <SectionCard title="Recommendations Engine — Run 3" icon="💡"
        actions={<span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', padding: '2px 10px', fontSize: '12px', color: 'var(--text-muted)' }}>Coming in Run 3</span>}>
        <div style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>💡</div>
          <h3 style={{ marginBottom: '8px' }}>Priority Action Plan</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', fontSize: '14px', lineHeight: 1.6 }}>
            Run 3 will generate a ranked priority action plan based on your completed security and quantum-readiness assessments. Recommendations will be categorised by domain, effort, and impact.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
          {['Risk Register', 'Priority Actions', 'Technical Checklist'].map((item) => (
            <div key={item} style={{ background: 'var(--bg-tertiary)', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{item}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Run 3</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
