import { V2Nav } from '@/components/v2/V2Chrome';
import { V2Footer } from '@/components/v2/V2Footer';

/**
 * Own header/footer for the agent marketplace — self-contained Dash-brand chrome
 * (mirrors the /beat + /dash microsites). The global SiteHeader/Footer are
 * suppressed on /agents (see isAgentMarketplace in site-header).
 */
export function MarketplaceHeader() {
  return <V2Nav current="/agents" />;
}

export function MarketplaceFooter() {
  return <V2Footer />;
}
