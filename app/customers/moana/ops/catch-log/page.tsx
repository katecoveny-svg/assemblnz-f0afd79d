import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { GlassCard, SectionHead } from '@/components/ops/moana/GlassCard';
import { MoanaChat } from '@/components/ops/moana/MoanaChat';

/**
 * Catch log — a MoanaChat pointed at the LIVE `catch-log` agent, plus a sample
 * logbook (placeholder). The agent always directs the user to check current
 * MPI rules; the numbers below are illustrative, not a rules reference.
 */

const SAMPLE: Array<{
  date: string;
  spot: string;
  species: string;
  length: string;
  method: string;
  kept: string;
}> = [
  {
    date: '2026-07-03',
    spot: 'Illustrative — inner harbour',
    species: 'Snapper',
    length: '38 cm',
    method: 'Stray-line, pilchard',
    kept: 'Released (under your area limit — check MPI)',
  },
  {
    date: '2026-07-03',
    spot: 'Illustrative — inner harbour',
    species: 'Kahawai',
    length: '52 cm',
    method: 'Softbait',
    kept: 'Kept · bled + iced',
  },
  {
    date: '2026-06-28',
    spot: 'Illustrative — reef edge',
    species: 'Gurnard',
    length: '41 cm',
    method: 'Ledger rig, squid',
    kept: 'Kept · bled + iced',
  },
];

export default function MoanaCatchLog() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <SectionHead
        eyebrow="catch log"
        title="Log the day"
        intro="Tell the Catch Log agent what you caught and it drafts a clean logbook entry — species, size, method, kept or released. It always reminds you to check the current amateur rules in MPI’s NZ Fishing Rules, because size and bag limits are regulatory, vary by area, and change."
      />

      <section className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-stretch">
        <MoanaChat
          agentSlug="catch-log"
          title="Catch Log"
          greeting="Kia ora. Tell me what you caught — species, rough size, where and how — and I’ll draft a tidy logbook entry. I’ll always point you at MPI’s current NZ Fishing Rules for size and bag limits, because those are regulatory and vary by area. Nothing here is legal advice, and I never send anything."
          placeholder="e.g. Caught a 40cm snapper on softbait at the reef edge…"
          openers={[
            'Draft a logbook entry: 45cm snapper, softbait, kept, bled and iced',
            'What details make a good catch record?',
            'How should I handle and release an undersized fish?',
            'Where do I check the current size and bag limits?',
          ]}
        />

        <GlassCard className="overflow-hidden">
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
            Sample logbook (placeholder)
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[color:var(--brand-muted)]">
            Illustrative entries — not real catches, spots or limits.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[11.5px]">
              <thead>
                <tr className="text-left text-[color:var(--brand-muted)]">
                  <th className="border-b border-white/10 py-2 pr-3 font-medium">Date</th>
                  <th className="border-b border-white/10 py-2 pr-3 font-medium">Species</th>
                  <th className="border-b border-white/10 py-2 pr-3 font-medium">Length</th>
                  <th className="border-b border-white/10 py-2 pr-3 font-medium">Method</th>
                  <th className="border-b border-white/10 py-2 pr-3 font-medium">Kept?</th>
                </tr>
              </thead>
              <tbody className="text-[color:var(--brand-surface)]">
                {SAMPLE.map((r, i) => (
                  <tr key={i} className="align-top">
                    <td className="border-b border-white/5 py-2 pr-3">{r.date}</td>
                    <td className="border-b border-white/5 py-2 pr-3">{r.species}</td>
                    <td className="border-b border-white/5 py-2 pr-3">{r.length}</td>
                    <td className="border-b border-white/5 py-2 pr-3 text-[color:var(--brand-muted)]">
                      {r.method}
                    </td>
                    <td className="border-b border-white/5 py-2 pr-3 text-[color:var(--brand-muted)]">
                      {r.kept}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--brand-muted)]">
            Size and bag limits are set by MPI and differ by area (e.g. SNA1 vs SNA7). Always check
            the current rules — this table is not a limits reference.
          </p>
        </GlassCard>
      </section>
    </div>
  );
}
