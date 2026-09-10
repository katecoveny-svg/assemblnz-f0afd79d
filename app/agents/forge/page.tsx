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
 * Service-bay craft one-pager with honest CTA to /agents/arataki.
 * No architecture floor plates. Public pitch surface. Does not touch homepage.
 */
export default function ForgeAgentAppPage() {
  return <ForgeLanding />;
}
