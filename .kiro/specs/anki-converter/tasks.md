# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create feature directory structure: `features/AnkiConverter/`
  - Add subdirectories: `components/`, `lib/`, `parsers/`, `hooks/`, `types/`
  - Install dependencies: `jszip`, `sql.js`, `fast-check` (dev)
  - Add CLI dependencies: `better-sqlite3`, `commander`
  - Create barrel export: `features/AnkiConverter/index.ts`
  - _Requirements: All_

- [x] 2. Implement core type definitions
  - Create TypeScript interfaces for Anki data structures (Note, Card, Deck, NoteType)
  - Define conversion pipeline interfaces (ConversionOptions, ConversionResult, ProgressEvent)
  - Define output JSON structure types (OutputCard, BasicCard, ClozeCard, CustomCard)
  - Define error types (ConversionError, ErrorCode)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Implement file format detection
  - Create format detection utility that identifies file type from magic bytes and extension
  - Support detection for APKG, TSV, SQLite, COLPKG, ANKI2 formats
  - Handle edge cases like missing extensions or ambiguous formats
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 Write property test for format detection
  - **Property 1: File format detection accuracy**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [x] 4. Implement text extraction and HTML cleaning
  - Create text extractor that removes all HTML tags
  - Implement media tag removal (img, audio, video, [sound:...])
  - Preserve text formatting indicators (convert <b> to **text**, etc.)
  - Handle malformed HTML gracefully
  - Clean and normalize whitespace
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 11.5_

- [x] 4.1 Write property test for media tag removal
  - **Property 2: Media tag removal completeness**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 4.2 Write property test for HTML cleaning idempotence
  - **Property 11: HTML to text conversion idempotence**
  - **Validates: Requirements 4.5**

- [x] 4.3 Write property test for Unicode preservation
  - **Property 6: Unicode character preservation**
  - **Validates: Requirements 11.4**

- [x] 5. Implement APKG parser
  - Create APKG parser that unzips .apkg files using JSZip
  - Extract collection.anki2 database from ZIP
  - Initialize sql.js with extracted database
  - Handle corrupted ZIP files with descriptive errors
  - _Requirements: 3.1, 8.2_

- [x] 5.1 Write property test for APKG processing
  - **Property 1: File format detection accuracy (APKG subset)**
  - **Validates: Requirements 3.1**

- [x] 6. Implement SQLite parser
  - Create SQLite parser that queries Anki database schema
  - Detect schema version from database
  - Extract notes from 'notes' table
  - Extract cards from 'cards' table
  - Extract decks from 'decks' table (JSON column)
  - Extract note types from 'notetypes' table (JSON column)
  - Join related tables to build complete card data
  - Handle schema version differences (v2, v11, v21)
  - _Requirements: 3.3, 3.5, 8.3_

- [x] 6.1 Write property test for card count preservation
  - **Property 4: Card count preservation**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [x] 7. Implement TSV parser
  - Create TSV parser that splits on tab characters
  - Handle escaped characters (\t, \n, \\)
  - Detect field structure from first row or content
  - Support Anki's TSV format with optional tags column
  - Handle edge cases like empty fields and Unicode
  - _Requirements: 3.2_

- [x] 8. Implement COLPKG parser
  - Create COLPKG parser that unzips .colpkg files
  - Extract collection.anki21 or collection.anki2
  - Handle media21 manifest file
  - Process all decks in collection
  - Reuse SQLite parser for database extraction
  - _Requirements: 3.4_

- [x] 9. Implement JSON builder
  - Create JSON builder that structures parsed data
  - Detect note type (basic, cloze, custom) and structure accordingly
  - For basic cards: create front/back structure
  - For cloze cards: extract cloze deletions and generate variations
  - For custom cards: preserve all field names and values
  - Build hierarchical deck structure for nested decks
  - Include tags array for each card
  - Generate conversion metadata (timestamp, stats, format)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.1_

- [x] 9.1 Write property test for JSON validity
  - **Property 3: JSON output validity**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 9.2 Write property test for deck hierarchy preservation
  - **Property 5: Deck hierarchy preservation**
  - **Validates: Requirements 10.1**

- [x] 9.3 Write property test for cloze extraction
  - **Property 10: Cloze deletion extraction**
  - **Validates: Requirements 5.2**

- [x] 9.4 Write property test for field name preservation
  - **Property 8: Field name preservation**
  - **Validates: Requirements 5.3, 10.4**

- [x] 9.5 Write property test for tag array consistency
  - **Property 9: Tag array consistency**
  - **Validates: Requirements 5.5**

- [x] 10. Implement conversion pipeline orchestrator
  - Create pipeline coordinator that manages conversion stages
  - Implement stage progression: detection → parsing → extraction → transformation → building
  - Add event emitter for progress updates
  - Calculate and emit progress percentages (0-100)
  - Implement error handling with ConversionError types
  - Add recovery strategies for recoverable errors
  - _Requirements: 7.2, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10.1 Write property test for progress monotonicity
  - **Property 13: Progress event monotonicity**
  - **Validates: Requirements 7.2**

