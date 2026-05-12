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

// Key pages that MUST have proper SEO
const CRITICAL_PAGES = [
  '/',
  '/kana',
  '/kana/learn-hiragana',
  '/kana/learn-katakana',
  '/kanji',
  '/kanji/jlpt-n5',
  '/kanji/jlpt-n4',
  '/kanji/jlpt-n3',
  '/kanji/jlpt-n2',
  '/kanji/jlpt-n1',
  '/vocabulary',
  '/vocabulary/jlpt-n5',
  '/vocabulary/jlpt-n4',
  '/vocabulary/jlpt-n3',
  '/vocabulary/jlpt-n2',
  '/vocabulary/jlpt-n1',
  '/conjugate',
  '/translate',
  '/academy',
  '/resources',
  '/faq',
  '/how-to-use',
  '/anki-converter',
  '/kana-chart',
  '/jlpt/n5',
  '/jlpt/n4',
  '/jlpt/n3',
  '/progress',
  '/glossary',
];

// Pages that should have specific structured data
const SCHEMA_EXPECTATIONS: Record<string, string[]> = {
  '/kana': ['CourseSchema', 'BreadcrumbList', 'LearningResource', 'FAQPage'],
  '/kana/learn-hiragana': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/kana/learn-katakana': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/kanji': ['CourseSchema', 'BreadcrumbList', 'LearningResource', 'FAQPage'],
  '/kanji/jlpt-n5': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/kanji/jlpt-n4': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/kanji/jlpt-n3': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/kanji/jlpt-n2': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/kanji/jlpt-n1': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/vocabulary': ['CourseSchema', 'BreadcrumbList', 'LearningResource'],
  '/vocabulary/jlpt-n5': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/vocabulary/jlpt-n4': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/vocabulary/jlpt-n3': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/vocabulary/jlpt-n2': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/vocabulary/jlpt-n1': [
    'CourseSchema',
    'BreadcrumbList',
    'LearningResource',
    'FAQPage',
  ],
  '/academy': ['BreadcrumbList', 'ItemList', 'CollectionPage'],
  '/resources': ['BreadcrumbList', 'ItemList', 'LearningResource'],
  '/conjugate': ['BreadcrumbList', 'WebApplication'],
  '/faq': ['FAQPage', 'BreadcrumbList'],
  '/how-to-use': ['HowTo', 'BreadcrumbList'],
  '/kana-chart': ['BreadcrumbList'],
  '/anki-converter': ['FAQPage', 'HowTo'],
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

async function checkPageStatus(path: string): Promise<number | null> {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.status;
  } catch {
    return null;
  }
}

async function checkMetaTags(path: string): Promise<void> {
  const url = `${BASE_URL}${path}`;
  const page = path;

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

    // Canonical URL quality check
    const canonicalMatch = html.match(
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
    );
    if (canonicalMatch && canonicalMatch[1]) {
      const canonicalHref = canonicalMatch[1];
      if (!canonicalHref.startsWith('https://kanadojo.com/')) {
        log({
          page,
          status: 'warn',
          message: `Canonical not on expected host: ${canonicalHref}`,
        });
      }
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
    const hreflangXDefault =
      html.includes('hreflang="x-default"') ||
      html.includes("hreflang='x-default'");
    if (!hreflangEn || !hreflangEs) {
      log({
        page,
        status: 'warn',
        message: 'Missing hreflang tags for all locales',
      });
    }
    if (!hreflangXDefault) {
      log({
        page,
        status: 'warn',
        message: 'Missing hreflang x-default tag',
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
      const hasKanaRoute = text.includes('https://kanadojo.com/kana');
      const hasKanjiRoute = text.includes('https://kanadojo.com/kanji');
      const hasVocabularyRoute = text.includes('https://kanadojo.com/vocabulary');
      log({
        page: 'llms.txt',
        status: 'pass',
        message: `llms.txt accessible with ${sections} sections (GEO ready)`,
      });
      if (!hasKanaRoute || !hasKanjiRoute || !hasVocabularyRoute) {
        log({
          page: 'llms.txt',
          status: 'warn',
          message: 'Core dojo routes missing from llms.txt route map',
        });
      }
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

  // 2. Check critical pages
  console.log('\n🌐 Checking critical routes');
  console.log('─'.repeat(40));
  for (const path of CRITICAL_PAGES) {
    const status = await checkPageStatus(path);

    if (status === null) {
      log({ page: path, status: 'fail', message: 'Unreachable' });
    } else if (status === 200) {
      log({ page: path, status: 'pass', message: `HTTP 200 OK` });
    } else if (status >= 300 && status < 400) {
      log({ page: path, status: 'warn', message: `Redirect (HTTP ${status})` });
    } else {
      log({ page: path, status: 'fail', message: `HTTP ${status}` });
    }
  }

  // 3. Deep meta tag check
  console.log('\n🏷️  Deep Meta Tag Analysis');
  console.log('─'.repeat(40));
  for (const path of CRITICAL_PAGES) {
    await checkMetaTags(path);
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
