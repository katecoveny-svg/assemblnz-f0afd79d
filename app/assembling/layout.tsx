import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './dash-kit.css';
import './birdie.css';
import './assembling-canon.css';
import { dashFontVars } from './fonts';

/**
 * Assembling by assembl microsite shell — Birdie Direction chrome.
 *
 * Faithful to the design handoff: a top scroll-progress bar, the slim canary
 * marquee, a blurred white sticky nav (assembling wordmark + canary bar), and the
 * minimal footer. Self-contained — the global SiteHeader/SiteFooter are
 * suppressed on /assembling routes. Type is Lato + Space Mono via next/font.
 * Palette: white + canary + charcoal text. No black, no green.
 */

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

export const metadata: Metadata = {
  // Production 301s to the www host, so every /assembling canonical + OG url must
  // resolve to www. Overriding metadataBase here (deeper than the root layout's
  // non-www value) makes all relative canonicals/OG on /assembling routes use www.
  metadataBase: new URL('https://www.assembl.co.nz'),
  icons: {
    icon: [
      { url: '/images/dash/favicons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/dash/favicons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/dash/favicons/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/dash/favicons/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/images/dash/favicons/favicon-180.png', sizes: '180x180', type: 'image/png' }],
  },
};

const MARQUEE_ITEMS = [
  'Get paid to wait',
  'One line to install',
  'Charity at launch · more rewards rolling out',
  'NZ-only · opt-in',
  'Never reads prompts, content, files or code',
];

function Wordmark({ size = 28 }: { size?: number }) {
  // Canon lockup: the assembl wordmark carries the brand; "assembling" rides
  // as the product tag, mono. The canary bar is retired with the rest of Birdie.
  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: Math.round(size * 0.4) }}>
      <span
        style={{
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '0.01em',
          lineHeight: 0.9,
        }}
      >
        assembl
      </span>
      <span
        style={{
          fontFamily: 'var(--font-space-mono, monospace)',
          fontSize: Math.max(9, Math.round(size * 0.34)),
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#B8964F',
        }}
      >
        assembling
      </span>
    </span>
  );
}

export default function DashLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`dash-kit ${dashFontVars}`} style={{ background: '#FFFFFF' }}>
      {/* scroll progress */}
      <div className="bd-progress" aria-hidden />

      {/* slim canary marquee */}
      <div style={{ background: '#0A1626', overflow: 'hidden', whiteSpace: 'nowrap', padding: '9px 0', borderBottom: '1px solid rgba(240,238,233,.1)' }}>
        <div
          className="bd-marquee-track bd-mono"
          style={{ fontSize: 11.5, letterSpacing: '.1em', color: '#BFA37A', textTransform: 'uppercase' }}
        >
          {[0, 1].map((dup) =>
            MARQUEE_ITEMS.map((item, i) => (
              <span key={`${dup}-${i}`}>
                <span style={{ padding: '0 30px' }}>{item}</span>
                <span style={{ opacity: 0.4 }}>✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      {/* nav */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(250,250,247,.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(28,27,24,.1)',
          color: '#1C1B18',
        }}
      >
        <div
          className="bd-nav-inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 72px',
            maxWidth: 1500,
            margin: '0 auto',
          }}
        >
          <Link href="/assembling" aria-label="assembling by assembl — home" style={{ textDecoration: 'none' }}>
            <Wordmark />
          </Link>
          <div
            className="bd-nav-links"
            style={{ display: 'flex', alignItems: 'center', gap: 38, fontSize: 15, fontWeight: 500 }}
          >
            <Link href="/assembling#flagship" className="bd-nav-link">
              How it works
            </Link>
            <Link href="/assembling#rewards" className="bd-nav-link">
              Rewards
            </Link>
            {/* Kate, 30 July 2026: builders/developers are irrelevant to this
                page — nav link removed. The /assembling/for-ai-builders route
                still exists; it is just no longer surfaced here. */}
            <Link href="/assembling/interactive" className="bd-nav-link">
              Play
            </Link>
            <a href="https://assembl.co.nz" className="bd-nav-link">
              About
            </a>
          </div>
          <Link
            href="/assembling#waitlist"
            className="bd-switch"
            style={{
              background: '#BFA37A',
              color: '#3a3832',
              padding: '12px 26px',
              borderRadius: 99,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(212,168,67,.5)',
            }}
          >
            Talk to us
          </Link>
        </div>
      </div>

      {children}

      {/* footer */}
      <div style={{ borderTop: '1px solid #EFEADC', padding: '48px 72px' }}>
        <div
          className="bd-footer-row"
          style={{
            maxWidth: 1500,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Wordmark size={24} />
            <span className="bd-mono" style={{ fontSize: 12, color: '#a8a698' }}>
              by assembl
            </span>
          </div>
          <div
            className="bd-mono"
            style={{
              fontSize: 11.5,
              letterSpacing: '.1em',
              color: '#bdb592',
              textTransform: 'uppercase',
            }}
          >
            A reward layer for the wait.
          </div>
          <a
            href="https://assembl.co.nz"
            className="bd-mono"
            style={{ fontSize: 12, color: '#a8a698', textDecoration: 'none' }}
          >
            assembl.co.nz/assembling
          </a>
        </div>

        {/* legal sub-row (kept so /assembling/terms etc. remain reachable) */}
        <div
          className="bd-footer-row"
          style={{
            maxWidth: 1500,
            margin: '24px auto 0',
            paddingTop: 18,
            borderTop: '1px solid #F4EFE4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: '#a8a698',
          }}
        >
          <span>© 2026 ASSEMBL NZ LIMITED · assembling. is an assembl venture · Built in Aotearoa</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <Link href="/assembling/terms" className="bd-textlink" style={{ color: '#a8a698' }}>
              Terms
            </Link>
            <Link href="/assembling/privacy" className="bd-textlink" style={{ color: '#a8a698' }}>
              Privacy
            </Link>
            <Link href="/assembling/copyright" className="bd-textlink" style={{ color: '#a8a698' }}>
              Copyright
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
