import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllWriting, getListedWork } from "@/lib/content";
import { getAllSeries, getSteps } from "@/lib/experiments";

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

  const experiments: MetadataRoute.Sitemap = [
    { url: `${base}/experiments`, lastModified: new Date() },
    ...getAllSeries().flatMap((s) => [
      { url: `${base}/experiments/${s.slug}`, lastModified: s.frontmatter.updated ?? s.frontmatter.date },
      ...getSteps(s.slug).map((st) => ({
        url: `${base}${st.href}`,
        lastModified: st.frontmatter.date,
      })),
    ]),
  ];

  return [...staticRoutes, ...work, ...blog, ...experiments];
}
