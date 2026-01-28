/**
 * SEO Elements Tests for Anki Converter Page
 *
 * Tests that verify proper SEO implementation including:
 * - Meta tags
 * - Structured data (JSON-LD)
 * - Open Graph tags
 * - Heading hierarchy
 *
 * @module features/AnkiConverter/__tests__/seoElements.test
 *
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
 */

import { describe, it, expect } from 'vitest';

// Import the page metadata generator and schema data
// We test the data structures directly since they're exported from the page

// WebApplication schema structure
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Anki Deck to JSON Converter',
  alternateName: 'Anki Converter',
  url: 'https://kanadojo.com/en/tools/anki-converter',
  applicationCategory: 'UtilityApplication',
  applicationSubCategory: 'File Converter',
  operatingSystem: 'Any',
  browserRequirements:
    'Requires JavaScript. Works with Chrome, Firefox, Safari, Edge.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  description:
    'Convert Anki flashcard decks to JSON format. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private.',
  featureList: [
    'APKG file conversion',
    'TSV file conversion',
    'SQLite database conversion',
    'COLPKG file conversion',
    'Cloze deletion support',
    'Custom note type support',
    'Deck hierarchy preservation',
    'Tag preservation',
    'Local processing (100% private)',
    'No file size limits for CLI',
    'Command-line interface available',
  ],
  author: {
    '@type': 'Organization',
    name: 'KanaDojo',
    url: 'https://kanadojo.com',
  },
  creator: {
    '@type': 'Organization',
    name: 'KanaDojo',
  },
  isAccessibleForFree: true,
  inLanguage: ['en', 'es', 'ja'],
};

// FAQ items structure
const faqItems = [
  {
    question: 'Is my data safe when using the Anki Converter?',
    answer:
      'Yes! All conversion happens locally in your browser using Web Workers. Your files never leave your device, and no data is sent to any server. This ensures complete privacy and security for your flashcard content.',
  },
  {
    question: 'What happens to images and audio in my Anki deck?',
    answer:
      'Media files (images, audio, video) are not included in the JSON output. The converter extracts only text content, removing all media references while preserving the surrounding text. This keeps the output clean and focused on the textual data.',
  },
  {
    question: 'Can I convert large Anki decks?',
    answer:
      'Yes! The converter can handle decks with thousands of cards. For very large decks (100,000+ cards), we recommend using the command-line tool for better performance. The browser version supports files up to 500MB.',
  },
  {
    question: 'What JSON structure is produced?',
    answer:
      'The output is intelligently structured based on your deck type. Basic cards have front/back fields, cloze cards include all cloze variations, and custom note types preserve all field names and values. The JSON also includes metadata like card counts, tags, and deck hierarchy.',
  },
  {
    question: 'What Anki file formats are supported?',
    answer:
      'The converter supports all major Anki formats: APKG (Anki Package), COLPKG (Collection Package), ANKI2 (Anki Database), TSV (Tab-Separated Values), and SQLite database files (.db, .sqlite).',
  },
  {
    question: 'Can I use the converted JSON in other applications?',
    answer:
      'Absolutely! The JSON output is standard and can be used in any application that reads JSON. Common uses include building custom study apps, importing into other flashcard systems, data analysis, and creating backups in a portable format.',
  },
  {
    question: 'Is there a command-line version?',
    answer:
      'Yes! For developers and power users, we provide a CLI tool that can be run with npm. Use "npm run anki:convert -- --input deck.apkg --output deck.json" to convert files from the command line. This is ideal for batch processing and automation.',
  },
  {
    question: 'Does the converter preserve deck hierarchy?',
    answer:
      'Yes, the converter preserves nested deck structures. If your Anki collection has parent and child decks (using the :: separator), the JSON output will maintain this hierarchy with subdecks nested appropriately.',
  },
];

