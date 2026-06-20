export function CornerScroll({
  className = "",
  rotate = 0,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 60"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      <path
        d="M2 58 C 2 40, 10 28, 28 28 C 40 28, 46 22, 46 12 C 46 6, 50 4, 54 4"
        opacity="0.85"
      />
      <path
        d="M2 58 C 6 46, 14 38, 24 38 C 32 38, 36 34, 36 28"
        opacity="0.5"
      />
      <circle cx="54" cy="4" r="1.6" fill="currentColor" opacity="0.9" />
      <circle cx="36" cy="28" r="1.1" fill="currentColor" opacity="0.7" />
      <path
        d="M28 28 Q 24 20, 30 18 Q 36 20, 32 28 Z"
        fill="currentColor"
        opacity="0.35"
        stroke="none"
      />
    </svg>
  );
}

export function CenterFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
    >
      <path d="M10 20 C 40 20, 50 8, 80 20 C 95 26, 100 14, 100 14" opacity="0.7" />
      <path d="M190 20 C 160 20, 150 8, 120 20 C 105 26, 100 14, 100 14" opacity="0.7" />
      <g transform="translate(100 20)">
        <path
          d="M0 -10 C 4 -6, 6 -2, 0 0 C -6 -2, -4 -6, 0 -10 Z"
          fill="currentColor"
          opacity="0.9"
          stroke="none"
        />
        <path
          d="M0 0 C 5 2, 8 5, 0 8 C -8 5, -5 2, 0 0 Z"
          fill="currentColor"
          opacity="0.55"
          stroke="none"
        />
        <circle cx="0" cy="-12" r="1" fill="currentColor" />
      </g>
      <circle cx="10" cy="20" r="1.3" fill="currentColor" opacity="0.7" />
      <circle cx="190" cy="20" r="1.3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function DamaskPattern({ className = "" }: { className?: string }) {
  const pattern = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='%23c19a56' stroke-width='0.4' opacity='0.25'><path d='M60 15 C 75 15, 85 25, 85 40 C 85 55, 75 65, 60 65 C 45 65, 35 55, 35 40 C 35 25, 45 15, 60 15 Z'/><path d='M60 55 C 70 55, 78 63, 78 75 C 78 87, 70 95, 60 95 C 50 95, 42 87, 42 75 C 42 63, 50 55, 60 55 Z'/><circle cx='60' cy='40' r='3' fill='%23c19a56' opacity='0.5'/><circle cx='60' cy='75' r='2' fill='%239a7a7a' opacity='0.45'/><path d='M0 60 Q 30 40, 60 60 T 120 60' /><path d='M0 0 Q 30 20, 60 0 T 120 0' /></g></svg>`;
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("${pattern}")`,
        backgroundSize: "120px 120px",
      }}
    />
  );
}

/**
 * BaroqueArch — replaces MuchaArch on /room.
 * A baroque-style ornamental frame with:
 *   - Elaborate top crown with scroll volutes (S-curves)
 *   - Fluted pilaster columns with Corinthian-style capitals
 *   - Base with acanthus-leaf scroll motif
 *
 * Supports two modes like MuchaArch:
 *   - Legacy: fixed-size (width + height provided)
 *   - Adaptive: 3-layer DOM frame that stretches
 */
export function BaroqueArch({
  color,
  accent,
  width,
  height,
}: {
  color: string;
  accent: string;
  width?: number;
  height?: number;
}) {
  if (width != null && height != null) {
    return <LegacyBaroqueArch color={color} accent={accent} width={width} height={height} />;
  }
  return <AdaptiveBaroqueArch color={color} accent={accent} />;
}

