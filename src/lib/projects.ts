/**
 * Selected work shown on the home masthead.
 *
 * Real projects only — plain descriptions, real stacks, real links. No invented
 * metrics, no first-person editorializing. This is the typed source the home
 * page renders from; the MDX content layer (`lib/content.ts`) drives the /work
 * index and case-study detail pages.
 */

export type ProjectStatus = "Live" | "Running" | "Built";

export interface Project {
  title: string;
  /** One plain sentence: what it is, read by moving through it. */
  result: string;
  stack: string[];
  status: ProjectStatus;
  links: { live?: string; repo?: string };
  /** slug of an in-site case study under /work, if one exists */
  caseStudy?: string;
}

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
    links: { repo: "https://github.com/nick-buser/brandomian-space-of-reasons" },
  },
  {
    title: "The Homelab",
    result:
      "A self-hosted internal developer platform on my own hardware: git push an app and it builds, deploys, and serves on the LAN.",
    stack: ["proxmox", "terraform", "ansible", "postgres", "caddy"],
    status: "Running",
    links: { repo: "https://github.com/nick-buser/homelab-template" },
    caseStudy: "the-homelab",
  },
  {
    title: "Philosophy Explorer",
    result:
      "A full-stack explorer of notes and visualizations across thinkers and works, with an optional Lean 4 proof-checking seam.",
    stack: ["hono", "drizzle", "postgres", "react", "lean 4"],
    status: "Built",
    links: { repo: "https://github.com/nick-buser/philosophy_explorer" },
  },
  {
    title: "The Polyglot’s Atlas",
    result:
      "Interactive grammar instruments for language study — drag a sentence apart, turn a register dial, swap a particle, and the grammar answers back.",
    stack: ["react", "vite", "web audio"],
    status: "Built",
    links: { repo: "https://github.com/nick-buser/language-learn" },
  },
];
