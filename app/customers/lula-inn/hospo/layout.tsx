import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import { HospoShell } from '@/components/customers/lula-inn/HospoShell';

// The Lula Inn side uses Fraunces (warm editorial serif — the elevated-casual
// waterfront feel) for display, Inter for body, and Space Mono for labels
// (assembl label canon). All scoped to this subtree via CSS variables.
const fraunces = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/fraunces-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/fraunces-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../../lib/fonts/assets/fraunces-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../../../lib/fonts/assets/fraunces-italic.woff2', weight: '600', style: 'italic' },
  ],
  variable: '--lula-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Fraunces Build Fallback'],
});

const inter = localFont({
  src: [
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../../lib/fonts/assets/inter-normal.woff2', weight: '700', style: 'normal' },
  ],
  style: 'normal',
  variable: '--lula-body',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Inter Build Fallback'],
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
