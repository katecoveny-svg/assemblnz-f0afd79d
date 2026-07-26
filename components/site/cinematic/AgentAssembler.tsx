'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * The assembler — six parts, one core, click to place.
 *
 * The company is called assembl and nothing on the site let you assemble
 * anything. This does, and it doubles as the clearest statement of the
 * architecture: one job per part, each with a written authority level, and
 * nothing that reaches a customer allowed past "draft" on its own.
 *
 * The part list is fixed so it always works. When a blueprint has been read
 * from a visitor's own site, the parts wear that business's labels instead of
 * the generic ones — strongest when the read succeeded, still whole when it
 * did not, which matters because some sites refuse us outright.
 */

export type AssemblerBrief = {
  business?: string;
  sells?: string[];
  voice?: string;
  blindSpots?: string[];
  brand?: { palette?: string[] };
};

type Part = {
  id: string;
  name: string;
  /** Where it sits around the core, in degrees clockwise from twelve. */
  angle: number;
  job: string;
  authority: 'observe' | 'draft' | 'recommend' | 'act with approval';
  /** Swapped for something from the visitor's own business when we have one. */
  detail: (b?: AssemblerBrief) => string;
};

const PARTS: Part[] = [
  {
    id: 'knowledge',
    name: 'What you know',
    angle: 0,
    job: 'Holds what you sell, what you charge and how you talk.',
    authority: 'observe',
    detail: (b) =>
      b?.sells?.length
        ? `Read from your site: ${b.sells.slice(0, 3).join(' · ')}`
        : 'Your services, your prices, your words — written down once.',
  },
  {
    id: 'signals',
    name: 'What it notices',
    angle: 60,
    job: 'Watches for work coming due, things lapsing, people gone quiet.',
    authority: 'observe',
    detail: () => 'A warranty ending. A booking not followed up. Silence since March.',
  },
  {
    id: 'ability',
    name: 'What it can do',
    angle: 120,
    job: 'One job, and a written list of what it may touch.',
    authority: 'draft',
    detail: (b) =>
      b?.sells?.length
        ? `For you that would start with ${b.sells[0]!.toLowerCase()}.`
        : 'Draft the quote. Prepare the booking. Pull the claim together.',
  },
  {
    id: 'boundary',
    name: 'Where it stops',
    angle: 180,
    job: 'The things it will never do on its own, in writing.',
    authority: 'draft',
    detail: () => 'No sending. No spending. No promise you have not seen.',
  },
  {
    id: 'approval',
    name: 'Your yes',
    angle: 240,
    job: 'A named person, and nothing consequential without them.',
    authority: 'act with approval',
    detail: () => 'It waits. You read it. Then it goes.',
  },
  {
    id: 'proof',
    name: 'The flight log',
    angle: 300,
    job: 'What it read, what it wrote, who approved it, how long it took.',
    authority: 'recommend',
    detail: () => 'Measured numbers and calculated ones kept apart, and labelled.',
  },
];

const R = 39; // port distance from centre, in % of the stage

function portPos(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: 50 + Math.cos(rad) * R, y: 50 + Math.sin(rad) * R };
}

