/**
 * Selected work shown on the home masthead.
 *
 * Real projects only — plain descriptions, real stacks, real links. No invented
 * metrics, no first-person editorializing. This is the typed source the home
 * page renders from; the MDX content layer (`lib/content.ts`) drives the /work
 * index and case-study detail pages.
 */

export type ProjectStatus = "Live" | "Running" | "Built";

/** Which bench a project sits on. Drives the grouping on the work page. */
export type ProjectSection = "essays" | "local" | "deployed";

export interface Project {
  title: string;
  /** One plain sentence: what it is, read by moving through it. */
  result: string;
  stack: string[];
  status: ProjectStatus;
  section: ProjectSection;
  links: { live?: string; repo?: string };
  /** slug of an in-site case study under /work, if one exists */
  caseStudy?: string;
}

/** Section titles, in display order. */
export const SECTIONS: { id: ProjectSection; title: string }[] = [
  { id: "essays", title: "Visual essays" },
  { id: "local", title: "Local development" },
  { id: "deployed", title: "Deployed services" },
];

/** A "live" register (verdigris dot) vs a "complete" register (brass). */
export function isLive(status: string): boolean {
  return /live|running/i.test(status);
}

export const projects: Project[] = [
  {
    title: "Whale Talk",
    result:
      "An interactive visual essay on how whales — and animals more broadly — communicate, read by moving through it.",
    stack: ["html / css / js", "cloudflare workers"],
    status: "Live",
    section: "essays",
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
    section: "essays",
    links: {
      live: "https://glp1-brain-effect-exploration.nicholas-buser.workers.dev/",
      repo: "https://github.com/nick-buser/glp1_brain_impact_exploration",
    },
  },
  {
    title: "Space of Reasons",
    result:
      "A formal workbench for Brandom’s inferentialism — a deontic scorekeeper tracking commitments and entitlements across perspectives.",
    stack: ["ocaml", "dune", "menhir", "qcheck"],
    status: "Built",
    section: "local",
    links: { repo: "https://github.com/nick-buser/brandomian-space-of-reasons" },
  },
  {
    title: "The Homelab",
    result:
      "A self-hosted internal developer platform on my own hardware: git push an app and it builds, deploys, and serves on the LAN.",
    stack: ["proxmox", "terraform", "ansible", "postgres", "caddy"],
    status: "Running",
    section: "local",
    links: { repo: "https://github.com/nick-buser/homelab-template" },
    caseStudy: "the-homelab",
  },
  {
    title: "Philosophy Explorer",
    result:
      "A full-stack explorer of notes and visualizations across thinkers and works, with an optional Lean 4 proof-checking seam.",
    stack: ["hono", "drizzle", "postgres", "react", "lean 4"],
    status: "Built",
    section: "deployed",
    links: { repo: "https://github.com/nick-buser/philosophy_explorer" },
  },
  {
    title: "The Polyglot’s Atlas",
    result:
      "Interactive grammar instruments for language study — drag a sentence apart, turn a register dial, swap a particle, and the grammar answers back.",
    stack: ["react", "vite", "web audio"],
    status: "Built",
    section: "deployed",
    links: { repo: "https://github.com/nick-buser/language-learn" },
  },
  {
    title: "Math Explorer",
    result:
      "An interactive explorer for mathematical ideas, built to be understood by moving through them.",
    stack: ["cloudflare"],
    status: "Live",
    section: "essays",
    links: { live: "https://math-explorer.nicholas-buser.workers.dev/" },
  },
  {
    title: "Physics Explorer",
    result:
      "An interactive explorer for physical systems, learned by direct manipulation.",
    stack: ["cloudflare"],
    status: "Live",
    section: "essays",
    links: { live: "https://physics-explorer.nicholas-buser.workers.dev/" },
  },
  {
    title: "Computational Neuroscience Explorer",
    result:
      "An interactive explorer of computational-neuroscience models — neurons and networks you can probe.",
    stack: ["cloudflare"],
    status: "Live",
    section: "essays",
    links: { live: "https://comp-neuro-explorer.nicholas-buser.workers.dev/" },
  },
  {
    title: "Circadian Entrainment",
    result:
      "An interactive model of circadian entrainment: how a biological clock locks onto light and other cues.",
    stack: ["react", "typescript", "cloudflare"],
    status: "Live",
    section: "deployed",
    links: { live: "https://circadian-entrainment.nicholas-buser.workers.dev/" },
  },
  {
    title: "Five Towers",
    result:
      "A browser strategy game built around its own ruleset and win condition.",
    stack: ["typescript", "vercel"],
    status: "Live",
    section: "deployed",
    links: { live: "https://five-towers-web.vercel.app/" },
  },
  {
    title: "Cooking & Pantry Tracker",
    result:
      "A full-stack pantry and cooking tracker, instrumented end to end with OpenTelemetry.",
    stack: ["vercel", "opentelemetry"],
    status: "Live",
    section: "deployed",
    links: { live: "https://cooking-and-pantry-tracker-web.vercel.app/" },
  },
];
