"use client";

import { isCoreBackend } from "./backend-mode";

// Browser-side helper for the "core" backend: call a kimi-core tool through the
// /api/core redirect (the server holds the key). kimi-core tools return
// agent-readable TEXT, not JSON — so these helpers deal in strings, meant for
// RAG injection into your chat prompt, not for reconstructing structured rows.
// In "local" mode every helper is a no-op. See docs/BACKENDS.md.

export async function callCoreTool(
  name: string,
  args: Record<string, unknown> = {},
): Promise<string> {
  const res = await fetch("/api/core", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, arguments: args }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `core tool ${name} failed (${res.status})`);
  }
  const data = (await res.json()) as { text?: string };
  return typeof data.text === "string" ? data.text : "";
}

// RAG: pull memory context from kimi-core to prepend to a chat turn. Uses the
// non-sensitive `memory_search_safe` tool (built for external callers). Returns
// "" in local mode or on any failure, so the chat degrades to BYO-only.
export async function fetchCoreMemoryContext(query: string): Promise<string> {
  if (!isCoreBackend() || !query.trim()) return "";
  try {
    return await callCoreTool("memory_search_safe", { query });
  } catch {
    return "";
  }
}

// Best-effort: persist a memory back to kimi-core. No-op in local mode.
export async function persistCoreMemory(key: string, content: string): Promise<void> {
  if (!isCoreBackend() || !content.trim()) return;
  try {
    await callCoreTool("memory_write", { key, content });
  } catch {
    /* best-effort — never block the chat on a write */
  }
}