function LegacyBaroqueArch({
  color,
  accent,
  width,
  height,
}: {
  color: string;
  accent: string;
  width: number;
  height: number;
}) {
  return (
    <svg viewBox="0 0 350 500" width={width} height={height} style={{ color }}>
      {/* Top crown — baroque scroll volutes */}
      <g stroke="currentColor" fill="none" strokeWidth="0.8">
        {/* Center fleur-de-lis */}
        <path d="M170 10 Q175 4 180 10 Q178 8 175 3 Q172 8 170 10" />
        <path d="M168 12 Q175 8 182 12" strokeWidth="0.6" />
        {/* Left volute scroll */}
        <path d="M165 14 C145 10, 110 8, 70 18 C45 24, 30 32, 24 42 C20 48, 22 52, 28 52 C34 52, 36 48, 34 44" />
        <path d="M160 18 C142 14, 118 14, 90 22 C68 28, 52 36, 46 44" strokeWidth="0.5" opacity="0.7" />
        {/* Right volute scroll (mirror) */}
        <path d="M185 14 C205 10, 240 8, 280 18 C305 24, 320 32, 326 42 C330 48, 328 52, 322 52 C316 52, 314 48, 316 44" />
        <path d="M190 18 C208 14, 232 14, 260 22 C282 28, 298 36, 304 44" strokeWidth="0.5" opacity="0.7" />
        {/* Decorative dots */}
        <circle cx="28" cy="52" r="2" fill={accent} opacity="0.6" />
        <circle cx="322" cy="52" r="2" fill={accent} opacity="0.6" />
      </g>
      {/* Top rail connecting crown to columns */}
      <path d="M24 54 L30 68" stroke="currentColor" strokeWidth="0.7" />
      <path d="M326 54 L320 68" stroke="currentColor" strokeWidth="0.7" />
      <path d="M30 68 Q175 58 320 68" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      {/* Left pilaster — fluted column */}
      <g stroke="currentColor" fill="none" strokeWidth="0.6">
        <line x1="20" y1="72" x2="20" y2="458" />
        <line x1="28" y1="72" x2="28" y2="458" />
        {/* Capital — Corinthian-style scroll */}
        <path d="M14 68 Q20 56 26 64 Q32 56 38 68" />
        <path d="M12 72 L14 68" strokeWidth="0.4" />
        <path d="M38 68 L40 72" strokeWidth="0.4" />
        {/* Fluting lines */}
        <line x1="24" y1="80" x2="24" y2="450" strokeWidth="0.3" opacity="0.4" />
      </g>
      {/* Right pilaster — mirror */}
      <g stroke="currentColor" fill="none" strokeWidth="0.6">
        <line x1="322" y1="72" x2="322" y2="458" />
        <line x1="330" y1="72" x2="330" y2="458" />
        <path d="M312 68 Q318 56 324 64 Q330 56 336 68" />
        <path d="M310 72 L312 68" strokeWidth="0.4" />
        <path d="M336 68 L338 72" strokeWidth="0.4" />
        <line x1="326" y1="80" x2="326" y2="450" strokeWidth="0.3" opacity="0.4" />
      </g>
      {/* Column capitals — small accent fill */}
      <rect x="14" y="68" width="26" height="5" fill="currentColor" opacity="0.12" />
      <rect x="310" y="68" width="26" height="5" fill="currentColor" opacity="0.12" />
      {/* Base — acanthus scroll motif */}
      <g stroke="currentColor" fill="none" strokeWidth="0.7">
        <path d="M20 460 Q20 470, 16 475 Q10 482, 22 484 Q34 482, 28 475 Q24 470, 28 460" />
        <path d="M322 460 Q322 470, 318 475 Q312 482, 324 484 Q336 482, 330 475 Q326 470, 330 460" />
        {/* Connecting base rail */}
        <path d="M28 462 Q175 472 322 462" strokeWidth="0.5" opacity="0.6" />
        <path d="M28 468 Q175 476 322 468" strokeWidth="0.35" opacity="0.4" />
      </g>
      {/* Accent rosettes on columns */}
      <circle cx="24" cy="260" r="3" fill={accent} opacity="0.35" />
      <circle cx="326" cy="260" r="3" fill={accent} opacity="0.35" />
      {/* Accent leaves near top */}
      <ellipse cx="40" cy="85" rx="3" ry="7" fill={accent} opacity="0.3" transform="rotate(-25 40 85)" />
      <ellipse cx="310" cy="85" rx="3" ry="7" fill={accent} opacity="0.3" transform="rotate(25 310 85)" />
    </svg>
  );
}

