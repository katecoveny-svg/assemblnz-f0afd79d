import type { Metadata } from 'next';
import type { ReactNode, CSSProperties } from 'react';
import { Syne, Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';
import { themeVars } from './theme';
import { BillsAtmosphere } from '@/components/bills/BillsAtmosphere';
import { OsMotionField, OsParallaxPattern } from '@/components/ops/shared/OsMotion';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-bills-display',
  display: 'swap',
  weight: ['600', '700', '800'],
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-bills-body',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-bills-mono',
  display: 'swap',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'assembl bills — the agentic operating system for your household bills.',
  description:
    'assembl bills ingests your NZ power, broadband, insurance, council and subscription bills, tracks the cost, and proactively surfaces cheaper alternatives — grounded in Powerswitch and Consumer NZ. Recommends; you switch. Built by assembl.',
  openGraph: {
    title: 'assembl bills — stop overpaying on your NZ household bills.',
    description:
      'An agentic operating system for household bills. Email + upload + open banking in; proactive savings, hidden-cost detection and NZ provider intelligence out. Join the waitlist.',
    type: 'website',
    siteName: 'assembl bills',
  },
  robots: { index: false, follow: false },
};

export default function BillsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${syne.variable} ${jakarta.variable} ${spaceMono.variable} relative min-h-screen overflow-hidden`}
      style={{
        ...(themeVars as CSSProperties),
        background: 'var(--b-paper)',
        color: 'var(--b-ink)',
        fontFamily: 'var(--font-bills-body), system-ui, sans-serif',
      }}
      data-assembl-bills
    >
      <BillsAtmosphere />
      <OsParallaxPattern
        src="/brand/assembl-bills/pattern-ledger.svg"
        opacity={0.09}
        size={360}
      />
      <OsMotionField accent="#5AADA0" secondary="#E9C46A" intensity="medium" className="z-[1]" />
      <div className="relative z-10">{children}</div>
      <style>{`
        @keyframes bills-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .bills-rise { animation: bills-rise .6s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .bills-rise { animation: none; } }
        [data-assembl-bills] ::selection { background: rgba(90,173,160,0.3); }
      `}</style>
    </div>
  );
}
