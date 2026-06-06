/**
 * QUANTUM COMPLIANCE OS™ — AppShell.jsx
 * Run 27: Role gate wired — canAccessPage() active for restricted pages.
 * Run 8.5: workspaceMode threaded through TopBar and all pages.
 * Local-first. No backend. No external calls. Defensive use only.
 *
 * SECURITY POSITION:
 * Interface role checks guide the user experience.
 * Production access control must be enforced by backend authentication,
 * Row Level Security, database policies, and secure API rules.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/layout.css';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { getState, subscribe } from '../core/storage.js';
import { PAGES } from '../core/constants.js';
import { ROLE, canAccessPage, PAGE_PERMISSIONS, PERMISSION_MATRIX } from '../core/authRoles.js';
import { getAuthConfig } from '../core/storage.js';

// Pages
import Dashboard              from '../pages/Dashboard.jsx';
import OrganisationProfile    from '../pages/OrganisationProfile.jsx';
import SystemInventory        from '../pages/SystemInventory.jsx';
import SecurityAssessment     from '../pages/SecurityAssessment.jsx';
import QuantumReadiness       from '../pages/QuantumReadiness.jsx';
import Recommendations        from '../pages/Recommendations.jsx';
import Reports                from '../pages/Reports.jsx';
import EvidencePack           from '../pages/EvidencePack.jsx';
import Settings               from '../pages/Settings.jsx';
import ConsultantDashboard    from '../pages/ConsultantDashboard.jsx';
import About                  from '../pages/About.jsx';
import DeploymentReadiness    from '../pages/DeploymentReadiness.jsx';
import ConsultantCopilot      from '../pages/ConsultantCopilot.jsx';
import TargetAssessments      from '../pages/TargetAssessments.jsx';
import ClientHub              from '../pages/ClientHub.jsx';
import AgencySettings         from '../pages/AgencySettings.jsx';
import ProductModeSettings    from '../pages/ProductModeSettings.jsx';
import BackendConnectorSettings from '../pages/BackendConnectorSettings.jsx';
import AISettings             from '../pages/AISettings.jsx';
import BackendConfiguration   from '../pages/BackendConfiguration.jsx';
import TeamAccess             from '../pages/TeamAccess.jsx';

// ─── Access Restricted fallback ──────────────────────────────────────────────

function AccessRestricted({ requiredPerm, onNavigate }) {
  // Resolve human-readable permission label from the matrix
  const permLabel = requiredPerm && PERMISSION_MATRIX?.[requiredPerm]?.label
    ? PERMISSION_MATRIX[requiredPerm].label
    : requiredPerm;

  return (
    <div style={{ padding: '48px 32px', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⛔</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>
        Access Restricted
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.7 }}>
        Your current role does not have permission to access this area.
        {permLabel && (
          <><br />Required permission: <code style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{permLabel}</code></>
        )}
      </div>
      <div style={{
        padding: '10px 14px', marginBottom: 20,
        background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7,
      }}>
        Interface role checks guide the user experience. Production access control must be
        enforced by backend authentication, Row Level Security, database policies, and secure
        API rules.
      </div>
      <button
        onClick={() => onNavigate && onNavigate(PAGES.DASHBOARD)}
        aria-label="Return to Dashboard"
        style={{
          padding: '7px 18px', fontSize: 12, fontWeight: 700,
          background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
          border: '1px solid var(--border-muted)', borderRadius: 8, cursor: 'pointer',
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

// ─── Page renderer with role gating ─────────────────────────────────────────

function renderPage(page, onNavigate, onClientSwitch, workspaceMode, activeRole) {
  const modeProps = { workspaceMode, onNavigate };

  // Role gate — only applies to pages listed in PAGE_PERMISSIONS.
  // In demo mode we always allow so the demo tour is unrestricted.
  const isDemo = workspaceMode === 'demo';
  if (!isDemo && !canAccessPage(activeRole, page)) {
    const requiredPerm = PAGE_PERMISSIONS[page];
    return <AccessRestricted requiredPerm={requiredPerm} onNavigate={onNavigate} />;
  }

  switch (page) {
    case PAGES.DASHBOARD:           return <Dashboard           {...modeProps} />;
    case PAGES.ORGANISATION:        return <OrganisationProfile workspaceMode={workspaceMode} />;
    case PAGES.SYSTEM_INVENTORY:    return <SystemInventory     workspaceMode={workspaceMode} />;
    case PAGES.SECURITY_ASSESSMENT: return <SecurityAssessment  workspaceMode={workspaceMode} />;
    case PAGES.QUANTUM_READINESS:   return <QuantumReadiness    workspaceMode={workspaceMode} />;
    case PAGES.RECOMMENDATIONS:     return <Recommendations     {...modeProps} />;
    case PAGES.REPORTS:             return <Reports             {...modeProps} />;
    case PAGES.EVIDENCE_PACK:       return <EvidencePack        workspaceMode={workspaceMode} onNavigate={onNavigate} />;
    case PAGES.CONSULTANT:          return <ConsultantDashboard {...modeProps} onClientSwitch={onClientSwitch} />;
    case PAGES.SETTINGS:            return <Settings            onNavigate={onNavigate} workspaceMode={workspaceMode} />;
    case PAGES.ABOUT:               return <About               />;
    case PAGES.DEPLOYMENT:          return <DeploymentReadiness onNavigate={onNavigate} />;
    case PAGES.COPILOT:             return <ConsultantCopilot   {...modeProps} />;
    case PAGES.TARGET_ASSESSMENTS:  return <TargetAssessments   {...modeProps} />;
    case PAGES.CLIENT_HUB:          return <ClientHub           {...modeProps} onNavigate={onNavigate} />;
    case PAGES.AGENCY_SETTINGS:     return <AgencySettings      {...modeProps} />;
    case PAGES.PRODUCT_MODE:        return <ProductModeSettings {...modeProps} />;
    case PAGES.BACKEND_CONNECTORS:  return <BackendConnectorSettings />;
    case PAGES.AI_SETTINGS:         return <AISettings />;
    case PAGES.BACKEND_CONFIG:      return <BackendConfiguration />;
    case PAGES.TEAM_ACCESS:         return <TeamAccess workspaceMode={workspaceMode} />;
    default:                        return <Dashboard {...modeProps} />;
  }
}

// ─── AppShell ────────────────────────────────────────────────────────────────

export default function AppShell({ onClientSwitch }) {
  const [currentPage,       setCurrentPage]      = useState(PAGES.DASHBOARD);
  const [sidebarCollapsed,  setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [appState,          setAppState]          = useState(() => getState());

  useEffect(() => {
    const unsub = subscribe((state) => setAppState({ ...state }));
    return unsub;
  }, []);

  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }, []);

  const { branding, clientMode, settings } = appState;

  // Workspace mode — single source of truth via storage.js
  const workspaceMode = settings?.workspaceMode || (clientMode?.isDemoMode ? 'demo' : 'product');

  // Active role — demo preview role in demo mode, real role in product mode
  const authCfg    = getAuthConfig();
  const activeRole = workspaceMode === 'demo'
    ? (authCfg?.demoPreviewRole || ROLE.OWNER)
    : (authCfg?.activeRole      || ROLE.OWNER);

  // Apply custom accent colour from branding settings
  useEffect(() => {
    if (branding?.accentColour) {
      document.documentElement.style.setProperty('--accent',      branding.accentColour);
      document.documentElement.style.setProperty('--accent-dim',  `${branding.accentColour}26`);
      document.documentElement.style.setProperty('--accent-glow', `${branding.accentColour}40`);
    }
  }, [branding?.accentColour]);

  return (
    <div className="app-shell">
      {/* Mobile sidebar overlay */}
      <div
        className={`sidebar-overlay${mobileSidebarOpen ? ' sidebar-overlay--active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        branding={branding}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        workspaceMode={workspaceMode}
        activeRole={activeRole}
      />

      <div className={`main-content${sidebarCollapsed ? ' main-content--sidebar-collapsed' : ''}`}>
        <TopBar
          currentPage={currentPage}
          isDemoMode={clientMode?.isDemoMode}
          workspaceMode={workspaceMode}
          onToggleSidebar={handleToggleSidebar}
          onNavigate={handleNavigate}
          branding={branding}
        />
        <main className="page-content" id="main-content" tabIndex={-1}>
          {renderPage(currentPage, handleNavigate, onClientSwitch, workspaceMode, activeRole)}
        </main>
      </div>
    </div>
  );
}
