/**
 * Single source of truth for site-wide metadata.
 * Used by layout metadata, the nav, the command palette, sitemap, and RSS.
 */
export const site = {
  name: "Nick Buser",
  shortName: "nickbuser",
  url: "https://nickbuser.com",
  description:
    "Engineer. Interactive writeups and project case studies on systems, data, and visualization.",
  author: {
    name: "Nick Buser",
    email: "nicholas.buser@gmail.com",
  },
  nav: [
    { title: "Work", href: "/work" },
    { title: "Writing", href: "/writing" },
    { title: "About", href: "/about" },
  ],
  socials: {
    github: "https://github.com/nick-buser",
    linkedin: "https://www.linkedin.com/in/nick-buser-26bb99154/",
    email: "mailto:nicholas.buser@gmail.com",
  },
} as const;

export type Site = typeof site;
