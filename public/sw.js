/**
 * Audio Caching Service Worker
 *
 * This service worker caches audio files for offline support and faster repeat access.
 * It uses a cache-first strategy for audio files.
 */

const AUDIO_CACHE_NAME = 'audio-cache-v1';

// Audio files to precache (Opus format - widely supported)
// Note: mariah-carey.opus (2.9MB) is NOT pre-cached to reduce initial load
// It will be cached on-demand when the user selects the theme
const AUDIO_FILES = [
  '/sounds/correct.opus',
  '/sounds/long.opus',
  '/sounds/error/error1/error1_1.opus',
  '/sounds/click/click4/click4_11.opus',
  '/sounds/click/click4/click4_22.opus',
  '/sounds/click/click4/click4_33.opus',
  '/sounds/click/click4/click4_44.opus'
];

// Install event - precache audio files
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(AUDIO_CACHE_NAME).then(function (cache) {
      // Don't fail installation if some files are missing
      return Promise.allSettled(
        AUDIO_FILES.map(function (url) {
          return cache.add(url).catch(function (err) {
            console.warn('Failed to cache ' + url + ':', err);
          });
        })
      );
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (name) {
              return (
                name.startsWith('audio-cache-') && name !== AUDIO_CACHE_NAME
              );
            })
            .map(function (name) {
              return caches.delete(name);
            })
        );
      })
      .then(function () {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - cache-first strategy for audio files
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // Only handle audio file requests
  if (!url.pathname.startsWith('/sounds/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        // Return cached response
        return cachedResponse;
      }

      // Not in cache - fetch from network and cache it
      return fetch(event.request)
        .then(function (networkResponse) {
          // Only cache successful responses
          if (networkResponse.ok) {
            var responseClone = networkResponse.clone();
            caches.open(AUDIO_CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(function () {
          // Network failed and not in cache - return error
          return new Response('Audio file not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});

// Message event - handle cache updates
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    var url = event.data.url;
    if (url) {
      event.waitUntil(
        caches.open(AUDIO_CACHE_NAME).then(function (cache) {
          return cache.add(url);
        })
      );
    }
  }

  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    event.waitUntil(caches.delete(AUDIO_CACHE_NAME));
  }
});
