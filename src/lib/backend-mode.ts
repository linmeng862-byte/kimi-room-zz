// Which backend the room talks to.
//
//   "local" (default) — self-contained, no backend. Storage is IndexedDB; chat
//     uses bring-your-own-credentials (an official subscription / any
//     OpenAI-compatible endpoint). No data leaves the device.
//
//   "core" — redirect memory to a running kimi-core (a structured memory engine;
//     the same architecture as the reference deployment). Generation still uses
//     the operator's own subscription/API; kimi-core supplies only retrieved
//     memory (RAG). The two are independent. See docs/BACKENDS.md.
//
// Set NEXT_PUBLIC_KIMI_BACKEND=core to opt in.

export type BackendMode = "local" | "core";

export function backendMode(): BackendMode {
  return process.env.NEXT_PUBLIC_KIMI_BACKEND === "core" ? "core" : "local";
}

export function isCoreBackend(): boolean {
  return backendMode() === "core";
}
