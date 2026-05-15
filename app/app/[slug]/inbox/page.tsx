import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Check, Edit3, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { acceptDraftAction, editDraftAction, rejectDraftAction } from './actions';

export const metadata: Metadata = {
  title: 'Inbox',
  description: 'Minimal tenant draft inbox placeholder.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = { slug: string };

type DraftRow = {
  id: string;
  status: string;
  created_by_agent: string;
  incoming_body: string | null;
  draft_body: string;
  confidence: number | null;
  created_at: string;
  extracted_actions: unknown;
};

export default async function TenantInboxPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const redirectTo = `/app/${slug}/inbox`;

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,name,slug,kete_primary')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) notFound();

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenant.id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);
  if (!member && !admin) redirect('/app');

  const { data: drafts, error } = await service
    .from('toro_drafts')
    .select('id,status,created_by_agent,incoming_body,draft_body,confidence,created_at,extracted_actions')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-10 text-[color:var(--text-primary)] md:px-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              {tenant.slug} · inbox
            </p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-light leading-[0.9]">
              Drafts from your fleet.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Placeholder inbox for Industry Pack onboarding. It lists tenant
              draft rows only; the full inbox workflow lands separately.
            </p>
          </div>
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 px-5 py-4 text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Drafts
            </p>
            <p className="mt-1 font-display text-4xl font-light leading-none">
              {drafts?.length ?? 0}
            </p>
          </div>
        </header>

        {error ? (
          <section className="mt-10 rounded-[8px] border border-[#A33A2A]/25 bg-[#A33A2A]/10 p-5 text-[#7A2519]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
              Could not load drafts
            </p>
            <p className="mt-2 text-sm">{error.message}</p>
          </section>
        ) : null}

        {!error && (drafts?.length ?? 0) === 0 ? (
          <section className="mt-10 rounded-[8px] border border-dashed border-[rgba(35,33,31,0.18)] bg-white/55 p-10 text-center">
            <p className="font-display text-3xl font-light">No drafts yet.</p>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
              The checkout webhook queues the welcome briefing here after
              provisioning.
            </p>
          </section>
        ) : null}

        {!error && (drafts?.length ?? 0) > 0 ? (
          <ul className="mt-10 space-y-4">
            {((drafts ?? []) as DraftRow[]).map((draft) => (
              <li key={draft.id}>
                <DraftCard slug={slug} draft={draft} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}

function DraftCard({ slug, draft }: { slug: string; draft: DraftRow }) {
  const action = firstActionLabel(draft.extracted_actions);

  return (
    <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_12px_36px_rgba(35,33,31,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={draft.status} />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
              {draft.created_by_agent}
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-light leading-none">
            {action}
          </h2>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
            confidence {draft.confidence == null ? 'n/a' : Math.round(draft.confidence * 100)}%
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
          {new Date(draft.created_at).toLocaleString('en-NZ', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </time>
      </div>

      {draft.incoming_body ? (
        <p className="mt-5 rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] p-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          {draft.incoming_body}
        </p>
      ) : null}

      <pre className="mt-4 whitespace-pre-wrap rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-white p-4 font-sans text-sm leading-relaxed text-[color:var(--text-body)]">
        {draft.draft_body}
      </pre>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-[rgba(35,33,31,0.08)] pt-4">
        <form action={acceptDraftAction.bind(null, slug, draft.id)}>
          <button type="submit" className="cta-primary inline-flex h-10 items-center justify-center px-5">
            <Check className="mr-2 h-4 w-4" aria-hidden />
            Accept
          </button>
        </form>
        <form action={editDraftAction.bind(null, slug, draft.id)}>
          <button type="submit" className="btn-ghost inline-flex h-10 items-center justify-center px-5">
            <Edit3 className="mr-2 h-4 w-4" aria-hidden />
            Edit
          </button>
        </form>
        <form action={rejectDraftAction.bind(null, slug, draft.id)}>
          <button type="submit" className="btn-ghost inline-flex h-10 items-center justify-center px-5">
            <X className="mr-2 h-4 w-4" aria-hidden />
            Reject
          </button>
        </form>
      </div>
    </article>
  );
}

function firstActionLabel(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return 'Review draft';
  const first = value[0] as { label?: unknown; action?: unknown };
  if (typeof first.label === 'string' && first.label.length > 0) return first.label;
  if (typeof first.action === 'string' && first.action.length > 0) return first.action;
  return 'Review draft';
}

function StatusPill({ status }: { status: string }) {
  const isDone = ['approved', 'sent', 'edited_then_approved'].includes(status);
  const isRejected = status === 'rejected';
  return (
    <span
      className={[
        'rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em]',
        isDone
          ? 'border-[rgba(43,107,87,0.28)] bg-[rgba(43,107,87,0.10)] text-[color:var(--assembl-pounamu)]'
          : isRejected
            ? 'border-[#A33A2A]/25 bg-[#A33A2A]/10 text-[#7A2519]'
            : 'border-[rgba(212,168,83,0.45)] bg-[rgba(212,168,83,0.10)] text-[#7A5C1E]',
      ].join(' ')}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}
