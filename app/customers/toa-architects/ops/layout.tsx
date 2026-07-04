import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';
import { ArcChatPanel } from '@/components/ops/toa/ArcChatPanel';
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
 * Right rail: ARC chat (scripted, draft-only) + a receipt viewer. The chat
 * lives in the rail so it's present on every section, like the other pilots.
 */
export default function ToaArchitectsOpsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const config = getBrandConfig('toa-architects');
  if (!config) notFound();

  return (
    <OpsShell
      config={config}
      rightRail={
        <>
          <ArcChatPanel />
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
