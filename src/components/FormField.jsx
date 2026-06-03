import React from 'react';
import '../styles/forms.css';

export default function FormField({
  label,
  required,
  hint,
  error,
  id,
  children,
}) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '_');
  return (
    <div className="form-field">
      {label && (
        <label
          htmlFor={fieldId}
          className={`form-label ${required ? 'form-label--required' : ''}`}
        >
          {label}
        </label>
      )}
      {hint && <p className="form-hint">{hint}</p>}
      {React.isValidElement(children)
        ? React.cloneElement(children, { id: fieldId })
        : children}
      {error && (
        <p className="form-error" role="alert">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
