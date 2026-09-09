import type { Metadata } from 'next';
import { GatewayLanding } from '@/components/gateway/GatewayLanding';
import { GATEWAY_PREVIEW } from '@/lib/gateway/preview-copy';

export const metadata: Metadata = {
  title: GATEWAY_PREVIEW.metaTitle,
  description: GATEWAY_PREVIEW.metaDescription,
  robots: { index: false, follow: false },
  alternates: { canonical: '/agents/customs' },
  openGraph: {
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
