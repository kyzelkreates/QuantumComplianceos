import React from 'react';
import '../styles/cards.css';
import { STATUS_LABELS } from '../core/constants.js';

export default function StatusPill({ status }) {
  const safeStatus = (status || 'not_started').toLowerCase().replace(/\s+/g, '_');
  const label = STATUS_LABELS[safeStatus] || safeStatus;
  return (
    <span className={`status-pill status-pill--${safeStatus}`}>
      <span className="status-pill__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
