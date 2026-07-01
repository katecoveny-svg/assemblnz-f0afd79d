import type { Metadata } from 'next';
import { Fraunces, Inter, Space_Mono } from 'next/font/google';
import { HospoShell } from '@/components/customers/lula-inn/HospoShell';

// The Lula Inn side uses Fraunces (warm editorial serif — the elevated-casual
// waterfront feel) for display, Inter for body, and Space Mono for labels
// (assembl label canon). All scoped to this subtree via CSS variables.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--lula-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--lula-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--lula-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Lula Inn × assembl — hospo ops (concept)',
  robots: { index: false, follow: false },
};

export default function LulaHospoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${fraunces.variable} ${inter.variable} ${spaceMono.variable}`}>
      <HospoShell>{children}</HospoShell>
    </div>
  );
}
