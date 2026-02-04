/**
 * Server-side rate limiting utility for API protection
 *
 * Implements:
 * - Per-IP rate limiting (sliding window)
 * - Per-IP daily quotas
 * - Global rate limiting fallback
 * - Automatic cleanup of stale entries
 */

interface RateLimitConfig {
  // Maximum requests per window
  maxRequests: number;
  // Window size in milliseconds (default: 60 seconds)
  windowMs: number;
  // Maximum requests per day per IP (optional)
  dailyLimit?: number;
  // Maximum unique IPs to track (prevents memory exhaustion)
  maxTrackedIPs?: number;
}

interface RequestRecord {
  timestamps: number[];
  dailyCount: number;
  dailyResetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  reason?: 'rate_limit' | 'daily_quota' | 'global_limit';
}

// Default configuration for translation API
export const TRANSLATE_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 10, // 10 requests per minute per IP
  windowMs: 60 * 1000, // 1 minute window
  dailyLimit: 200, // 200 requests per day per IP
  maxTrackedIPs: 10000, // Track up to 10k unique IPs
};

// Stricter config for text analysis (since it's computationally expensive)
export const ANALYZE_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 15, // 15 requests per minute per IP
  windowMs: 60 * 1000, // 1 minute window
  dailyLimit: 300, // 300 requests per day per IP
  maxTrackedIPs: 10000,
};

// Global rate limiting (fallback when IP tracking fails)
export const GLOBAL_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 100, // 100 total requests per minute globally
  windowMs: 60 * 1000,
};

/**
 * In-memory rate limiter class
 * Note: In serverless environments, this resets on cold starts.
 * For production at scale, consider Redis-based rate limiting.
 */
export class RateLimiter {
  private records: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;
  private globalTimestamps: number[] = [];
  private lastCleanup: number = Date.now();
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if a request is allowed and record it
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();

    // Periodic cleanup to prevent memory leaks
    this.maybeCleanup(now);

    // Check global rate limit first (DoS protection)
    const globalResult = this.checkGlobalLimit(now);
    if (!globalResult.allowed) {
      return globalResult;
    }

    // Get or create record for this identifier
    let record = this.records.get(identifier);
    if (!record) {
      // Check if we've hit the max tracked IPs limit
      if (
        this.config.maxTrackedIPs &&
        this.records.size >= this.config.maxTrackedIPs
      ) {
        // Don't track new IPs, but still allow the request with stricter global limiting
        console.warn(
          `Rate limiter: Max tracked IPs (${this.config.maxTrackedIPs}) reached`,
        );
        return this.checkGlobalLimit(now);
      }

      record = {
        timestamps: [],
        dailyCount: 0,
        dailyResetAt: this.getNextMidnight(now),
      };
      this.records.set(identifier, record);
    }

    // Reset daily count if past midnight
    if (now >= record.dailyResetAt) {
      record.dailyCount = 0;
      record.dailyResetAt = this.getNextMidnight(now);
    }

