// scripts/generateConstants.ts
// Run this script to generate unitSets.ts automatically
// Usage: tsx scripts/generateConstants.ts (requires tsx: npm i -D tsx)
// Or add to package.json: "generate:constants": "tsx scripts/generateConstants.ts"

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = join(__dirname, '../static');

// Helper to convert path to file:// URL for dynamic imports
const toFileURL = (path: string) => pathToFileURL(path).href;

// Dynamic imports for data files
async function generateConstants() {
  try {
    console.log('🔄 Loading data files...');

    // Import kanji files
    const n5Kanji = await import(toFileURL(join(staticDir, 'kanji/N5.js')));
    const n4Kanji = await import(toFileURL(join(staticDir, 'kanji/N4.js')));
    const n3Kanji = await import(toFileURL(join(staticDir, 'kanji/N3.js')));
    const n2Kanji = await import(toFileURL(join(staticDir, 'kanji/N2.js')));
    const n1Kanji = await import(toFileURL(join(staticDir, 'kanji/N1.js')));

    // Import vocab files
    const n5Vocab = await import(toFileURL(join(staticDir, 'vocab/n5.json')), {
      assert: { type: 'json' }
    });
    const n4Vocab = await import(toFileURL(join(staticDir, 'vocab/n4.json')), {
      assert: { type: 'json' }
    });
    const n3Vocab = await import(toFileURL(join(staticDir, 'vocab/n3.json')), {
      assert: { type: 'json' }
    });
    const n2Vocab = await import(toFileURL(join(staticDir, 'vocab/n2.json')), {
      assert: { type: 'json' }
    });
    const n1Vocab = await import(toFileURL(join(staticDir, 'vocab/n1.json')), {
      assert: { type: 'json' }
    });

    // Get lengths (handle both default exports and named exports)
    const kanjiLengths = {
      n5: (n5Kanji.default || n5Kanji).length,
      n4: (n4Kanji.default || n4Kanji).length,
      n3: (n3Kanji.default || n3Kanji).length,
      n2: (n2Kanji.default || n2Kanji).length,
      n1: (n1Kanji.default || n1Kanji).length
    };

    const vocabLengths = {
      n5: (n5Vocab.default || n5Vocab).length,
      n4: (n4Vocab.default || n4Vocab).length,
      n3: (n3Vocab.default || n3Vocab).length,
      n2: (n2Vocab.default || n2Vocab).length,
      n1: (n1Vocab.default || n1Vocab).length
    };

    // Generate the TypeScript file content
    const content = `// Auto-generated file - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}
// Run 'npm run generate:constants' to regenerate

export const N5KanjiLength = ${kanjiLengths.n5};
export const N4KanjiLength = ${kanjiLengths.n4};
export const N3KanjiLength = ${kanjiLengths.n3};
export const N2KanjiLength = ${kanjiLengths.n2};
export const N1KanjiLength = ${kanjiLengths.n1};

export const N5VocabLength = ${vocabLengths.n5};
export const N4VocabLength = ${vocabLengths.n4};
export const N3VocabLength = ${vocabLengths.n3};
export const N2VocabLength = ${vocabLengths.n2};
export const N1VocabLength = ${vocabLengths.n1};
`;

    const outputPath = join(staticDir, 'unitSets.ts');
    writeFileSync(outputPath, content, 'utf-8');

    console.log('✅ Generated unitSets.ts successfully!\n');
    console.log('📊 Kanji Counts:');
    console.log(`   N5: ${kanjiLengths.n5}`);
    console.log(`   N4: ${kanjiLengths.n4}`);
    console.log(`   N3: ${kanjiLengths.n3}`);
    console.log(`   N2: ${kanjiLengths.n2}`);
    console.log(`   N1: ${kanjiLengths.n1}`);
    console.log('\n📊 Vocab Counts:');
    console.log(`   N5: ${vocabLengths.n5}`);
    console.log(`   N4: ${vocabLengths.n4}`);
    console.log(`   N3: ${vocabLengths.n3}`);
    console.log(`   N2: ${vocabLengths.n2}`);
    console.log(`   N1: ${vocabLengths.n1}`);

    console.log(`\n📁 Output: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating constants:', error);
    process.exit(1);
  }
}

generateConstants();
