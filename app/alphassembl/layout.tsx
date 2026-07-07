import type { Metadata } from 'next';
import type { ReactNode, CSSProperties } from 'react';
import { DM_Sans, Inter } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-alpha-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-alpha-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alphassembl — one system. Every part of your dog’s life.',
  description:
    'Alphassembl is the AI operating system for New Zealand dog owners. A force-free trainer, grounded in NZ advice, plus a place for every part of your dog’s life. Built by assembl.',
  openGraph: {
    title: 'Alphassembl — one system. Every part of your dog’s life.',
    description:
      'A force-free dog-training companion for New Zealand owners, grounded in the Dog Control Act 1996, SPCA NZ and Ian Dunbar. Join the waitlist.',
    type: 'website',
    siteName: 'Alphassembl',
  },
  robots: { index: false, follow: false },
};

// Alphassembl brand tokens — navy + amber + white, distinct from assembl chrome.
const brandVars: CSSProperties = {
  ['--a-navy' as string]: '#1a2e4a',
  ['--a-navy-800' as string]: '#22385a',
  ['--a-amber' as string]: '#f59e0b',
  ['--a-amber-600' as string]: '#d97706',
  ['--a-paper' as string]: '#ffffff',
  ['--a-grey' as string]: '#f8f9fa',
  ['--a-ink' as string]: '#1a2e4a',
  ['--a-muted' as string]: '#5b6472',
  ['--a-success' as string]: '#22c55e',
};

export default function AlphassemblLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} ${inter.variable} min-h-screen`}
      style={{
        ...brandVars,
        background: 'var(--a-paper)',
        color: 'var(--a-ink)',
        fontFamily: 'var(--font-alpha-body), system-ui, sans-serif',
      }}
      data-alphassembl
    >
      {children}
    </div>
  );
}
