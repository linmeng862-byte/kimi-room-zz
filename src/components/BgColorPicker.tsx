"use client";

import { useTransition } from "react";
import { setBgColor } from "@/lib/bg-color";
import { BG_COLORS, type BgColorValue } from "@/lib/bg-color-constants";

/**
 * Baroque background color picker — 6 pastel options as clickable circles.
 * Uses useTransition + server action to set cookie without full page reload.
 */
export function BgColorPicker({ current }: { current: BgColorValue }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(color: BgColorValue) {
    startTransition(async () => {
      await setBgColor(color);
    });
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        opacity: isPending ? 0.7 : 1,
        transition: "opacity 200ms",
      }}
    >
      {BG_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => handleChange(c.value)}
          aria-label={`背景色: ${c.label} (${c.value})`}
          title={c.label}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: c.value === current
              ? "2.5px solid #c19a56"
              : "1.5px solid rgba(193,154,86,0.35)",
            background: c.value,
            cursor: "pointer",
            boxShadow: c.value === current
              ? "0 0 0 3px rgba(193,154,86,0.22), 0 1px 4px rgba(0,0,0,0.08)"
              : "0 1px 3px rgba(0,0,0,0.06)",
            transition: "box-shadow 200ms, border-color 200ms, transform 150ms",
            padding: 0,
          }}
          className="hover:scale-110 active:scale-95"
        />
      ))}
    </div>
  );
}