export function AgentAssembler({ brief: given }: { brief?: AssemblerBrief } = {}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [last, setLast] = useState<Part | null>(null);
  const [heard, setHeard] = useState<AssemblerBrief | null>(null);

  // Pick up a blueprint read elsewhere on the page, so the parts wear the
  // visitor's own business rather than the generic labels. Reads what is
  // already stored first, in case they arrived after a reload.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('assembl:brief');
      if (stored) setHeard(JSON.parse(stored) as AssemblerBrief);
    } catch {
      /* private mode, or something else wrote nonsense there */
    }
    const onBrief = (e: Event) => {
      const detail = (e as CustomEvent).detail as AssemblerBrief | undefined;
      if (detail) setHeard(detail);
    };
    window.addEventListener('assembl:brief', onBrief);
    return () => window.removeEventListener('assembl:brief', onBrief);
  }, []);

  const brief = given ?? heard ?? undefined;

  const accent = brief?.brand?.palette?.[0];
  const done = placed.length === PARTS.length;

  const place = useCallback((p: Part) => {
    setPlaced((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
    setLast(p);
  }, []);

  const reset = useCallback(() => {
    setPlaced([]);
    setLast(null);
  }, []);

  const who = useMemo(() => {
    if (!brief?.business) return null;
    // The blueprint's opening line is a full sentence — "Kowhai Plumbing is an
    // Auckland plumbing and gasfitting firm" — and dropping the whole thing
    // into a caption reads as a mistake. Take the subject: everything before
    // the verb that starts the description.
    const first = brief.business.split(/[.;]/)[0]!.trim();
    const subject = first.split(
      /\s+(?:is|are|was|were|operates|provides|offers|supplies|sells|specialises|specializes|delivers|runs|helps)\b/i,
    )[0]!.trim();
    const name = (subject || first).replace(/[,–—-]\s*$/, '').trim();
    // If it is still a mouthful it was never a name, so say nothing.
    return name.length >= 2 && name.length <= 42 ? name : null;
  }, [brief]);

  return (
    <div className="asm" style={accent ? ({ ['--asm-accent' as string]: accent }) : undefined}>
      <div className="asm-stage" role="group" aria-label="Agent assembler">
        <svg className="asm-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {PARTS.map((p) => {
            const { x, y } = portPos(p.angle);
            const on = placed.includes(p.id);
            return (
              <line
                key={p.id}
                x1="50" y1="50" x2={x} y2={y}
                className={`asm-wire${on ? ' on' : ''}`}
              />
            );
          })}
        </svg>

        <div className={`asm-core${done ? ' done' : ''}`} data-count={placed.length}>
          <span className="asm-core-n">{placed.length}</span>
          <span className="asm-core-of">of six</span>
        </div>

        {PARTS.map((p) => {
          const { x, y } = portPos(p.angle);
          const on = placed.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className={`asm-port${on ? ' on' : ''}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => place(p)}
              aria-pressed={on}
              aria-label={`${p.name} — ${p.job}`}
            >
              <span className="asm-port-dot" />
              <span className="asm-port-name">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="asm-tray">
        {PARTS.map((p) => {
          const on = placed.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className={`asm-chip${on ? ' on' : ''}`}
              onClick={() => place(p)}
              disabled={on}
            >
              <span className="asm-chip-name">{p.name}</span>
              <span className="asm-chip-auth">{p.authority}</span>
            </button>
          );
        })}
      </div>

      <div className="asm-read" aria-live="polite">
        {!last && (
          <p className="asm-read-empty">
            Six parts. Place them and watch what you get —
            {who ? <> for <b>{who}</b>.</> : <> each one does a single job.</>}
          </p>
        )}
        {last && !done && (
          <>
            <div className="asm-read-head">
              {last.name} <span className="asm-read-auth">{last.authority}</span>
            </div>
            <p className="asm-read-job">{last.job}</p>
            <p className="asm-read-detail">{last.detail(brief)}</p>
          </>
        )}
        {done && (
          <>
            <div className="asm-read-head asm-read-done">
              That is an agent{who ? <> for {who}</> : null}.
            </div>
            <p className="asm-read-job">
              Six parts, one job each, and a written limit on every one of them. Nothing that reaches
              a customer gets past <b>draft</b> without your yes.
            </p>
            <p className="asm-read-detail">
              {brief?.blindSpots?.length
                ? `It would also know what your site never answers — ${brief.blindSpots[0]!.toLowerCase()}`
                : 'A second agent for a different job reuses everything above it.'}
            </p>
            <button type="button" className="asm-again" onClick={reset}>
              take it apart ↺
            </button>
          </>
        )}
      </div>
    </div>
  );
}
