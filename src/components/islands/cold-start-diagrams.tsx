"use client";

import { AthanorFlow, n, e } from "@/components/islands/athanor-flow";

/** Diagrams for the LLM cold-start series (content/experiments/llm-cold-start). */

/* ── How a request wakes the 7B, and how it goes back to sleep ── */
export function WakePathFlow() {
  return (
    <AthanorFlow
      height={380}
      nodes={[
        n("app", { x: 0, y: 80 }, {
          kind: "CALLER",
          label: "Any app or agent",
          sub: "an OpenAI-style request",
        }),
        n("gateway", { x: 260, y: 80 }, {
          kind: "GATEWAY",
          label: "LLM gateway",
          sub: "wakes the model · holds the request",
          tone: "warm",
        }),
        n("model", { x: 540, y: 80 }, {
          kind: "DEPLOYMENT",
          label: "The 7B",
          sub: "0 replicas until asked",
          tone: "sacred",
        }),
        n("card", { x: 810, y: 80 }, {
          kind: "GPU",
          label: "The card",
          sub: "about 12 GB while awake",
        }),
        n("reaper", { x: 260, y: 230 }, {
          kind: "CRONJOB",
          label: "Idle reaper",
          sub: "60 idle minutes → 0",
          tone: "cool",
        }),
        n("kueue", { x: 260, y: 330 }, {
          kind: "KUEUE",
          label: "One-LLM slot",
          sub: "admits the pod against quota",
          tone: "cool",
        }),
      ]}
      edges={[
        e("a-g", "app", "gateway", { label: "request" }),
        e("g-m", "gateway", "model", { label: "scale 0 → 1" }),
        e("m-c", "model", "card", { label: "Ready in ~35 s" }),
        e("r-m", "reaper", "model", { label: "scale → 0", dashed: true }),
        e("k-m", "kueue", "model", { label: "admit", dashed: true }),
      ]}
    />
  );
}
