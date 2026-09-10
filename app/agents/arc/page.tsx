import type { Metadata } from 'next';
import { verticalMetadata, verticalViewport } from '@/lib/verticals/metadata';
import { ArcLanding } from '@/components/arc/ArcLanding';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

export const viewport = verticalViewport;
const appMetadata = verticalMetadata('arc');

export const metadata: Metadata = {
  ...appMetadata,
  title: ARC_PREVIEW.metaTitle,
  description: ARC_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/agents/arc' },
  openGraph: {
    ...appMetadata.openGraph,
    title: ARC_PREVIEW.metaTitle,
    description: ARC_PREVIEW.metaDescription,
    url: '/agents/arc',
    type: 'website',
  },
};

/**
 * Arc — architecture & design agent-app PREVIEW landing.
 * Public pitch surface under /agents (splash-exempt). Noindex.
 * Does not touch homepage craft.
 */
export default function ArcAgentAppPage() {
  return <ArcLanding />;
}
