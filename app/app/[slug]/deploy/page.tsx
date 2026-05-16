import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ExternalLink, Globe2, MonitorSmartphone, PanelsTopLeft } from 'lucide-react';
import { getKete } from '@/lib/kete';
import { isKeteSlug } from '@/lib/public-chat/tenant';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { DeploymentCopyButton } from './DeploymentCopyButton';

export const metadata: Metadata = {
  title: 'Deploy agents',
  description: 'Deploy tenant public chat, embed widget, and installable app.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = { slug: string };

type Tenant = {
  id: string;
  slug: string;
  name: string;
  kete_primary: string | null;
  logo_url: string | null;
  brand_color: string | null;
  metadata: Record<string, unknown> | null;
};

async function ensureOperatorRole(slug: string) {
  const redirectTo = `/app/${slug}/deploy`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,slug,name,kete_primary,logo_url,brand_color,metadata')
    .eq('slug', slug)
    .maybeSingle();
  if (!tenant) notFound();

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenant.id)
      .eq('user_id', user.id)
      .in('role', ['operator', 'admin', 'manager'])
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);
  if (!member && !admin) redirect('/app');

  return tenant as Tenant;
}

function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'https://assembl.co.nz';
  return (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/$/, '');
}

export default async function TenantDeployPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tenant = await ensureOperatorRole(slug);
  const rawKete = tenant.kete_primary ?? tenant.metadata?.kete_primary ?? tenant.metadata?.kete;
  const keteSlug = isKeteSlug(rawKete) ? rawKete : 'waihanga';
  const kete = getKete(keteSlug);
  const origin = siteUrl();
  const publicUrl = `${origin}/c/${tenant.slug}`;
  const embedUrl = `${origin}/c/${tenant.slug}/embed`;
  const manifestUrl = `${origin}/c/${tenant.slug}/manifest.json`;
  const brandColor = tenant.brand_color || '#2B6B57';
  const snippet = `<script async src="${origin}/widget.js" data-tenant="${tenant.slug}" data-kete="${keteSlug}" data-brand-color="${brandColor}"></script>`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(publicUrl)}`;

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-10 text-[color:var(--text-primary)] md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              {tenant.slug} · deployment
            </p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-light leading-[0.9]">
              Put the fleet where your customers are.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Deploy {tenant.name}&apos;s {kete.name} agents as a public link,
              an embedded widget, or an installable app.
            </p>
          </div>
          <Link href={publicUrl} target="_blank" className="btn-ghost inline-flex h-11 items-center gap-2 px-5">
            Test public chat <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <DeployOption
              icon={<Globe2 className="h-5 w-5" aria-hidden />}
              title="Public chat link"
              description="Share this URL with customers, suppliers, or team members who need a direct chat surface."
              value={publicUrl}
              action={<DeploymentCopyButton value={publicUrl} label="Copy link" />}
              testHref={publicUrl}
            />

            <DeployOption
              icon={<PanelsTopLeft className="h-5 w-5" aria-hidden />}
              title="Embed widget"
              description="Paste this snippet before the closing body tag on the tenant site. The script injects a bottom-right chat bubble."
              value={snippet}
              action={<DeploymentCopyButton value={snippet} label="Copy snippet" />}
              testHref={embedUrl}
              code
            />

            <DeployOption
              icon={<MonitorSmartphone className="h-5 w-5" aria-hidden />}
              title="Installable app"
              description="Open the public chat link on mobile or desktop, then choose Add to Home Screen or Install app from the browser menu."
              value={manifestUrl}
              action={<DeploymentCopyButton value={manifestUrl} label="Copy manifest" />}
              testHref={manifestUrl}
            />
          </section>

          <aside className="space-y-5">
            <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                Mobile QR
              </p>
              <img
                src={qrUrl}
                alt={`QR code for ${tenant.name} public chat`}
                width={220}
                height={220}
                className="mt-4 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white p-3"
              />
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                Scan to test the installable chat on a phone, then add it to the
                home screen.
              </p>
            </div>

            <div className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white">
              <iframe
                title={`${tenant.name} public chat preview`}
                src={`/c/${tenant.slug}/embed`}
                className="h-[540px] w-full"
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function DeployOption({
  icon,
  title,
  description,
  value,
  action,
  testHref,
  code = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  value: string;
  action: ReactNode;
  testHref: string;
  code?: boolean;
}) {
  return (
    <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-[8px] bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu)]">
            {icon}
          </div>
          <div>
            <h2 className="font-display text-3xl font-light">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--text-body)]">
              {description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {action}
          <Link href={testHref} target="_blank" className="btn-ghost inline-flex h-10 items-center gap-2 px-4 text-sm">
            Test <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
      <pre
        className={[
          'mt-5 overflow-x-auto rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-4 text-xs leading-relaxed text-[color:var(--text-primary)]',
          code ? 'whitespace-pre-wrap break-all' : '',
        ].join(' ')}
      >
        {value}
      </pre>
    </article>
  );
}
