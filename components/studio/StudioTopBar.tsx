'use client';

import Link from 'next/link';
import { useStudioStore, type ViewMode } from '@/lib/studio/store';

const MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: 'build',    label: 'Build',    hint: 'Assemble the agent' },
  { id: 'x-ray',    label: 'X-ray',    hint: 'How components relate' },
  { id: 'activity', label: 'Activity', hint: 'Test trace' },
];

export function StudioTopBar() {
  const agent = useStudioStore((s) => s.agent);
  const viewMode = useStudioStore((s) => s.viewMode);
  const setViewMode = useStudioStore((s) => s.setViewMode);
  const saveStatus = useStudioStore((s) => s.saveStatus);
  const runTest = useStudioStore((s) => s.runTest);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-3 md:px-6">
      <div className="flex items-baseline gap-3">
        <Link
          href="/"
          className="font-display text-[22px] font-light lowercase tracking-[-0.005em] text-[color:var(--text-primary)]"
        >
          assembl<span className="text-[color:var(--assembl-gold-thread)]">.</span>
        </Link>
        <span className="hidden font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)] md:inline">
          studio
        </span>
        <span className="mx-2 hidden text-[color:var(--assembl-cloud)] md:inline">·</span>
        <span className="font-display text-[18px] font-light lowercase text-[color:var(--text-primary)]">
          {agent.name}
        </span>
        <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          {saveStatus === 'saved' ? 'saved' : saveStatus === 'saving' ? 'saving…' : 'unsaved'}
        </span>
      </div>

      <div className="flex items-center gap-1.5" role="tablist" aria-label="view mode">
        {MODES.map((m) => {
          const active = viewMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setViewMode(m.id)}
              className={[
                'rounded-[2px] border px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] transition',
                active
                  ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                  : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]',
              ].join(' ')}
              title={m.hint}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={runTest}
          className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)]"
        >
          Test agent
        </button>
        <button
          type="button"
          className="rounded-[2px] border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)] hover:bg-[color:var(--assembl-pounamu-deep)]"
        >
          Deploy
        </button>
      </div>
    </header>
  );
}
