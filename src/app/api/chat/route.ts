import { NextRequest, NextResponse } from "next/server";

// LLM proxy route — avoids browser CORS by proxying through Next.js API.
// Client sends the real endpoint + key in custom headers;
// this route forwards to the actual LLM API (OpenAI or Anthropic format).

const ANTROPIC_VERSION = "2023-06-01";

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string | unknown[];
};
type AnthropicMessage = { role: "user" | "assistant"; content: string };

function isOpenAI(endpoint: string): boolean {
  // Anthropic endpoints contain "anthropic"
  const u = endpoint.toLowerCase();
  if (u.includes("anthropic")) return false;
  return true; // default OpenAI-compatible
}

function convertToAnthropic(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const messages = (body.messages as OpenAIMessage[]) ?? [];
  const systemParts: string[] = [];
  const converted: AnthropicMessage[] = [];

  for (const m of messages) {
    if (m.role === "system") {
      const text =
        typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      systemParts.push(text);
    } else {
      const text =
        typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      converted.push({ role: m.role as "user" | "assistant", content: text });
    }
  }

  const result: Record<string, unknown> = {
    model: body.model,
    messages: converted,
    max_tokens: body.max_tokens ?? 1024,
  };
  if (body.temperature !== undefined) result.temperature = body.temperature;
  if (systemParts.length > 0) result.system = systemParts.join("\n\n");
  return result;
}

export async function POST(req: NextRequest) {
  const endpoint = req.headers.get("X-LLM-Endpoint");
  const apiKey = req.headers.get("X-LLM-ApiKey");

  if (!endpoint || !apiKey) {
    return NextResponse.json(
      { error: "Missing X-LLM-Endpoint or X-LLM-ApiKey header" },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const isOAIFmt = isOpenAI(endpoint);
  const forwardBody = isOAIFmt ? body : convertToAnthropic(body);

  // Build headers for the upstream API
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isOAIFmt) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  } else {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = ANTROPIC_VERSION;
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(forwardBody),
    });

    // Pipe the upstream response back verbatim
    const contentType = upstream.headers.get("content-type") ?? "application/json";
    const buf = await upstream.arrayBuffer();

    return new NextResponse(buf, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "Content-Type, X-LLM-Endpoint, X-LLM-ApiKey",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upstream fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

// Preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, X-LLM-Endpoint, X-LLM-ApiKey",
    },
  });
}
