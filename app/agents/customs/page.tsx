import type { Metadata } from 'next';
import { verticalMetadata, verticalViewport } from '@/lib/verticals/metadata';
import { GatewayLanding } from '@/components/gateway/GatewayLanding';
import { GATEWAY_PREVIEW } from '@/lib/gateway/preview-copy';

export const viewport = verticalViewport;
const appMetadata = verticalMetadata('customs');

export const metadata: Metadata = {
  ...appMetadata,
  title: GATEWAY_PREVIEW.metaTitle,
  description: GATEWAY_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/agents/customs' },
  openGraph: {
    ...appMetadata.openGraph,
    title: GATEWAY_PREVIEW.metaTitle,
    description: GATEWAY_PREVIEW.metaDescription,
    url: '/agents/customs',
    type: 'website',
  },
};

/**
 * Gateway — customs brokerage agent-app PREVIEW landing (with Pīkau).
 * Route is /agents/customs because /agents/gateway is the live marketplace
 * agent detail slug. Mirrors Arc/Forge craft. Noindex. Does not touch homepage.
 */
export default function GatewayAgentAppPage() {
  return <GatewayLanding />;
}