function AdaptiveBaroqueArch({ color, accent }: { color: string; accent: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", color }}>
      {/* TOP — baroque crown with volutes */}
      <svg viewBox="0 0 350 80" width="350" height="80" style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Center fleur-de-lis */}
        <path d="M170 4 Q175 -2 180 4 Q178 2 175 -3 Q172 2 170 4" stroke="currentColor" strokeWidth="0.7" fill="none" />
        {/* Left volute scroll */}
        <path d="M165 6 C145 2, 110 0, 70 10 C45 16, 30 24, 24 34 C20 40, 22 44, 28 44 C34 44, 36 40, 34 36" stroke="currentColor" strokeWidth="0.7" fill="none" />
        <path d="M160 10 C142 6, 118 6, 90 14 C68 20, 52 28, 46 36" stroke="currentColor" strokeWidth="0.45" fill="none" opacity="0.65" />
        {/* Right volute scroll */}
        <path d="M185 6 C205 2, 240 0, 280 10 C305 16, 320 24, 326 34 C330 40, 328 44, 322 44 C316 44, 314 40, 316 36" stroke="currentColor" strokeWidth="0.7" fill="none" />
        <path d="M190 10 C208 6, 232 6, 260 14 C282 20, 298 28, 304 36" stroke="currentColor" strokeWidth="0.45" fill="none" opacity="0.65" />
        {/* Top rail */}
        <path d="M24 46 L30 60" stroke="currentColor" strokeWidth="0.6" />
        <path d="M326 46 L320 60" stroke="currentColor" strokeWidth="0.6" />
        <path d="M30 60 Q175 50 320 60" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.55" />
        {/* Capital ornament dots */}
        <circle cx="28" cy="44" r="1.8" fill={accent} opacity="0.55" />
        <circle cx="322" cy="44" r="1.8" fill={accent} opacity="0.55" />
        {/* Accent leaves */}
        <ellipse cx="40" cy="62" rx="2.5" ry="6" fill={accent} opacity="0.28" transform="rotate(-25 40 62)" />
        <ellipse cx="310" cy="62" rx="2.5" ry="6" fill={accent} opacity="0.28" transform="rotate(25 310 62)" />
        {/* Column caps */}
        <rect x="14" y="60" width="22" height="4" fill="currentColor" opacity="0.1" />
        <rect x="314" y="60" width="22" height="4" fill="currentColor" opacity="0.1" />
      </svg>

      {/* LEFT pilaster — fluted column CSS borders */}
      <div style={{ position: "absolute", top: 64, bottom: 50, left: 20, width: 8, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, borderLeft: `0.6px solid ${color}` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 8, borderLeft: `0.6px solid ${color}` }} />
        {/* Center fluting */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 4, borderLeft: `0.25px solid ${color}`, opacity: 0.35 }} />
      </div>

      {/* RIGHT pilaster — mirror */}
      <div style={{ position: "absolute", top: 64, bottom: 50, right: 20, width: 8, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, borderLeft: `0.6px solid ${color}` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 8, borderLeft: `0.6px solid ${color}` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 4, borderLeft: `0.25px solid ${color}`, opacity: 0.35 }} />
      </div>

      {/* BASE — acanthus scroll motif */}
      <svg viewBox="0 0 350 50" width="350" height="50" style={{ position: "absolute", bottom: 0, left: 0 }}>
        {/* Left acanthus */}
        <path d="M20 0 Q20 14, 14 20 Q8 28, 22 30 Q34 28, 26 20 Q22 14, 28 0" fill="none" stroke="currentColor" strokeWidth="0.7" />
        {/* Right acanthus */}
        <path d="M322 0 Q322 14, 316 20 Q310 28, 324 30 Q336 28, 328 20 Q324 14, 330 0" fill="none" stroke="currentColor" strokeWidth="0.7" />
        {/* Connecting rails */}
        <path d="M28 4 Q175 18 322 4" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.55" />
        <path d="M28 10 Q175 22 322 10" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.35" />
        {/* Center rosette */}
        <circle cx="175" cy="16" r="3" fill={accent} opacity="0.25" />
        <circle cx="175" cy="16" r="1.5" fill={accent} opacity="0.45" />
      </svg>
    </div>
  );
}

/**
 * BaroqueMedallion — replaces MuchaMedallion.
 * Cartouche-style oval frame with laurel wreath + scroll accents.
 */
