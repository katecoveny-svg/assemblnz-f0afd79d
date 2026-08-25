'use client';

import {
  activeFlagNegatives,
  activeNegatives,
  getKete,
} from '@/lib/vessel-studio/keteOptions';

interface NegativeAnchorChipsProps {
  keteId: string;
}

export function NegativeAnchorChips({ keteId }: NegativeAnchorChipsProps) {
  const k = getKete(keteId);
  const flagSet = new Set(activeFlagNegatives(k));
  const all = activeNegatives(k);
  const seen = new Set<string>();
  const chips: { token: string; isFlag: boolean }[] = [];
  for (const a of all) {
    if (seen.has(a)) continue;
    seen.add(a);
    chips.push({ token: a, isFlag: flagSet.has(a) });
  }

  return (
    <div className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40 px-4 py-3.5">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          negative anchors · always pinned
        </span>
        <span className="font-mono text-[12px] tracking-[0.12em] text-[color:var(--text-secondary)]">
          {chips.length} pinned
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-label="negative anchors">
        {chips.map(({ token, isFlag }) => (
          <span
            key={token}
            className="inline-flex items-center rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2.5 py-1 font-mono text-[12px] font-light lowercase tracking-[0.06em] text-[color:var(--text-secondary)]"
            title={isFlag ? `--no ${token}` : `body inline: no ${token}`}
          >
            <span className="mr-1.5 text-[color:#B85C38]">−</span>
            {token}
          </span>
        ))}
      </div>
      <p className="mt-3 font-mono text-[12px] leading-[1.65] tracking-[0.02em] text-[color:var(--text-secondary)]">
        these are doing work. each one keeps midjourney (and flux) from drifting toward something
        off-brand — text overlays, kōwhaiwhai patterns, carvings, neon/sci-fi tropes, and the
        architectural caged look (armature, cage, rails, spine, metal frame).
        <br />
        <br />
        <em>brass at the base</em> — the small wire display stand the cream stoneware sits on — is
        now part of the canonical look, which is why <em>brass</em> and <em>metal</em> are no
        longer in the negative list. what stays banned is brass running THROUGH the form:
        armatures, cages, rails, spines, metal frames binding the plates together. linear gold
        lines, route lines, trajectories, threads, and wires through the form also stay banned.
      </p>
    </div>
  );
}
