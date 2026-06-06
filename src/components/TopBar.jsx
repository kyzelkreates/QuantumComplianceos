/**
 * QUANTUM COMPLIANCE OS™ — TopBar.jsx
 * Run 8.5: Workspace mode badge (Demo / Product) added.
 * Shows current mode clearly so users always know which mode is active.
 */
import React, { useState, useEffect } from 'react';
import '../styles/layout.css';
import { NAV_ITEMS } from '../core/constants.js';
import { subscribeConsultant, getConsultantState } from '../core/consultantStorage.js';
import { WORKSPACE_MODE, MODE_META, clientIsDemo } from '../core/workspaceMode.js';

export default function TopBar({ currentPage, isDemoMode, workspaceMode, onToggleSidebar, branding, onNavigate }) {
  const [cs, setCs] = useState(() => getConsultantState());
  useEffect(() => {
    const unsub = subscribeConsultant((s) => setCs({ ...s }));
    return unsub;
  }, []);

  const activeClient  = cs.activeClientId ? cs.clients.find((c) => c.id === cs.activeClientId) : null;
  const navItem       = NAV_ITEMS.find((i) => i.id === currentPage);
  const pageLabel     = navItem?.label || 'Dashboard';
  const productName   = branding?.productName || 'Quantum Compliance OS™';

  // Derive current workspace mode — prefer explicit prop, fallback to legacy isDemoMode
  const currentMode   = workspaceMode || (isDemoMode ? WORKSPACE_MODE.DEMO : WORKSPACE_MODE.PRODUCT);
  const modeMeta      = MODE_META[currentMode] || MODE_META[WORKSPACE_MODE.DEMO];
  const isDemo        = currentMode === WORKSPACE_MODE.DEMO;

  // Is the active client a demo client?
  const activeClientIsDemo = activeClient ? clientIsDemo(activeClient) : false;

  return (
    <header className="topbar" role="banner">
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Toggle navigation"
        >
          ☰
        </button>
        <nav className="topbar__breadcrumb" aria-label="Breadcrumb">
          <span className="topbar__breadcrumb-item">{productName}</span>
          <span className="topbar__breadcrumb-sep" aria-hidden="true">›</span>
          <span className="topbar__breadcrumb-item topbar__breadcrumb-item--current">
            {pageLabel}
          </span>
        </nav>
      </div>

      <div className="topbar__right">
        {/* Active client pill */}
        {activeClient && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px',
            background: activeClientIsDemo ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)',
            border: `1px solid ${activeClientIsDemo ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.3)'}`,
            borderRadius: '999px', fontSize: '11px',
            color: activeClientIsDemo ? 'var(--warning)' : '#8b5cf6',
            fontWeight: 700, maxWidth: '180px', overflow: 'hidden',
          }}>
            {activeClientIsDemo ? '🎯' : '🔵'}{' '}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeClient.name}
            </span>
            {activeClientIsDemo && (
              <span style={{ fontSize: '9px', padding: '1px 5px', background: 'rgba(245,158,11,0.2)', borderRadius: '999px', flexShrink: 0 }}>DEMO</span>
            )}
          </div>
        )}

        {/* Workspace Mode badge — always visible, clickable → Settings */}
        <button
          onClick={() => onNavigate?.('settings')}
          title={`${modeMeta.label} — Click to change in Settings`}
          aria-label={`Workspace mode: ${modeMeta.label}. Click to go to Settings.`}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '3px 10px',
            background: modeMeta.bg, border: `1px solid ${modeMeta.border}`,
            borderRadius: '999px', fontSize: '11px', fontWeight: 700,
            color: modeMeta.colour, cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.75'}
          onMouseOut={(e)  => e.currentTarget.style.opacity = '1'}
        >
          {isDemo
            ? <><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--warning)', flexShrink: 0 }} aria-hidden="true" /> Demo Mode</>
            : <><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} aria-hidden="true" /> Product Mode</>
          }
        </button>
      </div>
    </header>
  );
}
