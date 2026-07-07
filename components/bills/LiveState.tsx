import { Circle } from 'lucide-react';

export type State = 'live' | 'sample' | 'coming';

const MAP: Record<State, { label: string; dot: string; fg: string; bg: string }> = {
  live: { label: 'Live', dot: '#3E8A88', fg: 'var(--b-teal-deep)', bg: 'var(--b-teal-soft)' },
  sample: { label: 'Sample', dot: '#8A938F', fg: 'var(--b-muted)', bg: 'var(--b-surface-alt)' },
  coming: { label: 'Coming next', dot: '#B8813C', fg: 'var(--b-ochre)', bg: 'var(--b-ochre-soft)' },
};

/**
 * Honest per-surface data-state badge — Live (real API feeding real data),
 * Sample (seeded demo data), or Coming next (connector not wired yet). No page
 * pretends to be live if it isn't. Same trust posture as the other pilots.
 */
export function LiveState({ state, note }: { state: State; note?: string }) {
  const m = MAP[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: m.bg, color: m.fg }}
      title={note}
    >
      <Circle size={7} fill={m.dot} stroke="none" />
      {m.label}
      {note && <span className="font-normal opacity-80">· {note}</span>}
    </span>
  );
}
