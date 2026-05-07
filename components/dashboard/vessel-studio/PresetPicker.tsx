'use client';

import { KETE_OPTIONS } from '@/lib/vessel-studio/keteOptions';
import type { KeteOption } from '@/lib/vessel-studio/types';

interface PresetPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PresetPicker({ selectedId, onSelect }: PresetPickerProps) {
  return (
    <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="kete form">
      {KETE_OPTIONS.map((k) => (
        <KeteOptionButton
          key={k.id}
          option={k}
          selected={selectedId === k.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function KeteOptionButton({
  option,
  selected,
  onSelect,
}: {
  option: KeteOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
      className={[
        'flex items-baseline justify-between rounded-[2px] border px-3.5 py-2.5 text-left transition-colors',
        selected
          ? 'border-[color:var(--text-primary)] bg-[color:var(--assembl-cloud)]'
          : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] hover:bg-[color:var(--assembl-cloud)]',
      ].join(' ')}
    >
      <span className="font-display text-[22px] font-normal leading-tight text-[color:var(--text-primary)]">
        {option.label}
      </span>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
        {option.pillar}
      </span>
    </button>
  );
}
