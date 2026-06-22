import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { PALETTE } from '@/lib/marketplace/agents';

/**
 * Own header/footer for the agent marketplace — deliberately self-contained
 * (mirrors the /beat and Dash microsites) so the App Store surface keeps its
 * Dash-aligned palette without inheriting the main site chrome.
 */
export function MarketplaceHeader() {
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{
        borderColor: 'rgba(22,58,35,0.10)',
        backgroundColor: 'rgba(242,239,230,0.82)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-baseline gap-3">
          <Wordmark className="text-2xl" />
          <span
            className="hidden text-sm font-medium sm:inline"
            style={{ color: PALETTE.forest, opacity: 0.55 }}
          >
            agents
          </span>
        </div>
        <nav className="flex items-center gap-5 text-sm font-medium" style={{ color: PALETTE.forest }}>
          <Link href="/agents" className="hover:opacity-70">
            Browse
          </Link>
          <Link href="/" className="hidden hover:opacity-70 sm:inline" style={{ opacity: 0.7 }}>
            About assembl
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function MarketplaceFooter() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'rgba(22,58,35,0.10)', backgroundColor: 'rgba(166,186,158,0.10)' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-1">
          <Wordmark className="text-xl" href={null} />
          <p className="text-sm" style={{ color: PALETTE.forest, opacity: 0.6 }}>
            Mahi that earns its proof. Built in Aotearoa.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: PALETTE.forest }}>
          <Link href="/agents" className="hover:opacity-70">Agents</Link>
          <Link href="/pricing" className="hover:opacity-70">Pricing</Link>
          <Link href="/trust" className="hover:opacity-70">Trust</Link>
          <Link href="/legal/privacy" className="hover:opacity-70">Privacy</Link>
        </div>
      </div>
      <div className="px-5 pb-8 md:px-8">
        <p className="mx-auto max-w-6xl text-xs" style={{ color: PALETTE.forest, opacity: 0.5 }}>
          Every reply is a draft for a human to check before it is sent, filed, or lodged. Not legal,
          financial, or medical advice.
        </p>
      </div>
    </footer>
  );
}
