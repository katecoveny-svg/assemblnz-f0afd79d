import 'server-only';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';

type Owner = { id: string; externalId: string };
type Feature = 'memory' | 'conversations' | 'responsibilities';
export type PersistenceReadinessPorts = {
  enabled: (feature: Feature) => boolean;
  responsibilityReady: (owner: string, signal: AbortSignal) => Promise<boolean | null>;
};
const flags: Record<Feature, string> = {
  memory: 'DO_PERSONAL_MEMORY_ENABLED', conversations: 'DO_PERSONAL_CONVERSATIONS_ENABLED',
  responsibilities: 'DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED',
};
const ports: PersistenceReadinessPorts = {
  enabled: feature => process.env[flags[feature]] === 'true',
  responsibilityReady: async (owner, signal) => {
    // Existing SELECT-only readiness function. No content loader, purge, or write RPC.
    const { data, error } = await getServiceClient().rpc('do_personal_storage_ready', { p_owner: owner }).abortSignal(signal);
    return error || typeof data !== 'boolean' ? null : data;
  },
};

/** Authenticated owner only. Configuration is not a save/reopen or retention proof. */
export async function persistenceReadiness(owner: Owner, signal: AbortSignal, dependencies = ports) {
  if (!z.uuid().safeParse(owner.id).success || owner.externalId !== `do:user:${owner.id}`) throw new Error('owner_changed');
  signal.throwIfAborted();
  const configuredState = (feature: Feature) => dependencies.enabled(feature) ? 'configured_unverified' as const : 'activation_off' as const;
  let responsibilities: 'activation_off' | 'owner_ready' | 'owner_not_ready' | 'unavailable' = 'activation_off';
  if (dependencies.enabled('responsibilities')) {
    try {
      const ready = await dependencies.responsibilityReady(owner.id, signal);
      responsibilities = ready === true ? 'owner_ready' : ready === false ? 'owner_not_ready' : 'unavailable';
    } catch { responsibilities = 'unavailable'; }
  }
  signal.throwIfAborted();
  return {
    ownerId: owner.id, metadataOnly: true as const, contentRead: false as const, writesPerformed: false as const,
    saveReopenVerified: false as const, cleanupPerformed: false as const,
    memory: configuredState('memory'), conversations: configuredState('conversations'), responsibilities,
  };
}
