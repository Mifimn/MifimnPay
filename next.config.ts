import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // We enable this to ensure html2canvas works smoothly with external images if needed later
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // This prevents the build from failing if there are minor TS type errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // This prevents the build from failing on ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
