import { NextRequest, NextResponse } from 'next/server';

/**
 * IndexNow API Route
 * Instantly notifies Bing, Yandex, and other search engines of content updates
 * https://www.indexnow.org/
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';
const SITE_URL = 'https://kanadojo.com';

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

    const body: IndexNowSubmission = await request.json();
    const { url, urls } = body;

    // Collect URLs to submit
    const urlList: string[] = [];
    if (url) urlList.push(url);
    if (urls && Array.isArray(urls)) urlList.push(...urls);

    if (urlList.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided. Use "url" or "urls" in request body.' },
        { status: 400 },
      );
    }

    // Validate URLs belong to our domain
    const validUrls = urlList.filter(u => {
      try {
        const parsed = new URL(u);
        return parsed.hostname === 'kanadojo.com';
      } catch {
        return false;
      }
    });

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
