'use client';

import type { ReactNode } from 'react';
import {
  DO_WORK_COLUMN_LABEL,
  type DoWorkColumnKey,
} from '@/lib/do/craft-canon';
import '@/app/do/do-craft.css';

export type DoWorkItem = {
  id: string;
  title: string;
  detail?: string;
};

export type DoWorkBoardProps = {
  needsYou?: DoWorkItem[];
  working?: DoWorkItem[];
  done?: DoWorkItem[];
  /** Mono evidence / receipt line under the board. */
  evidenceSlot?: ReactNode;
  /** Shown when all columns empty — e.g. “Record meeting” CTA. */
  empty?: { firstAction: ReactNode; copy?: string };
  title?: string;
  className?: string;
};

const ORDER: DoWorkColumnKey[] = ['needsYou', 'working', 'done'];

/**
 * Per-DO Needs you / Working / Done board (Spatial C).
 * Distinct from PR #1303 DoTaskPanel (human to-do lists) — do not conflate.
 */
export function DoWorkBoard({
  needsYou = [],
  working = [],
  done = [],
  evidenceSlot,
  empty,
  title = 'This DO',
  className,
}: DoWorkBoardProps) {
  const columns: Record<DoWorkColumnKey, DoWorkItem[]> = {
    needsYou,
    working,
    done,
  };
  const total = needsYou.length + working.length + done.length;
  const showEmpty = total === 0 && empty;

  return (
    <section
      className={['do-craft', className].filter(Boolean).join(' ')}
      aria-label={`${title} · Needs you, Working, Done`}
    >
      <p
        className="do-craft-mono"
        style={{
          margin: '0 0 8px',
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--do-rose)',
        }}
      >
        {title} · board
      </p>
      <div className="do-work-board">
        {ORDER.map((key) => {
          const items = columns[key];
          return (
            <div key={key} className="do-work-col">
              <header>
                <h3>{DO_WORK_COLUMN_LABEL[key]}</h3>
                <span>{items.length}</span>
              </header>
              {items.length ? (
                items.map((item) => (
                  <div key={item.id} className="do-work-item">
                    <strong style={{ fontWeight: 500 }}>{item.title}</strong>
                    {item.detail ? (
                      <p className="do-work-empty" style={{ marginTop: 4 }}>
                        {item.detail}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="do-work-empty">
                  {key === 'needsYou'
                    ? 'Nothing needs you yet.'
                    : key === 'working'
                      ? 'Quiet here.'
                      : 'Nothing finished yet.'}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {showEmpty ? (
        <div style={{ marginTop: 4 }}>
          {empty.copy ? <p className="do-work-empty">{empty.copy}</p> : null}
          <div style={{ marginTop: 10 }}>{empty.firstAction}</div>
        </div>
      ) : null}
      {evidenceSlot ? <div className="do-work-evidence">{evidenceSlot}</div> : null}
    </section>
  );
}
