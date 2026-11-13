"use client";
import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { HeatmapChart } from "echarts/charts";
import {
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { duration } from "../../../packages/analytics";
import { dayKey } from "../../../packages/analytics/rhythm";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([
  HeatmapChart,
  CalendarComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
export default function Activity({ entries }: { entries: [string, number][] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const end = new Date(),
      start = new Date();
    start.setMonth(start.getMonth() - 5);
    const paint = () => {
      const style = getComputedStyle(document.documentElement),
        ink = style.getPropertyValue("--ink").trim(),
        muted = style.getPropertyValue("--muted").trim(),
        paper = style.getPropertyValue("--paper").trim(),
        bg = style.getPropertyValue("--bg").trim(),
        font = style.getPropertyValue("--font-body").trim(),
        ramp = [
          "--bg",
          "--activity-faint",
          "--activity-low",
          "--activity-mid",
          "--activity-high",
        ].map((token) => style.getPropertyValue(token).trim()),
        dateOnly = style.getPropertyValue("--activity-date").trim();
      chart.setOption({
        textStyle: { fontSize: 14, fontFamily: font },
        animation: false,
        tooltip: {
          backgroundColor: paper,
          borderColor: muted,
          textStyle: { color: ink, fontSize: 14 },
          formatter: (p: unknown) => {
            const d = (p as { data?: { value?: [string, number] } }).data
              ?.value;
            return d
              ? `${d[0]} · ${d[1] > 0 ? duration(d[1]) + " recorded" : "Reading activity; duration unavailable"}`
              : "";
          },
        },
        visualMap: {
          show: false,
          min: 0,
          max: 7200,
          inRange: {
            color: ramp,
          },
        },
        calendar: {
          top: 26,
          left: 32,
          right: 12,
          bottom: 12,
          cellSize: ["auto", 15],
          range: [dayKey(start.toISOString()), dayKey(end.toISOString())],
          splitLine: { show: false },
          itemStyle: {
            borderColor: "transparent",
            borderWidth: 3,
            color: bg,
          },
          yearLabel: { show: false },
          dayLabel: {
            firstDay: 1,
            color: muted,
            fontSize: 12,
            nameMap: ["S", "M", "T", "W", "T", "F", "S"],
          },
          monthLabel: { color: muted, fontSize: 13 },
        },
        series: [
          {
            type: "heatmap",
            coordinateSystem: "calendar",
            data: entries.map(([date, seconds]) => ({
              value: [date, seconds],
              ...(seconds === 0 ? { itemStyle: { color: dateOnly } } : {}),
            })),
          },
        ],
      });
    };
    paint();
    const theme = new MutationObserver(paint);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const obs = new ResizeObserver(() => chart.resize());
    obs.observe(ref.current);
    return () => {
      obs.disconnect();
      theme.disconnect();
      chart.dispose();
    };
  }, [entries]);
  return (
    <div
      role="img"
      aria-label={`Recorded reading activity across ${entries.length} days`}
      ref={ref}
      style={{ height: 185, width: "100%" }}
    />
  );
}
