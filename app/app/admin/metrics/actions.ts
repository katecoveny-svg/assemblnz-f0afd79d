'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { refreshKpiSnapshot } from '@/lib/evidence/kpis';

export async function refreshKpiAction(): Promise<{
  ok: boolean;
  computed_at?: string;
  reason?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not authenticated' };

  const result = await refreshKpiSnapshot();
  if (result.ok) revalidatePath('/app/admin/metrics');
  return result;
}
