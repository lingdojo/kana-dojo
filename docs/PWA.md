# PWA Configuration Guide

This document describes KanaDojo's Progressive Web App (PWA) configuration and service worker implementation.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Service Worker](#service-worker)
- [Caching Strategy](#caching-strategy)
- [Offline Support](#offline-support)
- [PWA Manifest](#pwa-manifest)
- [Enhancements](#enhancements)

---

## Overview

KanaDojo is configured as a Progressive Web App (PWA) with:

- **Offline support**: Audio files and translations cached for offline use
- **Fast loading**: Service worker caches assets and API responses
- **Installable**: Can be installed as an app on mobile and desktop

---

## Service Worker

### Location

The service worker is located at `public/sw.js`.

### Features

- **Audio caching**: Caches sound effects for instant playback
- **Translation caching**: Caches API responses for offline translation
- **Text analysis caching**: Caches analysis results
- **Offline fallback**: Provides basic translations when offline

### Cache Names

| Cache                | Purpose       | Version |
| -------------------- | ------------- | ------- |
| `audio-cache-v2`     | Audio files   | v2      |
| `kanadojo-api-v1`    | API responses | v1      |
| `kanadojo-static-v1` | Static assets | v1      |

---

## Caching Strategy

### Audio Files (Cache-First)

```
Request → Cache → Return cached response
                → If miss: Fetch → Cache → Return network response
```

**Rationale**: Audio files don't change often, so cache-first provides fastest playback.

### API Requests (Network-First)

```
Request → Network → If success: Cache → Return response
                        → If fail: Check cache → Return cached or error
```

**Rationale**: Translations may update, so we prefer fresh data but fall back to cache.

---

## Offline Support

### Basic Offline Translations

The service worker includes a built-in dictionary of common translations:

```javascript
const OFFLINE_TRANSLATIONS = {
  'en:ja': {
    hello: 'こんにちは',
    'thank you': 'ありがとう',
    goodbye: 'さようなら'
    // ... more phrases
  },
  'ja:en': {
    こんにちは: 'hello',
    ありがとう: 'thank you',
    さようなら: 'goodbye'
    // ... more phrases
  }
};
```

### Offline Behavior

| Scenario                                        | Behavior                 |
| ----------------------------------------------- | ------------------------ |
| Translation cached                              | Returns cached response  |
| Translation not cached, offline fallback exists | Returns offline fallback |
| No cache or fallback                            | Returns 503 error        |
| Audio file cached                               | Returns cached audio     |
| Audio file not cached, offline                  | Returns 503 error        |

---

## PWA Manifest

### Location

`public/manifest.json`

### Current Configuration

```json
{
  "name": "KanaDojo",
  "short_name": "KanaDojo",
  "description": "Learn Japanese with gamified training",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Recommended Enhancements

Add these to `manifest.json`:

```json
{
  "categories": ["education", "games"],
  "orientation": "portrait-primary",
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Practice Kana",
      "short_name": "Kana",
      "description": "Start a Kana practice session",
      "url": "/kana",
      "icons": [{ "src": "/icons/kana.png", "sizes": "192x192" }]
    },
    {
      "name": "Practice Kanji",
      "short_name": "Kanji",
      "description": "Start a Kanji practice session",
      "url": "/kanji",
      "icons": [{ "src": "/icons/kanji.png", "sizes": "192x192" }]
    }
  ]
}
```

---

## Enhancements

### 1. Add Static Asset Caching

Update `public/sw.js` to cache static assets:

```javascript
// Add after API_CACHE_NAME
const STATIC_CACHE_NAME = 'kanadojo-static-v1';

// Add to fetch handler
if (isStaticAsset(url.pathname)) {
  event.respondWith(cacheFirst(event.request, STATIC_CACHE_NAME));
}
```

### 2. Add Background Sync

For offline translation queue:

```javascript
self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-translations') {
    event.waitUntil(syncPendingTranslations());
  }
});
```

### 3. Add Push Notifications

```javascript
// Request permission
Notification.requestPermission();

// Handle push
self.addEventListener('push', function (event) {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png'
  });
});
```

### 4. Add Web App Installation Prompt

In a client component:

```typescript
'use client';

import { useEffect, useState } from 'react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null;

  return (
    <button onClick={handleInstall}>
      Install KanaDojo App
    </button>
  );
}
```

### 5. Add Share Target

For sharing content to KanaDojo:

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

---

## Testing PWA

### Chrome DevTools

1. Open DevTools → Application tab
2. Check Service Workers status
3. Test offline mode
4. Check cache storage

### Lighthouse Audit

Run Lighthouse PWA audit:

```bash
npm run build
npm run start
# Open http://localhost:3000
# Run Lighthouse audit
```

### PWA Testing Tools

- [PWABuilder](https://www.pwabuilder.com/)
- [PWA Audit](https://www.pwa-audit.com/)

---

## Troubleshooting

### Service Worker Not Registering

1. Check browser console for errors
2. Verify `sw.js` is served correctly
3. Ensure HTTPS or localhost

### Cache Not Working

1. Check cache name matches
2. Verify response is OK (status 200)
3. Check for CORS issues

### Installation Prompt Not Showing

1. Check manifest.json is valid
2. Verify icons are accessible
3. Ensure user hasn't dismissed prompt

---

## Related Documentation

- [Performance](./PERFORMANCE_OPTIMIZATIONS.md)
- [Architecture](./ARCHITECTURE.md)

---

**Last Updated**: January 2025
