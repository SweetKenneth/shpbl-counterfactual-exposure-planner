import { createHash } from "node:crypto";
function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = normalize(v);
    }
    return out;
  }
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error("E_CANONICAL: non-finite number");
  if (value === undefined) return null;
  return value;
}
export function canonical(value: unknown): string { return JSON.stringify(normalize(value)); }
export function sha256(value: unknown): string { return createHash("sha256").update(canonical(value)).digest("hex"); }
export function round(n: number, places = 6): number { if (!Number.isFinite(n)) throw new Error("E_NUMBER: non-finite value"); const p = 10 ** places; return Math.round((n + Number.EPSILON) * p) / p; }
