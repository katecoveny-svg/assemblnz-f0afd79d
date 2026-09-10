import type { Metadata } from 'next';
import { verticalMetadata, verticalViewport } from '@/lib/verticals/metadata';
import { ForgeLanding } from '@/components/forge/ForgeLanding';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

export const viewport = verticalViewport;
const appMetadata = verticalMetadata('forge');

export const metadata: Metadata = {
  ...appMetadata,
  title: FORGE_PREVIEW.metaTitle,
  description: FORGE_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/agents/forge' },
  openGraph: {
    ...appMetadata.openGraph,
    title: FORGE_PREVIEW.metaTitle,
    description: FORGE_PREVIEW.metaDescription,
    url: '/agents/forge',
    type: 'website',
  },
};

/**
 * Forge — automotive dealership operating system PREVIEW landing.
 * Connected journey craft (research → sale → service → loyalty).
 * Honest CTA to /agents/arataki. No architecture floor plates.
 * Public pitch surface. Does not touch homepage.
 */
export default function ForgeAgentAppPage() {
  return <ForgeLanding />;
}
