import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@cryptogotchi/shared",
    "@cryptogotchi/pet-engine",
    "@cryptogotchi/ai-service",
  ],
};

export default nextConfig;
