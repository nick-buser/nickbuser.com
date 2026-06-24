"use client";

import { AthanorFlow, n, e } from "@/components/islands/athanor-flow";

/**
 * The homelab case-study diagrams. Each is a fixed-layout AthanorFlow built
 * from the real architecture — pan / zoom to inspect, no drag. Used inside
 * <Figure> wrappers in content/work/the-homelab.mdx.
 */

/* ── Physical / trust shape: three Proxmox nodes, the edge, data gravity ── */
export function HomelabTopology() {
  return (
    <AthanorFlow
      height={320}
      nodes={[
        n("client", { x: 0, y: 95 }, {
          kind: "CLIENT",
          label: "Browser · device",
          sub: "LAN / tailnet",
        }),
        n("edge", { x: 210, y: 95 }, {
          kind: "EDGE",
          label: "Caddy + Tailscale",
          sub: "internal CA · public LE",
          tone: "warm",
        }),
        n("platform", { x: 460, y: 0 }, {
          kind: "ALWAYS-ON",
          label: "Platform tier",
          sub: "forge · CI · deploy",
          tone: "cool",
        }),
        n("tower", { x: 460, y: 195 }, {
          kind: "ON-DEMAND",
          label: "ML tier",
          sub: "inference · render · synth",
          tone: "cool",
        }),
        n("nas", { x: 740, y: 95 }, {
          kind: "NAS",
          label: "Data tier",
          sub: "Postgres · object store · ZFS",
          tone: "warm",
        }),
      ]}
      edges={[
        e("c-e", "client", "edge", { label: "request" }),
        e("e-g", "edge", "platform"),
        e("e-t", "edge", "tower"),
        e("g-n", "platform", "nas", { label: "data", dashed: true }),
        e("t-n", "tower", "nas", { label: "data", dashed: true }),
      ]}
    />
  );
}

/* ── git push → live: the internal developer platform ── */
export function CicdFlow() {
  return (
    <AthanorFlow
      height={380}
      nodes={[
        n("dev", { x: 0, y: 70 }, {
          kind: "DEVELOPER",
          label: "git push · PR · tag",
        }),
        n("gitea", { x: 200, y: 70 }, {
          kind: "FORGE",
          label: "Gitea",
          sub: "git.lab + registry",
          tone: "warm",
        }),
        n("ci", { x: 410, y: 70 }, {
          kind: "CI",
          label: "Woodpecker",
          sub: "check → buildx",
          tone: "cool",
        }),
        n("registry", { x: 625, y: -45 }, {
          kind: "REGISTRY",
          label: "Gitea Packages",
          sub: "Garage S3",
        }),
        n("pg", { x: 625, y: 185 }, {
          kind: "DB",
          label: "Postgres 16",
          sub: "migrate · rw role",
        }),
        n("dokploy", { x: 855, y: 70 }, {
          kind: "DEPLOY",
          label: "Dokploy",
          sub: "Swarm · Traefik",
          tone: "cool",
        }),
        n("caddy", { x: 1065, y: 70 }, {
          kind: "EDGE",
          label: "Caddy",
          sub: "TLS · *.app.lab",
          tone: "warm",
        }),
        n("app", { x: 1265, y: 70 }, {
          kind: "RUNTIME",
          label: "App",
          sub: "app role · DML only",
          tone: "sacred",
        }),
      ]}
      edges={[
        e("e1", "dev", "gitea", { label: "push" }),
        e("e2", "gitea", "ci", { label: "webhook" }),
        e("e3", "ci", "registry", { label: "buildx push", animated: true }),
        e("e4", "ci", "pg", { label: "migrate", dashed: true }),
        e("e5", "ci", "dokploy", { label: "deploy API" }),
        e("e6", "registry", "dokploy", { label: "image" }),
        e("e7", "dokploy", "caddy"),
        e("e8", "caddy", "app"),
      ]}
    />
  );
}

