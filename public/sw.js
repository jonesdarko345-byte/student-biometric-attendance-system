// UENR Course Attendance & Timetable Service Worker
// Provides offline caching for poor or disconnected network conditions

const CACHE_NAME = 'uenr-timetable-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/uenr_logo.jpg',
  '/assets/uenr_campus.png'
];

// Install Event: Precache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching application shell for offline access');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Asset precache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name.startsWith('uenr-'))
          .map((name) => {
            console.log('[Service Worker] Removing old cache version:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first with fast fallback for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // Exclude Firebase Firestore API endpoints (handled by Firebase SDK offline persistence)
  if (
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('identitytoolkit.googleapis.com') ||
    request.url.includes('firebaseio.com')
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      // Race network with a 2500ms timeout to protect users on high-latency/choked connections
      Promise.race([
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 2500)
        )
      ]).catch(async () => {
        // Fallback to cached index page when offline or timed out
        console.log('[Service Worker] Network failed or timed out. Serving cached page.');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        return (await caches.match('/')) || (await caches.match('/index.html'));
      })
    );
    return;
  }

  // 2. Static Assets (Scripts, Styles, Fonts, Images)
  // Stale-While-Revalidate: Return cached version immediately, fetch updated copy in background
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and not in cache, fallback to nothing or placeholder
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
