import {
  computeVerifiedActionRate,
  type VarResult,
  type VarWindow,
} from '@/lib/do/action-contract';
import { getActionCloudStore } from './store';

export async function computeTenantVar(opts?: {
  tenantId?: string | null;
  windowDays?: VarWindow | 'all';
}): Promise<VarResult> {
  const store = getActionCloudStore();
  const runs = await store.listRuns(
    opts?.tenantId ? { tenantId: opts.tenantId } : undefined,
  );
  return computeVerifiedActionRate(
    runs.map((r) => ({
      reached_execute: r.reached_execute,
      verify_passed: Boolean(r.verify?.passed),
      receipt_issued: Boolean(r.receipt_id),
      executed_at: r.executed_at,
      tenant_id: r.tenant_id,
    })),
    {
      windowDays: opts?.windowDays ?? 7,
      tenantId: opts?.tenantId ?? null,
    },
  );
}
