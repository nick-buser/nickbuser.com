import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllWork, getAllWriting } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/work",
    "/writing",
    "/about",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));

  const work: MetadataRoute.Sitemap = getAllWork().map((d) => ({
    url: `${base}/work/${d.slug}`,
    lastModified: d.frontmatter.updated ?? d.frontmatter.date,
  }));

  const writing: MetadataRoute.Sitemap = getAllWriting().map((d) => ({
    url: `${base}/writing/${d.slug}`,
    lastModified: d.frontmatter.updated ?? d.frontmatter.date,
  }));

  return [...staticRoutes, ...work, ...writing];
}
