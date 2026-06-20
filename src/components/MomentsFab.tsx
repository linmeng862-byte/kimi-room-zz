"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { isDay: boolean };

const SERIF = '"Cormorant Garamond","Noto Serif JP",serif';

export function MomentsFab({ isDay }: Props) {
  const pathname = usePathname();
  const isActive = pathname === "/room/moments";

  const fg = isDay ? "#2a1e28" : "#f3e6cd";
  const accent = "#c19a56";
  const bgGlass = isDay
    ? "rgba(237,232,240,0.72)"
    : "rgba(16,12,8,0.72)";
  const border = isDay
    ? "rgba(193,154,86,0.35)"
    : "rgba(193,154,86,0.45)";

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "6px 0 calc(6px + env(safe-area-inset-bottom))",
        background: bgGlass,
        backdropFilter: "blur(14px) saturate(1.5)",
        WebkitBackdropFilter: "blur(14px) saturate(1.5)",
        borderTop: `0.5px solid ${border}`,
        fontFamily: SERIF,
      }}
    >
      <Link
        href="/room/moments"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          padding: "4px 28px",
          textDecoration: "none",
          color: isActive ? accent : fg,
          opacity: isActive ? 1 : 0.72,
          transition: "opacity 200ms, color 200ms",
        }}
      >
        {/* Rose SVG icon */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActive ? accent : fg}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="9" r="4.5" />
          <path d="M12 13.5c-2.5 0-4.5-2-4.5-4.5S9.5 4.5 12 4.5s4.5 2 4.5 4.5" />
          <path d="M7.5 7.5c1-2 2.5-3 4.5-3s3.5 1 4.5 3" />
          <path d="M9 4.5c.5-1.5 1.5-2.5 3-2.5s2.5 1 3 2.5" />
          <path d="M12 13.5v5" />
          <path d="M10 18.5h4" />
          <path d="M9 14l-2 2.5" />
          <path d="M15 14l2 2.5" />
        </svg>
        <span style={{ fontSize: 11, letterSpacing: 2, fontStyle: "italic" }}>
          朋友圈
        </span>
        {isActive && (
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: accent,
              marginTop: -1,
            }}
          />
        )}
      </Link>
    </nav>
  );
}
