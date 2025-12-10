# SEO Checklist for KanaDojo

Use this checklist when adding new pages or features to ensure SEO best practices.

## ✅ New Page Checklist

When creating a new page, ensure:

### Metadata

- [ ] Unique, descriptive title (50-60 characters)
- [ ] Compelling meta description (150-160 characters)
- [ ] Relevant keywords array (5-15 keywords)
- [ ] Open Graph tags (title, description, url, type)
- [ ] Twitter Card metadata
- [ ] Canonical URL
- [ ] Proper imports: `import type { Metadata } from 'next';`

### Example Template

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title - KanaDojo',
  description:
    'Compelling description that includes main keywords and value proposition.',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  openGraph: {
    title: 'Page Title',
    description: 'Social media description.',
    url: 'https://kanadojo.com/page-url',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Page Title',
    description: 'Twitter description.'
  },
  alternates: {
    canonical: 'https://kanadojo.com/page-url'
  }
};
```

## ✅ Content Checklist

- [ ] Semantic HTML5 elements (header, main, section, article, nav, footer)
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Only one h1 per page
- [ ] Descriptive alt text for all images
- [ ] Internal links to related content
- [ ] External links open in new tab (if applicable)
- [ ] Mobile-responsive design
- [ ] Fast loading time (<3 seconds)

## ✅ Technical SEO Checklist

- [ ] Clean, descriptive URLs (kebab-case)
- [ ] No duplicate content
- [ ] Proper 404 error handling
- [ ] Sitemap includes new page
- [ ] Robots.txt allows crawling
- [ ] HTTPS enabled
- [ ] Mobile-friendly
- [ ] Page speed optimized
- [ ] No broken links

## ✅ Structured Data Checklist

Consider adding structured data for:

- [ ] Breadcrumbs (BreadcrumbList)
- [ ] Articles (Article, BlogPosting)
- [ ] Courses (Course, LearningResource)
- [ ] FAQs (FAQPage)
- [ ] Reviews (Review, AggregateRating)
- [ ] Events (Event)
- [ ] Videos (VideoObject)

## ✅ Accessibility Checklist

- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Screen reader friendly
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Form labels properly associated

## ✅ Performance Checklist

- [ ] Images optimized (WebP, AVIF)
- [ ] Lazy loading for images
- [ ] Code splitting implemented
- [ ] Minimal JavaScript bundle
- [ ] CSS optimized
- [ ] Fonts optimized
- [ ] No render-blocking resources

## ✅ Social Media Checklist

- [ ] Open Graph image (1200x630px)
- [ ] Twitter Card image (if different)
- [ ] Social sharing buttons (optional)
- [ ] Proper og:type for content
- [ ] og:locale for internationalization

## ✅ International SEO Checklist

- [ ] Hreflang tags for multi-language
- [ ] Translated metadata
- [ ] Language-specific URLs (if needed)
- [ ] Proper locale in Open Graph
- [ ] RTL support (if applicable)

## ✅ Analytics Checklist

- [ ] Google Analytics tracking
- [ ] Conversion goals set up
- [ ] Event tracking configured
- [ ] Search Console verified
- [ ] Bing Webmaster Tools verified

## ✅ Pre-Launch Checklist

Before deploying to production:

- [ ] Run Lighthouse audit (score >90)
- [ ] Test on mobile devices
- [ ] Validate HTML
- [ ] Check for console errors
- [ ] Test all links
- [ ] Verify metadata in browser
- [ ] Test social sharing preview
- [ ] Check sitemap generation
- [ ] Verify robots.txt
- [ ] Test page speed

## ✅ Post-Launch Checklist

After deploying:

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Request indexing for new pages
- [ ] Monitor for crawl errors
- [ ] Check search appearance
- [ ] Monitor analytics
- [ ] Track keyword rankings
- [ ] Monitor page speed

## 🔧 Tools to Use

### SEO Analysis

- Google Search Console
- Bing Webmaster Tools
- Lighthouse (Chrome DevTools)
- PageSpeed Insights
- GTmetrix
- Screaming Frog (for large sites)

### Structured Data

- Google Rich Results Test
- Schema.org Validator
- JSON-LD Playground

### Social Media

- Facebook Sharing Debugger
- Twitter Card Validator
- LinkedIn Post Inspector

### Accessibility

- WAVE Web Accessibility Tool
- axe DevTools
- Lighthouse Accessibility Audit

### Performance

- WebPageTest
- Pingdom
- Vercel Analytics
- Chrome DevTools Performance

## 📝 Quick Reference

### Title Best Practices

- 50-60 characters
- Include primary keyword
- Brand name at end
- Unique for each page
- Compelling and descriptive

### Description Best Practices

- 150-160 characters
- Include primary and secondary keywords
- Call-to-action
- Unique for each page
- Accurately describes content

### Keywords Best Practices

- 5-15 relevant keywords
- Mix of short and long-tail
- Include variations
- Natural language
- User intent focused

### URL Best Practices

- Short and descriptive
- Use hyphens, not underscores
- Lowercase only
- Include keywords
- Avoid special characters

## 🚨 Common Mistakes to Avoid

- ❌ Duplicate titles or descriptions
- ❌ Missing alt text on images
- ❌ Broken internal links
- ❌ Slow page load times
- ❌ Missing mobile optimization
- ❌ Thin or duplicate content
- ❌ Missing canonical URLs
- ❌ Incorrect structured data
- ❌ Missing Open Graph tags
- ❌ Not updating sitemap

## 📞 Need Help?

If you're unsure about SEO implementation:

1. Review `docs/SEO.md` for detailed guidance
2. Check existing pages for examples
3. Use the template above
4. Test with SEO tools before deploying
5. Ask for code review

---

**Remember**: Good SEO is about creating great content for users, not just search engines!

---

Last Updated: November 28, 2025
