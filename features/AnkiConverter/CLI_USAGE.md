# Anki Converter CLI Usage Guide

Complete guide for using the Anki Converter command-line tool.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Command Options](#command-options)
- [Examples](#examples)
- [Output Format](#output-format)
- [Error Handling](#error-handling)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Installation

The CLI tool is included with the KanaDojo project. No separate installation required.

**Prerequisites:**

- Node.js 18+
- npm or yarn

**Verify Installation:**

```bash
npm run anki:convert -- --version
```

## Basic Usage

The most basic conversion requires an input file and output path:

```bash
npm run anki:convert -- --input <input-file> --output <output-file>
```

**Example:**

```bash
npm run anki:convert -- --input my-deck.apkg --output my-deck.json
```

### Short Form

Use `-i` and `-o` for brevity:

```bash
npm run anki:convert -- -i my-deck.apkg -o my-deck.json
```

## Command Options

### Required Options

| Option     | Short | Description           | Example              |
| ---------- | ----- | --------------------- | -------------------- |
| `--input`  | `-i`  | Input file path       | `--input deck.apkg`  |
| `--output` | `-o`  | Output JSON file path | `--output deck.json` |

### Optional Flags

| Option                | Description                     | Default |
| --------------------- | ------------------------------- | ------- |
| `--include-stats`     | Include card review statistics  | `false` |
| `--include-suspended` | Include suspended cards         | `false` |
| `--format <format>`   | Force specific format detection | `auto`  |
| `--help`              | Display help information        | -       |
| `--version`           | Display version number          | -       |

### Format Options

When using `--format`, specify one of:

- `auto` - Automatic detection (default)
- `apkg` - Anki Package format
- `tsv` - Tab-separated values
- `sqlite` - SQLite database
- `colpkg` - Collection package
- `anki2` - Legacy Anki database

## Examples

### Basic Conversion

Convert an APKG file to JSON:

```bash
npm run anki:convert -- -i japanese-vocab.apkg -o japanese-vocab.json
```

### Include Statistics

Include card review statistics in the output:

```bash
npm run anki:convert -- -i deck.apkg -o deck.json --include-stats
```

**Output includes:**

- Number of reviews
- Lapse count
- Current interval
- Ease factor

### Include Suspended Cards

By default, suspended cards are excluded. To include them:

```bash
npm run anki:convert -- -i deck.apkg -o deck.json --include-suspended
```

### Force Format Detection

If automatic detection fails, force a specific format:

```bash
npm run anki:convert -- -i myfile.db -o output.json --format sqlite
```

### TSV File Conversion

Convert a tab-separated values file:

```bash
npm run anki:convert -- -i flashcards.tsv -o flashcards.json --format tsv
```

### Collection Package

Convert an entire collection:

```bash
npm run anki:convert -- -i collection.colpkg -o collection.json
```

### All Options Combined

Use all available options:

```bash
npm run anki:convert -- \
  -i my-deck.apkg \
  -o my-deck.json \
  --include-stats \
  --include-suspended \
  --format apkg
```

### Batch Processing (Shell Script)

Convert multiple files using a shell script:

**Bash/Linux/macOS:**

```bash
#!/bin/bash
for file in *.apkg; do
  output="${file%.apkg}.json"
  npm run anki:convert -- -i "$file" -o "$output"
done
```

**PowerShell/Windows:**

```powershell
Get-ChildItem *.apkg | ForEach-Object {
  $output = $_.BaseName + ".json"
  npm run anki:convert -- -i $_.Name -o $output
}
```

### Using Relative Paths

Input and output paths can be relative or absolute:

```bash
# Relative paths
npm run anki:convert -- -i ./decks/vocab.apkg -o ./output/vocab.json

# Absolute paths
npm run anki:convert -- -i /home/user/decks/vocab.apkg -o /home/user/output/vocab.json
```

### Output to Different Directory

Specify a different output directory:

```bash
npm run anki:convert -- -i deck.apkg -o ../converted/deck.json
```

## Output Format

The CLI produces formatted JSON with 2-space indentation.

### Basic Output Structure

```json
{
  "decks": [
    {
      "name": "Deck Name",
      "description": "Deck description",
      "cards": [...]
    }
  ],
  "metadata": {
    "convertedAt": "2025-01-26T10:30:00.000Z",
    "sourceFormat": "apkg",
    "totalDecks": 1,
    "totalCards": 100,
    "noteTypes": ["Basic", "Cloze"],
    "processingTime": 245
  }
}
```

### With Statistics

When using `--include-stats`:

```json
{
  "cards": [
    {
      "id": "1234567890",
      "type": "basic",
      "front": "Question",
      "back": "Answer",
      "stats": {
        "reviews": 42,
        "lapses": 3,
        "interval": 30,
        "ease": 2500
      }
    }
  ]
}
```

### With Suspended Cards

When using `--include-suspended`:

```json
{
  "cards": [
    {
      "id": "1234567890",
      "type": "basic",
      "front": "Question",
      "back": "Answer",
      "suspended": true
    }
  ]
}
```

## Error Handling

### Exit Codes

- `0` - Success
- `1` - Error occurred

### Common Errors

#### File Not Found

```
❌ Error: Input file not found
   /path/to/missing-file.apkg
```

**Solution:** Verify the file path is correct.

#### Permission Denied

```
❌ Error: Permission denied
   Cannot read/write file
```

**Solution:** Check file permissions or run with appropriate user.

#### Invalid Format

```
❌ Conversion failed:
   The file 'file.xyz' is not a recognized Anki format.
   Supported formats: .apkg, .tsv, .db, .sqlite, .anki2, .colpkg
```

**Solution:** Ensure file is a supported format or use `--format` to force detection.

#### Corrupted File

```
❌ Conversion failed:
   The APKG file appears to be corrupted. Unable to read ZIP archive.
```

**Solution:** Re-export the deck from Anki or try a different file.

#### Out of Memory

```
❌ Conversion failed:
   Out of memory while processing large deck.
```

**Solution:** Close other applications or use a machine with more RAM.

### Verbose Error Output

Errors include detailed information:

```
❌ Conversion failed:
   Failed to parse SQLite database

   Details:
   - file: deck.apkg
   - stage: parsing
   - error: SQLITE_CORRUPT
```

## Advanced Usage

### Piping Output

Pipe JSON output to other tools:

```bash
npm run anki:convert -- -i deck.apkg -o - | jq '.metadata.totalCards'
```

### Conditional Conversion

Only convert if output doesn't exist:

```bash
if [ ! -f output.json ]; then
  npm run anki:convert -- -i deck.apkg -o output.json
fi
```

### Logging

Redirect output to log file:

```bash
npm run anki:convert -- -i deck.apkg -o deck.json 2>&1 | tee conversion.log
```

### Progress Monitoring

The CLI displays real-time progress:

```
🔄 Starting conversion...

Parsing: [████████████████████████████████████████] 100% - Extracting cards
```

### Automation with npm Scripts

Add custom scripts to `package.json`:

```json
{
  "scripts": {
    "convert:vocab": "npm run anki:convert -- -i vocab.apkg -o vocab.json",
    "convert:all": "npm run anki:convert -- -i collection.colpkg -o collection.json --include-stats"
  }
}
```

Then run:

```bash
npm run convert:vocab
npm run convert:all
```

### Integration with CI/CD

Use in continuous integration:

```yaml
# .github/workflows/convert.yml
name: Convert Anki Decks
on: [push]
jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run anki:convert -- -i deck.apkg -o deck.json
      - uses: actions/upload-artifact@v2
        with:
          name: converted-deck
          path: deck.json
```

## Troubleshooting

### Command Not Found

**Error:** `npm: command not found` or `anki:convert: command not found`

**Solution:** Ensure Node.js and npm are installed:

```bash
node --version
npm --version
```

### Permission Issues

**Error:** `EACCES: permission denied`

**Solution:** Check file permissions:

```bash
# Linux/macOS
chmod 644 input-file.apkg
chmod 755 output-directory/

# Or run with sudo (not recommended)
sudo npm run anki:convert -- -i deck.apkg -o deck.json
```

### Large File Processing

**Issue:** Conversion is very slow or runs out of memory

**Solutions:**

1. Close other applications
2. Use a machine with more RAM
3. Split large decks into smaller ones in Anki
4. Increase Node.js memory limit:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run anki:convert -- -i large-deck.apkg -o output.json
```

### Encoding Issues

**Issue:** Special characters appear incorrectly

**Solution:** Ensure UTF-8 encoding:

```bash
# Check file encoding
file -i input.tsv

# Convert to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 input.tsv > input-utf8.tsv
```

### Format Detection Fails

**Issue:** "Unknown format" error despite valid file

**Solution:** Force format detection:

```bash
npm run anki:convert -- -i file.db -o output.json --format sqlite
```

### Output File Already Exists

**Issue:** Want to prevent overwriting existing files

**Solution:** Check before converting:

```bash
if [ -f output.json ]; then
  echo "Output file already exists!"
  exit 1
fi
npm run anki:convert -- -i deck.apkg -o output.json
```

## Performance Tips

1. **Use SSD storage** for faster file I/O
2. **Close unnecessary applications** to free memory
3. **Process smaller batches** instead of entire collections
4. **Use `--format`** to skip detection for known formats
5. **Avoid network drives** for input/output files

## Getting Help

### Display Help

```bash
npm run anki:convert -- --help
```

### Check Version

```bash
npm run anki:convert -- --version
```

### Report Issues

If you encounter bugs or have feature requests:

1. Check existing issues on GitHub
2. Provide sample files (if possible)
3. Include error messages and system info
4. Describe expected vs actual behavior

## Related Documentation

- [Main README](./README.md) - Feature overview
- [JSON Output Format](./JSON_FORMAT.md) - Detailed output specification
- [API Reference](./README.md#api-reference) - Programmatic usage

---

**Last Updated**: January 2025
