"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface BarDatum {
  label: string;
  value: number;
}

const defaultData: BarDatum[] = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 19 },
  { label: "Wed", value: 7 },
  { label: "Thu", value: 23 },
  { label: "Fri", value: 16 },
  { label: "Sat", value: 9 },
  { label: "Sun", value: 4 },
];

/**
 * Example d3 island. Imperative d3 rendering inside a React effect — the
 * pattern for any custom data viz embedded in an MDX writeup. Defaults are
 * provided so it can be dropped into MDX as <D3BarChart /> with no props.
 */
export function D3BarChart({
  data,
  height = 240,
}: {
  data?: BarDatum[];
  height?: number;
}) {
  const ref = useRef<SVGSVGElement | null>(null);
  const series = data ?? defaultData;

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth || 640;
    const margin = { top: 16, right: 16, bottom: 28, left: 32 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(series.map((d) => d.label))
      .range([0, innerW])
      .padding(0.2);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d.value) ?? 0])
      .nice()
      .range([innerH, 0]);

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .attr("color", "var(--muted-foreground)")
      .call(d3.axisBottom(x));
    g.append("g")
      .attr("color", "var(--muted-foreground)")
      .call(d3.axisLeft(y).ticks(4));

    g.selectAll("rect")
      .data(series)
      .join("rect")
      .attr("x", (d) => x(d.label) ?? 0)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerH - y(d.value))
      .attr("rx", 4)
      .attr("fill", "var(--accent)");
  }, [series, height]);

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="Example bar chart"
      style={{ width: "100%", height }}
      className="not-prose"
    />
  );
}
