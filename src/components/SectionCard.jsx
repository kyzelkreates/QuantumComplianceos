import React from 'react';
import '../styles/cards.css';

export default function SectionCard({ title, icon, actions, children, noPadding = false }) {
  return (
    <div className="section-card">
      {(title || actions) && (
        <div className="section-card__header">
          <div className="section-card__title">
            {icon && <span className="section-card__title-icon" aria-hidden="true">{icon}</span>}
            {title}
          </div>
          {actions && <div className="section-card__actions">{actions}</div>}
        </div>
      )}
      <div className={`section-card__body${noPadding ? ' section-card__body--no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
}
