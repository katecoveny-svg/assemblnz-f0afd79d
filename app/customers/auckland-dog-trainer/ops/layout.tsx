import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { OpsShell } from '@/components/ops/OpsShell';
import { InviteGreeting } from '@/components/ops/InviteGreeting';

export const metadata: Metadata = {
  title: 'Auckland Dog Trainer — Learn To Talk Dog command centre · assembl',
  description:
    'Auckland Dog Trainer operating system — morning brief, Business Genome, landing hub, lead triage, training CRM, programme journeys, course studio, social, time cockpit, hiring, and agent mesh. Draft-only. Fred runs the method.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const NAV: Array<[string, string]> = [
  ["Fred's Week", '?tab=week'],
  ['Morning brief', '?tab=brief'],
  ['Business Genome', '?tab=genome'],
  ['Landing hub', '?tab=landing'],
  ['Lead triage', '?tab=leads'],
  ['Training CRM', '?tab=dogs'],
  ['Programme OS', '?tab=programmes'],
  ['Session scribe', '?tab=notes'],
  ['Course studio', '?tab=course'],
  ['Social studio', '?tab=social'],
  ['Support', '?tab=support'],
  ['Time cockpit', '?tab=time'],
  ['Hiring OS', '?tab=hiring'],
  ['Agent mesh', '?tab=agents'],
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
              command centre
            </p>
            <ol className="mt-3 flex flex-col gap-2.5 text-[12.5px] leading-relaxed text-[color:var(--brand-ink)]">
              <li>
                <strong>1. Business Genome</strong> holds every fact once — every surface reads it.
              </li>
              <li>
                <strong>2. Landing hub</strong> answers “which path?” before you have to.
              </li>
              <li>
                <strong>3. Triage + CRM</strong> create the dog profile and draft reply.
              </li>
              <li>
                <strong>4. Morning brief</strong> suggests one improvement a day — you say yes.
              </li>
            </ol>
            <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--brand-muted)]">
              Draft-only. Nothing emails a client or books a session without your yes.
            </p>
          </div>
          <div className="rounded-2xl border border-[#D4A5B0]/50 bg-[#F7EEF1] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--brand-muted)]">
              the promise
            </p>
            <p
              className="mt-2 text-[14px] leading-relaxed text-[color:var(--brand-ink)]"
              style={{ fontFamily: 'var(--font-brand-display), Georgia, serif' }}
            >
              Scale the method without losing the standard — the operations desk runs the admin;
              you run the training.
            </p>
          </div>
        </div>
      }
    >
      <InviteGreeting demo="auckland-dog-trainer" />
      {children}
    </OpsShell>
  );
}
