# Security boundary — Counterfactual Exposure Planner

This run-local package is designed to be deterministic and non-egressing. Its runtime source is statically scanned to refuse network APIs/modules, runtime filesystem APIs, child-process modules and common execution primitives.

The package does not contain credentials and does not contact Tenable, packetchaos, SHPBL services, or any other external system. The MCP adapter is stdio-only. Input must be treated as untrusted structured data; validation errors fail closed.

## Trust assumptions

- Caller-provided topology, risk, history, policies and receipts can be incomplete or false. The package proves behavior over supplied input; it does not attest that the input reflects reality.
- SHA-256 digests make local structured records tamper-evident when the chain/record is preserved, but this package does not provide an external timestamp or durable remote anchor.
- This package is not a substitute for authorization controls at the actual Tenable/SSH/scanner execution layer.

## Disclosure boundary

No Navi source code is copied. No private SHPBL body, proprietary constant, corpus path or provenance map is intentionally exposed in runtime source. This package is a public MIT release; the SHPBL capability corpus, harvested bodies and composition machinery remain outside it.

## Reporting

To report a vulnerability in this package, open a GitHub issue on this repository, or contact the author through https://shpbl.com. There is no embedded network, filesystem or process surface to exploit remotely; the highest-value reports are logic flaws that let a gate pass without its evidence.
