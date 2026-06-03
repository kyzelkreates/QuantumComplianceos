import React from 'react';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import { REPORT_SECTIONS } from '../core/reportSchema.js';

export default function ReportsPlaceholder({ onNavigate }) {
  return (
    <div>
      <PageHeader
        icon="📋"
        title="Reports"
        subtitle="Assessment report generation and export — available in Run 4 once all assessments and recommendations are complete."
      />
      <SectionCard title="Report Generator — Run 4" icon="📋"
        actions={<span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', padding: '2px 10px', fontSize: '12px', color: 'var(--text-muted)' }}>Coming in Run 4</span>}>
        <div style={{ textAlign: 'center', padding: '40px 32px', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📋</div>
          <h3 style={{ marginBottom: '8px' }}>Quantum Compliance Report</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', fontSize: '14px', lineHeight: 1.6 }}>
            Run 4 will produce a full defensive readiness report covering all assessment domains, risk register, priority actions, NIST/NCSC alignment notes, and evidence pack summary.
          </p>
        </div>
        <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Report Sections</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {REPORT_SECTIONS.map((section) => (
            <div key={section.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', width: '20px' }}>{section.order}.</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{section.title}</span>
              <span style={{
                fontSize: '11px', padding: '1px 8px', borderRadius: '999px',
                background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-default)',
              }}>Run {section.futureRun}</span>
              {section.mandatory && (
                <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700 }}>Required</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
