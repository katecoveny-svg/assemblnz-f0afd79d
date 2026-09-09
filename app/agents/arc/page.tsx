import type { Metadata } from 'next';
import { ArcLanding } from '@/components/arc/ArcLanding';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

export const metadata: Metadata = {
  title: ARC_PREVIEW.metaTitle,
  description: ARC_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/agents/arc' },
  openGraph: {
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
