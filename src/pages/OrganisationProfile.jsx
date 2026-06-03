import React, { useState, useEffect } from 'react';
import '../styles/forms.css';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import FormField from '../components/FormField.jsx';
import ActionButton from '../components/ActionButton.jsx';
import { getState, subscribe, updateOrganisation } from '../core/storage.js';
import {
  SECTORS, ORG_SIZES, DATA_SENSITIVITY_LEVELS, COMPLIANCE_FRAMEWORKS,
} from '../core/constants.js';
import { validateOrganisation, sanitiseText } from '../core/validators.js';

export default function OrganisationProfile() {
  const [state, setLocalState] = useState(() => getState());
  const [form, setForm] = useState(() => ({ ...getState().organisation }));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const unsub = subscribe((s) => {
      setLocalState({ ...s });
      if (!dirty) setForm({ ...s.organisation });
    });
    return unsub;
  }, [dirty]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: typeof value === 'string' ? sanitiseText(value) : value }));
    setDirty(true);
    setSaved(false);
    if (errors[field]) setErrors((e) => { const next = { ...e }; delete next[field]; return next; });
  };

  const handleComplianceToggle = (framework) => {
    const current = form.complianceNeeds || [];
    const next = current.includes(framework)
      ? current.filter((f) => f !== framework)
      : [...current, framework];
    handleChange('complianceNeeds', next);
  };

  const handleSave = () => {
    const result = validateOrganisation(form);
    if (!result.valid) {
      setErrors(
        Object.fromEntries(
          Object.entries(result.errors).map(([k, msgs]) => [k, msgs[0]])
        )
      );
      return;
    }
    updateOrganisation(form);
    setErrors({});
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setForm({ ...state.organisation });
    setErrors({});
    setDirty(false);
    setSaved(false);
  };

  return (
    <div>
      <PageHeader
        icon="🏢"
        title="Organisation Profile"
        subtitle="Record your organisation's details, compliance obligations, and data sensitivity classification. All data is stored locally."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {saved && (
              <span className="save-indicator">✓ Saved locally</span>
            )}
            {dirty && (
              <ActionButton variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </ActionButton>
            )}
            <ActionButton variant="primary" onClick={handleSave} disabled={!dirty}>
              Save Profile
            </ActionButton>
          </div>
        }
      />

      <SectionCard title="Organisation Details" icon="🏢">
        <div className="form">
          <div className="form-row">
            <FormField label="Organisation Name" required error={errors.name} id="org_name">
              <input
                className={`form-input${errors.name ? ' form-input--error' : ''}`}
                value={form.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Acme Security Ltd"
                maxLength={200}
              />
            </FormField>
            <FormField label="Sector" required error={errors.sector} id="org_sector">
              <select
                className={`form-select${errors.sector ? ' form-select--error' : ''}`}
                value={form.sector || ''}
                onChange={(e) => handleChange('sector', e.target.value)}
              >
                <option value="">Select sector…</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Organisation Size" id="org_size">
              <select
                className="form-select"
                value={form.size || ''}
                onChange={(e) => handleChange('size', e.target.value)}
              >
                <option value="">Select size…</option>
                {ORG_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Country" required error={errors.country} id="org_country">
              <input
                className={`form-input${errors.country ? ' form-input--error' : ''}`}
                value={form.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="e.g. United Kingdom"
                maxLength={100}
              />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Primary Contact Name" id="org_contactName">
              <input
                className="form-input"
                value={form.contactName || ''}
                onChange={(e) => handleChange('contactName', e.target.value)}
                placeholder="e.g. Alex Reynolds"
                maxLength={200}
              />
            </FormField>
            <FormField label="Contact Email" error={errors.contactEmail} id="org_contactEmail">
              <input
                className={`form-input${errors.contactEmail ? ' form-input--error' : ''}`}
                type="email"
                value={form.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="e.g. security@organisation.com"
                maxLength={254}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Data Sensitivity" icon="📊">
        <div className="form">
          <FormField
            label="Data Sensitivity Level"
            required
            error={errors.dataSensitivityLevel}
            hint="Select the highest sensitivity level of data your organisation processes."
            id="org_sensitivity"
          >
            <select
              className={`form-select${errors.dataSensitivityLevel ? ' form-select--error' : ''}`}
              value={form.dataSensitivityLevel || ''}
              onChange={(e) => handleChange('dataSensitivityLevel', e.target.value)}
            >
              <option value="">Select sensitivity level…</option>
              {DATA_SENSITIVITY_LEVELS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label} — {d.description}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Compliance Frameworks & Requirements"
            hint="Select all frameworks applicable to your organisation."
            id="org_compliance"
          >
            <div className="form-checkbox-group" role="group" aria-label="Compliance frameworks">
              {COMPLIANCE_FRAMEWORKS.map((fw) => {
                const selected = (form.complianceNeeds || []).includes(fw);
                return (
                  <div
                    key={fw}
                    className={`form-checkbox-item${selected ? ' form-checkbox-item--selected' : ''}`}
                    onClick={() => handleComplianceToggle(fw)}
                    role="checkbox"
                    aria-checked={selected}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === ' ' && handleComplianceToggle(fw)}
                  >
                    <span aria-hidden="true">{selected ? '✓' : '○'}</span>
                    <span style={{ fontSize: '13px' }}>{fw}</span>
                  </div>
                );
              })}
            </div>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Notes" icon="📝">
        <div className="form">
          <FormField
            label="Additional Notes"
            hint="Any additional context about your organisation's security posture or compliance requirements."
            error={errors.notes}
            id="org_notes"
          >
            <textarea
              className={`form-textarea${errors.notes ? ' form-textarea--error' : ''}`}
              value={form.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional context, known issues, or compliance notes…"
              maxLength={2000}
              rows={4}
            />
          </FormField>
        </div>
      </SectionCard>

      <div className="form-actions form-actions--right" style={{ paddingTop: '8px' }}>
        {saved && <span className="save-indicator">✓ Saved locally</span>}
        {dirty && <ActionButton variant="ghost" onClick={handleReset}>Reset Changes</ActionButton>}
        <ActionButton variant="primary" onClick={handleSave} disabled={!dirty}>
          Save Organisation Profile
        </ActionButton>
      </div>
    </div>
  );
}
