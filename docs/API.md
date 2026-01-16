# API Routes Documentation

This document describes the API endpoints in KanaDojo.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Endpoints](#endpoints)
  - [POST /api/analyze-text](#post-apianalyze-text)
  - [GET /api/og](#get-apiog)
  - [POST /api/translate](#post-apitranslate)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Security](#security)

---

## Overview

KanaDojo provides serverless API endpoints for:

- **Text Analysis**: Japanese text tokenization using Kuromoji
- **OG Images**: Dynamic social card generation
- **Translation**: English/Japanese translation using Google Cloud Translation API

All endpoints run on **Vercel Edge** for low latency.

---

## Endpoints

### POST /api/analyze-text

Analyzes Japanese text using Kuromoji to extract word-by-word information.

**Endpoint**: `POST /api/analyze-text`

**Content-Type**: `application/json`

**Request Body**:

```typescript
{
  text: string; // Japanese text to analyze (max 5000 chars)
}
```

**Response** (200 OK):

```typescript
{
  tokens: AnalyzedToken[];
  cached?: boolean;  // true if served from cache
}

interface AnalyzedToken {
  surface: string;       // The displayed text
  reading?: string;      // Hiragana reading
  basicForm?: string;    // Dictionary form
  pos: string;           // Part of speech tag
  posDetail: string;     // Detailed POS info
  translation?: string;  // English meaning (if available)
}
```

**Example Request**:

```bash
curl -X POST https://kanadojo.com/api/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text": "こんにちは"}'
```

**Example Response**:

```json
{
  "tokens": [
    {
      "surface": "こんにちは",
      "reading": "こんにちは",
      "basicForm": "こんにちは",
      "pos": "Interjection",
      "posDetail": "No additional info"
    }
  ]
}
```

**Errors**:

- `400`: Missing or invalid text
- `429`: Rate limit exceeded
- `500`: Analysis failed

---

### GET /api/og

Generates Open Graph social card images.

**Endpoint**: `GET /api/og`

**Query Parameters**:

| Parameter     | Type   | Default                 | Description                                                         |
| ------------- | ------ | ----------------------- | ------------------------------------------------------------------- |
| `title`       | string | `KanaDojo`              | Title text                                                          |
| `description` | string | `Learn Japanese Online` | Description text                                                    |
| `type`        | string | `default`               | Gradient theme: `default`, `kana`, `kanji`, `vocabulary`, `academy` |

**Response**: PNG image (1200x630)

**Example**:

```
https://kanadojo.com/api/og?title=Learn%20Hiragana&type=kana
```

**Caching**:

- CDN: 24 hours
- Stale-while-revalidate: 7 days

---

### POST /api/translate

Translates text between English and Japanese using Google Cloud Translation API.

**Endpoint**: `POST /api/translate`

**Content-Type**: `application/json`

**Request Body**:

```typescript
{
  text: string; // Text to translate (max 5000 chars)
  sourceLanguage: 'en' | 'ja'; // Source language code
  targetLanguage: 'en' | 'ja'; // Target language code
}
```

**Response** (200 OK):

```typescript
{
  translatedText: string;           // Translated text
  detectedSourceLanguage?: string;  // Detected source language (when ambiguous)
  romanization?: string;            // Romaji for Japanese text
  cached?: boolean;                 // true if served from cache
}
```

**Example Request**:

```bash
curl -X POST https://kanadojo.com/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "sourceLanguage": "en", "targetLanguage": "ja"}'
```

**Example Response**:

```json
{
  "translatedText": "こんにちは",
  "romanization": "konnichiwa"
}
```

**Errors**:

- `400`: Invalid input or language selection
- `401/403`: API authentication error
- `429`: Rate limit exceeded
- `500/503`: Service unavailable

---

## Rate Limiting

All API endpoints use rate limiting to prevent abuse.

### Limits

| Endpoint            | Requests/Day | Requests/Hour | Global Limit    |
| ------------------- | ------------ | ------------- | --------------- |
| `/api/analyze-text` | 1000         | 100           | 1000 concurrent |
| `/api/translate`    | 500          | 50            | 500 concurrent  |

### Rate Limit Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limited Response (429)

```json
{
  "error": "Too many requests. Please wait 60 seconds.",
  "code": "RATE_LIMIT",
  "retryAfter": 60
}
```

---

## Error Handling

### Error Response Format

```typescript
{
  error: string;      // Human-readable error message
  code: string;       // Error code for programmatic handling
  status: number;     // HTTP status code
  retryAfter?: number; // Seconds until retry (429 responses)
}
```

### Error Codes

| Code            | Status  | Description                     |
| --------------- | ------- | ------------------------------- |
| `INVALID_INPUT` | 400     | Missing or invalid request body |
| `RATE_LIMIT`    | 429     | Too many requests               |
| `AUTH_ERROR`    | 401/403 | API authentication failed       |
| `API_ERROR`     | 500     | External API error              |
| `NETWORK_ERROR` | 503     | Network connectivity issue      |

---

## Security

### Rate Limiting

All endpoints implement rate limiting per client IP.

### Input Validation

All inputs are validated:

- Required fields checked
- String length limits enforced
- Language codes validated

### Caching

Translation and analysis results are cached to reduce API calls:

- Cache TTL: 1 hour
- Maximum cache size: 500 entries
- LRU eviction when cache is full

### Environment Variables

Required secrets (set in Vercel):

| Variable                   | Description                      |
| -------------------------- | -------------------------------- |
| `GOOGLE_TRANSLATE_API_KEY` | Google Cloud Translation API key |

**Note**: This key is stored securely in Vercel and never exposed to the client.

---

## Related Documentation

- [Vercel Deployment](./VERCEL_DEPLOYMENT.md)
- [Architecture](./ARCHITECTURE.md)

---

**Last Updated**: January 2025
