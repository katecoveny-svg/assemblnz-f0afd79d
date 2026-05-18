import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'assembl admin landing.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session per-request — never prerender.
export const dynamic = 'force-dynamic';

const LEGACY_APP_ORIGIN = 'https://app.assembl.co.nz';

const ADMIN_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

/**
 * /app — the post-sign-in landing page.
 *
 * Redirect logic (Version A, 2026-05-14):
 *   • Not signed in                       → /login?redirect=/app
 *   • Signed in + admin email             → /app/admin
 *   • Signed in + has a primary kete      → app.assembl.co.nz/{kete-slug}
 *   • Signed in + tenant but no kete yet  → /app/toro/{tenant-slug}
 *   • Signed in, no tenant                → /app/chat (start the conversation)
 *
 * Primary kete = the first enabled kete for the user's tenant, sorted by
 * kete_definitions.display_order. The kete dashboards live on legacy Vite
 * at app.assembl.co.nz/{kete-slug}.
 *
 * Auth handoff to legacy Vite is intentionally out of scope here — the
 * legacy SPA owns its own session detection.
 */
export default async function AdminLandingPage(): Promise<never> {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app');
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    redirect('/login?redirect=/app');
  }

  const userEmail = user.email?.toLowerCase() ?? '';
  if (ADMIN_EMAILS.has(userEmail)) {
    redirect('/app/admin');
  }

  let tenantId: string | null = null;
  let tenantSlug: string | null = null;
  let primaryKeteSlug: string | null = null;

  try {
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('tenant_id, tenants:tenant_id ( slug )')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    const m = membership as unknown as
      | { tenant_id?: string; tenants?: { slug?: string } | { slug?: string }[] }
      | null;

    if (m?.tenant_id) tenantId = m.tenant_id;
    if (m?.tenants) {
      tenantSlug = Array.isArray(m.tenants)
        ? m.tenants[0]?.slug ?? null
        : m.tenants.slug ?? null;
    }
  } catch {
    // fall through
  }

  if (tenantId) {
    try {
      const { data: enabledKetes } = await supabase
        .from('tenant_ketes')
        .select('enabled, kete_definitions ( slug, display_order )')
        .eq('tenant_id', tenantId)
        .eq('enabled', true);

      type KeteRow = {
        enabled?: boolean;
        kete_definitions?:
          | { slug?: string; display_order?: number }
          | { slug?: string; display_order?: number }[]
          | null;
      };

      const flat = (enabledKetes as KeteRow[] | null | undefined)
        ?.map((row) => {
          const k = row.kete_definitions;
          if (!k) return null;
          if (Array.isArray(k)) return k[0] ?? null;
          return k;
        })
        .filter(
          (k): k is { slug: string; display_order?: number } =>
            Boolean(k && typeof k.slug === 'string' && k.slug.length > 0),
        )
        .sort(
          (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999),
        );

      if (flat && flat.length > 0) {
        primaryKeteSlug = flat[0].slug;
      }
    } catch {
      // fall through
    }
  }

  if (primaryKeteSlug) {
    redirect(`${LEGACY_APP_ORIGIN}/${primaryKeteSlug}`);
  }
  if (tenantSlug) {
    redirect(`/app/toro/${tenantSlug}`);
  }
  redirect('/app/chat');
}
