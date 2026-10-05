/**
 * Static charts added in version 2 of the ML orchestration writeup. Server-rendered
 * SVG like ml-charts.tsx, which the version-1 snapshot uses and which stays as it is.
 */

const mono = "var(--font-mono)";
const body = "var(--font-body)";

interface TimelineEvent {
  /** offset from the first event, as printed */
  at: string;
  label: string;
  emphasis?: boolean;
  /** draw this row as a held interval rather than an instant */
  span?: boolean;
}

/** A vertical event list on a rail. Rows are evenly spaced: order, not scale. */
function EventRail({ events, title }: { events: TimelineEvent[]; title: string }) {
  const railX = 150;
  const rowH = 40;
  const top = 40;
  const height = top + events.length * rowH;
  return (
    <svg
      viewBox={`0 0 640 ${height}`}
      role="img"
      aria-label={title}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <text
        x={0}
        y={16}
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: "0.12em",
          fill: "var(--muted-foreground)",
        }}
      >
        {title.toUpperCase()}
      </text>
      <line
        x1={railX}
        x2={railX}
        y1={top + 6}
        y2={top + (events.length - 1) * rowH + 14}
        style={{ stroke: "var(--rule-warm)", strokeWidth: 1, opacity: 0.6 }}
      />
      {events.map((ev, i) => {
        const y = top + i * rowH;
        const color = ev.emphasis ? "var(--accent)" : "var(--rule-warm)";
        return (
          <g key={ev.label}>
            <text
              x={railX - 16}
              y={y + 14}
              textAnchor="end"
              style={{ fontFamily: mono, fontSize: 12, fill: "var(--muted-foreground)" }}
            >
              {ev.at}
            </text>
            {ev.span ? (
              <rect
                x={railX - 3}
                y={y - 6}
                width={6}
                height={rowH}
                rx={3}
                style={{ fill: color, opacity: 0.55 }}
              />
            ) : (
              <circle
                cx={railX}
                cy={y + 10}
                r={ev.emphasis ? 5 : 4}
                style={{ fill: color, stroke: "var(--surface)", strokeWidth: 2 }}
              />
            )}
            <text
              x={railX + 18}
              y={y + 15}
              style={{
                fontFamily: body,
                fontSize: 14,
                fill: ev.emphasis ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {ev.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* The preemption drill of early October: one low-priority cell, preempted and retried. */
export function PreemptionTimelineSvg() {
  return (
    <EventRail
      title="One preempted cell, from the preemptor's arrival"
      events={[
        { at: "0", label: "A training Job's Workload is created" },
        { at: "+58 ms", label: "The cell's run row closes as interrupted", emphasis: true },
        { at: "+72 ms", label: "The training Job reserves its quota" },
        { at: "+0.99 s", label: "The cell's process exits with 143" },
        { at: "+9 s", label: "Argo records the pod deleted and starts a retry" },
        { at: "to +2 min 36 s", label: "The retry's pod waits at Kueue's gate", span: true },
        { at: "+2 min 42 s", label: "The retry opens a row linked to the first", emphasis: true },
        { at: "+6 min 50 s", label: "The retry closes as succeeded" },
      ]}
    />
  );
}
