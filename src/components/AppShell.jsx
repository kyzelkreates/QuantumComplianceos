/**
 * QUANTUM COMPLIANCE OS™ — AppShell.jsx
 * Run 8.5: workspaceMode threaded through TopBar and all pages.
 * Local-first. No backend. No external calls. Defensive use only.
 */
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/layout.css';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { getState, subscribe, getWorkspaceMode } from '../core/storage.js';
import { PAGES } from '../core/constants.js';
import { isDemoMode as checkDemoMode } from '../core/workspaceMode.js';

// Pages
import Dashboard          from '../pages/Dashboard.jsx';
import OrganisationProfile from '../pages/OrganisationProfile.jsx';
import SystemInventory    from '../pages/SystemInventory.jsx';
import SecurityAssessment from '../pages/SecurityAssessment.jsx';
import QuantumReadiness   from '../pages/QuantumReadiness.jsx';
import Recommendations    from '../pages/Recommendations.jsx';
import Reports            from '../pages/Reports.jsx';
import EvidencePack       from '../pages/EvidencePack.jsx';
import Settings           from '../pages/Settings.jsx';
import ConsultantDashboard from '../pages/ConsultantDashboard.jsx';
import About              from '../pages/About.jsx';
import DeploymentReadiness from '../pages/DeploymentReadiness.jsx';
import ConsultantCopilot  from '../pages/ConsultantCopilot.jsx';
import TargetAssessments  from '../pages/TargetAssessments.jsx';
import ClientHub          from '../pages/ClientHub.jsx';
import AgencySettings     from '../pages/AgencySettings.jsx';
import ProductModeSettings from '../pages/ProductModeSettings.jsx';

function renderPage(page, onNavigate, onClientSwitch, workspaceMode) {
  const modeProps = { workspaceMode, onNavigate };
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
    default:                        return <Dashboard           {...modeProps} />;
  }
}

export default function AppShell({ activeClientId, onClientSwitch }) {
  const [currentPage,      setCurrentPage]      = useState(PAGES.DASHBOARD);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [appState,         setAppState]          = useState(() => getState());

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

  // Workspace mode — derived from settings.workspaceMode (Run 8.5) with legacy fallback
  const workspaceMode = settings?.workspaceMode || (clientMode?.isDemoMode ? 'demo' : 'product');

  useEffect(() => {
    if (branding?.accentColour) {
      document.documentElement.style.setProperty('--accent', branding.accentColour);
      document.documentElement.style.setProperty('--accent-dim', `${branding.accentColour}26`);
      document.documentElement.style.setProperty('--accent-glow', `${branding.accentColour}40`);
    }
  }, [branding?.accentColour]);

  return (
    <div className="app-shell">
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
          {renderPage(currentPage, handleNavigate, onClientSwitch, workspaceMode)}
        </main>
      </div>
    </div>
  );
}
