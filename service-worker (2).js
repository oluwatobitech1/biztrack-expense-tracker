/**
 * service-worker.js
 * A minimal service worker whose main job is to make BizTrack
 * installable (browsers require an active service worker with a
 * fetch handler before they'll offer the install prompt). As a
 * bonus it caches the app shell so the app still loads offline.
 *
 * IMPORTANT: this uses a NETWORK-FIRST strategy. Earlier this was
 * cache-first with a cache name that never changed between deploys —
 * that meant returning visitors could get stuck on old, stale JS/HTML
 * forever (e.g. an old dashboard.js paired with a new login.js,
 * disagreeing about how login sessions work). Network-first fixes
 * that: online visitors always get the latest deployed files, and the
 * cache is only used as a fallback when there's no network.
 */

const CACHE_NAME = 'biztrack-shell-v2';

const APP_SHELL = [
  'index.html',
  'login.html',
  'signup.html',
  'setup.html',
  'dashboard.html',
  'transactions.html',
  'add-transaction.html',
  'reports.html',
  'settings.html',
  'recover.html',
  'terms.html',
  'privacy.html',
  'style.css',
  'animations.css',
  'app.js',
  'storage.js',
  'i18n.js',
  'legal-i18n.js',
  'animate.js',
  'assistant.js',
  'install.js',
  'login.js',
  'signup.js',
  'setup.js',
  'dashboard.js',
  'transactions.js',
  'transaction-form.js',
  'reports.js',
  'settings.js',
  'recover.js',
  'manifest.json',
  'logo-mark.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/favicon-16.png',
  'icons/favicon-32.png',
  'icons/favicon-48.png',
  'icons/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first for everything: try the network so visitors always get
// the latest deployed code, cache whatever comes back for offline use,
// and only fall back to the cache if the network request fails.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
