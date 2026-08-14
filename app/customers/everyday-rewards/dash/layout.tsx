import type { Metadata } from 'next';
import { Roboto, Cormorant_Garamond, Space_Mono } from '@/lib/font-fallbacks';
import { EdrShell } from '@/components/customers/everyday-rewards/EdrShell';

// Everyday Rewards uses Roboto. assembl side of the lockup uses Cormorant
// Garamond (display) + Space Mono (labels). All scoped to this subtree.
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
