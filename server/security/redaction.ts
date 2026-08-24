import { createHash } from "node:crypto";
const protectedKey = /(authorization|cookie|secret|password|passphrase|token|credential|api[-_]?key|private[-_]?key|seed|mnemonic)/i;
const secretLike = /(Bearer\s+[A-Za-z0-9._~+\/-]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:sk|pk)_[A-Za-z0-9_-]{16,})/gi;
export function redactText(value: string): string { return value.replace(secretLike, "[REDACTED_SECRET]"); }
export function redactProtectedData(value: unknown, depth = 0): unknown {
  if (depth > 12) return "[REDACTED_DEPTH_LIMIT]";
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.map((item) => redactProtectedData(item, depth + 1));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, protectedKey.test(key) ? "[REDACTED_REFERENCE_ONLY]" : redactProtectedData(item, depth + 1)]));
  return value;
}
export function stableStringify(value: unknown): string { return JSON.stringify(value, (_key, item) => item && typeof item === "object" && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item); }
export function sha256(value: string): string { return createHash("sha256").update(value).digest("hex"); }
