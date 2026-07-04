import Link from 'next/link';
import {
  IconBars,
  IconMic,
  IconNodes,
  IconPage,
  IconSeal,
  IconStamp,
} from '@/components/ops/toa/CapabilityGrid';

/**
 * CapabilityTray — the six ARC jobs as a docked row under the BIM viewer on
 * the /demo hub. Compact: icon, name, one plain sentence, and a link to the
 * job's actual output. Consent Companion opens the real Te Aranga design
 * audit PDF (Kate's April artefact, verbatim); the rest land on the matching
 * section of the full ops console.
 */
const OPS = '/customers/toa-architects/ops';
const TE_ARANGA_PDF =
  '/brand/toa-architects/16a-hubert-henderson/te-aranga-design-audit-20260430.pdf';

const JOBS = [
  {
    icon: <IconStamp />,
    name: 'Consent Companion',
    line: 'drafts applications and RFI answers; flags what blocks lodgement.',
    href: TE_ARANGA_PDF,
    cta: 'open the Te Aranga audit (real)',
    external: true,
  },
  {
    icon: <IconPage />,
    name: 'Weekly Client Update',
    line: 'one drafted update per project, every Friday.',
    href: `${OPS}/clients`,
    cta: 'see the 16A draft',
  },
  {
    icon: <IconNodes />,
    name: 'Consultant Orchestrator',
    line: 'who owes what, chased at the right moment.',
    href: `${OPS}/consultants`,
    cta: 'see who owes what',
  },
  {
    icon: <IconBars />,
    name: 'Fee Proposal',
    line: 'brief in — letter + phase spreadsheet out.',
    href: `${OPS}/fees`,
    cta: 'see the 16C + 16D draft',
  },
  {
    icon: <IconSeal />,
    name: 'Producer Statement Chaser',
    line: 'tracks the PS1s and PS3s the CCC needs.',
    href: `${OPS}/documents`,
    cta: 'see the register',
  },
  {
    icon: <IconMic />,
    name: 'Site Visit Report',
    line: 'a voice memo becomes a structured report.',
    href: `${OPS}/site-visits`,
    cta: 'see the 16A walkover',
  },
] as const;

export function CapabilityTray() {
  return (
    <section aria-label="What ARC does" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {JOBS.map((j) => (
        <article
          key={j.name}
          className="flex flex-col gap-2 rounded-xl border border-black/5 bg-white p-4 transition hover:border-[#bfa37a]/60"
        >
          <span className="text-[#161516]">{j.icon}</span>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#161516]">
            {j.name}
          </h3>
          <p className="text-[12px] leading-snug text-[#6f6f64]">{j.line}</p>
          {/* champagne underline links per DIRECTION-LOCKED — never green */}
          {'external' in j && j.external ? (
            <a
              href={j.href}
              target="_blank"
              rel="noreferrer"
              className="mt-auto text-[11px] font-medium text-[#1a1918] underline decoration-[#bfa37a] decoration-2 underline-offset-2 transition hover:text-[#8a744f]"
            >
              {j.cta} →
            </a>
          ) : (
            <Link
              href={j.href}
              className="mt-auto text-[11px] font-medium text-[#1a1918] underline decoration-[#bfa37a] decoration-2 underline-offset-2 transition hover:text-[#8a744f]"
            >
              {j.cta} →
            </Link>
          )}
        </article>
      ))}
    </section>
  );
}
