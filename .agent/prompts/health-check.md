# KanaDojo Comprehensive Codebase Health Check

You are a senior software architect and Full-Stack Engineer specializing in Next.js, React 19, TypeScript, performance optimization, and cloud deployment (Vercel). Perform a thorough health check of the **KanaDojo** codebase - a Japanese learning platform.

---

## Project Context

- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: Zustand with localStorage persistence
- **Internationalization**: next-intl with namespace-based translations
- **Testing**: Vitest with jsdom, fast-check for property testing
- **Build Tool**: Turbopack enabled
- **Deployment**: Vercel (Edge + Serverless functions)
- **Analytics**: Vercel Analytics, Speed Insights, PostHog
- **Package Manager**: npm

---

## 1. ARCHITECTURE ANALYSIS

### 1.1 Layer Architecture Compliance

- Verify `shared/` only contains code used by 2+ features
- Confirm `features/` directories are self-contained with no cross-feature imports
- Check barrel exports (`index.ts`) are properly maintained
- Identify any circular dependencies between features
- Report any business logic misplaced in `app/` pages

### 1.2 Directory Structure Validation

- Validate feature-based organization: `features/[name]/`
  - `components/`, `data/`, `lib/`, `hooks/`, `store/`, `__tests__/`
- Confirm all imports use path aliases (`@/features/`, `@/shared/`, `@/core/`)
- Ensure no relative imports across directory boundaries

### 1.3 State Management Patterns

- Review Zustand stores for proper localStorage persistence
- Check immutability in all state updates
- Verify selector functions for derived state
- Identify any state that should be moved to server state

### 1.4 API Route Architecture

- Review `app/api/` routes for:
  - Proper error handling and validation
  - Security headers and input sanitization
  - Response caching strategies
  - Edge vs Serverless function usage appropriateness

---

## 2. CODE QUALITY ASSESSMENT

### 2.1 TypeScript Strictness

- Run `tsc --noEmit` and report all errors/warnings
- Check for `any` types that should be typed
- Verify interface vs type alias usage (interfaces for public APIs)
- Review generic type parameter naming (`TItem`, `TConfig` not just `T`)
- Check for unused types, interfaces, and imports

### 2.2 React 19 Best Practices

- Verify usage of React 19 features (use, useActionState, useOptimistic)
- Check for unnecessary re-renders (missing memoization)
- Review hook dependencies for completeness
- Confirm proper use of `React.FC` or explicit return types
- Verify `use` hook usage for async resources

### 2.3 Component Design

- Check component file naming (PascalCase)
- Verify props interfaces are defined for all components
- Review component complexity (consider splitting large components)
- Check for proper error boundaries around components
- Verify lazy loading for heavy components

### 2.4 Custom Hooks Quality

- Verify all hooks use `use` prefix
- Check hooks are in `hooks/` directories within features
- Review hook naming conventions
- Ensure hooks follow single responsibility principle

---

## 3. PERFORMANCE OPTIMIZATION

### 3.1 Bundle Analysis

- Run `npm run analyze` ONLY when explicitly requested (it runs a full build).
- When run, report:
  - Total bundle size (JS, CSS, Images)
  - Largest modules by size
  - Duplicate dependencies
  - Code splitting effectiveness
  - Tree-shaking optimization

### 3.2 Rendering Performance

- Identify components needing `React.memo`
- Check expensive computations wrapped in `useMemo`
- Verify callback functions wrapped in `useCallback`
- Review `useEffect` dependencies for correctness
- Check for unnecessary re-renders in component trees

### 3.3 Data Fetching Strategy

- Review server vs client component usage
- Check for proper `loading.tsx` implementation
- Verify streaming with `Suspense` boundaries
- Review data caching strategies
- Check for prefetching opportunities

### 3.4 Image and Asset Optimization

- Verify `next/image` usage with proper sizing
- Check for unoptimized images
- Review font optimization (`next/font`)
- Check audio file sizes and formats
- Verify static asset caching headers

### 3.5 Database/Server Performance

- Review API route response times
- Check for N+1 query patterns
- Verify batched requests where applicable
- Review connection pooling if applicable

---

## 4. SECURITY AUDIT

### 4.1 Application Security

- Check for XSS vulnerabilities (dangerouslySetInnerHTML usage)
- Verify CSP headers configuration
- Review API route input validation and sanitization
- Check for exposed secrets in code
- Verify `poweredByHeader: false` in Next.js config

### 4.2 Authentication & Authorization

- Review any auth implementation
- Check for proper session management
- Verify role-based access control if applicable
- Review API route protection mechanisms

### 4.3 Dependency Security

- Run `npm audit --omit=dev` and report vulnerabilities
- Check for outdated dependencies with known CVEs
- Review dependency update strategy
- Verify lock file integrity

### 4.4 Data Protection

- Review PII handling and storage
- Check for secure data transmission (HTTPS)
- Verify no sensitive data in logs
- Review localStorage usage for sensitive data

### 4.5 Frontend Security

