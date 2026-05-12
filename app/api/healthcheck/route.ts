import { NextResponse } from 'next/server';
import {
  getAnalyzeRateLimiter,
  getTranslateRateLimiter,
} from '@/shared/infra/server/rateLimit';
import { hasRedisConfig } from '@/shared/infra/server/redis';

export async function GET(request: Request) {
  const secret = process.env.HEALTHCHECK_SECRET;
  const token = request.headers.get('x-healthcheck-token');
  const isAuthorized = Boolean(secret && token && token === secret);

  if (!secret || !isAuthorized) {
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }

  const translateStats = getTranslateRateLimiter().getStats();
  const analyzeStats = getAnalyzeRateLimiter().getStats();

  return NextResponse.json(
    {
      status: 'ok',
      redisEnabled: hasRedisConfig(),
      rateLimiters: {
        translate: translateStats,
        analyze: analyzeStats,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
