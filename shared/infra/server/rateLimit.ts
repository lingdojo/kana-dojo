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

interface TranslateUsageConfig {
  dailyCharLimit: number;
  monthlyCharLimit: number;
  globalMonthlyCharLimit: number;
  verificationDailyCharThreshold: number;
}

interface TranslateUsageRecord {
  dailyChars: number;
  monthlyChars: number;
  monthlyResetAt: number;
  dailyResetAt: number;
}

interface TranslateUsageResult {
  allowed: boolean;
  requiresVerification: boolean;
  remainingDailyChars: number;
  remainingMonthlyChars: number;
  remainingGlobalMonthlyChars: number;
  resetAt: number;
  retryAfter?: number;
  reason?: 'daily_char_quota' | 'monthly_char_quota' | 'global_monthly_char_quota';
}

interface TranslateUsageStats {
  redisEnabled: boolean;
  globalMonthlyChars: number;
  globalMonthlyLimit: number;
  monthlyResetAt: number;
}

function readPositiveIntEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export function getTranslateUsageConfig(): TranslateUsageConfig {
  return {
    dailyCharLimit: readPositiveIntEnv('TRANSLATE_DAILY_CHAR_LIMIT', 20_000),
    monthlyCharLimit: readPositiveIntEnv(
      'TRANSLATE_MONTHLY_CHAR_LIMIT',
      100_000,
    ),
    globalMonthlyCharLimit: readPositiveIntEnv(
      'TRANSLATE_GLOBAL_MONTHLY_CHAR_LIMIT',
      3_000_000,
    ),
    verificationDailyCharThreshold: readPositiveIntEnv(
      'TRANSLATE_VERIFICATION_DAILY_CHAR_THRESHOLD',
      10_000,
    ),
  };
}

// Default configuration for translation API
export const TRANSLATE_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 120, // High ceiling; character budgets are the real cost control.
  windowMs: 60 * 1000, // 1 minute window
  dailyLimit: 5000, // High backstop for pathological automation.
  maxTrackedIPs: 10000, // Track up to 10k unique IPs
};

export const TRANSLATE_BURST_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 20, // Short-window guard against machine-speed bursts.
  windowMs: 10 * 1000,
  maxTrackedIPs: 10000, // Track up to 10k unique IPs
};

// Stricter config for text analysis (since it's computationally expensive)
export const ANALYZE_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 15, // 15 requests per minute per IP
  windowMs: 60 * 1000, // 1 minute window
  dailyLimit: 300, // 300 requests per day per IP
  maxTrackedIPs: 10000,
};

// Config for progress sync API (larger payloads, stricter abuse controls)
export const PROGRESS_SYNC_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 20, // 20 requests per minute per IP
  windowMs: 60 * 1000,
  dailyLimit: 500, // 500 requests per day per IP
  maxTrackedIPs: 10000,
};

// Global rate limiting (fallback when IP tracking fails)
export const GLOBAL_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 1000, // Total requests per minute globally per endpoint limiter.
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

