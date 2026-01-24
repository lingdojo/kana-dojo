# Implementation Plan

- [x] 1. Set up feature structure and core types
  - [x] 1.1 Create Conjugator feature directory structure
    - Create `features/Conjugator/` with subdirectories: `components/`, `lib/`, `store/`, `data/`, `hooks/`, `__tests__/`
    - Create barrel export `features/Conjugator/index.ts`

    - _Requirements: 11.1_

  - [x] 1.2 Define core TypeScript interfaces and types
    - Create `features/Conjugator/types.ts` with VerbInfo, ConjugationForm, ConjugationResult, VerbType, IrregularType, ConjugationCategory interfaces
    - _Requirements: 11.1, 11.2_

  - [x] 1.3 Write property test for serialization round-trip
    - **Property 16: Serialization Round-Trip**
    - **Validates: Requirements 11.4, 11.5**

- [x] 2. Implement verb classification engine
  - [x] 2.1 Create verb classification data
    - Create `features/Conjugator/data/verbData.ts` with IRREGULAR_VERBS mapping, GODAN_ENDINGS mapping, and Ichidan verb detection rules
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.2 Implement classifyVerb function
    - Create `features/Conjugator/lib/engine/classifyVerb.ts`
    - Implement verb type detection (Godan, Ichidan, Irregular)
    - Implement stem extraction logic
    - Handle irregular verb identification (する, 来る, ある, 行く, honorific verbs)
    - _Requirements: 9.1, 9.2, 2.1-2.8_

  - [x] 2.3 Write property test for verb analysis correctness
    - **Property 13: Verb Analysis Correctness**
    - **Validates: Requirements 9.1, 9.2**

  - [x] 2.4 Write unit tests for irregular verb classification
    - Test する, 来る, ある, 行く, honorific verbs (くださる, なさる, いらっしゃる, おっしゃる, ござる)
    - _Requirements: 2.3-2.6, 4.7_

- [x] 3. Implement core conjugation engine
  - [x] 3.1 Create conjugation form definitions
    - Create `features/Conjugator/data/conjugationForms.ts` with all 30+ form definitions organized by category
    - _Requirements: 3.1-3.13_

  - [x] 3.2 Implement Godan verb conjugation
    - Create `features/Conjugator/lib/engine/conjugateGodan.ts`

    - Implement all vowel-grade transformations (a, i, u, e, o stems)
    - Implement te-form sound changes (って, んで, いて, いで, して)
    - Handle 行く exception for te-form
    - _Requirements: 2.1, 4.1-4.6_

  - [x] 3.3 Write property test for te-form sound changes
    - **Property 8: Te-form Sound Changes**
    - **Validates: Requirements 4.1-4.6**

  - [x] 3.4 Implement Ichidan verb conjugation
    - Create `features/Conjugator/lib/engine/conjugateIchidan.ts`
    - Implement stem + suffix pattern for all forms
    - Include both traditional (-られる) and colloquial (-れる) potential forms
    - _Requirements: 2.2, 4.9_

  - [x] 3.5 Write property test for Ichidan potential dual forms
    - **Property 9: Ichidan Potential Dual Forms**
    - **Validates: Requirements 4.9**

  - [x] 3.6 Implement irregular verb conjugation
    - Create `features/Conjugator/lib/engine/conjugateIrregular.ts`
    - Implement する conjugation patterns
    - Implement 来る conjugation patterns
    - Implement ある conjugation (including ない negative)
    - Implement 行く conjugation (including 行って te-form)
    - Implement honorific verb patterns (ます instead of ります)
    - _Requirements: 2.3-2.6, 4.7, 4.8_

  - [x] 3.7 Write unit tests for irregular verb conjugations
    - Test all forms for する, 来る, ある, 行く
    - Test honorific verb masu-forms
    - _Requirements: 2.3-2.6, 4.7, 4.8_

  - [x] 3.8 Implement compound verb conjugation
    - Create `features/Conjugator/lib/engine/conjugateCompound.ts`
    - Handle する-compound verbs (勉強する, etc.)
    - Handle 来る-compound verbs (持ってくる, etc.)
    - Preserve prefix while conjugating
    - _Requirements: 2.7, 2.8_

  - [x] 3.9 Write property test for compound verb prefix preservation
    - **Property 7: Compound Verb Prefix Preservation**
    - **Validates: Requirements 2.7, 2.8**

