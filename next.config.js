/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force trailing slash consistency (no trailing slash)
  trailingSlash: false,
  
  // Redirect non-www to www (handled at Vercel/hosting level, but good to have)
  async redirects() {
    return [
      // Redirect any duplicate paths
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },

  images: {
    domains: ['ui-avatars.com', 'lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig
