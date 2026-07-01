import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { findTenant } from '@/lib/customers/tenants';

// Belt-and-braces: layout already sets robots:false for /customers/*, but
// keep it explicit here too so this route can never accidentally be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Minimal top-level page for every pilot slug.
 *
 * If the slug is a known tenant, redirect straight into that tenant's ops
 * console (`/customers/[slug]/ops`) which is where the real work happens.
 *
 * If the slug is unknown, show a small placeholder + link back to the hub.
 * This keeps `demo.assembl.co.nz/<any-slug>` from 404-ing outright during
 * the pilot-onboarding window between DB seed and code ship.
 */

export default async function CustomerRoot({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = findTenant(slug);

  // Known tenant → straight into ops.
  if (tenant) {
    redirect(`/customers/${slug}/ops`);
  }

  // Unknown slug → 404 in production. Keep the placeholder above for reference.
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  // Dev-only friendly placeholder.
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-wider text-neutral-500">
          Pilot workspace
        </p>
        <h1 className="mt-3 text-3xl font-serif">
          <span className="font-mono">{slug}</span>
        </h1>
        <p className="mt-4 text-neutral-600">
          This pilot is being prepared. Once its build lands you&rsquo;ll see the
          full ops console here.
        </p>
        <Link
          href="/customers"
          className="mt-8 inline-block rounded-full border border-neutral-300 px-5 py-2 text-sm hover:bg-neutral-100"
        >
          Back to pilot index
        </Link>
      </div>
    </main>
  );
}
