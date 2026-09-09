import type { Metadata } from 'next';
import { EnsembleLanding } from '@/components/ensemble/EnsembleLanding';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';

export const metadata: Metadata = {
  title: ENSEMBLE_PREVIEW.metaTitle,
  description: ENSEMBLE_PREVIEW.metaDescription,
  // Sell door — indexable. DEMO labels stay on-page for honesty.
  robots: { index: true, follow: true },
  alternates: { canonical: '/agents/ensemble' },
  openGraph: {
    title: ENSEMBLE_PREVIEW.metaTitle,
    description: ENSEMBLE_PREVIEW.metaDescription,
    url: '/agents/ensemble',
    type: 'website',
  },
};

/**
 * Ensemble — public creative studio agent-app front door.
 * CreativeWorkspace DNA (brief desk → package, brand board, studio links).
 * No architecture floor plates. Homepage `/` untouched.
 */
export default function EnsembleAgentAppPage() {
  return <EnsembleLanding />;
}
