import React from 'react';
import '../styles/navigation.css';

export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header__top">
        <div>
          <h1 className="page-header__title">
            {icon && <span className="page-header__icon" aria-hidden="true">{icon}</span>}
            {title}
          </h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
      <hr className="page-header__divider" />
    </div>
  );
}
