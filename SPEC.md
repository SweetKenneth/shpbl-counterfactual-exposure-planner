# Counterfactual Exposure Planner — governed behavior specification v0.1

## Purpose

A deterministic what-if engine that clones an exposure graph, applies alternative interventions, recomputes risk and reachable attack surface, and ranks futures before production is changed.

## Parentage

### Observed Navi behavior paths
- `navi/plugins/database.py`
- `navi/plugins/enrich.py`
- `navi/plugins/route_rules.py`
- `navi/plugins/scan.py`
- `navi/plugins/explore.py`

### SHPBL composition parents
- `primitive|ORACLE::runCounterfactual|a7c908568d731da0`
- `crown-jewel|ATLAS::simulateAttack|739ac2c63a42e751`
- `crown-jewel|MEDIC::calculateBlastRadius|8a6fe96444114a6c`
- `primitive|DEFENSE::getAttackSurface|cd2388dfc7941b61`
- `primitive|ORACLE::getRiskSnapshot|c251739cd35d5510`


## Novel composition

Navi supplies a concrete exposure-state domain; the selected SHPBL parents supply generic counterfactual, attack-surface, blast and risk concepts. The composition adds an immutable intervention model, deterministic metrics, scenario ranking and Pareto analysis so several futures can be compared before action.

## Required behavior

1. Validate and clone the baseline exposure graph; caller input is never mutated.
2. Support bounded scenario interventions: patch a finding, isolate an asset, reduce exposure probability, or vary criticality as an assumption.
3. Recompute weighted risk, reachable attack surface, critical reachable findings and intervention cost for every scenario.
4. Seal both baseline graph and scenario with SHA-256 canonical digests.
5. Rank scenarios deterministically by utility and stable tie-breaks.
6. Mark Pareto-efficient scenarios so an inferior scenario is not presented as equally attractive.
7. Unknown targets and invalid ranges fail closed.

## Invariants

- Deterministic output for identical canonical input.
- Invalid or unknown inputs fail closed; they are never silently coerced into an action.
- No network egress, filesystem mutation, or child-process execution exists in runtime source.
- The package never mutates the supplied Navi repository.
- The package contains zero literal Navi implementation bytes.
- Public release, canon admission and Tenable submission are outside this run's authority.

## Limitations

- The risk function is a transparent deterministic model, not a Tenable risk-score replica or claim of predictive truth.
- Edges and exploitability are caller-supplied; missing relationships affect reachable-surface results.
- Scenario cost defaults are simple normalized units unless the caller supplies explicit costs.
- This planner does not execute remediations.
