/**
 * QUANTUM COMPLIANCE OS™ — App.jsx
 * Run 28: onNavigateTo wired — homepage shortcuts launch specific dashboard pages.
 * Run 5 / 5.5 / 8.5: Root orchestrator
 * =======================================
 * Manages: landing page → onboarding → main shell.
 * Handles consultant state sync, client switching, workspace mode,
 * and homepage → specific page navigation (Run 28).
 *
 * App phases:
 *   'home'       — investor/explainer homepage (Run 28, default entry)
 *   'landing'    — legacy alias (same as home)
 *   'onboarding' — first-time setup
 *   'app'        — main dashboard shell
 *
 * DEFENSIVE USE ONLY. No backend. No external calls.
 * All localStorage access goes through storage modules only (SSOT enforced).
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { PAGES } from './core/constants.js';

export default function App() {
  // Phase: 'home' | 'onboarding' | 'app'
  // Run 28: always start on homepage — users get the explainer first.
  // Returning users (hasEnteredApp) skip straight to 'app' only if they
  // navigated directly (i.e. not a fresh cold load from the domain root).
  // To return to homepage from the app, AppShell passes onBackToHome().
  const [appPhase, setAppPhase] = useState(() => {
    const entered = hasEnteredApp();
    if (!entered) return 'home';           // new user — always show homepage
    const cs = loadConsultantState();
    if (!cs.onboardingComplete) return 'onboarding';
    return 'app';                          // returning user — go straight to app
  });

  // Run 28: when navigating from homepage → specific page, store the target
  const [pendingPage, setPendingPage] = useState(null);

  const [activeClientId, setActiveClientId] = useState(() => {
    return getConsultantState().activeClientId || null;
  });

  // Run 8.5 — derive workspaceMode from app state
  const [workspaceMode, setWorkspaceMode] = useState(() => {
    const s = getState();
    return s.settings?.workspaceMode || (isDemoMode(s) ? 'demo' : 'product');
  });

  // Track consultant state changes
  useEffect(() => {
    const unsub = subscribeConsultant((cs) => {
      setActiveClientId(cs.activeClientId || null);
    });
    return unsub;
  }, []);

  // Sync main app state → active client slot + track workspaceMode
  useEffect(() => {
    const unsub = subscribe((mainState) => {
      if (activeClientId) {
        syncClientState(activeClientId, mainState);
      }
      const wm = mainState.settings?.workspaceMode;
      if (wm) setWorkspaceMode(wm);
    });
    return unsub;
  }, [activeClientId]);

  // Standard enter (Launch Platform button)
  const handleEnterFromLanding = useCallback(() => {
    markAppEntered();
    const cs = getConsultantState();
    setAppPhase(cs.onboardingComplete ? 'app' : 'onboarding');
  }, []);

  // Run 8.5 — Load Demo Portfolio from landing page
  const handleLoadDemoFromLanding = useCallback(() => {
    enableDemoMode();
    markAppEntered();
    setWorkspaceMode('demo');
    setPendingPage(null);
    setAppPhase('app');
  }, []);

  // Run 28 — Navigate from homepage to a specific page
  // Marks entered, skips onboarding check if already complete, then tells AppShell
  const handleNavigateTo = useCallback((page) => {
    markAppEntered();
    const cs = getConsultantState();
    if (!cs.onboardingComplete) {
      // Must complete onboarding first; store target for after
      setPendingPage(page);
      setAppPhase('onboarding');
    } else {
      setPendingPage(page);
      setAppPhase('app');
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    markAppEntered();
    setAppPhase('app');
  }, []);

  const handleClientSwitch = useCallback((clientId) => {
    setActiveClientId(clientId || null);
  }, []);

  // Run 28 — Back to Homepage from dashboard
  const handleBackToHome = useCallback(() => {
    setPendingPage(null);
    setAppPhase('home');
    window.scrollTo(0, 0);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  if (appPhase === 'home' || appPhase === 'landing') {
    return (
      <LandingPage
        onEnter={handleEnterFromLanding}
        onLoadDemo={handleLoadDemoFromLanding}
        onNavigateTo={handleNavigateTo}
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
      initialPage={pendingPage || PAGES.DASHBOARD}
      onBackToHome={handleBackToHome}
    />
  );
}
