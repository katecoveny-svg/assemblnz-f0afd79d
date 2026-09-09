import type { Metadata } from 'next';
import { ForgeLanding } from '@/components/forge/ForgeLanding';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

export const metadata: Metadata = {
  title: FORGE_PREVIEW.metaTitle,
  description: FORGE_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/agents/forge' },
  openGraph: {
    title: FORGE_PREVIEW.metaTitle,
    description: FORGE_PREVIEW.metaDescription,
    url: '/agents/forge',
    type: 'website',
  },
};

/**
 * Forge — automotive dealership & workshop agent-app PREVIEW landing.
 * Route mirrors Arc at /agents/arc (splash already exempts /agents).
 * Prefer /agents/forge over /apps/forge for consistency with Arc pattern.
 * Public pitch surface. Noindex. Does not touch homepage craft.
 */
export default function ForgeAgentAppPage() {
  return <ForgeLanding />;
}
