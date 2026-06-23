'use client';

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
};

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1000000,
  step = 1,
  prefix,
}: NumberInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block max-w-[16rem] break-words font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C6273] [overflow-wrap:anywhere] md:max-w-none md:tracking-[0.22em]">
        {label}
      </span>
      <span className="flex h-12 items-center rounded-[8px] border border-[#C8BBA9]/70 bg-white/78 px-3 focus-within:border-[#3A3832]">
        {prefix ? <span className="mr-2 font-mono text-sm text-[#9D8C7D]">{prefix}</span> : null}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) return onChange(min);
            onChange(Math.max(min, Math.min(max, next)));
          }}
          className="h-full w-full bg-transparent text-base text-[#3D4250] outline-none"
        />
      </span>
    </label>
  );
}
