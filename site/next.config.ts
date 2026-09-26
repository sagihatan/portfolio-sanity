import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let browsers reuse videos, images and icons between visits instead of
  // re-checking each one. Not `immutable`: some files get replaced under the same name.
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default nextConfig;
