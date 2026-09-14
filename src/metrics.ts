import type { ExposureGraph, Metrics } from "./types.js";
import { reachableAssets } from "./graph.js";
import { round } from "./canonical.js";
export function metrics(g:ExposureGraph, cost=0):Metrics {
  const reach=reachableAssets(g); const amap=new Map(g.assets.map(a=>[a.id,a]));
  let risk=0, criticalReachable=0, open=0;
  for(const f of g.findings){ if(f.status!=="open")continue; open++; const a=amap.get(f.assetId)!; const reachFactor=reach.has(a.id)?1:0.2; risk += f.severity*f.exploitability*(1+a.criticality/10)*reachFactor; if(reach.has(a.id)&&f.severity>=7)criticalReachable++; }
  return {weightedRisk:round(risk),reachableAttackSurface:reach.size,criticalReachableFindings:criticalReachable,openFindings:open,interventionCost:round(cost)};
}
