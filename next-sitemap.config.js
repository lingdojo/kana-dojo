import fs from 'node:fs';
import path from 'node:path';

function getAcademyPostPaths() {
  const postsDir = path.join(
    process.cwd(),
    'features',
    'Blog',
    'content',
    'posts',
    'en',
  );
  const paths = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.mdx')) {
        paths.push(`/academy/${path.basename(entry.name, '.mdx')}`);
      }
    }
  }

  if (fs.existsSync(postsDir)) {
    walk(postsDir);
  }

  return paths;
}

/** @type {import('next-sitemap').IConfig} */
const sitemapConfig = {
  siteUrl: process.env.SITE_URL || 'https://kanadojo.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  additionalPaths: async config => {
    const academyPaths = getAcademyPostPaths();
    const corePaths = [
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
      '/translate',
      '/translate/english-to-japanese',
      '/translate/japanese-to-english',
      '/translate/romaji',
      '/conjugate',
      '/academy',
      '/faq',
      '/hiragana-practice',
      '/katakana-practice',
      '/kanji-practice',
      '/jlpt/n5',
      '/jlpt/n4',
      '/jlpt/n3',
      '/resources',
      '/anki-converter',
      '/kana-chart',
    ];

    const uniquePaths = [...new Set([...corePaths, ...academyPaths])];
    return uniquePaths.map(loc => ({
      loc,
      changefreq: config.changefreq,
      priority:
        loc.startsWith('/translate') || loc === '/' || loc === '/conjugate'
          ? 0.9
          : config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }));
  },
  exclude: [
    '/api/*',
    '/_next/*',
    '/en',
    '/es',
    '/en/*',
    '/es/*',
    '/tools/*',
    '/*/train/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      {
        userAgent: 'Applebot',
        allow: '/',
      },
      {
        userAgent: 'Amazonbot',
        allow: '/',
      },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    const priorities = {
      '/': 1.0,
      '/translate': 0.9,
      '/translate/english-to-japanese': 0.85,
      '/translate/japanese-to-english': 0.85,
      '/translate/romaji': 0.85,
      '/kana': 0.9,
      '/kana/learn-hiragana': 0.88,
      '/kana/learn-katakana': 0.88,
      '/kanji': 0.9,
      '/kanji/jlpt-n5': 0.87,
      '/kanji/jlpt-n4': 0.86,
      '/kanji/jlpt-n3': 0.85,
      '/kanji/jlpt-n2': 0.84,
      '/kanji/jlpt-n1': 0.83,
      '/vocabulary': 0.9,
      '/vocabulary/jlpt-n5': 0.87,
      '/vocabulary/jlpt-n4': 0.86,
      '/vocabulary/jlpt-n3': 0.85,
      '/vocabulary/jlpt-n2': 0.84,
      '/vocabulary/jlpt-n1': 0.83,
      '/conjugate': 0.9,
      '/anki-converter': 0.85,
      '/academy': 0.85,
      '/resources': 0.85,
    };

    const changefreqs = {
      '/': 'daily',
      '/translate': 'daily',
      '/translate/english-to-japanese': 'weekly',
      '/translate/japanese-to-english': 'weekly',
      '/translate/romaji': 'weekly',
      '/kana': 'daily',
      '/kana/learn-hiragana': 'weekly',
      '/kana/learn-katakana': 'weekly',
      '/kanji': 'daily',
      '/kanji/jlpt-n5': 'weekly',
      '/kanji/jlpt-n4': 'weekly',
      '/kanji/jlpt-n3': 'weekly',
      '/kanji/jlpt-n2': 'weekly',
      '/kanji/jlpt-n1': 'weekly',
      '/vocabulary': 'daily',
      '/vocabulary/jlpt-n5': 'weekly',
      '/vocabulary/jlpt-n4': 'weekly',
      '/vocabulary/jlpt-n3': 'weekly',
      '/vocabulary/jlpt-n2': 'weekly',
      '/vocabulary/jlpt-n1': 'weekly',
      '/conjugate': 'daily',
      '/academy': 'daily',
      '/resources': 'daily',
    };

    return {
      loc: path,
      changefreq: changefreqs[path] || config.changefreq,
      priority: priorities[path] || config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

export default sitemapConfig;
