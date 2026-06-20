// Client-safe bg color constants (no "use server" — safe to import anywhere).

export const BG_COLORS = [
  { label: "Snow", value: "#FFFAFA" },
  { label: "Alice Blue", value: "#F0F8FF" },
  { label: "Azure", value: "#F0FFFF" },
  { label: "Lavender Blush", value: "#FFF0F5" },
  { label: "Misty Rose", value: "#FFE4E1" },
  { label: "Ghost White", value: "#F8F8FF" },
] as const;

export type BgColorValue = (typeof BG_COLORS)[number]["value"];

export const BG_COLOR_DEFAULT: BgColorValue = "#F8F8FF";
export const BG_COLOR_COOKIE = "kimi-bg-color";

export function isValidBgColor(v: string | undefined): v is BgColorValue {
  return BG_COLORS.some((c) => c.value === v);
}
