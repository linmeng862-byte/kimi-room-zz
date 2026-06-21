import { NextRequest, NextResponse } from "next/server";

// Claude Code Agent SDK route — uses local Claude Code CLI subscription.
// No API key needed! The CLI handles auth via your local login.
//
// POST body: { prompt: string, systemPrompt?: string, maxTurns?: number }
// Returns: { text: string } — the assistant's text response

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { prompt?: string; systemPrompt?: string; maxTurns?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, systemPrompt, maxTurns } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  try {
    // Dynamically import the SDK — it's a native binary, may fail if not installed
    const { query } = await import("@anthropic-ai/claude-agent-sdk");

    // Build the full prompt: prepend system prompt if provided
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n---\n\n${prompt}`
      : prompt;

    const result = query({
      prompt: fullPrompt,
      options: {
        maxTurns: maxTurns ?? 1,
        permissionMode: "plan", // read-only — no file edits or commands
      },
    });

    // Collect all messages from the async iterator
    let text = "";
    for await (const message of result) {
      // SDK messages have different types — extract text from assistant messages
      if (message && typeof message === "object") {
        const msg = message as Record<string, unknown>;
        // result type messages contain the final answer
        if (msg.type === "result" && msg.result !== undefined) {
          const r = msg.result as Record<string, unknown>;
          if (r.type === "success" && typeof r.text === "string") {
            text = r.text;
          }
        }
        // Also capture partial assistant text during streaming
        if (msg.type === "assistant" && Array.isArray(msg.content)) {
          for (const block of msg.content as Record<string, unknown>[]) {
            if (block.type === "text" && typeof block.text === "string") {
              text += block.text;
            }
          }
        }
      }
    }

    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Common error: SDK binary not found
    if (msg.includes("not found") || msg.includes("ENOENT")) {
      return NextResponse.json(
        {
          error:
            "Claude Code CLI not found. Install it globally: npm install -g @anthropic-ai/claude-code",
        },
        { status: 503 },
      );
    }
    // Auth error
    if (msg.includes("auth") || msg.includes("login") || msg.includes("OAuth")) {
      return NextResponse.json(
        { error: "Claude Code not logged in. Run `claude` in terminal to authenticate." },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: msg.slice(0, 500) }, { status: 500 });
  }
}
