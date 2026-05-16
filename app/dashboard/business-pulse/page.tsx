import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BusinessPulseWidget } from '@/components/dashboard/BusinessPulseWidget';

export const metadata: Metadata = {
  title: 'business pulse',
  description: 'Weekly Monday-morning brief for assembl operators.',
};

export default async function BusinessPulsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center px-6 py-16">
        <div className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> dashboard
        </div>
        <h1 className="mt-2 font-display text-[36px] font-light leading-tight text-[color:var(--text-primary)]">
          business pulse
        </h1>
        <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
          sign in to view your weekly brief.
        </p>
      </main>
    );
  }

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, tenants(name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[640px] flex-col justify-center px-6 py-16">
        <h1 className="font-display text-[36px] font-light text-[color:var(--text-primary)]">
          business pulse
        </h1>
        <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
          You are not a member of any tenant yet. Once your tenant is provisioned, the brief lands here every Monday at 07:00 in your timezone.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[720px] px-6 py-12">
      <header className="mb-8">
        <p className="font-mono text-[11px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> dashboard
          <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> business pulse
        </p>
        <h1 className="mt-2 font-display text-[36px] font-light leading-tight text-[color:var(--text-primary)]">
          business pulse
        </h1>
        <p className="mt-2 max-w-prose text-sm text-[color:var(--text-secondary)]">
          A weekly Monday-morning brief that pulls together cash position, settlements, and the week ahead. Every recommended action is a draft — you sign and send. The brief never sends, posts, pays, or transmits.
        </p>
      </header>

      <BusinessPulseWidget tenantId={membership.tenant_id} />

      <p className="mt-8 max-w-prose font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
        scaffold · 16 may 2026 · connector wiring in progress · spec at docs/handover/claude-for-small-business-2026-05-16.md
      </p>
    </main>
  );
}
