'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createSetupIntent } from '@/lib/stripe/setup-intent';
import { captureApprovedPaymentIntent, cancelPaymentIntent } from '@/lib/stripe/manual-capture';

interface ActionResult {
  ok: boolean;
  reason?: string;
}

async function resolveTenant(slug: string): Promise<
  | { ok: true; tenantId: string; userId: string; tenantSlug: string; tenantName: string; email: string | null }
  | { ok: false; reason: string }
> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, reason: 'not authenticated' };

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { ok: false, reason: 'tenant not found' };
  const { id: tenantId, slug: tenantSlug, name: tenantName } = tenant as {
    id: string; slug: string; name: string;
  };

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (!membership) return { ok: false, reason: 'not a member of this tenant' };

  return {
    ok: true,
    tenantId,
    userId: userData.user.id,
    tenantSlug,
    tenantName,
    email: userData.user.email ?? null,
  };
}

export async function createSetupIntentAction(
  slug: string,
): Promise<
  | { ok: true; clientSecret: string; setupIntentId: string }
  | { ok: false; reason: string }
> {
  const resolved = await resolveTenant(slug);
  if (!resolved.ok) return resolved;

  try {
    const result = await createSetupIntent({
      tenantId: resolved.tenantId,
      tenantSlug: resolved.tenantSlug,
      tenantName: resolved.tenantName,
      contactEmail: resolved.email ?? undefined,
    });
    return { ok: true, clientSecret: result.clientSecret, setupIntentId: result.setupIntentId };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'setup intent failed' };
  }
}

export async function confirmAndCaptureAction(
  slug: string,
  stripePaymentIntentId: string,
): Promise<ActionResult> {
  const resolved = await resolveTenant(slug);
  if (!resolved.ok) return resolved;

  try {
    await captureApprovedPaymentIntent(stripePaymentIntentId, resolved.userId);
    revalidatePath(`/app/toro/${slug}/billing`);
    revalidatePath('/app/toro/inbox');
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'capture failed' };
  }
}

export async function cancelIntentAction(
  slug: string,
  stripePaymentIntentId: string,
): Promise<ActionResult> {
  const resolved = await resolveTenant(slug);
  if (!resolved.ok) return resolved;

  try {
    await cancelPaymentIntent(stripePaymentIntentId, 'requested_by_customer');
    revalidatePath(`/app/toro/${slug}/billing`);
    revalidatePath('/app/toro/inbox');
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'cancel failed' };
  }
}
