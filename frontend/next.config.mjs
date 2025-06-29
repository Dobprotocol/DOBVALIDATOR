/** @type {import('next').NextConfig} */
const nextConfig = {
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
  webpack: (config, { isServer }) => {
    // Handle Stellar SDK browser compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    }

    // Suppress sodium-native warnings in browser
    if (!isServer) {
      config.module.rules.push({
        test: /sodium-native/,
        use: 'null-loader',
      })
    }

    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
      ],
    });
    return config;
  }
}

export default nextConfig
