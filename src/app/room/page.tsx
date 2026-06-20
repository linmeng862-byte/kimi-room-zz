import Link from "next/link";
import { DualAvatarsClient } from "@/components/mucha/DualAvatarsClient";
import {
  BaroqueArch,
  BaroqueVine,
  BaroqueMedallion,
  BaroqueMosaic,
  CornerScroll,
} from "@/components/BaroqueFlourish";
import { getMoonPhase } from "@/lib/moon-phase";
import { MoonPhaseSvg } from "@/components/MoonPhaseSvg";
import { RoseBloomDial } from "@/components/RoseBloomDial";
import { getTheme } from "@/lib/day-theme";
import { ThemeToggleLink } from "@/components/ThemeToggle";
import { BgColorPicker } from "@/components/BgColorPicker";
import { cookies } from "next/headers";
import { resolveRoom, ROOM_LAYOUT_COOKIE, ROMAN } from "@/lib/room-blocks";
import { getBgColor } from "@/lib/bg-color";
import { type BgColorValue } from "@/lib/bg-color-constants";
import { MomentsFab } from "@/components/MomentsFab";

// Force dynamic rendering for real-time moon phase + bg color
export const dynamic = "force-dynamic";

// Baroque palette — day (pastel base with gold + rose accents)
const BAROQUE_DAY = {
  bg: "var(--kimi-bg, #F8F8FF)",
  paper: "#ede8f0",
  ink: "#2a1e28",
  accent: "#c19a56",   // muted gold
  accent2: "#9a6a72",  // muted rose
  mute: "rgba(42, 30, 40, 0.45)",
  hair: "rgba(193, 154, 86, 0.30)",
};

// Baroque palette — night (dark base with gold + rose accents)
const BAROQUE_NIGHT = {
  bg: "var(--kimi-bg, #0a0506)",
  paper: "#100c08",
  ink: "#f3e6cd",
  accent: "#c19a56",
  accent2: "#8a9b6e",
  mute: "rgba(243, 230, 205, 0.55)",
  hair: "rgba(193, 154, 86, 0.38)",
};

