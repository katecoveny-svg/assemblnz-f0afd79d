import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';
import { tenantPwaMetadata } from '@/lib/pwa/apple';

export const metadata: Metadata = {
  title: 'Family OS — the whānau operating system (concept) · assembl',
  description: 'Forward a school newsletter and get the family week: events, pickups, shopping, approvals. Draft-only — the agent proposes, you approve.',
  robots: { index: false, follow: false },
  ...tenantPwaMetadata('family', 'Family OS'),
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

/**
 * Family OS workspace shell. Warm cream + gold in the luminous direction; the
 * whole surface is the family operating system, so no right rail — the
 * dashboard fills the canvas.
 */
export default function FamilyOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('family');
  if (!config) notFound();
  return <OpsShell config={config}>{children}</OpsShell>;
}
