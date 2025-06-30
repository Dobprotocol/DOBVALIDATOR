/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  transpilePackages: ['@dob-validator/shared'],
  env: {
    PORT: process.env.PORT || '3002',
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
          },
        ],
      },
    ]
  },
  // Compression
  compress: true,
  // Powered by header
  poweredByHeader: false,
  webpack: (config, { dir, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': dir,
      '@/hooks': `${dir}/hooks`,
      '@/components': `${dir}/components`,
      '@/lib': `${dir}/lib`,
      '@/styles': `${dir}/styles`,
      '@/ui': `${dir}/components/ui`,
      '@/contexts': `${dir}/contexts`,
    }

    // Optimize builds
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      }
    }

    return config
  },
}

export default nextConfig
