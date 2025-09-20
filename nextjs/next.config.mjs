/** @type {import('next').NextConfig} */

const API_URL = process.env.API_URL || "http://fastapi:8000";

const nextConfig = {
  reactStrictMode: true,
  // Build a minimal production image
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Speed up Docker builds by skipping type/ESLint checks
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
