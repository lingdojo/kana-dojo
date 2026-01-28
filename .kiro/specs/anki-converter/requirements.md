# Requirements Document

## Introduction

The Anki Converter is a comprehensive tool that enables users to convert Anki deck files from various formats (.apkg, .tsv, SQLite databases, and other Anki-supported formats) into structured JSON files containing only text content. The system provides both a web-based interface with drag-and-drop functionality and a command-line interface for programmatic access. The converter handles the complexity of Anki's data structures while producing clean, well-structured JSON output optimized for different deck types.

## Glossary

- **Anki Converter**: The system that transforms Anki deck files into JSON format
- **APKG File**: Anki package file format containing deck data, media, and metadata
- **TSV File**: Tab-separated values file format used by Anki for simple imports/exports
- **SQLite Database**: The database format used internally by Anki to store deck information
- **Deck**: A collection of flashcards organized by topic or subject
- **Card**: A single flashcard containing front/back content or cloze deletions
- **Note**: The underlying data structure in Anki that generates one or more cards
- **Note Type**: Template defining the structure and fields of notes (e.g., Basic, Cloze)
- **Field**: A named data element within a note (e.g., "Front", "Back", "Extra")
- **Media Reference**: HTML tags or text references to images, audio, or video files
- **Cloze Deletion**: A type of card where portions of text are hidden for recall practice
- **Web Interface**: The browser-based tool accessible via application route
- **CLI Tool**: Command-line interface script for programmatic conversion
- **JSON Output**: The structured JavaScript Object Notation file produced by conversion

## Requirements

### Requirement 1

**User Story:** As a language learner, I want to upload my Anki deck files through a web interface, so that I can easily convert them to JSON without technical knowledge.

#### Acceptance Criteria

1. WHEN a user visits the converter page THEN the Web Interface SHALL display a drag-and-drop zone with clear upload instructions
2. WHEN a user drags an Anki file over the drop zone THEN the Web Interface SHALL provide visual feedback indicating the drop zone is active
3. WHEN a user drops a supported file format THEN the Anki Converter SHALL accept the file and begin processing
4. WHEN a user clicks the file selection button THEN the Web Interface SHALL open a native file picker dialog
5. WHERE the file picker is displayed WHEN a user selects a file THEN the Anki Converter SHALL accept files with extensions .apkg, .tsv, .db, .sqlite, .anki2, and .colpkg

### Requirement 2

**User Story:** As a developer, I want to use a CLI tool to convert Anki decks programmatically, so that I can integrate the conversion into automated workflows.

#### Acceptance Criteria

1. WHEN a user executes the CLI script with a valid file path THEN the CLI Tool SHALL process the Anki file and output JSON
2. WHEN a user executes the CLI script with an output path parameter THEN the CLI Tool SHALL write the JSON to the specified location
3. WHEN a user executes the CLI script without required parameters THEN the CLI Tool SHALL display usage instructions with examples
4. WHEN a user executes the CLI script with the help flag THEN the CLI Tool SHALL display comprehensive documentation
5. WHEN the CLI script encounters an error THEN the CLI Tool SHALL output descriptive error messages to stderr and exit with non-zero status

### Requirement 3

**User Story:** As a user, I want the converter to handle all Anki file formats, so that I can convert any deck regardless of its export format.

#### Acceptance Criteria

1. WHEN a user provides an APKG file THEN the Anki Converter SHALL extract and parse the internal SQLite database
2. WHEN a user provides a TSV file THEN the Anki Converter SHALL parse tab-separated values according to Anki's TSV specification
3. WHEN a user provides a SQLite database file THEN the Anki Converter SHALL query the database schema and extract all deck data
4. WHEN a user provides a COLPKG file THEN the Anki Converter SHALL extract the collection database and process all decks
5. WHEN a user provides an ANKI2 file THEN the Anki Converter SHALL parse the database using Anki's schema version 2 structure

### Requirement 4

**User Story:** As a user, I want the converter to extract only text content, so that I receive clean data without media file dependencies.

#### Acceptance Criteria

1. WHEN the Anki Converter encounters HTML image tags THEN the Anki Converter SHALL remove the tags and preserve surrounding text
2. WHEN the Anki Converter encounters audio tags THEN the Anki Converter SHALL remove the tags and preserve surrounding text
3. WHEN the Anki Converter encounters video tags THEN the Anki Converter SHALL remove the tags and preserve surrounding text
4. WHEN the Anki Converter encounters media file references THEN the Anki Converter SHALL strip the references while maintaining text content
5. WHEN the Anki Converter processes HTML content THEN the Anki Converter SHALL preserve text formatting markers (bold, italic, underline) as plain text indicators

### Requirement 5

**User Story:** As a user, I want the JSON output to be well-structured and intuitive, so that I can easily parse and use the converted data.

#### Acceptance Criteria

1. WHEN the Anki Converter processes a basic note type THEN the JSON Output SHALL structure cards with clearly labeled front and back fields
2. WHEN the Anki Converter processes a cloze note type THEN the JSON Output SHALL include the full text with cloze markers and individual cloze variations
3. WHEN the Anki Converter processes custom note types THEN the JSON Output SHALL include all field names and values in a fields object
4. WHEN the Anki Converter processes multiple decks THEN the JSON Output SHALL organize cards hierarchically by deck name
5. WHEN the Anki Converter processes cards with tags THEN the JSON Output SHALL include tags as an array for each card

