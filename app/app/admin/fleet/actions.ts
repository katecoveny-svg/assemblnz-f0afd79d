'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdminRole } from '@/lib/admin/ensureAdminRole';
import { FLEET_AGENT_SLUGS_BY_KETE } from '@/lib/agents';
import type { KeteSlug } from '@/lib/kete';
import { getServiceClient } from '@/lib/supabase/service';

const KETE_SLUGS = new Set(Object.keys(FLEET_AGENT_SLUGS_BY_KETE));

export async function activateKeteAction(formData: FormData) {
  await ensureAdminRole('/app/admin/fleet');

  const tenantId = String(formData.get('tenantId') ?? '');
  const keteSlug = String(formData.get('keteSlug') ?? '') as KeteSlug;
  if (!tenantId || !KETE_SLUGS.has(keteSlug)) return;

  const agentSlugs = FLEET_AGENT_SLUGS_BY_KETE[keteSlug];
  const service = getServiceClient();

  await service.from('agent_access').upsert(
    agentSlugs.map((agentSlug) => ({
      tenant_id: tenantId,
      agent_code: agentSlug,
      pack_id: keteSlug,
      is_enabled: true,
    })),
    { onConflict: 'tenant_id,agent_code' },
  );

  revalidatePath('/app/admin/fleet');
}

export async function deactivateKeteAction(formData: FormData) {
  await ensureAdminRole('/app/admin/fleet');

  const tenantId = String(formData.get('tenantId') ?? '');
  const keteSlug = String(formData.get('keteSlug') ?? '') as KeteSlug;
  if (!tenantId || !KETE_SLUGS.has(keteSlug)) return;

  const service = getServiceClient();
  await service
    .from('agent_access')
    .update({ is_enabled: false })
    .eq('tenant_id', tenantId)
    .eq('pack_id', keteSlug)
    .in('agent_code', FLEET_AGENT_SLUGS_BY_KETE[keteSlug]);

  revalidatePath('/app/admin/fleet');
}