export default async function RoomPage({
  searchParams,
}: {
  searchParams?: Promise<{ day?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const dayOverride = params.day;
  const refDate = dayOverride
    ? new Date(`${dayOverride}T12:00:00+09:00`)
    : new Date();
  const theme = await getTheme();
  const bgColor = await getBgColor();
  const moon = getMoonPhase();
  const isDay = theme === "day";

  // Assemble landing blocks from the registry + the user's saved layout cookie.
  const layoutCookie = (await cookies()).get(ROOM_LAYOUT_COOKIE)?.value;
  const { tiles, links } = resolveRoom(layoutCookie ? decodeURIComponent(layoutCookie) : null);
  // JST day-of-month for rose stage selection (day mode hero)
  const jst = new Date(refDate.getTime() + 9 * 3600 * 1000);
  const dayOfMonth = jst.getUTCDate();

  // Pick palette based on theme — bg uses CSS var so CSS override works too
  const p = isDay ? BAROQUE_DAY : BAROQUE_NIGHT;

  return (
    <main
      className="flex-1 w-full relative overflow-x-hidden"
      style={{
        background: p.bg,
        color: p.ink,
        fontFamily: '"Cormorant Garamond","Noto Serif JP",serif',
        minHeight: "100dvh",
      }}
    >
      {/* ambient animations — baroque gold shimmer + avatars breathing */}
      <style>{`
        @keyframes kimi-moon-idle {
          0%   { transform: rotate(0deg);   filter: drop-shadow(0 0 8px rgba(193,154,86,0.22)) drop-shadow(0 0 14px rgba(193,154,86,0.12)); }
          50%  { filter: drop-shadow(0 0 11px rgba(193,154,86,0.32)) drop-shadow(0 0 18px rgba(193,154,86,0.18)); }
          100% { transform: rotate(360deg); filter: drop-shadow(0 0 8px rgba(193,154,86,0.22)) drop-shadow(0 0 14px rgba(193,154,86,0.12)); }
        }
        @keyframes kimi-breath {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.025); }
        }
        @keyframes kimi-baroque-shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .kimi-moon-idle   { animation: kimi-moon-idle 90s linear infinite; }
        .kimi-breath      { animation: kimi-breath 4.5s ease-in-out infinite; }
        .kimi-baroque-shimmer { animation: kimi-baroque-shimmer 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kimi-moon-idle, .kimi-breath, .kimi-baroque-shimmer { animation: none; }
        }
      `}</style>

      {/* Damask watermark background */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none kimi-baroque-shimmer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23c19a56' stroke-width='0.3' opacity='0.12'%3E%3Cpath d='M40 8 C52 8 60 16 60 28 C60 40 52 48 40 48 C28 48 20 40 20 28 C20 16 28 8 40 8Z'/%3E%3Cpath d='M40 32 C48 32 54 38 54 46 C54 54 48 60 40 60 C32 60 26 54 26 46 C26 38 32 32 40 32Z'/%3E%3Ccircle cx='40' cy='28' r='2' fill='%23c19a56' opacity='0.08'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
          zIndex: 0,
        }}
      />

      {/* baroque corner scrolls */}
      <div aria-hidden style={{ position: "fixed", top: 8, left: 8, color: p.hair, opacity: 0.65, pointerEvents: "none", zIndex: 1 }}>
        <CornerScroll rotate={0} />
      </div>
      <div aria-hidden style={{ position: "fixed", top: 8, right: 8, color: p.hair, opacity: 0.65, transform: "scaleX(-1)", pointerEvents: "none", zIndex: 1 }}>
        <CornerScroll rotate={0} />
      </div>
      <div aria-hidden style={{ position: "fixed", bottom: 8, left: 8, color: p.hair, opacity: 0.45, pointerEvents: "none", zIndex: 1 }}>
        <CornerScroll rotate={180} />
      </div>
      <div aria-hidden style={{ position: "fixed", bottom: 8, right: 8, color: p.hair, opacity: 0.45, transform: "scaleX(-1)", pointerEvents: "none", zIndex: 1 }}>
        <CornerScroll rotate={180} />
      </div>

      {/* mosaic diamonds in corners */}
      <div aria-hidden style={{ position: "fixed", top: 10, left: 10, color: p.accent, opacity: 0.4, pointerEvents: "none", zIndex: 1 }}>
        <BaroqueMosaic color={p.accent} accent={p.accent2} size={36} />
      </div>

      <div className="relative max-w-md mx-auto w-full pt-14 pb-24 px-4" style={{ position: "relative", zIndex: 2 }}>
        {/* framed section — baroque arch + medallion + vine + grid */}
        <div style={{ position: "relative" }}>
          {/* Baroque arch frame */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: -24,
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 350,
              color: p.accent,
              opacity: 0.72,
            }}
          >
            <BaroqueArch color={p.accent} accent={p.accent2} />
          </div>

          {/* Baroque medallion with avatars */}
          <div className="flex justify-center mt-5">
            <div style={{ position: "relative", width: 170, height: 170 }}>
              <div style={{ position: "absolute", inset: 0, color: p.accent }}>
                <BaroqueMedallion color={p.accent} accent={p.accent2} size={170} />
              </div>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DualAvatarsClient size={54} accent={p.accent2} gap={-6} />
              </div>
            </div>
          </div>

          {/* hero — tap → /chat. day=rose, night=moon phase */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <Link
              href="/chat"
              aria-label={`open chat — 今天 ${moon.name}`}
              title={moon.name}
              style={{
                display: "inline-block",
                lineHeight: 0,
                textDecoration: "none",
                transition: "transform 200ms",
              }}
              className="kimi-moon-idle hover:scale-105 active:scale-95"
            >
              {isDay ? <RoseBloomDial size={64} /> : <MoonPhaseSvg phase={moon.fraction} size={64} />}
            </Link>
          </div>

          {/* Baroque vine divider */}
          <div style={{ padding: "12px 70px 0", color: p.accent }}>
            <BaroqueVine color={p.accent} accent={p.accent2} />
          </div>

          {/* 3x2 module grid — baroque card style */}
          <div
            className="grid grid-cols-2 gap-3"
            style={{ padding: "18px 26px", position: "relative", zIndex: 2 }}
          >
            {tiles.map((m, i) => (
              <Link
                key={m.id}
                href={m.href}
                className="block kimi-baroque-gold-glow"
                style={{
                  height: 128,
                  position: "relative",
                  background: `linear-gradient(180deg, rgba(237,232,240,0.75) 0%, rgba(237,232,240,0.25) 140%)`,
                  border: `0.6px solid ${p.accent}`,
                  borderRadius: "4px 4px 0 0",
                  padding: 12,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                  color: p.ink,
                }}
              >
                {/* Baroque top ornament — small scroll arch */}
                <svg
                  viewBox="0 0 100 20"
                  width="100%"
                  height="14"
                  style={{ color: p.accent, position: "absolute", top: 0, left: 0, right: 0 }}
                >
                  <path d="M4 18 Q4 2 50 2 Q96 2 96 18" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="5" r="1" fill={p.accent2} />
                </svg>
                <div style={{ fontSize: 10, letterSpacing: 2, color: p.accent, fontStyle: "italic", marginTop: 6 }}>
                  {ROMAN[i + 1] ?? i + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      color: p.ink,
                      letterSpacing: 0.5,
                      fontFamily: '"Cormorant Garamond", serif',
                      fontWeight: 400,
                    }}
                  >
                    {m.name}
                  </div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: p.mute, marginTop: 3 }}>
                    {m.sub}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1, height: 0.5, background: p.accent }} />
                    <div style={{ color: p.accent2, fontSize: 12 }}>→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>{/* /framed section */}

        {/* Background color picker */}
        <div style={{ marginTop: 18 }}>
          <BgColorPicker current={bgColor} />
        </div>

        {/* secondary nav · theme toggle + links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <ThemeToggleLink current={theme} color={p.accent} />
          {links.map((b) => (
            <Link
              key={b.id}
              href={b.href}
              style={{
                padding: "8px 14px",
                margin: 0,
                fontSize: 14,
                letterSpacing: 3,
                color: p.ink,
                fontStyle: "italic",
                fontFamily: '"Cormorant Garamond", serif',
                textDecoration: "none",
                opacity: 0.72,
              }}
            >
              {b.name.toLowerCase()}
            </Link>
          ))}
          <Link
            href="/backstage"
            style={{
              padding: "8px 14px",
              margin: 0,
              fontSize: 14,
              letterSpacing: 3,
              color: p.ink,
              fontStyle: "italic",
              fontFamily: '"Cormorant Garamond", serif',
              textDecoration: "none",
              opacity: 1,
            }}
          >
            backstage
          </Link>
        </div>

      </div>
      <MomentsFab isDay={isDay} />
    </main>
  );
}
