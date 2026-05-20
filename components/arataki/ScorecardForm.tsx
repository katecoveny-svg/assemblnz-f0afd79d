'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ScorecardQuestion } from './ScorecardQuestion';
import {
  categoryLabels,
  encodeScores,
  scorecardQuestions,
  type ScoreCategory,
} from '@/lib/arataki/scorecard';

type Answers = Record<number, number>;

export function ScorecardForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(scorecardQuestions.map((question) => [question.id, 2])),
  );
  const scores = useMemo(() => {
    const next: Record<ScoreCategory, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const question of scorecardQuestions) {
      next[question.category] += answers[question.id] ?? 0;
    }
    return next;
  }, [answers]);

  function submit() {
    router.push(`/kete/arataki/diagnostic/result?scores=${encodeURIComponent(encodeScores(scores))}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
      <aside className="rounded-[8px] border border-[#C8BBA9]/70 bg-white/62 p-5 lg:sticky lg:top-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#2B6B57]">Live score</p>
        <div className="mt-5 space-y-4">
          {(Object.keys(categoryLabels) as ScoreCategory[]).map((category) => (
            <div key={category}>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#5C6273]">{categoryLabels[category]}</span>
                <span className="font-medium text-[#3D4250]">{scores[category]} / 16</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#C8BBA9]/45">
                <div className="h-full rounded-full bg-[#2B6B57]" style={{ width: `${(scores[category] / 16) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={submit} className="cta-primary mt-6 inline-flex h-12 w-full items-center justify-center px-5">
          See result <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </button>
      </aside>
      <section className="space-y-5">
        {scorecardQuestions.map((question) => (
          <ScorecardQuestion
            key={question.id}
            question={question}
            value={answers[question.id] ?? 0}
            onChange={(points) => setAnswers((current) => ({ ...current, [question.id]: points }))}
          />
        ))}
      </section>
    </div>
  );
}
