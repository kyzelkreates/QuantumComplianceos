/**
 * QUANTUM COMPLIANCE OS™ — TeamAccess.jsx
 * Run 25 — Auth + Team Roles + Client Permissions Layer
 * =====================================================
 * Team / Users / Access management screen.
 *
 * SECURITY POSITION:
 * Frontend role checks guide UI navigation and access.
 * Real production access control MUST be enforced by the backend:
 *   - Supabase Auth / Firebase Auth / equivalent
 *   - Row Level Security (RLS) policies
 *   - Server-side validation
 * Demo roles are for presentation only.
 *
 * WHAT THIS PAGE DOES:
 * - Shows current auth/account status (demo / live / backend state)
 * - Displays team members (demo data in demo mode, empty in live mode)
 * - Allows demo role preview in demo mode only
 * - Shows permission matrix for reference
 * - Shows Supabase Auth readiness with honest status
 * - Shows audit trail readiness
 * - In live mode: shows clean empty states + backend CTA
 *
 * SAFETY:
 * - No real auth SDK calls
 * - No fake login success
 * - No backend-only secrets
 * - No fake email invitations
 * - No fake RLS claims
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect, useRef } from 'react';
import PageHeader  from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import {
  ROLE, ROLE_META, ALL_ROLES, PERM, PERMISSION_MATRIX,
  DEMO_TEAM_MEMBERS, DEMO_ROLE_PRESETS,
  hasPermission, getRolePermissions, getRoleLabel, getRoleIcon, getRoleColour,
  AUTH_STATE, AUTH_STATE_META, computeAuthState,
  getDefaultAuthConfig,
} from '../core/authRoles.js';
import {
  getState, subscribe,
  getAuthConfig, updateAuthConfig, setActiveRole, setDemoPreviewRole,
} from '../core/storage.js';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

function RoleBadge({ roleId, size = 'sm' }) {
  const meta = ROLE_META[roleId];
  if (!meta) return null;
  const fs = size === 'xs' ? 9 : 10;
  return (
    <span style={{
      fontSize: fs, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: meta.colour + '18', color: meta.colour,
      border: `1px solid ${meta.colour}30`,
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      {meta.icon} {meta.label}
    </span>
  );
}

function AuthStatePill({ authStateId }) {
  const meta = AUTH_STATE_META[authStateId] || AUTH_STATE_META[AUTH_STATE.LIVE_NO_BACKEND];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
      background: meta.colour + '15', color: meta.colour,
      border: `1px solid ${meta.colour}30`, whiteSpace: 'nowrap',
    }}>
      {meta.icon} {meta.label}
    </span>
  );
}

function Banner({ type = 'warn', children }) {
  const MAP = {
    warn:    { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.25)',  icon: '⚠',  fg: '#f59e0b' },
    error:   { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',   icon: '⛔', fg: '#ef4444' },
    info:    { bg: 'rgba(0,212,255,0.05)',    border: 'rgba(0,212,255,0.2)',    icon: 'i',  fg: '#00d4ff' },
    success: { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.25)',  icon: 'ok', fg: '#10b981' },
    demo:    { bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)',   icon: 'i',  fg: '#f59e0b' },
  };
  const c = MAP[type] || MAP.warn;
  return (
    <div style={{
      padding: '9px 12px', marginBottom: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
    }}>
      <span style={{ color: c.fg, marginRight: 6, fontWeight: 700 }}>{c.icon}</span>
      {children}
    </div>
  );
}

function Btn({ onClick, children, variant = 'ghost', disabled = false, small = false }) {
  const variants = {
    primary: { bg: 'var(--accent)',              color: '#0d1117' },
    ghost:   { bg: 'var(--bg-elevated)',         color: 'var(--text-secondary)' },
    danger:  { bg: 'rgba(239,68,68,0.10)',        color: '#ef4444' },
    demo:    { bg: 'rgba(245,158,11,0.10)',       color: '#f59e0b' },
    info:    { bg: 'rgba(0,212,255,0.07)',        color: '#00d4ff' },
  };
  const v = variants[variant] || variants.ghost;
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{
        padding: small ? '3px 10px' : '5px 14px', fontSize: small ? 10 : 11,
        fontWeight: 700, borderRadius: 'var(--radius-md)',
        background: v.bg, color: v.color,
        border: `1px solid ${v.color}30`,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      }}>
      {children}
    </button>
  );
}

function Avatar({ initials, colour }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
      background: colour + '25', border: `2px solid ${colour}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 800, color: colour,
    }}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH STATUS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function AuthStatusSection({ authState, authConfig, workspaceMode, backendConfig }) {
  const meta   = AUTH_STATE_META[authState] || AUTH_STATE_META[AUTH_STATE.LIVE_NO_BACKEND];
  const isDemo = workspaceMode === WORKSPACE_MODE.DEMO;

  const supabaseConfigured = !!(backendConfig?.providers?.supabase?.configured);
  const lastTest           = (backendConfig?.connectionTests || [])[0];
  const testPassed         = lastTest?.status === 'success';

  return (
    <SectionCard title="Auth & Account Status" icon="🔑">
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap' }}>
        <AuthStatePill authStateId={authState} />
        {isDemo && <span style={{ fontSize: 10, color: '#f59e0b', fontStyle: 'italic' }}>Demo mode — roles are preview only</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Mode',              value: isDemo ? 'Demo Mode' : 'Product Mode',     colour: isDemo ? '#f59e0b' : '#00d4ff' },
          { label: 'Auth Provider',     value: authConfig?.authProvider || 'None',        colour: authConfig?.authProvider !== 'none' ? '#10b981' : '#6b7280' },
          { label: 'Supabase Config',   value: supabaseConfigured ? 'Saved' : 'Not configured', colour: supabaseConfigured ? '#10b981' : '#6b7280' },
          { label: 'Connection Test',   value: testPassed ? 'Passed' : lastTest ? 'Failed / Pending' : 'Not run', colour: testPassed ? '#10b981' : '#f59e0b' },
          { label: 'Supabase Auth',     value: authConfig?.supabaseAuthEnabled ? 'Enabled' : 'Not enabled', colour: authConfig?.supabaseAuthEnabled ? '#10b981' : '#6b7280' },
          { label: 'RLS Status',        value: 'Not verified from frontend', colour: '#f59e0b' },
          { label: 'Active Session',    value: authConfig?.activeSession ? 'Session active' : 'No session', colour: authConfig?.activeSession ? '#10b981' : '#6b7280' },
          { label: 'Frontend Role',     value: getRoleLabel(authConfig?.activeRole || ROLE.OWNER), colour: getRoleColour(authConfig?.activeRole || ROLE.OWNER) },
        ].map(({ label, value, colour }) => (
          <div key={label} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: colour }}>{value}</div>
          </div>
        ))}
      </div>

      <Banner type="warn">
        <strong>Frontend role checks guide the UI only.</strong> Real production access control
        must be enforced by the backend using Supabase Auth, Row Level Security,
        database policies, server-side validation, and secure API rules.
        Demo roles are for presentation only and do not represent production authentication.
      </Banner>

      {!isDemo && !testPassed && (
        <Banner type="info">
          <strong>Live Mode — Auth not connected.</strong>{' '}
          Configure Supabase or another auth provider to enable real user accounts and sessions.
          Until a backend test passes, the app must not be treated as production-connected.
        </Banner>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 8 }}>
        {meta.detail}
        {isDemo && (
          <><br /><strong style={{ color: '#f59e0b' }}>Demo positions:</strong> Use the demo role preview below to show investors/clients how different users experience the platform.</>
        )}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO ROLE SWITCHER
// ─────────────────────────────────────────────────────────────────────────────

function DemoRoleSwitcher({ demoPreviewRole, onSelect }) {
  return (
    <SectionCard title="Demo Role Preview" icon="🎭">
      <Banner type="demo">
        <strong>Demo only.</strong> This switcher shows how different users experience
        Quantum Compliance OS™. It does not represent real authentication.
        This panel is hidden in Product Mode.
      </Banner>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
        {DEMO_ROLE_PRESETS.map((preset) => {
          const isActive = demoPreviewRole === preset.roleId;
          const meta     = ROLE_META[preset.roleId];
          return (
            <div
              key={preset.roleId}
              onClick={() => onSelect(preset.roleId)}
              style={{
                padding: '12px 14px', cursor: 'pointer',
                background: isActive ? meta.colour + '12' : 'var(--bg-secondary)',
                border: `1px solid ${isActive ? meta.colour + '50' : 'var(--border-muted)'}`,
                borderTop: `3px solid ${isActive ? meta.colour : 'var(--border-muted)'}`,
                borderRadius: 'var(--radius-md)', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 5 }}>{preset.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: meta.colour, marginBottom: 3 }}>{preset.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{preset.description}</div>
              {isActive && (
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: meta.colour }}>
                  Active preview
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Selecting a demo role changes the UI preview only. No real data access is granted or revoked.
        Permission changes take effect in the Permission Matrix section below.
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

function TeamMembersSection({ members, isDemo, onInvite }) {
  const [expanded, setExpanded] = useState(null);

  if (!isDemo && (!members || members.length === 0)) {
    return (
      <SectionCard title="Team Members" icon="👥">
        <div style={{
          textAlign: 'center', padding: '36px 24px',
          background: 'var(--bg-secondary)', border: '1px dashed var(--border-default)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: 'var(--text-secondary)' }}>
            No live team members yet
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, maxWidth: 380, margin: '0 auto 12px', lineHeight: 1.7 }}>
            Configure Supabase Auth or another auth provider to enable real user accounts.
            Team invitations require a configured authentication provider and email service.
          </div>
          <div style={{
            margin: '0 auto 16px', maxWidth: 420, padding: '10px 14px',
            background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, textAlign: 'left',
          }}>
            <strong style={{ color: 'var(--accent)' }}>To enable team accounts:</strong><br />
            1. Configure Supabase in <strong>Settings &rarr; Backend Config</strong><br />
            2. Enable Supabase Auth in your Supabase project<br />
            3. Add the <code>user_profiles</code> and <code>team_roles</code> tables (Run 26 SQL schema)<br />
            4. Invite team members via Supabase Auth invite flow
          </div>
          <Btn variant="ghost" onClick={onInvite} disabled>
            + Invite Team Member (requires auth backend)
          </Btn>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={`Team Members${isDemo ? ' — Demo Preview' : ''}`} icon="👥">
      {isDemo && (
        <Banner type="demo">
          <strong>Demo team shown.</strong> These are fictional demo accounts for presentation purposes.
          Real team management requires a configured authentication backend.
        </Banner>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((member) => {
          const meta     = ROLE_META[member.role];
          const isExpand = expanded === member.id;
          return (
            <div key={member.id} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
            }}>
              <div
                onClick={() => setExpanded(isExpand ? null : member.id)}
                style={{
                  padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center',
                  cursor: 'pointer', flexWrap: 'wrap',
                }}
              >
                <Avatar initials={member.avatarInitials || member.name?.slice(0, 2).toUpperCase()} colour={meta?.colour || '#6b7280'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)' }}>{member.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{member.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <RoleBadge roleId={member.role} />
                  {member.isDemo && (
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700 }}>
                      DEMO
                    </span>
                  )}
                  <span style={{
                    fontSize: 9, padding: '1px 6px', borderRadius: 999, fontWeight: 700,
                    background: member.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                    color: member.status === 'active' ? '#10b981' : '#6b7280',
                    border: `1px solid ${member.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.25)'}`,
                  }}>
                    {member.status?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isExpand ? '▲' : '▼'}</span>
                </div>
              </div>
              {isExpand && (
                <div style={{ padding: '10px 14px 14px', borderTop: '1px solid var(--border-muted)', background: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <strong>Role:</strong> {meta?.label} — {meta?.description}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <strong>Assigned clients:</strong>{' '}
                    {member.assignedClientIds?.includes('all') ? 'All clients' : (member.assignedClientIds?.join(', ') || 'None assigned')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <strong>Joined:</strong>{' '}
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                    Role and client assignments require backend enforcement via Supabase Auth + RLS in a future run.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDemo && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Team invitations require a configured authentication provider and email service.
          This demo shows the role and permission structure only.
        </div>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION MATRIX TABLE
// ─────────────────────────────────────────────────────────────────────────────

const PERM_GROUPS = [
  { label: 'Dashboard',          perms: [PERM.VIEW_DASHBOARD] },
  { label: 'Clients',            perms: [PERM.VIEW_ALL_CLIENTS, PERM.VIEW_ASSIGNED_CLIENTS, PERM.CREATE_CLIENT, PERM.EDIT_CLIENT, PERM.ARCHIVE_CLIENT, PERM.DELETE_CLIENT] },
  { label: 'Reports',            perms: [PERM.VIEW_REPORTS, PERM.CREATE_REPORT, PERM.EXPORT_REPORT] },
  { label: 'Evidence',           perms: [PERM.VIEW_EVIDENCE, PERM.ADD_EVIDENCE, PERM.EDIT_EVIDENCE, PERM.DELETE_EVIDENCE] },
  { label: 'AI',                 perms: [PERM.VIEW_AI_NOTES, PERM.GENERATE_AI_GUIDANCE] },
  { label: 'Backend / System',   perms: [PERM.VIEW_BACKEND_SETTINGS, PERM.EDIT_BACKEND_SETTINGS, PERM.TEST_BACKEND_CONNECTION] },
  { label: 'Team',               perms: [PERM.MANAGE_TEAM, PERM.ASSIGN_ROLES] },
  { label: 'Mode / Audit',       perms: [PERM.TOGGLE_DEMO_LIVE, PERM.VIEW_AUDIT_TRAIL, PERM.VIEW_PORTFOLIO_ANALYTICS, PERM.MANAGE_WHITELABEL] },
];

const PERM_LABELS = {
  [PERM.VIEW_DASHBOARD]:           'View Dashboard',
  [PERM.VIEW_ALL_CLIENTS]:         'View All Clients',
  [PERM.VIEW_ASSIGNED_CLIENTS]:    'View Assigned Clients',
  [PERM.CREATE_CLIENT]:            'Create Client',
  [PERM.EDIT_CLIENT]:              'Edit Client',
  [PERM.ARCHIVE_CLIENT]:           'Archive Client',
  [PERM.DELETE_CLIENT]:            'Delete Client',
  [PERM.VIEW_REPORTS]:             'View Reports',
  [PERM.CREATE_REPORT]:            'Create Report',
  [PERM.EXPORT_REPORT]:            'Export Report',
  [PERM.VIEW_EVIDENCE]:            'View Evidence',
  [PERM.ADD_EVIDENCE]:             'Add Evidence',
  [PERM.EDIT_EVIDENCE]:            'Edit Evidence',
  [PERM.DELETE_EVIDENCE]:          'Delete Evidence',
  [PERM.VIEW_AI_NOTES]:            'View AI Notes',
  [PERM.GENERATE_AI_GUIDANCE]:     'Generate AI Guidance',
  [PERM.VIEW_BACKEND_SETTINGS]:    'View Backend Settings',
  [PERM.EDIT_BACKEND_SETTINGS]:    'Edit Backend Settings',
  [PERM.TEST_BACKEND_CONNECTION]:  'Test Backend Connection',
  [PERM.MANAGE_TEAM]:              'Manage Team',
  [PERM.ASSIGN_ROLES]:             'Assign Roles',
  [PERM.TOGGLE_DEMO_LIVE]:         'Toggle Demo/Live Mode',
  [PERM.VIEW_AUDIT_TRAIL]:         'View Audit Trail',
  [PERM.VIEW_PORTFOLIO_ANALYTICS]: 'Portfolio Analytics',
  [PERM.MANAGE_WHITELABEL]:        'Manage White Label',
};

const DISPLAY_ROLES = [ROLE.OWNER, ROLE.ADMIN, ROLE.CONSULTANT, ROLE.ANALYST, ROLE.CLIENT_VIEWER, ROLE.AUDITOR];

function PermissionMatrixSection({ activePreviewRole }) {
  const [showAll, setShowAll] = useState(false);
  const groups = showAll ? PERM_GROUPS : PERM_GROUPS.slice(0, 4);

  return (
    <SectionCard title="Permission Matrix" icon="🔐">
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
        Permissions shown below control UI access. Backend enforcement requires Supabase Auth + RLS policies (Run 26).
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 580 }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '7px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border-muted)', minWidth: 160, position: 'sticky', left: 0, background: 'var(--bg-tertiary)' }}>
                Permission
              </th>
              {DISPLAY_ROLES.map((roleId) => {
                const meta = ROLE_META[roleId];
                const isActive = roleId === activePreviewRole;
                return (
                  <th key={roleId} style={{
                    padding: '7px 6px', textAlign: 'center',
                    color: isActive ? meta.colour : 'var(--text-muted)',
                    fontWeight: 700, borderBottom: '1px solid var(--border-muted)',
                    fontSize: 10, whiteSpace: 'nowrap',
                    background: isActive ? meta.colour + '08' : 'var(--bg-tertiary)',
                  }}>
                    {meta.icon}<br />{meta.label.split('/')[0].trim()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groups.map(({ label, perms }) => (
              <React.Fragment key={label}>
                <tr>
                  <td colSpan={DISPLAY_ROLES.length + 1} style={{
                    padding: '5px 10px', fontSize: 9, fontWeight: 800,
                    color: 'var(--text-muted)', letterSpacing: '0.08em',
                    background: 'var(--bg-tertiary)', textTransform: 'uppercase',
                    borderTop: '1px solid var(--border-muted)',
                  }}>
                    {label}
                  </td>
                </tr>
                {perms.map((permId) => (
                  <tr key={permId} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                    <td style={{ padding: '5px 10px', color: 'var(--text-muted)', fontSize: 11, position: 'sticky', left: 0, background: 'var(--bg-secondary)' }}>
                      {PERM_LABELS[permId] || permId}
                    </td>
                    {DISPLAY_ROLES.map((roleId) => {
                      const ok = hasPermission(roleId, permId);
                      const isActive = roleId === activePreviewRole;
                      return (
                        <td key={roleId} style={{
                          textAlign: 'center', padding: '5px 6px',
                          background: isActive ? ROLE_META[roleId].colour + '06' : undefined,
                        }}>
                          <span style={{ fontSize: 13 }}>{ok ? '✅' : '—'}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && (
        <button onClick={() => setShowAll(true)} style={{
          marginTop: 10, fontSize: 11, color: 'var(--accent)', background: 'transparent',
          border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0,
        }}>
          Show all permissions ({PERM_GROUPS.slice(4).reduce((a, g) => a + g.perms.length, 0)} more)
        </button>
      )}
      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Role-based access in the interface helps guide users to the right areas of Quantum Compliance OS™.
        For live production use, access control must also be enforced by the backend using Supabase Auth,
        Row Level Security, database policies, and secure API rules.
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE AUTH READINESS
// ─────────────────────────────────────────────────────────────────────────────

function SupabaseAuthReadiness({ backendConfig, authConfig }) {
  const providers    = backendConfig?.providers || {};
  const supabase     = providers.supabase || {};
  const urlPresent   = !!(supabase.projectUrl);
  const keyPresent   = !!(supabase.anonPublicKey);
  const lastTest     = (backendConfig?.connectionTests || [])[0];
  const testPassed   = lastTest?.status === 'success' && lastTest?.providerId === 'supabase';
  const authEnabled  = authConfig?.supabaseAuthEnabled || false;

  const items = [
    { label: 'Supabase project URL present',                      done: urlPresent },
    { label: 'Supabase anon/public key present',                  done: keyPresent },
    { label: 'Connection test run and passed',                    done: testPassed,   note: testPassed ? '' : 'Run a connection test in Settings → Backend Config' },
    { label: 'Supabase Auth enabled in project settings',         done: authEnabled,  note: 'Enable in Supabase dashboard → Authentication → Providers' },
    { label: 'Auth provider configured (email/magic link)',       done: false,        note: 'Configure in Supabase dashboard → Authentication → Providers' },
    { label: 'user_profiles table exists',                        done: false,        note: 'Add via Run 26 SQL schema extension' },
    { label: 'team_roles table exists',                           done: false,        note: 'Add via Run 26 SQL schema extension' },
    { label: 'RLS policies on user tables',                       done: false,        note: 'RLS status not verifiable from frontend — must be confirmed in Supabase' },
    { label: 'Role assignment flow implemented',                  done: false,        note: 'Requires Run 26 backend + auth flow' },
    { label: 'Session handling implemented',                      done: false,        note: 'Supabase client SDK + session management in Run 26' },
  ];

  return (
    <SectionCard title="Supabase Auth Readiness" icon="⚡">
      <Banner type="warn">
        RLS status cannot be verified from the frontend. Confirm RLS is enabled
        in your Supabase project using the Supabase SQL editor and the
        SUPABASE_SETUP_RUN_15.sql file in the repository.
      </Banner>
      {items.map(({ label, done, note }) => (
        <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '5px 0', borderBottom: '1px solid var(--border-muted)' }}>
          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{done ? '✅' : '⬜'}</span>
          <div>
            <div style={{ fontSize: 11, color: done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{label}</div>
            {note && !done && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{note}</div>}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>Referenced SQL file:</strong> <code>SUPABASE_SETUP_RUN_15.sql</code> (repo root) —
        8 tables, 8 RLS enables, 32 policies using <code>owner_id = auth.uid()</code>.
        User profiles and team roles tables are pending Run 26.
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT TRAIL READINESS
// ─────────────────────────────────────────────────────────────────────────────

function AuditTrailSection({ isDemo, localAuditEvents }) {
  const events = localAuditEvents || [];

  return (
    <SectionCard title="Audit Trail Readiness" icon="📋">
      <Banner type="info">
        Real audit trail requires a connected backend. Local audit events are recorded
        for demo/preview purposes only. In live mode, audit logging requires
        an <code>audit_logs</code> backend table (Run 26).
      </Banner>

      {[
        { label: 'Local audit event model active',                 done: true,  note: 'buildAuditEvent() in authRoles.js' },
        { label: 'User sign-in events',                           done: false, note: 'Requires Supabase Auth — Run 26' },
        { label: 'Role change events',                            done: false, note: 'Backend-required — Run 26' },
        { label: 'Client assigned events',                        done: false, note: 'Backend-required — Run 26' },
        { label: 'Client created events',                         done: true,  note: 'Local event recorded on client creation' },
        { label: 'Report generated events',                       done: true,  note: 'Local event recorded on report generation' },
        { label: 'Evidence added events',                         done: false, note: 'Backend-required — Run 26' },
        { label: 'Backend config changed events',                 done: true,  note: 'Local event recorded on config change' },
        { label: 'Demo/live mode changed events',                 done: true,  note: 'Local event recorded on mode change' },
        { label: 'Export generated events',                       done: false, note: 'Backend-required — Run 26' },
        { label: 'audit_logs backend table',                      done: false, note: 'SQL schema extension in Run 26' },
      ].map(({ label, done, note }) => (
        <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '4px 0', borderBottom: '1px solid var(--border-muted)' }}>
          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{done ? '✅' : '⬜'}</span>
          <div>
            <div style={{ fontSize: 11, color: done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{label}</div>
            {note && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{note}</div>}
          </div>
        </div>
      ))}

      {isDemo && events.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Recent Local Events (Demo)</div>
          {events.slice(0, 5).map((e) => (
            <div key={e.id} style={{ padding: '5px 8px', marginBottom: 4, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent)' }}>{e.type}</span>
              <span>{new Date(e.timestamp).toLocaleString()}</span>
              {e.isDemo && <span style={{ color: '#f59e0b' }}>DEMO</span>}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE DESCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────

function RoleDefinitionsSection() {
  const [open, setOpen] = useState(null);
  return (
    <SectionCard title="Role Definitions" icon="🏷">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
        {ALL_ROLES.filter((r) => r.id !== ROLE.DEMO_USER).map((meta) => (
          <div key={meta.id}
            onClick={() => setOpen(open === meta.id ? null : meta.id)}
            style={{
              padding: '10px 14px', cursor: 'pointer',
              background: open === meta.id ? meta.colour + '0D' : 'var(--bg-secondary)',
              border: `1px solid ${open === meta.id ? meta.colour + '40' : 'var(--border-muted)'}`,
              borderLeft: `3px solid ${meta.colour}`,
              borderRadius: 'var(--radius-md)', transition: 'all 0.15s',
            }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{meta.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 12, color: meta.colour }}>{meta.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>{open === meta.id ? '▲' : '▼'}</span>
            </div>
            {open === meta.id && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 6 }}>
                {meta.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function TeamAccess({ workspaceMode }) {
  const [appState,   setAppState]   = useState(() => getState());
  const [msg,        setMsg]        = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const msgTimer = useRef(null);

  useEffect(() => {
    const unsub = subscribe((s) => setAppState(s));
    return unsub;
  }, []);

  function flash(text, ms = 3000) {
    setMsg(text);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(''), ms);
  }

  const wm       = workspaceMode || appState.settings?.workspaceMode || 'demo';
  const isDemo   = wm === WORKSPACE_MODE.DEMO;
  const authCfg  = getAuthConfig();
  const authState = computeAuthState(appState);
  const backendCfg = appState.backendConfig || null;

  const demoPreviewRole = authCfg?.demoPreviewRole || ROLE.OWNER;
  const activeRole      = isDemo ? demoPreviewRole : (authCfg?.activeRole || ROLE.OWNER);

  const teamMembers = isDemo
    ? DEMO_TEAM_MEMBERS
    : (authCfg?.teamMembers || []);

  const localAuditEvents = authCfg?.localAuditEvents || [];

  function handleDemoRoleSelect(roleId) {
    setDemoPreviewRole(roleId);
    flash(`Demo role preview set to: ${getRoleLabel(roleId)}`);
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, margin: '0 auto' }}>
      <PageHeader
        title="Team, Roles & Access"
        subtitle="Auth status, role model, permission matrix, team management, and Supabase Auth readiness"
        icon="👥"
      />

      {msg && (
        <div style={{
          padding: '8px 14px', marginBottom: 12, borderRadius: 'var(--radius-sm)',
          background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.25)',
          fontSize: 12, color: 'var(--text-secondary)',
        }}>
          {msg}
        </div>
      )}

      {isDemo && (
        <div style={{
          padding: '8px 14px', marginBottom: 14,
          background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)',
        }}>
          <strong style={{ color: '#f59e0b' }}>Demo Mode</strong> — Demo team and roles shown for presentation.
          Switch to Product Mode and connect Supabase Auth for real user management.
        </div>
      )}

      {/* Auth Status */}
      <AuthStatusSection
        authState={authState}
        authConfig={authCfg}
        workspaceMode={wm}
        backendConfig={backendCfg}
      />

      {/* Demo role switcher — demo mode only */}
      {isDemo && (
        <DemoRoleSwitcher
          demoPreviewRole={demoPreviewRole}
          onSelect={handleDemoRoleSelect}
        />
      )}

      {/* Team Members */}
      <TeamMembersSection
        members={teamMembers}
        isDemo={isDemo}
        onInvite={() => setShowInvite(true)}
      />

      {/* Role Definitions */}
      <RoleDefinitionsSection />

      {/* Permission Matrix */}
      <PermissionMatrixSection activePreviewRole={activeRole} />

      {/* Supabase Auth Readiness */}
      <SupabaseAuthReadiness backendConfig={backendCfg} authConfig={authCfg} />

      {/* Audit Trail Readiness */}
      <AuditTrailSection isDemo={isDemo} localAuditEvents={localAuditEvents} />

      {/* Disclaimer */}
      <div style={{
        padding: '12px 16px', marginTop: 8,
        background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius-md)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7,
      }}>
        <strong>Run 25 — Auth + Team Roles + Client Permissions Layer</strong><br />
        Frontend role checks guide UI navigation. Real production access control requires Supabase Auth,
        Row Level Security, database policies, and secure API rules — not yet implemented in this run.
        No real authentication SDK is connected. No backend-only secrets are stored in frontend config.
        Demo roles are for presentation only. No fake login success is claimed.
        User profiles and team roles tables are pending Run 26 SQL schema extension.
        Audit trail backend table is pending Run 26.
        AI guidance supports human review and does not replace legal, cybersecurity,
        compliance, or business professionals.<br /><br />
        <em>Powered by 4P3X Intelligent AI™ &middot; Created by Kyzel Kreates™</em>
      </div>
    </div>
  );
}
