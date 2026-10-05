import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllWriting, getListedWork } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const staticRoutes: MetadataRoute.Sitemap = ["", "/work", "/visual-essays", "/blog", "/about"].map(
    (p) => ({ url: `${base}${p}`, lastModified: new Date() }),
  );

  const work: MetadataRoute.Sitemap = getListedWork().map((d) => ({
    url: `${base}/work/${d.slug}`,
    lastModified: d.frontmatter.updated ?? d.frontmatter.date,
  }));

  const blog: MetadataRoute.Sitemap = getAllWriting().map((d) => ({
    url: `${base}/blog/${d.slug}`,
    lastModified: d.frontmatter.updated ?? d.frontmatter.date,
  }));

  return [...staticRoutes, ...work, ...blog];
}
