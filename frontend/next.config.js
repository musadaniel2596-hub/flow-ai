/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow builds even with TypeScript errors in dev
  typescript: {
    ignoreBuildErrors: false,
  },
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  },
};

module.exports = nextConfig;
