/** @type {import('next').NextConfig} */

// Use environment variable for API URL, fallback to local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://fastapi:8000";

const nextConfig = {
  reactStrictMode: true,
  // output: 'export',
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
