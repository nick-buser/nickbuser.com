import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The blog used to live at /writing; keep old links and feed readers landing.
  // "How this site is built" is a writeup about a project, so it left the blog
  // for /work — its specific rules sit ahead of the generic ones.
  async redirects() {
    return [
      {
        source: "/:prefix(writing|blog)/how-this-site-is-built",
        destination: "/work/how-this-site-is-built",
        permanent: true,
      },
      { source: "/writing", destination: "/blog", permanent: true },
      { source: "/writing/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
