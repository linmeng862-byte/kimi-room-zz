// V2 LLM API client · reusable across surfaces.
//
// 设计 (老婆 0525 ack):
// - 用户 settings 填 LLM key + endpoint URL, localStorage 存
// - 所有 调 API 的 surface 走 这条:
//   · /chat (主对话)
//   · /room/keepsakes 一句话感想 (auto comment on photo upload)
//   · 未来 surface (会再加)
// - OpenAI-format chat completion (兼容 Anthropic via 任何 OpenAI-compat proxy /
//   OpenRouter / DeepSeek / Together / 自建 vLLM / Ollama)
//
// 官端 closed SaaS 用户 (ChatGPT app / Claude.ai) 路径: 不调 API, 用 manual
// 输入 archive · /chat 入口 fallback "configure LLM key in settings" prompt.

const KEY_API_KEY = "kimi-llm-api-key";
const KEY_ENDPOINT = "kimi-llm-endpoint";
const KEY_MODEL = "kimi-llm-model";
const KEY_BACKEND_MODE = "kimi-llm-backend-mode";
const KEY_API_FORMAT = "kimi-llm-api-format";

const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

// Backend mode: "api" = remote API (OpenAI/Anthropic/etc), "claude-code" = local CLI
export type BackendMode = "api" | "claude-code";

// API format: "openai" = OpenAI-compatible (most relay/proxy services), "anthropic" = native Anthropic
export type ApiFormat = "openai" | "anthropic";

function readLS(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeLS(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    const t = value.trim();
    if (!t) localStorage.removeItem(key);
    else localStorage.setItem(key, t);
  } catch {}
}

export type LLMConfig = {
  apiKey: string;
  endpoint: string;
  model: string;
  apiFormat: ApiFormat;
};

export function getLLMConfig(): LLMConfig {
  return {
    apiKey: readLS(KEY_API_KEY),
    endpoint: readLS(KEY_ENDPOINT) || DEFAULT_ENDPOINT,
    model: readLS(KEY_MODEL) || DEFAULT_MODEL,
    apiFormat: getApiFormat(),
  };
}

export function getBackendMode(): BackendMode {
  return (readLS(KEY_BACKEND_MODE) as BackendMode) || "api";
}

export function setBackendMode(mode: BackendMode): void {
  writeLS(KEY_BACKEND_MODE, mode);
}

export function getApiFormat(): ApiFormat {
  return (readLS(KEY_API_FORMAT) as ApiFormat) || "openai";
}

export function setApiFormat(format: ApiFormat): void {
  writeLS(KEY_API_FORMAT, format);
}

export function setLLMConfig(c: Partial<LLMConfig>): void {
  if (c.apiKey !== undefined) writeLS(KEY_API_KEY, c.apiKey);
  if (c.endpoint !== undefined) writeLS(KEY_ENDPOINT, c.endpoint);
  if (c.model !== undefined) writeLS(KEY_MODEL, c.model);
  if (c.apiFormat !== undefined) writeLS(KEY_API_FORMAT, c.apiFormat);
}

