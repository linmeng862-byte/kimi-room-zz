#!/usr/bin/env node
// kimi-room Bridge — 本地 Claude Code CLI 桥接服务
//
// 用法:
//   1. 先安装 Claude Code:   npm install -g @anthropic-ai/claude-code
//   2. 登录:                  claude  (按提示 OAuth)
//   3. 启动桥接:              node bridge.mjs
//   4. 打开 Netlify 部署的前端 → 设置 → 选 "Claude Code (本地)"
//
// 桥接在 localhost:3928 监听，前端从浏览器直接调你本地 CLI，
// 不走任何云服务，不需要 API Key，走你的 Claude Code 订阅。

import { createServer } from "http";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const PORT = parseInt(process.env.BRIDGE_PORT || "3928", 10);
const ALLOWED_ORIGINS = [
  "https://kimi-room-zz.netlify.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

// ── helpers ──────────────────────────────────────────────────────────
function corsHeaders(origin) {
  const hdr = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o) || origin === o)) {
    hdr["Access-Control-Allow-Origin"] = origin;
  } else if (origin) {
    // Allow any localhost for development
    try {
      const u = new URL(origin);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        hdr["Access-Control-Allow-Origin"] = origin;
      }
    } catch {}
  }
  return hdr;
}

function json(res, code, body, extraHeaders = {}) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

// ── Claude Code call ────────────────────────────────────────────────
async function callClaudeCode(prompt, systemPrompt) {
  // Try SDK first (more reliable, streaming support)
  try {
    const { query } = await import("@anthropic-ai/claude-agent-sdk");
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;

    const result = query({
      prompt: fullPrompt,
      options: {
        maxTurns: 1,
        permissionMode: "plan",
      },
    });

    let text = "";
    for await (const message of result) {
      if (message && typeof message === "object") {
        const msg = message;
        if (msg.type === "result" && msg.result) {
          const r = msg.result;
          if (r.type === "success" && typeof r.text === "string") {
            text = r.text;
          }
        }
        if (msg.type === "assistant" && Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === "text" && typeof block.text === "string") {
              text += block.text;
            }
          }
        }
      }
    }
    return { text };
  } catch (sdkErr) {
    // SDK failed — fall back to `claude -p` CLI
    console.log("[bridge] SDK failed, falling back to `claude -p`: " + sdkErr.message);
  }

  // Fallback: claude -p
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;
  try {
    const { stdout } = await execFileAsync("claude", ["-p", fullPrompt, "--output-format", "text"], {
      timeout: 120_000,
      maxBuffer: 5 * 1024 * 1024,
      shell: true,
    });
    return { text: stdout.trim() };
  } catch (cliErr) {
    throw new Error(`claude -p failed: ${cliErr.message}`);
  }
}

// ── Health check ────────────────────────────────────────────────────
async function checkClaudeAvailable() {
  try {
    const { stdout } = await execFileAsync("claude", ["--version"], {
      timeout: 10_000,
      shell: true,
    });
    return { available: true, version: stdout.trim() };
  } catch {
    return { available: false, version: null };
  }
}

// ── Server ──────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  const origin = req.headers.origin || "";

  // CORS preflight
  if (req.method === "OPTIONS") {
    json(res, 204, null, corsHeaders(origin));
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    const status = await checkClaudeAvailable();
    json(res, 200, { bridge: "ok", ...status }, corsHeaders(origin));
    return;
  }

  // Main endpoint: POST /ask
  if (req.method === "POST" && req.url === "/ask") {
    let body;
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      json(res, 400, { error: "Invalid JSON" }, corsHeaders(origin));
      return;
    }

    const { prompt, systemPrompt } = body;
    if (!prompt?.trim()) {
      json(res, 400, { error: "Missing prompt" }, corsHeaders(origin));
      return;
    }

    try {
      const result = await callClaudeCode(prompt, systemPrompt);
      json(res, 200, { text: result.text }, corsHeaders(origin));
    } catch (err) {
      const msg = err.message || "Unknown error";
      console.error("[bridge] Error:", msg);
      json(res, 500, { error: msg.slice(0, 500) }, corsHeaders(origin));
    }
    return;
  }

  // 404
  json(res, 404, { error: "Not found" }, corsHeaders(origin));
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🌹 kimi-room Claude Code Bridge                        ║
║                                                          ║
║  桥接地址:  http://localhost:${PORT}                      ║
║  健康检查:  http://localhost:${PORT}/health                ║
║                                                          ║
║  前端设置 → 选 "Claude Code (本地)" → 自动调这个桥接    ║
║  不需要 API Key，走你的 Claude Code 订阅                ║
║                                                          ║
║  按 Ctrl+C 停止                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
