import { GlassCard, SectionHead } from '@/components/ops/moana/GlassCard';
import { MoanaChat } from '@/components/ops/moana/MoanaChat';

/**
 * Jack's fishing — land-based (wharf / rock / beach), on foot or scooter.
 * Jack is 13 and keen: current tips, the gear his mates are using, and
 * species matched to his AREA and the season. The LIVE agent is primed for
 * his spots (Mangawhai · Russell / Bay of Islands · Auckland waterfront).
 * Honest throughout — real tides on LINZ, rules on MPI, and rock fishing is
 * flagged as the highest-risk land-based fishing in Aotearoa.
 */

const AREAS = [
  {
    name: 'Mangawhai',
    access: 'walk to the wharf · scooter to the beach',
    spots: 'Estuary wharf, the surf beach, the heads rocks (exposed).',
    biting: 'Parore & spotties off the wharf, kahawai on the run-out, dusk snapper on soft baits off the beach.',
  },
  {
    name: 'Russell / Bay of Islands',
    access: 'walk the waterfront · scooter to the points',
    spots: 'Russell wharf & the Strand, Long Beach (Oneroa), Tapeka Point (rock), Ōkiato.',
    biting: 'Snapper & kahawai off the wharves and points; kingfish for the keen off deeper rock on live bait or stickbait.',
  },
  {
    name: 'Auckland waterfront',
    access: 'all walk / scooter access',
    spots: 'Okahu Bay, Mission Bay, St Heliers, Devonport & Bayswater wharves, Takapuna / Narrow Neck, North Head rocks, Pt Chev, Westhaven.',
    biting: 'Snapper, kahawai, trevally, piper & sprats close in; kingfish off the deeper wharves (Orewa, Army Bay, Shakespear) for LBG.',
  },
];

const GEAR = [
  ['Soft baits', 'Soft plastics on jigheads — the go-to for snapper & bream off wharves and beaches.'],
  ['Micro & slow jigs', 'Little metals / inchiku — deadly around structure and the tide change.'],
  ['Sabiki rigs', 'For sprats, piper & mackerel — great live bait and non-stop fun.'],
  ['Stickbaits & live baits', 'Land-based game (LBG) for kingfish off the deeper wharves and rocks.'],
];

export default function JackFishingPage() {
  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        eyebrow="jack's fishing · land-based"
        title="Pick a spot. Get the current word."
        intro="Wharf, rock and beach — on foot or scooter, no boat needed. Ask Moana what's on right now for your area, the gear worth using, and how to catch what's biting. It reads the real tide and points you at the rules — and it never sugar-coats rock-fishing safety."
      />

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-start">
        <MoanaChat
          agentSlug="catch-log"
          title="Ask Moana · Jack's spots"
          greeting="Chur Jack — where are you fishing today, Mangawhai, the Bay of Islands, or the Auckland waterfront? Tell me the spot and roughly when and I'll give you the current word: what's on, what to throw, and the tide to work. I read the real tide and the rules; the go/no-go on the rocks is always yours and a grown-up's."
          placeholder="e.g. what's on off Okahu Bay this arvo?"
          openers={[
            "What's biting off the Auckland waterfront right now?",
            'Best land-based soft-bait spots I can walk to in Mangawhai?',
            'Land-based kingfish in the Bay of Islands — where and how?',
            'What gear are guys my age using off the wharf?',
          ]}
        />

        <div className="flex flex-col gap-4">
          <GlassCard>
            <p className="text-[12px] uppercase tracking-[0.2em] text-[color:var(--brand-muted)]">gear right now</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {GEAR.map(([h, b]) => (
                <div key={h} className="border-b border-[#bfa37a]/25 pb-2.5 last:border-0">
                  <div className="text-[13.5px] font-semibold text-[color:var(--brand-ink)]">{h}</div>
                  <div className="text-[12px] leading-relaxed text-[color:var(--brand-muted)]">{b}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-[color:var(--brand-muted)]">
              Braid + fluoro leader on a light 7ft spin rod (2500–4000 reel) covers most of it. Cheap and effective beats expensive.
            </p>
          </GlassCard>

          <GlassCard>
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#C97B63]">rock &amp; wharf safety</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-[12px] leading-relaxed text-[color:var(--brand-ink)]">
              <li>Rock fishing is the highest-risk fishing in NZ — never alone, lifejacket on.</li>
              <li>Watch the swell for several sets, never turn your back, know your exit.</li>
              <li>Phone in a dry bag, helmet on the scooter, and tell a parent your plan.</li>
            </ul>
            <a href="https://www.maritimenz.govt.nz/recreational" target="_blank" rel="noreferrer" className="mt-2 inline-block text-[12px] text-[#2E7D74] underline">
              Boating &amp; land-based safety ↗
            </a>
          </GlassCard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {AREAS.map((a) => (
          <GlassCard key={a.name}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13.5px] font-semibold text-[color:var(--brand-ink)]">{a.name}</p>
              <span className="text-[12px] uppercase tracking-[0.14em] text-[#9A7B3A]">on foot / scooter</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--brand-ink)]">{a.spots}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--brand-muted)]">{a.biting}</p>
            <p className="mt-2 text-[12px] text-[color:var(--brand-muted)]">{a.access}</p>
          </GlassCard>
        ))}
      </div>

      <p className="text-[12px] text-center text-[color:var(--brand-muted)]">
        Concept demo · well-known public spots + sample seasonal patterns. Check the real tide on{' '}
        <a href="https://www.linz.govt.nz/sea/tides" target="_blank" rel="noreferrer" className="text-[#2E7D74] underline">LINZ</a> and current size &amp; bag limits on{' '}
        <a href="https://www.fisheries.govt.nz/travel-and-recreation/fishing/fishing-rules/" target="_blank" rel="noreferrer" className="text-[#2E7D74] underline">MPI&rsquo;s NZ Fishing Rules</a>. Respect rāhui, reserves &amp; access, and use your own judgement on the water.
      </p>
    </div>
  );
}
