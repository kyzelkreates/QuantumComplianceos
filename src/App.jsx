/**
 * QUANTUM COMPLIANCE OS™ — App.jsx
 * Run 5 / 5.5 / 8.5: Root orchestrator
 * =======================================
 * Manages: landing page → onboarding → main shell.
 * Handles consultant state sync, client switching, and workspace mode.
 *
 * DEFENSIVE USE ONLY. No backend. No external calls.
 * All localStorage access goes through storage modules only (SSOT enforced).
 *
 * Run 8.5 additions:
 *   - workspaceMode derived from app state and passed to AppShell
 *   - enableDemoMode wired to LandingPage "Load Demo Portfolio" CTA
 *   - handleLoadDemoFromLanding — enables demo mode and skips onboarding
 */

import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Onboarding from './pages/Onboarding.jsx';
import {
  loadConsultantState,
  getConsultantState,
  subscribeConsultant,
  syncClientState,
  hasEnteredApp,
  markAppEntered,
} from './core/consultantStorage.js';
import { subscribe, getState, enableDemoMode } from './core/storage.js';
import { isDemoMode } from './core/workspaceMode.js';

export default function App() {
  const [appPhase, setAppPhase] = useState(() => {
    // All localStorage access delegated to consultantStorage helpers — SSOT
    const entered = hasEnteredApp();
    const cs = loadConsultantState();
    if (!entered) return 'landing';
    if (!cs.onboardingComplete) return 'onboarding';
    return 'app';
  });

  const [activeClientId, setActiveClientId] = useState(() => {
    return getConsultantState().activeClientId || null;
  });

  // Run 8.5 — derive workspaceMode from app state
  const [workspaceMode, setWorkspaceMode] = useState(() => {
    const s = getState();
    return s.settings?.workspaceMode || (isDemoMode(s) ? 'demo' : 'product');
  });

  // Track consultant state changes (client switches, onboarding completion etc.)
  useEffect(() => {
    const unsub = subscribeConsultant((cs) => {
      setActiveClientId(cs.activeClientId || null);
    });
    return unsub;
  }, []);

  // Sync main app state → active client's dedicated localStorage slot on every change
  // Run 8.5 — also track workspaceMode changes
  useEffect(() => {
    const unsub = subscribe((mainState) => {
      // Sync client state
      if (activeClientId) {
        syncClientState(activeClientId, mainState);
      }
      // Update workspaceMode from settings
      const wm = mainState.settings?.workspaceMode;
      if (wm) setWorkspaceMode(wm);
    });
    return unsub;
  }, [activeClientId]);

  const handleEnterFromLanding = () => {
    markAppEntered(); // via consultantStorage — zero raw localStorage in App.jsx
    const cs = getConsultantState();
    setAppPhase(cs.onboardingComplete ? 'app' : 'onboarding');
  };

  // Run 8.5 — Load Demo Portfolio from landing page
  // Enables demo mode (loads 5 fictional SME clients) and skips straight to app
  const handleLoadDemoFromLanding = () => {
    enableDemoMode();
    markAppEntered();
    setWorkspaceMode('demo');
    setAppPhase('app');
  };

  const handleOnboardingComplete = () => {
    markAppEntered();
    setAppPhase('app');
  };

  const handleClientSwitch = (clientId) => {
    setActiveClientId(clientId || null);
  };

  if (appPhase === 'landing') {
    return (
      <LandingPage
        onEnter={handleEnterFromLanding}
        onLoadDemo={handleLoadDemoFromLanding}
      />
    );
  }

  if (appPhase === 'onboarding') {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        workspaceMode={workspaceMode}
      />
    );
  }

  return (
    <AppShell
      activeClientId={activeClientId}
      onClientSwitch={handleClientSwitch}
      workspaceMode={workspaceMode}
    />
  );
}
