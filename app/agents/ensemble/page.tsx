import type { Metadata } from 'next';
import { EnsembleLanding } from '@/components/ensemble/EnsembleLanding';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';

export const metadata: Metadata = {
  title: ENSEMBLE_PREVIEW.metaTitle,
  description: ENSEMBLE_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/agents/ensemble' },
  openGraph: {
    title: ENSEMBLE_PREVIEW.metaTitle,
    description: ENSEMBLE_PREVIEW.metaDescription,
    url: '/agents/ensemble',
    type: 'website',
  },
};

/**
 * Ensemble — marketing & creative studio agent-app PREVIEW landing.
 * Route mirrors Arc at /agents/arc and Forge at /agents/forge
 * (splash already exempts /agents). Prefer /agents/ensemble over /apps/*
 * for marketing craft. Public pitch surface. Noindex. Does not touch
 * homepage craft.
 */
export default function EnsembleAgentAppPage() {
  return <EnsembleLanding />;
}
