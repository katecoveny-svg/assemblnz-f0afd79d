import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveTenantSlugForUser } from '@/lib/toro/resolve-tenant';

// Legacy route. The canonical inbox lives at /app/toro/[slug]/inbox to
// match the multi-tenant URL shape used by /billing. Anything that lands
// here gets bounced to the caller's tenant inbox. We keep this stub for at
// least the next release window so any in-flight bookmarks, Chatwoot
// links, or scripts keep working.
export const dynamic = 'force-dynamic';

export default async function LegacyToroInboxRedirect() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app/toro');
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login?redirect=/app/toro');
  }

  const slug = await resolveTenantSlugForUser(supabase, userData.user.id);
  if (!slug) {
    redirect('/app?missing_tenant=1');
  }
  redirect(`/app/toro/${slug}/inbox`);
}
