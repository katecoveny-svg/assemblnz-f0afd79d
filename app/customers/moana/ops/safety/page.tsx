import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { GlassCard, SectionHead, SourceLink } from '@/components/ops/moana/GlassCard';

/**
 * Safety — NZ boating safety essentials, aligned to the Boating Safety Code.
 * General guidance; the official sources (Coastguard NZ, Maritime NZ) are the
 * authority.
 */

const CODE: Array<{ head: string; body: string }> = [
  {
    head: 'Lifejackets',
    body: 'Carry a correctly-sized, serviceable lifejacket for everyone aboard — and wear them. Most drownings happen when they weren’t worn. Kids and non-swimmers wear them at all times.',
  },
  {
    head: 'Two waterproof forms of comms',
    body: 'Carry at least two independent, waterproof ways to call for help — e.g. a VHF radio and a distress beacon (PLB/EPIRB), plus a phone in a waterproof pouch. One can fail.',
  },
  {
    head: 'Log a trip report / bar crossing',
    body: 'Tell someone your plan, or log a trip report with Coastguard (Coastguard app or VHF) — where you’re going and when you’ll be back. Log a bar crossing before you cross so someone’s watching for you.',
  },
  {
    head: 'VHF Channel 16',
    body: 'Ch 16 is the international distress and calling channel. Monitor it. In an emergency: “Mayday, Mayday, Mayday”, your vessel name, position and the nature of the emergency.',
  },
  {
    head: 'Check the marine weather',
    body: 'Check the marine forecast before you go and again on the day. Turn back if it deteriorates — being on the water is optional; getting home is not.',
  },
  {
    head: 'Avoid alcohol · know your limits',
    body: 'Skippering impaired is as dangerous as driving impaired. Know your boat, your crew and your own limits, and don’t overload the boat.',
  },
];

export default function MoanaSafety() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <SectionHead
        eyebrow="safety"
        title="Get home safe"
        intro="The Boating Safety Code is the baseline every skipper carries. It’s simple, and it saves lives. This is general guidance — Maritime NZ and Coastguard NZ are the authority, and the skipper is always responsible for the boat and everyone on it."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {CODE.map((c) => (
          <GlassCard key={c.head}>
            <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">{c.head}</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
              {c.body}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
          Official sources
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--brand-muted)]">
          For the full Boating Safety Code, trip reports and safety information:
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <SourceLink
            href="https://www.coastguard.nz/"
            label="Coastguard New Zealand"
            note="Trip reports, bar-crossing logs, nowcasting and on-water rescue."
          />
          <SourceLink
            href="https://www.maritimenz.govt.nz/recreational/"
            label="Maritime NZ — recreational boating"
            note="The Boating Safety Code, rules and safety equipment guidance."
          />
        </div>
      </GlassCard>
    </div>
  );
}
