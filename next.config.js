const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest\.json$/],
    runtimeCaching: [
        {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'offlineCache',
                expiration: {
                    maxEntries: 200,
                },
            },
        },
    ],
})

// Allow API host for company logo images (UploadPath/Uploads/*)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
let apiHost = "";
try {
    apiHost = new URL(apiUrl).hostname;
} catch (_) {}

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: false,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    images: {
        unoptimized: true,
        ...(apiHost && {
            remotePatterns: [
                { protocol: "https", hostname: apiHost, pathname: "/Uploads/**" },
                { protocol: "http", hostname: apiHost, pathname: "/Uploads/**" },
            ],
        }),
    },
    // PWA configuration
    async headers() {
        return [
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            }
        ];
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

module.exports = withPWA(nextConfig)