- [x] 10.2 Write property test for error message quality
  - **Property 12: Error message descriptiveness**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 11. Implement filename sanitization
  - Create utility to sanitize deck names for valid filenames
  - Remove or replace special characters (/, \, :, \*, ?, ", <, >, |)
  - Handle Unicode characters appropriately
  - Ensure filename length limits (255 characters)
  - Add .json extension
  - Handle multiple decks with collection name or timestamp
  - _Requirements: 6.2, 6.3, 11.2_

- [x] 11.1 Write property test for filename sanitization
  - **Property 14: File name sanitization safety**
  - **Validates: Requirements 11.2**

- [x] 12. Implement Web Worker for browser processing
  - Create Web Worker script for background conversion
  - Set up message passing between main thread and worker
  - Implement progress event forwarding from worker to main thread
  - Handle errors in worker and pass to main thread
  - Implement memory cleanup after conversion
  - _Requirements: 7.4, 12.1, 12.2, 12.3_

- [x] 12.1 Write property test for local processing
  - **Property 15: Local processing guarantee**
  - **Validates: Requirements 12.1, 12.2**

- [x] 13. Implement web interface component
  - Create ConverterInterface React component
  - Implement drag-and-drop zone with visual feedback
  - Add file selection button with file picker
  - Set file input accept attribute for supported formats
  - Display progress indicator during conversion
  - Show progress percentage and current stage
  - Display conversion statistics on completion
  - Implement automatic JSON file download
  - Show error messages with retry options
  - Add privacy notice about local processing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.4, 6.5, 7.1, 7.3, 12.5_

- [x] 13.1 Write unit tests for file acceptance
  - Test that all supported extensions are accepted
  - Test that unsupported extensions are rejected
  - _Requirements: 1.5, 8.1_

- [x] 14. Implement file download mechanism
  - Create utility to trigger browser download
  - Generate filename from deck name or collection name
  - Create Blob from JSON string
  - Use URL.createObjectURL and anchor element for download
  - Clean up object URL after download
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 15. Implement CLI tool
  - Create Node.js CLI script at `scripts/anki-converter.ts`
  - Use commander for argument parsing
  - Add --input/-i flag for input file path
  - Add --output/-o flag for output file path
  - Add --include-stats flag for optional statistics
  - Add --include-suspended flag for suspended cards
  - Add --help/-h flag for documentation
  - Implement file reading from filesystem
  - Reuse conversion pipeline for processing
  - Write JSON output to specified file
  - Display progress in terminal with spinner or progress bar
  - Output errors to stderr with exit code 1
  - Display usage instructions when parameters missing
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 15.1 Write unit tests for CLI argument parsing
  - Test help flag displays documentation
  - Test missing parameters shows usage
  - _Requirements: 2.3, 2.4_

- [x] 15.2 Write property test for CLI error handling
  - **Property 12: Error message descriptiveness (CLI subset)**
  - **Validates: Requirements 2.5**

- [x] 16. Add npm script for CLI tool
  - Add "anki:convert" script to package.json
  - Configure TypeScript compilation for CLI script
  - Test CLI execution with sample files
  - _Requirements: 2.1_

- [x] 17. Handle edge cases
  - Implement empty deck handling (return valid JSON with empty array)
  - Handle extremely long card content without truncation
  - Test with decks containing 10,000+ cards
  - Implement file size limits (500MB browser, 2GB CLI)
  - Add zip bomb protection (10x compression ratio limit)
  - _Requirements: 11.1, 11.3_

- [x] 17.1 Write property test for empty deck handling
  - **Property 7: Empty deck handling**
  - **Validates: Requirements 11.1**

- [x] 17.2 Write property test for long content handling
  - Test that extremely long content is not truncated
  - _Requirements: 11.3_

- [x] 18. Create converter page route
  - Create page at `app/[locale]/tools/anki-converter/page.tsx`
  - Import and render ConverterInterface component
  - Add loading state with skeleton
  - _Requirements: 1.1_

- [x] 19. Implement SEO optimization
  - Add page metadata with title and description
  - Create comprehensive page content with H1, H2, H3 headings
  - Add "Supported Anki Formats" section with descriptions
  - Add "How to Convert" step-by-step guide
  - Add "Features" list highlighting key benefits
  - Add "Why Convert Anki Decks to JSON?" section
  - Add "Command Line Tool" section with usage examples
  - Add FAQ section with common questions
  - Implement structured data (Schema.org WebApplication)
  - Add Open Graph tags for social sharing
  - Add relevant keywords throughout content
  - Ensure semantic HTML with proper heading hierarchy
  - Add internal links from tools page and learning resources
  - Update sitemap with high priority (0.8)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 19.1 Write tests for SEO elements
  - Test that page has proper meta tags
  - Test that structured data is valid JSON-LD
  - Test that Open Graph tags are present
  - Test that heading hierarchy is correct
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 20. Create test fixtures
  - Create sample Anki decks for testing:
    - `test-basic.apkg`: Simple basic cards (10 cards)
    - `test-cloze.apkg`: Cloze deletions (10 cards)
    - `test-nested.apkg`: Nested deck structure (3 decks, 30 cards)
    - `test-unicode.apkg`: Japanese/Chinese/Arabic content (10 cards)
    - `test-custom.apkg`: Custom note types with many fields (10 cards)
    - `test-empty.apkg`: Empty deck (0 cards)
    - `test-large.tsv`: TSV with 1000 rows
  - Store in `features/AnkiConverter/__tests__/fixtures/`
  - _Requirements: All_

- [x] 21. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Add feature to tools page
  - Add Anki Converter to tools listing page
  - Create card/link with icon and description
  - Add to navigation if applicable
  - _Requirements: 9.5_

- [x] 23. Add documentation
  - Create README in feature directory explaining architecture
  - Document CLI usage with examples
  - Add JSDoc comments to public APIs
  - Document JSON output format with examples
  - _Requirements: 2.4_

- [x] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
