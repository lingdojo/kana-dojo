/**
 * KanaDojo's bounded offline cache. Audio uses a byte-budgeted LRU; API
 * responses are limited by age and count. Neither cache is permanent storage.
 */
const AUDIO_CACHE_NAME = 'audio-cache-v4';
const API_CACHE_NAME = 'kanadojo-api-v2';
const STATIC_CACHE_NAME = 'kanadojo-static-v1';
const AUDIO_METADATA_DB = 'kanadojo-sw-cache-metadata-v1';
const AUDIO_METADATA_STORE = 'audio-entries';
const MAX_AUDIO_CACHE_BYTES = 40 * 1024 * 1024;
const MAX_API_CACHE_ENTRIES = 100;
const API_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const OFFLINE_TRANSLATIONS = {
  'en:ja': { hello: 'こんにちは', 'thank you': 'ありがとう', goodbye: 'さようなら', yes: 'はい', no: 'いいえ', please: 'お願いします', 'excuse me': 'すみません', sorry: 'ごめんなさい', 'good morning': 'おはようございます', 'good night': 'おやすみなさい' },
  'ja:en': { こんにちは: 'hello', ありがとう: 'thank you', さようなら: 'goodbye', はい: 'yes', いいえ: 'no', お願いします: 'please', すみません: 'excuse me', ごめんなさい: 'sorry', おはようございます: 'good morning', おやすみなさい: 'good night' },
};

const AUDIO_FILES = [
  '/sounds/correct.opus',
  '/sounds/long.opus',
  '/sounds/error/error1/error1_1.opus',
  '/sounds/monkeytype-pack/nk-creams/click4_11.opus',
  '/sounds/monkeytype-pack/nk-creams/click4_22.opus',
  '/sounds/monkeytype-pack/nk-creams/click4_33.opus',
  '/sounds/monkeytype-pack/nk-creams/click4_44.opus',
];

let cacheWriteQueue = Promise.resolve();
function enqueueCacheWrite(task) {
  const next = cacheWriteQueue.then(task);
  cacheWriteQueue = next.catch(function () {});
  return next;
}

function getSameOriginAudioUrl(input) {
  const url = new URL(typeof input === 'string' ? input : input.url, self.location.origin);
  return url.origin === self.location.origin && url.pathname.startsWith('/sounds/') ? url : null;
}

function openMetadataDb() {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(AUDIO_METADATA_DB, 1);
    request.onupgradeneeded = function () {
      if (!request.result.objectStoreNames.contains(AUDIO_METADATA_STORE)) {
        request.result.createObjectStore(AUDIO_METADATA_STORE, { keyPath: 'url' });
      }
    };
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
  });
}

async function withMetadataStore(mode, operation) {
  const db = await openMetadataDb();
  try {
    return await new Promise(function (resolve, reject) {
      const transaction = db.transaction(AUDIO_METADATA_STORE, mode);
      const store = transaction.objectStore(AUDIO_METADATA_STORE);
      let result;
      transaction.oncomplete = function () { resolve(result); };
      transaction.onerror = function () { reject(transaction.error); };
      transaction.onabort = function () { reject(transaction.error); };
      result = operation(store);
    });
  } finally { db.close(); }
}

function requestResult(request) {
  return new Promise(function (resolve, reject) {
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
  });
}
function getAudioEntries() { return withMetadataStore('readonly', function (store) { return requestResult(store.getAll()); }); }
function putAudioEntry(entry) { return withMetadataStore('readwrite', function (store) { return requestResult(store.put(entry)); }); }
function deleteAudioEntry(url) { return withMetadataStore('readwrite', function (store) { return requestResult(store.delete(url)); }); }
function clearAudioEntries() { return withMetadataStore('readwrite', function (store) { return requestResult(store.clear()); }); }

async function responseSize(response) {
  const contentLength = Number(response.headers.get('content-length'));
  return Number.isFinite(contentLength) && contentLength >= 0 ? contentLength : (await response.clone().blob()).size;
}

async function pruneAudioCache() {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const entries = await getAudioEntries();
  let total = entries.reduce(function (sum, entry) { return sum + entry.size; }, 0);
  const evictable = entries.filter(function (entry) { return !entry.pinned; }).sort(function (a, b) { return a.lastUsedAt - b.lastUsedAt; });
  for (const entry of evictable) {
    if (total <= MAX_AUDIO_CACHE_BYTES) break;
    await cache.delete(entry.url);
    await deleteAudioEntry(entry.url);
    total -= entry.size;
  }
}

async function cacheAudioResponse(request, response, pinned) {
  const url = getSameOriginAudioUrl(request);
  if (!url || !response.ok) return;
  const size = await responseSize(response);
  if (!pinned && size > MAX_AUDIO_CACHE_BYTES) return;
  const cache = await caches.open(AUDIO_CACHE_NAME);
  await cache.put(request, response.clone());
  await putAudioEntry({ url: url.href, size: size, lastUsedAt: Date.now(), pinned: Boolean(pinned) });
  await pruneAudioCache();
}

async function cacheAudioUrl(url) {
  const audioUrl = getSameOriginAudioUrl(url);
  if (!audioUrl) return;
  const request = new Request(audioUrl.href);
  await cacheAudioResponse(request, await fetch(request), false);
}

async function touchAudioEntry(request) {
  const url = getSameOriginAudioUrl(request);
  if (!url) return;
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const response = await cache.match(request);
  if (!response) return;
  const prior = (await getAudioEntries()).find(function (entry) { return entry.url === url.href; });
  await putAudioEntry({ url: url.href, size: prior ? prior.size : await responseSize(response), lastUsedAt: Date.now(), pinned: prior ? prior.pinned : false });
}

