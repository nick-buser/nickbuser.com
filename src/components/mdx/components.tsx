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
  GitopsTopology,
  GitopsDeliveryFlow,
  AppOfAppsTree,
} from "@/components/islands/gitops-diagrams";
import {
  GpuAdmissionFlow,
  GpuQueueTree,
  ExperimentFlow,
} from "@/components/islands/ml-diagrams";
import { StepTimeSvg, OverlapSpeedupSvg } from "@/components/diagrams/ml-charts";
import {
  RunEndingsFlow,
  TrackerFlow,
  MlTelemetryFlow,
} from "@/components/islands/ml-v2-diagrams";
import { PreemptionTimelineSvg } from "@/components/diagrams/ml-v2-charts";
import {
  OutboxTxnSvg,
  DeviceSinksSvg,
  VizPipelineSvg,
} from "@/components/diagrams/homelab-svgs";
import { Callout } from "@/components/mdx/callout";
import { Incident, Incidents } from "@/components/mdx/incident";
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
  Incident,
  Incidents,
  D3BarChart,
  FlowDiagram,
  HomelabTopology,
  CicdFlow,
  OutboxFlow,
  ObservabilityFlow,
  FirmwareProvenanceFlow,
  GitopsTopology,
  GitopsDeliveryFlow,
  AppOfAppsTree,
  GpuAdmissionFlow,
  GpuQueueTree,
  ExperimentFlow,
  StepTimeSvg,
  OverlapSpeedupSvg,
  RunEndingsFlow,
  TrackerFlow,
  MlTelemetryFlow,
  PreemptionTimelineSvg,
  OutboxTxnSvg,
  DeviceSinksSvg,
  VizPipelineSvg,
};
