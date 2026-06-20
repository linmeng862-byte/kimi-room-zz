// Demo data for /room/wellbeing/report — a SAMPLE dashboard.
//
// The canon build has a real medical report grid (体検 metrics, grades, doctor
// comments) backed by private health data; that never ships open-source. This is
// a fully synthetic example whose only job is to show the *shape* of a dashboard
// you could add: metric cards + a trend bar + a colorway strip. Copy this file +
// src/app/room/wellbeing/report/page.tsx and swap in your own metrics.

export type DemoMetric = {
  label: string;
  value: string;
  unit: string;
  tone: "good" | "watch" | "high";
};

export type DemoTrend = {
  label: string;
  points: number[]; // 0..1, one per day
};

export type DemoSwatch = { name: string; hex: string };

export const DEMO_VITALS: DemoMetric[] = [
  { label: "resting hr", value: "58", unit: "bpm", tone: "good" },
  { label: "steps", value: "7,420", unit: "/ day", tone: "watch" },
  { label: "hydration", value: "1.8", unit: "L", tone: "watch" },
  { label: "deep sleep", value: "1.6", unit: "hrs", tone: "high" },
];

export const DEMO_TREND: DemoTrend = {
  label: "energy · last 7 days",
  points: [0.52, 0.64, 0.41, 0.7, 0.6, 0.82, 0.58],
};

// the kimi token swatches — this is the "配色" the report shows off.
export const DEMO_SWATCHES: DemoSwatch[] = [
  { name: "rose", hex: "#A42B5E" },
  { name: "bronze", hex: "#8A6428" },
  { name: "blush", hex: "#C7547E" },
  { name: "wine", hex: "#5A1820" },
  { name: "gold", hex: "#b8a070" },
  { name: "sage", hex: "#5DCAA5" },
];

export const DEMO_INTRO =
  "示例报告 — 演示你可以怎么往房间里加一块自己的 dashboard。下面的数字全是假的。";

export const DEMO_FOOTNOTE =
  "复制 src/app/room/wellbeing/report/ + src/lib/health-demo.ts，换成你自己的指标即可。";

// tone → token color (day/night handled by the page via the palette).
export function toneHex(tone: DemoMetric["tone"]): string {
  if (tone === "good") return "#5DCAA5"; // sage
  if (tone === "watch") return "#b8a070"; // gold
  return "#C7547E"; // blush (high · 留意)
}
