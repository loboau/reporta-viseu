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
}

module.exports = nextConfig
