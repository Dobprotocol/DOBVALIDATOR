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
  // Handle Stellar SDK and other problematic dependencies
  webpack: (config, { isServer }) => {
    // Handle Stellar SDK and sodium-native issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    }

    // Exclude problematic native modules from client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'sodium-native': false,
        'require-addon': false,
      }
    }

    // Handle WebAssembly modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    return config
  },
  // Disable static optimization for pages with Stellar SDK
  serverExternalPackages: ['@stellar/stellar-sdk', 'sodium-native'],
}

export default nextConfig
