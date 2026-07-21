'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BuilderScene } from '@/components/studio/BuilderScene';
import { renderBuildCard } from '@/lib/studio/builder-card';
import {
  BUILDER_STEPS,
  EMPTY_PICKS,
  JOB_LABEL,
  picksFromSearch,
  picksToSearch,
  summarise,
  type BuilderPicks,
  type BuilderStepId,
} from '@/lib/studio/builder-options';

const STEP_ORDER: BuilderStepId[] = ['job', 'knowledge', 'abilities', 'apps', 'safety', 'done'];

export function BuilderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => picksFromSearch(searchParams), []);
  const [picks, setPicks] = useState<BuilderPicks>(initial);
  // Land on the first incomplete step when arriving via a share link.
  const [stepIdx, setStepIdx] = useState(() => (initial.job ? (initial.safety.length ? 5 : 1) : 0));
  const [copied, setCopied] = useState(false);

  const step = BUILDER_STEPS[Math.min(stepIdx, BUILDER_STEPS.length - 1)];
  const atSummary = STEP_ORDER[stepIdx] === 'done';

  // Share link always reflects the current build.
  useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace(`?${picksToSearch(picks).toString()}`, { scroll: false });
    }, 350);
    return () => window.clearTimeout(t);
  }, [picks, router]);

  const toggle = useCallback((stepId: BuilderStepId, optionId: string, pick: 'one' | 'many') => {
    setPicks((prev) => {
      if (stepId === 'job') return { ...prev, job: prev.job === optionId ? null : optionId };
      const key = stepId as 'knowledge' | 'abilities' | 'apps' | 'safety';
      const current = prev[key];
      const next = pick === 'one'
        ? [optionId]
        : current.includes(optionId)
          ? current.filter((x) => x !== optionId)
          : [...current, optionId];
      return { ...prev, [key]: next };
    });
  }, []);

  const isSelected = useCallback((stepId: BuilderStepId, optionId: string): boolean => {
    if (stepId === 'job') return picks.job === optionId;
    const key = stepId as 'knowledge' | 'abilities' | 'apps' | 'safety';
    return picks[key].includes(optionId);
  }, [picks]);

  const canAdvance = useMemo(() => {
    switch (STEP_ORDER[stepIdx]) {
      case 'job': return Boolean(picks.job);
      case 'knowledge': return picks.knowledge.length > 0;
      case 'abilities': return picks.abilities.length > 0;
      case 'apps': return true;          // apps are optional
      case 'safety': return picks.safety.length > 0;
      default: return false;
    }
  }, [stepIdx, picks]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?${picksToSearch(picks).toString()}`;
    const title = picks.name.trim() ? `${picks.name.trim()} · built with assembl` : 'my agent · built with assembl';
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, url, text: 'I assembled an agent — here\'s exactly what it knows, does, and asks before doing.' });
        return;
      } catch { /* cancelled → fall through to copy */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [picks]);

  const summary = useMemo(() => summarise(picks), [picks]);

  const buildCard = useCallback(async (): Promise<Blob | null> => {
    return renderBuildCard({
      name: picks.name.trim() || 'your agent',
      jobLabel: picks.job ? JOB_LABEL[picks.job] ?? '' : '',
      knows: summary.knows,
      does: summary.does,
      asks: summary.asks,
    });
  }, [picks, summary]);

  const downloadCard = useCallback(async () => {
    const blob = await buildCard();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(picks.name.trim() || 'my-agent').replace(/\s+/g, '-').toLowerCase()}-assembl.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildCard, picks.name]);

  const shareCard = useCallback(async () => {
    const blob = await buildCard();
    if (!blob) return;
    const file = new File([blob], 'assembl-agent.png', { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };
    if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
      try { await nav.share({ files: [file], title: 'My assembl agent', text: 'An agent I assembled with assembl.' }); return; } catch { /* dismissed */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assembl-agent.png';
    a.click();
    URL.revokeObjectURL(url);
  }, [buildCard]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col gap-6 px-5 py-8 md:px-10">
      <header>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> studio · guided build
        </p>
        <h1 className="mt-3 font-display text-[36px] font-light lowercase leading-[1.0] text-[color:var(--text-primary)] md:text-[52px]">
          assemble an agent.
        </h1>
        <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-[color:var(--text-secondary)]">
          One layer at a time. Every piece you pick appears in the scene, and at the end you can read exactly what your agent knows, does, and asks before doing.
        </p>
      </header>

      {/* Progress dots */}
      <nav aria-label="steps" className="flex items-center gap-1.5">
        {STEP_ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => setStepIdx(Math.min(i, stepIdx > i ? i : stepIdx))}
            disabled={i > stepIdx}
            aria-current={i === stepIdx}
            className={[
              'h-2 rounded-full transition-all',
              i === stepIdx ? 'w-8 bg-[color:var(--text-primary)]'
                : i < stepIdx ? 'w-2 bg-[color:var(--assembl-pounamu)]'
                : 'w-2 bg-[color:var(--assembl-cloud)]',
            ].join(' ')}
            title={id}
          />
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Scene — always visible so every pick is seen landing. */}
        <div className="order-1 h-[300px] md:h-[420px] lg:sticky lg:top-6 lg:order-2 lg:h-[520px]">
          <BuilderScene picks={picks} />
        </div>

        {/* Current layer */}
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          {!atSummary ? (
            <>
              <div>
                <h2 className="font-display text-[26px] font-light text-[color:var(--text-primary)]">{step.title}</h2>
                <p className="mt-1 text-[13.5px] leading-[1.5] text-[color:var(--text-secondary)]">{step.lead}</p>
              </div>
              <div className="flex flex-col gap-2">
                {step.options.map((o) => {
                  const on = isSelected(step.id, o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggle(step.id, o.id, step.pick)}
                      aria-pressed={on}
                      className={[
                        'flex flex-col gap-0.5 rounded-[3px] border px-4 py-3 text-left transition',
                        on
                          ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)]'
                          : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] hover:border-[color:var(--text-primary)]',
                      ].join(' ')}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-mono text-[12.5px] text-[color:var(--text-primary)]">{o.label}</span>
                        <span className={[
                          'font-mono text-[10px] uppercase tracking-[0.16em]',
                          on ? 'text-[color:var(--assembl-pounamu)]' : 'text-[color:var(--text-secondary)]',
                        ].join(' ')}>
                          {on ? 'added' : '+ add'}
                        </span>
                      </span>
                      <span className="text-[12px] leading-[1.5] text-[color:var(--text-secondary)]">{o.means}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {stepIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                    className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  disabled={!canAdvance}
                  onClick={() => setStepIdx((i) => Math.min(STEP_ORDER.length - 1, i + 1))}
                  className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)] disabled:opacity-40"
                >
                  Next layer
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="font-display text-[26px] font-light text-[color:var(--text-primary)]">
                  {picks.job ? `Your ${JOB_LABEL[picks.job]?.toLowerCase() ?? ''} agent.` : 'Your agent.'}
                </h2>
                <p className="mt-1 text-[13.5px] leading-[1.5] text-[color:var(--text-secondary)]">
                  In plain words — no mystery left.
                </p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">name it</span>
                <input
                  type="text"
                  value={picks.name}
                  onChange={(e) => setPicks((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. koro"
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-display text-[18px] lowercase italic text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none"
                />
              </label>

              <SummaryBlock title="It knows" items={summary.knows} empty="Nothing yet — go back and add a knowledge source." />
              <SummaryBlock title="It can" items={summary.does} empty="Nothing yet — go back and add an ability." />
              <SummaryBlock title="It asks you first" items={summary.asks} empty="No safety layer — go back; this is the important part." />

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={share}
                  className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)]"
                >
                  {copied ? 'link copied' : 'share this build'}
                </button>
                <button
                  type="button"
                  onClick={downloadCard}
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
                >
                  download card
                </button>
                <button
                  type="button"
                  onClick={shareCard}
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
                >
                  share card
                </button>
                <Link
                  href="/pilot"
                  className="rounded-[2px] border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)] hover:bg-[color:var(--assembl-pounamu-deep)]"
                >
                  Build it for real
                </Link>
                <button
                  type="button"
                  onClick={() => { setPicks({ ...EMPTY_PICKS }); setStepIdx(0); }}
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
                >
                  Start over
                </button>
                <button
                  type="button"
                  onClick={() => setStepIdx(4)}
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="mt-4 border-t border-[color:var(--assembl-cloud)] pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
        every part in the scene is a real component · the full workbench lives at{' '}
        <Link href="/studio" className="underline decoration-[color:var(--assembl-cloud)] underline-offset-4 hover:decoration-[color:var(--text-primary)]">
          /studio
        </Link>
      </footer>
    </main>
  );
}

function SummaryBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">{title}</div>
      {items.length === 0 ? (
        <p className="mt-2 text-[12.5px] text-[color:var(--text-secondary)]">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {items.map((it, i) => (
            <li key={i} className="text-[13px] leading-[1.55] text-[color:var(--text-primary)]">— {it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
