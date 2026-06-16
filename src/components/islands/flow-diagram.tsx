"use client";

import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const defaultNodes: Node[] = [
  { id: "1", type: "input", position: { x: 0, y: 40 }, data: { label: "Source" } },
  { id: "2", position: { x: 220, y: 0 }, data: { label: "Transform" } },
  { id: "3", position: { x: 220, y: 120 }, data: { label: "Validate" } },
  { id: "4", type: "output", position: { x: 440, y: 60 }, data: { label: "Sink" } },
];

const defaultEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-4", source: "3", target: "4" },
];

/**
 * Example React Flow island for architecture/dataflow diagrams inside writeups.
 * Pass nodes/edges to describe a real system; defaults render a sample pipeline.
 */
export function FlowDiagram({
  nodes = defaultNodes,
  edges = defaultEdges,
  height = 360,
}: {
  nodes?: Node[];
  edges?: Edge[];
  height?: number;
}) {
  return (
    <div
      className="not-prose my-6"
      style={{
        height,
        width: "100%",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
