/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This will only warn about ESLint errors but not fail the build
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig 