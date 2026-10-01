import localFont from 'next/font/local';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Space_Mono } from 'next/font/google';
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

const serif = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '600', style: 'normal' },
  ],
  style: 'normal',
  variable: '--font-keeper-serif',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Cormorant Garamond Build Fallback'],
});

const sans = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '700', style: 'normal' },
  ],
  style: 'normal',
  variable: '--font-keeper-sans',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Inter Build Fallback'],
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
