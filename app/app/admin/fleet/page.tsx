import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpDown, CircleOff, PackagePlus } from 'lucide-react';
import { ensureAdminRole } from '@/lib/admin/ensureAdminRole';
import { agentsForKete, FLEET_AGENT_SLUGS_BY_KETE } from '@/lib/agents';
import { INDUSTRY_KETES, type Kete, type KeteSlug } from '@/lib/kete';
import { getServiceClient } from '@/lib/supabase/service';
import { activateKeteAction, deactivateKeteAction } from './actions';

export const metadata: Metadata = {
  title: 'Fleet activation',
  description: 'Admin-only fleet activation controls for tenant kete access.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type SearchParams = {
  kete?: string;
  sort?: string;
  dir?: string;
};

type TenantRow = {
  id: string;
  name: string;
  slug: string | null;
  plan: string;
  status: string;
  billing_email: string | null;
};

type AccessRow = {
  tenant_id: string;
  agent_code: string;
  pack_id: string;
  is_enabled: boolean | null;
};

export default async function FleetAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await ensureAdminRole('/app/admin/fleet');

  const sp = await searchParams;
  const selectedKete = resolveKete(sp.kete);
  const sort = sp.sort === 'plan' || sp.sort === 'status' ? sp.sort : 'name';
  const dir = sp.dir === 'desc' ? 'desc' : 'asc';

  const service = getServiceClient();
  const [{ data: tenants, error: tenantsError }, { data: access, error: accessError }] =
    await Promise.all([
      service
        .from('tenants')
        .select('id,name,slug,plan,status,billing_email')
        .order(sort, { ascending: dir === 'asc' }),
      service.from('agent_access').select('tenant_id,agent_code,pack_id,is_enabled'),
    ]);

  const accessByTenant = groupAccess((access ?? []) as AccessRow[]);
  const rows = ((tenants ?? []) as TenantRow[]).map((tenant) => ({
    tenant,
    enabledKetes: enabledKetesFor(accessByTenant.get(tenant.id) ?? []),
    selectedAccess: accessForKete(accessByTenant.get(tenant.id) ?? [], selectedKete.slug),
  }));

  const selectedFleet = agentsForKete(selectedKete.slug);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[color:var(--text-primary)] md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link
              href="/app/admin"
              className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            >
              assembl / admin
            </Link>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,5rem)] font-light leading-[0.92]">
              Fleet activation.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--text-body)] md:text-base">
              Activate or pause a kete fleet for a tenant. Activation writes
              `agent_access` rows for the kete specialists plus Iho and Signal.
            </p>
          </div>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 px-4 py-3">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Selected kete
            </p>
            <p className="mt-1 font-display text-2xl font-light">{selectedKete.name}</p>
            <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
              {selectedFleet.length} agents: {selectedFleet.map((agent) => agent.name).join(', ')}
            </p>
          </div>
        </header>

        {tenantsError || accessError ? (
          <div className="mt-8 rounded-[8px] border border-[rgba(163,59,44,0.28)] bg-white p-4 text-sm text-[color:var(--text-body)]">
            {tenantsError?.message || accessError?.message}
          </div>
        ) : null}

        <section className="mt-8 flex flex-wrap gap-2">
          {INDUSTRY_KETES.map((kete) => (
            <Link
              key={kete.slug}
              href={`/app/admin/fleet?kete=${kete.slug}&sort=${sort}&dir=${dir}`}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em]',
                selectedKete.slug === kete.slug
                  ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                  : 'border-[rgba(35,33,31,0.14)] bg-white/50 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
              ].join(' ')}
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: selectedKete.slug === kete.slug ? 'currentColor' : kete.accent }}
              />
              {kete.name}
            </Link>
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/70">
          <div className="grid grid-cols-[minmax(220px,1.2fr)_minmax(160px,0.8fr)_minmax(240px,1.4fr)_minmax(220px,0.9fr)] border-b border-[rgba(35,33,31,0.10)] bg-[rgba(250,247,242,0.86)] px-4 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
            <SortHeader label="Tenant" field="name" selectedKete={selectedKete.slug} sort={sort} dir={dir} />
            <SortHeader label="Plan" field="plan" selectedKete={selectedKete.slug} sort={sort} dir={dir} />
            <span>Activated kete</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-[rgba(35,33,31,0.08)]">
            {rows.map(({ tenant, enabledKetes, selectedAccess }) => {
              const active = selectedAccess.enabled > 0;
              return (
                <div
                  key={tenant.id}
                  className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[minmax(220px,1.2fr)_minmax(160px,0.8fr)_minmax(240px,1.4fr)_minmax(220px,0.9fr)] md:items-center"
                >
                  <div>
                    <p className="font-display text-2xl font-light leading-none">{tenant.name}</p>
                    <p className="mt-1 font-mono text-[12px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                      {tenant.slug || tenant.billing_email || tenant.id}
                    </p>
                  </div>
                  <div className="text-sm text-[color:var(--text-body)]">
                    <p>{tenant.plan}</p>
                    <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                      {tenant.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {enabledKetes.length > 0 ? (
                      enabledKetes.map((kete) => (
                        <span
                          key={kete.slug}
                          className="rounded-full border border-[rgba(35,33,31,0.12)] bg-[rgba(250,247,242,0.8)] px-3 py-1 text-xs text-[color:var(--text-body)]"
                        >
                          {kete.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[color:var(--text-secondary)]">No kete active yet.</span>
                    )}
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <form action={active ? deactivateKeteAction : activateKeteAction}>
                      <input type="hidden" name="tenantId" value={tenant.id} />
                      <input type="hidden" name="keteSlug" value={selectedKete.slug} />
                      <button
                        type="submit"
                        className={[
                          'inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 font-mono text-[12px] uppercase tracking-[0.16em]',
                          active
                            ? 'border-[rgba(163,59,44,0.35)] bg-white text-[color:#A33B2C]'
                            : 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] text-[color:var(--assembl-paper)]',
                        ].join(' ')}
                      >
                        {active ? (
                          <>
                            <CircleOff className="h-4 w-4" aria-hidden />
                            Deactivate {selectedKete.name}
                          </>
                        ) : (
                          <>
                            <PackagePlus className="h-4 w-4" aria-hidden />
                            Activate {selectedKete.name}
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function SortHeader({
  label,
  field,
  selectedKete,
  sort,
  dir,
}: {
  label: string;
  field: 'name' | 'plan' | 'status';
  selectedKete: string;
  sort: string;
  dir: string;
}) {
  const nextDir = sort === field && dir === 'asc' ? 'desc' : 'asc';
  return (
    <Link
      href={`/app/admin/fleet?kete=${selectedKete}&sort=${field}&dir=${nextDir}`}
      className="inline-flex items-center gap-1 hover:text-[color:var(--text-primary)]"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" aria-hidden />
    </Link>
  );
}

function resolveKete(raw: string | undefined): Kete {
  return INDUSTRY_KETES.find((kete) => kete.slug === raw) ?? INDUSTRY_KETES[0];
}

function groupAccess(access: AccessRow[]) {
  const map = new Map<string, AccessRow[]>();
  for (const row of access) {
    const rows = map.get(row.tenant_id) ?? [];
    rows.push(row);
    map.set(row.tenant_id, rows);
  }
  return map;
}

function enabledKetesFor(access: AccessRow[]): Kete[] {
  const enabled = new Set(
    access
      .filter((row) => row.is_enabled !== false)
      .map((row) => row.pack_id),
  );
  return INDUSTRY_KETES.filter((kete) => enabled.has(kete.slug));
}

function accessForKete(access: AccessRow[], keteSlug: KeteSlug) {
  const relevant = access.filter((row) => row.pack_id === keteSlug);
  return {
    enabled: relevant.filter((row) => row.is_enabled !== false).length,
    disabled: relevant.filter((row) => row.is_enabled === false).length,
  };
}
