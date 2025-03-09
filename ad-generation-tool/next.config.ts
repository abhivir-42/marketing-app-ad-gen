import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Add async headers to allow cross-origin requests
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  // Add rewrites to proxy API requests to the backend
  async rewrites() {
    return [
      // If an API request doesn't match any Next.js routes, proxy it to the backend
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL + '/:path*',
      },
    ];
  },
};

export default nextConfig;