- [x] 4. Implement main conjugation API
  - [x] 4.1 Create main conjugate function
    - Create `features/Conjugator/lib/engine/conjugate.ts`
    - Integrate classifyVerb with appropriate conjugation function
    - Return complete ConjugationResult with all forms
    - Implement input validation (empty, whitespace, invalid characters)
    - _Requirements: 1.1, 1.3, 1.4, 11.2, 11.3_

  - [x] 4.2 Write property test for conjugation completeness
    - **Property 1: Conjugation Completeness**
    - **Validates: Requirements 1.1, 3.1-3.13**

  - [x] 4.3 Write property test for whitespace input rejection
    - **Property 3: Whitespace Input Rejection**
    - **Validates: Requirements 1.3**

  - [x] 4.4 Write property test for conjugation determinism
    - **Property 14: Conjugation Determinism**
    - **Validates: Requirements 11.2**

  - [x] 4.5 Write property test for pure function behavior
    - **Property 15: Pure Function Behavior**
    - **Validates: Requirements 11.3**

  - [x] 4.6 Implement romaji conversion
    - Create `features/Conjugator/lib/romajiConverter.ts`
    - Convert hiragana/katakana to romaji for all conjugation outputs
    - _Requirements: 1.5_

  - [x] 4.7 Write property test for output format completeness
    - **Property 4: Output Format Completeness**
    - **Validates: Requirements 1.5**

- [x] 5. Checkpoint - Ensure all conjugation engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Zustand store and history
  - [x] 6.1 Create conjugator store
    - Create `features/Conjugator/store/useConjugatorStore.ts`
    - Implement state: inputText, result, isLoading, error, expandedCategories
    - Implement actions: setInputText, conjugate, toggleCategory, expandAll, collapseAll
    - _Requirements: 1.1, 5.2_

  - [x] 6.2 Implement history persistence
    - Add history state and actions to store
    - Implement localStorage persistence with Zustand persist middleware
    - Implement loadHistory, addToHistory, deleteFromHistory, clearHistory, restoreFromHistory
    - _Requirements: 8.1-8.4_

  - [x] 6.3 Write property test for history persistence
    - **Property 11: History Persistence**
    - **Validates: Requirements 8.1**

  - [x] 6.4 Write property test for history restoration correctness
    - **Property 12: History Restoration Correctness**
    - **Validates: Requirements 8.3**

- [x] 7. Implement UI components
  - [x] 7.1 Create ConjugatorInput component
    - Create `features/Conjugator/components/ConjugatorInput.tsx`
    - Implement text input with Japanese font support
    - Add conjugate button with loading state
    - Implement keyboard shortcut (Enter to conjugate)
    - Display validation errors
    - _Requirements: 1.1, 1.3, 1.4, 5.1, 5.3_

  - [x] 7.2 Create VerbInfoCard component
    - Create `features/Conjugator/components/VerbInfoCard.tsx`
    - Display detected verb type (Godan/Ichidan/Irregular)
    - Display verb stem
    - Show conjugation rule explanation on expand
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 7.3 Create ConjugationCategory component
    - Create `features/Conjugator/components/ConjugationCategory.tsx`
    - Implement collapsible card with smooth animation
    - Display category name in English and Japanese
    - List all forms within category with kanji, hiragana, romaji
    - Add copy button for each form
    - Implement hover/focus highlighting
    - _Requirements: 5.2, 5.3, 5.7, 6.1_

  - [x] 7.4 Create ConjugationResults component
    - Create `features/Conjugator/components/ConjugationResults.tsx`
    - Render VerbInfoCard and all ConjugationCategory components
    - Implement expand all / collapse all buttons
    - Add copy all button
    - _Requirements: 5.2, 6.2_

  - [x] 7.5 Write property test for copy-all format completeness
    - **Property 10: Copy-All Format Completeness**
    - **Validates: Requirements 6.2**

  - [x] 7.6 Create ConjugationHistory component
    - Create `features/Conjugator/components/ConjugationHistory.tsx`
    - Display recent verbs as clickable chips/cards
    - Add delete button for individual entries
    - Add clear all button
    - _Requirements: 8.2, 8.3, 8.4_

  - [x] 7.7 Create ConjugatorPage component
    - Create `features/Conjugator/components/ConjugatorPage.tsx`
    - Compose all components with responsive layout
    - Implement mobile-first responsive design
    - Add proper ARIA labels and keyboard navigation
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 10.1, 10.2, 10.3_

