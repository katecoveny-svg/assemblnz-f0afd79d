import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { GlassCard, SectionHead, SourceLink } from '@/components/ops/moana/GlassCard';

/**
 * Hot spots — how to READ water for fish (structure, current, bait), framed as
 * general guidance, never specific GPS marks. Prominent rāhui / marine-reserve
 * respect note, with the official closures source.
 */
export default function MoanaHotSpots() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <SectionHead
        eyebrow="hot spots"
        title="Reading the water"
        intro="Good fishing is about reading water, not chasing someone’s GPS marks. Learn what holds fish — structure, current and bait — and you’ll find your own spots anywhere. This is general guidance only; Moana does not hand out specific marks."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">Structure</h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            Reefs, foul, drop-offs, channel edges, weed lines and wrecks give fish shelter and
            ambush points. Look for change: where sand meets reef, where the bottom rises or falls.
          </p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">Current</h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            Moving water concentrates food. Fish sit behind structure out of the flow and dart into
            the current to feed. Work the tide — the turns and the run — not just the clock.
          </p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">Bait &amp; signs</h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            Workups, diving birds, bait balls on the sounder and surface flurries mean predators
            are feeding. Find the bait and you find the fish. A little berley extends the window.
          </p>
        </GlassCard>
      </div>

      <GlassCard className="border-[#E1622F]/50">
        <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
          Respect rāhui, marine reserves and mātaitai
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
          Some water is closed or protected. A <strong className="text-[color:var(--brand-surface)]">rāhui</strong> is a
          customary closure placed by tangata whenua — often after a drowning, or to let a fishery
          recover. Honour it. <strong className="text-[color:var(--brand-surface)]">Marine reserves</strong> are no-take
          areas under law. <strong className="text-[color:var(--brand-surface)]">Mātaitai</strong> and taiāpure are
          customary management areas with their own rules. Fishing a closed area is both unlawful
          and a breach of manaakitanga and kaitiakitanga. When in doubt, don’t — check first.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <SourceLink
            href="https://www.fisheries.govt.nz/rules-and-regulations/rules-limits-and-closures/temporary-closures-and-rahui/"
            label="Temporary closures & rāhui (MPI / Fisheries NZ)"
            note="Current customary and temporary closures around Aotearoa."
          />
          <SourceLink
            href="https://www.doc.govt.nz/nature/habitats/marine/type-1-marine-protected-areas-marine-reserves/"
            label="Marine reserves (DOC)"
            note="No-take marine reserves — know the boundaries before you fish near one."
          />
        </div>
      </GlassCard>
    </div>
  );
}
