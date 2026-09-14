import type { ExposureGraph, Asset, Finding } from "./types.js";
export function validateGraph(g: ExposureGraph): void {
  if (!g || typeof g !== "object" || !Array.isArray(g.assets) || !Array.isArray(g.findings) || !Array.isArray(g.edges)) throw new Error("E_GRAPH: assets/findings/edges arrays required");
  const assets = new Set<string>();
  for (const a of g.assets) {
    if (!a.id?.trim() || assets.has(a.id)) throw new Error(`E_GRAPH: duplicate/empty asset ${a.id}`);
    if (!Number.isFinite(a.criticality) || a.criticality < 0 || a.criticality > 10) throw new Error(`E_GRAPH: criticality ${a.id}`);
    if (typeof a.internetExposed !== "boolean") throw new Error(`E_GRAPH: internetExposed ${a.id}`);
    if (!Array.isArray(a.tags) || a.tags.some((t) => typeof t !== "string" || !t.trim())) throw new Error(`E_GRAPH: tags ${a.id}`);
    assets.add(a.id);
  }
  const findings = new Set<string>();
  for (const f of g.findings) {
    if (!f.id?.trim() || findings.has(f.id)) throw new Error(`E_GRAPH: duplicate/empty finding ${f.id}`);
    if (!assets.has(f.assetId)) throw new Error(`E_GRAPH: unknown finding asset ${f.assetId}`);
    if (!Number.isFinite(f.severity) || !Number.isFinite(f.exploitability) || f.severity < 0 || f.severity > 10 || f.exploitability < 0 || f.exploitability > 1) throw new Error(`E_GRAPH: finding range ${f.id}`);
    if (f.status !== "open" && f.status !== "closed") throw new Error(`E_GRAPH: finding status ${f.id}`);
    findings.add(f.id);
  }
  for (const e of g.edges) {
    if (!assets.has(e.from) || !assets.has(e.to)) throw new Error(`E_GRAPH: unknown edge ${e.from}->${e.to}`);
  }
}
export function cloneGraph(g: ExposureGraph): ExposureGraph { return { assets: g.assets.map((a) => ({ ...a, tags: [...a.tags] })), findings: g.findings.map((f) => ({ ...f })), edges: g.edges.map((e) => ({ ...e })) }; }
export function assetMap(g: ExposureGraph): Map<string, Asset> { return new Map(g.assets.map((a) => [a.id, a])); }
export function findingMap(g: ExposureGraph): Map<string, Finding> { return new Map(g.findings.map((f) => [f.id, f])); }
export function reachableAssets(g: ExposureGraph): Set<string> {
  const byFrom = new Map<string, string[]>(); for (const e of g.edges) { const arr = byFrom.get(e.from) ?? []; arr.push(e.to); byFrom.set(e.from, arr); }
  const seen = new Set<string>(); const queue = g.assets.filter((a) => a.internetExposed).map((a) => a.id).sort();
  while (queue.length) { const id = queue.shift()!; if (seen.has(id)) continue; seen.add(id); for (const n of (byFrom.get(id) ?? []).slice().sort()) if (!seen.has(n)) queue.push(n); }
  return seen;
}
