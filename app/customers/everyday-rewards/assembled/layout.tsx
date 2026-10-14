import { preserveSingleFontStyle } from '@/lib/fonts/local-font-metadata';
import localFont from 'next/font/local';
import type { Metadata } from 'next';


// The "assembled" grocery journey concept runs the shared lib/journey engine
// under the Everyday Rewards brand. Fonts mirror the dash lockup; the pilot
// gate + noindex come from the parent /customers/everyday-rewards layout.
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
  title: 'Everyday Rewards × assembl — the assembled shop (concept)',
  robots: { index: false, follow: false },
};

export default function AssembledLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${roboto.variable} ${cormorant.variable} ${spaceMono.variable}`}>
      {children}
    </div>
  );
}
