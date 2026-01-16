/**
 * Next.js Middleware for API Security
 *
 * Provides:
 * - Request validation
 * - Security headers
 * - CORS protection
 * - Basic DDoS mitigation
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',

  // CSP for additional XSS protection
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://*.tile.openstreetmap.org",
    "frame-ancestors 'none'",
  ].join('; '),

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
}

// Rate limiting for middleware
const requestCounts = new Map<string, { count: number; resetAt: number }>()

function checkMiddlewareRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = requestCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 }) // 1 minute window
    return { allowed: true }
  }

  // Very aggressive rate limit for middleware (100 requests per minute)
  if (entry.count >= 100) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count++
  return { allowed: true }
}

// Clean up rate limit map periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of requestCounts.entries()) {
      if (now > entry.resetAt + 60000) {
        requestCounts.delete(key)
      }
    }
  }, 60000)
}

export function middleware(request: NextRequest) {
  // Get client IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const firstForwarded = forwardedFor?.split(',')[0]
  const ip =
    firstForwarded?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'

  // Check rate limit at middleware level
  const rateLimitCheck = checkMiddlewareRateLimit(ip)
  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please slow down and try again',
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitCheck.retryAfter?.toString() || '60',
          ...SECURITY_HEADERS,
        },
      }
    )
  }

  // For API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Validate request method
    if (!['GET', 'POST', 'OPTIONS'].includes(request.method)) {
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

    // Handle OPTIONS for CORS preflight
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

    // Validate Content-Type for POST requests
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json(
          { error: 'Content-Type must be application/json' },
          {
            status: 415,
            headers: SECURITY_HEADERS,
          }
        )
      }
    }

    // Check for suspicious user agents
    const userAgent = request.headers.get('user-agent') || ''
    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python-requests/i,
      /scrapy/i,
      /bot/i,
      /spider/i,
      /crawler/i,
    ]

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
    if (isSuspicious && process.env.NODE_ENV === 'production') {
      console.warn(`Suspicious user agent detected: ${userAgent} from ${ip}`)
      // Log but don't block - some legitimate tools might match
    }

    // Add security headers to response
    const response = NextResponse.next()
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Add CORS headers for API routes
    const origin = request.headers.get('origin')
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return response
  }

  // For regular pages, just add security headers
  const response = NextResponse.next()
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Apply to all pages (for security headers)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
