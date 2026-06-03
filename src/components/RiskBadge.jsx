import React from 'react';
import '../styles/cards.css';

const LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Info',
};

const DOTS = {
  critical: '●',
  high: '●',
  medium: '●',
  low: '●',
  informational: '●',
};

export default function RiskBadge({ level, showDot = true }) {
  const safeLevel = (level || 'informational').toLowerCase();
  const label = LABELS[safeLevel] || safeLevel;
  return (
    <span className={`risk-badge risk-badge--${safeLevel}`} title={`Risk level: ${label}`}>
      {showDot && <span aria-hidden="true">{DOTS[safeLevel]}</span>}
      {label}
    </span>
  );
}
