import { NextRequest, NextResponse } from 'next/server';

/**
 * Sitemap Submission API Route
 * Submits sitemaps to Google and Bing for faster indexing
 */

const SITE_URL = 'https://kanadojo.com';

interface SubmissionResult {
  engine: 'google' | 'bing';
  success: boolean;
  status?: number;
  error?: string;
}

/**
 * Submit sitemap to search engines
 * POST /api/sitemap/submit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sitemapUrl = body.sitemapUrl || `${SITE_URL}/sitemap.xml`;

    // Validate sitemap URL
    if (!sitemapUrl.startsWith(SITE_URL)) {
      return NextResponse.json(
        { error: 'Invalid sitemap URL' },
        { status: 400 },
      );
    }

    const results: SubmissionResult[] = [];

    // Submit to Google
    try {
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const googleResponse = await fetch(googlePingUrl, { method: 'GET' });

      results.push({
        engine: 'google',
        success: googleResponse.ok,
        status: googleResponse.status,
        error: googleResponse.ok ? undefined : 'Submission failed',
      });
    } catch (error) {
      results.push({
        engine: 'google',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Submit to Bing
    try {
      const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const bingResponse = await fetch(bingPingUrl, { method: 'GET' });

      results.push({
        engine: 'bing',
        success: bingResponse.ok,
        status: bingResponse.status,
        error: bingResponse.ok ? undefined : 'Submission failed',
      });
    } catch (error) {
      results.push({
        engine: 'bing',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const allSuccess = results.every(r => r.success);

    return NextResponse.json(
      {
        success: allSuccess,
        sitemapUrl,
        results,
        timestamp: new Date().toISOString(),
      },
      { status: allSuccess ? 200 : 207 }, // 207 = Multi-Status
    );
  } catch (error) {
    console.error('Sitemap submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit sitemap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for testing and documentation
 */
export async function GET() {
  return NextResponse.json({
    service: 'Sitemap Submission API',
    usage: 'POST with { "sitemapUrl": "https://kanadojo.com/sitemap.xml" }',
    searchEngines: ['Google', 'Bing'],
    defaultSitemap: `${SITE_URL}/sitemap.xml`,
  });
}
