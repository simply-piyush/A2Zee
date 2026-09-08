/**
 * A2Zee Progressive Web App - Service Worker
 * 
 * Safety & Security Principles:
 * 1. ZERO caching of API responses or private authenticated data.
 * 2. All /api/*, /auth/*, and non-GET requests bypass the service worker entirely.
 * 3. Page navigations use Network-First with /offline.html fallback when disconnected.
 * 4. Static immutable assets (_next/static, icons, images) use Cache-First/Stale-While-Revalidate.
 */

const CACHE_NAME = 'a2zee-pwa-v1';

// Precache only core public assets & offline fallback
const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[PWA SW] Deleting outdated cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only process same-origin or CDN font requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 2. NEVER intercept non-GET requests (mutations, actions, posts)
  if (request.method !== 'GET') {
    return;
  }

  // 3. NEVER cache or intercept API endpoints or Authentication routes
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth')) {
    return;
  }

  // 4. HTML Page Navigations: Network-First with Offline Fallback
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If server returns a valid page, return it directly
          return response;
        })
        .catch(async () => {
          // If network failed (user offline), serve cached offline fallback
          const cache = await caches.open(CACHE_NAME);
          const cachedFallback = await cache.match('/offline.html');
          return cachedFallback || new Response('You are offline. Please connect to internet.', {
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // 5. Static Assets (Next.js chunks, images, icons, fonts): Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 6. Default: Direct network pass-through
});
