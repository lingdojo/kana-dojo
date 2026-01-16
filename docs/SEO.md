# SEO Implementation Guide

## Overview

KanaDojo implements comprehensive SEO best practices to ensure maximum visibility in search engines and provide the best user experience.

---

## Quick Start for Developers

When adding SEO to new pages, follow these steps:

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
npm run check    # TypeScript + ESLint
npm run build    # Generate sitemap
```

### SEO Priority by Page Type

| Page Type    | Priority | Changefreq | Notes            |
| ------------ | -------- | ---------- | ---------------- |
| Homepage     | 1.0      | daily      | Highest priority |
| Main Dojos   | 0.9      | weekly     | Core features    |
| Achievements | 0.7      | weekly     | User engagement  |
| Progress     | 0.7      | weekly     | User tracking    |
| Preferences  | 0.6      | monthly    | Settings         |
| Legal Pages  | 0.5      | yearly     | Static content   |

---

## Key SEO Features Implemented

### 1. Metadata Configuration

#### Root Layout (`app/layout.tsx`)

- **Title Template**: Dynamic titles with `%s | KanaDojo` pattern
- **Description**: Comprehensive description with key features
- **Keywords**: Array of relevant Japanese learning keywords
- **Open Graph**: Full OG tags for social media sharing
- **Twitter Cards**: Optimized for Twitter/X sharing
- **Canonical URLs**: Proper canonical tags to avoid duplicate content
- **Robots**: Configured for optimal crawling and indexing
- **Multi-language Support**: Alternate locale tags for en, es, ja

#### Page-Level Metadata

All major pages include:

- Unique, descriptive titles
- Compelling meta descriptions (150-160 characters)
- Relevant keywords
- Open Graph tags
- Canonical URLs
- Twitter Card metadata where appropriate

### 2. Structured Data (JSON-LD)

Implemented in root layout with Schema.org markup:

- **Organization Schema**: Company information and branding
- **WebSite Schema**: Site-wide information with multi-language support
- **WebApplication Schema**: Educational app details with features and pricing

### 3. Sitemap Configuration

Enhanced `next-sitemap.config.js` with:

- Custom priorities for important pages
- Dynamic changefreq based on page type
- Hreflang tags for multilingual support
- Exclusion of dynamic training pages
- Proper robot.txt generation

**Priority Structure:**

- Homepage: 1.0 (highest)
- Main dojos (kana, kanji, vocabulary): 0.9
- Achievements, Progress: 0.7
- Preferences: 0.6
- Other pages: 0.7 (default)

### 4. Robots.txt

Generated automatically with:

- Allow all major search engines
- Sitemap reference
- Host declaration

### 5. PWA Manifest

Enhanced `manifest.json` with:

- Detailed app description
- Categories (education, productivity)
- Shortcuts to main dojos
- Proper icon configuration
- Standalone display mode

### 6. Internationalization (i18n)

- Support for 3 languages: English, Spanish, Japanese
- Hreflang tags in sitemap
- Alternate locale tags in metadata
- Locale-specific URLs (when needed)

## SEO Checklist

### ✅ Completed

- [x] Unique titles for all pages
- [x] Meta descriptions for all pages
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Canonical URLs
- [x] Structured data (JSON-LD)
- [x] Sitemap with priorities
- [x] Robots.txt
- [x] PWA manifest
- [x] Hreflang tags
- [x] Keywords optimization
- [x] Mobile-friendly viewport
- [x] Semantic HTML structure

### 🔄 Recommended Future Improvements

- [ ] Add Open Graph images for better social sharing
- [ ] Create high-quality screenshots for PWA manifest
- [ ] Add breadcrumb structured data
- [ ] Implement FAQ schema for educational content
- [ ] Add Course schema for each dojo
- [ ] Create XML sitemap for images
- [ ] Add video schema if video content is added
- [ ] Implement AggregateRating schema with real user reviews
- [ ] Add LocalBusiness schema if applicable
- [ ] Create separate sitemaps for different content types

## Page-Specific SEO

### Homepage (`/`)

- **Focus**: Brand awareness, general Japanese learning
- **Keywords**: learn japanese, hiragana, katakana, kanji, vocabulary
- **Priority**: 1.0 (highest)

### Kana Dojo (`/kana`)

- **Focus**: Hiragana and Katakana learning
- **Keywords**: learn hiragana, learn katakana, kana practice
- **Priority**: 0.9

### Kanji Dojo (`/kanji`)

- **Focus**: Kanji learning by JLPT level
- **Keywords**: learn kanji, JLPT kanji, kanji practice
- **Priority**: 0.9

### Vocabulary Dojo (`/vocabulary`)

- **Focus**: Japanese vocabulary by JLPT level
- **Keywords**: japanese vocabulary, JLPT vocabulary, japanese words
- **Priority**: 0.9

### Timed Challenges

- **Focus**: Speed practice and testing
- **Keywords**: timed challenge, speed test, japanese quiz
- **Priority**: 0.7

### Progress & Achievements

- **Focus**: Learning tracking and gamification
- **Keywords**: progress tracking, achievements, learning statistics
- **Priority**: 0.7

## Technical SEO

### Performance

- Next.js 15 with App Router for optimal performance
- Server-side rendering (SSR) for better SEO
- Static generation where possible
- Image optimization with next/image
- Code splitting and lazy loading

### Accessibility

- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly
- Proper heading hierarchy

### Mobile Optimization

- Responsive design
- Mobile-first approach
- Touch-friendly interface
- Fast mobile loading times
- PWA support for offline access

## Monitoring & Analytics

### Implemented

- Google Analytics (via @vercel/analytics)
- Vercel Speed Insights
- Google Search Console verification
- Microsoft Clarity
- Bing Webmaster Tools verification

### Recommended Tools

- Google Search Console for indexing status
- Bing Webmaster Tools for Bing visibility
- Ahrefs or SEMrush for keyword tracking
- PageSpeed Insights for performance monitoring
- Lighthouse for SEO audits

## Content Strategy

### Current Content

- Interactive learning games
- Progress tracking
- Achievement system
- Customization options

### Recommended Content Additions

- Blog posts about Japanese learning tips
- Tutorials and guides
- JLPT preparation resources
- Cultural insights
- Success stories
- FAQ section

## Link Building Strategy

### Internal Linking

- Clear navigation structure
- Breadcrumbs (recommended to add)
- Related content links
- Footer links to important pages

### External Linking

- GitHub repository
- Social media profiles
- Educational resources
- Partner sites (if applicable)

## Local SEO (If Applicable)

If KanaDojo expands to physical locations or local services:

- Add LocalBusiness schema
- Google My Business listing
- Local keywords
- Location pages

## Social Media Integration

### Current

- Open Graph tags for Facebook, LinkedIn
- Twitter Card tags
- Social sharing buttons (recommended to add)

### Recommended

- Social media profiles in structured data
- Regular social media posts
- Community engagement
- User-generated content

## Conversion Optimization

### Current

- Clear call-to-actions
- Easy navigation
- Progress tracking
- Gamification elements

### Recommended

- A/B testing for key pages
- User feedback collection
- Newsletter signup (if applicable)
- Community forum or Discord

## Maintenance Schedule

### Weekly

- Monitor Google Search Console for errors
- Check for broken links
- Review analytics data

### Monthly

- Update sitemap if new pages added
- Review and update meta descriptions
- Check keyword rankings
- Analyze competitor SEO

### Quarterly

- Comprehensive SEO audit
- Update structured data
- Review and refresh content
- Update keywords based on trends

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Web.dev SEO](https://web.dev/learn/seo/)
- [Moz SEO Learning Center](https://moz.com/learn/seo)

## Contact

For SEO-related questions or suggestions:

- Email: dev@kanadojo.com
- GitHub: https://github.com/lingdojo/kanadojo

---

Last Updated: January 2025
