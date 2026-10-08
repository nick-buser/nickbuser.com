"use client";

import { useState } from "react";

/**
 * Interactive charts for the LLM cold-start series (content/experiments/llm-cold-start).
 * MDX here can't pass data as props, so each chart's numbers live below, keyed by
 * the `set` a page asks for. Every number comes from the series' measurement ledger.
 */

const mono = "var(--font-mono)";
const body = "var(--font-body)";
const STEP = "/experiments/llm-cold-start";

interface Bar {
  label: string;
  /** null draws no bar and prints `display` alone (a run that never finished, say). */
  value: number | null;
  display: string;
  emphasis?: boolean;
  href?: string;
}

interface View {
  label: string;
  bars: Bar[];
}

interface BarSet {
  title: string;
  views: View[];
  note?: string;
}

const BAR_SETS: Record<string, BarSet> = {
  trail: {
    title: "A cold caller's wait for the first token",
    views: [
      {
        label: "Seconds",
        bars: [
          { label: "First wake, before tuning", value: 151, display: "151 s", href: `${STEP}/01-make-the-model-wakeable` },
          { label: "Driver cache live, client obeys Retry-After", value: 150.3, display: "150.3 s", href: `${STEP}/10-measure-what-a-caller-waits` },
          { label: "Same, client retries every 5 s", value: 45.6, display: "45.6 s", href: `${STEP}/10-measure-what-a-caller-waits` },
          { label: "Gateway holds the request", value: 41.4, display: "41.4 s", href: `${STEP}/14-hold-the-cold-request` },
          { label: "Engine process forked", value: 36.5, display: "36.5 s", emphasis: true, href: `${STEP}/15-fork-the-engine-process` },
        ],
      },
    ],
    note: "Medians of three runs, except the first wake, which is one drill. Select a bar to open its step.",
  },
  cs1: {
    title: "Time to Ready on the twin, median of three",
    views: [
      {
        label: "Seconds",
        bars: [
          { label: "Baseline", value: 141, display: "141 s" },
          { label: "Pin the KV cache size", value: 131, display: "131 s", emphasis: true },
          { label: "Pin it and skip graph accounting", value: 130, display: "130 s" },
          { label: "Skip graph accounting only", value: null, display: "out of memory in 2 of 3 runs" },
        ],
      },
    ],
  },
  cs2: {
    title: "Fewer CUDA graphs, as first measured on the twin",
    views: [
      {
        label: "Time to Ready",
        bars: [
          { label: "All graphs (reference)", value: 130, display: "130 s" },
          { label: "Fewer capture sizes", value: 125, display: "120–130 s" },
          { label: "Piecewise graphs only", value: 90, display: "90 s" },
          { label: "Piecewise, fewer sizes", value: 80, display: "80 s", emphasis: true },
          { label: "No graphs", value: 81, display: "81 s", emphasis: true },
        ],
      },
      {
        label: "Batch-1 decode, as first measured",
        bars: [
          { label: "All graphs (reference)", value: 51.7, display: "51.7 tok/s" },
          { label: "Fewer capture sizes", value: 51.7, display: "51.7 tok/s" },
          { label: "Piecewise graphs only", value: 14.0, display: "14.0 tok/s", emphasis: true },
          { label: "Piecewise, fewer sizes", value: 14.1, display: "14.1 tok/s", emphasis: true },
          { label: "No graphs", value: 14.0, display: "14.0 tok/s", emphasis: true },
        ],
      },
    ],
  },
  cs2d: {
    title: "The same arms, judged two ways",
    views: [
      {
        label: "Time to Ready",
        bars: [
          { label: "All graphs", value: 130, display: "130 s" },
          { label: "Piecewise only", value: 90, display: "90 s" },
          { label: "Piecewise, fewer sizes", value: 80, display: "80 s", emphasis: true },
          { label: "No graphs", value: 81, display: "81 s", emphasis: true },
        ],
      },
      {
        label: "Wake to first full answer",
        bars: [
          { label: "All graphs", value: 135, display: "~135 s" },
          { label: "Piecewise only", value: 134, display: "~134 s" },
          { label: "Piecewise, fewer sizes", value: 125, display: "~125 s", emphasis: true },
          { label: "No graphs", value: 126, display: "~126 s", emphasis: true },
        ],
      },
      {
        label: "Steady batch-1 decode",
        bars: [
          { label: "All graphs", value: 51.8, display: "51.8 tok/s" },
          { label: "Piecewise only", value: 51.6, display: "51.6 tok/s" },
          { label: "Piecewise, fewer sizes", value: 51.6, display: "51.6 tok/s" },
          { label: "No graphs", value: 51.4, display: "51.4 tok/s" },
        ],
      },
    ],
    note: "Switch views: a 38% shorter start shrinks to a 7% shorter wait once the first answer is on the clock.",
  },
  cs2e: {
    title: "Kernel caches on the persistent volume, twin, runs 2–3",
    views: [
      {
        label: "Time to Ready",
        bars: [
          { label: "All graphs", value: 130, display: "130 s" },
          { label: "All graphs, caches kept", value: 130, display: "130–131 s", emphasis: true },
          { label: "No graphs", value: 81, display: "81 s" },
          { label: "No graphs, caches kept", value: 80, display: "80–81 s", emphasis: true },
        ],
      },
      {
        label: "First request",
        bars: [
          { label: "All graphs", value: 4.97, display: "4.97 s" },
          { label: "All graphs, caches kept", value: 4.97, display: "4.97 s", emphasis: true },
          { label: "No graphs", value: 44.7, display: "~44.7 s" },
          { label: "No graphs, caches kept", value: 44.7, display: "44.7–44.8 s", emphasis: true },
        ],
      },
    ],
  },
  cs2f: {
    title: "The CUDA driver's kernel cache kept on the volume, twin",
    views: [
      {
        label: "Time to Ready",
        bars: [
          { label: "All graphs", value: 130, display: "130 s" },
          { label: "All graphs, driver cache kept", value: 50.5, display: "50–51 s", emphasis: true },
          { label: "No graphs", value: 80, display: "80 s" },
          { label: "No graphs, driver cache kept", value: 40, display: "40 s", emphasis: true },
        ],
      },
      {
        label: "Wake to first full answer",
        bars: [
          { label: "All graphs", value: 135, display: "~135 s" },
          { label: "All graphs, driver cache kept", value: 56, display: "~56 s", emphasis: true },
          { label: "No graphs", value: 126, display: "~126 s" },
          { label: "No graphs, driver cache kept", value: 45, display: "~45 s", emphasis: true },
        ],
      },
    ],
  },
  cs10: {
    title: "The production pod, before and after",
    views: [
      {
        label: "Time to Ready",
        bars: [
          { label: "Before tuning", value: 145, display: "145 s" },
          { label: "First start after the change", value: 81, display: "81 s, once" },
          { label: "Every start after that", value: 40, display: "40 s", emphasis: true },
        ],
      },
    ],
    note: "The first start after the change fills the driver's cache, so it pays the old compile cost once.",
  },
  cs4: {
    title: "The 22 seconds before the engine starts",
    views: [
      {
        label: "Where it goes",
        bars: [
          { label: "API server imports", value: 13.75, display: "13.75 s", emphasis: true },
          { label: "Engine re-imports after spawn", value: 5.3, display: "5.3 s", emphasis: true },
          { label: "Interpreter start and config", value: 2.4, display: "~2.4 s" },
        ],
      },
      {
        label: "Pre-engine time by arm",
        bars: [
          { label: "Reference (spawn)", value: 21.8, display: "21.7–21.8 s" },
          { label: "LoRA support off", value: 21.6, display: "21.1–22.1 s" },
          { label: "Engine forked", value: 15.9, display: "15.5–16.2 s", emphasis: true },
        ],
      },
    ],
  },
  cs6: {
    title: "Sleep mode against a full cold start",
    views: [
      {
        label: "Back to serving",
        bars: [
          { label: "Off, cold start (prompt client)", value: 45.6, display: "45.6 s" },
          { label: "Level 2, page cache reclaimed", value: 16.9, display: "16.9 s" },
          { label: "Level 2, page cache warm", value: 2.0, display: "2.0 s", emphasis: true },
          { label: "Level 1", value: 0.8, display: "0.8 s", emphasis: true },
        ],
      },
      {
        label: "GPU memory used on the card",
        bars: [
          { label: "Awake", value: 15389, display: "15,389 MiB" },
          { label: "Level 1, asleep", value: 3589, display: "3,589 MiB", emphasis: true },
          { label: "Level 2, asleep", value: 3555, display: "3,555 MiB", emphasis: true },
        ],
      },
      {
        label: "Host memory parked",
        bars: [
          { label: "Level 1", value: 14.1, display: "14.1 GiB, still held after waking", emphasis: true },
          { label: "Level 2", value: 0, display: "none" },
        ],
      },
    ],
    note: "The resident models hold about 3.3 GB of the card in every case.",
  },
};

