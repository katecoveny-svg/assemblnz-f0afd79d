import { createHash } from 'node:crypto';

/** Canonical JSON stringify for stable args_hash (sorted keys). */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
}

export function hashArgs(args: Record<string, unknown>): string {
  const digest = createHash('sha256').update(canonicalJson(args)).digest('hex');
  return `sha256:${digest}`;
}

export function stubId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(16).slice(2, 14);
  return `${prefix}_${rand}`;
}
