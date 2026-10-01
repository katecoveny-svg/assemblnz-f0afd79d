import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { Roboto, Space_Mono } from 'next/font/google';
import { EdrShell } from '@/components/customers/everyday-rewards/EdrShell';

// Everyday Rewards uses Roboto. assembl side of the lockup uses Cormorant
// Garamond (display) + Space Mono (labels). All scoped to this subtree.
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--edr-body',
  display: 'swap',
});

const cormorant = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '600', style: 'italic' },
  ],
  variable: '--edr-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Cormorant Garamond Build Fallback'],
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--edr-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Everyday Rewards × assembl — attribution pilot (concept)',
  robots: { index: false, follow: false },
};

export default function EverydayRewardsDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${roboto.variable} ${cormorant.variable} ${spaceMono.variable}`}>
      <EdrShell>{children}</EdrShell>
    </div>
  );
}
