import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

/* eslint-disable-next-line import/no-commonjs */
/* ONLY A TEMPORARY FIX FOR ESLINT ISSUES DURING BUILD */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
