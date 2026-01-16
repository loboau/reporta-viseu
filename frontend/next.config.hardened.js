/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance: Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Performance: Optimize production builds
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports for lucide-react
    optimizePackageImports: ['lucide-react'],
  },

  // Enable build optimizations
  poweredByHeader: false,
  compress: true,

  // Output standalone for smaller Docker images (useful for deployment)
  output: 'standalone',

  // ============================================================================
  // SECURITY HEADERS - PRODUCTION HARDENING
  // ============================================================================
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // ===== Content Security Policy (CSP) =====
          // Prevents XSS attacks by controlling which resources can be loaded
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: Only load from same origin
              "default-src 'self'",

              // Scripts: Allow Next.js and safe inline scripts (needed for Next.js)
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.app",

              // Styles: Allow inline styles (needed for Tailwind and styled-jsx)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Images: Allow same origin, data URIs, and blob URLs (for photo previews)
              "img-src 'self' data: blob: https:",

              // Fonts: Allow Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",

              // External connections: API calls to Gemini and Nominatim
              "connect-src 'self' https://generativelanguage.googleapis.com https://nominatim.openstreetmap.org https://vercel.live wss://*.vercel.app",

              // Frames: Deny all iframe embedding
              "frame-src 'none'",

              // Workers: Allow same origin for service workers
              "worker-src 'self' blob:",

              // Forms: Only submit to same origin
              "form-action 'self'",

              // Base URI: Restrict base tag to same origin
              "base-uri 'self'",

              // Upgrade insecure requests to HTTPS
              "upgrade-insecure-requests",

              // Block mixed content
              "block-all-mixed-content",
            ].join('; '),
          },

          // ===== X-Frame-Options =====
          // Prevents clickjacking by disallowing iframe embedding
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // ===== X-Content-Type-Options =====
          // Prevents MIME-type sniffing (XSS protection)
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          // ===== Referrer-Policy =====
          // Controls how much referrer information is sent
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // ===== Strict-Transport-Security (HSTS) =====
          // Forces HTTPS for 1 year, including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },

          // ===== Permissions-Policy =====
          // Controls which browser features can be used
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(self)',           // Camera access only from same origin
              'microphone=()',           // No microphone access
              'geolocation=(self)',      // Geolocation only from same origin
              'interest-cohort=()',      // Block FLoC tracking
              'payment=()',              // No payment API
              'usb=()',                  // No USB access
              'accelerometer=()',        // No accelerometer
              'gyroscope=()',            // No gyroscope
              'magnetometer=()',         // No magnetometer
            ].join(', '),
          },

          // ===== X-DNS-Prefetch-Control =====
          // Allow DNS prefetching for performance
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },

          // ===== X-XSS-Protection =====
          // Legacy XSS protection for older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },

      // Additional headers for API routes
      {
        source: '/api/:path*',
        headers: [
          // Prevent caching of API responses
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          // API responses are JSON
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
        ],
      },
    ]
  },

  // ============================================================================
  // ENVIRONMENT VARIABLE VALIDATION
  // ============================================================================
  // Validate required environment variables at build time
  env: {
    // These will be available in the app (but NOT exposed to client)
    // Only use NEXT_PUBLIC_ prefix for client-side variables
  },

  // ============================================================================
  // REDIRECTS & REWRITES
  // ============================================================================
  async redirects() {
    return [
      // Force trailing slashes for consistency (optional)
      // Uncomment if needed:
      // {
      //   source: '/:path((?!.*\\.).*)',
      //   destination: '/:path/',
      //   permanent: true,
      // },
    ]
  },

  // ============================================================================
  // WEBPACK CONFIGURATION (Advanced)
  // ============================================================================
  webpack: (config, { isServer }) => {
    // Security: Prevent client-side bundling of server-only packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },
}

// ============================================================================
// RUNTIME ENVIRONMENT VALIDATION
// ============================================================================
// This runs at server startup to ensure critical env vars are set
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'GEMINI_API_KEY',
  ]

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  )

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
      'Please set these in your deployment environment or .env.production file.'
    )
  }

  // Validate API key format (basic check)
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AIza')) {
    console.warn('⚠️  GEMINI_API_KEY does not match expected format. Please verify.')
  }
}

module.exports = nextConfig
