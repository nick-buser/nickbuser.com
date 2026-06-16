import Link from "next/link";
import type { ComponentProps } from "react";
import { D3BarChart } from "@/components/islands/d3-bar-chart";
import { FlowDiagram } from "@/components/islands/flow-diagram";
import { Callout } from "@/components/mdx/callout";

function Anchor({ href = "", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return <Link href={href} {...props} />;
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      {...props}
    />
  );
}

/**
 * Components available inside MDX. Interactive islands registered here can be
 * used directly in any writeup, e.g. <FlowDiagram /> or <D3BarChart />.
 */
export const mdxComponents = {
  a: Anchor,
  Callout,
  D3BarChart,
  FlowDiagram,
};
