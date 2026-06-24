import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Nick Buser.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">About</h1>
      <div className="prose max-w-none dark:prose-invert">
        <p>
          Placeholder bio. This page is intentionally minimal — copy and visual
          treatment land during the design phase.
        </p>
        <p>
          Reach me on{" "}
          <a href={site.socials.github}>GitHub</a> or{" "}
          <a href={site.socials.linkedin}>LinkedIn</a>.
        </p>
      </div>
    </div>
  );
}
