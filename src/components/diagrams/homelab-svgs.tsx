/**
 * Bespoke static SVG figures for the homelab case study. No client JS — these
 * render to plain SVG on the server, so they cost nothing on a reading page.
 * Styled with the `style` prop (CSS) so Athanor tokens resolve; presentation
 * attributes can't read CSS variables.
 *
 * Used inside <Figure> in content/work/the-homelab.mdx (frame on).
 */

const mono = "var(--font-mono)";
const body = "var(--font-body)";

const tone = {
  warm: "var(--rule-warm)",
  cool: "var(--rule-cool)",
  sacred: "var(--accent)",
  quiet: "var(--border)",
} as const;

type Tone = keyof typeof tone;

/** A labeled instrument box — the SVG analogue of an AthanorNode. */
function Box({
  x,
  y,
  w = 132,
  h = 48,
  kind,
  label,
  t = "quiet",
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: string;
  label: string;
  t?: Tone;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        style={{ fill: "var(--surface)", stroke: tone[t], strokeWidth: 1 }}
      />
      {kind ? (
        <text
          x={x + 12}
          y={y + 18}
          style={{
            fontFamily: mono,
            fontSize: 8.5,
            letterSpacing: "0.12em",
            fill:
              t === "quiet"
                ? "var(--muted-foreground)"
                : t === "cool"
                  ? "var(--steel)"
                  : t === "sacred"
                    ? "var(--accent)"
                    : "var(--brass)",
          }}
        >
          {kind.toUpperCase()}
        </text>
      ) : null}
      <text
        x={x + 12}
        y={kind ? y + 35 : y + h / 2 + 5}
        style={{
          fontFamily: body,
          fontSize: 13,
          fontWeight: 500,
          fill: "var(--foreground)",
        }}
      >
        {label}
      </text>
    </g>
  );
}

function EdgeLabel({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      style={{
        fontFamily: mono,
        fontSize: 9.5,
        letterSpacing: "0.04em",
        fill: "var(--muted-foreground)",
      }}
    >
      {children}
    </text>
  );
}

function Defs() {
  return (
    <defs>
      <marker
        id="nb-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" style={{ fill: "#79828b" }} />
      </marker>
    </defs>
  );
}

const line = (animated = false) => ({
  stroke: animated ? "var(--brass)" : "var(--rule-cool)",
  strokeWidth: 1.5,
  markerEnd: "url(#nb-arrow)",
  fill: "none" as const,
});

/* ── The transactional outbox: one commit, no dual write ── */
export function OutboxTxnSvg() {
  return (
    <svg
      role="img"
      aria-label="A single database transaction containing both the business write and the outbox insert, committing once to the write-ahead log."
      viewBox="0 0 600 210"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <Defs />
      {/* transaction boundary */}
      <rect
        x={20}
        y={26}
        width={250}
        height={158}
        rx={6}
        style={{
          fill: "transparent",
          stroke: tone.warm,
          strokeWidth: 1.5,
          strokeDasharray: "5 4",
        }}
      />
      <text
        x={34}
        y={18}
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: "0.12em",
          fill: "var(--brass)",
        }}
      >
        ONE TRANSACTION
      </text>
      <Box x={40} y={44} w={210} kind="domain write" label="orders" t="cool" />
      <text
        x={145}
        y={112}
        textAnchor="middle"
        style={{ fontFamily: mono, fontSize: 14, fill: "var(--muted-foreground)" }}
      >
        +
      </text>
      <Box
        x={40}
        y={120}
        w={210}
        kind="event"
        label="outbox INSERT"
        t="warm"
      />

      {/* commit → WAL */}
      <path d={`M270,105 L330,105`} style={line()} />
      <EdgeLabel x={300} y={97}>
        commit
      </EdgeLabel>
      <Box x={332} y={64} w={120} h={82} kind="postgres" label="WAL" t="warm" />
      <path d={`M452,105 L520,105`} style={line(true)} />
      <EdgeLabel x={486} y={97}>
        Debezium
      </EdgeLabel>
      <text
        x={560}
        y={101}
        textAnchor="middle"
        style={{ fontFamily: mono, fontSize: 10, fill: "var(--muted-foreground)" }}
      >
        one
      </text>
      <text
        x={560}
        y={114}
        textAnchor="middle"
        style={{ fontFamily: mono, fontSize: 10, fill: "var(--muted-foreground)" }}
      >
        log
      </text>
    </svg>
  );
}

