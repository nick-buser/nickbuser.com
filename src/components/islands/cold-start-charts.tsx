"use client";

import { Fragment, useState, type CSSProperties } from "react";
import {
  GROUPS,
  PHASES,
  medianRun,
  segments,
  type Group,
  type Phase,
  type Run,
} from "@/components/islands/cold-start-data";

/**
 * Interactive charts for the LLM cold-start series (content/experiments/llm-cold-start).
 * MDX here can't pass data as props, so each chart's numbers live below, keyed by
 * the `set` a page asks for. Every number comes from the series' measurement ledger.
 *
 * The charts are HTML rows rather than a scaled SVG, so their text stays the size
 * of the text around them at any width. A bar's length is a share of its track
 * after `--reserve`, the room the longest value label needs, written in the
 * track's monospace `ch`. Below 34rem a chart stacks each label over its bar.
 */

const STEP = "/experiments/llm-cold-start";
const STEP_SLUGS: Record<number, string> = {
  2: "02-build-the-measurement-rig",
  3: "03-skip-the-memory-profiling-pass",
  4: "04-capture-fewer-cuda-graphs",
  5: "05-measure-decode-fairly",
  6: "06-persist-the-kernel-caches",
  7: "07-persist-the-driver-cache",
  11: "11-attribute-the-22-seconds",
};

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
    note: "Medians of three runs, except the first wake: one drill, with a client retrying every 10 s. Select a bar to open its step.",
  },
  "pin-kv": {
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
  "fewer-graphs": {
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
  "fair-decode": {
    title: "The same arms, judged two ways",
    views: [
      {
        label: "Time to Ready",
        bars: [
          { label: "All graphs", value: 130, display: "130 s" },
          { label: "Piecewise only", value: 90, display: "90–91 s" },
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
  "kernel-caches": {
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
  "driver-cache": {
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
  "production": {
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
  "imports": {
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
  "sleep": {
    title: "Sleep mode against a full cold start",
    views: [
      {
        label: "Back to serving",
        bars: [
          { label: "Off, cold start at the time", value: 45.6, display: "45.6 s" },
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
  adapter: {
    title: "When the fine-tuned adapter was ready, relative to the model",
    views: [
      {
        label: "Seconds after the model reported Ready",
        bars: [
          { label: "Before the fix", value: 21, display: "+21 s" },
          { label: "After the fix", value: 0.5, display: "about 1 s before Ready", emphasis: true },
        ],
      },
    ],
  },
  "cache-sizes": {
    title: "Each service's CUDA driver cache",
    views: [
      {
        label: "Size",
        bars: [
          { label: "The 7B (fp8, LoRA kernels)", value: 69000, display: "69 MB", emphasis: true },
          { label: "Embedding server", value: 6500, display: "6.5 MB", emphasis: true },
          { label: "Text-to-speech", value: 112, display: "112 KB" },
          { label: "Speech-to-text", value: 4, display: "4 KB" },
          { label: "Object detection", value: 0, display: "none" },
        ],
      },
    ],
    note: "Only the vLLM servers compile enough to matter, so only they keep the cache.",
  },
};

/** Room after the bars for the longest of `texts`, plus the gap before it. */
function reserve(texts: string[]) {
  return `calc(${Math.max(0, ...texts.map((t) => t.length))}ch + 10px)`;
}

/** A length along a track: the share `f` of the room left after the reserve. */
function along(f: number) {
  return `calc((100% - var(--reserve)) * ${Math.max(0, f).toFixed(4)})`;
}

function vars(v: Record<string, string>) {
  return v as CSSProperties;
}

function Axis({ span, step = 30, unit = "s" }: { span: number; step?: number; unit?: string }) {
  const ticks: number[] = [];
  for (let t = 0; t <= span; t += step) ticks.push(t);
  return (
    <>
      <span className="nb-rows__spacer" aria-hidden />
      <div className="nb-axis" aria-hidden>
        {ticks.map((t) => (
          <span key={t} style={{ left: along(t / span) }}>
            {t === 0 ? `0 ${unit}` : t}
          </span>
        ))}
      </div>
    </>
  );
}

function Views({
  labels,
  active,
  onPick,
  name,
}: {
  labels: string[];
  active: number;
  onPick: (i: number) => void;
  name: string;
}) {
  if (labels.length < 2) return null;
  return (
    <div className="nb-chart__controls" role="group" aria-label={name}>
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          className="nb-chart__button"
          aria-pressed={i === active}
          onClick={() => onPick(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Horizontal bars with the value printed beside each. Several views switch in place. */
export function ColdStartBars({ set }: { set: string }) {
  const data = BAR_SETS[set];
  const [active, setActive] = useState(0);
  if (!data) return null;
  const view = data.views[active] ?? data.views[0];
  const max = Math.max(...view.bars.map((b) => b.value ?? 0)) || 1;
  const drawn = view.bars.filter((b) => b.value !== null).map((b) => b.display);

  return (
    <div className="nb-chart">
      <p className="nb-chart__title">{`${data.title} · ${view.label}`}</p>
      <Views
        labels={data.views.map((v) => v.label)}
        active={active}
        onPick={setActive}
        name="Choose a measure"
      />
      <div className="nb-rows" style={vars({ "--reserve": reserve(drawn) })}>
        {view.bars.map((b) => {
          const contents = (
            <>
              {b.value !== null ? (
                <span
                  className={b.emphasis ? "nb-bar nb-bar--em" : "nb-bar"}
                  style={{ width: along(b.value / max) }}
                />
              ) : null}
              <span className="nb-rows__value">{b.display}</span>
            </>
          );
          return (
            <Fragment key={b.label}>
              <div className={b.emphasis ? "nb-rows__label nb-rows__label--em" : "nb-rows__label"}>
                {b.href ? <a href={b.href}>{b.label}</a> : b.label}
              </div>
              {b.href ? (
                <a className="nb-rows__track" href={b.href} tabIndex={-1} aria-hidden>
                  {contents}
                </a>
              ) : (
                <div className="nb-rows__track">{contents}</div>
              )}
            </Fragment>
          );
        })}
      </div>
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
    ready: 40,
    first: 41.4,
    rejects: [],
    detail:
      "No 503 at all. The gateway keeps the request open, checks the model's health every second, and forwards it the moment the model is Ready. The caller sees one slow answer.",
  },
  fork: {
    key: "fork",
    label: "Held, engine forked",
    ready: 35,
    first: 36.5,
    rejects: [],
    detail:
      "The same hold, on a model that starts about five seconds sooner because its engine process no longer re-imports every library.",
  },
};

const LANE_SETS: Record<string, string[]> = {
  "caller": ["retry", "poll"],
  "hold": ["retry", "poll", "hold"],
  "fork": ["hold", "fork"],
  all: ["retry", "poll", "hold", "fork"],
};

const LANE_SPAN = 160;

/** One cold request per lane, from send to first token, with the 503s it was sent. */
export function ColdRequestTimeline({ set = "all" }: { set?: string }) {
  const lanes = (LANE_SETS[set] ?? LANE_SETS.all).map((k) => LANES[k]);
  const [picked, setPicked] = useState(lanes[lanes.length - 1].key);
  const current = lanes.find((l) => l.key === picked) ?? lanes[0];

  return (
    <div className="nb-chart">
      <p className="nb-chart__title">From the request to the first token, seconds</p>
      <Views
        labels={lanes.map((l) => l.label)}
        active={lanes.indexOf(current)}
        onPick={(i) => setPicked(lanes[i].key)}
        name="Choose a client"
      />
      <div className="nb-rows" style={vars({ "--reserve": reserve(lanes.map((l) => `${l.first} s`)) })}>
        {lanes.map((l) => {
          const on = l.key === current.key;
          const at = (s: number) => along(s / LANE_SPAN);
          return (
            <Fragment key={l.key}>
              <div
                className={on ? "nb-rows__label nb-rows__label--em" : "nb-rows__label is-dim"}
                onClick={() => setPicked(l.key)}
              >
                {l.label}
              </div>
              <div className={on ? "nb-lane is-on" : "nb-lane is-dim"} onClick={() => setPicked(l.key)}>
                <span className="nb-lane__wait" style={{ width: at(l.first) }} />
                {l.rejects.map((t) => (
                  <span key={t} className="nb-lane__reject" style={{ left: at(t) }} />
                ))}
                <span className="nb-lane__ready" style={{ left: at(l.ready) }} />
                <span className="nb-lane__first" style={{ left: at(l.first) }} />
                <span className="nb-lane__value" style={{ left: `calc(${at(l.first)} + 10px)` }}>
                  {`${l.first} s`}
                </span>
              </div>
            </Fragment>
          );
        })}
        <Axis span={LANE_SPAN} />
      </div>
      <p className="nb-chart__note">
        <span className="nb-key nb-key--ready" aria-hidden /> the model reports Ready.{" "}
        <span className="nb-key nb-key--reject" aria-hidden /> a 503 sent to the caller.{" "}
        <span className="nb-key nb-key--first" aria-hidden /> the first token. {current.detail}
      </p>
    </div>
  );
}

function Legend({ phases }: { phases: Phase[] }) {
  return (
    <div className="nb-legend" aria-hidden>
      {phases.map((p) => (
        <span key={p.key} className="nb-legend__item">
          <span className="nb-legend__swatch" style={p.css} />
          {p.label}
        </span>
      ))}
    </div>
  );
}

const phase = (key: Phase["key"]) => PHASES.find((p) => p.key === key)!;

const ANATOMY: { label: string; total: string; phases: { key: Phase["key"]; seconds: number }[] }[] = [
  {
    label: "Before: the twin",
    total: "141 s",
    phases: [
      { key: "pre", seconds: 22.4 },
      { key: "w", seconds: 2.5 },
      { key: "prof", seconds: 52 },
      { key: "cap", seconds: 52 },
      { key: "rest", seconds: 3 },
      { key: "api", seconds: 9.1 },
    ],
  },
  {
    label: "After: production",
    total: "36 s",
    phases: [
      { key: "pre", seconds: 17 },
      { key: "w", seconds: 2.6 },
      { key: "rest", seconds: 4.4 },
      { key: "api", seconds: 12.1 },
    ],
  },
];

/** Where a start's seconds go, before the series and after it. Hover or tap a segment. */
export function StartupAnatomy() {
  const [hover, setHover] = useState<string | null>(null);
  const span = 141;
  const used = PHASES.filter((p) => ANATOMY.some((r) => r.phases.some((x) => x.key === p.key)));
  const found = ANATOMY.flatMap((r) => r.phases.map((x) => ({ row: r.label, ...x }))).find(
    (x) => `${x.row}/${x.key}` === hover,
  );

  return (
    <div className="nb-chart">
      <p className="nb-chart__title">From scale-up to Ready, by phase</p>
      <div className="nb-rows" style={vars({ "--reserve": "0px" })}>
        {ANATOMY.map((r) => (
          <Fragment key={r.label}>
            <div className="nb-rows__label">
              {r.label} <span className="nb-rows__aside">{r.total}</span>
            </div>
            <div className="nb-rows__track nb-stack nb-stack--tall">
              {r.phases.map((x) => {
                const key = `${r.label}/${x.key}`;
                const p = phase(x.key);
                return (
                  <span
                    key={x.key}
                    className={hover && hover !== key ? "nb-seg is-dim" : "nb-seg"}
                    style={{ ...p.css, width: along(x.seconds / span) }}
                    title={`${p.label}: ${x.seconds} s`}
                    onMouseEnter={() => setHover(key)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setHover(key)}
                  />
                );
              })}
            </div>
          </Fragment>
        ))}
      </div>
      <Legend phases={used} />
      <p className="nb-chart__note">
        {found ? `${found.row}. ${phase(found.key).label}: ${found.seconds} s. ` : "Hover or tap a segment for its time. "}
        The two rows come from different systems: the twin&apos;s readiness probe runs every 10 s and
        production&apos;s every 5 s, so only the engine phases compare directly.
      </p>
    </div>
  );
}

type Row = { key: string; label: string; run: Run | null; note?: string };

/** The rows a group shows: each arm's median run, or every run with its fills and failures. */
function rowsOf(g: Group, every: boolean): Row[] {
  const rows: Row[] = [];
  for (const a of g.arms) {
    if (every) {
      for (const x of a.runs) {
        rows.push({
          key: `${g.step}/${a.label}/${x.run}`,
          label: `${a.label} · run ${x.run}`,
          run: x.failed ? null : x,
          note: x.failed ?? (x.fill ? "cache fill" : undefined),
        });
      }
    } else {
      const m = medianRun(a);
      const failed = a.runs.filter((x) => x.failed).length;
      rows.push({
        key: `${g.step}/${a.label}`,
        label: a.label,
        run: m,
        note: m ? (failed ? `${failed} of ${a.runs.length} failed` : undefined) : "no clean run",
      });
    }
  }
  return rows;
}

function totalOf(run: Run, withFirst: boolean) {
  return run.total + (withFirst && run.first !== undefined ? run.first : 0);
}

function valueText(row: Row, withFirst: boolean) {
  if (!row.run) return row.note ?? "";
  return `${Math.round(totalOf(row.run, withFirst))} s${row.note ? ` · ${row.note}` : ""}`;
}

/**
 * Every measured start of the twin, as a stacked bar of its phases, grouped by
 * the step that ran it. `groups` limits it to some steps ("3" or "2,3"); `first`
 * starts with the first answer added on top of Ready.
 */
export function StartupExplorer({ groups, first = "off" }: { groups?: string; first?: "on" | "off" }) {
  const wanted = groups ? groups.split(",").map((g) => Number(g.trim())) : null;
  const shown = GROUPS.filter((g) => !wanted || wanted.includes(g.step));
  const [every, setEvery] = useState(false);
  const [withFirst, setWithFirst] = useState(first === "on");
  const [hover, setHover] = useState<string | null>(null);
  const anyFirst = shown.some((g) => g.arms.some((a) => a.runs.some((x) => x.first !== undefined)));

  // One scale and one reserve for every combination of the toggles, so flipping
  // one never rescales the bars underneath it.
  const all = shown.flatMap((g) => g.arms.flatMap((a) => a.runs)).filter((x) => !x.failed);
  const span = Math.ceil(Math.max(...all.map((x) => totalOf(x, true))) / 30) * 30;
  const texts = [false, true].flatMap((e) =>
    [false, true].flatMap((f) =>
      shown.flatMap((g) => rowsOf(g, e).filter((r) => r.run).map((r) => valueText(r, f))),
    ),
  );

  const found = hover ? hover.split("|") : null;
  const phases = PHASES.filter((p) => p.key !== "first" || withFirst);

  return (
    <div className="nb-chart">
      <div className="nb-chart__controls" role="group" aria-label="Chart options">
        <button type="button" className="nb-chart__button" aria-pressed={!every} onClick={() => setEvery(false)}>
          Median run
        </button>
        <button type="button" className="nb-chart__button" aria-pressed={every} onClick={() => setEvery(true)}>
          Every run
        </button>
        {anyFirst ? (
          <button
            type="button"
            className="nb-chart__button"
            aria-pressed={withFirst}
            onClick={() => setWithFirst((v) => !v)}
          >
            + First answer
          </button>
        ) : null}
      </div>
      <div
        className="nb-rows nb-rows--dense"
        style={vars({ "--reserve": reserve(texts), "--tick": `${((30 / span) * 100).toFixed(4)}%` })}
      >
        {shown.map((g) => (
          <Fragment key={g.step}>
            <a className="nb-rows__group" href={`${STEP}/${STEP_SLUGS[g.step]}`}>
              {`Step ${String(g.step).padStart(2, "0")} · ${g.title}`}
            </a>
            {rowsOf(g, every).map((row) => {
              const segs = row.run ? segments(row.run, withFirst) : null;
              return (
                <Fragment key={row.key}>
                  <div className="nb-rows__label">{row.label}</div>
                  <div className="nb-rows__track nb-stack">
                    {segs
                      ? phases.map((p) => {
                          const v = segs[p.key];
                          if (v <= 0) return null;
                          const id = `${row.label}|${p.label}|${v.toFixed(1)}`;
                          const lit = !hover || hover.startsWith(`${row.label}|${p.label}|`);
                          return (
                            <span
                              key={p.key}
                              className={lit ? "nb-seg" : "nb-seg is-dim"}
                              style={{ ...p.css, width: along(v / span) }}
                              title={`${p.label}: ${v.toFixed(1)} s`}
                              onMouseEnter={() => setHover(id)}
                              onMouseLeave={() => setHover(null)}
                              onClick={() => setHover(id)}
                            />
                          );
                        })
                      : null}
                    <span className={row.run ? "nb-rows__value" : "nb-rows__value nb-rows__value--alone"}>
                      {valueText(row, withFirst)}
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </Fragment>
        ))}
        <Axis span={span} />
      </div>
      <Legend phases={phases} />
      <p className="nb-chart__note">
        {found ? `${found[0]}. ${found[1]}: ${found[2]} s. ` : "Hover or tap a segment for its time. "}
        The twin&apos;s readiness probe runs every 10 s, so totals land on 10-second steps and the last
        segment absorbs the wait.
      </p>
    </div>
  );
}
