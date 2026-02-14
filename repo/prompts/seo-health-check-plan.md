## Plan: Comprehensive SEO Health Check & Optimization Audit

KanaDojo has strong SEO foundations with Phase 1-3 implementations complete, but requires **IndexNow activation**, schema deployment, GEO enhancements, and systematic validation across all pages to maximize search engine visibility and AI discoverability.

### Steps

1. **Complete IndexNow instant indexing setup** — Generate UUID key, create [public/[uuid].txt](public), add `INDEXNOW_KEY` to Vercel environment variables, submit to Bing Webmaster Tools, then integrate [api/submit-indexnow/route.ts](app/api/submit-indexnow/route.ts) into content publishing workflow (especially blog posts and resources updates)

2. **Deploy unused structured data schemas** — Add `HowToSchema` from [shared/lib/seo/structuredData.tsx](shared/lib/seo/structuredData.tsx) to step-by-step blog guides, apply `LearningResourceSchema` to [kana/page.tsx](<app/[locale]/(main)/kana/page.tsx>), [kanji/page.tsx](<app/[locale]/(main)/kanji/page.tsx>), [vocabulary/page.tsx](<app/[locale]/(main)/vocabulary/page.tsx>), and integrate `CourseSchema` into main learning sections for enhanced rich results

3. **Audit and expand breadcrumbs** — Verify `BreadcrumbList` schema from [Breadcrumbs.tsx](shared/components/Breadcrumbs.tsx) appears on all feature pages (not just blog/resources), add to Kana Blitz, Kanji Blitz, Vocabulary training, and achievements pages for improved navigation signals

4. **Validate metadata completeness** — Systematically check all 50+ routes from [next-sitemap.config.js](next-sitemap.config.js) have unique titles/descriptions in [common.json](core/i18n/locales/en/common.json), verify `getPageMetadata()` from [metadata.ts](shared/lib/seo/metadata.ts) properly generates OG images via [opengraph-image/route.tsx](app/api/og/opengraph-image/route.tsx), and test across all 3 locales (en/es/ja)

5. **Implement content freshness indicators** — Use `getContentFreshnessLabel()` from [dateUtils.ts](shared/lib/seo/dateUtils.ts) to display "Updated X days ago" badges on [BlogCard.tsx](features/Blog/components/BlogCard.tsx) and [BlogPost.tsx](features/Blog/components/BlogPost.tsx), add Last-Modified headers to API responses, and schedule quarterly blog content reviews

6. **Enhance GEO (AI SEO) discoverability** — Expand [llms.txt](llms.txt) with detailed feature descriptions and code examples, add AI-friendly summaries to all 60+ blog posts in [features/Blog/content/posts/en/](features/Blog/content/posts/en/), create structured FAQ sections using `FAQSchema` from [structuredData.tsx](shared/lib/seo/structuredData.tsx) on popular posts, and ensure semantic HTML hierarchy across all pages

7. **Optimize blog and resources SEO** — Add internal linking via `generateInternalLink()` from [internalLinks.ts](shared/lib/seo/internalLinks.ts) between related blog posts, verify all images use `getImageAlt()` from [altText.ts](shared/lib/seo/altText.ts), create image sitemap for Kana/Kanji character charts, and add "People Also Ask" FAQ sections to top 10 performing blog posts

8. **Audit technical SEO health** — Test all 500+ sitemap URLs for 200 status, verify hreflang consistency (resolve ja locale mismatch between [next-sitemap.config.js](next-sitemap.config.js) and [core/i18n/config.ts](core/i18n/config.ts)), validate canonical URLs don't conflict, check Core Web Vitals via Vercel Speed Insights, and ensure all structured data passes Google Rich Results Test

9. **Set up monitoring and reporting** — Create dashboard tracking IndexNow submission success rates, monitor Google Search Console and Bing Webmaster Tools for indexing issues, set up alerts for Core Web Vitals regressions, and establish monthly SEO health check workflow with automated validation via `npm run check`

### Further Considerations

1. **Locale strategy** — Sitemap includes `ja` but [config.ts](core/i18n/config.ts) only shows `en`/`es`. Decision needed: Remove `ja` from sitemap or activate Japanese locale with full translations?

2. **Video content preparation** — `VideoSchema` is implemented but unused. Planning to add video tutorials? If yes, when should schema be deployed to [Academy pages](<app/[locale]/(main)/academy>)?

3. **Performance vs SEO tradeoffs** — Font loading optimization skips 35+ Google Fonts in dev. Any performance concerns for production that might affect SEO? Consider subset loading or variable fonts.

4. **Competitor analysis** — Should we benchmark against Duolingo, WaniKani, Bunpro for Japanese learning SEO strategies? May reveal keyword gaps or content opportunities.

5. **Paid search integration** — Bing Ads integration potential with IndexNow? Could amplify visibility on Microsoft ecosystem (Edge, Bing, ChatGPT citations).
