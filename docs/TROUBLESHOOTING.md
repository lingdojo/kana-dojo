# 🛠️ Troubleshooting Guide

This guide helps you resolve common issues when setting up and running KanaDojo locally.

---

## 🪟 Windows-Specific Issues

### Issue: Dev Server Won't Start on Windows

**Symptoms:**

- `npm run dev` command hangs or shows errors
- Build fails with network or font-related errors
- Terminal shows "Failed to fetch fonts from Google Fonts" errors

**Root Cause:**
Next.js attempts to download Google Fonts during development, which can be blocked by:

- Windows Firewall
- Antivirus software (Windows Defender, Norton, McAfee, etc.)
- Corporate proxy settings
- VPN configurations
- DNS resolution issues

**Solutions (try in order):**

#### Solution 1: Allow Node.js Through Firewall

1. Open **Windows Security** → **Firewall & network protection**
2. Click **"Allow an app through firewall"**
3. Click **"Change settings"** (requires admin)
4. Find **Node.js** in the list
5. Check both **Private** and **Public** boxes
6. Click **OK** and restart your terminal

#### Solution 2: Temporarily Disable Antivirus

1. Temporarily disable your antivirus software
2. Try running `npm run dev` again
3. If it works, add an exception for:
   - Your project folder
   - `node.exe` (usually in `C:\Program Files\nodejs\node.exe`)
   - `npm.exe` and `npx.exe`

#### Solution 3: Clear npm Cache and Reinstall

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall dependencies
npm install

# Try running dev server
npm run dev
```

#### Solution 4: Configure npm to Use HTTP Instead of HTTPS

Google Fonts might be blocked over HTTPS. Try:

```bash
npm config set strict-ssl false
npm install
npm run dev
```

**⚠️ Important:** Re-enable after setup:

```bash
npm config set strict-ssl true
```

#### Solution 5: Use Alternative DNS

Sometimes Windows DNS causes issues. Try using Google DNS or Cloudflare DNS:

1. Open **Settings** → **Network & Internet**
2. Click your connection → **Edit** (under DNS)
3. Choose **Manual** DNS
4. Add these DNS servers:
   - **Google DNS:** `8.8.8.8` and `8.8.4.4`
   - **Cloudflare DNS:** `1.1.1.1` and `1.0.0.1`
5. Save and restart your terminal

#### Solution 6: Configure Proxy (Corporate Networks)

If you're behind a corporate proxy:

```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

Replace with your actual proxy address. To check if proxy is set:

```bash
npm config get proxy
npm config get https-proxy
```

#### Solution 7: Bypass Font Loading (Advanced)

If all else fails and you just need to start developing, you can temporarily disable font loading:

1. **Comment out font imports in `static/fonts.ts`:**

Open `static/fonts.ts` and comment out the problematic font imports at the top:

```typescript
// Temporarily comment out all imports
/*
import {
  Noto_Sans_JP,
  Zen_Maru_Gothic,
  // ... rest of imports
} from 'next/font/google';
*/
```

2. **Create a fallback export:**

At the end of `static/fonts.ts`, replace the export with:

```typescript
// Temporary fallback for development
const fonts: any[] = [];
export default fonts;
```

3. **Run dev server:**

```bash
npm run dev
```

**⚠️ Important:** Remember to restore the original `static/fonts.ts` file before committing changes. This is only a temporary workaround for local development.

#### Solution 8: Use GitHub Codespaces or WSL2

If issues persist, consider these alternatives:

**Option A: GitHub Codespaces**

1. Go to your forked repository on GitHub
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for the environment to load
4. Run `npm install` and `npm run dev`
5. Access via the forwarded port

**Option B: Windows Subsystem for Linux (WSL2)**

```bash
# In PowerShell (as Administrator)
wsl --install

# After restart, open Ubuntu from Start Menu
# Clone your repo and set up in WSL2
cd ~
git clone https://github.com/<your-username>/kanadojo.git
cd kanadojo
npm install
npm run dev
```

WSL2 provides a Linux environment on Windows and typically avoids these font-fetching issues.

---

## 🍎 macOS-Specific Issues

### Issue: Permission Denied Errors

**Solution:**

```bash
sudo chown -R $USER ~/.npm
sudo chown -R $USER ./node_modules
```

### Issue: Port Already in Use

**Solution:**

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

## 🐧 Linux-Specific Issues

### Issue: ENOSPC Error (File Watchers)

**Solution:**

```bash
# Increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 🌐 General Network Issues

### Issue: Slow npm install

**Solution:**

```bash
# Use a faster registry mirror
npm config set registry https://registry.npmjs.org/

# Or try Cloudflare's mirror
npm config set registry https://registry.npmjs.cf/
```

### Issue: npm install Fails with ETIMEDOUT

**Solution:**

```bash
# Increase timeout
npm config set timeout 60000

# Retry installation
npm install --prefer-offline
```

---

## 🧰 Build Issues

### Issue: TypeScript Errors After npm install

**Solution:**

```bash
# Delete TypeScript cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall and rebuild
npm install
npm run build
```

### Issue: ESLint Configuration Errors

**Solution:**

```bash
# Reset ESLint cache
rm -rf .eslintcache

# Run lint fix
npm run lint:fix
```

---

## 📦 Dependency Issues

### Issue: Peer Dependency Warnings

**Solution:**
These are usually safe to ignore. If you want to resolve them:

```bash
npm install --legacy-peer-deps
```

### Issue: Package Vulnerabilities

**Solution:**

```bash
# Check vulnerabilities
npm audit

# Attempt automatic fix
npm audit fix

# For high-severity issues only
npm audit fix --force
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging

```bash
# See detailed npm logs
npm run dev --verbose

# Or for maximum detail
npm run dev --loglevel silly
```

### Check Node and npm Versions

For local development, we recommend Node.js 24 LTS.

```bash
node --version
npm --version   # Should be 10.x or higher
```

### Test Network Connectivity

```bash
# Test if Google Fonts is accessible
curl -I https://fonts.googleapis.com

# On Windows use:
# Invoke-WebRequest -Uri https://fonts.googleapis.com -Method Head
```

---

## 🆘 Still Having Issues?

If none of these solutions work:

1. **Check existing issues:** [GitHub Issues](https://github.com/lingdojo/kanadojo/issues)
2. **Open a new issue:**
   - Include your OS and versions (Node, npm)
   - Copy full error messages
   - Describe what you've tried
   - Add screenshots if applicable

3. **Community help:**
   - GitHub Discussions
   - Include relevant troubleshooting steps you've already tried

---

## ✅ Verify Your Setup

After resolving issues, verify everything works:

```bash
# Clean install
rm -rf node_modules .next
npm install

# Run development server
npm run dev

# In a new terminal, verify build works
npm run build

# Verify linting
npm run lint
```

If all commands complete successfully, you're ready to contribute! 🎉

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Node.js Troubleshooting](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [npm Documentation](https://docs.npmjs.com/)
- [WSL2 Setup Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
