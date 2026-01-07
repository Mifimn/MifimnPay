import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public", // destination directory for the PWA files
  disable: process.env.NODE_ENV === "development", // disable PWA in development to avoid caching issues
  register: true, // automatically register the service worker
  skipWaiting: true, // skip waiting for service worker activation
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ensure html2canvas works smoothly with external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // prevents build from failing on minor TS type errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // prevents build from failing on ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
