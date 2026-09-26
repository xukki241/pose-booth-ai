import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker builds
  output: "standalone",
  async rewrites() {
    const api = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },

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
  turbopack: { root: process.cwd() },
};

export default nextConfig;
