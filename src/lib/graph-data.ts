// Demo knowledge-graph for /room/graph.
//
// The canon build pulls this from Postgres — entity / memory / topic / observation
// nodes + a links table for edges + the most recent dream-walk activity. The
// open-source build ships a small *synthetic* graph so the concentric-ring
// constellation renders with zero backend. When you wire a backend (see
// docs/BACKENDS.md), swap loadGraphData() to query your store and keep the shape.

export type GraphNodeKind = "entity" | "memory" | "topic" | "observation";

export type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  label: string;
  subtype: string | null; // entityType / memoryType / domain
  weight: number; // 0..1 normalized prominence (drives node radius)
  valence: number | null; // memory only
};

export type GraphEdge = {
  fromId: string;
  toId: string;
  relationType: string; // similar | mentions | tagged | co_mentioned
  confidence: number;
};

export type GraphDream = {
  wakeAt: string | null;
  monologue: string | null;
  surfacedIds: string[]; // memories the dream surfaced
  linkedIds: string[]; // memories reached by walking one similar hop
} | null;

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  dream: GraphDream;
  counts: { entity: number; memory: number; topic: number; observation: number; edges: number };
};

// ── synthetic graph ─────────────────────────────────────────────────────────

const TOPICS: Array<[string, string]> = [
  ["t-system", "system"],
  ["t-reading", "reading"],
  ["t-work", "work"],
];

const ENTITIES: Array<[string, string, string]> = [
  ["e-ada", "Ada", "person"],
  ["e-lin", "Lin", "person"],
  ["e-cafe", "the corner cafe", "place"],
  ["e-atlas", "Atlas (the project)", "project"],
];

const MEMORIES: Array<[string, string, number]> = [
  ["m-1", "first walk by the river", 0.7],
  ["m-2", "the long debugging night", -0.3],
  ["m-3", "a poem left half-written", 0.4],
  ["m-4", "tea gone cold on the desk", -0.1],
  ["m-5", "the demo finally compiled", 0.8],
  ["m-6", "lost the train of thought", -0.4],
  ["m-7", "rain against the window", 0.5],
  ["m-8", "a name remembered at last", 0.6],
  ["m-9", "the argument about commas", -0.2],
  ["m-10", "morning light on the shelf", 0.3],
  ["m-11", "a book finished at 3am", 0.4],
  ["m-12", "the bridge in the old city", 0.6],
  ["m-13", "a question left unanswered", -0.1],
  ["m-14", "the chord that resolved", 0.7],
];

const OBSERVATIONS: Array<[string, string]> = [
  ["o-1", "writes best after midnight"],
  ["o-2", "keeps the good things for last"],
];

function buildNodes(): GraphNode[] {
  const nodes: GraphNode[] = [];
  for (const [id, label] of TOPICS) {
    nodes.push({ id, kind: "topic", label, subtype: "LOVE", weight: 0.9, valence: null });
  }
  ENTITIES.forEach(([id, label, sub], i) => {
    nodes.push({ id, kind: "entity", label, subtype: sub, weight: 0.55 + (i % 3) * 0.12, valence: null });
  });
  MEMORIES.forEach(([id, label, val], i) => {
    nodes.push({
      id,
      kind: "memory",
      label,
      subtype: "EPISODE",
      weight: 0.35 + ((i * 7) % 11) / 18,
      valence: val,
    });
  });
  for (const [id, label] of OBSERVATIONS) {
    nodes.push({ id, kind: "observation", label, subtype: "user", weight: 0.4, valence: null });
  }
  return nodes;
}

function buildEdges(): GraphEdge[] {
  const e: GraphEdge[] = [];
  const tag = (from: string, to: string) => e.push({ fromId: from, toId: to, relationType: "tagged", confidence: 0.8 });
  const mention = (from: string, to: string) => e.push({ fromId: from, toId: to, relationType: "mentions", confidence: 0.75 });
  const similar = (from: string, to: string, c = 0.7) => e.push({ fromId: from, toId: to, relationType: "similar", confidence: c });
  const co = (from: string, to: string) => e.push({ fromId: from, toId: to, relationType: "co_mentioned", confidence: 0.6 });

  // topic → memory (tagged)
  tag("t-system", "m-2"); tag("t-system", "m-5"); tag("t-system", "m-6"); tag("t-system", "m-9");
  tag("t-reading", "m-3"); tag("t-reading", "m-11"); tag("t-reading", "m-13");
  tag("t-work", "m-2"); tag("t-work", "m-5"); tag("t-work", "m-9");

  // entity → memory (mentions)
  mention("e-ada", "m-1"); mention("e-ada", "m-9"); mention("e-ada", "m-12");
  mention("e-lin", "m-7"); mention("e-lin", "m-8"); mention("e-lin", "m-14");
  mention("e-cafe", "m-4"); mention("e-cafe", "m-10");
  mention("e-atlas", "m-5"); mention("e-atlas", "m-6"); mention("e-atlas", "m-2");

  // entity ↔ entity (co_mentioned)
  co("e-ada", "e-lin"); co("e-ada", "e-atlas");

  // memory ↔ memory (similar)
  similar("m-1", "m-12", 0.72); similar("m-3", "m-11", 0.68); similar("m-3", "m-13", 0.62);
  similar("m-7", "m-10", 0.66); similar("m-2", "m-6", 0.7); similar("m-5", "m-14", 0.64);
  similar("m-8", "m-12", 0.58); similar("m-4", "m-7", 0.6);

  return e;
}

const NODES = buildNodes();
const EDGES = buildEdges();

const DEMO: GraphData = {
  nodes: NODES,
  edges: EDGES,
  dream: {
    wakeAt: null, // demo: no real wake timestamp
    monologue: "something about the bridge kept coming back",
    surfacedIds: ["m-12", "m-3"],
    linkedIds: ["m-1", "m-11"], // reached by one similar hop from the surfaced pair
  },
  counts: {
    entity: ENTITIES.length,
    memory: MEMORIES.length,
    topic: TOPICS.length,
    observation: OBSERVATIONS.length,
    edges: EDGES.length,
  },
};

export async function loadGraphData(): Promise<GraphData> {
  return DEMO;
}
