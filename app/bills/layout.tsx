import type { Metadata } from 'next';
import type { ReactNode, CSSProperties } from 'react';
import { DM_Sans, Inter } from 'next/font/google';
import { themeVars } from './theme';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-bills-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-bills-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Assembl Bills — the agentic operating system for your household bills.',
  description:
    'Assembl Bills ingests your NZ power, broadband, insurance, council and subscription bills, tracks the cost, and proactively surfaces cheaper alternatives — grounded in Powerswitch and Consumer NZ. Recommends; you switch. Built by assembl.',
  openGraph: {
    title: 'Assembl Bills — stop overpaying on your NZ household bills.',
    description:
      'An AI operating system for household bills. Email + upload + open banking in; proactive savings, hidden-cost detection and NZ provider intelligence out. Join the waitlist.',
    type: 'website',
    siteName: 'Assembl Bills',
  },
  // Demo surface — never indexed. Same posture as Alphassembl.
  robots: { index: false, follow: false },
};

export default function BillsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} ${inter.variable} min-h-screen`}
      style={{
        ...(themeVars as CSSProperties),
        background: 'var(--b-paper)',
        color: 'var(--b-ink)',
        fontFamily: 'var(--font-bills-body), system-ui, sans-serif',
      }}
      data-assembl-bills
    >
      {children}
    </div>
  );
}
