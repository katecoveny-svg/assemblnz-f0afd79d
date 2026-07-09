import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';

export const metadata: Metadata = {
  title: 'Fred OS — Auckland Dog Trainer (concept) · assembl',
  description:
    'Concept pilot: Learn To Talk Dog operating system for Fred — intake, session notes to homework, programmes, course builder, support triage, and trainer hiring. Draft-only.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Fred OS workspace shell. Navy + pale pink brand direction; sidebar mirrors
 * the in-page tab bar so each section is one server-rendered view via ?tab=.
 */
const NAV: Array<[string, string]> = [
  ['Overview', '?tab=overview'],
  ['Leads', '?tab=leads'],
  ['Dogs', '?tab=dogs'],
  ['Programmes', '?tab=programmes'],
  ['Notes engine', '?tab=notes'],
  ['Course', '?tab=course'],
  ['Support', '?tab=support'],
  ['Hiring', '?tab=hiring'],
];

export default function AucklandDogTrainerOpsLayout({ children }: { children: ReactNode }) {
  const config = getBrandConfig('auckland-dog-trainer');
  if (!config) notFound();

  return (
    <OpsShell
      config={config}
      nav={NAV}
      rightRail={
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--brand-muted)]">
              how it works
            </p>
            <ol className="mt-3 flex flex-col gap-2.5 text-[12.5px] leading-relaxed text-[color:var(--brand-ink)]">
              <li>
                <strong>1. Intake</strong> triages the dog–human team into the right offer.
              </li>
              <li>
                <strong>2. Session notes</strong> become homework, CRM, and follow-ups.
              </li>
              <li>
                <strong>3. Programmes</strong> track weekly progress and video uploads.
              </li>
              <li>
                <strong>4. Course + hiring</strong> scale the method without diluting it.
              </li>
            </ol>
            <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--brand-muted)]">
              Draft-only concept. Nothing emails a client or books a session without Fred&apos;s yes.
            </p>
          </div>
          <div className="rounded-2xl border border-[#D4A5B0]/50 bg-[#F7EEF1] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--brand-muted)]">
              pitch line
            </p>
            <p
              className="mt-2 text-[14px] leading-relaxed text-[color:var(--brand-ink)]"
              style={{ fontFamily: 'var(--font-brand-display), Georgia, serif' }}
            >
              You&apos;re busy because your expertise is trapped in your head. Fred OS turns consults,
              methods, and client questions into a working operating system.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </OpsShell>
  );
}
