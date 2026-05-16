import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { trainVoiceProfileAction } from './actions';

export const metadata: Metadata = {
  title: 'Operator voice',
  description: 'Train the Industry Pack fleet on the operator writing voice.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = { slug: string };
type SearchParams = { saved?: string; error?: string };

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

type VoiceProfileRow = {
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default async function OperatorVoicePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const redirectTo = `/app/${slug}/settings/voice`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) notFound();

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', (tenant as Tenant).id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);

  if (!member && !admin) redirect('/app');

  const { data: latestProfile } = await service
    .from('business_memory')
    .select('content,metadata,created_at')
    .eq('tenant_id', (tenant as Tenant).id)
    .eq('category', 'voice_profile')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const action = trainVoiceProfileAction.bind(null, slug);
  const profile = latestProfile as VoiceProfileRow | null;
  const metadata = profile?.metadata ?? {};

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-4 py-8 text-[color:var(--text-primary)] md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href={`/app/${slug}/inbox`}
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            >
              assembl / {(tenant as Tenant).slug} / settings
            </Link>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,5rem)] font-light leading-[0.9]">
              Operator voice
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Upload 5-10 sent emails so the fleet can match tone, vocabulary, and
            sign-off patterns before drafting.
          </p>
        </header>

        {query.saved ? (
          <p className="mt-6 rounded-[8px] border border-[rgba(43,107,87,0.22)] bg-white/70 px-4 py-3 text-sm text-[color:var(--assembl-pounamu)]">
            Voice profile trained and stored in business memory.
          </p>
        ) : null}
        {query.error ? (
          <p className="mt-6 rounded-[8px] border border-[rgba(164,59,46,0.24)] bg-white/70 px-4 py-3 text-sm text-[#8f2d25]">
            {query.error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form
            action={action}
            className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5"
          >
            <label
              htmlFor="voice-examples"
              className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-[rgba(35,33,31,0.18)] bg-[color:var(--assembl-paper)] px-6 py-10 text-center"
            >
              <UploadCloud className="h-9 w-9 text-[color:var(--assembl-pounamu)]" aria-hidden />
              <span className="mt-4 font-display text-3xl font-light">Upload sent emails</span>
              <span className="mt-2 max-w-md text-sm leading-relaxed text-[color:var(--text-secondary)]">
                Plain text, EML, Markdown, or exported email text works best. Keep
                customer-sensitive attachments out of this training surface.
              </span>
              <input
                id="voice-examples"
                name="examples"
                type="file"
                accept=".txt,.eml,.md,.markdown,text/plain,message/rfc822"
                multiple
                required
                className="mt-5 block w-full max-w-sm text-sm text-[color:var(--text-secondary)] file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--assembl-pounamu)] file:px-4 file:py-2 file:text-xs file:text-white"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                5-10 examples required
              </p>
              <button
                type="submit"
                className="h-10 rounded-full bg-[color:var(--assembl-pounamu)] px-5 text-sm font-medium text-white transition-colors hover:bg-[#214f40]"
              >
                Train voice
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                Current profile
              </p>
              {profile ? (
                <>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {profile.content}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                    Updated {new Date(profile.created_at).toLocaleDateString('en-NZ')}
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  No operator voice profile has been trained for this tenant yet.
                </p>
              )}
            </section>

            <ProfileList title="Tone" items={readList(metadata.tone)} />
            <ProfileList title="Sign-offs" items={readList(metadata.signoffs)} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProfileList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {title}
      </p>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm leading-relaxed text-[color:var(--text-body)]">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[color:var(--text-secondary)]">Waiting for training data.</p>
      )}
    </section>
  );
}

function readList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}
