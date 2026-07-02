import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';
import { ManaReceiptViewer } from '@/components/ops/widgets/ManaReceiptViewer';
import { InviteGreeting } from '@/components/ops/InviteGreeting';

/**
 * Slug-scoped layout for the ops surface. Resolves the slug to a `BrandConfig`
 * or 404s if unknown. Right rail is a placeholder tagged `demo` until wired to
 * live streams.
 */
export default async function OpsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getBrandConfig(slug);
  if (!config) notFound();

  return (
    <OpsShell
      config={config}
      rightRail={
        <>
          <ManaReceiptViewer
            receipt={{
              id: 'MR-DEMO-0001',
              at: new Date().toISOString(),
              kind: 'demo.placeholder',
              note: 'Receipts appear here as agents attest to material actions.',
            }}
          />
          <div className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-4">
            <h4 className="text-sm font-semibold text-[color:var(--brand-ink)]">
              Today&apos;s diary
            </h4>
            <p className="mt-1 text-xs text-[color:var(--brand-muted)]">
              demo · connect a calendar to populate.
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-4">
            <h4 className="text-sm font-semibold text-[color:var(--brand-ink)]">Alerts</h4>
            <p className="mt-1 text-xs text-[color:var(--brand-muted)]">
              demo · no alerts.
            </p>
          </div>
        </>
      }
    >
      <InviteGreeting demo={slug} />
      {children}
    </OpsShell>
  );
}
