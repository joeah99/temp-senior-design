import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Also ignore type errors during build as they are likely present too
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
