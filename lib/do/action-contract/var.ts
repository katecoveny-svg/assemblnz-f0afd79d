/**
 * Verified Action Rate (VAR) — north-star reliability metric for DO.
 *
 * VAR = (actions with verify passed AND receipt issued)
 *     / (actions that reached execute)
 *
 * Dry-runs and discover/inspect-only are excluded (they never reach execute).
 * Failed verify counts in the denominator only.
 *
 * @see docs/do-action-cloud/ACTION_CONTRACT_SPEC.md §5
 */

export type VarRunInput = {
  /** True when the run reached the execute stage at least once. */
  reached_execute: boolean;
  verify_passed: boolean;
  receipt_issued: boolean;
  /** ISO timestamp used for rolling windows. */
  executed_at?: string | null;
  tenant_id?: string | null;
};

export type VarWindow = 7 | 30;

export type VarResult = {
  var: number | null;
  numerator: number;
  denominator: number;
  window_days: VarWindow | 'all';
  tenant_id: string | null;
  computed_at: string;
};

function withinWindow(iso: string | null | undefined, days: VarWindow, now: Date): boolean {
  if (!iso) return true;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return t >= cutoff;
}

export function computeVerifiedActionRate(
  runs: VarRunInput[],
  opts?: {
    windowDays?: VarWindow | 'all';
    tenantId?: string | null;
    now?: Date;
  },
): VarResult {
  const windowDays = opts?.windowDays ?? 'all';
  const tenantId = opts?.tenantId ?? null;
  const now = opts?.now ?? new Date();

  const filtered = runs.filter((run) => {
    if (!run.reached_execute) return false;
    if (tenantId && run.tenant_id !== tenantId) return false;
    if (windowDays !== 'all' && !withinWindow(run.executed_at, windowDays, now)) {
      return false;
    }
    return true;
  });

  const denominator = filtered.length;
  const numerator = filtered.filter((r) => r.verify_passed && r.receipt_issued).length;

  return {
    var: denominator === 0 ? null : numerator / denominator,
    numerator,
    denominator,
    window_days: windowDays,
    tenant_id: tenantId,
    computed_at: now.toISOString(),
  };
}
