/**
 * QUANTUM COMPLIANCE OS™ — Service Worker
 * Run 7: Hardened PWA app-shell cache strategy.
 * ================================================
 * LOCAL-FIRST OFFLINE BEHAVIOUR:
 *   - All app state is stored in localStorage (browser) — not in this cache.
 *   - The cache only stores static app-shell assets (JS, CSS, HTML).
 *   - Clearing the service worker cache does NOT delete user data or reports.
 *   - User data survives cache clears, SW updates, and reinstalls.
 *
 * STRATEGY:
 *   - Navigation requests: network-first → fallback to cached index.html (SPA shell)
 *   - JS/CSS assets: cache-first (immutable hashed filenames)
 *   - Everything else: network-first → runtime cache fallback
 *
 * NO sensitive data is cached here.
 * NO external requests are made by this service worker.
 * NO backend dependency.
 */

const SW_VERSION   = 'qcos-v7.0.0';
const SHELL_CACHE  = `${SW_VERSION}-shell`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;

// ─── Precache: minimal app shell ─────────────────────────────────────────────
// Only cache the root HTML and manifest — hashed JS/CSS assets are cached
// on first load via the runtime strategy below. This keeps the SW lightweight
// and avoids issues with stale precache lists after builds.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  // Install new SW immediately (don't wait for old pages to close)
  self.skipWaiting();

  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // addAll is atomic — if any fail, the whole install fails gracefully
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Non-fatal: SW still installs, just without precache
        console.warn('[QCOS SW] Precache failed (non-fatal):', err);
      });
    })
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.info('[QCOS SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Take control of all open pages immediately
      return self.clients.claim();
    })
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from this origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return; // Let browser handle non-GET and cross-origin requests normally
  }

  // ── Navigation (HTML page requests) ── network-first, fallback to shell
  // This ensures the SPA always loads even when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Update shell cache with fresh response
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve cached SPA shell
          return caches.match('/index.html').then((cached) => {
            if (cached) return cached;
            // If even the cache is empty, return a minimal offline page
            return new Response(
              '<!DOCTYPE html><html><body style="font-family:monospace;background:#0d1117;color:#e6edf3;padding:2rem;text-align:center"><h2>⬡ Quantum Compliance OS™</h2><p>You are offline. Please reconnect to load the app.</p><p style="color:#6e7681;font-size:12px">All your local data is safe — it is stored in your browser\'s localStorage and has not been affected.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // ── Hashed static assets (JS, CSS) ── cache-first (immutable)
  // Vite outputs content-hashed filenames — safe to cache aggressively.
  if (url.pathname.startsWith('/assets/') &&
      url.pathname.match(/\.(js|css|woff2?|ttf|eot)(\?.*)?$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Images & icons ── cache-first
  if (url.pathname.match(/\.(png|svg|ico|jpg|jpeg|gif|webp)(\?.*)?$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // ── Default: network-first, runtime cache fallback ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ─── Message Handler ──────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Manual skip-waiting (e.g. "Update App" button)
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Version check
  if (event.data.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: SW_VERSION });
    }
  }

  // Manual cache clear (Settings → "Clear Cache")
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n)))).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
});
