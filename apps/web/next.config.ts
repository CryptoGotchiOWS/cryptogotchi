import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@cryptogotchi/shared",
    "@cryptogotchi/pet-engine",
    "@cryptogotchi/ai-service",
  ],
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

export default nextConfig;