export function BaroqueMedallion({
  color,
  accent,
  size = 80,
}: {
  color: string;
  accent: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={{ color }}>
      {/* Outer oval cartouche */}
      <ellipse cx="40" cy="40" rx="32" ry="30" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <ellipse cx="40" cy="40" rx="28" ry="26" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
      {/* Inner soft fill */}
      <ellipse cx="40" cy="40" rx="26" ry="24" fill={accent} opacity="0.08" />
      {/* Laurel wreath — left */}
      <g stroke="currentColor" fill="none" strokeWidth="0.4" opacity="0.6">
        {Array.from({ length: 5 }).map((_, i) => {
          const a = Math.PI * 0.6 + (i / 4) * Math.PI * 0.8;
          return (
            <ellipse
              key={`l${i}`}
              cx={40 + Math.cos(a) * 22}
              cy={40 + Math.sin(a) * 20}
              rx="2"
              ry="5"
              transform={`rotate(${(a * 180) / Math.PI - 90} ${40 + Math.cos(a) * 22} ${40 + Math.sin(a) * 20})`}
            />
          );
        })}
      </g>
      {/* Laurel wreath — right */}
      <g stroke="currentColor" fill="none" strokeWidth="0.4" opacity="0.6">
        {Array.from({ length: 5 }).map((_, i) => {
          const a = -Math.PI * 0.6 - (i / 4) * Math.PI * 0.8;
          return (
            <ellipse
              key={`r${i}`}
              cx={40 + Math.cos(a) * 22}
              cy={40 + Math.sin(a) * 20}
              rx="2"
              ry="5"
              transform={`rotate(${(a * 180) / Math.PI + 90} ${40 + Math.cos(a) * 22} ${40 + Math.sin(a) * 20})`}
            />
          );
        })}
      </g>
      {/* Top scroll accent */}
      <path d="M32 12 Q28 8, 34 6 Q38 8, 36 12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
      <path d="M44 12 Q48 8, 42 6 Q38 8, 40 12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
      {/* Bottom ribbon */}
      <path d="M34 66 Q37 72, 40 68 Q43 72, 46 66" fill="none" stroke="currentColor" strokeWidth="0.45" opacity="0.6" />
      {/* Center accent */}
      <circle cx="40" cy="40" r="2.5" fill={accent} opacity="0.5" />
    </svg>
  );
}

/**
 * BaroqueVine — replaces MuchaVine.
 * A baroque-style divider with scrollwork curves and rose accents.
 */
export function BaroqueVine({
  color,
  accent,
  width = "100%",
}: {
  color: string;
  accent: string;
  width?: number | string;
}) {
  return (
    <svg viewBox="0 0 300 24" width={width} style={{ color, display: "block" }}>
      {/* Central S-curve scrollwork */}
      <path
        d="M10 12 Q20 4 35 10 Q42 14 50 10 Q60 4 75 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.55"
      />
      <path
        d="M290 12 Q280 4 265 10 Q258 14 250 10 Q240 4 225 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.55"
      />
      {/* Center meeting point — ornamental flourish */}
      <path d="M120 12 Q135 6 150 12 Q165 18 180 12" fill="none" stroke="currentColor" strokeWidth="0.5" />
      {/* Rose accents */}
      <circle cx="50" cy="10" r="2" fill={accent} opacity="0.65" />
      <circle cx="150" cy="12" r="2.5" fill={accent} opacity="0.75" />
      <circle cx="250" cy="10" r="2" fill={accent} opacity="0.65" />
      {/* Scroll terminals */}
      <path d="M10 12 Q6 8, 10 6 Q14 8, 10 12" fill="currentColor" opacity="0.3" stroke="none" />
      <path d="M290 12 Q294 8, 290 6 Q286 8, 290 12" fill="currentColor" opacity="0.3" stroke="none" />
      {/* Small accent dots */}
      <circle cx="100" cy="12" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="200" cy="12" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/**
 * BaroqueMosaic — replaces MuchaMosaic.
 * A diamond/checker pattern with gold and rose tones.
 */
export function BaroqueMosaic({
  color,
  accent,
  size = 60,
}: {
  color: string;
  accent: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ color }}>
      {/* Diamond grid pattern */}
      {Array.from({ length: 4 }).flatMap((_, r) =>
        Array.from({ length: 4 }).map((_, c) => {
          const cx = c * 15 + 7.5;
          const cy = r * 15 + 7.5;
          const d = (r + c) % 3;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={c * 15}
                y={r * 15}
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
                opacity="0.3"
              />
              {d === 0 && (
                <path
                  d={`M${cx} ${cy - 5} L${cx + 5} ${cy} L${cx} ${cy + 5} L${cx - 5} ${cy} Z`}
                  fill="currentColor"
                  opacity="0.12"
                  stroke="currentColor"
                  strokeWidth="0.2"
                />
              )}
              {d === 1 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="2.5"
                  fill={accent}
                  opacity="0.2"
                />
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}
