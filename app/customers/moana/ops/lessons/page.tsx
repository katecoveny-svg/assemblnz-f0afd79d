import { GlassCard, SectionHead } from '@/components/ops/moana/GlassCard';
import { KidsLessons } from '@/components/ops/moana/KidsLessons';

/**
 * Kids fishing — motion lessons. Short animated how-tos for tamariki
 * (bait a hook, cast safe, tie a hook, let a fish go gently). Animated
 * in-app; a real video can slot into each card later.
 */
export default function MoanaLessonsPage() {
  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        eyebrow="moana · kids lessons"
        title="Learn to fish — the fun way."
        intro="Short animated lessons for tamariki. Watch the moves, then head down to the wharf and give it a go — a grown-up alongside, lifejacket near the water."
      />

      <KidsLessons />

      <GlassCard>
        <p className="text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
          Real video lessons can drop straight into these cards. Everything here is general kid-friendly
          guidance — always fish with a grown-up, wear a lifejacket near the water, handle fish gently and
          check the current rules on{' '}
          <a href="https://www.fisheries.govt.nz/travel-and-recreation/fishing/fishing-rules/" target="_blank" rel="noreferrer" className="text-[#2E7D74] underline">
            MPI&rsquo;s NZ Fishing Rules
          </a>
          . Respect rāhui and marine reserves.
        </p>
      </GlassCard>
    </div>
  );
}