export function isLLMConfigured(): boolean {
  if (getBackendMode() === "claude-code") return true; // CLI mode needs no API key
  return !!getLLMConfig().apiKey;
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

export type ChatResult = {
  text: string;
  raw?: unknown;
};

export async function llmChat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<ChatResult> {
  // --- Claude Code (local CLI) mode ---
  if (getBackendMode() === "claude-code") {
    return llmChatViaClaudeCode(messages, opts);
  }

  // --- Remote API mode ---
  const cfg = getLLMConfig();
  if (!cfg.apiKey) {
    throw new Error(
      "LLM API key not configured. Open settings → fill API key.",
    );
  }
  const body = {
    model: cfg.model,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1024,
    stream: false,
  };
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-LLM-Endpoint": cfg.endpoint,
      "X-LLM-ApiKey": cfg.apiKey,
      "X-LLM-Format": cfg.apiFormat,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LLM request failed (${res.status}): ${errText.slice(0, 200)}`);
  }
  // Support both OpenAI and Anthropic response formats
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    content?: { type?: string; text?: string }[];
  };
  const text = data.choices?.[0]?.message?.content ??
    data.content?.find((c) => c.type === "text")?.text ?? "";
  return { text, raw: data };
}

const BRIDGE_PORT_KEY = "kimi-bridge-port";
const DEFAULT_BRIDGE_PORT = "3928";

export function getBridgePort(): string {
  return readLS(BRIDGE_PORT_KEY) || DEFAULT_BRIDGE_PORT;
}

export function setBridgePort(port: string): void {
  writeLS(BRIDGE_PORT_KEY, port);
}

// Claude Code CLI backend — no API key needed, uses local subscription
// When running on localhost (npm run dev), calls /api/claude-code (server route)
// When on Netlify, calls localhost bridge (http://localhost:3928/ask)
async function llmChatViaClaudeCode(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<ChatResult> {
  // Extract system messages as separate systemPrompt
  const systemParts: string[] = [];
  const conversationParts: string[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      systemParts.push(m.content);
    } else if (m.role === "user") {
      conversationParts.push(`[User]: ${m.content}`);
    } else if (m.role === "assistant") {
      conversationParts.push(`[Assistant]: ${m.content}`);
    }
  }
  const systemPrompt = systemParts.length > 0 ? systemParts.join("\n\n") : undefined;
  const prompt = conversationParts.join("\n\n");

  const isLocalNextDev = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const url = isLocalNextDev
    ? "/api/claude-code"               // local: use Next.js server route
    : `http://localhost:${getBridgePort()}/ask`;  // Netlify: use bridge

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      systemPrompt,
      maxTurns: 1,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude Code request failed (${res.status}): ${errText.slice(0, 300)}`);
  }
  const data = (await res.json()) as { text?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return { text: data.text ?? "" };
}

// Convenience · single-shot prompt → text (system + user message format).
export async function llmGenerate(
  prompt: string,
  system?: string,
  opts?: ChatOptions,
): Promise<string> {
  const messages: ChatMessage[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  const r = await llmChat(messages, opts);
  return r.text;
}

// V2 vision · 老婆 0518 disc auto-parse screenshot. OpenAI vision format ·
// 兼容 gpt-4o / claude-3.5-sonnet (via Anthropic OpenAI-compat proxy) /
// deepseek-vl / 等. 不支持 vision 的 endpoint 会 400 — 调用方 catch fallback.
export async function llmGenerateWithImage(
  prompt: string,
  imageDataUrl: string,
  system?: string,
  opts?: ChatOptions,
): Promise<string> {
  // --- Claude Code (local CLI) mode for vision ---
  if (getBackendMode() === "claude-code") {
    // Claude Code CLI supports vision via prompt — describe the image in text
    // Note: CLI mode has limited vision support, falls back to text-only
    const visionPrompt = `${prompt}\n\n[Note: Image attached but Claude Code CLI mode has limited vision support. Using text-only mode.]`;
    const r = await llmChat(
      [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: visionPrompt },
      ],
      opts,
    );
    return r.text;
  }

  // --- Remote API mode ---
  const cfg = getLLMConfig();
  if (!cfg.apiKey) {
    throw new Error("LLM API key not configured. Open settings.");
  }
  const userContent = [
    { type: "text" as const, text: prompt },
    { type: "image_url" as const, image_url: { url: imageDataUrl } },
  ];
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: userContent });
  const body = {
    model: cfg.model,
    messages,
    temperature: opts?.temperature ?? 0.3,
    max_tokens: opts?.maxTokens ?? 2048,
    stream: false,
  };
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-LLM-Endpoint": cfg.endpoint,
      "X-LLM-ApiKey": cfg.apiKey,
      "X-LLM-Format": cfg.apiFormat,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`vision request failed (${res.status}): ${errText.slice(0, 200)}`);
  }
  // Support both OpenAI and Anthropic response formats
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    content?: { type?: string; text?: string }[];
  };
  return data.choices?.[0]?.message?.content ??
    data.content?.find((c) => c.type === "text")?.text ?? "";
}

// Friendly Chinese message for LLM errors. Maps common patterns:
//   401 / unauthorized        → API key 错
//   429 / rate                → 太频繁
//   context_length_exceeded   → 上下文太长 (SP / memory inject / 历史 chat 总和爆 context window)
//   network / fetch failed    → 网络问题
//   not configured            → 没填 LLM key
// fallback: raw error msg
export function friendlyLLMError(err: unknown): {
  title: string;
  detail: string;
  hint: string;
} {
  const raw = (err as Error)?.message ?? String(err);
  const m = raw.toLowerCase();

  if (m.includes("not configured")) {
    return {
      title: "LLM 没配",
      detail: "API key 还没填.",
      hint: "去 /settings 填 endpoint + key + model",
    };
  }
  if (m.includes("(401)") || m.includes("unauthorized") || m.includes("invalid_api_key")) {
    return {
      title: "API key 不对",
      detail: "endpoint 拒了 · 401 unauthorized.",
      hint: "去 /settings 检查 API key + endpoint 是否匹配",
    };
  }
  if (m.includes("(429)") || m.includes("rate") || m.includes("quota")) {
    return {
      title: "太频繁了",
      detail: "endpoint rate limit 或 quota 用完.",
      hint: "等几分钟再试 · 或换 model · 或检查 billing",
    };
  }
  if (m.includes("context_length") || m.includes("context length") || m.includes("too long")) {
    return {
      title: "上下文太长",
      detail: "SP + memory + chat 历史 总和超过 model context window.",
      hint: "缩短 /backstage/settings 的 SP · 关 memory inject · 或新开窗口",
    };
  }
  if (m.includes("(400)") || m.includes("bad request")) {
    return {
      title: "请求格式错",
      detail: raw.slice(0, 200),
      hint: "检查 model 名字 (例: gpt-4o-mini, claude-3-5-sonnet-20241022) · 或 endpoint URL",
    };
  }
  if (m.includes("(404)") || m.includes("not found")) {
    return {
      title: "endpoint 找不到",
      detail: "model 名字写错 · 或 endpoint URL 写错.",
      hint: "检查 /settings · OpenAI 用 https://api.openai.com/v1/chat/completions",
    };
  }
  if (m.includes("(500)") || m.includes("(502)") || m.includes("(503)") || m.includes("server")) {
    return {
      title: "服务端挂了",
      detail: "endpoint 5xx · 不是你的问题.",
      hint: "等几分钟 · 或换 provider",
    };
  }
  if (m.includes("fetch") || m.includes("network") || m.includes("failed to fetch")) {
    return {
      title: "网络问题",
      detail: "请求没发出去.",
      hint: "检查 endpoint URL · 网络 · CORS (浏览器开发者工具看 console)",
    };
  }
  return {
    title: "出错了",
    detail: raw.slice(0, 200),
    hint: "检查 /settings 配置 · 或 console 看完整 error",
  };
}
