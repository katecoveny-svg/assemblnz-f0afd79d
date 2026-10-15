import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { LeaseError, type Ledger, type LeaseStore } from './service';
/** Service-only CAS ledger. Missing table/RPC is unavailable; no memory fallback. */
export function durableVoiceLeaseStore(): LeaseStore {
  return { async transact<T>(owner: string, change: (ledger: Ledger) => T): Promise<T> {
    const db = getServiceClient();
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, error } = await db.from('do_voice_lease_ledgers').select('version,state').eq('owner_id', owner).maybeSingle();
      if (error) throw new LeaseError('lease_store_unavailable', 503);
      const state = structuredClone((data?.state ?? { quotes: [], leases: [] }) as Ledger);
      if (!Array.isArray(state.quotes) || !Array.isArray(state.leases)) throw new LeaseError('lease_store_unavailable', 503);
      const result = change(state);
      const write = await db.rpc('cas_do_voice_lease_ledger', { p_owner: owner, p_version: data?.version ?? 0, p_state: state });
      if (write.error) throw new LeaseError('lease_store_unavailable', 503);
      if (write.data === true) return result;
    }
    throw new LeaseError('lease_conflict', 409);
  } };
}
