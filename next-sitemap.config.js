/** @type {import('next-sitemap').IConfig} */
const sitemapConfig = {
  siteUrl: process.env.SITE_URL || 'https://kanadojo.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  additionalPaths: async config => {
    const siteUrl = config.siteUrl || 'https://kanadojo.com';

    const buildEntry = (basePath, customPriority, customChangefreq) => {
      const normalizedBasePath = basePath === '/' ? '' : basePath;
      const priority = customPriority ?? config.priority;
      const changefreq = customChangefreq ?? config.changefreq;

      return {
        loc: `/en${normalizedBasePath}` || '/en',
        changefreq,
        priority,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        alternateRefs: [
          {
            href: `${siteUrl}/en${normalizedBasePath}` || `${siteUrl}/en`,
            hreflang: 'en',
            hrefIsAbsolute: true,
          },
          {
            href: `${siteUrl}/es${normalizedBasePath}` || `${siteUrl}/es`,
            hreflang: 'es',
            hrefIsAbsolute: true,
          },
          {
            href: `${siteUrl}/ja${normalizedBasePath}` || `${siteUrl}/ja`,
            hreflang: 'ja',
            hrefIsAbsolute: true,
          },
          {
            href: `${siteUrl}/en${normalizedBasePath}` || `${siteUrl}/en`,
            hreflang: 'x-default',
            hrefIsAbsolute: true,
          },
        ],
      };
    };

    // Ensure key marketing/SEO pages are always present in the sitemap.
    const basePaths = [
      '/',
      '/kana',
      '/kanji',
      '/vocabulary',
      '/translate',
      '/conjugate',
      '/academy',
      '/faq',
      '/hiragana-practice',
      '/katakana-practice',
      '/kanji-practice',
      '/jlpt/n5',
      '/jlpt/n4',
      '/jlpt/n3',
    ];

    // Popular Japanese verbs for conjugator sitemap entries
    // These are commonly searched verbs that should be indexed
    const popularVerbs = [
      // Most common verbs
      'する',
      '行く',
      '来る',
      '見る',
      '食べる',
      '飲む',
      '書く',
      '読む',
      '話す',
      '聞く',
      '買う',
      '売る',
      '作る',
      '使う',
      '思う',
      '知る',
      '分かる',
      '出る',
      '入る',
      '帰る',
      '待つ',
      '持つ',
      '取る',
      '置く',
      // JLPT N5 essential verbs
      'ある',
      'いる',
      'なる',
      '言う',
      '会う',
      '開ける',
      '閉める',
      // Common irregular and special verbs
      '勉強する',
      '運動する',
      '料理する',
      '掃除する',
    ];

    // Conjugator verb-specific paths with appropriate priorities
    const conjugatorVerbPaths = popularVerbs.map(verb => ({
      path: `/conjugate?verb=${encodeURIComponent(verb)}`,
      priority: 0.7,
      changefreq: 'monthly',
    }));

    // Resource library paths with appropriate priorities
    // Main resources page: 0.8 priority
    // Category pages: 0.7 priority
    // Subcategory pages: 0.6 priority
    const resourcePaths = [
      // Main resources page
      { path: '/resources', priority: 0.8, changefreq: 'weekly' },
      // Category pages
      { path: '/resources/apps', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/websites', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/textbooks', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/youtube', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/podcasts', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/games', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/jlpt', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/reading', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/listening', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/speaking', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/writing', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/grammar', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/vocabulary', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/kanji', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/immersion', priority: 0.7, changefreq: 'weekly' },
      { path: '/resources/community', priority: 0.7, changefreq: 'weekly' },
      // Apps subcategories
      {
        path: '/resources/apps/flashcards',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/apps/dictionaries',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/apps/comprehensive',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/apps/input-methods',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Websites subcategories
      {
        path: '/resources/websites/courses',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/websites/reference',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/websites/practice',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Textbooks subcategories
      {
        path: '/resources/textbooks/beginner',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/textbooks/intermediate',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/textbooks/advanced',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/textbooks/specialized',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // YouTube subcategories
      {
        path: '/resources/youtube/lessons',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/youtube/culture',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/youtube/entertainment',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Podcasts subcategories
      {
        path: '/resources/podcasts/beginner-podcasts',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/podcasts/intermediate-podcasts',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/podcasts/native-content',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Games subcategories
      { path: '/resources/games/rpg', priority: 0.6, changefreq: 'weekly' },
      {
        path: '/resources/games/visual-novels',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/games/educational-games',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/games/casual-games',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // JLPT subcategories
      { path: '/resources/jlpt/n5', priority: 0.6, changefreq: 'weekly' },
      { path: '/resources/jlpt/n4', priority: 0.6, changefreq: 'weekly' },
      { path: '/resources/jlpt/n3', priority: 0.6, changefreq: 'weekly' },
      { path: '/resources/jlpt/n2', priority: 0.6, changefreq: 'weekly' },
      { path: '/resources/jlpt/n1', priority: 0.6, changefreq: 'weekly' },
      // Reading subcategories
      {
        path: '/resources/reading/graded-readers',
        priority: 0.6,
        changefreq: 'weekly',
      },
      { path: '/resources/reading/news', priority: 0.6, changefreq: 'weekly' },
      { path: '/resources/reading/manga', priority: 0.6, changefreq: 'weekly' },
      {
        path: '/resources/reading/novels',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Listening subcategories
      {
        path: '/resources/listening/audio-lessons',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/listening/shadowing',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/listening/comprehension',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Speaking subcategories
      {
        path: '/resources/speaking/pronunciation',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/speaking/conversation',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/speaking/tutoring',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Writing subcategories
      {
        path: '/resources/writing/handwriting',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/writing/composition',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/writing/correction',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Grammar subcategories
      {
        path: '/resources/grammar/guides',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/grammar/practice-grammar',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/grammar/sentence-patterns',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Vocabulary subcategories
      {
        path: '/resources/vocabulary/frequency-lists',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/vocabulary/themed-vocab',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/vocabulary/word-lists',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Kanji subcategories
      {
        path: '/resources/kanji/learning-systems',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/kanji/kanji-practice',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/kanji/kanji-reference',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Immersion subcategories
      {
        path: '/resources/immersion/media-tools',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/immersion/streaming',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/immersion/sentence-mining',
        priority: 0.6,
        changefreq: 'weekly',
      },
      // Community subcategories
      {
        path: '/resources/community/forums',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/community/discord',
        priority: 0.6,
        changefreq: 'weekly',
      },
      {
        path: '/resources/community/language-exchange',
        priority: 0.6,
        changefreq: 'weekly',
      },
    ];

    // Build entries for base paths (default priority)
    const baseEntries = basePaths.map(path => buildEntry(path));

    // Build entries for resource paths (custom priorities)
    const resourceEntries = resourcePaths.map(
      ({ path, priority, changefreq }) =>
        buildEntry(path, priority, changefreq),
    );

    // Build entries for conjugator verb-specific paths
    const conjugatorEntries = conjugatorVerbPaths.map(
      ({ path, priority, changefreq }) =>
        buildEntry(path, priority, changefreq),
    );

    return [...baseEntries, ...resourceEntries, ...conjugatorEntries];
  },
  exclude: [
    '/api/*',
    '/_next/*',
    '/*/train/*', // Exclude dynamic training pages
    '/es/*', // Exclude es/ja locales - we only generate /en/* URLs
    '/ja/*', // and add alternateRefs for other locales
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // Custom priority for important pages
    const priorities = {
      '/': 1.0,
      '/kana': 0.9,
      '/kanji': 0.9,
      '/vocabulary': 0.9,
      '/conjugate': 0.9,
      '/hiragana-practice': 0.85,
      '/katakana-practice': 0.85,
      '/kanji-practice': 0.85,
      '/translate': 0.9,
      '/academy': 0.8,
      '/preferences': 0.6,
      '/achievements': 0.7,
      '/progress': 0.7,
    };

    const changefreqs = {
      '/': 'daily',
      '/kana': 'weekly',
      '/kanji': 'weekly',
      '/vocabulary': 'weekly',
      '/conjugate': 'weekly',
      '/hiragana-practice': 'weekly',
      '/katakana-practice': 'weekly',
      '/kanji-practice': 'weekly',
      '/translate': 'daily',
      '/academy': 'weekly',
      '/preferences': 'monthly',
      '/achievements': 'weekly',
      '/progress': 'weekly',
    };

    // Extract base path without locale (e.g., /en/kana -> /kana)
    const localePattern = /^\/(en|es|ja)(\/.*)?$/;
    const match = path.match(localePattern);
    const basePath = match ? match[2] || '/' : path;

    // Check if this is an academy post URL (matches /academy/[slug] pattern)
    const isAcademyPost = /^\/academy\/[^/]+$/.test(basePath);

    // Determine priority and changefreq using base path
    let priority = priorities[basePath] || config.priority;
    let changefreq = changefreqs[basePath] || config.changefreq;

    // Academy posts get priority 0.8 and weekly changefreq
    if (isAcademyPost) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    const siteUrl = config.siteUrl || 'https://kanadojo.com';

    // Always emit the canonical loc as an English (/en) path.
    // We exclude /es/* and /ja/* from the sitemap, so /en is the source-of-truth
    // and alternateRefs provide other locales.
    const loc = match ? `/en${basePath}` : path;

    // FIX: Use absolute URLs for alternateRefs to prevent path doubling
    // next-sitemap was appending href to loc, causing /en/kana/en/kana
    return {
      loc,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        {
          href: `${siteUrl}/en${basePath}`,
          hreflang: 'en',
          hrefIsAbsolute: true,
        },
        {
          href: `${siteUrl}/es${basePath}`,
          hreflang: 'es',
          hrefIsAbsolute: true,
        },
        {
          href: `${siteUrl}/ja${basePath}`,
          hreflang: 'ja',
          hrefIsAbsolute: true,
        },
        {
          href: `${siteUrl}/en${basePath}`,
          hreflang: 'x-default',
          hrefIsAbsolute: true,
        },
      ],
    };
  },
};

export default sitemapConfig;
