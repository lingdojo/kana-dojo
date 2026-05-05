import { NextResponse } from 'next/server';
import { getAllFacts } from '@/shared/infra/server/facts';

export async function GET() {
  try {
    const facts = getAllFacts();
    return NextResponse.json(facts, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=604800, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to load Japan facts:', error);
    return NextResponse.json(
      { error: 'Failed to load facts' },
      { status: 500 },
    );
  }
}
