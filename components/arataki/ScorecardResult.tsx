import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  categoryBand,
  categoryLabels,
  categoryRecommendations,
  topRecommendations,
  type ScoreCategory,
} from '@/lib/arataki/scorecard';

export function ScorecardResult({ scores, encoded }: { scores: Record<ScoreCategory, number>; encoded: string }) {
  const total = (Object.keys(categoryLabels) as ScoreCategory[]).reduce((sum, category) => sum + scores[category], 0);
  const imageHref = `/kete/arataki/diagnostic/result/og?scores=${encodeURIComponent(encoded)}`;
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="rounded-[8px] border border-[#3A3832]/45 bg-white/72 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#3A3832]">Total score</p>
        <p className="mt-4 font-display text-[clamp(4rem,10vw,7rem)] font-light leading-none text-[#3D4250]">
          {total} / 80
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#5C6273]">
          This is a directional operator diagnostic. The next step is to compare it with live DMS exports during onboarding.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/pilot-sprint" className="cta-primary inline-flex h-11 items-center px-5">
            Book a Pilot Sprint <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
          <Link href={imageHref} className="btn-ghost inline-flex h-11 items-center px-5">
            Open score image
          </Link>
        </div>
      </aside>
      <section className="space-y-5">
        {(Object.keys(categoryLabels) as ScoreCategory[]).map((category) => (
          <article key={category} className="rounded-[8px] border border-[#C8BBA9]/70 bg-white/62 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3A3832]">Category {category}</p>
                <h2 className="mt-2 font-display text-4xl font-light leading-none">{categoryLabels[category]}</h2>
              </div>
              <span className="rounded-full border border-[#C8BBA9]/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5C6273]">
                {categoryBand(scores[category])}
              </span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[#C8BBA9]/45">
              <div className="h-full rounded-full bg-[#3A3832]" style={{ width: `${(scores[category] / 16) * 100}%` }} />
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#5C6273]">{scores[category]} / 16</p>
            <ul className="mt-4 space-y-2 text-sm text-[#3D4250]">
              {categoryRecommendations(category, scores[category]).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9A85A]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
        <article className="rounded-[8px] border border-[#D9A85A]/55 bg-[#D9A85A]/10 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#3D4250]">Top 3 recommendations</p>
          <ol className="mt-4 space-y-3 text-sm text-[#3D4250]">
            {topRecommendations(scores).map((item, index) => (
              <li key={`${item.category}-${item.text}`} className="flex gap-3">
                <span className="font-mono text-[#3A3832]">{index + 1}.</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </div>
  );
}
