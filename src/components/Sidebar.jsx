/**
 * QUANTUM COMPLIANCE OS™ — Sidebar.jsx
 * Run 26: Version string pulled from APP_VERSION constant. unsub2 ghost ref fixed.
 * Defensive use only.
 */
import React, { useState, useEffect } from 'react';
import '../styles/layout.css';
import { subscribeConsultant, getConsultantState } from '../core/consultantStorage.js';
import { getState, subscribe } from '../core/storage.js';
import { NAV_ITEMS, APP_VERSION } from '../core/constants.js';
import { ROLE, canAccessPage } from '../core/authRoles.js';
import { getAuthConfig } from '../core/storage.js';
import { WORKSPACE_MODE } from '../core/workspaceMode.js';

const NAV_GROUPS = [
  { key: 'main',        label: 'Overview'    },
  { key: 'assessments', label: 'Assessments' },
  { key: 'outputs',     label: 'Outputs'     },
  { key: 'system',      label: 'System'      },
];

export default function Sidebar({ currentPage, onNavigate, collapsed, branding, mobileOpen, onMobileClose }) {
  const [cs, setCs] = useState(() => getConsultantState());

  useEffect(() => {
    const unsub = subscribeConsultant((s) => setCs({ ...s }));
    return () => { unsub(); };
  }, []);

  const activeClient = cs.activeClientId
    ? cs.clients.find((c) => c.id === cs.activeClientId)
    : null;

  const logoText    = branding?.logoText    || 'QC-OS';
  const productName = branding?.productName || 'Quantum Compliance OS™';

  // Build CSS class string — collapsed on desktop, drawer open on mobile
  const sidebarClass = [
    'sidebar',
    collapsed   ? 'sidebar--collapsed'    : '',
    mobileOpen  ? 'sidebar--mobile-open'  : '',
  ].filter(Boolean).join(' ');

  const handleNavClick = (id) => {
    onNavigate(id);
    // Close mobile drawer after navigating
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      {/* Mobile overlay — tap to close drawer */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onMobileClose}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 105,
          }}
        />
      )}

      <aside className={sidebarClass} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar__logo">
          <div
            className="sidebar__logo-mark"
            style={branding?.accentColour ? {
              background:  `linear-gradient(135deg, ${branding.accentColour} 0%, #0066cc 100%)`,
              boxShadow:   `0 0 12px ${branding.accentColour}44`,
            } : {}}
            aria-hidden="true"
          >
            {logoText.slice(0, 3)}
          </div>
          {!collapsed && (
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-title">{productName}</span>
              <span className="sidebar__logo-sub">v{APP_VERSION} · Run 26</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group.key);
            if (items.length === 0) return null;
            return (
              <div key={group.key} className="sidebar__nav-group">
                {!collapsed && (
                  <div className="sidebar__nav-group-label">{group.label}</div>
                )}
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={`sidebar__nav-item${currentPage === item.id ? ' sidebar__nav-item--active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    title={collapsed ? item.label : item.description}
                    aria-current={currentPage === item.id ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    <span className="sidebar__nav-icon" aria-hidden="true">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="sidebar__nav-label">{item.label}</span>
                        {item.badge && (
                          <span className="sidebar__nav-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="sidebar__footer">
            {activeClient && (
              <div style={{
                padding: '6px 10px',
                marginBottom: '4px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                color: '#8b5cf6',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                🔵 {activeClient.name}
              </div>
            )}
            <div className="sidebar__version">QCOS v{APP_VERSION} · Local-First · Run 26</div>
          </div>
        )}
      </aside>
    </>
  );
}
