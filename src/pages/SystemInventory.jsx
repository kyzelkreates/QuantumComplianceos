import React, { useState, useEffect } from 'react';
import '../styles/forms.css';
import '../styles/cards.css';
import PageHeader from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import FormField from '../components/FormField.jsx';
import ActionButton from '../components/ActionButton.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  getState, subscribe,
  createSystemProfile, updateSystemProfile,
  deleteSystemProfile, archiveSystemProfile, restoreSystemProfile,
} from '../core/storage.js';
import {
  SYSTEM_TYPES, ENVIRONMENTS, CRITICALITY_LEVELS,
  DATA_TYPES, AUTH_METHODS, CLOUD_PROVIDERS, BACKUP_STATUSES,
} from '../core/constants.js';
import { validateSystemProfile, sanitiseText } from '../core/validators.js';
import { formatDate } from '../utils/date.js';
import { truncate } from '../utils/text.js';

const BLANK_FORM = {
  name: '', type: '', owner: '', environment: 'Production',
  criticality: '', dataTypes: [], encryptionKnown: '',
  authMethods: [], cloudProvider: '', backupStatus: '', notes: '',
};

export default function SystemInventory() {
  const [state, setLocalState] = useState(() => getState());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [errors, setErrors] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const unsub = subscribe((s) => setLocalState({ ...s }));
    return unsub;
  }, []);

  const systems = state.systemProfiles || [];
  const active = systems.filter((s) => !s.archived);
  const archived = systems.filter((s) => s.archived);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: typeof value === 'string' ? sanitiseText(value) : value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const handleMultiToggle = (field, val) => {
    const current = form[field] || [];
    handleChange(field, current.includes(val) ? current.filter((v) => v !== val) : [...current, val]);
  };

  const openCreate = () => {
    setForm({ ...BLANK_FORM });
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (sys) => {
    setForm({ ...sys });
    setEditingId(sys.id);
    setErrors({});
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setErrors({});
  };

  const handleSave = () => {
    const result = validateSystemProfile(form);
    if (!result.valid) {
      setErrors(Object.fromEntries(Object.entries(result.errors).map(([k, msgs]) => [k, msgs[0]])));
      return;
    }
    if (editingId) {
      updateSystemProfile(editingId, form);
    } else {
      createSystemProfile(form);
    }
    setShowForm(false);
    setEditingId(null);
    setErrors({});
  };

  const handleArchive = (id) => { archiveSystemProfile(id); };
  const handleRestore = (id) => { restoreSystemProfile(id); };
  const handleDelete = (id) => {
    deleteSystemProfile(id);
    setConfirmDelete(null);
  };

  if (showForm) {
    return (
      <div>
        <PageHeader
          icon={editingId ? '✏️' : '➕'}
          title={editingId ? 'Edit System' : 'Add System'}
          subtitle="Record a critical system for your quantum-readiness and security assessment."
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <ActionButton variant="ghost" onClick={handleCancel}>Cancel</ActionButton>
              <ActionButton variant="primary" onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Add System'}
              </ActionButton>
            </div>
          }
        />

        <SectionCard title="System Details" icon="🗄️">
          <div className="form">
            <div className="form-row">
              <FormField label="System Name" required error={errors.name} id="sys_name">
                <input className={`form-input${errors.name ? ' form-input--error' : ''}`}
                  value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Customer Portal" maxLength={200} />
              </FormField>
              <FormField label="System Type" required error={errors.type} id="sys_type">
                <select className={`form-select${errors.type ? ' form-select--error' : ''}`}
                  value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                  <option value="">Select type…</option>
                  {SYSTEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
            </div>

            <div className="form-row">
              <FormField label="System Owner / Team" id="sys_owner">
                <input className="form-input" value={form.owner}
                  onChange={(e) => handleChange('owner', e.target.value)}
                  placeholder="e.g. IT Department" maxLength={200} />
              </FormField>
              <FormField label="Environment" id="sys_environment">
                <select className="form-select" value={form.environment}
                  onChange={(e) => handleChange('environment', e.target.value)}>
                  {ENVIRONMENTS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </FormField>
            </div>

            <div className="form-row">
              <FormField label="Criticality" required error={errors.criticality} id="sys_criticality">
                <select className={`form-select${errors.criticality ? ' form-select--error' : ''}`}
                  value={form.criticality} onChange={(e) => handleChange('criticality', e.target.value)}>
                  <option value="">Select criticality…</option>
                  {CRITICALITY_LEVELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </FormField>
              <FormField label="Cloud / Hosting Provider" id="sys_cloud">
                <select className="form-select" value={form.cloudProvider}
                  onChange={(e) => handleChange('cloudProvider', e.target.value)}>
                  <option value="">Select provider…</option>
                  {CLOUD_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </FormField>
            </div>

            <div className="form-row">
              <FormField label="Encryption Posture" hint="What encryption is known to be in use?" id="sys_encryption">
                <input className="form-input" value={form.encryptionKnown}
                  onChange={(e) => handleChange('encryptionKnown', e.target.value)}
                  placeholder="e.g. TLS 1.3 in transit, AES-256 at rest" maxLength={500} />
              </FormField>
              <FormField label="Backup Status" id="sys_backup">
                <select className="form-select" value={form.backupStatus}
                  onChange={(e) => handleChange('backupStatus', e.target.value)}>
                  <option value="">Select status…</option>
                  {BACKUP_STATUSES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </FormField>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Data Types Processed" icon="📊">
          <FormField label="Select all data types processed by this system" id="sys_datatypes">
            <div className="form-checkbox-group" role="group" aria-label="Data types">
              {DATA_TYPES.map((dt) => {
                const sel = (form.dataTypes || []).includes(dt);
                return (
                  <div key={dt}
                    className={`form-checkbox-item${sel ? ' form-checkbox-item--selected' : ''}`}
                    onClick={() => handleMultiToggle('dataTypes', dt)}
                    role="checkbox" aria-checked={sel} tabIndex={0}
                    onKeyDown={(e) => e.key === ' ' && handleMultiToggle('dataTypes', dt)}>
                    <span aria-hidden="true">{sel ? '✓' : '○'}</span>
                    <span style={{ fontSize: '13px' }}>{dt}</span>
                  </div>
                );
              })}
            </div>
          </FormField>
        </SectionCard>

        <SectionCard title="Authentication Methods" icon="🔐">
          <FormField label="Select all authentication methods in use" id="sys_authmethods">
            <div className="form-checkbox-group" role="group" aria-label="Auth methods">
              {AUTH_METHODS.map((am) => {
                const sel = (form.authMethods || []).includes(am);
                return (
                  <div key={am}
                    className={`form-checkbox-item${sel ? ' form-checkbox-item--selected' : ''}`}
                    onClick={() => handleMultiToggle('authMethods', am)}
                    role="checkbox" aria-checked={sel} tabIndex={0}
                    onKeyDown={(e) => e.key === ' ' && handleMultiToggle('authMethods', am)}>
                    <span aria-hidden="true">{sel ? '✓' : '○'}</span>
                    <span style={{ fontSize: '13px' }}>{am}</span>
                  </div>
                );
              })}
            </div>
          </FormField>
        </SectionCard>

        <SectionCard title="Notes" icon="📝">
          <FormField label="Additional Notes" error={errors.notes} id="sys_notes">
            <textarea className={`form-textarea${errors.notes ? ' form-textarea--error' : ''}`}
              value={form.notes} onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Known vulnerabilities, outstanding patches, remediation notes…"
              maxLength={2000} rows={4} />
          </FormField>
        </SectionCard>

        <div className="form-actions form-actions--right">
          <ActionButton variant="ghost" onClick={handleCancel}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={handleSave}>
            {editingId ? 'Save Changes' : 'Add System'}
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon="🗄️"
        title="System Inventory"
        subtitle="Register and manage critical systems for security and quantum-readiness assessment."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ActionButton variant="ghost" size="sm"
              onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? 'Hide Archived' : `Show Archived (${archived.length})`}
            </ActionButton>
            <ActionButton variant="primary" icon="➕" onClick={openCreate}>
              Add System
            </ActionButton>
          </div>
        }
      />

      {/* Active Systems */}
      <SectionCard
        title={`Active Systems (${active.length})`}
        icon="🗄️"
        actions={<ActionButton variant="primary" size="sm" icon="➕" onClick={openCreate}>Add</ActionButton>}
      >
        {active.length === 0 ? (
          <EmptyState
            icon="🗄️"
            title="No systems added yet"
            message="Add your first critical system to begin your security and quantum-readiness assessment."
            action={<ActionButton variant="primary" onClick={openCreate}>Add First System</ActionButton>}
          />
        ) : (
          <div className="system-grid">
            {active.map((sys) => (
              <SystemCard
                key={sys.id}
                sys={sys}
                onEdit={() => openEdit(sys)}
                onArchive={() => handleArchive(sys.id)}
                onDelete={() => setConfirmDelete(sys.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Archived Systems */}
      {showArchived && archived.length > 0 && (
        <SectionCard title={`Archived Systems (${archived.length})`} icon="📦">
          <div className="system-grid">
            {archived.map((sys) => (
              <SystemCard
                key={sys.id}
                sys={sys}
                archived
                onRestore={() => handleRestore(sys.id)}
                onDelete={() => setConfirmDelete(sys.id)}
              />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '400px', width: '90%',
          }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--danger)' }}>⚠ Permanently Delete System?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              This action cannot be undone. Consider archiving instead if you may need this record later.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <ActionButton variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</ActionButton>
              <ActionButton variant="danger" onClick={() => handleDelete(confirmDelete)}>
                Delete Permanently
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SystemCard({ sys, archived, onEdit, onArchive, onRestore, onDelete }) {
  return (
    <div className={`system-card${archived ? ' system-card--archived' : ''}`}>
      <div className="system-card__header">
        <div>
          <div className="system-card__name">{sys.name}</div>
          <div className="system-card__meta">
            <span>{sys.type || '—'}</span>
            {sys.environment && <><span className="system-card__meta-sep">·</span><span>{sys.environment}</span></>}
            {sys.owner && <><span className="system-card__meta-sep">·</span><span>{sys.owner}</span></>}
          </div>
        </div>
        <div className="system-card__badges">
          {sys.criticality && <RiskBadge level={sys.criticality} />}
          {archived && <span className="status-pill status-pill--archived"><span className="status-pill__dot" />Archived</span>}
        </div>
      </div>

      <div className="system-card__body">
        <div className="system-card__field">
          <div className="system-card__field-label">Encryption</div>
          <div className={`system-card__field-value${!sys.encryptionKnown ? ' system-card__field-value--muted' : ''}`}>
            {truncate(sys.encryptionKnown, 60) || 'Not recorded'}
          </div>
        </div>
        <div className="system-card__field">
          <div className="system-card__field-label">Cloud Provider</div>
          <div className={`system-card__field-value${!sys.cloudProvider ? ' system-card__field-value--muted' : ''}`}>
            {sys.cloudProvider || 'Not recorded'}
          </div>
        </div>
        <div className="system-card__field">
          <div className="system-card__field-label">Backup Status</div>
          <div className={`system-card__field-value${!sys.backupStatus ? ' system-card__field-value--muted' : ''}`}>
            {sys.backupStatus || 'Unknown'}
          </div>
        </div>
        <div className="system-card__field">
          <div className="system-card__field-label">Auth Methods</div>
          <div className="system-card__field-value">
            {(sys.authMethods || []).length > 0
              ? sys.authMethods.slice(0, 2).join(', ') + (sys.authMethods.length > 2 ? ` +${sys.authMethods.length - 2}` : '')
              : <span className="system-card__field-value--muted">None recorded</span>}
          </div>
        </div>
      </div>

      {sys.dataTypes && sys.dataTypes.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div className="system-card__field-label" style={{ marginBottom: '6px' }}>Data Types</div>
          <div className="tag-list">
            {sys.dataTypes.slice(0, 4).map((dt) => <span key={dt} className="tag">{dt}</span>)}
            {sys.dataTypes.length > 4 && <span className="tag">+{sys.dataTypes.length - 4} more</span>}
          </div>
        </div>
      )}

      {sys.notes && (
        <div className="system-card__notes">{truncate(sys.notes, 200)}</div>
      )}

      <div className="system-card__actions">
        {!archived && (
          <>
            <ActionButton variant="ghost" size="sm" icon="✏️" onClick={onEdit}>Edit</ActionButton>
            <ActionButton variant="ghost" size="sm" icon="📦" onClick={onArchive}>Archive</ActionButton>
          </>
        )}
        {archived && (
          <ActionButton variant="secondary" size="sm" icon="↩" onClick={onRestore}>Restore</ActionButton>
        )}
        <ActionButton variant="danger" size="sm" icon="🗑" onClick={onDelete}>Delete</ActionButton>
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
          Updated {formatDate(sys.updatedAt)}
        </span>
      </div>
    </div>
  );
}
