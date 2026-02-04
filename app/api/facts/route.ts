import { NextResponse } from 'next/server';
import { getAllFacts } from '@/shared/lib/server/facts';

export async function GET() {
  try {
    const facts = getAllFacts();
    const response = NextResponse.json(facts);
    response.headers.set(
      'Cache-Control',
      'public, max-age=604800, stale-while-revalidate=86400',
    );
    return response;
  } catch (error) {
    console.error('Failed to load Japan facts:', error);
    return NextResponse.json({ error: 'Failed to load facts' }, { status: 500 });
  }
}
