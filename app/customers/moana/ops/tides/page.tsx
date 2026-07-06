import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { GlassCard, SectionHead, SourceLink } from '@/components/ops/moana/GlassCard';

/**
 * Tides — LINZ tide predictions link + how to read a tide chart. No fabricated
 * live tide numbers; the worked example is clearly illustrative.
 */
export default function MoanaTides() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <SectionHead
        eyebrow="tides"
        title="Reading the tide"
        intro="LINZ (Land Information New Zealand) publishes the official tide predictions for New Zealand ports. Predictions are astronomical — actual water levels shift with wind and barometric pressure — so always read the official source, then watch the water."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
            How to read a prediction
          </h2>
          <ul className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            <li>
              Two highs and two lows most days (semi-diurnal). Times shift roughly 50 minutes
              later each day.
            </li>
            <li>
              Heights are metres above chart datum. Chart datum sits near the lowest tide, so most
              real depths are deeper than the chart shows.
            </li>
            <li>
              The gap between consecutive high and low is the <strong className="text-[color:var(--brand-surface)]">range</strong> — how much water moves, and how hard it moves.
            </li>
            <li>
              Predictions are for a named port. Your spot may lead or lag it — learn the offset for
              where you fish.
            </li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
            Spring vs neap
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            <strong className="text-[color:var(--brand-surface)]">Spring tides</strong> (around the
            new and full moon) have the biggest range — more current, faster flush. Great for
            moving fish, harder to hold bottom.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            <strong className="text-[color:var(--brand-surface)]">Neap tides</strong> (around the
            half moon) have the smallest range — gentler current, easier anchoring, often clearer
            water.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            Why it matters: tide sets the current that carries berley and bait, and the depth over
            a bar or ramp. Slack water (the turn) is often the easiest time to launch and to fish
            structure.
          </p>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
          Illustrative only — get the real times from LINZ
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--brand-muted)]">
          Example of the <em>shape</em> of a day (not real times or heights for any port):
          High ~06:10 (3.1 m) · Low ~12:25 (0.6 m) · High ~18:40 (3.0 m). For the actual
          predictions for your port and date:
        </p>
        <div className="mt-3">
          <SourceLink
            href="https://www.linz.govt.nz/products-services/tides-and-tidal-streams/tide-predictions"
            label="LINZ tide predictions"
            note="Official New Zealand tide predictions by port — the authoritative source."
          />
        </div>
      </GlassCard>
    </div>
  );
}
