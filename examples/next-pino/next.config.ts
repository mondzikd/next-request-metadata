import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ENVIRONMENT: process.env.NODE_ENV,
  },
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      "next-request-metadata": { browser: "next-request-metadata/fake" },
    },
  },
};

export default nextConfig;
