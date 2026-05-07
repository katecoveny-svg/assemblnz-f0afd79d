'use client';

interface ChipRowProps<T extends string> {
  options: readonly T[];
  selected: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}

export function ChipRow<T extends string>({
  options,
  selected,
  onChange,
  ariaLabel,
}: ChipRowProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const isOn = selected === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={isOn}
            aria-pressed={isOn}
            onClick={() => onChange(opt)}
            className={[
              'rounded-[2px] border px-3 py-1.5 font-mono text-xs lowercase tracking-[0.06em] transition-colors',
              isOn
                ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]',
            ].join(' ')}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
