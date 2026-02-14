/**
 * SEO Health Check Script
 *
 * Validates SEO implementation across the KanaDojo app:
 * - Sitemap URL accessibility (status codes)
 * - Structured data presence on key pages
 * - Meta tag completeness
 * - Hreflang consistency
 * - IndexNow configuration
 *
 * Usage:
 *   npx tsx scripts/seo-health-check.ts
 *   npx tsx scripts/seo-health-check.ts --live   # Check live site
 */

const BASE_URL = process.argv.includes('--live')
  ? 'https://kanadojo.com'
  : 'http://localhost:3000';

const LOCALES = ['en', 'es'];

// Key pages that MUST have proper SEO
const CRITICAL_PAGES = [
  '/',
  '/kana',
  '/kanji',
  '/vocabulary',
  '/conjugate',
  '/translate',
  '/academy',
  '/resources',
  '/faq',
  '/how-to-use',
  '/tools',
  '/tools/anki-converter',
  '/tools/kana-chart',
  '/jlpt/n5',
  '/jlpt/n4',
  '/jlpt/n3',
  '/progress',
  '/glossary',
];

// Pages that should have specific structured data
const SCHEMA_EXPECTATIONS: Record<string, string[]> = {
  '/kana': ['CourseSchema', 'BreadcrumbList', 'LearningResource', 'FAQPage'],
  '/kanji': ['CourseSchema', 'BreadcrumbList', 'LearningResource', 'FAQPage'],
  '/vocabulary': ['CourseSchema', 'BreadcrumbList', 'LearningResource'],
  '/academy': ['BreadcrumbList', 'ItemList', 'CollectionPage'],
  '/resources': ['BreadcrumbList', 'ItemList', 'LearningResource'],
  '/conjugate': ['BreadcrumbList', 'WebApplication'],
  '/faq': ['FAQPage', 'BreadcrumbList'],
  '/how-to-use': ['HowTo', 'BreadcrumbList'],
  '/tools': ['BreadcrumbList'],
  '/tools/kana-chart': ['BreadcrumbList'],
  '/tools/anki-converter': ['FAQPage', 'HowTo'],
};

interface CheckResult {
  page: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

const results: CheckResult[] = [];

function log(result: CheckResult) {
  const icon =
    result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
  console.log(`${icon} [${result.page}] ${result.message}`);
  results.push(result);
}

async function checkPageStatus(
  locale: string,
  path: string,
): Promise<number | null> {
  const url = `${BASE_URL}/${locale}${path}`;
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.status;
  } catch {
    return null;
  }
}

async function checkMetaTags(locale: string, path: string): Promise<void> {
  const url = `${BASE_URL}/${locale}${path}`;
  const page = `${locale}${path}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      log({ page, status: 'fail', message: `HTTP ${response.status}` });
      return;
    }

    const html = await response.text();

    // Check title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1] || titleMatch[1].length < 10) {
      log({ page, status: 'fail', message: 'Missing or too short <title>' });
    } else if (titleMatch[1].length > 70) {
      log({
        page,
        status: 'warn',
        message: `Title too long (${titleMatch[1].length} chars): ${titleMatch[1]}`,
      });
    } else {
      log({ page, status: 'pass', message: `Title OK: "${titleMatch[1]}"` });
    }

    // Check meta description
    const descMatch =
      html.match(/<meta\s+name="description"\s+content="([^"]*?)"/i) ||
      html.match(/<meta\s+content="([^"]*?)"\s+name="description"/i);
    if (!descMatch || !descMatch[1] || descMatch[1].length < 50) {
      log({
        page,
        status: 'fail',
        message: 'Missing or too short meta description',
      });
    } else if (descMatch[1].length > 160) {
      log({
        page,
        status: 'warn',
        message: `Description too long (${descMatch[1].length} chars)`,
      });
    } else {
      log({
        page,
        status: 'pass',
        message: `Description OK (${descMatch[1].length} chars)`,
      });
    }

    // Check Open Graph tags
    const ogTitle = html.includes('og:title');
    const ogDesc = html.includes('og:description');
    const ogImage = html.includes('og:image');
    if (!ogTitle || !ogDesc) {
      log({
        page,
        status: 'warn',
        message: `Missing OG tags: ${!ogTitle ? 'og:title' : ''} ${!ogDesc ? 'og:description' : ''}`,
      });
    }
    if (!ogImage) {
      log({ page, status: 'warn', message: 'Missing og:image' });
    }

    // Check canonical URL
    const canonical =
      html.includes('rel="canonical"') || html.includes("rel='canonical'");
    if (!canonical) {
      log({ page, status: 'warn', message: 'Missing canonical URL' });
    }

    // Check structured data
    const jsonLdMatches = html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    );
    if (!jsonLdMatches || jsonLdMatches.length === 0) {
      log({
        page,
        status: 'warn',
        message: 'No JSON-LD structured data found',
      });
    } else {
      log({
        page,
        status: 'pass',
        message: `${jsonLdMatches.length} JSON-LD schema(s) found`,
      });

      // Check for expected schemas
      const expectedSchemas = SCHEMA_EXPECTATIONS[path];
      if (expectedSchemas) {
        const allJsonLd = jsonLdMatches.join(' ');
        for (const schema of expectedSchemas) {
          if (!allJsonLd.includes(schema)) {
            log({
              page,
              status: 'warn',
              message: `Expected schema "${schema}" not found`,
            });
          }
        }
      }
    }

    // Check hreflang tags
    const hreflangEn =
      html.includes('hreflang="en"') || html.includes("hreflang='en'");
    const hreflangEs =
      html.includes('hreflang="es"') || html.includes("hreflang='es'");
    if (!hreflangEn || !hreflangEs) {
      log({
        page,
        status: 'warn',
        message: 'Missing hreflang tags for all locales',
      });
    }
  } catch (error) {
    log({
      page,
      status: 'fail',
      message: `Fetch error: ${error instanceof Error ? error.message : 'Unknown'}`,
    });
  }
}

async function checkIndexNow(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/indexnow`);
    const data = await response.json();
    if (data.configured) {
      log({
        page: 'IndexNow',
        status: 'pass',
        message: 'IndexNow API configured',
      });
    } else {
      log({
        page: 'IndexNow',
        status: 'fail',
        message: 'IndexNow API key not configured (set INDEXNOW_KEY env var)',
      });
    }
  } catch {
    log({
      page: 'IndexNow',
      status: 'fail',
      message: 'IndexNow API endpoint unreachable',
    });
  }
}

