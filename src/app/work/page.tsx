import { redirect } from "next/navigation";

/**
 * Work lives on the home page now — it's the same surface. Keep the /work path
 * working (old links, the parent of the /work/<slug> case studies) by
 * redirecting to it.
 */
export default function WorkIndex() {
  redirect("/");
}
