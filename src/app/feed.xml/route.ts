import { site } from "@/lib/site";
import { getAllWriting } from "@/lib/content";

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
  const items = getAllWriting()
    .map((d) => {
      const url = `${site.url}/writing/${d.slug}`;
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
