/**
 * Single source of truth for site-wide metadata.
 * Used by layout metadata, the nav, the command palette, sitemap, and RSS.
 */
export const site = {
  name: "Nick Buser",
  shortName: "nickbuser",
  url: "https://nickbuser.com",
  description:
    "Platform engineering — infrastructure, delivery, and developer tooling — plus software, formal models, and visual essays.",
  /** The one line under the name on the home masthead. */
  lede: "Platform engineering — infrastructure, delivery, and developer tooling — alongside software projects and formal models.",
  author: {
    name: "Nick Buser",
  },
  nav: [
    { title: "Work", href: "/" },
    { title: "Case studies", href: "/work" },
    { title: "Visual essays", href: "/visual-essays" },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
  ],
  socials: {
    github: "https://github.com/nick-buser",
    linkedin: "https://www.linkedin.com/in/nick-buser-26bb99154/",
  },
} as const;

export type Site = typeof site;
