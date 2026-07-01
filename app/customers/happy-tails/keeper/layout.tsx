import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Inter, Space_Mono } from 'next/font/google';
import './keeper.css';

/**
 * Happy Tails × Keeper — tenant workspace layout.
 *
 * Loads the tenant's own type (Cormorant serif + Inter sans, matching their
 * Welcome Pack) and scopes it under .keeper-root. The global assembl SiteHeader,
 * SiteFooter and concierge widget are suppressed on this route via
 * isHappyTailsKeeper() so the tenant instance is never diluted with assembl chrome.
 *
 * demo · pending Liana sign-off.
 */

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-keeper-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-keeper-sans',
  display: 'swap',
});

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-keeper-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Happy Tails · Keeper workspace',
  description:
    'Happy Tails Daycare & Boarding — Keeper pilot workspace. Demo, pending Liana sign-off.',
  robots: { index: false, follow: false },
};

export default function KeeperLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`keeper-root ${serif.variable} ${sans.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
