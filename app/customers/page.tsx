import type { Metadata } from 'next';
import Link from 'next/link';
import { TENANTS } from '@/lib/customers/tenants';

// Never indexed. Layout already sets this; kept explicit for clarity.
export const metadata: Metadata = {
  title: 'assembl pilots — demo hub',
  robots: { index: false, follow: false },
};

/**
 * Hub page at `/customers` (i.e. demo.assembl.co.nz/customers).
 *
 * Lists every seeded tenant as a card linking through to that tenant's ops
 * console. The list is driven by `lib/customers/tenants.ts` — the canonical
 * in-code registry that mirrors the `tenant_customers` Supabase table.
 *
 * A future iteration can hydrate this from Supabase live so newly-seeded
 * tenants appear without a code deploy — for now the registry is enough to
 * keep the demo hub in step with what actually ships.
 */

export default function CustomersHub() {
  const concepts = TENANTS.filter((t) => t.status === 'concept');
  const live = TENANTS.filter((t) => t.status === 'pilot');

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            assembl · demo
          </p>
          <h1 className="mt-3 text-4xl font-serif tracking-tight">
            Pilot workspaces
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-600 leading-relaxed">
            Private pre-partnership pitch surfaces. Every board here is
            draft-only — nothing you see is a live customer record. Pick a
            pilot to open its branded ops console.
          </p>
        </header>

        {live.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-neutral-500">
              Live pilots
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {live.map((t) => (
                <TenantCard key={t.slug} tenant={t} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-sm uppercase tracking-wider text-neutral-500">
            Concept pilots ({concepts.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {concepts.map((t) => (
              <TenantCard key={t.slug} tenant={t} />
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
          <p>
            Powered by assembl · {new Date().getFullYear()} · Not for public
            distribution.
          </p>
        </footer>
      </div>
    </main>
  );
}

function TenantCard({
  tenant,
}: {
  tenant: (typeof TENANTS)[number];
}) {
  return (
    <Link
      href={`/customers/${tenant.slug}`}
      className={[
        'group block rounded-2xl border bg-white p-6 shadow-sm transition',
        'hover:shadow-md hover:-translate-y-0.5',
        tenant.accentClass ?? 'border-neutral-200',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-medium">{tenant.displayName}</h3>
        <span
          className={[
            'rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider',
            tenant.status === 'pilot'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-neutral-100 text-neutral-600',
          ].join(' ')}
        >
          {tenant.status}
        </span>
      </div>
      {tenant.parentBrand && (
        <p className="mt-1 text-xs text-neutral-500">{tenant.parentBrand}</p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">
        {tenant.blurb}
      </p>
      <p className="mt-4 text-xs text-neutral-500 group-hover:text-neutral-800">
        Open ops console →
      </p>
    </Link>
  );
}