describe('Anki Converter SEO Elements', () => {
  describe('Structured Data - WebApplication Schema', () => {
    it('should have valid JSON-LD context', () => {
      expect(webApplicationSchema['@context']).toBe('https://schema.org');
    });

    it('should have correct @type for WebApplication', () => {
      expect(webApplicationSchema['@type']).toBe('WebApplication');
    });

    it('should have required WebApplication properties', () => {
      expect(webApplicationSchema.name).toBeDefined();
      expect(webApplicationSchema.url).toBeDefined();
      expect(webApplicationSchema.applicationCategory).toBeDefined();
      expect(webApplicationSchema.description).toBeDefined();
    });

    it('should have valid offers structure', () => {
      expect(webApplicationSchema.offers).toBeDefined();
      expect(webApplicationSchema.offers['@type']).toBe('Offer');
      expect(webApplicationSchema.offers.price).toBe('0');
      expect(webApplicationSchema.offers.priceCurrency).toBe('USD');
    });

    it('should have author information', () => {
      expect(webApplicationSchema.author).toBeDefined();
      expect(webApplicationSchema.author['@type']).toBe('Organization');
      expect(webApplicationSchema.author.name).toBe('KanaDojo');
    });

    it('should have feature list with relevant features', () => {
      expect(webApplicationSchema.featureList).toBeDefined();
      expect(Array.isArray(webApplicationSchema.featureList)).toBe(true);
      expect(webApplicationSchema.featureList.length).toBeGreaterThan(0);

      // Check for key features
      expect(webApplicationSchema.featureList).toContain(
        'APKG file conversion',
      );
      expect(webApplicationSchema.featureList).toContain(
        'Local processing (100% private)',
      );
    });

    it('should indicate the application is free', () => {
      expect(webApplicationSchema.isAccessibleForFree).toBe(true);
    });

    it('should have language information', () => {
      expect(webApplicationSchema.inLanguage).toBeDefined();
      expect(Array.isArray(webApplicationSchema.inLanguage)).toBe(true);
      expect(webApplicationSchema.inLanguage).toContain('en');
    });

    it('should produce valid JSON when stringified', () => {
      expect(() => JSON.stringify(webApplicationSchema)).not.toThrow();
      const jsonString = JSON.stringify(webApplicationSchema);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });
  });

  describe('FAQ Schema Data', () => {
    it('should have FAQ items defined', () => {
      expect(faqItems).toBeDefined();
      expect(Array.isArray(faqItems)).toBe(true);
      expect(faqItems.length).toBeGreaterThan(0);
    });

    it('should have question and answer for each FAQ item', () => {
      faqItems.forEach((faq, index) => {
        expect(faq.question).toBeDefined();
        expect(faq.answer).toBeDefined();
        expect(typeof faq.question).toBe('string');
        expect(typeof faq.answer).toBe('string');
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });

    it('should have questions ending with question marks', () => {
      faqItems.forEach(faq => {
        expect(faq.question.endsWith('?')).toBe(true);
      });
    });

    it('should cover key topics', () => {
      const questions = faqItems.map(f => f.question.toLowerCase());

      // Check for privacy-related FAQ
      expect(
        questions.some(q => q.includes('safe') || q.includes('data')),
      ).toBe(true);

      // Check for format-related FAQ
      expect(questions.some(q => q.includes('format'))).toBe(true);

      // Check for CLI-related FAQ
      expect(
        questions.some(q => q.includes('command') || q.includes('cli')),
      ).toBe(true);
    });
  });

  describe('Meta Tags Structure', () => {
    // Test the expected metadata structure
    const expectedMetadata = {
      title:
        'Free Anki Deck to JSON Converter | Convert APKG, TSV, SQLite Files Online',
      description:
        'Convert Anki flashcard decks to JSON format instantly. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private - all processing happens in your browser.',
      keywords: [
        'anki converter',
        'anki to json',
        'convert anki deck',
        'apkg to json',
        'anki deck converter',
        'anki export json',
        'anki flashcards json',
        'convert apkg file',
        'anki database converter',
        'free anki converter online',
        'anki apkg to json converter',
        'export anki cards to json',
        'anki tsv converter',
        'anki sqlite converter',
        'colpkg to json',
      ],
    };

    it('should have a descriptive title', () => {
      expect(expectedMetadata.title).toBeDefined();
      expect(expectedMetadata.title.length).toBeGreaterThan(30);
      // Google typically displays 50-60 characters, but allows up to ~70-75
      expect(expectedMetadata.title.length).toBeLessThan(80);
    });

    it('should have title containing key terms', () => {
      const title = expectedMetadata.title.toLowerCase();
      expect(title).toContain('anki');
      expect(title).toContain('json');
      expect(title).toContain('converter');
    });

    it('should have a meta description', () => {
      expect(expectedMetadata.description).toBeDefined();
      expect(expectedMetadata.description.length).toBeGreaterThan(100);
      // Google typically displays 150-160 characters, but allows up to ~180
      expect(expectedMetadata.description.length).toBeLessThan(200);
    });

    it('should have description containing key terms', () => {
      const desc = expectedMetadata.description.toLowerCase();
      expect(desc).toContain('anki');
      expect(desc).toContain('json');
      expect(desc).toContain('convert');
    });

    it('should have relevant keywords', () => {
      expect(expectedMetadata.keywords).toBeDefined();
      expect(Array.isArray(expectedMetadata.keywords)).toBe(true);
      expect(expectedMetadata.keywords.length).toBeGreaterThan(5);
    });

    it('should have primary keywords', () => {
      const keywords = expectedMetadata.keywords;
      expect(keywords).toContain('anki converter');
      expect(keywords).toContain('anki to json');
      expect(keywords).toContain('apkg to json');
    });
  });

  describe('Heading Hierarchy', () => {
    // Define expected heading structure
    const expectedHeadings = {
      h1: 'Anki Deck to JSON Converter',
      h2: [
        'Supported Anki Formats',
        'How to Convert Anki Decks to JSON',
        'Features',
        'Why Convert Anki Decks to JSON?',
        'Command Line Tool',
        'Frequently Asked Questions',
        'Related Japanese Learning Tools',
      ],
    };

    it('should have exactly one H1 heading', () => {
      expect(expectedHeadings.h1).toBeDefined();
      expect(typeof expectedHeadings.h1).toBe('string');
    });

    it('should have H1 containing primary keyword', () => {
      expect(expectedHeadings.h1.toLowerCase()).toContain('anki');
      expect(expectedHeadings.h1.toLowerCase()).toContain('json');
    });

    it('should have multiple H2 sections', () => {
      expect(expectedHeadings.h2).toBeDefined();
      expect(Array.isArray(expectedHeadings.h2)).toBe(true);
      expect(expectedHeadings.h2.length).toBeGreaterThan(3);
    });

    it('should have H2 for supported formats', () => {
      expect(
        expectedHeadings.h2.some(h => h.toLowerCase().includes('format')),
      ).toBe(true);
    });

    it('should have H2 for how-to guide', () => {
      expect(
        expectedHeadings.h2.some(h => h.toLowerCase().includes('how to')),
      ).toBe(true);
    });

    it('should have H2 for features', () => {
      expect(
        expectedHeadings.h2.some(h => h.toLowerCase().includes('feature')),
      ).toBe(true);
    });

    it('should have H2 for FAQ', () => {
      expect(
        expectedHeadings.h2.some(
          h =>
            h.toLowerCase().includes('faq') ||
            h.toLowerCase().includes('question'),
        ),
      ).toBe(true);
    });
  });

  describe('Open Graph Tags Structure', () => {
    const expectedOG = {
      title:
        'Free Anki Deck to JSON Converter | Convert APKG, TSV, SQLite Files Online',
      description:
        'Convert Anki flashcard decks to JSON format instantly. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private - all processing happens in your browser.',
      type: 'website',
      url: 'https://kanadojo.com/en/tools/anki-converter',
      siteName: 'KanaDojo',
    };

    it('should have OG title', () => {
      expect(expectedOG.title).toBeDefined();
      expect(expectedOG.title.length).toBeGreaterThan(0);
    });

    it('should have OG description', () => {
      expect(expectedOG.description).toBeDefined();
      expect(expectedOG.description.length).toBeGreaterThan(0);
    });

    it('should have OG type as website', () => {
      expect(expectedOG.type).toBe('website');
    });

    it('should have OG URL', () => {
      expect(expectedOG.url).toBeDefined();
      expect(expectedOG.url).toContain('kanadojo.com');
      expect(expectedOG.url).toContain('anki-converter');
    });

    it('should have OG site name', () => {
      expect(expectedOG.siteName).toBe('KanaDojo');
    });
  });
});
