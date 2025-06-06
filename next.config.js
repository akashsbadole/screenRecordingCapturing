/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Configure cache settings
  distDir: '.next',
  experimental: {
    // Disable webpack build worker to prevent caching issues
    webpackBuildWorker: false
  },
  // Add webpack configuration to handle caching
  webpack: (config, { dev, isServer }) => {
    // Disable caching in development to prevent file system errors
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

module.exports = nextConfig;