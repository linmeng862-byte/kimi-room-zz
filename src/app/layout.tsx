import type { Metadata } from "next";
import "./globals.css";
import { EntryMotion } from "@/components/EntryMotion";
import { GrainOverlay } from "@/components/GrainOverlay";
import { PageTransition } from "@/components/PageTransition";
import { PullToRefresh } from "@/components/PullToRefresh";
import { RegisterSW } from "@/components/RegisterSW";
import { SwipeBack } from "@/components/SwipeBack";
import { getBgColor } from "@/lib/bg-color";
import { BG_COLOR_COOKIE, BG_COLOR_DEFAULT } from "@/lib/bg-color-constants";

export const metadata: Metadata = {
  title: "kimi · room",
  description: "private companion room",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "kimi",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "kimi · room",
    description: "private companion room",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kimi · room",
    description: "private companion room",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
};

const THEME_COLOR_BAROQUE = "#F8F8FF";

// Inline script: sync data-theme + bg color from cookies on every navigation.
// Also handles bfcache restore for iOS PWA.
const THEME_SYNC_SCRIPT = `
(function(){
  function readCookieTheme(){
    var m = document.cookie.match(/(?:^|;\\s*)kimi-theme=([^;]+)/);
    return (m && m[1] === 'day') ? 'day' : 'night';
  }
  function readBgColor(){
    var m = document.cookie.match(/(?:^|;\\s*)${BG_COLOR_COOKIE}=([^;]+)/);
    var v = m && m[1];
    var valid = ['#FFFAFA','#F0F8FF','#F0FFFF','#FFF0F5','#FFE4E1','#F8F8FF'];
    return (v && valid.indexOf(v) !== -1) ? v : '${BG_COLOR_DEFAULT}';
  }
  function apply(t, bg){
    var html = document.documentElement;
    if (html.dataset.theme !== t) html.dataset.theme = t;
    // Night mode: override --kimi-bg to dark regardless of cookie
    var actualBg = (t === 'day') ? bg : '#0a0506';
    html.style.setProperty('--kimi-bg', actualBg);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', actualBg);
  }
  apply(readCookieTheme(), readBgColor());
  window.addEventListener('pageshow', function(e){
    var t = readCookieTheme();
    var bg = readBgColor();
    if (e.persisted && document.documentElement.dataset.theme !== t) {
      location.reload();
      return;
    }
    apply(t, bg);
  });
})();
`;

// FOUC prevention for EntryMotion.
const ENTRY_GATE_SCRIPT = `
(function(){
  try {
    if (!localStorage.getItem('kimi-entry-seen')) {
      document.documentElement.classList.add('kimi-entry-pending');
    }
  } catch(e) {}
})();
`;

async function readTheme(): Promise<"day" | "night"> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const v = store.get("kimi-theme")?.value;
  if (v && v.trim().toLowerCase() === "day") return "day";
  return "night";
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = await readTheme();
  const bgColor = await getBgColor();
  // Night mode: --kimi-bg is always the dark color #0a0506.
  // Day mode: --kimi-bg is the user-selected pastel from cookie.
  const actualBg = theme === "day" ? bgColor : "#0a0506";
  return (
    <html
      lang="ja"
      data-theme={theme}
      className="h-full antialiased"
      style={{ "--kimi-bg": actualBg } as React.CSSProperties}
    >
      <head>
        {/* Inline bg style — baroque light base. The CSS var --kimi-bg
            is set on <html> from the bg color cookie. First paint matches
            chosen pastel instead of flashing white. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{background:var(--kimi-bg, ${theme === "day" ? bgColor : "#0a0506"});color:${theme === "day" ? "#2a1e28" : "#d8d0c8"};margin:0}`,
          }}
        />
        <meta
          name="theme-color"
          content={actualBg}
        />
        <script dangerouslySetInnerHTML={{ __html: ENTRY_GATE_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SYNC_SCRIPT }} />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSqn7B6D.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtKky2F7g.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/xn7mYHs72GKoTvER4Gn3b5eMbNmuY2Q3X88.woff2"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/fonts/kimi-fonts.css" />
        <link rel="apple-touch-startup-image" media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1320x2868.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1290x2796.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1284x2778.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1242x2688.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1206x2622.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1179x2556.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1170x2532.png" />
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/apple-splash-1125x2436.png" />
        <link rel="apple-touch-startup-image" media="(min-device-width: 768px)" href="/apple-splash-2048x2732-ipad.png" />
        <link rel="apple-touch-startup-image" href="/apple-splash-1179x2556.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <EntryMotion />
        <GrainOverlay />
        <RegisterSW />
        <PullToRefresh />
        <SwipeBack />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