    // Check daily limit
    if (this.config.dailyLimit && record.dailyCount >= this.config.dailyLimit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.dailyResetAt,
        retryAfter: Math.ceil((record.dailyResetAt - now) / 1000),
        reason: 'daily_quota',
      };
    }

    // Clean old timestamps (sliding window)
    const windowStart = now - this.config.windowMs;
    record.timestamps = record.timestamps.filter(ts => ts > windowStart);

    // Check rate limit
    if (record.timestamps.length >= this.config.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const resetAt = oldestInWindow + this.config.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil((resetAt - now) / 1000),
        reason: 'rate_limit',
      };
    }

    // Request allowed - record it
    record.timestamps.push(now);
    record.dailyCount++;
    this.globalTimestamps.push(now);

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.timestamps.length,
      resetAt: now + this.config.windowMs,
    };
  }

  /**
   * Get current status without recording a request
   */
  getStatus(identifier: string): RateLimitResult {
    const now = Date.now();
    const record = this.records.get(identifier);

    if (!record) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: now + this.config.windowMs,
      };
    }

    // Clean old timestamps
    const windowStart = now - this.config.windowMs;
    const activeTimestamps = record.timestamps.filter(ts => ts > windowStart);

    // Check daily limit
    if (
      this.config.dailyLimit &&
      record.dailyCount >= this.config.dailyLimit &&
      now < record.dailyResetAt
    ) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.dailyResetAt,
        reason: 'daily_quota',
      };
    }

    const remaining = this.config.maxRequests - activeTimestamps.length;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      resetAt:
        activeTimestamps.length > 0
          ? activeTimestamps[0] + this.config.windowMs
          : now + this.config.windowMs,
    };
  }

  /**
   * Check global rate limit (protects against distributed attacks)
   */
  private checkGlobalLimit(now: number): RateLimitResult {
    const windowStart = now - GLOBAL_RATE_LIMIT_CONFIG.windowMs;
    this.globalTimestamps = this.globalTimestamps.filter(
      ts => ts > windowStart,
    );

    if (this.globalTimestamps.length >= GLOBAL_RATE_LIMIT_CONFIG.maxRequests) {
      const oldestInWindow = this.globalTimestamps[0];
      const resetAt = oldestInWindow + GLOBAL_RATE_LIMIT_CONFIG.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil((resetAt - now) / 1000),
        reason: 'global_limit',
      };
    }

    return {
      allowed: true,
      remaining:
        GLOBAL_RATE_LIMIT_CONFIG.maxRequests - this.globalTimestamps.length,
      resetAt: now + GLOBAL_RATE_LIMIT_CONFIG.windowMs,
    };
  }

  /**
   * Cleanup stale records to prevent memory leaks
   */
  private maybeCleanup(now: number): void {
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    this.lastCleanup = now;
    const windowStart = now - this.config.windowMs;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Remove records with no recent activity
    for (const [key, record] of this.records) {
      // Remove if no timestamps in window and daily reset is in the past
      const hasRecentActivity = record.timestamps.some(ts => ts > windowStart);
      const hasRecentDaily = record.dailyResetAt > oneDayAgo;

      if (!hasRecentActivity && !hasRecentDaily) {
        this.records.delete(key);
      }
    }

    // Clean global timestamps
    this.globalTimestamps = this.globalTimestamps.filter(
      ts => ts > windowStart,
    );
  }

  /**
   * Get the next midnight in UTC
   */
  private getNextMidnight(now: number): number {
    const date = new Date(now);
    date.setUTCHours(24, 0, 0, 0);
    return date.getTime();
  }

  /**
   * Get current statistics (for monitoring)
   */
  getStats(): {
    trackedIPs: number;
    globalRequestsInWindow: number;
    maxTrackedIPs: number;
  } {
    const now = Date.now();
    const windowStart = now - GLOBAL_RATE_LIMIT_CONFIG.windowMs;
    const activeGlobal = this.globalTimestamps.filter(
      ts => ts > windowStart,
    ).length;

    return {
      trackedIPs: this.records.size,
      globalRequestsInWindow: activeGlobal,
      maxTrackedIPs: this.config.maxTrackedIPs || 0,
    };
  }
}

function getNextMidnightUTC(now: number): number {
  const date = new Date(now);
  date.setUTCHours(24, 0, 0, 0);
  return date.getTime();
}

