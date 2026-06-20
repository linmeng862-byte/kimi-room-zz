// Client-safe day/night theme helpers + palette constants.
// Server-only stuff (getTheme using cookies from next/headers) is in
// day-theme.ts. Both server and client components can import this file.

export type KimiTheme = "day" | "night";

export function getThemeFromCookieValue(cookieStr: string): KimiTheme {
  return /(?:^|;\s*)kimi-theme=day(?:;|$)/.test(cookieStr) ? "day" : "night";
}

// ────────────────────────────────────────────────────────────────
// Baroque Rose palette — light pastel base with gold + rose accents
// ────────────────────────────────────────────────────────────────

export const ROSE_GOTHIC_DAY = {
  bg: "linear-gradient(180deg, #F8F8FF 0%, #ede8f0 100%)",
  bgSolid: "#F8F8FF",
  paper: "#ede8f0",
  paperSoft: "#f4f0f6",
  ink: "#2a1e28",
  inkBody: "#3a2e38",
  inkMute: "rgba(42, 30, 40, 0.45)",
  inkFaint: "rgba(42, 30, 40, 0.28)",
  rose: "#9a6a72",
  roseDeep: "#8b3a3a",
  blush: "#d4a0a8",
  bronze: "#c19a56",
  silverGold: "#b8a890",
  brass: "#a87a48",
  mauveMist: "#b8a0b0",
  hair: "rgba(193, 154, 86, 0.28)",
  hairBold: "rgba(193, 154, 86, 0.42)",
  sage: "#7a8a6a",
  fern: "#4a6a3a",
  cinnabar: "#c8362a",
} as const;

export type RoseGothicPalette = typeof ROSE_GOTHIC_DAY;
