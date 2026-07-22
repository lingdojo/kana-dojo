# 🚨 REQUIRED: IndexNow Setup Instructions

**⚠️ CRITICAL: Complete these steps to activate instant Bing indexing**

## Step 1: Generate UUID Key

Run this command in your terminal:

```bash
node -e "console.log(crypto.randomUUID())"
```

**Copy the output** (it will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

## Step 2: Create Public Key File

Create a new file in the `public/` directory with the UUID as the filename:

**Example:** If your UUID is `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

```bash
# Create the file:
echo "a1b2c3d4-e5f6-7890-abcd-ef1234567890" > public/a1b2c3d4-e5f6-7890-abcd-ef1234567890.txt
```

**Important:**
- Filename is: `[YOUR-UUID].txt`
- Content is: `[YOUR-UUID]` (same UUID, just the text)
- No extra whitespace or line breaks
- Must be in the `public/` folder

---

## Step 3: Add Environment Variable

Add to your `.env.local` file:

```bash
INDEXNOW_KEY=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Replace** `a1b2c3d4-e5f6-7890-abcd-ef1234567890` with your actual UUID.

---

## Step 4: Add to Production Environment

Add the same environment variable to your production hosting (Vercel):

1. Go to Vercel Dashboard → kanadojo project
2. Settings → Environment Variables
3. Add new variable:
   - **Name:** `INDEXNOW_KEY`
   - **Value:** `[your-uuid-here]`
   - **Environment:** Production (and Preview if you want)
4. Save

---

## Step 5: Commit and Deploy

```bash
# Add the key file to git
git add public/[your-uuid].txt

# Commit
git commit -m "chore(seo): add IndexNow key file"

# Push to deploy
git push
```

---

## Step 6: Verify After Deployment

1. **Check key file is accessible:**
   ```
   https://kanadojo.com/[your-uuid].txt
   ```
   Should return your UUID as plain text

2. **Test IndexNow endpoint:**
   ```
   https://kanadojo.com/api/indexnow
   ```
   Should return `{"service":"IndexNow API","configured":true,...}`

3. **Test a submission:**
   ```bash
   curl -X POST https://kanadojo.com/api/indexnow \
     -H "Content-Type: application/json" \
     -d '{"url": "https://kanadojo.com"}'
   ```

---

## Step 7: Submit to Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Add site if not already added: `kanadojo.com`
3. Verify ownership (you already have MS verification token)
4. Navigate to **Sitemaps & IndexNow** section
5. Submit your IndexNow API key (the UUID)
6. Verify that IndexNow is enabled

---

## Step 8: Integrate into Your Workflow

Add IndexNow notifications when you publish/update content:

```typescript
import { notifyPageUpdateAllLocales } from '@/shared/utils/indexnow';

// Example: When publishing a blog post
await notifyPageUpdateAllLocales('/academy/new-post-slug');

// Example: When updating a page
await notifyPageUpdate('/kana');
```

---

## ✅ Verification Checklist

- [ ] UUID generated
- [ ] Key file created in `public/[uuid].txt`
- [ ] Environment variable added to `.env.local`
- [ ] Environment variable added to Vercel/production
- [ ] Changes committed and pushed
- [ ] Key file accessible at `https://kanadojo.com/[uuid].txt`
- [ ] IndexNow API endpoint returns `configured: true`
- [ ] Submitted to Bing Webmaster Tools
- [ ] Tested a URL submission
- [ ] Added to content publishing workflow (optional but recommended)

---

## 📍 Quick Reference

**Your UUID:** `_______________________________________`
(Write it here for reference)

**Key file location:** `public/[your-uuid].txt`

**Environment variable:** `INDEXNOW_KEY=[your-uuid]`

**Verification URL:** `https://kanadojo.com/[your-uuid].txt`

---

## ❓ Troubleshooting

**Key file not accessible?**
- Make sure it's in the `public/` folder
- Check the filename exactly matches your UUID
- Verify it's deployed to production
- No extra `.txt.txt` extension

**API says not configured?**
- Check environment variable is set in production (not just locally)
- Redeploy after adding the environment variable
- Check for typos in the variable name

**Submissions failing?**
- Verify the UUID in your code matches the file
- Ensure URLs use `https://kanadojo.com` domain
- Check Bing Webmaster Tools for error messages

---

**⏰ Estimated Time:** 10-15 minutes

**🎯 Priority:** HIGH - Do this ASAP for instant Bing indexing

**📖 Full Documentation:** See `/docs/INDEXNOW_SETUP.md` for more details

---

**DELETE THIS FILE** after completing all steps.

