import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { DASH_MOTIF, PALETTE } from '@/lib/marketplace/agents';

/**
 * Own header/footer for the agent marketplace — self-contained Dash-brand chrome
 * (mirrors the /beat + /dash microsites). The global SiteHeader/Footer are
 * suppressed on /agents (see isAgentMarketplace in site-header).
 */
export function MarketplaceHeader() {
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{ borderColor: PALETTE.hairline, backgroundColor: 'rgba(255,247,236,0.85)' }}
    >
      {/* dash motif hairline */}
      <div style={{ height: 4, background: DASH_MOTIF }} aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-end gap-3">
          <Wordmark size={24} />
          <span
            className="mk-mono hidden text-[11px] uppercase tracking-[0.16em] sm:inline"
            style={{ color: PALETTE.muted, marginBottom: 2 }}
          >
            agents
          </span>
        </div>
        <nav className="flex items-center gap-5 text-sm font-bold" style={{ color: PALETTE.ink }}>
          <Link href="/agents" className="hover:opacity-70">
            Browse
          </Link>
          <Link href="/" className="hidden hover:opacity-70 sm:inline" style={{ color: PALETTE.body }}>
            About assembl
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function MarketplaceFooter() {
  return (
    <footer className="border-t" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream }}>
      <div style={{ height: 4, background: DASH_MOTIF }} aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-2">
          <Wordmark size={22} href={null} />
          <p className="text-sm" style={{ color: PALETTE.body }}>
            Mahi that earns its proof. Built in Aotearoa.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold" style={{ color: PALETTE.ink }}>
          <Link href="/agents" className="hover:opacity-70">Agents</Link>
          <Link href="/pricing" className="hover:opacity-70">Pricing</Link>
          <Link href="/trust" className="hover:opacity-70">Trust</Link>
          <Link href="/legal/privacy" className="hover:opacity-70">Privacy</Link>
        </div>
      </div>
      <div className="px-5 pb-8 md:px-8">
        <p className="mx-auto max-w-6xl text-xs" style={{ color: PALETTE.muted }}>
          Every reply is a draft for a human to check before it is sent, filed, or lodged. Not legal,
          financial, or medical advice.
        </p>
      </div>
    </footer>
  );
}
