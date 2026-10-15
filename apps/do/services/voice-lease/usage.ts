import 'server-only';
import { LeaseError, type LeaseStore } from './service';
export type VerifiedUsage = { owner: string; leaseId: string; receiptId: string; inputTokens: number; outputTokens: number };
/** Only a server-owned adapter verifying provider exports or observing its own
 * provider socket may implement this. Browser usageMetadata is NOT this source. */
export interface TrustedUsageSource { verify(rawReceipt: unknown): Promise<VerifiedUsage> }
export async function recordTrustedVoiceUsage(store: LeaseStore, source: TrustedUsageSource, rawReceipt: unknown) {
  const r = await source.verify(rawReceipt);
  if (!r.owner || !r.leaseId || !r.receiptId || r.receiptId.length > 200 ||
    ![r.inputTokens, r.outputTokens].every(n => Number.isSafeInteger(n) && n >= 0)) throw new LeaseError('invalid_usage', 400);
  return store.transact(r.owner, state => {
    const lease = state.leases.find(l => l.id === r.leaseId);
    if (!lease) throw new LeaseError('lease_unavailable', 404);
    const previous = Object.hasOwn(lease.usage, r.receiptId) ? lease.usage[r.receiptId] : undefined;
    if (previous) {
      if (previous.inputTokens !== r.inputTokens || previous.outputTokens !== r.outputTokens) throw new LeaseError('usage_conflict');
      return { recorded: false };
    }
    if (Object.keys(lease.usage).length >= 256) throw new LeaseError('usage_reconciliation_required', 503);
    Object.defineProperty(lease.usage, r.receiptId, { value: { inputTokens: r.inputTokens, outputTokens: r.outputTokens }, enumerable: true, writable: true, configurable: true });
    return { recorded: true };
  });
}
