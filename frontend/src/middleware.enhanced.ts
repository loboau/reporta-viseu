/**
 * Next.js Enhanced Middleware for API Security
 *
 * Provides:
 * - Advanced rate limiting per endpoint
 * - Request validation and sanitization
 * - Security headers
 * - CORS protection
 * - DDoS mitigation
 * - Suspicious activity detection
 * - Request size validation
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// CONFIGURATION
// ============================================================================

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',

  // Enhanced CSP for additional XSS protection
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://generativelanguage.googleapis.com https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org https://vercel.live",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '),

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (more restrictive)
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(self), payment=(), usb=()',

  // DNS prefetch control
  'X-DNS-Prefetch-Control': 'on',
}

// Rate limit configurations per endpoint
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  // Expensive AI generation endpoint - very restrictive
  '/api/generate-letter': {
    maxRequests: 3,
    windowMs: 60000, // 1 minute
  },
  // Generic API routes - moderate
  '/api/*': {
    maxRequests: 20,
    windowMs: 60000, // 1 minute
  },
  // Global fallback - generous
  '/*': {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
}

// Maximum request body size (10MB for photo uploads)
const MAX_REQUEST_SIZE = 10 * 1024 * 1024

// Suspicious user agent patterns
const SUSPICIOUS_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /burp/i,
  /owasp/i,
  /zap/i,
  // Uncomment to block common CLI tools in production
  // /curl/i,
  // /wget/i,
  // /python-requests/i,
]

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const forwardedIp = forwardedFor?.split(',')[0]?.trim()
  const ip = forwardedIp || realIp || cfConnectingIp || 'unknown'

  return ip
}

/**
 * Get rate limit configuration for a path
 */
const DEFAULT_RATE_LIMIT = { maxRequests: 100, windowMs: 60000 }

function getRateLimitConfig(pathname: string): { maxRequests: number; windowMs: number } {
  // Check for exact match first
  const exactMatch = RATE_LIMITS[pathname]
  if (exactMatch) {
    return exactMatch
  }

  // Check for API wildcard
  if (pathname.startsWith('/api/')) {
    return RATE_LIMITS['/api/*'] ?? DEFAULT_RATE_LIMIT
  }

  // Fallback to global limit
  return RATE_LIMITS['/*'] ?? DEFAULT_RATE_LIMIT
}

/**
 * Check if request exceeds rate limit
 */
function checkRateLimit(
  clientId: string,
  pathname: string
): { allowed: boolean; remaining: number; resetAt: number; retryAfter?: number } {
  const config = getRateLimitConfig(pathname)
  const now = Date.now()
  const key = `${clientId}:${pathname}`
  const entry = rateLimitStore.get(key)

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    cleanupRateLimitStore()
  }

  // First request or window expired
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    }
  }

  // Increment count
  entry.count++

  // Check if exceeded
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt + 60000) {
      rateLimitStore.delete(key)
    }
  }
}

// Periodic cleanup (every minute)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60000)
}

// ============================================================================
// SECURITY VALIDATION
// ============================================================================

/**
 * Validate request size
 */
function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return false
  }
  return true
}

/**
 * Validate Content-Type for POST requests
 */
function validateContentType(request: NextRequest): boolean {
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return true
  }

  const contentType = request.headers.get('content-type') || ''
  const allowedTypes = [
    'application/json',
    'multipart/form-data',
    'application/x-www-form-urlencoded',
  ]

  return allowedTypes.some((type) => contentType.includes(type))
}

/**
 * Detect suspicious activity
 */
function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''

  // Block requests without user agent
  if (!userAgent && process.env.NODE_ENV === 'production') {
    return true
  }

  // Check for suspicious patterns
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(userAgent))
}

/**
 * Validate HTTP method
 */
function validateMethod(request: NextRequest, pathname: string): boolean {
  const allowedMethods = pathname.startsWith('/api/')
    ? ['GET', 'POST', 'OPTIONS']
    : ['GET', 'HEAD']

  return allowedMethods.includes(request.method)
}

// ============================================================================
// MIDDLEWARE HANDLER
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientId = getClientIdentifier(request)

  // ============================================================================
  // 1. RATE LIMITING
  // ============================================================================
  const rateLimitResult = checkRateLimit(clientId, pathname)

  if (!rateLimitResult.allowed) {
    console.warn(`⚠️  Rate limit exceeded for ${clientId} on ${pathname}`)

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': getRateLimitConfig(pathname).maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt / 1000).toString(),
          ...SECURITY_HEADERS,
        },
      }
    )
  }

  // ============================================================================
  // 2. API ROUTE SECURITY
  // ============================================================================
  if (pathname.startsWith('/api/')) {
    // Validate HTTP method
    if (!validateMethod(request, pathname)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        {
          status: 405,
          headers: {
            Allow: 'GET, POST, OPTIONS',
            ...SECURITY_HEADERS,
          },
        }
      )
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
          ...SECURITY_HEADERS,
        },
      })
    }

    // Validate request size
    if (!validateRequestSize(request)) {
      return NextResponse.json(
        {
          error: 'Request too large',
          message: 'Request body exceeds maximum size limit of 10MB.',
        },
        {
          status: 413,
          headers: SECURITY_HEADERS,
        }
      )
    }

    // Validate Content-Type
    if (!validateContentType(request)) {
      return NextResponse.json(
        {
          error: 'Invalid Content-Type',
          message: 'Content-Type must be application/json or multipart/form-data.',
        },
        {
          status: 415,
          headers: SECURITY_HEADERS,
        }
      )
    }

    // Detect suspicious activity
    if (detectSuspiciousActivity(request)) {
      console.warn(`⚠️  Suspicious request blocked from ${clientId}: ${request.headers.get('user-agent')}`)

      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Access denied.',
        },
        {
          status: 403,
          headers: SECURITY_HEADERS,
        }
      )
    }

    // Add security headers and rate limit info to API response
    const response = NextResponse.next()
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Add rate limit headers
    response.headers.set(
      'X-RateLimit-Limit',
      getRateLimitConfig(pathname).maxRequests.toString()
    )
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetAt / 1000).toString())

    // Add CORS headers if origin present
    const origin = request.headers.get('origin')
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Prevent caching of API responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  }

  // ============================================================================
  // 3. ADMIN ROUTE PROTECTION
  // ============================================================================
  if (pathname.startsWith('/admin')) {
    console.log(`Admin route accessed: ${pathname} from ${clientId}`)

    // TODO: Add authentication check
    // const session = await getSession(request)
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }
  }

  // ============================================================================
  // 4. REGULAR PAGES - ADD SECURITY HEADERS
  // ============================================================================
  const response = NextResponse.next()
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add rate limit info to all responses
  response.headers.set(
    'X-RateLimit-Limit',
    getRateLimitConfig(pathname).maxRequests.toString()
  )
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetAt / 1000).toString())

  return response
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
