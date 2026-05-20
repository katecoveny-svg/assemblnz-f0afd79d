'use client';

import { formatPct } from '@/lib/arataki/currency';

type PercentSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function PercentSlider({ label, value, onChange, min = 0, max = 100 }: PercentSliderProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C6273] md:tracking-[0.22em]">
        <span className="max-w-[16rem] break-words [overflow-wrap:anywhere] md:max-w-none">{label}</span>
        <span className="text-[#2B6B57]">{formatPct(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#2B6B57]"
      />
    </label>
  );
}
