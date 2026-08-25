import type { Metadata } from 'next';
import type { ReactNode, CSSProperties } from 'react';
import { themeVars } from './theme';
import { BillsAtmosphere } from '@/components/bills/BillsAtmosphere';
import { OsParallaxPattern } from '@/components/ops/shared/OsMotion';

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
      className="relative min-h-screen overflow-hidden"
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
        opacity={0.06}
        size={360}
      />
      <div className="relative z-10">{children}</div>
      <style>{`
        @keyframes bills-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .bills-rise { animation: bills-rise .6s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .bills-rise { animation: none; } }
        [data-assembl-bills] ::selection { background: rgba(145,106,112,0.22); }
      `}</style>
    </div>
  );
}
