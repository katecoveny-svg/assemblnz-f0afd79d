'use client';

import { useState } from 'react';

const KETE_CHIPS: Array<{ label: string; color: string }> = [
  { label: 'Pounamu', color: '#2B6B57' },
  { label: 'Gold thread', color: '#D4A853' },
  { label: 'Waihanga clay', color: '#A1623C' },
  { label: 'Manaaki rose', color: '#C26A6A' },
  { label: 'Pīkau slate', color: '#3F5468' },
  { label: 'Arataki indigo', color: '#3B4A7A' },
  { label: 'Auaha plum', color: '#6E3A6F' },
  { label: 'Ako moss', color: '#4A6B3E' },
  { label: 'Mātauranga ink', color: '#23211F' },
  { label: 'Hoko ember', color: '#B85841' },
  { label: 'Tōro sky', color: '#7DA4C8' },
];

const HEX_RE = /^#[0-9a-f]{6}$/i;

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

export function BrandColorPicker({ value, onChange, id = 'brand-color' }: Props) {
  const [draft, setDraft] = useState(value);

  function commit(next: string) {
    setDraft(next);
    if (HEX_RE.test(next)) onChange(next);
  }

  // Keep local draft in sync when parent resets (e.g. brand slug change)
  if (draft !== value && HEX_RE.test(value)) {
    setDraft(value);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-10 w-10 shrink-0 rounded-full border border-[rgba(35,33,31,0.12)]"
          style={{ backgroundColor: HEX_RE.test(draft) ? draft : value }}
        />
        <label htmlFor={id} className="sr-only">
          Brand colour (hex)
        </label>
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => commit(e.target.value)}
          spellCheck={false}
          maxLength={7}
          placeholder="#2B6B57"
          className="font-mono w-32 rounded-md border border-[rgba(35,33,31,0.18)] bg-white px-3 py-2 text-sm tracking-wider text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B6B57]"
        />
        <input
          type="color"
          aria-label="Brand colour swatch picker"
          value={HEX_RE.test(draft) ? draft : value}
          onChange={(e) => commit(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-md border border-[rgba(35,33,31,0.18)] bg-white"
        />
      </div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Or pick a kete colour
        </legend>
        {KETE_CHIPS.map((chip) => (
          <button
            key={chip.color}
            type="button"
            onClick={() => commit(chip.color)}
            aria-label={`Use ${chip.label} (${chip.color})`}
            className="group flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.12)] bg-white px-3 py-1.5 text-xs text-[color:var(--text-secondary)] hover:border-[rgba(35,33,31,0.32)] hover:text-[color:var(--text-primary)]"
          >
            <span
              aria-hidden
              className="block h-3 w-3 rounded-full"
              style={{ backgroundColor: chip.color }}
            />
            {chip.label}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