- Check for proper escape of user inputs
- Review event handler security
- Verify no `eval()` or similar dangerous functions
- Check iframe and third-party embedding policies

---

## 5. SEO OPTIMIZATION

### 5.1 Technical SEO

- Verify `robots.txt` configuration
- Check `sitemap.xml` generation and completeness
- Review `sitemap-0.xml` and all sitemap files
- Check canonical URL implementation
- Verify meta tags on all pages (title, description, Open Graph)

### 5.2 On-Page SEO

- Review heading hierarchy (H1, H2, H3 usage)
- Check for semantic HTML elements
- Verify image alt attributes
- Review internal linking structure
- Check for duplicate content issues

### 5.3 Performance Impact on SEO

- Report Core Web Vitals metrics
- Check First Contentful Paint (FCP)
- Verify Largest Contentful Paint (LCP)
- Review Cumulative Layout Shift (CLS)
- Check First Input Delay (FID) / Interaction to Next Paint (INP)

### 5.4 Internationalization SEO

- Verify `hreflang` implementation
- Check language tag attributes
- Review localized content structure
- Verify alternate links in head

---

## 6. VERCEL DEPLOYMENT & DATA USAGE

### 6.1 Build Configuration

- Review `next.config.ts` for Vercel optimization
- Check `next-sitemap.config.js` configuration
- Verify build command and output directory
- Review environment variables setup

### 6.2 Edge Functions & Serverless

- Identify Edge function usage and appropriateness
- Review serverless function timeout configurations
- Check cold start optimization strategies
- Verify function memory allocation

### 6.3 Data Transfer & Bandwidth

- Report estimated monthly data transfer
- Review caching strategies for data files
- Check CDN configuration and edge caching
- Verify compression strategies

### 6.4 Analytics & Monitoring

- Review Vercel Analytics integration
- Check Speed Insights configuration
- Verify PostHog setup and data collection
- Review error tracking and reporting

### 6.5 Cost Optimization

- Identify potential cost-saving opportunities
- Review function invocation patterns
- Check for unnecessary revalidations
- Verify build frequency and caching

---

## 7. TESTING COVERAGE & QUALITY

### 7.1 Test Suite Analysis

- Run `npm run test` and report:
  - Total test count and coverage
  - Passing/failing tests
  - Test execution time
- Review test file organization
- Check for test isolation issues

### 7.2 Testing Patterns

- Verify property tests with fast-check exist
- Check unit test coverage for critical functions
- Review integration test coverage
- Verify error boundary testing
- Check for flaky tests

### 7.3 Test Quality

- Review test descriptions (descriptive it/test names)
- Check for proper assertions
- Verify test data factories/mocks
- Review test performance and parallelization

### 7.4 Coverage Gaps

- Identify untested critical paths
- Check edge case coverage
- Review error handling test coverage
- Identify integration test gaps

---

## 8. ACCESSIBILITY (A11Y)

### 8.1 WCAG 2.1 AA Compliance

- Check color contrast ratios
- Verify keyboard navigation
- Review focus management
- Check for skip links
- Verify proper ARIA attributes

### 8.2 Screen Reader Compatibility

- Check heading structure for screen readers
- Verify image alt text completeness
- Review form label associations
- Check for live region usage
- Verify semantic HTML usage

### 8.3 Motor Accessibility

- Check touch target sizes (minimum 44x44px)
- Verify sufficient spacing between interactive elements
- Check for motion sensitivity (prefers-reduced-motion)
- Review keyboard-only functionality

### 8.4 Accessibility Testing Tools

- Run automated accessibility tests
- Check for accessibility warnings
- Verify proper HTML landmark usage
- Check color blind compatibility

---

## 9. INTERNATIONALIZATION (i18n)

### 9.1 Translation Completeness

- Check all translation files for completeness
- Verify missing keys across languages
- Review translation file structure
- Check for hardcoded strings

### 9.2 Locale Handling

- Verify `next-intl` configuration
- Check routing with locale prefixes
- Review date/number formatting per locale
- Verify RTL support if applicable

### 9.3 String Quality

- Review translation strings for clarity
- Check for context in translation keys
- Verify pluralization handling
- Check gender/case variations

### 9.4 i18n Best Practices

- Verify `npm run i18n:check` passes
- Check translation key naming conventions
- Review fallback locale configuration
- Verify dynamic imports for locale files
- Ensure locales in `scripts/i18n/validate-translations.js` match `core/i18n/routing.ts`
- Ensure namespaces in `scripts/i18n/validate-translations.js` match `core/i18n/request.ts`

---

## 10. GIT & DEVELOPMENT WORKFLOW

### 10.1 Repository Health

- Review git history for meaningful commits
- Check branch naming conventions
- Verify pull request template usage
- Review code review practices

### 10.2 CI/CD Pipeline

- Check GitHub Actions or similar CI setup
- Review build and test automation
- Verify deployment pipeline
- Check for security scanning in CI

### 10.3 Commit Standards

- Review commit message consistency
- Check for automated formatting/linting in pre-commit
- Verify conventional commits usage
- Review release workflow