async function checkSitemap(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/sitemap.xml`);
    if (response.ok) {
      const xml = await response.text();
      const urlCount = (xml.match(/<url>/g) || []).length;
      log({
        page: 'Sitemap',
        status: 'pass',
        message: `sitemap.xml accessible with ${urlCount} URLs`,
      });
    } else {
      log({
        page: 'Sitemap',
        status: 'fail',
        message: `sitemap.xml returned HTTP ${response.status}`,
      });
    }
  } catch {
    log({
      page: 'Sitemap',
      status: 'fail',
      message: 'sitemap.xml unreachable',
    });
  }
}

async function checkRobotsTxt(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/robots.txt`);
    if (response.ok) {
      const text = await response.text();
      const hasSitemap = text.includes('Sitemap:');
      const hasAIBots = text.includes('GPTBot') || text.includes('Claude-Web');
      log({
        page: 'robots.txt',
        status: 'pass',
        message: `robots.txt accessible${hasSitemap ? ', has sitemap' : ', MISSING sitemap ref'}${hasAIBots ? ', AI bots configured' : ''}`,
      });
    } else {
      log({
        page: 'robots.txt',
        status: 'fail',
        message: `robots.txt returned HTTP ${response.status}`,
      });
    }
  } catch {
    log({
      page: 'robots.txt',
      status: 'fail',
      message: 'robots.txt unreachable',
    });
  }
}

async function checkLlmsTxt(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/llms.txt`);
    if (response.ok) {
      const text = await response.text();
      const sections = (text.match(/^## /gm) || []).length;
      log({
        page: 'llms.txt',
        status: 'pass',
        message: `llms.txt accessible with ${sections} sections (GEO ready)`,
      });
    } else {
      log({
        page: 'llms.txt',
        status: 'warn',
        message: `llms.txt returned HTTP ${response.status}`,
      });
    }
  } catch {
    log({ page: 'llms.txt', status: 'warn', message: 'llms.txt unreachable' });
  }
}

async function main() {
  console.log('\n🔍 KanaDojo SEO Health Check');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log('═'.repeat(60));

  // 1. Check infrastructure
  console.log('\n📋 Infrastructure Checks');
  console.log('─'.repeat(40));
  await checkSitemap();
  await checkRobotsTxt();
  await checkLlmsTxt();
  await checkIndexNow();

  // 2. Check critical pages across locales
  for (const locale of LOCALES) {
    console.log(`\n🌐 Checking locale: ${locale}`);
    console.log('─'.repeat(40));

    for (const path of CRITICAL_PAGES) {
      const status = await checkPageStatus(locale, path);
      const page = `${locale}${path}`;

      if (status === null) {
        log({ page, status: 'fail', message: 'Unreachable' });
      } else if (status === 200) {
        log({ page, status: 'pass', message: `HTTP 200 OK` });
      } else if (status >= 300 && status < 400) {
        log({ page, status: 'warn', message: `Redirect (HTTP ${status})` });
      } else {
        log({ page, status: 'fail', message: `HTTP ${status}` });
      }
    }
  }

  // 3. Deep meta tag check on English pages
  console.log('\n🏷️  Deep Meta Tag Analysis (en)');
  console.log('─'.repeat(40));
  for (const path of CRITICAL_PAGES) {
    await checkMetaTags('en', path);
  }

  // 4. Summary
  console.log('\n═'.repeat(60));
  console.log('📊 Summary');
  console.log('─'.repeat(40));
  const passes = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warn').length;
  const failures = results.filter(r => r.status === 'fail').length;
  console.log(`✅ Passed:   ${passes}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed:   ${failures}`);
  console.log(`📈 Score:    ${Math.round((passes / results.length) * 100)}%`);
  console.log('═'.repeat(60));

  if (failures > 0) {
    console.log('\n❌ Critical failures that need attention:');
    results
      .filter(r => r.status === 'fail')
      .forEach(r => console.log(`  - [${r.page}] ${r.message}`));
  }

  process.exit(failures > 0 ? 1 : 0);
}

main().catch(console.error);
