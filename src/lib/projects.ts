/**
 * Every project on the site, in curated order.
 *
 * Real projects only — plain descriptions, real stacks, real links. No invented
 * metrics, no first-person editorializing. This is the typed source the home
 * page, the project table, and the visual-essays page render from; the MDX
 * content layer (`lib/content.ts`) drives the case studies and the blog.
 */

export type ProjectStatus = "Live" | "Running" | "Built" | "In progress";

/**
 * What kind of work a project is. Drives where it sits on the site: platform
 * work leads the home page, software and formal modelling fill the project
 * table under it, and visual essays get their own page.
 */
export type ProjectCategory = "platform" | "software" | "modelling" | "essay";

/**
 * A body of work several projects belong to — the homelab is one: an
 * environment whose systems are each their own project, not a project itself.
 * Groups carry the shared context (blurb, case study, template repo) so the
 * projects inside them don't have to repeat it.
 */
export type ProjectGroupId = "homelab" | "agents";

export interface ProjectGroup {
  id: ProjectGroupId;
  title: string;
  blurb: string;
  /** slug of the case study that covers the group as a whole */
  caseStudy?: string;
  links?: { repo?: string };
}

export interface Project {
  title: string;
  /** One plain sentence: what it is, read by moving through it. */
  result: string;
  stack: string[];
  status: ProjectStatus;
  category: ProjectCategory;
  group?: ProjectGroupId;
  links: { live?: string; repo?: string };
  /**
   * Path of an in-site case study under /work, if one covers it — a slug, or a
   * slug plus `#section` when the project is one part of a larger writeup.
   */
  caseStudy?: string;
}

/** Category labels, in display (and sort) order. */
export const CATEGORIES: { id: ProjectCategory; title: string }[] = [
  { id: "platform", title: "Platform" },
  { id: "software", title: "Software" },
  { id: "modelling", title: "Formal modelling" },
  { id: "essay", title: "Visual essay" },
];

/** Groups within the platform topic, in display order. */
export const GROUPS: ProjectGroup[] = [
  {
    id: "homelab",
    title: "The homelab",
    blurb:
      "Three Proxmox nodes running a self-hosted developer platform. Each system below is its own project; the case study walks through how they fit together.",
    caseStudy: "the-homelab",
    links: { repo: "https://github.com/nick-buser/homelab-template" },
  },
  {
    id: "agents",
    title: "Agent tooling",
    blurb: "Infrastructure for running coding agents.",
  },
];

export function categoryTitle(id: ProjectCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.title ?? id;
}

/** A "live" register (verdigris dot) vs a "complete" register (brass). */
export function isLive(status: string): boolean {
  return /live|running/i.test(status);
}

/** Badge tone for a status: live/running glow, built is complete, the rest wait. */
export function statusTone(status: ProjectStatus): "positive" | "complete" | "pending" {
  if (isLive(status)) return "positive";
  return status === "Built" ? "complete" : "pending";
}

export function projectsIn(...categories: ProjectCategory[]): Project[] {
  return projects.filter((p) => categories.includes(p.category));
}