/** Horizontal bars with the value printed beside each. Several views switch in place. */
export function ColdStartBars({ set }: { set: string }) {
  const data = BAR_SETS[set];
  const [active, setActive] = useState(0);
  if (!data) return null;
  const view = data.views[active] ?? data.views[0];
  const max = Math.max(...view.bars.map((b) => b.value ?? 0)) || 1;

  const labelW = 230;
  const barW = 260;
  const rowH = 38;
  const top = 30;
  const height = top + view.bars.length * rowH + 4;

  return (
    <div className="nb-chart">
      {data.views.length > 1 ? (
        <div className="nb-chart__controls" role="group" aria-label="Choose a measure">
          {data.views.map((v, i) => (
            <button
              key={v.label}
              type="button"
              className="nb-chart__button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              {v.label}
            </button>
          ))}
        </div>
      ) : null}
      <svg
        viewBox={`0 0 640 ${height}`}
        role="img"
        aria-label={`${data.title}: ${view.label}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <text
          x={0}
          y={14}
          style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", fill: "var(--muted-foreground)" }}
        >
          {`${data.title} · ${view.label}`.toUpperCase()}
        </text>
        {view.bars.map((b, i) => {
          const y = top + i * rowH;
          const w = b.value === null ? 0 : Math.max(2, (b.value / max) * barW);
          const row = (
            <g key={b.label}>
              <text x={0} y={y + 18} style={{ fontFamily: body, fontSize: 13.5, fill: "var(--foreground)" }}>
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
                  transition: "width 300ms var(--ease-heat)",
                }}
              />
              <text
                x={labelW + w + (b.value === null ? 0 : 10)}
                y={y + 19}
                style={{ fontFamily: mono, fontSize: 12, fill: "var(--muted-foreground)" }}
              >
                {b.display}
              </text>
            </g>
          );
          return b.href ? (
            <a key={b.label} href={b.href} aria-label={`${b.label}: ${b.display}`}>
              {row}
            </a>
          ) : (
            row
          );
        })}
      </svg>
      {data.note ? <p className="nb-chart__note">{data.note}</p> : null}
    </div>
  );
}

interface Lane {
  key: string;
  label: string;
  /** seconds from the request to the pod reporting Ready */
  ready: number;
  /** seconds from the request to the first streamed token */
  first: number;
  /** when the caller was sent a 503, in seconds */
  rejects: number[];
  detail: string;
}

const LANES: Record<string, Lane> = {
  retry: {
    key: "retry",
    label: "Client obeys Retry-After: 150",
    ready: 41,
    first: 150.3,
    rejects: [0],
    detail:
      "One 503 that says to come back in 150 seconds, a value sized for the old start. The model is Ready at 41 s, and the client waits another 109 s because it did what it was told.",
  },
  poll: {
    key: "poll",
    label: "Client retries every 5 s",
    ready: 41,
    first: 45.6,
    rejects: [0, 5, 10, 15, 20, 25, 30, 35, 40],
    detail:
      "Nine 503s, then the first token at 45.6 s: Ready, plus up to one polling interval, plus the first token. Fast, but only for a client written to retry.",
  },
  hold: {
    key: "hold",
    label: "Gateway holds the request",
    ready: 40.5,
    first: 41.4,
    rejects: [],
    detail:
      "No 503 at all. The gateway keeps the request open, checks the model's health every second, and forwards it the moment the model is Ready. The caller sees one slow answer.",
  },
  fork: {
    key: "fork",
    label: "Held, engine forked",
    ready: 35.5,
    first: 36.5,
    rejects: [],
    detail:
      "The same hold, on a model that starts about five seconds sooner because its engine process no longer re-imports every library.",
  },
};

const LANE_SETS: Record<string, string[]> = {
  cs5: ["retry", "poll"],
  od3d: ["retry", "poll", "hold"],
  cs10b: ["hold", "fork"],
  all: ["retry", "poll", "hold", "fork"],
};

/** One cold request per lane, from send to first token, with the 503s it was sent. */
export function ColdRequestTimeline({ set = "all" }: { set?: string }) {
  const lanes = (LANE_SETS[set] ?? LANE_SETS.all).map((k) => LANES[k]);
  const [picked, setPicked] = useState(lanes[lanes.length - 1].key);
  const current = lanes.find((l) => l.key === picked) ?? lanes[0];

  const left = 190;
  const width = 430;
  const span = 160;
  const x = (s: number) => left + (s / span) * width;
  const laneH = 44;
  const top = 34;
  const axisY = top + lanes.length * laneH + 6;
  const height = axisY + 24;

  return (
    <div className="nb-chart">
      <div className="nb-chart__controls" role="group" aria-label="Choose a client">
        {lanes.map((l) => (
          <button
            key={l.key}
            type="button"
            className="nb-chart__button"
            aria-pressed={l.key === picked}
            onClick={() => setPicked(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <svg
        viewBox={`0 0 640 ${height}`}
        role="img"
        aria-label="A cold request's timeline for each client"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <text
          x={0}
          y={14}
          style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", fill: "var(--muted-foreground)" }}
        >
          FROM THE REQUEST TO THE FIRST TOKEN, SECONDS
        </text>
        {lanes.map((l, i) => {
          const y = top + i * laneH;
          const on = l.key === picked;
          return (
            <g
              key={l.key}
              onClick={() => setPicked(l.key)}
              style={{ cursor: "pointer", opacity: on ? 1 : 0.5, transition: "opacity 200ms var(--ease-heat)" }}
            >
              <text x={0} y={y + 20} style={{ fontFamily: body, fontSize: 13, fill: "var(--foreground)" }}>
                {l.label}
              </text>
              <rect
                x={left}
                y={y + 10}
                width={x(l.first) - left}
                height={14}
                rx={2}
                style={{ fill: on ? "var(--accent)" : "var(--rule-warm)", opacity: 0.35 }}
              />
              <line
                x1={x(l.ready)}
                x2={x(l.ready)}
                y1={y + 4}
                y2={y + 30}
                style={{ stroke: "var(--positive)", strokeWidth: 2 }}
              />
              {l.rejects.map((t) => (
                <line
                  key={t}
                  x1={x(t)}
                  x2={x(t)}
                  y1={y + 8}
                  y2={y + 26}
                  style={{ stroke: "var(--muted-foreground)", strokeWidth: 1.5 }}
                />
              ))}
              <circle cx={x(l.first)} cy={y + 17} r={5} style={{ fill: "var(--accent)" }} />
              <text
                x={Math.min(x(l.first) + 9, 600)}
                y={y + 21}
                style={{ fontFamily: mono, fontSize: 11.5, fill: "var(--muted-foreground)" }}
              >
                {`${l.first} s`}
              </text>
            </g>
          );
        })}
        <line x1={left} x2={left + width} y1={axisY} y2={axisY} style={{ stroke: "var(--border)" }} />
        {[0, 30, 60, 90, 120, 150].map((t) => (
          <text
            key={t}
            x={x(t)}
            y={axisY + 16}
            textAnchor="middle"
            style={{ fontFamily: mono, fontSize: 10.5, fill: "var(--muted-foreground)" }}
          >
            {t}
          </text>
        ))}
      </svg>
      <p className="nb-chart__note">
        <span style={{ color: "var(--positive)" }}>Green line</span>: the model reports Ready. Grey
        ticks: a 503 sent to the caller. Dot: the first token. {current.detail}
      </p>
    </div>
  );
}

interface Phase {
  label: string;
  seconds: number;
  color: string;
}

const ANATOMY: { label: string; total: string; phases: Phase[] }[] = [
  {
    label: "Before: the twin",
    total: "141 s",
    phases: [
      { label: "Python before the engine", seconds: 22.4, color: "var(--steel)" },
      { label: "Weights", seconds: 2.5, color: "var(--verdigris)" },
      { label: "Graph memory profiling", seconds: 52, color: "var(--accent)" },
      { label: "Graph capture", seconds: 52, color: "var(--brass)" },
      { label: "Rest of engine start", seconds: 3, color: "var(--rule-cool)" },
      { label: "API server and readiness", seconds: 9.1, color: "var(--muted-foreground)" },
    ],
  },
  {
    label: "After: production",
    total: "36 s",
    phases: [
      { label: "Python before the engine", seconds: 17, color: "var(--steel)" },
      { label: "Weights", seconds: 2.6, color: "var(--verdigris)" },
      { label: "Rest of engine start", seconds: 4.4, color: "var(--rule-cool)" },
      { label: "API server and readiness", seconds: 12.1, color: "var(--muted-foreground)" },
    ],
  },
];

/** Where a start's seconds go, before the series and after it. Hover or tap a segment. */
export function StartupAnatomy() {
  const [hover, setHover] = useState<string | null>(null);
  const left = 150;
  const width = 470;
  const span = 141;
  const rowH = 52;
  const top = 30;
  const height = top + ANATOMY.length * rowH + 6;
  const found = ANATOMY.flatMap((r) => r.phases.map((p) => ({ row: r.label, ...p }))).find(
    (p) => `${p.row}/${p.label}` === hover,
  );

  return (
    <div className="nb-chart">
      <svg
        viewBox={`0 0 640 ${height}`}
        role="img"
        aria-label="Startup phases before and after the series"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <text
          x={0}
          y={14}
          style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", fill: "var(--muted-foreground)" }}
        >
          FROM SCALE-UP TO READY, BY PHASE
        </text>
        {ANATOMY.map((r, i) => {
          const y = top + i * rowH;
          let cursor = left;
          return (
            <g key={r.label}>
              <text x={0} y={y + 18} style={{ fontFamily: body, fontSize: 13.5, fill: "var(--foreground)" }}>
                {r.label}
              </text>
              <text x={0} y={y + 34} style={{ fontFamily: mono, fontSize: 11, fill: "var(--muted-foreground)" }}>
                {r.total}
              </text>
              {r.phases.map((p) => {
                const w = (p.seconds / span) * width;
                const key = `${r.label}/${p.label}`;
                const seg = (
                  <rect
                    key={p.label}
                    x={cursor}
                    y={y + 6}
                    width={Math.max(w - 1, 1)}
                    height={26}
                    style={{
                      fill: p.color,
                      opacity: hover === null || hover === key ? 0.85 : 0.3,
                      cursor: "pointer",
                      transition: "opacity 150ms var(--ease-heat)",
                    }}
                    onMouseEnter={() => setHover(key)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setHover(key)}
                  >
                    <title>{`${p.label}: ${p.seconds} s`}</title>
                  </rect>
                );
                cursor += w;
                return seg;
              })}
            </g>
          );
        })}
      </svg>
      <p className="nb-chart__note">
        {found
          ? `${found.row}. ${found.label}: ${found.seconds} s.`
          : "Hover or tap a segment for its time."}{" "}
        The two rows come from different systems: the twin's readiness probe runs every 10 s and
        production's every 5 s, so only the engine phases compare directly.
      </p>
    </div>
  );
}
