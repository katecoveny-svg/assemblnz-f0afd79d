'use client';

import { useMemo, useState } from 'react';

export type PackOption = {
  slug: string;
  name: string;
  industry: string;
  accent: string;
  agents: string[];
  workflow: string;
};

type PackPickerProps = {
  packs: PackOption[];
};

export function PackPicker({ packs }: PackPickerProps) {
  const [activeSlug, setActiveSlug] = useState(packs[0]?.slug ?? '');
  const activePack = useMemo(
    () => packs.find((pack) => pack.slug === activeSlug) ?? packs[0],
    [activeSlug, packs],
  );

  if (!activePack) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div
        className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
        aria-label="Choose an industry kete"
      >
        {packs.map((pack) => {
          const isActive = pack.slug === activePack.slug;
          return (
            <button
              key={pack.slug}
              type="button"
              onClick={() => setActiveSlug(pack.slug)}
              className="min-w-[210px] border px-4 py-4 text-left transition duration-200 hover:-translate-y-0.5 lg:min-w-0"
              style={{
                background: isActive ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.34)',
                borderColor: isActive ? pack.accent : 'rgba(35,33,31,0.12)',
                boxShadow: isActive ? `0 16px 40px ${pack.accent}18` : 'none',
              }}
            >
              <span
                className="font-mono text-[12px] uppercase tracking-[0.22em]"
                style={{ color: pack.accent }}
              >
                {pack.industry}
              </span>
              <span className="mt-2 block font-display text-2xl font-light leading-none text-[color:var(--text-primary)]">
                {pack.name}
              </span>
            </button>
          );
        })}
      </div>

      <article
        className="border bg-white/55 p-6 md:p-10"
        style={{ borderColor: `${activePack.accent}55` }}
      >
        <p
          className="font-mono text-[12px] uppercase tracking-[0.28em]"
          style={{ color: activePack.accent }}
        >
          {activePack.name} · Pack preview
        </p>
        <h3 className="mt-4 font-display text-4xl font-light leading-[0.98] text-[color:var(--text-primary)] md:text-5xl">
          The first operating loop.
        </h3>
        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Named agents
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activePack.agents.map((agent) => (
                <span
                  key={agent}
                  className="border bg-[color:var(--assembl-paper)] px-3 py-2 text-sm text-[color:var(--text-primary)]"
                  style={{ borderColor: `${activePack.accent}33` }}
                >
                  {agent}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              First workflow
            </p>
            <p className="mt-4 text-base leading-relaxed text-[color:var(--text-body)]">
              {activePack.workflow}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
