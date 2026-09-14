export interface Asset { id:string; criticality:number; internetExposed:boolean; tags:string[]; }
export interface Finding { id:string; assetId:string; severity:number; exploitability:number; status:"open"|"closed"; }
export interface Edge { from:string; to:string; }
export interface ExposureGraph { assets:Asset[]; findings:Finding[]; edges:Edge[]; }
export type Intervention =
  | { kind:"PATCH_FINDING"; findingId:string; cost?:number }
  | { kind:"ISOLATE_ASSET"; assetId:string; cost?:number }
  | { kind:"REDUCE_EXPOSURE"; assetId:string; factor:number; cost?:number }
  | { kind:"SET_CRITICALITY"; assetId:string; criticality:number; cost?:number };
export interface Scenario { id:string; interventions:Intervention[]; }
export interface Metrics {
  weightedRisk:number;
  reachableAttackSurface:number;
  criticalReachableFindings:number;
  openFindings:number;
  interventionCost:number;
}
export interface ScenarioResult {
  scenarioId:string;
  graphSeal:string;
  scenarioSeal:string;
  baseline:Metrics;
  result:Metrics;
  delta:{ riskReduction:number; surfaceReduction:number; criticalReduction:number; cost:number };
  utility:number;
  explanation:string[];
}
export interface RankedScenario extends ScenarioResult { rank:number; pareto:boolean; }
