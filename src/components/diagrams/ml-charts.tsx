/**
 * Static measurement charts for the ML orchestration writeup. Server-rendered
 * SVG like homelab-svgs.tsx: no client JS, styled through the `style` prop so
 * Athanor tokens resolve. Each chart plots one phase's own numbers, never a
 * mix of phases measured in different regimes.
 */

const mono = "var(--font-mono)";
const body = "var(--font-body)";

interface Bar {
  label: string;
  value: number;
  /** the number as printed beside the bar */
  display: string;
  emphasis?: boolean;
}

/** Horizontal bars with the value printed at the end of each — no axis to read. */
function BarRows({ bars, max, title }: { bars: Bar[]; max: number; title: string }) {
  const labelW = 190;
  const barW = 330;
  const rowH = 38;
  const top = 34;
  const height = top + bars.length * rowH + 8;
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
      {bars.map((b, i) => {
        const y = top + i * rowH;
        const w = Math.max(2, (b.value / max) * barW);
        return (
          <g key={b.label}>
            <text
              x={0}
              y={y + 18}
              style={{ fontFamily: body, fontSize: 14, fill: "var(--foreground)" }}
            >
              {b.label}
            </text>
            <rect
              x={labelW}
              y={y + 5}
              width={w}
              height={18}
              rx={2}
              style={{
                fill: b.emphasis ? "var(--accent)" : "var(--rule-warm)",
                opacity: b.emphasis ? 0.9 : 0.55,
              }}
            />
            <text
              x={labelW + w + 10}
              y={y + 19}
              style={{ fontFamily: mono, fontSize: 12, fill: "var(--muted-foreground)" }}
            >
              {b.display}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Phase 19 — where one step's time went on the fast rank (two GPUs, gigabit LAN). */
export function StepTimeSvg() {
  return (
    <BarRows
      title="Fast rank, one training step"
      max={100}
      bars={[
        { label: "Waiting on the slow card", value: 89.4, display: "89.4%", emphasis: true },
        { label: "Useful compute", value: 7.3, display: "7.3%" },
        { label: "Network", value: 3.4, display: "3.4%" },
      ]}
    />
  );
}

/* Phase 22 — speedup over the fp32, no-overlap baseline, all in the same regime. */
export function OverlapSpeedupSvg() {
  return (
    <BarRows
      title="Step speedup over the fp32 baseline"
      max={1.8}
      bars={[
        { label: "Baseline", value: 1, display: "1.00×" },
        { label: "Overlap alone", value: 1.19, display: "1.19×" },
        { label: "fp16 gradients alone", value: 1.21, display: "1.21×" },
        { label: "Both together", value: 1.63, display: "1.63×", emphasis: true },
      ]}
    />
  );
}