function getDayIdUTC(now: number): string {
  const date = new Date(now);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig,
  scope: string,
): Promise<RateLimitResult> {
  const { hasRedisConfig, redisPipeline } = await import('@/shared/lib/redis');

  if (!hasRedisConfig()) {
    throw new Error('Redis not configured.');
  }

  const now = Date.now();
  const windowMs = config.windowMs;
  const windowId = Math.floor(now / windowMs);
  const windowResetAt = (windowId + 1) * windowMs;
  const ttlSeconds = Math.ceil(windowMs / 1000);

  const perIpKey = `rl:${scope}:ip:${identifier}:${windowId}`;
  const globalKey = `rl:${scope}:global:${windowId}`;

  const commands: Array<Array<string | number>> = [
    ['INCR', perIpKey],
    ['EXPIRE', perIpKey, ttlSeconds],
    ['INCR', globalKey],
    ['EXPIRE', globalKey, ttlSeconds],
  ];

  let dailyKey: string | null = null;
  if (config.dailyLimit) {
    const dayId = getDayIdUTC(now);
    dailyKey = `rl:${scope}:daily:${identifier}:${dayId}`;
    commands.push(['INCR', dailyKey]);
    commands.push(['EXPIRE', dailyKey, 86400]);
  }

  const results = await redisPipeline(commands);
  const perIpCount = Number(results[0]?.result ?? 0);
  const globalCount = Number(results[2]?.result ?? 0);
  const dailyCount = dailyKey ? Number(results[4]?.result ?? 0) : 0;

  if (globalCount > GLOBAL_RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: windowResetAt,
      retryAfter: Math.ceil((windowResetAt - now) / 1000),
      reason: 'global_limit',
    };
  }

  if (config.dailyLimit && dailyCount > config.dailyLimit) {
    const resetAt = getNextMidnightUTC(now);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - now) / 1000),
      reason: 'daily_quota',
    };
  }

  if (perIpCount > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: windowResetAt,
      retryAfter: Math.ceil((windowResetAt - now) / 1000),
      reason: 'rate_limit',
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - perIpCount),
    resetAt: windowResetAt,
  };
}

async function checkRateLimitWithFallback(
  identifier: string,
  config: RateLimitConfig,
  scope: string,
  limiter: RateLimiter,
): Promise<RateLimitResult> {
  try {
    return await checkRateLimitRedis(identifier, config, scope);
  } catch {
    return limiter.check(identifier);
  }
}

// Singleton instances for each API endpoint
let translateRateLimiter: RateLimiter | null = null;
let analyzeRateLimiter: RateLimiter | null = null;

/**
 * Get the rate limiter for translate API
 */
export function getTranslateRateLimiter(): RateLimiter {
  if (!translateRateLimiter) {
    translateRateLimiter = new RateLimiter(TRANSLATE_RATE_LIMIT_CONFIG);
  }
  return translateRateLimiter;
}

/**
 * Get the rate limiter for analyze-text API
 */
export function getAnalyzeRateLimiter(): RateLimiter {
  if (!analyzeRateLimiter) {
    analyzeRateLimiter = new RateLimiter(ANALYZE_RATE_LIMIT_CONFIG);
  }
  return analyzeRateLimiter;
}

export async function checkTranslateRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getTranslateRateLimiter();
  return checkRateLimitWithFallback(
    identifier,
    TRANSLATE_RATE_LIMIT_CONFIG,
    'translate',
    limiter,
  );
}

export async function checkAnalyzeRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getAnalyzeRateLimiter();
  return checkRateLimitWithFallback(
    identifier,
    ANALYZE_RATE_LIMIT_CONFIG,
    'analyze',
    limiter,
  );
}

/**
 * Extract client IP from request headers
 * Handles various proxy configurations (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;

  // Check various headers in order of preference
  // Vercel/Next.js
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first (client IP)
    const ip = xForwardedFor.split(',')[0].trim();
    if (ip) return ip;
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;

  // Vercel real IP
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) return xRealIP;

  // True-Client-IP (Akamai, Cloudflare Enterprise)
  const trueClientIP = headers.get('true-client-ip');
  if (trueClientIP) return trueClientIP;

  // Fallback - use a generic identifier
  // In production, you might want to block requests without identifiable IP
  return 'unknown';
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();

  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));

  if (!result.allowed && result.retryAfter) {
    headers.set('Retry-After', String(result.retryAfter));
  }

  return headers;
}
