import { NextRequest, NextResponse } from 'next/server';

/**
 * IndexNow API Route
 * Instantly notifies Bing, Yandex, and other search engines of content updates
 * https://www.indexnow.org/
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';
const SITE_URL = 'https://kanadojo.com';
const SITE_HOSTNAME = 'kanadojo.com';
const MAX_URLS_PER_SUBMISSION = 10000;

function isValidIndexNowUrl(candidate: unknown): candidate is string {
  if (typeof candidate !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(candidate);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === SITE_HOSTNAME &&
      parsed.port === '' &&
      parsed.username === '' &&
      parsed.password === ''
    );
  } catch {
    return false;
  }
}

// IndexNow endpoints (Bing, Yandex, Seznam.cz, Naver, etc. all support it)
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

interface IndexNowSubmission {
  url?: string;
  urls?: string[];
}

/**
 * Submit URLs to IndexNow for instant indexing
 * POST /api/indexnow with { url: "..." } or { urls: ["...", "..."] }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key is configured
    if (!INDEXNOW_KEY) {
      return NextResponse.json(
        { error: 'IndexNow key not configured' },
        { status: 500 },
      );
    }

    const body: unknown = await request.json();
    const { url, urls } =
      body && typeof body === 'object' ? (body as IndexNowSubmission) : {};

    // Collect URLs to submit
    const urlList: unknown[] = [];
    if (url !== undefined) urlList.push(url);
    if (Array.isArray(urls)) urlList.push(...urls);

    if (urlList.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided. Use "url" or "urls" in request body.' },
        { status: 400 },
      );
    }

    if (urlList.length > MAX_URLS_PER_SUBMISSION) {
      return NextResponse.json(
        {
          error: `Too many URLs provided. Maximum allowed is ${MAX_URLS_PER_SUBMISSION}.`,
        },
        { status: 400 },
      );
    }

    // Validate URLs strictly belong to our HTTPS origin
    const validUrls = urlList.filter(isValidIndexNowUrl);

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs for kanadojo.com domain' },
        { status: 400 },
      );
    }

    // Submit to IndexNow API
    const indexNowPayload = {
      host: 'kanadojo.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: validUrls,
    };

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(indexNowPayload),
    });

    // IndexNow returns 200 for success, 202 for accepted (already known)
    if (response.ok) {
      return NextResponse.json({
        success: true,
        submitted: validUrls,
        status: response.status,
        message:
          response.status === 200
            ? 'URLs submitted successfully'
            : 'URLs already known or accepted',
      });
    }

    const errorText = await response.text();
    return NextResponse.json(
      {
        error: 'IndexNow submission failed',
        status: response.status,
        details: errorText,
      },
      { status: response.status },
    );
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for testing
 */
export async function GET() {
  return NextResponse.json({
    service: 'IndexNow API',
    configured: !!INDEXNOW_KEY,
    endpoint: INDEXNOW_ENDPOINT,
    usage: 'POST with { url: "..." } or { urls: ["...", "..."] }',
  });
}