- [x] 8. Implement SEO components and structured data
  - [x] 8.1 Create SEO meta tag generation
    - Create `features/Conjugator/lib/seo/generateMeta.ts`
    - Implement base page meta tags
    - Implement dynamic verb-specific meta tags
    - Generate canonical URLs
    - _Requirements: 13.1, 13.3, 15.1, 15.2, 15.5_

  - [x] 8.2 Write property test for dynamic meta tag generation
    - **Property 18: Dynamic Meta Tag Generation**
    - **Validates: Requirements 13.3, 15.1, 15.2, 15.5**

  - [x] 8.3 Create JSON-LD structured data
    - Create `features/Conjugator/lib/seo/structuredData.ts`
    - Implement WebApplication schema
    - Implement FAQPage schema with comprehensive Q&As
    - Implement HowTo schema
    - Implement BreadcrumbList schema
    - Implement dynamic verb-specific DefinedTerm schema
    - _Requirements: 13.2, 15.4_

  - [x] 8.4 Write property test for structured data completeness
    - **Property 19: Structured Data Completeness**
    - **Validates: Requirements 13.2**

  - [x] 8.5 Create SEOContent component
    - Create `features/Conjugator/components/SEOContent.tsx`
    - Write educational content about Japanese verb conjugation
    - Include verb type explanations (Godan, Ichidan, Irregular)
    - Include common conjugation forms explained
    - Add tips for learning Japanese verb conjugation
    - Implement proper heading hierarchy (h2, h3)
    - _Requirements: 13.4, 13.5, 14.1, 14.4_

  - [x] 8.6 Write property test for SEO content presence
    - **Property 20: SEO Content Presence**
    - **Validates: Requirements 13.4, 13.5**

  - [x] 8.7 Create FAQ component
    - Create `features/Conjugator/components/FAQ.tsx`
    - Implement comprehensive FAQ section with 15+ questions
    - Use semantic HTML for FAQ items
    - _Requirements: 13.6_

  - [x] 8.8 Create internal links component
    - Create `features/Conjugator/components/RelatedFeatures.tsx`
    - Link to Kana practice, Kanji, Vocabulary, Translator, Academy
    - _Requirements: 13.8_

- [x] 9. Create page route and URL handling
  - [x] 9.1 Create conjugate page route
    - Create `app/[locale]/(main)/conjugate/page.tsx`
    - Implement server-side meta tag generation
    - Add StructuredData component
    - Handle verb URL parameter for SSR
    - _Requirements: 12.1, 12.2, 13.1, 13.2, 15.5_

  - [x] 9.2 Write property test for URL parameter conjugation
    - **Property 17: URL Parameter Conjugation**
    - **Validates: Requirements 12.2**

  - [x] 9.3 Implement URL state synchronization
    - Update URL when verb is conjugated
    - Read verb from URL on page load
    - Implement share button to copy URL
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 9.4 Create loading state component
    - Create `app/[locale]/(main)/conjugate/loading.tsx`
    - Implement skeleton loading UI
    - _Requirements: 5.3_

- [x] 10. Implement accessibility features
  - [x] 10.1 Add ARIA labels and roles
    - Add appropriate ARIA labels to all interactive elements
    - Implement proper role attributes for custom components
    - Add aria-live regions for dynamic content updates
    - _Requirements: 10.2_

  - [x] 10.2 Implement keyboard navigation
    - Ensure all interactive elements are focusable
    - Implement keyboard shortcuts (Enter to conjugate, Escape to clear)
    - Add visible focus indicators
    - _Requirements: 10.1, 10.3_

  - [x] 10.3 Verify color contrast
    - Ensure all text meets WCAG AA contrast requirements
    - Test with color blindness simulators
    - _Requirements: 10.4_

- [x] 11. Implement sitemap integration
  - [x] 11.1 Add conjugator to sitemap
    - Update `next-sitemap.config.js` to include /conjugate route
    - Add popular verb URLs to sitemap
    - _Requirements: 15.3_

- [x] 12. Add translations
  - [x] 12.1 Create translation keys
    - Add conjugator namespace to all locale files
    - Include UI labels, error messages, form names, category names
    - Add SEO content translations
    - _Requirements: 5.8_

- [x] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
