import type { ExposureGraph, Intervention, Scenario, ScenarioResult, RankedScenario } from "./types.js";
import { cloneGraph, findingMap, assetMap, validateGraph } from "./graph.js";
import { metrics } from "./metrics.js";
import { sha256, round } from "./canonical.js";
function costOf(i: Intervention): number { const raw = i.cost ?? ({ PATCH_FINDING: 1, ISOLATE_ASSET: 2, REDUCE_EXPOSURE: 1.5, SET_CRITICALITY: 0.5 } as const)[i.kind]; if (!Number.isFinite(raw) || raw < 0) throw new Error("E_INPUT: intervention cost must be finite and non-negative"); return raw; }
export function applyIntervention(g: ExposureGraph, i: Intervention): void {
  if (!i || typeof i !== "object") throw new Error("E_INPUT: intervention required");
  const a = assetMap(g), f = findingMap(g);
  if (i.kind === "PATCH_FINDING") { const x = f.get(i.findingId); if (!x) throw new Error(`E_TARGET: finding ${i.findingId}`); x.status = "closed"; return; }
  if (i.kind === "ISOLATE_ASSET") { const x = a.get(i.assetId); if (!x) throw new Error(`E_TARGET: asset ${i.assetId}`); x.internetExposed = false; g.edges = g.edges.filter((e) => e.from !== x.id && e.to !== x.id); return; }
  if (i.kind === "REDUCE_EXPOSURE") { const x = a.get(i.assetId); if (!x) throw new Error(`E_TARGET: asset ${i.assetId}`); if (!Number.isFinite(i.factor) || i.factor < 0 || i.factor > 1) throw new Error("E_INPUT: factor must be 0..1"); for (const finding of g.findings) if (finding.assetId === x.id && finding.status === "open") finding.exploitability *= i.factor; return; }
  if (i.kind === "SET_CRITICALITY") { const x = a.get(i.assetId); if (!x) throw new Error(`E_TARGET: asset ${i.assetId}`); if (!Number.isFinite(i.criticality) || i.criticality < 0 || i.criticality > 10) throw new Error("E_INPUT: criticality must be 0..10"); x.criticality = i.criticality; return; }
  const _never: never = i; throw new Error(`E_INPUT: unsupported intervention ${( _never as any)?.kind}`);
}
export class CounterfactualExposurePlanner {
  private readonly base: ExposureGraph;
  constructor(graph: ExposureGraph) { validateGraph(graph); this.base = cloneGraph(graph); }
  baseline() { return { graphSeal: sha256(this.base), metrics: metrics(this.base) }; }
  simulate(s: Scenario): ScenarioResult {
    if (!s?.id?.trim()) throw new Error("E_INPUT: scenario id required"); if (!Array.isArray(s.interventions)) throw new Error("E_INPUT: scenario interventions must be an array");
    const g = cloneGraph(this.base); let cost = 0; for (const i of s.interventions) { applyIntervention(g, i); cost += costOf(i); } validateGraph(g);
    const b = metrics(this.base), r = metrics(g, cost);
    const delta = { riskReduction: round(b.weightedRisk - r.weightedRisk), surfaceReduction: b.reachableAttackSurface - r.reachableAttackSurface, criticalReduction: b.criticalReachableFindings - r.criticalReachableFindings, cost: round(cost) };
    const utility = round(delta.riskReduction + delta.surfaceReduction * 2 + delta.criticalReduction * 3 - cost * 0.25);
    const explanation = [`weighted risk ${b.weightedRisk} -> ${r.weightedRisk}`, `reachable surface ${b.reachableAttackSurface} -> ${r.reachableAttackSurface}`, `critical reachable findings ${b.criticalReachableFindings} -> ${r.criticalReachableFindings}`, `intervention cost ${round(cost)}`];
    return { scenarioId: s.id, graphSeal: sha256(this.base), scenarioSeal: sha256(s), baseline: b, result: r, delta, utility, explanation };
  }
  rank(scenarios: Scenario[]): RankedScenario[] {
    if (!Array.isArray(scenarios)) throw new Error("E_INPUT: scenarios must be an array"); const ids = new Set<string>();
    for (const s of scenarios) { if (!s?.id?.trim()) throw new Error("E_INPUT: scenario id required"); if (ids.has(s.id)) throw new Error(`E_INPUT: duplicate scenario id ${s.id}`); ids.add(s.id); }
    const results = scenarios.map((s) => this.simulate(s)); const pareto = new Set(results.filter((a) => !results.some((b) => b !== a && dominates(b, a))).map((x) => x.scenarioId));
    return results.sort((a, b) => b.utility - a.utility || b.delta.riskReduction - a.delta.riskReduction || a.scenarioId.localeCompare(b.scenarioId)).map((r, i) => ({ ...r, rank: i + 1, pareto: pareto.has(r.scenarioId) }));
  }
}
function dominates(a: ScenarioResult, b: ScenarioResult): boolean { const atLeast = a.delta.riskReduction >= b.delta.riskReduction && a.delta.surfaceReduction >= b.delta.surfaceReduction && a.delta.criticalReduction >= b.delta.criticalReduction && a.delta.cost <= b.delta.cost; const strict = a.delta.riskReduction > b.delta.riskReduction || a.delta.surfaceReduction > b.delta.surfaceReduction || a.delta.criticalReduction > b.delta.criticalReduction || a.delta.cost < b.delta.cost; return atLeast && strict; }
