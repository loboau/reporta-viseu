/**
 * AI Security Module
 *
 * Centralized security system for AI/LLM integration
 * Provides rate limiting, input sanitization, output validation, and abuse detection
 */

export { getRateLimiter } from './rate-limiter'
export type { RateLimitConfig, RateLimitEntry } from './rate-limiter'

export { sanitizeInput, validateReportData, estimateTokens } from './input-sanitizer'
export type { SanitizationResult } from './input-sanitizer'

export { validateOutput, validateLetter, sanitizeForDisplay } from './output-validator'
export type { ValidationResult } from './output-validator'

export { getAbuseDetector } from './abuse-detector'
export type { AbuseDetectionResult, AbuseMetrics } from './abuse-detector'

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  rateLimit: {
    enabled: true,
    maxRequestsPerMinute: 3,
    maxRequestsPerHour: 20,
    maxRequestsPerDay: 50,
  },
  inputValidation: {
    enabled: true,
    maxLength: 2000,
    strictMode: false,
    allowPII: true, // Citizens may need to include contact info
  },
  outputValidation: {
    enabled: true,
    minLength: 100,
    maxLength: 5000,
    strictMode: false,
    checkStructure: true,
  },
  abuseDetection: {
    enabled: true,
    autoBlock: true,
    blockThreshold: 80,
  },
  tokenLimits: {
    maxTokensPerRequest: 2000,
    maxTokensPerHour: 30000,
  },
  costLimits: {
    maxCostPerHour: 50, // cents
    alertThreshold: 100, // cents per hour
  },
} as const

/**
 * Security event types for logging/monitoring
 */
export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INPUT_SANITIZED = 'input_sanitized',
  INPUT_REJECTED = 'input_rejected',
  OUTPUT_SANITIZED = 'output_sanitized',
  OUTPUT_REJECTED = 'output_rejected',
  ABUSE_DETECTED = 'abuse_detected',
  IP_BLOCKED = 'ip_blocked',
  PROMPT_INJECTION_ATTEMPT = 'prompt_injection_attempt',
  MALICIOUS_CONTENT = 'malicious_content',
  TOKEN_LIMIT_EXCEEDED = 'token_limit_exceeded',
  COST_LIMIT_EXCEEDED = 'cost_limit_exceeded',
}

/**
 * Security event for logging
 */
export interface SecurityEvent {
  type: SecurityEventType
  timestamp: number
  identifier: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Logger for security events
 */
class SecurityLogger {
  private events: SecurityEvent[] = []
  private readonly maxEvents = 1000

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
    }

    this.events.push(fullEvent)

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        low: 'ℹ️',
        medium: '⚠️',
        high: '🚨',
        critical: '🔥',
      }[event.severity]

      console.log(
        `${emoji} [Security ${event.type}]`,
        event.identifier,
        event.details
      )
    }
  }

  getEvents(filter?: {
    type?: SecurityEventType
    severity?: SecurityEvent['severity']
    since?: number
  }): SecurityEvent[] {
    let filtered = this.events

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type)
    }

    if (filter?.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity)
    }

    if (filter?.since) {
      const sinceDate = filter.since
      filtered = filtered.filter(e => e.timestamp >= sinceDate)
    }

    return filtered
  }

  getStats(): {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
  } {
    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}

    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
    }

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
    }
  }

  clear(): void {
    this.events = []
  }
}

// Singleton instance
let securityLoggerInstance: SecurityLogger | null = null

export function getSecurityLogger(): SecurityLogger {
  if (!securityLoggerInstance) {
    securityLoggerInstance = new SecurityLogger()
  }
  return securityLoggerInstance
}
