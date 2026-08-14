import type { Metadata } from 'next';
import { Roboto, Cormorant_Garamond, Space_Mono } from '@/lib/font-fallbacks';

// The "assembled" grocery journey concept runs the shared lib/journey engine
// under the Everyday Rewards brand. Fonts mirror the dash lockup; the pilot
// gate + noindex come from the parent /customers/everyday-rewards layout.
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--edr-body',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--edr-display',
  display: 'swap',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--edr-mono',
  display: 'swap',
});

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
