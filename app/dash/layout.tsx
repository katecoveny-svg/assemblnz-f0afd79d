import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Mulish } from 'next/font/google';
import './dash-kit.css';

/**
 * Dash by assembl microsite shell. Self-contained chrome (its own nav + footer);
 * the global SiteHeader/SiteFooter are suppressed on /dash routes (see
 * components/site/site-header + site-footer → isDashMicrosite).
 *
 * Implements the Gemini "design_handoff_dash_kit" canon, scoped to this subtree:
 * Cormorant Garamond (display, incl. italic for the gold "wait.") + Mulish 400–800
 * (UI/body, incl. the 800 wordmark). Exposed as --font-dash-serif / --font-dash-sans
 * and read by dash-kit.css under the .dash-kit namespace so the new cream/forest/sage
 * palette never bleeds into the rest of assembl.co.nz.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-dash-serif',
  display: 'swap',
});

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dash-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#fbf8ef',
};

export const metadata: Metadata = {
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

function Wordmark() {
  return (
    <span className="wordmark">
      <b>
        dash<i>–</i>
      </b>
      <span>by assembl</span>
    </span>
  );
}

export default function DashLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`dash-kit ${cormorant.variable} ${mulish.variable}`}>
      <div className="wrap">
        <header className="dashNav">
          <Link href="/dash" aria-label="dash by assembl — home" style={{ textDecoration: 'none' }}>
            <Wordmark />
          </Link>
          <nav>
            <Link href="/dash#how">How it works</Link>
            <Link href="/dash#people">For people</Link>
            <Link href="/dash#publishers">For publishers</Link>
            <Link href="/dash#advertisers">For advertisers</Link>
            <Link href="/dash#waitlist" className="btn btn--primary btn--sm">
              Join the waitlist
            </Link>
          </nav>
        </header>
      </div>

      {children}

      <div className="wrap">
        <footer className="dashFoot">
          <div className="footRow">
            <Wordmark />
            <p className="footLinks">
              <Link href="/dash/terms">Terms</Link>
              <Link href="/dash/privacy">Privacy</Link>
              <Link href="/dash/copyright">Copyright</Link>
              <a href="https://assembl.co.nz">assembl.co.nz</a>
            </p>
          </div>
          <p className="footFine">
            © 2026 ASSEMBL NZ LIMITED · dash. is an assembl venture · Built in Aotearoa · Privacy Act
            2020 native · NZ-only inventory
          </p>
        </footer>
      </div>
    </div>
  );
}
