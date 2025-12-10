# SEO Quick Start Guide

## 🚀 For Developers: Adding SEO to New Pages

### Step 1: Import Metadata Type

```typescript
import type { Metadata } from 'next';
```

### Step 2: Export Metadata Object

```typescript
export const metadata: Metadata = {
  title: 'Your Page Title - KanaDojo',
  description: 'Your compelling description here (150-160 chars)',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  openGraph: {
    title: 'Your Page Title',
    description: 'Social media description',
    url: 'https://kanadojo.com/your-page',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Your Page Title',
    description: 'Twitter description'
  },
  alternates: {
    canonical: 'https://kanadojo.com/your-page'
  }
};
```

### Step 3: Test Your Changes

```bash
# Check for TypeScript errors
npm run check

# Build and generate sitemap
npm run build
```

---

## 📋 Current SEO Status

### ✅ Completed

- All major pages have metadata
- Structured data (JSON-LD) implemented
- Sitemap with priorities and hreflang
- PWA manifest enhanced
- Robots.txt configured
- Multi-language support (en, es, ja)

### 🔄 To Do When Adding Content

- Add Open Graph images (1200x630px)
- Update sitemap after adding pages
- Add breadcrumb schema for deep pages
- Consider FAQ schema for help pages

---

## 🎯 SEO Priority by Page Type

| Page Type    | Priority | Changefreq | Notes            |
| ------------ | -------- | ---------- | ---------------- |
| Homepage     | 1.0      | daily      | Highest priority |
| Main Dojos   | 0.9      | weekly     | Core features    |
| Achievements | 0.7      | weekly     | User engagement  |
| Progress     | 0.7      | weekly     | User tracking    |
| Preferences  | 0.6      | monthly    | Settings         |
| Legal Pages  | 0.5      | yearly     | Static content   |

---

## 🔍 Quick SEO Checks

### Before Committing

```bash
# 1. Check for errors
npm run lint

# 2. Type check
npm run check

# 3. Build test
npm run build
```

### After Deploying

1. Test page in browser
2. View source and check metadata
3. Test social sharing preview
4. Check mobile responsiveness
5. Run Lighthouse audit

---

## 📱 Social Media Preview Testing

### Facebook/LinkedIn

https://developers.facebook.com/tools/debug/

### Twitter/X

https://cards-dev.twitter.com/validator

### General

https://www.opengraph.xyz/

---

## 🛠️ Common Issues & Fixes

### Issue: Metadata not showing

**Fix**: Clear browser cache or use incognito mode

### Issue: Sitemap not updating

**Fix**: Run `npm run postbuild` after build

### Issue: Social preview not working

**Fix**: Ensure Open Graph image is 1200x630px and publicly accessible

### Issue: Search engines not indexing

**Fix**: Submit sitemap to Google Search Console and Bing Webmaster Tools

---

## 📚 Documentation

- **Full Guide**: `docs/SEO.md`
- **Improvements Summary**: `docs/SEO_IMPROVEMENTS_SUMMARY.md`
- **Detailed Checklist**: `docs/SEO_CHECKLIST.md`
- **This Quick Start**: `docs/SEO_QUICK_START.md`

---

## 💡 Pro Tips

1. **Title Length**: Keep under 60 characters
2. **Description Length**: 150-160 characters is ideal
3. **Keywords**: 5-15 relevant keywords per page
4. **URLs**: Use kebab-case, keep short and descriptive
5. **Images**: Always include alt text
6. **Links**: Use descriptive anchor text
7. **Mobile**: Test on real devices
8. **Speed**: Keep page load under 3 seconds

---

## 🎓 Learning Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org](https://schema.org/)
- [Web.dev SEO](https://web.dev/learn/seo/)

---

## ✨ Remember

> Good SEO is about creating valuable content for users, not gaming search engines!

Focus on:

- User experience
- Quality content
- Fast performance
- Mobile-friendly design
- Accessibility

The technical SEO will follow naturally.

---

**Questions?** Check the full documentation or reach out to the team!

Last Updated: November 28, 2025
