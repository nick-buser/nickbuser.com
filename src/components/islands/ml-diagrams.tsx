"use client";

import { AthanorFlow, n, e } from "@/components/islands/athanor-flow";

/**
 * Diagrams for the ML orchestration writeup (content/work/ml-orchestration-lab.mdx).
 * Fixed-layout AthanorFlows, pan / zoom to inspect.
 */

/* ── A GPU pod's path: policy, then quota, then placement ── */
export function GpuAdmissionFlow() {
  return (
    <AthanorFlow
      height={360}
      nodes={[
        n("source", { x: 0, y: 95 }, {
          kind: "WORKLOAD",
          label: "GPU pod",
          sub: "step · Deployment · Job",
        }),
        n("kyverno", { x: 215, y: 95 }, {
          kind: "POLICY",
          label: "Kyverno",
          sub: "workflow steps: template mark",
          tone: "warm",
        }),
        n("kueue", { x: 440, y: 95 }, {
          kind: "ADMISSION",
          label: "Kueue",
          sub: "quota · priority · gate",
          tone: "cool",
        }),
        n("default", { x: 670, y: 0 }, {
          kind: "PLACEMENT",
          label: "kube-scheduler",
          sub: "single pods · Deployments",
          tone: "cool",
        }),
        n("volcano", { x: 670, y: 190 }, {
          kind: "PLACEMENT",
          label: "Volcano",
          sub: "gangs · all or nothing",
          tone: "cool",
        }),
        n("gpu", { x: 900, y: 95 }, {
          kind: "GPU NODE",
          label: "One 16 GB card",
          sub: "8 time slices",
          tone: "sacred",
        }),
      ]}
      edges={[
        e("s-k", "source", "kyverno", { label: "admission" }),
        e("k-q", "kyverno", "kueue"),
        e("q-d", "kueue", "default", { label: "ungate" }),
        e("q-v", "kueue", "volcano", { label: "ungate group" }),
        e("d-g", "default", "gpu", { label: "bind" }),
        e("v-g", "volcano", "gpu", { label: "bind all N" }),
      ]}
    />
  );
}

/* ── The quota shape: one cohort, two ClusterQueues, the LocalQueues that feed them ── */
export function GpuQueueTree() {
  return (
    <AthanorFlow
      height={440}
      nodes={[
        n("cohort", { x: 300, y: 0 }, {
          kind: "COHORT",
          label: "One GPU's worth",
          sub: "unused quota is lent",
          tone: "warm",
          flow: "tb",
        }),
        n("tower", { x: 90, y: 140 }, {
          kind: "CLUSTERQUEUE",
          label: "General GPU work",
          sub: "8 slices · lends 1",
          tone: "cool",
          flow: "tb",
        }),
        n("llm", { x: 520, y: 140 }, {
          kind: "CLUSTERQUEUE",
          label: "Large models",
          sub: "0 slices · borrows 1",
          tone: "cool",
          flow: "tb",
        }),
        n("serving", { x: 0, y: 290 }, {
          kind: "LOCALQUEUE",
          label: "serving",
          sub: "resident models",
          flow: "tb",
        }),
        n("batch", { x: 200, y: 290 }, {
          kind: "LOCALQUEUES",
          label: "research · batch · ci",
          sub: "experiments · CI",
          flow: "tb",
        }),
        n("servingLlm", { x: 520, y: 290 }, {
          kind: "LOCALQUEUE",
          label: "serving-llm",
          sub: "7B · 12B, one at a time",
          flow: "tb",
        }),
      ]}
      edges={[
        e("c-t", "cohort", "tower"),
        e("c-l", "cohort", "llm"),
        e("t-s", "tower", "serving", { dashed: true }),
        e("t-b", "tower", "batch", { dashed: true }),
        e("l-s", "llm", "servingLlm", { dashed: true }),
      ]}
    />
  );
}

/* ── An experiment, submit to record ── */
export function ExperimentFlow() {
  return (
    <AthanorFlow
      height={400}
      nodes={[
        n("cli", { x: 0, y: 90 }, {
          kind: "CLI",
          label: "submit",
          sub: "study · spec · priority",
        }),
        n("workflow", { x: 205, y: 90 }, {
          kind: "ARGO",
          label: "Cell or sweep",
          sub: "templates pinned by commit",
          tone: "cool",
        }),
        n("step", { x: 430, y: 90 }, {
          kind: "PLATFORM",
          label: "GPU step template",
          sub: "queue · priority · retry",
          tone: "warm",
        }),
        n("pod", { x: 655, y: 90 }, {
          kind: "RUNTIME",
          label: "Study pod",
          sub: "main(spec)",
          tone: "sacred",
        }),
        n("row", { x: 890, y: -30 }, {
          kind: "RECORD",
          label: "Run row",
          sub: "Postgres · one success per key",
          tone: "warm",
        }),
        n("blobs", { x: 890, y: 90 }, {
          kind: "ARTIFACTS",
          label: "Content-addressed",
          sub: "Garage S3 · sha-256",
          tone: "warm",
        }),
        n("telemetry", { x: 890, y: 210 }, {
          kind: "TELEMETRY",
          label: "SigNoz",
          sub: "joined by pod name",
        }),
      ]}
      edges={[
        e("c-w", "cli", "workflow", { label: "Workflow" }),
        e("w-s", "workflow", "step", { label: "templateRef" }),
        e("s-p", "step", "pod", { label: "Kueue admits" }),
        e("p-r", "pod", "row", { label: "open · close" }),
        e("p-b", "pod", "blobs", { label: "put" }),
        e("p-t", "pod", "telemetry", { label: "OTLP", dashed: true }),
      ]}
    />
  );
}
