/**
 * IndexNow Utility
 * Helper functions for instant search engine indexing via IndexNow protocol
 * Supported by: Bing, Yandex, Seznam.cz, Naver, and more
 */

const SITE_URL = 'https://kanadojo.com';

/**
 * Submit a single URL to IndexNow for instant indexing
 * @param url - Full URL to submit (must be kanadojo.com domain)
 * @returns Promise with submission result
 */
export async function submitUrlToIndexNow(url: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    return { success: response.ok, error: data.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Submit multiple URLs to IndexNow for instant indexing
 * @param urls - Array of full URLs to submit (must be kanadojo.com domain)
 * @returns Promise with submission result
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    const data = await response.json();
    return { success: response.ok, error: data.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Submit page updates after content changes
 * Use this when publishing/updating blog posts, adding new features, etc.
 * @param pathname - Pathname like '/academy/post-slug' or '/kana'
 */
export async function notifyPageUpdate(pathname: string) {
  const url = `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

  // Submit to IndexNow in background (fire and forget)
  submitUrlToIndexNow(url).catch(err => {
    console.warn('IndexNow submission failed:', err);
  });
}

/**
 * Submit all locale variations of a page
 * @param pathname - Pathname without locale prefix (e.g., '/academy/post-slug')
 */
export async function notifyPageUpdateAllLocales(pathname: string) {
  const locales = ['en', 'es'];
  const urls = locales.map(
    locale =>
      `${SITE_URL}/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`,
  );

  // Submit all locales at once
  submitUrlsToIndexNow(urls).catch(err => {
    console.warn('IndexNow submission failed:', err);
  });
}

/**
 * Notify search engines of sitemap update
 * Call this after significant content additions
 */
export async function notifySitemapUpdate() {
  const urls = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/sitemap-0.xml`,
    // Add other sitemap files if you have multiple
  ];

  submitUrlsToIndexNow(urls).catch(err => {
    console.warn('Sitemap IndexNow submission failed:', err);
  });
}
