'use client';

import { useState } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import type { JourneyEvent } from '@/lib/journey/types';
import { Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

/** Events that read as noise in a cinematic cut are de-emphasised, not hidden. */
const MUTED_TYPES = new Set(['agent_completed']);

function clockLabel(iso: string): string {
  const d = new Date(iso);
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  const ss = d.getUTCSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function DirectorsCut({ data }: { data: ScenarioRun }) {
  const { run } = data;
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <Eyebrow>The journey director&rsquo;s cut</Eyebrow>
      <DisplayHeading size={30}>How this journey assembled</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 20px' }}>
        Not logs — the sequence of what happened. Tap any moment to see what changed,
        which agent acted, and the evidence behind it.
      </p>

      <div className={styles.timeline} key={run.id}>
        {run.timeline.map((e) => {
          const muted = MUTED_TYPES.has(e.type);
          const open = openId === e.id;
          return (
            <div
              key={e.id}
              className={styles.tEvent}
              data-muted={muted}
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(open ? null : e.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  setOpenId(open ? null : e.id);
                }
              }}
            >
              <div className={styles.tDot} />
              <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, color: GREY }}>
                {clockLabel(e.timestamp)}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: muted ? GREY : NAVY, marginTop: 4, lineHeight: 1.35 }}>
                {e.summary}
              </div>
              {open ? <EventDetail event={e} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventDetail({ event }: { event: JourneyEvent }) {
  const meta = event.metadata ?? {};
  const entries = Object.entries(meta).filter(([, v]) => v != null && typeof v !== 'object');
  return (
    <div className={styles.assemble} style={{ marginTop: 10, fontSize: 12, color: CHARCOAL, lineHeight: 1.6 }}>
      <div><span style={{ color: GREY }}>type</span> · {event.type.replace(/_/g, ' ')}</div>
      {event.agentId ? <div><span style={{ color: GREY }}>agent</span> · {event.agentId.replace(/-/g, ' ')}</div> : null}
      {event.stageId ? <div><span style={{ color: GREY }}>stage</span> · {event.stageId}</div> : null}
      {entries.map(([k, v]) => (
        <div key={k}><span style={{ color: GREY }}>{k}</span> · {String(v)}</div>
      ))}
    </div>
  );
}
