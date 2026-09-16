import { createHash } from 'node:crypto';

/**
 * Canonical JSON for args_hash: recursively sort object keys, then SHA-256.
 * Format: `sha256:<hex>` as in ACTION_CONTRACT_SPEC.md.
 */
export function canonicalizeJson(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('canonicalizeJson: non-finite numbers are not allowed');
    }
    // JSON.stringify preserves number literals without trailing zeros quirks for integers.
    return JSON.stringify(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJson(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(record[key])}`)
      .join(',')}}`;
  }
  throw new TypeError(`canonicalizeJson: unsupported type ${typeof value}`);
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** SHA-256 of canonical JSON args. Returns `sha256:<hex>`. */
export function argsHash(args: unknown): string {
  return `sha256:${sha256Hex(canonicalizeJson(args))}`;
}

/** Digest of an execute result for receipt.result_digest. */
export function resultDigest(result: unknown): string {
  return `sha256:${sha256Hex(canonicalizeJson(result ?? null))}`;
}

export function assertArgsHashMatch(expected: string, actualArgs: unknown): boolean {
  return expected === argsHash(actualArgs);
}