### Requirement 6

**User Story:** As a web user, I want the converted JSON to download automatically, so that I can immediately access my converted deck data.

#### Acceptance Criteria

1. WHEN the Anki Converter completes processing THEN the Web Interface SHALL trigger an automatic download of the JSON file
2. WHEN the download is triggered THEN the Web Interface SHALL name the file using the original deck name with .json extension
3. WHEN multiple decks are converted THEN the Web Interface SHALL name the file using the collection name or timestamp
4. WHEN the download completes THEN the Web Interface SHALL display a success message with file statistics
5. WHEN the download fails THEN the Web Interface SHALL display an error message and offer retry options

### Requirement 7

**User Story:** As a user, I want to see conversion progress, so that I understand the system is working on large deck files.

#### Acceptance Criteria

1. WHEN the Anki Converter begins processing THEN the Web Interface SHALL display a progress indicator
2. WHILE the Anki Converter is processing WHEN progress updates occur THEN the Web Interface SHALL update the progress percentage
3. WHILE the Anki Converter is processing THEN the Web Interface SHALL display the current processing stage
4. WHEN the Anki Converter processes large files THEN the Web Interface SHALL remain responsive and not freeze
5. WHEN the Anki Converter completes processing THEN the Web Interface SHALL display total cards converted and processing time

### Requirement 8

**User Story:** As a user, I want comprehensive error handling, so that I understand what went wrong if conversion fails.

#### Acceptance Criteria

1. WHEN a user provides an invalid file format THEN the Anki Converter SHALL reject the file with a descriptive error message
2. WHEN a user provides a corrupted APKG file THEN the Anki Converter SHALL detect the corruption and report specific issues
3. WHEN the Anki Converter encounters unsupported schema versions THEN the Anki Converter SHALL report the version and suggest solutions
4. WHEN the Anki Converter encounters database errors THEN the Anki Converter SHALL log detailed error information for debugging
5. IF file parsing fails THEN the Anki Converter SHALL provide actionable guidance for resolving the issue

### Requirement 9

**User Story:** As a user searching for Anki conversion tools, I want the converter page to appear in search results, so that I can discover this tool when I need it.

#### Acceptance Criteria

1. WHEN search engines crawl the converter page THEN the Web Interface SHALL provide semantic HTML with proper heading hierarchy
2. WHEN search engines index the page THEN the Web Interface SHALL include comprehensive meta tags for Anki-related keywords
3. WHEN the page is shared on social media THEN the Web Interface SHALL provide Open Graph tags with descriptive content
4. WHEN search engines evaluate page content THEN the Web Interface SHALL include structured data markup for the tool
5. WHEN users search for Anki conversion terms THEN the Web Interface SHALL include relevant keywords in page title, headings, and content

### Requirement 10

**User Story:** As a user with complex Anki decks, I want the converter to handle advanced features, so that I don't lose important deck structure.

#### Acceptance Criteria

1. WHEN the Anki Converter processes nested decks THEN the JSON Output SHALL preserve the hierarchical deck structure
2. WHEN the Anki Converter processes cards with scheduling information THEN the JSON Output SHALL optionally include review statistics
3. WHEN the Anki Converter processes suspended cards THEN the JSON Output SHALL mark cards with their suspension status
4. WHEN the Anki Converter processes cards with multiple note fields THEN the JSON Output SHALL include all fields with their original names
5. WHEN the Anki Converter processes decks with custom styling THEN the Anki Converter SHALL extract text content while ignoring CSS

### Requirement 11

**User Story:** As a user, I want the converter to handle edge cases gracefully, so that conversion succeeds even with unusual deck configurations.

#### Acceptance Criteria

1. WHEN the Anki Converter processes empty decks THEN the Anki Converter SHALL produce valid JSON with zero cards
2. WHEN the Anki Converter processes decks with special characters in names THEN the Anki Converter SHALL sanitize names for valid filenames
3. WHEN the Anki Converter processes cards with extremely long content THEN the Anki Converter SHALL handle the content without truncation
4. WHEN the Anki Converter processes decks with Unicode content THEN the Anki Converter SHALL preserve all Unicode characters correctly
5. WHEN the Anki Converter processes malformed HTML in card content THEN the Anki Converter SHALL extract text content despite HTML errors

### Requirement 12

**User Story:** As a user concerned about privacy, I want all conversion to happen locally, so that my deck data never leaves my device.

#### Acceptance Criteria

1. WHEN a user uploads a file to the Web Interface THEN the Anki Converter SHALL process the file entirely in the browser
2. WHEN the Anki Converter processes files THEN the Anki Converter SHALL not transmit any deck data to external servers
3. WHEN the conversion completes THEN the Web Interface SHALL clear all file data from browser memory
4. WHEN a user navigates away from the page THEN the Web Interface SHALL not retain any uploaded file data
5. WHEN the page loads THEN the Web Interface SHALL display a privacy notice explaining local-only processing
