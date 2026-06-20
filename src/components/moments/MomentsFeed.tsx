"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Props = { isDay: boolean };

const SERIF = '"Cormorant Garamond","Noto Serif JP",serif';

// ---- Types ----
type MomentImage = { url: string; alt?: string };
type MomentLike = { user: string; at: number };
type MomentComment = { user: string; text: string; at: number };
type Moment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  images?: MomentImage[];
  likes: MomentLike[];
  comments: MomentComment[];
  createdAt: number;
};

const STORAGE_KEY = "kimi-room:moments:data";

function loadMoments(): Moment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultMoments;
  } catch {
    return defaultMoments;
  }
}

function saveMoments(m: Moment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {}
}

const defaultMoments: Moment[] = [
  {
    id: "d1",
    user: "小狐狸",
    avatar: "🦊",
    text: "今天在旧书摊淘到一本巴洛克风格的画册，翻到一页玫瑰窗纹样，美得舍不得合上。",
    images: [{ url: "/images/mood/roses-vase-pink.jpg", alt: "玫瑰" }],
    likes: [{ user: "你", at: Date.now() }],
    comments: [],
    createdAt: Date.now() - 3600_000,
  },
  {
    id: "d2",
    user: "月影",
    avatar: "🌙",
    text: "凌晨三点的月色透过窗帘，像铺了一层淡金色的纱。",
    likes: [],
    comments: [{ user: "小狐狸", text: "好美，下次一起看月亮", at: Date.now() }],
    createdAt: Date.now() - 7200_000,
  },
];

function uid() {
  return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600_000) return Math.floor(diff / 60000) + "分钟前";
  if (diff < 86400_000) return Math.floor(diff / 3600_000) + "小时前";
  return Math.floor(diff / 86400_000) + "天前";
}

export function MomentsFeed({ isDay }: Props) {
  const [moments, setMoments] = useState<Moment[]>(loadMoments);
  const [compose, setCompose] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // persist on change
  useEffect(() => {
    saveMoments(moments);
  }, [moments]);

  const p = isDay
    ? { bg: "var(--kimi-bg, #F8F8FF)", ink: "#2a1e28", accent: "#c19a56", paper: "#ede8f0", accent2: "#9a6a72", hair: "rgba(193,154,86,0.30)" }
    : { bg: "var(--kimi-bg, #0a0506)", ink: "#f3e6cd", accent: "#c19a56", paper: "#100c08", accent2: "#8a9b6e", hair: "rgba(193,154,86,0.38)" };

  const publish = useCallback(() => {
    const text = compose.trim();
    if (!text) return;
    const m: Moment = {
      id: uid(),
      user: "你",
      avatar: "🌹",
      text,
      likes: [],
      comments: [],
      createdAt: Date.now(),
    };
    setMoments((prev) => [m, ...prev]);
    setCompose("");
  }, [compose]);

  const toggleLike = useCallback((id: string) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const already = m.likes.some((l) => l.user === "你");
        return {
          ...m,
          likes: already
            ? m.likes.filter((l) => l.user !== "你")
            : [...m.likes, { user: "你", at: Date.now() }],
        };
      }),
    );
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    if (!text.trim()) return;
    setMoments((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, comments: [...m.comments, { user: "你", text: text.trim(), at: Date.now() }] }
          : m,
      ),
    );
  }, []);

  return (
    <div
      style={{
        background: p.bg,
        color: p.ink,
        fontFamily: SERIF,
        minHeight: "100dvh",
        paddingBottom: 64,
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 20px 12px",
          borderBottom: `0.5px solid ${p.hair}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 22, letterSpacing: 2, fontStyle: "italic", color: p.accent }}>
          朋友圈
        </span>
      </header>

      {/* Composer */}
      <div style={{ padding: "14px 20px 10px", borderBottom: `0.5px solid ${p.hair}` }}>
        <textarea
          value={compose}
          onChange={(e) => setCompose(e.target.value)}
          placeholder="写点什么…"
          rows={2}
          style={{
            width: "100%",
            background: p.paper,
            color: p.ink,
            border: `0.5px solid ${p.hair}`,
            borderRadius: 4,
            padding: "8px 10px",
            fontFamily: SERIF,
            fontSize: 14,
            resize: "none",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <button
            onClick={publish}
            disabled={!compose.trim()}
            style={{
              padding: "4px 18px",
              background: compose.trim() ? p.accent : p.paper,
              color: compose.trim() ? "#fff" : p.ink,
              border: `0.5px solid ${p.accent}`,
              borderRadius: 3,
              fontFamily: SERIF,
              fontSize: 13,
              letterSpacing: 1,
              cursor: compose.trim() ? "pointer" : "default",
              opacity: compose.trim() ? 1 : 0.5,
            }}
          >
            发送
          </button>
        </div>
      </div>

      {/* Feed */}
      <div ref={feedRef}>
        {moments.map((m) => (
          <article
            key={m.id}
            style={{
              padding: "14px 20px",
              borderBottom: `0.5px solid ${p.hair}`,
            }}
          >
            {/* Avatar + name + time */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>{m.avatar}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: p.accent2 }}>{m.user}</div>
                <div style={{ fontSize: 10, color: p.accent, letterSpacing: 1 }}>{timeAgo(m.createdAt)}</div>
              </div>
            </div>

            {/* Text */}
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: "4px 0 8px", whiteSpace: "pre-wrap" }}>
              {m.text}
            </p>

            {/* Images grid */}
            {m.images && m.images.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: m.images.length === 1 ? "1fr" : "repeat(3, 1fr)",
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                {m.images.map((img, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 3,
                      overflow: "hidden",
                      aspectRatio: m.images!.length === 1 ? undefined : "1",
                      maxHeight: m.images!.length === 1 ? 240 : 120,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Like + comment bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
              <button
                onClick={() => toggleLike(m.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: m.likes.some((l) => l.user === "你") ? "#e85d75" : p.accent,
                  fontSize: 13,
                  fontFamily: SERIF,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {m.likes.some((l) => l.user === "你") ? "♥" : "♡"}
                {m.likes.length > 0 && <span>{m.likes.length}</span>}
              </button>
              <button
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: p.accent,
                  fontSize: 13,
                  fontFamily: SERIF,
                }}
              >
                💬 {m.comments.length > 0 ? m.comments.length : ""}
              </button>
            </div>

            {/* Likes list */}
            {m.likes.length > 0 && (
              <div
                style={{
                  marginTop: 6,
                  padding: "4px 8px",
                  background: p.paper,
                  borderRadius: 3,
                  fontSize: 12,
                  color: p.accent2,
                }}
              >
                ♥ {m.likes.map((l) => l.user).join("、")}
              </div>
            )}

            {/* Comments */}
            {m.comments.length > 0 && (
              <div style={{ marginTop: 6 }}>
                {m.comments.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      padding: "3px 0",
                      color: p.ink,
                    }}
                  >
                    <span style={{ color: p.accent2, fontWeight: 600 }}>{c.user}</span>
                    ：{c.text}
                  </div>
                ))}
              </div>
            )}

            {/* Inline comment input */}
            {expanded === m.id && (
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <input
                  type="text"
                  placeholder="写评论…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      addComment(m.id, val);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                  style={{
                    flex: 1,
                    background: p.paper,
                    color: p.ink,
                    border: `0.5px solid ${p.hair}`,
                    borderRadius: 3,
                    padding: "5px 8px",
                    fontFamily: SERIF,
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Empty state */}
      {moments.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px", color: p.accent, fontStyle: "italic" }}>
          还没有动态，写点什么吧
        </div>
      )}
    </div>
  );
}