/* ── One MQTT broker, three sinks ── */
export function DeviceSinksSvg() {
  return (
    <svg
      role="img"
      aria-label="ESP32 devices publish to one MQTT broker, which fans out to three sinks: Telegraf to SigNoz for metrics, a fleet-consumer to Postgres for durable state, and from Postgres through the outbox to Redpanda as the event log."
      viewBox="0 0 640 290"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <Defs />
      <Box x={16} y={120} w={120} kind="device" label="ESP32 fleet" t="cool" />
      <path d={`M136,144 L176,144`} style={line()} />
      <Box x={178} y={120} w={120} kind="broker" label="mosquitto" t="warm" />

      {/* lane 1 — metrics */}
      <path d={`M298,138 C330,138 330,52 360,52`} style={line(true)} />
      <Box x={362} y={28} w={120} kind="telegraf" label="OTLP bridge" t="cool" />
      <path d={`M482,52 L512,52`} style={line(true)} />
      <Box x={514} y={28} w={112} kind="signoz" label="SigNoz" t="warm" />
      <EdgeLabel x={540} y={92}>
        metrics · ephemeral
      </EdgeLabel>

      {/* lane 2 — durable state */}
      <path d={`M298,144 L360,144`} style={line()} />
      <Box
        x={362}
        y={120}
        w={120}
        kind="consumer"
        label="fleet-consumer"
        t="cool"
      />
      <path d={`M482,144 L512,144`} style={line()} />
      <Box x={514} y={120} w={112} kind="db" label="Postgres" t="warm" />
      <EdgeLabel x={570} y={184}>
        durable state
      </EdgeLabel>

      {/* lane 3 — event log (Postgres → outbox → Redpanda) */}
      <path d={`M570,168 L570,228`} style={line(true)} />
      <EdgeLabel x={612} y={202}>
        outbox
      </EdgeLabel>
      <Box x={514} y={232} w={112} kind="broker" label="Redpanda" t="warm" />
      <EdgeLabel x={400} y={256}>
        event log
      </EdgeLabel>
    </svg>
  );
}

/* ── Manim render → content-addressed gallery ── */
export function VizPipelineSvg() {
  return (
    <svg
      role="img"
      aria-label="Manim renders on research-tower, vizpub publishes the artifact content-addressed into Garage plus an index row into Postgres, and the read-only VizWebViewer serves it by querying the index and proxying the object bytes."
      viewBox="0 0 660 200"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <Defs />
      <Box
        x={14}
        y={76}
        w={140}
        kind="research-tower"
        label="Manim render"
        t="cool"
      />
      <path d={`M154,100 L196,100`} style={line()} />
      <Box x={198} y={76} w={120} kind="publish" label="vizpub" t="warm" />

      {/* fan out to immutable object + mutable index */}
      <path d={`M318,90 C350,90 350,38 382,38`} style={line()} />
      <Box
        x={384}
        y={16}
        w={150}
        kind="garage · object"
        label="content-addressed"
        t="warm"
      />
      <path d={`M318,110 C350,110 350,150 382,150`} style={line()} />
      <Box x={384} y={126} w={150} kind="postgres · index" label="sha · provenance" />

      {/* viewer reads index, proxies bytes */}
      <path d={`M534,38 C570,38 570,86 600,86`} style={line(true)} />
      <path d={`M534,150 C570,150 570,98 600,98`} style={line()} />
      <Box x={560} y={74} w={92} h={44} kind="viewer · ro" label="bytes" t="cool" />
    </svg>
  );
}
