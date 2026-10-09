/**
 * Every measured start of the 7B's twin, from the cold-start series' ledger.
 * Seconds throughout. `ei` is the engine's whole initialisation, which contains
 * weights, compile, graph profiling and graph capture. `first` is the first
 * 256-token request after Ready, where it was measured. A run that filled a
 * cache is marked `fill`; one that never became Ready is marked `failed`.
 */

import type { CSSProperties } from "react";

export interface Run {
  run: number;
  pre: number;
  w: number;
  comp: number;
  prof: number;
  cap: number;
  ei: number;
  total: number;
  first?: number;
  fill?: boolean;
  failed?: string;
}

export interface Arm {
  label: string;
  runs: Run[];
}

export interface Group {
  step: number;
  title: string;
  arms: Arm[];
}

const r = (
  run: number,
  pre: number,
  w: number,
  comp: number,
  prof: number,
  cap: number,
  ei: number,
  total: number,
  extra: Partial<Run> = {},
): Run => ({ run, pre, w, comp, prof, cap, ei, total, ...extra });

export const GROUPS: Group[] = [
  {
    step: 2,
    title: "Baseline",
    arms: [
      {
        label: "Production config",
        runs: [r(1, 22.23, 3.95, 0.64, 54, 52, 111.9, 151), r(2, 22.38, 2.48, 0.59, 52, 52, 109.54, 141), r(3, 20.45, 2.67, 0.63, 53, 52, 110.31, 140)],
      },
    ],
  },
  {
    step: 3,
    title: "Skip the memory-profiling pass",
    arms: [
      {
        label: "Skip graph accounting",
        runs: [
          r(1, 20.91, 2.83, 22.2, 56, 52, 139.46, 170, { fill: true }),
          { run: 2, pre: 0, w: 0, comp: 0, prof: 0, cap: 0, ei: 0, total: 0, failed: "out of GPU memory" },
          { run: 3, pre: 0, w: 0, comp: 0, prof: 0, cap: 0, ei: 0, total: 0, failed: "out of GPU memory" },
        ],
      },
      {
        label: "Pin the KV cache",
        runs: [r(1, 21.96, 1.71, 0.59, 0, 53, 99.59, 131), r(2, 22.34, 3.64, 0.58, 0, 52, 99.52, 141), r(3, 22.02, 2.93, 0.56, 0, 52, 99.24, 131)],
      },
      {
        label: "Both",
        runs: [r(1, 21.3, 2.59, 0.55, 0, 52, 99.71, 130), r(2, 22.21, 2.04, 0.57, 0, 53, 99.78, 130), r(3, 20.98, 3.34, 0.56, 0, 51, 98.43, 130)],
      },
    ],
  },
  {
    step: 4,
    title: "Fewer CUDA graphs",
    arms: [
      {
        label: "All graphs",
        runs: [r(1, 21.33, 2.13, 0.64, 0, 52, 99.72, 130), r(2, 22.22, 2.52, 0.56, 0, 52, 99.46, 130), r(3, 21.88, 2.79, 0.57, 0, 52, 99.02, 131)],
      },
      {
        label: "Fewer capture sizes",
        runs: [r(1, 20.79, 2.79, 22.26, 0, 44, 115.62, 151, { fill: true }), r(2, 22.21, 2.85, 0.6, 0, 41, 88.08, 120), r(3, 22.17, 2.0, 0.53, 0, 44, 93.69, 130)],
      },
      {
        label: "Piecewise only",
        runs: [
          { run: 1, pre: 0, w: 0, comp: 0, prof: 0, cap: 0, ei: 0, total: 0, failed: "exited with an error" },
          r(2, 21.34, 2.7, 0.55, 0, 9, 55.98, 90),
          r(3, 21.89, 2.93, 0.56, 0, 9, 56.56, 91),
        ],
      },
      {
        label: "Piecewise, fewer sizes",
        runs: [r(1, 21.35, 2.4, 21.78, 0, 4, 73.86, 110, { fill: true }), r(2, 21.67, 2.23, 0.58, 0, 1, 48.2, 80), r(3, 20.84, 2.13, 0.55, 0, 1, 47.98, 81)],
      },
      {
        label: "No graphs",
        runs: [r(1, 21.82, 2.63, 0, 0, 0, 49.02, 81), r(2, 21.72, 1.92, 0, 0, 0, 48.47, 81), r(3, 22.15, 2.74, 0, 0, 0, 48.96, 80)],
      },
    ],
  },
  {
    step: 5,
    title: "Measured with the first answer",
    arms: [
      {
        label: "All graphs",
        runs: [r(1, 22.09, 2.06, 0.62, 0, 52, 99.1, 130, { first: 4.97 }), r(2, 20.96, 2.76, 0.55, 0, 53, 99.54, 130, { first: 4.97 })],
      },
      {
        label: "Piecewise only",
        runs: [r(1, 22.65, 2.4, 0.57, 0, 9, 57.09, 91, { first: 44.36 }), r(2, 22.09, 3.1, 0.57, 0, 9, 56.45, 90, { first: 44.37 })],
      },
      {
        label: "Piecewise, fewer sizes",
        runs: [r(1, 20.69, 2.32, 0.56, 0, 1, 48.03, 80, { first: 44.3 }), r(2, 21.55, 2.5, 0.56, 0, 1, 48.02, 80, { first: 44.76 })],
      },
      {
        label: "No graphs",
        runs: [r(1, 21.08, 1.98, 0, 0, 0, 48.71, 81, { first: 44.89 }), r(2, 21.94, 2.21, 0, 0, 0, 48.49, 81, { first: 44.48 })],
      },
    ],
  },
  {
    step: 6,
    title: "Framework kernel caches kept",
    arms: [
      {
        label: "All graphs, caches kept",
        runs: [
          r(1, 22.31, 1.92, 0.56, 0, 55, 105.64, 140, { first: 4.97, fill: true }),
          r(2, 21.33, 2.71, 0.26, 0, 53, 99.44, 131, { first: 4.97 }),
          r(3, 21.97, 2.99, 0.25, 0, 52, 99.32, 130, { first: 4.97 }),
        ],
      },
      {
        label: "No graphs, caches kept",
        runs: [
          r(1, 21.24, 2.11, 0, 0, 0, 47.07, 80, { first: 44.48, fill: true }),
          r(2, 21.4, 2.37, 0, 0, 0, 46.26, 80, { first: 44.81 }),
          r(3, 21.75, 2.84, 0, 0, 0, 46.56, 81, { first: 44.66 }),
        ],
      },
    ],
  },
  {
    step: 7,
    title: "Driver kernel cache kept",
    arms: [
      {
        label: "All graphs, driver cache",
        runs: [
          r(1, 21.49, 2.91, 0.58, 0, 12, 17.26, 50, { first: 4.97 }),
          r(2, 21.32, 2.24, 0.54, 0, 13, 17.96, 51, { first: 4.97 }),
          r(3, 21.91, 2.53, 0.57, 0, 13, 17.46, 51, { first: 4.97 }),
        ],
      },
      {
        label: "No graphs, driver cache",
        runs: [
          r(1, 21.71, 2.05, 0, 0, 0, 50.65, 80, { first: 45.1, fill: true }),
          r(2, 21.84, 2.98, 0, 0, 0, 6.74, 40, { first: 5.1 }),
          r(3, 21.71, 1.63, 0, 0, 0, 7.07, 40, { first: 5.09 }),
        ],
      },
      {
        label: "All graphs, autotune off",
        runs: [
          r(1, 21.45, 2.55, 0.59, 0, 52, 98.23, 130, { first: 4.97 }),
          r(2, 21.44, 2.2, 0.55, 0, 52, 98.93, 130, { first: 4.97 }),
          r(3, 21.84, 2.32, 0.58, 0, 54, 100.84, 131, { first: 4.97 }),
        ],
      },
      {
        label: "No graphs, autotune off",
        runs: [r(1, 21.82, 1.84, 0, 0, 0, 49.25, 81), r(2, 21.98, 2.53, 0, 0, 0, 48.89, 80), r(3, 21.95, 3.11, 0, 0, 0, 48.87, 80)],
      },
    ],
  },
  {
    step: 11,
    title: "Before the engine starts",
    arms: [
      {
        label: "LoRA support off",
        runs: [r(1, 21.07, 1.82, 0, 0, 0, 6.13, 41, { first: 5.05 }), r(2, 22.05, 2.65, 0, 0, 0, 5.74, 40, { first: 5.06 })],
      },
      {
        label: "Engine forked",
        runs: [
          r(1, 16.23, 2.22, 0, 0, 0, 6.73, 41, { first: 5.15 }),
          r(2, 15.45, 1.96, 0, 0, 0, 6.62, 30, { first: 5.12 }),
          r(3, 16.0, 1.62, 0, 0, 0, 6.71, 30, { first: 5.09 }),
        ],
      },
    ],
  },
];

