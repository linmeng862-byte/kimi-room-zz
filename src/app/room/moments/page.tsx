import { MomentsFeed } from "@/components/moments/MomentsFeed";
import { getTheme } from "@/lib/day-theme";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MomentsPage() {
  const theme = await getTheme();
  const isDay = theme === "day";

  const fg = isDay ? "#2a1e28" : "#f3e6cd";
  const accent = "#c19a56";

  return (
    <div>
      {/* Simple top bar with back link */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: isDay
            ? "rgba(237,232,240,0.72)"
            : "rgba(16,12,8,0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `0.5px solid ${isDay ? "rgba(193,154,86,0.35)" : "rgba(193,154,86,0.45)"}`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: '"Cormorant Garamond","Noto Serif JP",serif',
        }}
      >
        <Link
          href="/room"
          style={{
            color: accent,
            textDecoration: "none",
            fontSize: 13,
            letterSpacing: 1,
            fontStyle: "italic",
          }}
        >
          ← room
        </Link>
      </div>

      <div style={{ paddingTop: 44 }}>
        <MomentsFeed isDay={isDay} />
      </div>
    </div>
  );
}