/* ── Transactional outbox → CDC → Redpanda ── */
export function OutboxFlow() {
  return (
    <AthanorFlow
      height={300}
      nodes={[
        n("app", { x: 0, y: 80 }, {
          kind: "SERVICE",
          label: "App",
          sub: "domain write + outbox row",
          tone: "cool",
        }),
        n("pg", { x: 250, y: 80 }, {
          kind: "DB",
          label: "Postgres",
          sub: "wal_level = logical",
          tone: "warm",
        }),
        n("debezium", { x: 490, y: 80 }, {
          kind: "CDC",
          label: "Debezium",
          sub: "Connect · EventRouter",
          tone: "cool",
        }),
        n("redpanda", { x: 740, y: 80 }, {
          kind: "BROKER",
          label: "Redpanda",
          sub: "prod.embedded.Device",
          tone: "warm",
        }),
        n("consumer", { x: 990, y: 80 }, {
          kind: "CONSUMER",
          label: "Consumers",
          sub: "idempotent",
        }),
      ]}
      edges={[
        e("o1", "app", "pg", { label: "one transaction" }),
        e("o2", "pg", "debezium", { label: "logical slot", animated: true }),
        e("o3", "debezium", "redpanda", {
          label: "route by aggregate",
          animated: true,
        }),
        e("o4", "redpanda", "consumer", { label: "at-least-once", animated: true }),
      ]}
    />
  );
}

/* ── Telemetry fan-in: OTel → SigNoz, LLM traces → Langfuse ── */
export function ObservabilityFlow() {
  return (
    <AthanorFlow
      height={340}
      nodes={[
        n("svc", { x: 0, y: 0 }, {
          kind: "SERVICES",
          label: "Dokploy apps",
          sub: "OTLP :4318 (HTTP)",
          tone: "cool",
        }),
        n("dev", { x: 0, y: 120 }, {
          kind: "DEVICES",
          label: "ESP32 fleet",
          sub: "MQTT → Telegraf",
          tone: "cool",
        }),
        n("agents", { x: 0, y: 240 }, {
          kind: "LLM APPS",
          label: "ml_research",
          sub: "LLM spans",
          tone: "cool",
        }),
        n("signoz", { x: 360, y: 50 }, {
          kind: "OBSERVABILITY",
          label: "SigNoz",
          sub: "traces · metrics · logs",
          tone: "warm",
        }),
        n("langfuse", { x: 360, y: 240 }, {
          kind: "LLM OBS",
          label: "Langfuse",
          sub: "prompts · cost · evals",
          tone: "warm",
        }),
      ]}
      edges={[
        e("ob1", "svc", "signoz", { animated: true }),
        e("ob2", "dev", "signoz", { label: "OTLP :4317", animated: true }),
        e("ob3", "agents", "langfuse", { animated: true }),
      ]}
    />
  );
}

/* ── Firmware provenance: build → sha → Garage → device → telemetry ── */
export function FirmwareProvenanceFlow() {
  return (
    <AthanorFlow
      height={300}
      nodes={[
        n("src", { x: 0, y: 80 }, {
          kind: "SOURCE",
          label: "nick-b/embedded",
          sub: "Rust · Hardcaml",
        }),
        n("ci", { x: 220, y: 80 }, {
          kind: "CI",
          label: "Woodpecker",
          sub: "docker + native agent",
          tone: "cool",
        }),
        n("garage", { x: 460, y: 80 }, {
          kind: "ARTIFACTS",
          label: "Garage S3",
          sub: "SHA-keyed · firmware-ci",
          tone: "warm",
        }),
        n("device", { x: 700, y: 80 }, {
          kind: "DEVICE",
          label: "ESP32 · Basys 3",
          sub: "lab ota @<sha>",
          tone: "cool",
        }),
        n("signoz", { x: 940, y: 80 }, {
          kind: "OBSERVABILITY",
          label: "SigNoz",
          sub: "device telemetry",
          tone: "warm",
        }),
      ]}
      edges={[
        e("f1", "src", "ci", { label: "push" }),
        e("f2", "ci", "garage", { label: "sha256 + store" }),
        e("f3", "garage", "device", { label: "fetch + verify", animated: true }),
        e("f4", "device", "signoz", { label: "telemetry", animated: true }),
      ]}
    />
  );
}
