import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';
import { LiveArcChat } from '@/components/ops/toa/LiveArcChat';
import { ManaReceiptViewer } from '@/components/ops/widgets/ManaReceiptViewer';

/**
 * Static-route layout for /customers/toa-architects/ops.
 *
 * Required: the static `toa-architects` directory wins over `[slug]`, and
 * Next.js layouts only nest along the matched path — so `[slug]/ops/layout.tsx`
 * never wraps this route. Without this file the page renders with no OpsShell
 * (no header, no nav, no brand CSS vars). Same trap as PR #641's static
 * tenant pages.
 *
 * Right rail: ARC chat (LIVE — streams from /api/agents/whakaae/chat,
 * unmetered inside the gated demo) + a receipt viewer. The chat lives in the
 * rail so it's present on every section, like the other pilots.
 */
export default function ToaArchitectsOpsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const config = getBrandConfig('toa-architects');
  if (!config) notFound();

  // English-led architecture nav (Consents, Clients, Consultants, Fees, Site
  // Visits, Documents). Without this, OpsShell falls back to the generic retail
  // sidebar (CRM, Loyalty, Events…), which has nothing to do with a practice —
  // keep the focus on the work ARC actually does.
  const nav = config.nav?.map((n) => [n.label, n.href] as [string, string]);

  return (
    <OpsShell
      config={config}
      nav={nav}
      rightRail={
        <>
          <LiveArcChat compact />
          <ManaReceiptViewer
            receipt={{
              id: 'MR-TOA-DEMO-0001',
              at: '2026-07-04T07:02:00+12:00',
              kind: 'demo.concept',
              note: 'Concept demo. If ARC ran here, every draft, chase and lodgement would leave a receipt like this one.',
            }}
          />
        </>
      }
    >
      {children}
    </OpsShell>
  );
}
