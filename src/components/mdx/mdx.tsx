import type { ComponentProps } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx/components";

/**
 * Renders an MDX string as a React Server Component. MDX is compiled at build
 * time for static pages — no client bundle for the prose, only the islands
 * (<D3BarChart />, <FlowDiagram />) hydrate.
 */
export function Mdx({
  source,
  components,
}: {
  source: string;
  /** Extra components for this page only, e.g. one bound to the page's own data. */
  components?: ComponentProps<typeof MDXRemote>["components"];
}) {
  return (
    <MDXRemote
      source={source}
      components={{ ...mdxComponents, ...components }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            [
              rehypePrettyCode,
              { theme: { dark: "github-dark", light: "github-light" } },
            ],
          ],
        },
      }}
    />
  );
}
