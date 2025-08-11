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
  webpack: (config, { isServer }) => {
    // Handle Web Workers for audio transcription
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // Ensure proper handling of worker files
      config.output.globalObject = 'self';
    }

    return config;
  },
  // Enable experimental features for Web Workers
  experimental: {
    webpackBuildWorker: true,
  },
}

export default nextConfig
