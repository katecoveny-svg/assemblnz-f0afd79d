'use client';

import type { ScorecardQuestion as Question } from '@/lib/arataki/scorecard';

export function ScorecardQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: number;
  onChange: (points: number) => void;
}) {
  return (
    <fieldset className="rounded-[8px] border border-[#C8BBA9]/70 bg-white/64 p-5">
      <legend className="font-display text-2xl font-light leading-tight text-[#3D4250]">
        {question.id}. {question.prompt}
      </legend>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => (
          <label
            key={`${question.id}-${option.points}`}
            className={[
              'cursor-pointer rounded-[8px] border px-4 py-3 text-sm transition',
              value === option.points
                ? 'border-[#3A3832] bg-[#3A3832] text-[#FFF7EC]'
                : 'border-[#C8BBA9]/70 bg-white/58 text-[#3D4250] hover:border-[#3A3832]/50',
            ].join(' ')}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              value={option.points}
              checked={value === option.points}
              onChange={() => onChange(option.points)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