async function cacheRequest(category, normalizedBody) {
  const bytes = new TextEncoder().encode(normalizedBody);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest)).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
  return new Request(new URL('/__kanadojo-offline-cache/' + category + '/' + hash, self.location.origin).href);
}

async function pruneApiCache() {
  const cache = await caches.open(API_CACHE_NAME);
  const keys = await cache.keys();
  const now = Date.now();
  const entries = await Promise.all(keys.map(async function (request) {
    const response = await cache.match(request);
    return { request: request, cachedAt: Number(response && response.headers.get('x-kanadojo-cached-at')) || 0 };
  }));
  const fresh = [];
  await Promise.all(entries.map(function (entry) {
    if (!entry.cachedAt || now - entry.cachedAt > API_CACHE_TTL_MS) return cache.delete(entry.request);
    fresh.push(entry);
  }));
  fresh.sort(function (a, b) { return a.cachedAt - b.cachedAt; });
  await Promise.all(fresh.slice(0, Math.max(0, fresh.length - MAX_API_CACHE_ENTRIES)).map(function (entry) { return cache.delete(entry.request); }));
}

async function cacheApiResponse(category, normalizedBody, response) {
  if (!response.ok) return;
  const request = await cacheRequest(category, normalizedBody);
  const data = await response.clone().json();
  const cacheResponse = new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'X-KanaDojo-Cached-At': String(Date.now()), 'X-KanaDojo-Cache-Category': category } });
  const cache = await caches.open(API_CACHE_NAME);
  await cache.put(request, cacheResponse);
  await pruneApiCache();
}

async function freshCachedApiResponse(category, normalizedBody) {
  const request = await cacheRequest(category, normalizedBody);
  const cache = await caches.open(API_CACHE_NAME);
  const response = await cache.match(request);
  if (!response) return null;
  const cachedAt = Number(response.headers.get('x-kanadojo-cached-at'));
  if (!cachedAt || Date.now() - cachedAt > API_CACHE_TTL_MS) { await cache.delete(request); return null; }
  return response;
}

self.addEventListener('install', function (event) {
  event.waitUntil(Promise.allSettled(AUDIO_FILES.map(function (url) {
    return enqueueCacheWrite(async function () {
      const request = new Request(new URL(url, self.location.origin).href);
      await cacheAudioResponse(request, await fetch(request), true);
    });
  })).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (name) {
      return (name.startsWith('audio-cache-') && name !== AUDIO_CACHE_NAME) || (name.startsWith('kanadojo-api-') && name !== API_CACHE_NAME) || (name.startsWith('kanadojo-static-') && name !== STATIC_CACHE_NAME);
    }).map(function (name) { return caches.delete(name); }));
  }).then(function () {
    return enqueueCacheWrite(async function () { await pruneAudioCache(); await pruneApiCache(); });
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/api/translate' && event.request.method === 'POST') { event.respondWith(handleTranslationRequest(event.request, event)); return; }
  if (url.pathname === '/api/analyze-text' && event.request.method === 'POST') { event.respondWith(handleAnalysisRequest(event.request, event)); return; }
  if (event.request.method === 'GET' && url.pathname.startsWith('/sounds/')) event.respondWith(handleAudioRequest(event.request, event));
});

async function handleAudioRequest(request, event) {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) { event.waitUntil(enqueueCacheWrite(function () { return touchAudioEntry(request); })); return cached; }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseForCache = response.clone();
      event.waitUntil(enqueueCacheWrite(function () { return cacheAudioResponse(request, responseForCache, false); }));
    }
    return response;
  } catch (_) { return new Response('Audio file not available offline', { status: 503, statusText: 'Service Unavailable' }); }
}

async function handleTranslationRequest(request, event) {
  const body = await request.clone().json();
  const normalized = [body.sourceLanguage, body.targetLanguage, String(body.text || '').trim().toLowerCase()].join(':');
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseForCache = response.clone();
      event.waitUntil(enqueueCacheWrite(function () { return cacheApiResponse('translate', normalized, responseForCache); }));
    }
    return response;
  } catch (_) {
    const cached = await freshCachedApiResponse('translate', normalized);
    if (cached) return cached;
    const fallback = OFFLINE_TRANSLATIONS[body.sourceLanguage + ':' + body.targetLanguage];
    const translatedText = fallback && fallback[String(body.text || '').trim().toLowerCase()];
    if (translatedText) return new Response(JSON.stringify({ translatedText: translatedText, cached: true, offline: true }), { headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ code: 'OFFLINE', message: 'You are offline and this translation is not cached.', status: 0 }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

async function handleAnalysisRequest(request, event) {
  const body = await request.clone().json();
  const normalized = String(body.text || '');
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseForCache = response.clone();
      event.waitUntil(enqueueCacheWrite(function () { return cacheApiResponse('analyze', normalized, responseForCache); }));
    }
    return response;
  } catch (_) {
    const cached = await freshCachedApiResponse('analyze', normalized);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'You are offline and this analysis is not cached.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'CACHE_AUDIO' && typeof event.data.url === 'string') event.waitUntil(enqueueCacheWrite(function () { return cacheAudioUrl(event.data.url); }));
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') event.waitUntil(enqueueCacheWrite(async function () { await caches.delete(AUDIO_CACHE_NAME); await clearAudioEntries(); }));
});
