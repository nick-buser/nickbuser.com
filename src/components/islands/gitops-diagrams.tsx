"use client";

import { AthanorFlow, n, e } from "@/components/islands/athanor-flow";

/**
 * Diagrams for version 2 of the homelab writeup (the GitOps path). Kept apart
 * from homelab-diagrams.tsx, which the v1 snapshot still renders: a snapshot
 * reads with today's components, so its figures are never edited in place.
 */

/* ── Where things run: two k3s nodes on one tower, state kept off the cluster ── */
export function GitopsTopology() {
  return (
    <AthanorFlow
      height={340}
      nodes={[
        n("client", { x: 0, y: 110 }, {
          kind: "CLIENT",
          label: "Browser · device",
          sub: "LAN / tailnet",
        }),
        n("caddy", { x: 210, y: 110 }, {
          kind: "EDGE",
          label: "Caddy",
          sub: "TLS · wildcard routes",
          tone: "warm",
        }),
        n("traefik", { x: 430, y: 110 }, {
          kind: "INGRESS",
          label: "Traefik",
          sub: "NodePort · routes by Host",
          tone: "cool",
        }),
        n("server", { x: 660, y: 20 }, {
          kind: "K3S SERVER",
          label: "Control-plane VM",
          sub: "also schedules work",
          tone: "cool",
        }),
        n("agent", { x: 660, y: 200 }, {
          kind: "K3S AGENT",
          label: "Unprivileged LXC",
          sub: "shares the GPU",
          tone: "cool",
        }),
        n("data", { x: 910, y: 110 }, {
          kind: "NAS",
          label: "Data tier",
          sub: "Postgres · Garage S3 · NFS",
          tone: "warm",
        }),
      ]}
      edges={[
        e("c-e", "client", "caddy", { label: "request" }),
        e("e-t", "caddy", "traefik", { label: "plain HTTP" }),
        e("t-s", "traefik", "server"),
        e("t-a", "traefik", "agent"),
        e("s-d", "server", "data", { label: "NFS volumes", dashed: true }),
        e("a-d", "agent", "data", { label: "S3", dashed: true }),
      ]}
    />
  );
}

/* ── push → running: CI builds, a bot commits the tag, Argo CD syncs ── */
export function GitopsDeliveryFlow() {
  return (
    <AthanorFlow
      height={400}
      nodes={[
        n("dev", { x: 0, y: 80 }, {
          kind: "DEVELOPER",
          label: "git push",
          sub: "app repo · main",
        }),
        n("ci", { x: 205, y: 80 }, {
          kind: "CI",
          label: "Woodpecker",
          sub: "buildx · main-<sha8>",
          tone: "cool",
        }),
        n("harbor", { x: 420, y: -40 }, {
          kind: "REGISTRY",
          label: "Harbor",
          sub: "in-cluster · blobs in S3",
          tone: "warm",
        }),
        n("updater", { x: 640, y: 80 }, {
          kind: "CONTROLLER",
          label: "Image Updater",
          sub: "newest matching tag",
          tone: "cool",
        }),
        n("repo", { x: 860, y: 80 }, {
          kind: "GIT",
          label: "GitOps repo",
          sub: "charts/<app>/values.yaml",
          tone: "warm",
        }),
        n("argo", { x: 1080, y: 80 }, {
          kind: "CONTROLLER",
          label: "Argo CD",
          sub: "polls git · syncs",
          tone: "cool",
        }),
        n("pod", { x: 1300, y: 80 }, {
          kind: "RUNTIME",
          label: "Pod on k3s",
          sub: "new image tag",
          tone: "sacred",
        }),
      ]}
      edges={[
        e("d-c", "dev", "ci", { label: "webhook" }),
        e("c-h", "ci", "harbor", { label: "push", animated: true }),
        e("h-u", "harbor", "updater", { label: "poll tags" }),
        e("u-r", "updater", "repo", { label: "commit" }),
        e("r-a", "repo", "argo", { label: "poll" }),
        e("a-p", "argo", "pod", { label: "sync" }),
        e("h-p", "harbor", "pod", { label: "pull", dashed: true }),
      ]}
    />
  );
}

/* ── The repo's shape: a root, two app-of-apps, and what each one points at ── */
export function AppOfAppsTree() {
  return (
    <AthanorFlow
      height={460}
      nodes={[
        n("root", { x: 330, y: 0 }, {
          kind: "ROOT",
          label: "clusters/<cluster>",
          sub: "applied once at bootstrap",
          tone: "warm",
          flow: "tb",
        }),
        n("infra", { x: 110, y: 140 }, {
          kind: "APP OF APPS",
          label: "infra/",
          sub: "recurse · prune · self-heal",
          tone: "cool",
          flow: "tb",
        }),
        n("apps", { x: 550, y: 140 }, {
          kind: "APP OF APPS",
          label: "apps/",
          sub: "recurse · prune · self-heal",
          tone: "cool",
          flow: "tb",
        }),
        n("platform", { x: 0, y: 290 }, {
          kind: "APPLICATIONS",
          label: "Platform charts",
          sub: "upstream · pinned versions",
          flow: "tb",
        }),
        n("secretsApp", { x: 230, y: 290 }, {
          kind: "APPLICATION",
          label: "<app>-secrets",
          sub: "sops plugin decrypts",
          flow: "tb",
        }),
        n("tenant", { x: 550, y: 290 }, {
          kind: "APPLICATION",
          label: "apps/<app>.yaml",
          sub: "Image Updater annotations",
          flow: "tb",
        }),
        n("secrets", { x: 230, y: 430 }, {
          kind: "OUTSIDE THE TREE",
          label: "secrets/<ns>/",
          sub: "*.sops.yaml",
          tone: "warm",
          flow: "tb",
        }),
        n("chart", { x: 550, y: 430 }, {
          kind: "OUTSIDE THE TREE",
          label: "charts/<app>/",
          sub: "values.yaml holds the tag",
          tone: "warm",
          flow: "tb",
        }),
      ]}
      edges={[
        e("r-i", "root", "infra"),
        e("r-a", "root", "apps"),
        e("i-p", "infra", "platform"),
        e("i-s", "infra", "secretsApp"),
        e("a-t", "apps", "tenant"),
        e("s-s", "secretsApp", "secrets", { label: "path", dashed: true }),
        e("t-c", "tenant", "chart", { label: "path", dashed: true }),
      ]}
    />
  );
}
