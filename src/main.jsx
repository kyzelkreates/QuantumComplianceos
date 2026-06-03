/**
 * QUANTUM COMPLIANCE OS™ — main.jsx
 * Run 7: Hardened entry point with safe SW registration and update notification.
 *
 * ARCHITECTURE:
 *   - All app state lives in browser localStorage via storage.js (SSOT).
 *   - No backend. No Supabase. No external APIs. No accounts.
 *   - Service worker provides app-shell caching for offline use only.
 *   - SW cache stores static assets only — NOT user data or reports.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// CSS import order: global variables first, then layout, then components
import './styles/global.css';
import './styles/layout.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/cards.css';
import './styles/navigation.css';
import './styles/dashboard.css';
import './styles/responsive.css';

// ─── Initialise storage (loads or creates localStorage state) ─────────────────
import { loadState } from './core/storage.js';
loadState();

// ─── Mount React ──────────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[QCOS] Root element #root not found in index.html');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ─── Service Worker Registration ──────────────────────────────────────────────
// Non-critical: app works fully without SW (offline just degrades gracefully).
// SW only caches static assets — never stores report data or localStorage.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        // Dev info only — remove noise from production console
        if (import.meta.env.DEV) {
          console.info('[QCOS] Service worker registered. Scope:', registration.scope);
        }

        // Listen for SW updates — show a non-intrusive refresh prompt
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New version available — show a subtle banner
              _showUpdateBanner(registration);
            }
          });
        });
      })
      .catch((err) => {
        // SW failure is non-critical — app still works without it
        if (import.meta.env.DEV) {
          console.warn('[QCOS] Service worker registration failed (non-critical):', err);
        }
      });

    // Listen for SW controller change (after skipWaiting)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Only reload if the user approved via the banner
      if (window.__qcos_sw_update_approved) {
        window.location.reload();
      }
    });
  });
}

/**
 * Show a subtle, dismissible update notification banner.
 * Appears at the bottom of the screen — not a blocking modal.
 * User can dismiss or click to reload.
 */
function _showUpdateBanner(registration) {
  // Don't show if already showing
  if (document.getElementById('qcos-update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'qcos-update-banner';
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-live', 'polite');
  banner.style.cssText = [
    'position:fixed',
    'bottom:20px',
    'left:50%',
    'transform:translateX(-50%)',
    'background:#1c2128',
    'border:1px solid #30363d',
    'border-radius:10px',
    'padding:12px 20px',
    'display:flex',
    'gap:12px',
    'align-items:center',
    'box-shadow:0 8px 24px rgba(0,0,0,0.5)',
    'z-index:9999',
    'font-family:system-ui,sans-serif',
    'font-size:13px',
    'color:#e6edf3',
    'max-width:90vw',
  ].join(';');

  banner.innerHTML = `
    <span style="color:#00d4ff;font-size:16px">↻</span>
    <span>A new version of Quantum Compliance OS is available.</span>
    <button id="qcos-update-reload" style="background:#00d4ff;color:#0d1117;border:none;border-radius:6px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0">Reload</button>
    <button id="qcos-update-dismiss" style="background:transparent;color:#6e7681;border:none;padding:5px;cursor:pointer;font-size:16px;line-height:1;flex-shrink:0" aria-label="Dismiss">✕</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('qcos-update-reload').addEventListener('click', () => {
    window.__qcos_sw_update_approved = true;
    // Tell the waiting SW to take control
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    banner.remove();
  });

  document.getElementById('qcos-update-dismiss').addEventListener('click', () => {
    banner.remove();
  });

  // Auto-dismiss after 30 seconds
  setTimeout(() => { if (banner.isConnected) banner.remove(); }, 30000);
}