function getMonthIdUTC(now: number): string {
  const date = new Date(now);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}${m}`;
}

function getNextMonthUTC(now: number): number {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() + 1, 1);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig,
  scope: string,
): Promise<RateLimitResult> {
  const { hasRedisConfig, redisPipeline } = await import('@/shared/infra/server/redis');

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
let translateBurstRateLimiter: RateLimiter | null = null;
let analyzeRateLimiter: RateLimiter | null = null;
let progressSyncRateLimiter: RateLimiter | null = null;
const translateUsageRecords: Map<string, TranslateUsageRecord> = new Map();

/**
 * Get the rate limiter for translate API
 */
export function getTranslateRateLimiter(): RateLimiter {
  if (!translateRateLimiter) {
    translateRateLimiter = new RateLimiter(TRANSLATE_RATE_LIMIT_CONFIG);
  }
  return translateRateLimiter;
}

export function getTranslateBurstRateLimiter(): RateLimiter {
  if (!translateBurstRateLimiter) {
    translateBurstRateLimiter = new RateLimiter(
      TRANSLATE_BURST_RATE_LIMIT_CONFIG,
    );
  }
  return translateBurstRateLimiter;
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

/**
 * Get the rate limiter for progress-sync API
 */
export function getProgressSyncRateLimiter(): RateLimiter {
  if (!progressSyncRateLimiter) {
    progressSyncRateLimiter = new RateLimiter(PROGRESS_SYNC_RATE_LIMIT_CONFIG);
  }
  return progressSyncRateLimiter;
}

export async function checkTranslateRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getTranslateRateLimiter();
  const burstLimiter = getTranslateBurstRateLimiter();
  const burstResult = await checkRateLimitWithFallback(
    identifier,
    TRANSLATE_BURST_RATE_LIMIT_CONFIG,
    'translate-burst',
    burstLimiter,
  );

  if (!burstResult.allowed) {
    return burstResult;
  }

  return checkRateLimitWithFallback(
    identifier,
    TRANSLATE_RATE_LIMIT_CONFIG,
    'translate',
    limiter,
  );
}

export async function checkTranslateUsageLimit(
  identifier: string,
  charCount: number,
  options: { verified?: boolean } = {},
): Promise<TranslateUsageResult> {
  const config = getTranslateUsageConfig();
  const chars = Math.max(0, Math.floor(charCount));
  const now = Date.now();
  const dailyResetAt = getNextMidnightUTC(now);
  const monthlyResetAt = getNextMonthUTC(now);

  try {
    const { hasRedisConfig, redisPipeline } = await import(
      '@/shared/infra/server/redis'
    );

    if (!hasRedisConfig()) {
      throw new Error('Redis not configured.');
    }

    const dayId = getDayIdUTC(now);
    const monthId = getMonthIdUTC(now);
    const dailyCharsKey = `translate:usage:ip:${identifier}:chars:${dayId}`;
    const monthlyCharsKey = `translate:usage:ip:${identifier}:chars:${monthId}`;
    const globalMonthlyCharsKey = `translate:usage:global:chars:${monthId}`;

    const existingResults = await redisPipeline([
      ['GET', dailyCharsKey],
      ['GET', monthlyCharsKey],
      ['GET', globalMonthlyCharsKey],
    ]);

    const projectedResult = buildTranslateUsageResult({
      config,
      dailyChars: Number(existingResults[0]?.result ?? 0) + chars,
      monthlyChars: Number(existingResults[1]?.result ?? 0) + chars,
      globalMonthlyChars: Number(existingResults[2]?.result ?? 0) + chars,
      dailyResetAt,
      monthlyResetAt,
      verified: Boolean(options.verified),
    });

    if (!projectedResult.allowed || projectedResult.requiresVerification) {
      return projectedResult;
    }

    const results = await redisPipeline([
      ['INCRBY', dailyCharsKey, chars],
      ['EXPIRE', dailyCharsKey, 86400],
      ['INCRBY', monthlyCharsKey, chars],
      ['EXPIRE', monthlyCharsKey, 2678400],
      ['INCRBY', globalMonthlyCharsKey, chars],
      ['EXPIRE', globalMonthlyCharsKey, 2678400],
    ]);

    const dailyChars = Number(results[0]?.result ?? 0);
    const monthlyChars = Number(results[2]?.result ?? 0);
    const globalMonthlyChars = Number(results[4]?.result ?? 0);

    return buildTranslateUsageResult({
      config,
      dailyChars,
      monthlyChars,
      globalMonthlyChars,
      dailyResetAt,
      monthlyResetAt,
      verified: Boolean(options.verified),
    });
  } catch {
    let record = translateUsageRecords.get(identifier);
    if (!record || now >= record.monthlyResetAt) {
      record = {
        dailyChars: 0,
        monthlyChars: 0,
        dailyResetAt,
        monthlyResetAt,
      };
      translateUsageRecords.set(identifier, record);
    }

    if (now >= record.dailyResetAt) {
      record.dailyChars = 0;
      record.dailyResetAt = dailyResetAt;
    }

    const projectedResult = buildTranslateUsageResult({
      config,
      dailyChars: record.dailyChars + chars,
      monthlyChars: record.monthlyChars + chars,
      globalMonthlyChars: record.monthlyChars + chars,
      dailyResetAt: record.dailyResetAt,
      monthlyResetAt: record.monthlyResetAt,
      verified: Boolean(options.verified),
    });

    if (!projectedResult.allowed || projectedResult.requiresVerification) {
      return projectedResult;
    }

    record.dailyChars += chars;
    record.monthlyChars += chars;

    return projectedResult;
  }
}

function buildTranslateUsageResult({
  config,
  dailyChars,
  monthlyChars,
  globalMonthlyChars,
  dailyResetAt,
  monthlyResetAt,
  verified,
}: {
  config: TranslateUsageConfig;
  dailyChars: number;
  monthlyChars: number;
  globalMonthlyChars: number;
  dailyResetAt: number;
  monthlyResetAt: number;
  verified: boolean;
}): TranslateUsageResult {
  const remainingDailyChars = Math.max(0, config.dailyCharLimit - dailyChars);
  const remainingMonthlyChars = Math.max(
    0,
    config.monthlyCharLimit - monthlyChars,
  );
  const remainingGlobalMonthlyChars = Math.max(
    0,
    config.globalMonthlyCharLimit - globalMonthlyChars,
  );

  if (dailyChars > config.dailyCharLimit) {
    return {
      allowed: false,
      requiresVerification: false,
      remainingDailyChars,
      remainingMonthlyChars,
      remainingGlobalMonthlyChars,
      resetAt: dailyResetAt,
      retryAfter: Math.ceil((dailyResetAt - Date.now()) / 1000),
      reason: 'daily_char_quota',
    };
  }

  if (monthlyChars > config.monthlyCharLimit) {
    return {
      allowed: false,
      requiresVerification: false,
      remainingDailyChars,
      remainingMonthlyChars,
      remainingGlobalMonthlyChars,
      resetAt: monthlyResetAt,
      retryAfter: Math.ceil((monthlyResetAt - Date.now()) / 1000),
      reason: 'monthly_char_quota',
    };
  }

  if (globalMonthlyChars > config.globalMonthlyCharLimit) {
    return {
      allowed: false,
      requiresVerification: false,
      remainingDailyChars,
      remainingMonthlyChars,
      remainingGlobalMonthlyChars,
      resetAt: monthlyResetAt,
      retryAfter: Math.ceil((monthlyResetAt - Date.now()) / 1000),
      reason: 'global_monthly_char_quota',
    };
  }

  const requiresVerification =
    !verified && dailyChars > config.verificationDailyCharThreshold;

  return {
    allowed: true,
    requiresVerification,
    remainingDailyChars,
    remainingMonthlyChars,
    remainingGlobalMonthlyChars,
    resetAt: dailyResetAt,
  };
}

export function createTranslateUsageHeaders(
  result: TranslateUsageResult,
): Headers {
  const headers = new Headers();
  headers.set(
    'X-Translate-CharLimit-Remaining',
    String(result.remainingDailyChars),
  );
  headers.set(
    'X-Translate-Monthly-Remaining',
    String(result.remainingMonthlyChars),
  );
  headers.set(
    'X-Translate-Global-Monthly-Remaining',
    String(result.remainingGlobalMonthlyChars),
  );
  if (result.retryAfter) {
    headers.set('Retry-After', String(result.retryAfter));
  }
  return headers;
}

export async function getTranslateUsageStats(): Promise<TranslateUsageStats> {
  const config = getTranslateUsageConfig();
  const now = Date.now();
  const monthlyResetAt = getNextMonthUTC(now);

  try {
    const { hasRedisConfig, redisPipeline } = await import(
      '@/shared/infra/server/redis'
    );
    if (!hasRedisConfig()) {
      throw new Error('Redis not configured.');
    }

    const monthId = getMonthIdUTC(now);
    const results = await redisPipeline([
      ['GET', `translate:usage:global:chars:${monthId}`],
    ]);

    return {
      redisEnabled: true,
      globalMonthlyChars: Number(results[0]?.result ?? 0),
      globalMonthlyLimit: config.globalMonthlyCharLimit,
      monthlyResetAt,
    };
  } catch {
    let globalMonthlyChars = 0;
    for (const record of translateUsageRecords.values()) {
      if (record.monthlyResetAt === monthlyResetAt) {
        globalMonthlyChars += record.monthlyChars;
      }
    }
    return {
      redisEnabled: false,
      globalMonthlyChars,
      globalMonthlyLimit: config.globalMonthlyCharLimit,
      monthlyResetAt,
    };
  }
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

export async function checkProgressSyncRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getProgressSyncRateLimiter();
  return checkRateLimitWithFallback(
    identifier,
    PROGRESS_SYNC_RATE_LIMIT_CONFIG,
    'progress-sync',
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

