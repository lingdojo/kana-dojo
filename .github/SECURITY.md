# Security Policy

KanaDojo takes security seriously. This document describes how to report vulnerabilities and our security practices.

---

## Supported Versions

| Version          | Supported |
| ---------------- | --------- |
| Latest release   | ✅ Yes    |
| Previous release | ✅ Yes    |
| Older versions   | ❌ No     |

---

## Reporting a Vulnerability

### How to Report

If you believe you've found a security vulnerability in KanaDojo, please report it responsibly:

1. **Do NOT** open a public issue
2. Email: **dev@kanadojo.com**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Your contact information

### What to Expect

- **Response within 24-48 hours** acknowledging receipt
- **Initial assessment** within 5 business days
- **Updates** as we work on the fix
- **Credit** in release notes (unless you prefer anonymity)

---

## Scope

This policy applies to:

- **Application security**: XSS, CSRF, injection attacks
- **Authentication/Authorization**: Session management, access control
- **Data protection**: PII handling, encryption
- **Infrastructure**: Server configuration, deployment security
- **Dependencies**: Third-party library vulnerabilities

### Out of Scope

- Social engineering attacks
- Physical security
- Issues in third-party services we integrate with (report to them directly)

---

## Security Best Practices

### For Contributors

When contributing code, follow these security practices:

#### 1. Input Validation

Always validate user input:

```typescript
// ❌ Wrong - no validation
const userId = request.url.searchParams.get('id');
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ Correct - validated and typed
const userId = parseInt(request.url.searchParams.get('id') || '0');
if (userId <= 0) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
}
```

#### 2. Sanitize Output

Prevent XSS attacks:

```typescript
// ❌ Wrong - raw output
<div>{userInput}</div>

// ✅ Correct - sanitized
import { sanitize } from '@/shared/lib/security';
<div>{sanitize(userInput)}</div>
```

#### 3. Use Environment Variables for Secrets

```typescript
// ❌ Wrong - hardcoded secret
const apiKey = 'sk-12345...';

// ✅ Correct - from environment
const apiKey = process.env.API_KEY;
```

#### 4. Follow the Principle of Least Privilege

Only request necessary permissions:

```typescript
// ❌ Wrong - excessive permissions
await octokit.request('GET /user', {
  headers: { authorization: `token ${token}` }
});

// ✅ Correct - minimal scope
await octokit.request('GET /user', {
  headers: { authorization: `token ${token}` },
  mediaType: { previews: ['machine-man'] }
});
```

### Environment Variables

Never commit secrets to the repository:

```
# .env.local (never commit this)
GOOGLE_TRANSLATE_API_KEY=your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

Required secrets are set in Vercel, not in the codebase.

---

## Dependencies Security

### Dependency Updates

- **Dependabot**: Automatically scans for vulnerabilities
- **Update frequency**: Weekly checks for updates
- **Critical fixes**: Applied as soon as possible

### Checking for Vulnerabilities

```bash
# Check for known vulnerabilities
npm audit

# Check for outdated packages
npm outdated
```

---

## Data Protection

### What We Collect

KanaDojo collects minimal user data:

- **Learning progress**: Stats on questions answered, accuracy
- **Preferences**: Theme, font, and settings (stored locally)
- **Analytics**: Anonymous usage data via PostHog

### What We Don't Collect

- Personal identifying information (unless you provide it)
- Payment information (no payments processed)
- Location data (no GPS tracking)

### Data Storage

| Data Type      | Storage      | Retention     |
| -------------- | ------------ | ------------- |
| Learning stats | localStorage | Until cleared |
| Preferences    | localStorage | Until cleared |
| Analytics      | PostHog      | 1 year        |
| Translations   | Vercel Edge  | Permanent     |

---

## Compliance

### GDPR (Europe)

- Data is stored locally on user devices
- Analytics is anonymized
- No tracking cookies
- Users can request data deletion

### CCPA (California)

- No sale of personal data
- Minimal data collection
- Users control their learning data

---

## Security Resources

### External Links

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security](https://nextjs.org/docs/security)

### Internal Documentation

- [Architecture](./ARCHITECTURE.md)
- [Performance](./PERFORMANCE_OPTIMIZATIONS.md)

---

## Attribution

Thank you to security researchers who help keep KanaDojo safe!

**Hall of Fame** (with permission):

- [Add your name here]

---

## Contact

For security concerns:

- **Email**: dev@kanadojo.com
- **PGP Key**: [Coming soon]

For non-security issues:

- **GitHub Issues**: https://github.com/lingdojo/kanadojo/issues
- **Discord**: [Link coming soon]

---

**Last Updated**: January 2025
