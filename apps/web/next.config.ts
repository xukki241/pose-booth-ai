import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker builds
  output: "standalone",

  // Allow cross-origin for MediaPipe WASM SharedArrayBuffer
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  // Turbopack config (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
