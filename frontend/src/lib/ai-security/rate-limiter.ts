/**
 * Rate Limiting System for AI API Calls
 *
 * Implements multiple layers of rate limiting:
 * - Per IP address limits
 * - Per user/session limits
 * - Global system limits
 * - Cost-based throttling
 */

interface RateLimitEntry {
  count: number
  tokens: number
  cost: number
  resetAt: number
  firstRequest: number
}

interface RateLimitConfig {
  maxRequestsPerMinute: number
  maxRequestsPerHour: number
  maxRequestsPerDay: number
  maxTokensPerRequest: number
  maxTokensPerHour: number
  maxCostPerHour: number // in cents
  slidingWindowMs: number
}

// Default configuration with conservative limits
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 3,
  maxRequestsPerHour: 20,
  maxRequestsPerDay: 50,
  maxTokensPerRequest: 2000,
  maxTokensPerHour: 30000,
  maxCostPerHour: 50, // $0.50 per hour max
  slidingWindowMs: 60000, // 1 minute
}

class RateLimiter {
  private ipLimits: Map<string, RateLimitEntry> = new Map()
  private globalLimits: RateLimitEntry = {
    count: 0,
    tokens: 0,
    cost: 0,
    resetAt: Date.now() + 3600000,
    firstRequest: Date.now(),
  }
  private config: RateLimitConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startCleanup()
  }

  /**
   * Check if request is allowed and update counters
   */
  async checkLimit(
    identifier: string,
    estimatedTokens: number = 1000
  ): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
    const now = Date.now()

    // Get or create entry for this identifier
    let entry = this.ipLimits.get(identifier)
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        tokens: 0,
        cost: 0,
        resetAt: now + this.config.slidingWindowMs,
        firstRequest: now,
      }
      this.ipLimits.set(identifier, entry)
    }

    // Check per-minute rate limit
    const minutesSinceFirst = (now - entry.firstRequest) / 60000
    if (minutesSinceFirst < 1 && entry.count >= this.config.maxRequestsPerMinute) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: too many requests per minute',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      }
    }

    // Check hourly rate limit
    const hoursSinceFirst = (now - entry.firstRequest) / 3600000
    if (hoursSinceFirst < 1 && entry.count >= this.config.maxRequestsPerHour) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: too many requests per hour',
        retryAfter: Math.ceil((3600000 - (now - entry.firstRequest)) / 1000),
      }
    }

    // Check daily rate limit
    const daysSinceFirst = (now - entry.firstRequest) / 86400000
    if (daysSinceFirst < 1 && entry.count >= this.config.maxRequestsPerDay) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: daily limit reached',
        retryAfter: Math.ceil((86400000 - (now - entry.firstRequest)) / 1000),
      }
    }

    // Check token limits
    if (estimatedTokens > this.config.maxTokensPerRequest) {
      return {
        allowed: false,
        reason: 'Request too large: exceeds token limit per request',
      }
    }

    if (hoursSinceFirst < 1 && entry.tokens + estimatedTokens > this.config.maxTokensPerHour) {
      return {
        allowed: false,
        reason: 'Token limit exceeded for this hour',
        retryAfter: Math.ceil((3600000 - (now - entry.firstRequest)) / 1000),
      }
    }

    // Check global limits
    if (this.globalLimits.count >= 1000) {
      // Global per-hour limit
      return {
        allowed: false,
        reason: 'System capacity reached, please try again later',
        retryAfter: Math.ceil((this.globalLimits.resetAt - now) / 1000),
      }
    }

    // Estimate cost (Gemini Flash: ~$0.075 per 1M input tokens, $0.30 per 1M output)
    const estimatedCost = (estimatedTokens / 1000000) * 0.20 * 100 // in cents
    if (hoursSinceFirst < 1 && entry.cost + estimatedCost > this.config.maxCostPerHour) {
      return {
        allowed: false,
        reason: 'Cost limit exceeded for this hour',
        retryAfter: Math.ceil((3600000 - (now - entry.firstRequest)) / 1000),
      }
    }

    // All checks passed - allow request and update counters
    entry.count++
    entry.tokens += estimatedTokens
    entry.cost += estimatedCost
    this.globalLimits.count++
    this.globalLimits.tokens += estimatedTokens

    return { allowed: true }
  }

  /**
   * Record actual tokens used (for accurate tracking)
   */
  recordUsage(identifier: string, actualTokens: number): void {
    const entry = this.ipLimits.get(identifier)
    if (entry) {
      // Adjust if actual usage differs from estimate
      entry.tokens = Math.max(entry.tokens, actualTokens)
    }
  }

  /**
   * Get current usage statistics for an identifier
   */
  getUsageStats(identifier: string): {
    requests: number
    tokens: number
    cost: number
    resetIn: number
  } | null {
    const entry = this.ipLimits.get(identifier)
    if (!entry) return null

    return {
      requests: entry.count,
      tokens: entry.tokens,
      cost: entry.cost,
      resetIn: Math.max(0, entry.resetAt - Date.now()),
    }
  }

  /**
   * Clean up expired entries periodically
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()

      // Clean up IP limits
      for (const [key, entry] of this.ipLimits.entries()) {
        if (now > entry.resetAt + 3600000) {
          // Keep for 1 hour after reset
          this.ipLimits.delete(key)
        }
      }

      // Reset global limits every hour
      if (now > this.globalLimits.resetAt) {
        this.globalLimits = {
          count: 0,
          tokens: 0,
          cost: 0,
          resetAt: now + 3600000,
          firstRequest: now,
        }
      }
    }, 60000) // Run every minute
  }

  /**
   * Stop cleanup interval (for testing/shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null

export function getRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter(config)
  }
  return rateLimiterInstance
}

export type { RateLimitConfig, RateLimitEntry }
