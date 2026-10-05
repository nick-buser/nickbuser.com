import Link from "next/link";
import { Badge, Chip, ExtLink } from "@/components/ui";
import { statusTone, type Project } from "@/lib/projects";

/**
 * WorkCard — the operation, made legible. A matte surface with a hairline that
 * warms to brass on hover; title in Fraunces, body in Spectral, stack as mono
 * chips, and the writeup/live/source links sitting below a quiet rule. A
 * project with no public source says so, rather than leaving the rule bare.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="nb-card">
      <div className="nb-card__head">
        <h3 className="nb-card__title">{project.title}</h3>
        <Badge tone={statusTone(project.status)}>{project.status}</Badge>
      </div>

      <p className="nb-card__body">{project.result}</p>

      <div className="nb-card__chips">
        {project.stack.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>

      <div className="nb-card__links">
        {project.writeup ? (
          <Link href={`/work/${project.writeup}`} className="nb-extlink">
            {project.writeup.includes("#") ? "In the writeup →" : "Writeup →"}
          </Link>
        ) : null}
        {project.links.live ? (
          <ExtLink href={project.links.live}>Live</ExtLink>
        ) : null}
        {project.links.template ? (
          <ExtLink href={project.links.template}>Template</ExtLink>
        ) : null}
        {project.links.repo ? (
          <ExtLink href={project.links.repo}>Source</ExtLink>
        ) : (
          <span className="nb-card__private">Private source</span>
        )}
      </div>
    </article>
  );
}
