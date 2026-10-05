"use client";

import { AthanorFlow, n, e } from "@/components/islands/athanor-flow";

/**
 * Diagrams added in version 2 of the ML orchestration writeup
 * (content/work/ml-orchestration-lab.mdx). The version-1 snapshot uses
 * ml-diagrams.tsx, which stays as it is.
 */

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

/* ── The tracker: what it reads, and from where ── */
export function TrackerFlow() {
  return (
    <AthanorFlow
      height={420}
      nodes={[
        n("cli", { x: 0, y: 0 }, {
          kind: "CLI",
          label: "mlr",
          sub: "submit · cancel · plans",
        }),
        n("spa", { x: 0, y: 200 }, {
          kind: "WEB",
          label: "Tracker app",
          sub: "React · polls the API",
        }),
        n("pod", { x: 0, y: 360 }, {
          kind: "RUNTIME",
          label: "Study pod",
          sub: "the only writer of results",
          tone: "sacred",
        }),
        n("api", { x: 260, y: 200 }, {
          kind: "API",
          label: "Tracker API",
          sub: "FastAPI · OpenAPI contract",
          tone: "cool",
        }),
        n("argo", { x: 540, y: 0 }, {
          kind: "ARGO",
          label: "Live workflows",
          sub: "kept 1 h, or 24 h if failed",
          tone: "cool",
        }),
        n("archive", { x: 540, y: 130 }, {
          kind: "ARGO",
          label: "Workflow archive",
          sub: "Postgres · 14 days",
        }),
        n("pg", { x: 540, y: 290 }, {
          kind: "RECORD",
          label: "Experiment database",
          sub: "runs · plans · submissions",
          tone: "warm",
        }),
      ]}
      edges={[
        e("c-a", "cli", "argo", { label: "create Workflow" }),
        e("c-p", "cli", "pg", { label: "record submission" }),
        e("s-a", "spa", "api", { label: "GET" }),
        e("a-l", "api", "argo", { label: "phase · 10 s cache" }),
        e("a-r", "api", "archive", { label: "after a 404", dashed: true }),
        e("a-p", "api", "pg", { label: "reads · plan edits" }),
        e("p-p", "pod", "pg", { label: "open · beat · close" }),
      ]}
    />
  );
}

/* ── Telemetry and alerts: where each signal goes ── */
export function MlTelemetryFlow() {
  return (
    <AthanorFlow
      height={500}
      nodes={[
        n("gpu", { x: 0, y: 0 }, {
          kind: "HOST",
          label: "The card",
          sub: "nvidia-smi · per process",
          tone: "sacred",
        }),
        n("cluster", { x: 0, y: 110 }, {
          kind: "K8S",
          label: "Cluster",
          sub: "metrics · events · logs",
        }),
        n("ctrl", { x: 0, y: 220 }, {
          kind: "CONTROLLERS",
          label: "Argo · Kueue · vLLM",
          sub: "/metrics",
        }),
        n("pods", { x: 0, y: 330 }, {
          kind: "RUNS",
          label: "Study pods",
          sub: "spans · heartbeats",
        }),
        n("gateway", { x: 0, y: 440 }, {
          kind: "PROXY",
          label: "LLM gateway",
          sub: "a span per request",
        }),
        n("telegraf", { x: 260, y: 0 }, {
          kind: "AGENT",
          label: "Telegraf on the host",
          sub: "15 s · VRAM by pod",
          tone: "warm",
        }),
        n("otel", { x: 260, y: 165 }, {
          kind: "AGENT",
          label: "OTel collector",
          sub: "in the cluster",
          tone: "warm",
        }),
        n("signoz", { x: 520, y: 165 }, {
          kind: "TELEMETRY",
          label: "SigNoz",
          sub: "operations only",
          tone: "cool",
        }),
        n("pg", { x: 520, y: 380 }, {
          kind: "RECORD",
          label: "Experiment database",
          sub: "run rows",
          tone: "warm",
        }),
        n("grafana", { x: 770, y: 380 }, {
          kind: "DASHBOARD",
          label: "Grafana",
          sub: "SQL · read-only role",
          tone: "cool",
        }),
        n("discord", { x: 1010, y: 270 }, {
          kind: "ALERTS",
          label: "Discord",
        }),
      ]}
      edges={[
        e("g-t", "gpu", "telegraf"),
        e("c-o", "cluster", "otel"),
        e("k-o", "ctrl", "otel", { label: "scrape" }),
        e("t-s", "telegraf", "signoz", { label: "OTLP", animated: true }),
        e("o-s", "otel", "signoz", { animated: true }),
        e("p-s", "pods", "signoz", { label: "OTLP", animated: true }),
        e("l-s", "gateway", "signoz", { animated: true }),
        e("p-p", "pods", "pg", { label: "row · heartbeat" }),
        e("p-g", "pg", "grafana"),
        e("s-d", "signoz", "discord", { label: "cluster · GPU rules", dashed: true }),
        e("g-d", "grafana", "discord", { label: "failed · stalled", dashed: true }),
      ]}
    />
  );
}
