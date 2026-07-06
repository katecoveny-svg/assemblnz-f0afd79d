import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { GlassCard, SectionHead, SourceLink } from '@/components/ops/moana/GlassCard';

/**
 * Forecast — marine forecast framing + LIVE reference links.
 *
 * Honesty rule: never fabricate current conditions. This page teaches how to
 * read a marine forecast and sends you to the official live source.
 */
export default function MoanaForecast() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <SectionHead
        eyebrow="forecast"
        title="Read the marine forecast"
        intro="A marine forecast is not a land forecast. It’s built around wind, sea state (swell + wind waves) and visibility, and it’s issued per coastal area. Learn to read it, then always check the live source before you go — conditions change fast."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
            What the numbers mean
          </h2>
          <ul className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            <li>
              <strong className="text-[color:var(--brand-surface)]">Wind</strong> — direction it’s
              blowing <em>from</em>, then speed in knots. “SW 15, rising 25” means a rising
              south-westerly. Gusts can be ~40% above the mean.
            </li>
            <li>
              <strong className="text-[color:var(--brand-surface)]">Sea</strong> — short, steep
              wind-driven waves. This is the chop that makes a small boat uncomfortable.
            </li>
            <li>
              <strong className="text-[color:var(--brand-surface)]">Swell</strong> — long waves
              from distant weather. Height + period + direction. A long-period swell on a shallow
              bar stands up and breaks.
            </li>
            <li>
              <strong className="text-[color:var(--brand-surface)]">Visibility</strong> — “poor”
              often means fog or heavy rain. Carry the means to navigate blind.
            </li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
            Before you commit
          </h2>
          <ul className="mt-2 space-y-2 text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            <li>Check the forecast the night before <em>and</em> on the morning.</li>
            <li>Match the forecast to your boat and your experience, not the other way round.</li>
            <li>Wind against tide steepens the sea — worst at bar mouths and headlands.</li>
            <li>If it’s marginal, it’s a no. The fish will still be there tomorrow.</li>
          </ul>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-sm font-semibold text-[color:var(--brand-surface)]">
          Live sources — Moana never invents current conditions
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--brand-muted)]">
          The numbers on this page are illustrative. For the actual forecast for your area, go
          straight to the official source:
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <SourceLink
            href="https://www.metservice.com/marine"
            label="MetService Marine"
            note="Coastal, recreational and offshore marine forecasts for New Zealand."
          />
          <SourceLink
            href="https://www.coastguard.nz/coastguard-nowcasting/"
            label="Coastguard Nowcasting"
            note="Real-time on-water observations reported by Coastguard units around the coast."
          />
        </div>
      </GlassCard>
    </div>
  );
}