export interface Phase {
  key: "pre" | "w" | "comp" | "prof" | "cap" | "rest" | "api" | "first";
  label: string;
  /** how a segment and its legend swatch are drawn */
  css: CSSProperties;
}

/* A segment's right edge is cut by an inset shadow in the frame's colour; a
   phase that sets its own box-shadow has to repeat that cut. */
const CUT = "inset -1px 0 0 var(--background)";

/* The two CUDA-graph phases share brass (profiling hatched, capture solid), so
   the 104 graph seconds read as one family, and "rest of engine start" keeps
   the accent: it's the 44 seconds that sat in every arm until step 7. */
export const PHASES: Phase[] = [
  { key: "pre", label: "Python before the engine", css: { background: "var(--steel)" } },
  { key: "w", label: "Weights", css: { background: "var(--verdigris)" } },
  { key: "comp", label: "Compile", css: { background: "color-mix(in oklch, var(--verdigris) 45%, var(--brass))" } },
  {
    key: "prof",
    label: "Graph memory profiling",
    css: {
      background:
        "repeating-linear-gradient(135deg, var(--brass) 0 2px, color-mix(in oklch, var(--brass) 25%, transparent) 2px 5px)",
    },
  },
  { key: "cap", label: "Graph capture", css: { background: "var(--brass)" } },
  { key: "rest", label: "Rest of engine start", css: { background: "var(--accent)" } },
  {
    key: "api",
    label: "API server and readiness",
    css: {
      background: "color-mix(in oklch, var(--muted-foreground) 14%, transparent)",
      boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--muted-foreground) 75%, transparent), ${CUT}`,
    },
  },
  {
    key: "first",
    label: "First answer",
    css: {
      background:
        "repeating-linear-gradient(90deg, color-mix(in oklch, var(--foreground) 60%, transparent) 0 2px, transparent 2px 4px)",
    },
  },
];

/** A run's seconds split into the drawn phases. Engine time not named elsewhere is "rest". */
export function segments(run: Run, withFirst: boolean): Record<Phase["key"], number> {
  const rest = Math.max(0, run.ei - run.w - run.comp - run.prof - run.cap);
  const api = Math.max(0, run.total - run.pre - run.ei);
  return {
    pre: run.pre,
    w: run.w,
    comp: run.comp,
    prof: run.prof,
    cap: run.cap,
    rest,
    api,
    first: withFirst && run.first !== undefined ? run.first : 0,
  };
}

/** The run a median view shows: the middle total among runs that neither filled a cache nor failed. */
export function medianRun(arm: Arm): Run | null {
  const warm = arm.runs.filter((x) => !x.fill && !x.failed).sort((a, b) => a.total - b.total);
  if (warm.length === 0) return null;
  return warm[Math.floor((warm.length - 1) / 2)];
}
