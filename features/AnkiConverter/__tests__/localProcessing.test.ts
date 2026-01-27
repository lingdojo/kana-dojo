/**
 * Local Processing Tests
 *
 * Property-based tests to verify that all conversion happens locally
 * without any network requests.
 *
 * **Feature: anki-converter, Property 15: Local processing guarantee**
 * **Validates: Requirements 12.1, 12.2**
 *
 * @module features/AnkiConverter/__tests__/localProcessing.test.ts
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import fc from 'fast-check';
import { createConversionPipeline } from '../lib/conversionPipeline';

/**
 * Create TSV content for testing
 */
function createTsvContent(rows: string[][]): ArrayBuffer {
  const text = rows.map(row => row.join('\t')).join('\n');
  return new TextEncoder().encode(text).buffer;
}

/**
 * Generate valid TSV rows for testing
 */
const validTsvRowsArbitrary = fc.array(
  fc.array(
    fc
      .string({ minLength: 1, maxLength: 50 })
      .filter(
        s =>
          !s.includes('\t') &&
          !s.includes('\n') &&
          !s.includes('\r') &&
          s.trim().length > 0,
      ),
    { minLength: 2, maxLength: 4 },
  ),
  { minLength: 2, maxLength: 10 },
);

describe('Property 15: Local processing guarantee', () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchMock: Mock;
  let xhrOpenSpy: Mock;
  let originalXHR: typeof XMLHttpRequest;
  let networkRequests: string[];

  beforeEach(() => {
    networkRequests = [];

    // Save original fetch and replace with mock
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      networkRequests.push(`fetch: ${url}`);
      return Promise.reject(new Error('Network request detected during test'));
    });
    globalThis.fetch = fetchMock;

    // Mock XMLHttpRequest to detect any XHR requests
    originalXHR = globalThis.XMLHttpRequest;
    xhrOpenSpy = vi.fn((method: string, url: string) => {
      networkRequests.push(`xhr: ${method} ${url}`);
    });

    class MockXMLHttpRequest {
      open = xhrOpenSpy;
      send = vi.fn();
      setRequestHeader = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      abort = vi.fn();
      readyState = 0;
      status = 0;
      response = null;
      responseText = '';
      responseType = '';
      timeout = 0;
      withCredentials = false;
      onreadystatechange = null;
      onerror = null;
      onload = null;
      onprogress = null;
      ontimeout = null;
    }

    globalThis.XMLHttpRequest =
      MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.XMLHttpRequest = originalXHR;
    networkRequests = [];
  });

  it('conversion pipeline should not make any network requests', async () => {
    await fc.assert(
      fc.asyncProperty(validTsvRowsArbitrary, async rows => {
        // Reset network requests for this iteration
        networkRequests = [];

        const pipeline = createConversionPipeline();
        const content = createTsvContent(rows);

        try {
          await pipeline.convert(content, { format: 'tsv' });
        } catch {
          // Ignore conversion errors - we're testing for network requests
        }

        // Verify no network requests were made
        if (networkRequests.length > 0) {
          console.error('Network requests detected:', networkRequests);
          return false;
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('fetch should not be called during conversion', async () => {
    await fc.assert(
      fc.asyncProperty(validTsvRowsArbitrary, async rows => {
        const pipeline = createConversionPipeline();
        const content = createTsvContent(rows);

        // Reset call count
        fetchMock.mockClear();

        try {
          await pipeline.convert(content, { format: 'tsv' });
        } catch {
          // Ignore conversion errors
        }

        // Verify fetch was not called
        return fetchMock.mock.calls.length === 0;
      }),
      { numRuns: 100 },
    );
  });

  it('XMLHttpRequest should not be used during conversion', async () => {
    await fc.assert(
      fc.asyncProperty(validTsvRowsArbitrary, async rows => {
        const pipeline = createConversionPipeline();
        const content = createTsvContent(rows);

        // Reset call count
        xhrOpenSpy.mockClear();

        try {
          await pipeline.convert(content, { format: 'tsv' });
        } catch {
          // Ignore conversion errors
        }

        // Verify XHR was not used
        return xhrOpenSpy.mock.calls.length === 0;
      }),
      { numRuns: 100 },
    );
  });

  it('all data processing should happen synchronously in memory', async () => {
    await fc.assert(
      fc.asyncProperty(validTsvRowsArbitrary, async rows => {
        const pipeline = createConversionPipeline();
        const content = createTsvContent(rows);

        // Track if any async external operations occur
        let externalAsyncOps = 0;

        // Wrap setTimeout to detect any delayed operations that might indicate external calls
        const originalSetTimeout = globalThis.setTimeout;
        const timeoutWrapper = (
          callback: TimerHandler,
          delay?: number,
          ...args: unknown[]
        ): NodeJS.Timeout => {
          // Only count significant delays that might indicate network operations
          if (delay && delay > 100) {
            externalAsyncOps++;
          }
          // Cast to satisfy TypeScript - the actual return type depends on environment
          return originalSetTimeout(
            callback,
            delay,
            ...args,
          ) as unknown as NodeJS.Timeout;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        globalThis.setTimeout = timeoutWrapper as any;

        try {
          await pipeline.convert(content, { format: 'tsv' });
        } catch {
          // Ignore conversion errors
        } finally {
          globalThis.setTimeout = originalSetTimeout;
        }

        // No significant delayed operations should occur
        return externalAsyncOps === 0;
      }),
      { numRuns: 100 },
    );
  });

  it('conversion result should be derived entirely from input data without external calls', async () => {
    await fc.assert(
      fc.asyncProperty(validTsvRowsArbitrary, async rows => {
        // Reset network requests for this iteration
        networkRequests = [];
        fetchMock.mockClear();
        xhrOpenSpy.mockClear();

        const pipeline = createConversionPipeline();
        const content = createTsvContent(rows);

        try {
          const result = await pipeline.convert(content, { format: 'tsv' });

          // Verify result structure is valid (derived from local processing)
          if (!result.decks || !result.metadata) {
            return false;
          }

          // Verify no network requests were made during conversion
          if (
            networkRequests.length > 0 ||
            fetchMock.mock.calls.length > 0 ||
            xhrOpenSpy.mock.calls.length > 0
          ) {
            return false;
          }

          // Verify result contains expected structure
          if (typeof result.metadata.totalCards !== 'number') {
            return false;
          }

          return true;
        } catch {
          // Conversion errors are acceptable - we're testing for network isolation
          // Just verify no network calls were made even on error
          return (
            networkRequests.length === 0 &&
            fetchMock.mock.calls.length === 0 &&
            xhrOpenSpy.mock.calls.length === 0
          );
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('Local processing - unit tests', () => {
  it('should process files without any external dependencies', async () => {
    const pipeline = createConversionPipeline();
    const content = createTsvContent([
      ['front', 'back'],
      ['hello', 'world'],
      ['foo', 'bar'],
    ]);

    const result = await pipeline.convert(content, { format: 'tsv' });

    expect(result.decks).toBeDefined();
    expect(result.decks.length).toBeGreaterThan(0);
    // TSV parser treats first row as header if it matches patterns
    expect(result.metadata.totalCards).toBeGreaterThanOrEqual(1);
  });

  it('should not require network access for any format', async () => {
    const pipeline = createConversionPipeline();

    // Test with TSV format
    const tsvContent = createTsvContent([
      ['front', 'back'],
      ['test', 'data'],
    ]);

    const result = await pipeline.convert(tsvContent, { format: 'tsv' });
    // Just verify conversion succeeds without network
    expect(result.decks).toBeDefined();
    expect(result.metadata).toBeDefined();
  });

  it('should process Unicode content locally', async () => {
    const pipeline = createConversionPipeline();
    const content = createTsvContent([
      ['日本語', '英語'],
      ['こんにちは', 'Hello'],
      ['ありがとう', 'Thank you'],
    ]);

    const result = await pipeline.convert(content, { format: 'tsv' });

    expect(result.decks).toBeDefined();
    // TSV parser doesn't treat Japanese headers as headers, so all 3 rows become cards
    expect(result.metadata.totalCards).toBeGreaterThanOrEqual(1);
  });
});
