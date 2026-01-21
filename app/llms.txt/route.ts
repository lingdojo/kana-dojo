import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'llms.txt');
    const content = await readFile(filePath, 'utf8');

    return new NextResponse(content, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch {
    // Fallback in case the file isn't available in the runtime environment
    const fallback =
      '# KanaDojo (kanadojo.com)\n\nThis endpoint serves repository-curated context for LLM tools.\n\nSee: https://github.com/lingdojo/kanadojo\n';

    return new NextResponse(fallback, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  }
}
