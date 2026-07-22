# IndexNow Setup Guide

IndexNow is a protocol that allows websites to instantly notify search engines (Bing, Yandex, Seznam.cz, Naver, etc.) about content updates for immediate indexing.

## Setup Steps

### 1. Generate IndexNow Key

Generate a unique API key (UUID format recommended):

```bash
# Using Node.js
node -e "console.log(crypto.randomUUID())"

# Or use an online UUID generator
# https://www.uuidgenerator.net/
```

Example key: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 2. Add Key to Environment Variables

Add to your `.env.local` file:

```bash
INDEXNOW_KEY=your-generated-uuid-here
```

### 3. Create Public Key File

Create a text file in the `public/` directory with your key as the filename:

```bash
# File: public/a1b2c3d4-e5f6-7890-abcd-ef1234567890.txt
# Content: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

The file should contain ONLY the key (no extra whitespace or newlines).

**Important:** Add this file to Git and deploy it to production.

### 4. Verify Setup

After deployment, verify the key file is accessible:

```
https://kanadojo.com/[your-key].txt
```

It should return your key as plain text.

### 5. Submit to Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site if not already added
3. Navigate to **Sitemaps & IndexNow**
4. Submit your IndexNow API key
5. Verify that submissions work

## Usage

### Automatic Submission (Recommended)

Call the utility functions when content changes:

```typescript
import {
  notifyPageUpdate,
  notifyPageUpdateAllLocales,
} from '@/shared/utils/indexnow';

// When publishing a new blog post
await notifyPageUpdateAllLocales('/academy/new-post-slug');

// When updating a page
await notifyPageUpdate('/kana');

// After adding multiple new pages
await notifySitemapUpdate();
```

### Manual API Call

Submit URLs via the API endpoint:

```bash
# Single URL
curl -X POST https://kanadojo.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{"url": "https://kanadojo.com/kana"}'

# Multiple URLs
curl -X POST https://kanadojo.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://kanadojo.com/kana", "https://kanadojo.com/kanji"]}'
```

## Integration Points

Consider adding IndexNow notifications to:

1. **Blog Post Publishing** - When a new Academy post is created or updated
2. **Content Updates** - When main pages (Kana, Kanji, Vocabulary) are updated
3. **New Features** - When adding new pages or major features
4. **Sitemap Generation** - After running `npm run postbuild` (sitemap generation)
5. **Translation Updates** - When adding new localized content

## Monitoring

Track IndexNow submissions:

1. Check **Bing Webmaster Tools** → **URL Inspection** → **IndexNow**
2. Monitor API responses in your logs
3. Verify indexed pages in Bing search: `site:kanadojo.com [your-new-page]`

## Benefits

- **Instant Indexing**: Pages can be indexed within minutes instead of days/weeks
- **Cross-Engine**: One submission notifies multiple search engines
- **Free**: No cost, no rate limits for legitimate use
- **SEO Advantage**: Faster indexing = faster rankings for new content
- **Bing Priority**: Bing explicitly prioritizes sites using IndexNow

## Troubleshooting

### Key File Not Accessible

- Ensure the file is in `public/` directory
- Check that the filename exactly matches your key
- Verify the file is deployed to production
- Check there are no extra file extensions (.txt.txt)

### Submissions Failing

- Verify `INDEXNOW_KEY` environment variable is set in production
- Check that URLs are using `https://kanadojo.com` domain
- Ensure the key matches the public key file
- Review API error responses in logs

### Not Seeing Results in Bing

- IndexNow notifies search engines but doesn't guarantee immediate indexing
- Typically takes 1-24 hours for Bing to crawl and index
- Check Bing Webmaster Tools for crawl errors
- Ensure your page has no robots.txt blocks or noindex tags

## Resources

- [IndexNow Official Documentation](https://www.indexnow.org/)
- [Bing IndexNow Guide](https://www.bing.com/indexnow)
- [IndexNow API Specification](https://www.indexnow.org/documentation)

