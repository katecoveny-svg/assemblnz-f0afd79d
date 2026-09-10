/**
 * Shared types for founder password bootstrap (safe for client imports).
 */

export type BootstrapPasswordResult =
  | { ok: true; created: boolean }
  | { ok: false; error: string };

export const BOOTSTRAP_SECRET_ENV = 'OPERATOR_BOOTSTRAP_SECRET';
export const BOOTSTRAP_MIN_PASSWORD = 10;
