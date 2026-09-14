# Counterfactual Exposure Planner

**Compare several remediation futures against a sealed exposure graph before touching production.**

A deterministic what-if engine for exposure data: clones a sealed exposure graph, applies bounded interventions, recomputes weighted risk and reachable attack surface, then ranks the resulting futures and marks the Pareto-efficient ones before production changes.

It is an analysis and decision surface, not an actuator: it has no network client, touches no files, spawns no processes, and reads no environment variables.

## Why a practitioner would install this

- **"Patch this or isolate that?" gets a measured answer.** Both futures are computed against the same sealed baseline instead of argued.
- **Your input graph is never mutated.** Every scenario runs on a clone, so a planning session cannot corrupt the state of record.
- **Reachability, not just counts.** Scenarios are scored on weighted risk, reachable attack surface and critical reachable findings, plus their own cost.
- **Inferior options are labelled.** Pareto marking stops a scenario that is worse on every axis from being presented as a reasonable choice.
- **Rankings are reproducible.** Deterministic utility with stable tie-breaks means the same data ranks the same way in tomorrow's review.

## Behavioural contract

1. Validate and clone the baseline exposure graph; caller input is never mutated.
2. Support bounded interventions: patch a finding, isolate an asset, reduce exposure probability, or vary criticality as a stated assumption.
3. Recompute weighted risk, reachable attack surface, critical reachable findings and intervention cost for every scenario.
4. Seal both baseline graph and scenario with SHA-256 canonical digests.
5. Rank scenarios deterministically by utility with stable tie-breaks.
6. Mark Pareto-efficient scenarios so a dominated scenario is not presented as equally attractive.
7. Unknown targets and out-of-range values fail closed.

## Prerequisites

- Node.js 20 or newer (`node --version`). Zero runtime dependencies.
- An MCP client that speaks stdio (Claude Code, Claude Desktop, Cursor), or direct library use from TypeScript.
- No API key, account, network access or Tenable product is required.

## Install and run

```bash
git clone https://github.com/SweetKenneth/shpbl-counterfactual-exposure-planner.git
cd shpbl-counterfactual-exposure-planner
npm install      # devDependencies only: typescript
npm run build    # compiles to dist/
npm test         # 25 behavioural, boundary and fail-closed tests
npm start        # starts the MCP server on stdio
```

MCP client configuration:

```json
{
  "mcpServers": {
    "shpbl-counterfactual-exposure-planner": {
      "command": "node",
      "args": ["/absolute/path/to/shpbl-counterfactual-exposure-planner/dist/src/mcp-server.js"]
    }
  }
}
```

## Tools exposed

- `exposure_baseline` — Measure a sealed exposure graph without mutating it
- `exposure_simulate` — Simulate one intervention scenario against current exposure state
- `exposure_rank` — Rank multiple counterfactual scenarios deterministically and identify Pareto-efficient options

## What it outputs

Sealed baseline measurements, per-scenario risk/attack-surface/cost metrics with canonical digests, a deterministic ranking, and Pareto flags.

## Verification

Reproduce all of it from a clean clone with `npm run check`:

- Strict TypeScript compile and `--noEmit` typecheck: **PASS**
- Behavioural tests: **25/25 PASS**
- Randomised invariant hammer: **30,000 cases / 120,000 invariant checks PASS**
- Static scan for network, filesystem, process and dynamic-eval surfaces in `src/`: **PASS (0 findings)**
- Worked example runs end to end: **PASS**
- Runtime dependencies: **0**

## Known limitations

- Results describe the graph you supply; missing assets, edges or findings produce a confident answer about an incomplete world.
- No scanner or vendor API client is embedded and nothing is changed in production.
- Criticality variation is an explicit assumption, not a measurement.
- Cost is the caller's declared intervention cost, not an economic model.

## Provenance and lineage

This product exists because two things were put together, and both are credited.

**Upstream capability inspiration — [`packetchaos/navi`](https://github.com/packetchaos/navi)**, by Casey Reid (packetchaos), MIT licensed. Its observed behaviour was studied as a capability surface: what a practitioner in that domain actually needs to do. The exact paths and lines that were read are recorded in [`PROVENANCE.json`](./PROVENANCE.json). **No line of upstream implementation code is used in this package.** The upstream licence text is preserved under `THIRD_PARTY_NOTICES/` as provenance; it does not license this implementation.

**SHPBL capability library — [shpbl.com](https://shpbl.com).** SHPBL ([shpbl.com](https://shpbl.com)) is a governed library of reusable software capabilities and a method for composing them: it reads a target repository, identifies what capability it demonstrates, matches that against owned capability records, and writes new software where neither side had it before. The capability parents used here are listed by identifier in `PROVENANCE.json`. **No harvested capability body is embedded in this package.**

**The implementation in this repository was written fresh** from the approved capability contract for this run. The literal composition is 0% upstream code, 0% copied SHPBL capability bodies, 100% new implementation. That is an exact-line and byte-level statement about this source tree, not a legal opinion.

Author and copyright: **Kenneth E. Sweet Jr.**, MIT licensed.

Attribution does not imply endorsement by Casey Reid (packetchaos), Tenable, or any other party.

## Tenable status

Submitted to the Tenable CyberAgents Exchange for review. Submission does not imply review, approval, certification, validation, endorsement or acceptance by Tenable.

## Files

- `src/` — implementation and the stdio MCP server.
- `tests/` — behavioural, fail-closed and MCP integration tests.
- `scripts/` — randomised invariant hammer and the static security scan.
- `examples/worked-example.ts` — an end-to-end run you can execute.
- `SECURITY.md` — threat boundary and forbidden behaviour.
- `PROVENANCE.json` — upstream and SHPBL capability lineage.
- `MANIFEST.json` / `CHECKSUMS.sha256` — released file inventory and hashes.
- `LICENSE` — MIT.

## License

MIT © 2026 Kenneth E. Sweet Jr.. See [`LICENSE`](./LICENSE).
