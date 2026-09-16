import type { ToolEnvironment } from './types';

/** Keys that start with `test_` always run in sandbox — never hit live upstreams. */
export function isSandboxKey(rawKey: string): boolean {
  return rawKey.trim().toLowerCase().startsWith('test_');
}

export function detectEnvironment(rawKey: string): ToolEnvironment {
  return isSandboxKey(rawKey) ? 'sandbox' : 'live';
}

export function keyPrefixForDisplay(rawKey: string): string {
  const trimmed = rawKey.trim();
  if (trimmed.length <= 12) return `${trimmed.slice(0, 4)}…`;
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}`;
}