export const projects: Project[] = [
  // ── Platform ──────────────────────────────────────────────────────────────
  {
    title: "Push-to-Deploy Pipeline",
    result:
      "Open a pull request and the app ships: Woodpecker builds the image into Gitea’s registry, Dokploy redeploys it, and a merge lands on dev while a version tag lands on prod.",
    stack: ["gitea", "woodpecker", "dokploy", "docker swarm", "caddy"],
    status: "Running",
    category: "platform",
    group: "homelab",
    links: {},
    caseStudy: "the-homelab#git-push-and-it-deploys",
  },
  {
    title: "k3s GitOps Cluster",
    result:
      "A three-node k3s cluster driven entirely from one Git repo — Argo CD syncs on push, and policy, backups, encrypted secrets, and GPU inference tenants are all declared there.",
    stack: ["k3s", "argo cd", "helm", "sops", "kyverno", "velero", "vllm"],
    status: "Running",
    category: "platform",
    group: "homelab",
    links: {},
  },
  {
    title: "labctl",
    result:
      "The operator CLI: renders tenant credentials from contracts, deploys in dependency order, and onboards a new tenant onto the GitOps cluster in one command.",
    stack: ["python", "typer", "terraform", "ansible", "pytest"],
    status: "Built",
    category: "platform",
    group: "homelab",
    links: {},
  },
  {
    title: "Multi-Tenant Postgres",
    result:
      "One shared Postgres, tenanted by role: each project gets its own database with migrator, DML-only, and read-only roles, rendered from a linted YAML contract — so a running app can never run DDL.",
    stack: ["postgres", "ansible", "yaml contracts"],
    status: "Running",
    category: "platform",
    group: "homelab",
    links: {},
    caseStudy: "the-homelab#one-postgres-many-tenants",
  },
  {
    title: "Fleet Event Spine",
    result:
      "Services publish domain events into Redpanda through a transactional outbox, with Debezium doing change-data-capture and a versioned JSON Schema envelope as the contract.",
    stack: ["redpanda", "debezium", "postgres", "json schema"],
    status: "Running",
    category: "platform",
    group: "homelab",
    links: {},
    caseStudy: "the-homelab#the-event-log",
  },
  {
    title: "Observability",
    result:
      "Apps and devices ship OpenTelemetry to one SigNoz instance, with the OTLP endpoint as a per-tenant switch; language-model workloads get richer traces in Langfuse.",
    stack: ["opentelemetry", "signoz", "langfuse"],
    status: "Running",
    category: "platform",
    group: "homelab",
    links: {},
    caseStudy: "the-homelab#seeing-the-system",
  },
  {
    title: "Firmware Provenance Pipeline",
    result:
      "The same CI builds ESP32 firmware and FPGA bitstreams: each artifact is content-addressed by its commit, indexed in Postgres, and hash-verified on the device before it flashes.",
    stack: ["rust", "esp32", "woodpecker", "garage s3", "postgres", "mqtt"],
    status: "Built",
    category: "platform",
    group: "homelab",
    links: {},
    caseStudy: "the-homelab#the-bench-firmware-that-proves-where-it-came-from",
  },
  {
    title: "Homelab Map",
    result:
      "A read-only map of the whole estate, generated by parsing the Terraform, Ansible, and Argo CD sources — so it cannot drift from what is declared.",
    stack: ["react", "vite", "typescript", "zod"],
    status: "Running",
    category: "platform",
    group: "homelab",
    links: {},
  },
  {
    title: "tmux-agent",
    result:
      "A control plane for coding agents — tmux sessions over HTTP, an MCP server, a project-management CLI, and a loop harness — deployed as a tenant on the k3s cluster.",
    stack: ["go", "react", "typescript", "openapi", "mcp"],
    status: "Built",
    category: "platform",
    group: "agents",
    links: {},
  },
  // ── Software ──────────────────────────────────────────────────────────────
  {
    title: "Philosophy Explorer",
    result:
      "A full-stack explorer of notes and visualizations across thinkers and works, with an optional Lean 4 proof-checking seam.",
    stack: ["hono", "drizzle", "postgres", "react", "lean 4"],
    status: "Live",
    category: "software",
    links: {
      live: "https://philosophy-explorer.pages.dev/logic",
      repo: "https://github.com/nick-buser/philosophy_explorer",
    },
  },
  {
    title: "Language Learning",
    result:
      "Interactive grammar instruments for language study — drag a sentence apart, turn a register dial, swap a particle, and the grammar answers back.",
    stack: ["react", "vite", "web audio"],
    status: "Live",
    category: "software",
    links: {
      live: "https://language-learn-38r.pages.dev/",
      repo: "https://github.com/nick-buser/language-learn",
    },
  },
  {
    title: "Five Towers",
    result:
      "A browser strategy game built around its own ruleset and win condition.",
    stack: ["typescript", "vercel"],
    status: "Live",
    category: "software",
    links: { live: "https://five-towers-web.vercel.app/" },
  },
  {
    title: "Cooking & Pantry Tracker",
    result:
      "A full-stack pantry and cooking tracker, instrumented end to end with OpenTelemetry.",
    stack: ["vercel", "opentelemetry"],
    status: "Live",
    category: "software",
    links: { live: "https://cooking-and-pantry-tracker-web.vercel.app/" },
  },
  // ── Formal modelling ──────────────────────────────────────────────────────
  {
    title: "Space of Reasons",
    result:
      "A formal workbench for Brandom’s inferentialism — a deontic scorekeeper tracking commitments and entitlements across perspectives.",
    stack: ["ocaml", "dune", "menhir", "qcheck"],
    status: "Built",
    category: "modelling",
    links: { repo: "https://github.com/nick-buser/brandomian-space-of-reasons" },
  },
  {
    title: "State-Space Workbench",
    result:
      "A batch-first workbench for treating heterogeneous formalisms — TLA+, Lean, z3, egglog, Maude — as transition systems behind one kernel-owned contract, each tool wrapped as a JSON-RPC adapter.",
    stack: ["python", "json-rpc", "emacs lisp"],
    status: "In progress",
    category: "modelling",
    links: {},
  },
  {
    title: "Circadian Entrainment",
    result:
      "An interactive model of circadian entrainment: how a biological clock locks onto light and other cues.",
    stack: ["react", "typescript", "cloudflare"],
    status: "Live",
    category: "modelling",
    links: { live: "https://circadian-entrainment.nicholas-buser.workers.dev/" },
  },
  // ── Visual essays ─────────────────────────────────────────────────────────
  {
    title: "Whale Talk",
    result:
      "An interactive visual essay on how whales — and animals more broadly — communicate, read by moving through it.",
    stack: ["html / css / js", "cloudflare workers"],
    status: "Live",
    category: "essay",
    links: {
      live: "https://whale-talk.nicholas-buser.workers.dev/",
      repo: "https://github.com/nick-buser/whale-talk",
    },
  },
  {
    title: "GLP-1 Brain Atlas",
    result:
      "An interactive mechanism atlas over the GLP-1 drug literature, with every claim carrying its provenance, scope, and confidence.",
    stack: ["react", "typescript", "react flow", "molstar", "cloudflare"],
    status: "Live",
    category: "essay",
    links: {
      live: "https://glp1-brain-effect-exploration.nicholas-buser.workers.dev/",
      repo: "https://github.com/nick-buser/glp1_brain_impact_exploration",
    },
  },
  {
    title: "Math Explorer",
    result:
      "An interactive explorer for mathematical ideas, built to be understood by moving through them.",
    stack: ["cloudflare"],
    status: "Live",
    category: "essay",
    links: { live: "https://math-explorer.nicholas-buser.workers.dev/" },
  },
  {
    title: "Physics Explorer",
    result:
      "An interactive explorer for physical systems, learned by direct manipulation.",
    stack: ["cloudflare"],
    status: "Live",
    category: "essay",
    links: { live: "https://physics-explorer.nicholas-buser.workers.dev/" },
  },
  {
    title: "Computational Neuroscience Explorer",
    result:
      "An interactive explorer of computational-neuroscience models — neurons and networks you can probe.",
    stack: ["cloudflare"],
    status: "Live",
    category: "essay",
    links: { live: "https://comp-neuro-explorer.nicholas-buser.workers.dev/" },
  },
];
