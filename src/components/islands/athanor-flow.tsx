"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/**
 * AthanorFlow — the shared, themed React Flow surface every architecture
 * diagram in a writeup is built on. A bench of matte instrument nodes wired
 * with hairline edges; the CDC / streaming edges animate. Static layout
 * (manual positions) so the diagram reads the same every load; pan + zoom
 * stay available for inspection.
 */

export type Tone = "default" | "warm" | "cool" | "sacred";

export interface AthanorNodeData extends Record<string, unknown> {
  /** small mono eyebrow — the register (SERVICE, DB, BROKER, DEVICE…) */
  kind?: string;
  /** the name */
  label: string;
  /** optional second line — mono detail (image, port, topic…) */
  sub?: string;
  tone?: Tone;
  /** which sides carry handles: left→right (default) or top→bottom */
  flow?: "lr" | "tb";
}

const toneColor: Record<Tone, string> = {
  default: "var(--border)",
  warm: "var(--rule-warm)",
  cool: "var(--rule-cool)",
  sacred: "var(--accent)",
};
const toneInk: Record<Tone, string> = {
  default: "var(--muted-foreground)",
  warm: "var(--brass)",
  cool: "var(--steel)",
  sacred: "var(--accent)",
};

function AthanorNode({ data }: NodeProps) {
  const d = data as AthanorNodeData;
  const tone = d.tone ?? "default";
  const tb = d.flow === "tb";
  const handleStyle = {
    width: 6,
    height: 6,
    background: "var(--surface)",
    border: `1px solid ${toneColor[tone]}`,
  };
  return (
    <div
      style={{
        minWidth: 132,
        maxWidth: 220,
        padding: "9px 12px",
        background: "var(--surface)",
        border: `1px solid ${toneColor[tone]}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-raised)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Handle
        type="target"
        position={tb ? Position.Top : Position.Left}
        style={handleStyle}
      />
      {d.kind ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: toneInk[tone],
          }}
        >
          {d.kind}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.2,
          color: "var(--foreground)",
        }}
      >
        {d.label}
      </div>
      {d.sub ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            lineHeight: 1.3,
            color: "var(--muted-foreground)",
          }}
        >
          {d.sub}
        </div>
      ) : null}
      <Handle
        type="source"
        position={tb ? Position.Bottom : Position.Right}
        style={handleStyle}
      />
    </div>
  );
}

const nodeTypes = { athanor: AthanorNode };

/** Build a themed node with sane defaults. */
export function n(
  id: string,
  position: { x: number; y: number },
  data: AthanorNodeData,
): Node<AthanorNodeData> {
  return { id, position, type: "athanor", data };
}

/** Build a themed edge. `animated` reads as a live / streaming connection. */
export function e(
  id: string,
  source: string,
  target: string,
  opts: { animated?: boolean; label?: string; dashed?: boolean } = {},
): Edge {
  return {
    id,
    source,
    target,
    type: "smoothstep",
    animated: opts.animated,
    label: opts.label,
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 2,
    style: opts.dashed ? { strokeDasharray: "4 4" } : undefined,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#79828b",
      width: 14,
      height: 14,
    },
  };
}

export function AthanorFlow({
  nodes,
  edges,
  height = 360,
}: {
  nodes: Node<AthanorNodeData>[];
  edges: Edge[];
  height?: number;
}) {
  return (
    <div className="nb-flow" style={{ height, width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
      >
        {/* concrete color: SVG pattern fill can't resolve a CSS var; a
            light-mode override lives in globals.css under `.nb-flow`. */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="#272a31"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
