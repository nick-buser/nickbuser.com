import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The blog used to live at /writing; keep old links and feed readers landing.
  async redirects() {
    return [
      { source: "/writing", destination: "/blog", permanent: true },
      { source: "/writing/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
