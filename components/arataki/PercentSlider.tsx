'use client';

import { useId } from 'react';
import { formatPct } from '@/lib/arataki/currency';

type PercentSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function PercentSlider({ label, value, onChange, min = 0, max = 100 }: PercentSliderProps) {
  const inputId = useId();

  return (
    <label htmlFor={inputId} className="block cursor-pointer">
      <span className="mb-2 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C6273] md:tracking-[0.22em]">
        <span className="max-w-[16rem] break-words [overflow-wrap:anywhere] md:max-w-none">{label}</span>
        <span className="text-[#3A3832]">{formatPct(value)}</span>
      </span>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        value={value}
        aria-valuetext={formatPct(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#3A3832] cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3A3832] focus-visible:outline-offset-2 transition-all"
      />
    </label>
  );
}
