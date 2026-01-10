/**
 * KanaDojo Service Worker
 *
 * This service worker caches:
 * - Audio files for offline support and faster repeat access
 * - Translation API responses for offline translation
 * - Text analysis API responses
 * It uses cache-first strategy for audio, network-first for translations.
 */

const AUDIO_CACHE_NAME = 'audio-cache-v2';
const API_CACHE_NAME = 'kanadojo-api-v1';
const STATIC_CACHE_NAME = 'kanadojo-static-v1';

// Common translations for offline fallback
const OFFLINE_TRANSLATIONS = {
  'en:ja': {
    'hello': 'こんにちは',
    'thank you': 'ありがとう',
    'goodbye': 'さようなら',
    'yes': 'はい',
    'no': 'いいえ',
    'please': 'お願いします',
    'excuse me': 'すみません',
    'sorry': 'ごめんなさい',
    'good morning': 'おはようございます',
    'good night': 'おやすみなさい'
  },
  'ja:en': {
    'こんにちは': 'hello',
    'ありがとう': 'thank you',
    'さようなら': 'goodbye',
    'はい': 'yes',
    'いいえ': 'no',
    'お願いします': 'please',
    'すみません': 'excuse me',
    'ごめんなさい': 'sorry',
    'おはようございます': 'good morning',
    'おやすみなさい': 'good night'
  }
};

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
                (name.startsWith('audio-cache-') && name !== AUDIO_CACHE_NAME) ||
                (name.startsWith('kanadojo-api-') && name !== API_CACHE_NAME) ||
                (name.startsWith('kanadojo-static-') && name !== STATIC_CACHE_NAME)
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

// Fetch event - handle different types of requests
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // Handle translation API requests
  if (url.pathname === '/api/translate' && event.request.method === 'POST') {
    event.respondWith(handleTranslationRequest(event.request));
    return;
  }

  // Handle text analysis API requests
  if (url.pathname === '/api/analyze-text' && event.request.method === 'POST') {
    event.respondWith(handleAnalysisRequest(event.request));
    return;
  }

  // Handle audio file requests (cache-first strategy)
  if (url.pathname.startsWith('/sounds/')) {
    event.respondWith(
      caches.match(event.request).then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(function (networkResponse) {
            if (networkResponse.ok) {
              var responseClone = networkResponse.clone();
              caches.open(AUDIO_CACHE_NAME).then(function (cache) {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(function () {
            return new Response('Audio file not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
    );
    return;
  }

  // For all other requests, let the browser handle them normally
});

/**
 * Handle translation API requests with network-first, cache fallback
 */
function handleTranslationRequest(request) {
  return request.clone().text().then(function (bodyText) {
    var body = JSON.parse(bodyText);
    var cacheKey = body.sourceLanguage + ':' + body.targetLanguage + ':' + body.text.trim().toLowerCase();

    // Try network first
    return fetch(request)
      .then(function (response) {
        if (response.ok) {
          // Cache successful responses
          var responseClone = response.clone();
          responseClone.json().then(function (data) {
            var cacheResponse = new Response(JSON.stringify(data), {
              headers: { 'Content-Type': 'application/json' }
            });
            caches.open(API_CACHE_NAME).then(function (cache) {
              cache.put(cacheKey, cacheResponse);
            });
          });
        }
        return response;
      })
      .catch(function () {
        // Network failed, try cache
        return caches.open(API_CACHE_NAME).then(function (cache) {
          return cache.match(cacheKey).then(function (cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Check offline translations fallback
            var fallbackKey = body.sourceLanguage + ':' + body.targetLanguage;
            var fallbackDict = OFFLINE_TRANSLATIONS[fallbackKey];
            if (fallbackDict) {
              var searchText = body.text.trim().toLowerCase();
              var fallbackTranslation = fallbackDict[searchText];
              if (fallbackTranslation) {
                return new Response(JSON.stringify({
                  translatedText: fallbackTranslation,
                  cached: true,
                  offline: true
                }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            }

            // No cache available
            return new Response(JSON.stringify({
              code: 'OFFLINE',
              message: 'You are offline and this translation is not cached.',
              status: 0
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      });
  });
}

/**
 * Handle text analysis API requests with network-first, cache fallback
 */
function handleAnalysisRequest(request) {
  return request.clone().text().then(function (bodyText) {
    var body = JSON.parse(bodyText);
    var cacheKey = 'analyze:' + body.text;

    // Try network first
    return fetch(request)
      .then(function (response) {
        if (response.ok) {
          // Cache successful responses
          caches.open(API_CACHE_NAME).then(function (cache) {
            cache.put(cacheKey, response.clone());
          });
        }
        return response;
      })
      .catch(function () {
        // Network failed, try cache
        return caches.open(API_CACHE_NAME).then(function (cache) {
          return cache.match(cacheKey).then(function (cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }

            // No cache available
            return new Response(JSON.stringify({
              error: 'You are offline and this analysis is not cached.'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      });
  });
}

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
