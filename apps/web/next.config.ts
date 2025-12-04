import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@inspectai/shared", "@inspectai/database"],
};

export default nextConfig;
