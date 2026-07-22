/**
 * Sitemap Utilities
 * Helper functions for sitemap management and submission
 */

const SITE_URL = 'https://kanadojo.com';

/**
 * Submit sitemap to search engines
 * @param sitemapUrl - URL of the sitemap to submit
 */
export async function submitSitemapToSearchEngines(
  sitemapUrl: string = `${SITE_URL}/sitemap.xml`,
): Promise<{
  google: { success: boolean; error?: string };
  bing: { success: boolean; error?: string };
}> {
  const results = {
    google: { success: false, error: '' as string | undefined },
    bing: { success: false, error: '' as string | undefined },
  };

  // Submit to Google via ping
  try {
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const googleResponse = await fetch(googlePingUrl);
    results.google.success = googleResponse.ok;
    if (!googleResponse.ok) {
      results.google.error = `Status ${googleResponse.status}`;
    }
  } catch (error) {
    results.google.error =
      error instanceof Error ? error.message : 'Unknown error';
  }

  // Submit to Bing via ping
  try {
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const bingResponse = await fetch(bingPingUrl);
    results.bing.success = bingResponse.ok;
    if (!bingResponse.ok) {
      results.bing.error = `Status ${bingResponse.status}`;
    }
  } catch (error) {
    results.bing.error =
      error instanceof Error ? error.message : 'Unknown error';
  }

  return results;
}

/**
 * Generate image sitemap entry
 * Used for creating image sitemaps for better image SEO
 */
export interface ImageSitemapEntry {
  loc: string;
  images: Array<{
    loc: string;
    caption?: string;
    title?: string;
    license?: string;
  }>;
}

/**
 * Generate a sitemap entry with image data
 */
export function generateImageSitemapEntry(
  pageUrl: string,
  images: Array<{
    url: string;
    caption?: string;
    title?: string;
  }>,
): ImageSitemapEntry {
  return {
    loc: pageUrl,
    images: images.map((img) => ({
      loc: img.url,
      caption: img.caption,
      title: img.title,
    })),
  };
}

/**
 * Get all sitemap URLs for KanaDojo
 */
export function getAllSitemapUrls(): string[] {
  return [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/sitemap-0.xml`,
    // Add more sitemap URLs as they're generated
  ];
}

/**
 * Validate sitemap URL structure
 */
export function validateSitemapUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      (url.endsWith('.xml') || url.endsWith('/sitemap.xml'))
    );
  } catch {
    return false;
  }
}

/**
 * Generate sitemap index for multiple sitemaps
 */
export function generateSitemapIndex(sitemapUrls: string[]): string {
  const sitemaps = sitemapUrls
    .map(
      (url) => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

/**
 * Create a ping endpoint URL for search engines
 */
export function createSitemapPingUrl(
  searchEngine: 'google' | 'bing',
  sitemapUrl: string,
): string {
  const baseUrls = {
    google: 'https://www.google.com/ping',
    bing: 'https://www.bing.com/ping',
  };

  return `${baseUrls[searchEngine]}?sitemap=${encodeURIComponent(sitemapUrl)}`;
}

/**
 * Check if sitemap exists and is accessible
 */
export async function verifySitemapAccessible(
  sitemapUrl: string,
): Promise<boolean> {
  try {
    const response = await fetch(sitemapUrl, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && (contentType?.includes('xml') ?? false);
  } catch {
    return false;
  }
}

/**
 * Parse sitemap XML to count URLs
 */
export async function getSitemapUrlCount(sitemapUrl: string): Promise<number> {
  try {
    const response = await fetch(sitemapUrl);
    const xml = await response.text();
    const urlMatches = xml.match(/<loc>/g);
    return urlMatches ? urlMatches.length : 0;
  } catch {
    return 0;
  }
}
