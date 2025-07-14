/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: fasle,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
