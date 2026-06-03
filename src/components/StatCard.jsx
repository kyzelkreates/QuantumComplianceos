import React from 'react';
import '../styles/dashboard.css';

export default function StatCard({ icon, label, value, sub, status, onClick }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      </div>
      <div className="stat-card__value">{value ?? '—'}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
      {status && <div className="stat-card__status">{status}</div>}
    </div>
  );
}
