import { preserveSingleFontStyle } from '@/lib/fonts/local-font-metadata';
import localFont from 'next/font/local';
import type { Metadata } from 'next';

import { EdrShell } from '@/components/customers/everyday-rewards/EdrShell';

// Everyday Rewards uses Roboto. assembl side of the lockup uses Cormorant
// Garamond (display) + Space Mono (labels). All scoped to this subtree.
const robotoLocal = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/roboto-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../../lib/fonts/assets/roboto-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/roboto-normal.woff2', weight: '700', style: 'normal' },
    { path: '../../../../lib/fonts/assets/roboto-normal.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--edr-body',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Roboto Build Fallback'],
});
const roboto = preserveSingleFontStyle(robotoLocal, 'normal');

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

const spaceMonoLocal = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/space-mono-normal-400.woff2', weight: '400', style: 'normal' },
    { path: '../../../../lib/fonts/assets/space-mono-normal-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--edr-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Space Mono Build Fallback'],
});
const spaceMono = preserveSingleFontStyle(spaceMonoLocal, 'normal');

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
