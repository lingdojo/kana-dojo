import type {
  Language,
  TranslationAPIResponse,
  TranslationAPIError
} from '../types';

// Client-side cache to reduce API calls
const clientCache = new Map<
  string,
  { response: TranslationAPIResponse; timestamp: number }
>();
const CLIENT_CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const MAX_CLIENT_CACHE_SIZE = 100;

// Request deduplication: track in-flight requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<TranslationAPIResponse>>();

function getClientCacheKey(
  text: string,
  source: Language,
  target: Language
): string {
  return `${source}:${target}:${text.trim()}`;
}

function cleanupClientCache() {
  if (clientCache.size > MAX_CLIENT_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, value] of clientCache) {
      if (now - value.timestamp > CLIENT_CACHE_TTL) {
        clientCache.delete(key);
      }
    }
  }
}

/**
 * Error codes returned by the translation API
 */
export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  RATE_LIMIT: 'RATE_LIMIT',
  API_ERROR: 'API_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  OFFLINE: 'OFFLINE'
} as const;

/**
 * User-friendly error messages for each error code
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.INVALID_INPUT]: 'Please enter valid text to translate.',
  [ERROR_CODES.RATE_LIMIT]:
    'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.API_ERROR]: 'Translation service is temporarily unavailable.',
  [ERROR_CODES.AUTH_ERROR]: 'Translation service configuration error.',
  [ERROR_CODES.NETWORK_ERROR]:
    'Unable to connect. Please check your internet connection.',
  [ERROR_CODES.OFFLINE]:
    'You are offline. Please check your internet connection.'
};

/**
 * Get a user-friendly error message from an error code
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.API_ERROR];
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true; // Assume online in SSR
  }
  return navigator.onLine;
}

/**
 * Translate text between English and Japanese
 * @param text The text to translate
 * @param sourceLanguage The source language ('en' or 'ja')
 * @param targetLanguage The target language ('en' or 'ja')
 * @returns Promise resolving to the translation response
 * @throws TranslationAPIError on failure
 */
export async function translate(
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language
): Promise<TranslationAPIResponse> {
  // Check if offline
  if (!isOnline()) {
    const error: TranslationAPIError = {
      code: ERROR_CODES.OFFLINE,
      message: getErrorMessage(ERROR_CODES.OFFLINE),
      status: 0
    };
    throw error;
  }

  // Validate input before making request
  if (!text || text.trim().length === 0) {
    const error: TranslationAPIError = {
      code: ERROR_CODES.INVALID_INPUT,
      message: 'Please enter text to translate.',
      status: 400
    };
    throw error;
  }

  if (text.length > 5000) {
    const error: TranslationAPIError = {
      code: ERROR_CODES.INVALID_INPUT,
      message: 'Text exceeds maximum length of 5000 characters.',
      status: 400
    };
    throw error;
  }

  // Check client-side cache first
  const cacheKey = getClientCacheKey(text, sourceLanguage, targetLanguage);
  const cached = clientCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.response;
  }

  // Request deduplication: if there's already a pending request for this text,
  // wait for it instead of making a duplicate API call
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  // Create the actual request and track it
  const requestPromise = (async (): Promise<TranslationAPIResponse> => {
    try {
      const fetchResponse = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage
      })
    });

    const data = await fetchResponse.json();

    // Handle error responses
    if (!fetchResponse.ok) {
      const error: TranslationAPIError = {
        code: data.code || ERROR_CODES.API_ERROR,
        message: data.message || getErrorMessage(data.code),
        status: fetchResponse.status
      };
      throw error;
    }

    const translationResult = data as TranslationAPIResponse;

    // Cache successful response
    clientCache.set(cacheKey, {
      response: translationResult,
      timestamp: Date.now()
    });
    cleanupClientCache();

    return translationResult;
  } catch (error) {
    // Re-throw if it's already a TranslationAPIError
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error &&
      'status' in error
    ) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      const apiError: TranslationAPIError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: getErrorMessage(ERROR_CODES.NETWORK_ERROR),
        status: 0
      };
      throw apiError;
    }

    // Handle other errors
    const apiError: TranslationAPIError = {
      code: ERROR_CODES.API_ERROR,
      message: getErrorMessage(ERROR_CODES.API_ERROR),
      status: 500
    };
    throw apiError;
    }
  })();

  // Track this request so duplicate calls can wait for it
  pendingRequests.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    // Clean up pending request tracking
    pendingRequests.delete(cacheKey);
  }
}
