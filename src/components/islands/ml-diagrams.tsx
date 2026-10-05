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

/* ── How a run's row gets its final status ── */
export function RunEndingsFlow() {
  return (
    <AthanorFlow
      height={460}
      nodes={[
        n("preempt", { x: 0, y: 0 }, {
          kind: "KUEUE",
          label: "Preemption",
          sub: "a higher class needs quota",
        }),
        n("drain", { x: 0, y: 95 }, {
          kind: "NODE",
          label: "Drain",
          sub: "eviction API",
        }),
        n("cancel", { x: 0, y: 190 }, {
          kind: "CLI",
          label: "Cancel",
          sub: "mark the row, then Stop",
        }),
        n("raised", { x: 0, y: 300 }, {
          kind: "STUDY",
          label: "Code raised",
        }),
        n("killed", { x: 0, y: 400 }, {
          kind: "NODE",
          label: "SIGKILL · OOM",
          sub: "nothing runs on the way out",
        }),
        n("sigterm", { x: 250, y: 95 }, {
          kind: "SIGNAL",
          label: "SIGTERM",
          sub: "handler writes nothing",
          tone: "warm",
        }),
        n("exit", { x: 480, y: 150 }, {
          kind: "RUN",
          label: "Close the row",
          sub: "compare-and-set on running",
          tone: "cool",
        }),
        n("reaper", { x: 480, y: 400 }, {
          kind: "CRONWORKFLOW",
          label: "Reaper",
          sub: "every 10 min · 2 h silent",
          tone: "cool",
        }),
        n("interrupted", { x: 730, y: 0 }, {
          kind: "STATUS",
          label: "interrupted",
          sub: "stopped from outside",
          tone: "sacred",
        }),
        n("cancelled", { x: 730, y: 140 }, {
          kind: "STATUS",
          label: "cancelled",
          sub: "a cancel came first",
          tone: "sacred",
        }),
        n("failed", { x: 730, y: 300 }, {
          kind: "STATUS",
          label: "failed",
          sub: "the code or the process died",
          tone: "sacred",
        }),
        n("retry", { x: 970, y: 0 }, {
          kind: "ARGO",
          label: "Retry attempt",
          sub: "new row · retry_of",
          tone: "warm",
        }),
      ]}
      edges={[
        e("p-s", "preempt", "sigterm"),
        e("d-s", "drain", "sigterm"),
        e("c-s", "cancel", "sigterm"),
        e("s-x", "sigterm", "exit", { label: "SystemExit(143)" }),
        e("r-x", "raised", "exit", { label: "exception" }),
        e("x-i", "exit", "interrupted", { label: "no cancel mark" }),
        e("x-c", "exit", "cancelled", { label: "cancel mark" }),
        e("x-f", "exit", "failed"),
        e("k-r", "killed", "reaper", { label: "row goes quiet", dashed: true }),
        e("r-f", "reaper", "failed"),
        e("i-r", "interrupted", "retry", { label: "OnError", dashed: true }),
      ]}
    />
  );
}

/* ── Telemetry for one run, layer by layer. Dashed edges are planned. ── */
export function TelemetryStackFlow() {
  return (
    <AthanorFlow
      height={500}
      nodes={[
        n("model", { x: 0, y: 0 }, {
          kind: "MODEL",
          label: "Model internals",
          sub: "activations · nnsight",
        }),
        n("kernels", { x: 0, y: 100 }, {
          kind: "FRAMEWORK",
          label: "Kernels and framework",
          sub: "torch.profiler · Perfetto",
        }),
        n("card", { x: 0, y: 200 }, {
          kind: "DEVICE",
          label: "Process and card",
          sub: "memory · power · clocks",
          tone: "sacred",
        }),
        n("run", { x: 0, y: 300 }, {
          kind: "RUN",
          label: "Run and requests",
          sub: "spans · heartbeats",
        }),
        n("cluster", { x: 0, y: 400 }, {
          kind: "CLUSTER",
          label: "Scheduler and cluster",
          sub: "Kueue · Argo · k8s events",
        }),
        n("artifacts", { x: 330, y: 70 }, {
          kind: "ARTIFACTS",
          label: "Run artifacts",
          sub: "traces · sample tables",
          tone: "warm",
        }),
        n("signoz", { x: 330, y: 320 }, {
          kind: "TELEMETRY",
          label: "SigNoz",
          sub: "metrics · traces · logs",
          tone: "cool",
        }),
        n("record", { x: 640, y: 195 }, {
          kind: "RECORD",
          label: "The run",
          sub: "joined on run id and pod",
          tone: "warm",
        }),
      ]}
      edges={[
        e("m-a", "model", "artifacts", { dashed: true }),
        e("k-a", "kernels", "artifacts", { label: "trace files", dashed: true }),
        e("c-a", "card", "artifacts", { label: "10 Hz samples", dashed: true }),
        e("c-s", "card", "signoz", { label: "15 s, per pod", animated: true }),
        e("r-s", "run", "signoz", { animated: true }),
        e("l-s", "cluster", "signoz", { animated: true }),
        e("a-r", "artifacts", "record"),
        e("s-r", "signoz", "record", { label: "run id · pod" }),
      ]}
    />
  );
}
