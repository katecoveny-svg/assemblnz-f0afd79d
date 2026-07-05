import { GlassCard, SectionHead } from '@/components/ops/moana/GlassCard';
import { MoanaChat } from '@/components/ops/moana/MoanaChat';

/**
 * Jack's wharf — Mangawhai estuary. The personal, local hook: a kid-friendly
 * plan for fishing off the estuary wharf, with the LIVE Tide & Weather / Catch
 * Log agent primed for Mangawhai. All guidance is general + honest — real
 * tides on LINZ, real rules on MPI, and the Mangawhai bar is never for kids.
 */

const SPECIES = [
  { name: 'Parore', note: 'Grazes the pylons — bread, weed or mussel. Great first fish.' },
  { name: 'Spotties', note: 'Everywhere off the wharf. Tiny hook, bit of bait, non-stop fun.' },
  { name: 'Yellow-eyed mullet (aua)', note: 'Schools in the estuary — light rig, small hook.' },
  { name: 'Kahawai', note: 'Hit the run-out tide — a small lure or bait, good scrap for a kid.' },
  { name: 'Snapper (small)', note: 'Estuary pannies. Handle gently, most go back.' },
  { name: 'Flounder', note: 'On the sand at low tide — a set net or spear is a grown-up job.' },
];

export default function JackWharfPage() {
  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        eyebrow="jack's wharf · mangawhai estuary"
        title="A plan for the wharf today."
        intro="The estuary is calm and kid-friendly — a world away from the Mangawhai bar (never cross that without local knowledge and a check with Coastguard). Fish a couple of hours either side of the tide, keep an eye on the water — it drains fast — and lifejackets on near the edge."
      />

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-start">
        <MoanaChat
          agentSlug="catch-log"
          title="Ask Moana · the wharf"
          greeting="Kia ora Jack! Ask me about fishing off the Mangawhai wharf today — what's biting, the best rig for you, or when the tide's right. I'll point you at the real tide and the rules, and nothing here is a substitute for a grown-up alongside."
          placeholder="e.g. what rig for parore off the wharf?"
          openers={[
            'What can I catch off the Mangawhai wharf today?',
            "What's the best rig for a kid off the wharf?",
            'When is the tide right for the estuary?',
            'How do I let a small snapper go safely?',
          ]}
        />

        <GlassCard>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--brand-muted)]">off the wharf</p>
          <div className="mt-3 flex flex-col gap-2.5">
            {SPECIES.map((s) => (
              <div key={s.name} className="border-b border-[#bfa37a]/25 pb-2.5 last:border-0">
                <div className="text-[13.5px] font-semibold text-[color:var(--brand-ink)]">{s.name}</div>
                <div className="text-[12px] leading-relaxed text-[color:var(--brand-muted)]">{s.note}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--brand-muted)]">
            Sizes &amp; bag limits are regulatory and change — check{' '}
            <a href="https://www.fisheries.govt.nz/travel-and-recreation/fishing/fishing-rules/" target="_blank" rel="noreferrer" className="text-[#2E7D74] underline">MPI&rsquo;s NZ Fishing Rules</a>. Respect rāhui &amp; the estuary.
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { h: 'Tide', b: 'Best off the wharf: ~2 hrs either side of high. Check today on LINZ — the estuary empties quickly on the run-out.', src: ['LINZ tides', 'https://www.linz.govt.nz/sea/tides'] },
          { h: 'Kid rig', b: 'Light rod, running or ledger rig, small hook (size 4–6). Mussel or bread for parore, bait strips for the rest. Keep it simple.', src: null },
          { h: 'Safety', b: 'Lifejacket near the edge, hat + sunscreen, watch the tide and the weather. The bar is dangerous — the estuary is your spot.', src: ['Boating Safety Code', 'https://www.maritimenz.govt.nz/recreational'] },
        ].map((c) => (
          <GlassCard key={c.h}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--brand-muted)]">{c.h}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-ink)]">{c.b}</p>
            {c.src ? (
              <a href={c.src[1]} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] text-[#2E7D74] underline">
                {c.src[0]} ↗
              </a>
            ) : null}
          </GlassCard>
        ))}
      </div>

      <p className="text-[11px] text-center text-[color:var(--brand-muted)]">
        Concept demo · sample local guidance. Always fish with a grown-up, check the real tide and rules, and use your own judgement on the water.
      </p>
    </div>
  );
}
