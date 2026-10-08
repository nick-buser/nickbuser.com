/**
 * Every project on the site, in curated order.
 *
 * Real projects only — plain descriptions, real stacks, real links. No invented
 * metrics, no first-person editorializing. This is the typed source the home
 * page, the project table, and the visual-essays page render from; the MDX
 * content layer (`lib/content.ts`) drives the writeups and the blog.
 */

export type ProjectStatus = "Live" | "Running" | "Built" | "In progress";

/**
 * The topic a project is clustered under — the kind of work, never where it
 * runs (an AWS platform project is "platform" exactly as the homelab is).
 * Platform, software, and formal modelling are the home page's card sections,
 * in that order; visual essays get their own page.
 *
 * A project is program-sized: something with its own goal. The parts of one —
 * a deploy path, a database setup, an operator CLI — are described inside it,
 * never given rows of their own. Titles say what the thing is to a reader with
 * no context; internal names belong inside a writeup.
 */
export type ProjectCategory = "platform" | "software" | "modelling" | "essay";

export interface Project {
  title: string;
  /** One plain sentence: what it is, read by moving through it. */
  result: string;
  stack: string[];
  status: ProjectStatus;
  category: ProjectCategory;
  /**
   * `repo` is the project's own public source. `template` is a public,
   * scrubbed starting point derived from a project whose source is private —
   * linked, but never presented as the source.
   */
  links: { live?: string; repo?: string; template?: string };
  /**
   * Path of an in-site writeup under /work, if one covers it — a slug, or a
   * slug plus `#section` when the project is one part of a larger writeup.
   */
  writeup?: string;
}

/** Category labels, in display (and sort) order. */
export const CATEGORIES: { id: ProjectCategory; title: string; lead: string }[] = [
  {
    id: "platform",
    title: "Platform",
    lead: "Infrastructure, delivery, and developer tooling — the systems other software is built, shipped, and run on.",
  },
  { id: "software", title: "Software", lead: "Full-stack applications." },
  {
    id: "modelling",
    title: "Formal modelling",
    lead: "Formal models of reasoning and dynamics.",
  },
  {
    id: "essay",
    title: "Visual essay",
    lead: "Interactive explorables, read by moving through them.",
  },
];

/** The topics the home page sets out as card sections, in order. */
export const HOME_TOPICS: ProjectCategory[] = ["platform", "software", "modelling"];

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
    title: "Homelab Developer Platform",
    result:
      "A self-hosted internal developer platform on my own hardware: git push an app and it builds, deploys, and serves on the LAN.",
    stack: ["proxmox", "k3s", "argo cd", "terraform", "ansible", "postgres", "signoz"],
    status: "Running",
    category: "platform",
    links: { template: "https://github.com/nick-buser/homelab-template" },
    writeup: "the-homelab",
  },
  {
    title: "ML Orchestration Lab",
    result:
      "A small ML platform on one consumer GPU: Kueue quota, Volcano gangs and Slurm on Kubernetes sharing one card, models that wake on request, and telemetry across the stack.",
    stack: ["kueue", "volcano", "slurm", "argo workflows", "vllm", "opentelemetry"],
    status: "Running",
    category: "platform",
    links: {},
    writeup: "ml-orchestration-lab",
  },
  {
    title: "Agent Control Plane",
    result:
      "A control plane for coding-agent sessions: tickets, handoffs, and decisions that agents read over MCP and a CLI, a harness that gates each change before it merges, and a web app where one person approves what lands.",
    stack: ["go", "typescript", "react", "mcp", "openapi"],
    status: "Running",
    category: "platform",
    links: {},
  },
  {
    title: "Cloud Accounts as Code",
    result:
      "Terraform for the account-level Cloudflare and Vercel configuration behind the deployed projects — DNS zones, access policies, domains — so it stops living only in dashboards.",
    stack: ["terraform", "cloudflare", "vercel", "railway"],
    status: "In progress",
    category: "platform",
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
