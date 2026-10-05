import { site } from "@/lib/site";
import { getAllWork, getAllWriting } from "@/lib/content";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  // Writeups and blog posts, newest first — the feed carries everything new.
  const entries = [
    ...getAllWork().map((d) => ({ ...d, path: `/work/${d.slug}` })),
    ...getAllWriting().map((d) => ({ ...d, path: `/blog/${d.slug}` })),
  ].sort((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());

  const items = entries
    .map((d) => {
      const url = `${site.url}${d.path}`;
      return `    <item>
      <title>${escapeXml(d.frontmatter.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${d.frontmatter.date.toUTCString()}</pubDate>
      <description>${escapeXml(d.frontmatter.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
