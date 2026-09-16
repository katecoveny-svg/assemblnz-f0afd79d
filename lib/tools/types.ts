/**
 * Shared types for assembl agent-paid tool endpoints.
 *
 * Product shape: URL + code + agent docs. One job. Clear I/O.
 * Every request needs an API key. Daily spend cap. Receipt per success.
 */

export type ToolEnvironment = 'sandbox' | 'live';

export type ToolKeyRecord = {
  id: string;
  /** sha256 hex of the raw key — never store the raw secret */
  keyHash: string;
  /** Prefix retained for display (e.g. test_abc… / live_xyz…) */
  keyPrefix: string;
  label: string;
  environment: ToolEnvironment;
  dailyCapCents: number;
  unitCostCents: number;
  createdAt: string;
  revokedAt: string | null;
};

export type ToolSpendDay = {
  keyId: string;
  day: string; // YYYY-MM-DD UTC
  spentCents: number;
  callCount: number;
};

export type ToolReceipt = {
  id: string;
  keyId: string;
  toolSlug: string;
  environment: ToolEnvironment;
  status: 'ok' | 'partial' | 'not_found' | 'error';
  unitCostCents: number;
  requestSummary: Record<string, unknown>;
  responseSummary: Record<string, unknown>;
  createdAt: string;
};

export type ToolErrorCode =
  | 'missing_api_key'
  | 'invalid_api_key'
  | 'key_revoked'
  | 'daily_cap_exceeded'
  | 'invalid_json'
  | 'validation_error'
  | 'method_not_allowed'
  | 'upstream_unconfigured'
  | 'upstream_failure'
  | 'not_found';

export type ToolErrorBody = {
  error: {
    code: ToolErrorCode;
    message: string;
    fix: string;
    details?: unknown;
  };
};
