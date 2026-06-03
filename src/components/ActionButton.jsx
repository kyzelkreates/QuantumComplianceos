import React from 'react';
import '../styles/buttons.css';

export default function ActionButton({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconOnly = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  title,
  className = '',
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    iconOnly ? 'btn--icon' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      aria-label={iconOnly ? (title || children) : undefined}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
      {!iconOnly && children && <span>{children}</span>}
    </button>
  );
}