---

## 11. DEPENDENCY MANAGEMENT

### 11.1 Dependency Analysis

- Run `npm list --depth=0` and review dependencies
- Identify outdated packages
- Check for unused dependencies
- Review peer dependency conflicts
- Verify `next` and `@next/swc` versions match

### 11.2 Version Strategy

- Check for latest stable versions
- Review major version upgrade plans
- Verify lock file maintenance
- Check for duplicate packages

### 11.3 Performance Impact

- Review heavy dependencies for alternatives
- Check for tree-shaking friendly imports
- Verify dynamic imports for large libraries
- Review bundle size impact of each dependency

---

## 12. DOCUMENTATION

### 12.1 Code Documentation

- Check for JSDoc comments on public APIs
- Review complex function documentation
- Verify type comments for complex types
- Check for outdated comments

### 12.2 Project Documentation

- Review README completeness
- Check AGENTS.md usage and accuracy
- Verify contribution guidelines
- Review architecture decision records

### 12.3 API Documentation

- Verify API route documentation
- Check for Postman collection or API docs
- Review webhook documentation
- Verify error code documentation

---

## 13. MONITORING & OBSERVABILITY

### 13.1 Error Tracking

- Review error boundary implementation
- Check error reporting setup
- Verify error logging practices
- Review error recovery mechanisms

### 13.2 Performance Monitoring

- Check performance monitoring tools
- Review synthetic monitoring setup
- Verify real user monitoring (RUM)
- Check for performance budgets

### 13.3 Logging Strategy

- Review logging implementation
- Check for structured logging
- Verify log level usage (error, warn, info, debug)
- Review log retention policies

---

## 14. BEST PRACTICES COMPLIANCE

### 14.1 React Best Practices

- Verify functional components usage
- Check for proper use of hooks
- Review prop drilling vs context usage
- Verify component composition over inheritance

### 14.2 TypeScript Best Practices

- Check for strict null checks
- Verify no implicit any usage
- Review type inference usage
- Check for proper generics usage

### 14.3 CSS/Styling Best Practices

- Verify `cn()` utility usage for conditional classes
- Check Tailwind class organization
- Review CSS variable usage
- Verify responsive design implementation

### 14.4 Error Handling Best Practices

- Verify error boundaries around components
- Check for proper try/catch in async code
- Review error reporting implementation
- Verify graceful degradation

---

## 15. POTENTIAL IMPROVEMENTS

### 15.1 Quick Wins

- List low-effort, high-impact improvements
- Identify deprecated API replacements
- Suggest performance optimizations
- Recommend security hardening

### 15.2 Medium-Term Improvements

- Suggest refactoring opportunities
- Identify architectural improvements
- Recommend test coverage expansions
- Propose documentation improvements

### 15.3 Long-Term Strategy

- Identify technical debt items
- Suggest major upgrades or migrations
- Recommend architecture evolution
- Propose scalability improvements

---

## OUTPUT FORMAT

Provide your findings in this format:

```
# KanaDojo Codebase Health Check Report

## Executive Summary
- Overall Health Score: [X/100]
- Critical Issues: [N]
- Warnings: [N]
- Recommendations: [N]

## 1. Architecture
[Findings with file paths and line numbers]

## 2. Code Quality
[Findings with specific examples]

## 3. Performance
[Metrics and recommendations]

## 4. Security
[Vulnerabilities and fixes]

## 5. SEO
[Issues and recommendations]

## 6. Vercel & Data Usage
[Metrics and costs]

## 7. Testing
[Coverage and gaps]

## 8. Accessibility
[Issues by WCAG criteria]

## 9. Internationalization
[Completeness and issues]

## 10. Dependencies
[Outdated and vulnerable packages]

## 11. Documentation
[Missing and outdated docs]

## 12. Action Items
### Critical (Fix Immediately)
- [ ] [Issue description] - [File:Line]

### High Priority
- [ ] [Issue description] - [File:Line]

### Medium Priority
- [ ] [Issue description] - [File:Line]

### Low Priority / Nice to Have
- [ ] [Issue description] - [File:Line]

## 13. Overall Recommendations
[Strategic recommendations for codebase improvement]
```

---

## VERIFICATION COMMANDS

Run these commands to gather data:

```bash
# TypeScript check
npx tsc --noEmit --pretty

# ESLint check
npm run lint

# Full verification
npm run check

# Test suite
npm run test

# Bundle analysis
# NOTE: Runs a full build (slow). Only run when explicitly requested.
npm run analyze

# Bundle size regression check (requires a prior build)
npm run bundle:check

# i18n validation
npm run i18n:check

# Security audit
npm audit --omit=dev

# Format check
npm run format:check
```

## EXTRA INTEGRITY CHECKS

```bash
# Ensure Next.js and SWC versions match
npm ls next @next/swc
```

---

Begin your comprehensive analysis now. Examine all relevant files, run necessary commands, and provide actionable recommendations with specific file paths and line numbers.
