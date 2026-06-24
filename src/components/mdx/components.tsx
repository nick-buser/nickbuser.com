import Link from "next/link";
import type { ComponentProps } from "react";
import { D3BarChart } from "@/components/islands/d3-bar-chart";
import { FlowDiagram } from "@/components/islands/flow-diagram";
import {
  HomelabTopology,
  CicdFlow,
  OutboxFlow,
  ObservabilityFlow,
  FirmwareProvenanceFlow,
} from "@/components/islands/homelab-diagrams";
import {
  OutboxTxnSvg,
  DeviceSinksSvg,
  VizPipelineSvg,
} from "@/components/diagrams/homelab-svgs";
import { Callout } from "@/components/mdx/callout";
import { Figure } from "@/components/mdx/figure";

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
  Figure,
  D3BarChart,
  FlowDiagram,
  HomelabTopology,
  CicdFlow,
  OutboxFlow,
  ObservabilityFlow,
  FirmwareProvenanceFlow,
  OutboxTxnSvg,
  DeviceSinksSvg,
  VizPipelineSvg,
};
