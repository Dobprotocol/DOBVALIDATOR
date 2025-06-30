/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: [
      'sodium-native',
      '@stellar/stellar-sdk',
      'jsonwebtoken',
      'crypto',
      'stream',
      'zlib'
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        path: false,
        process: false,
      };
    }

    // Handle dynamic requires
    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
            plugins: [
              ['@babel/plugin-transform-runtime', { regenerator: true }],
            ],
          },
        },
      ],
    });

    // Ignore warnings for sodium-native and other native modules
    config.ignoreWarnings = [
      { module: /node_modules\/sodium-native/ },
      { module: /node_modules\/require-addon/ },
      { module: /node_modules\/@stellar/ },
    ];

    return config;
  },
  // Ensure all API routes run in Node.js runtime
  serverRuntimeConfig: {
    runtime: 'nodejs',
  },
  output: 'standalone',
};

export default nextConfig;
