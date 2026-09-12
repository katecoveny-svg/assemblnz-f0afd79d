/**
 * Operator desk DEMO — live session craft for wait→earn / Evidence / agents.
 * Paper/chalk · plum/heather · Instrument Sans + IBM Plex Mono.
 * Auto-advancing 7h DEMO replay. status=DEMO always. Homepage `/` untouched.
 */

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ASSEMBL_CANON,
  OPERATOR_DESK_PREVIEW,
  OPERATOR_DESK_REPLAY_MS,
  formatOperatorSessionClock,
  projectOperatorDeskFrame,
  type OperatorDeskCandle,
  type OperatorDeskFrame,
  type OperatorDeskLogTag,
} from '@/lib/loyalty/operator-desk-demo';
import './operator-desk.css';

const THEME = {
  '--od-plum': ASSEMBL_CANON.plum,
  '--od-mulberry': ASSEMBL_CANON.mulberry,
  '--od-heather': ASSEMBL_CANON.heather,
  '--od-chalk': ASSEMBL_CANON.chalk,
  '--od-paper': ASSEMBL_CANON.paper,
} as CSSProperties;

const TAG_CLASS: Record<OperatorDeskLogTag, string> = {
  WAIT: 'od-tag-wait',
  EARN: 'od-tag-earn',
  EVIDENCE: 'od-tag-evidence',
  APPROVE: 'od-tag-approve',
  AGENT: 'od-tag-agent',
  NZ: 'od-tag-nz',
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

function useOperatorDeskReplay(paused: boolean): OperatorDeskFrame {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0.08);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const resumeFromRef = useRef(0.08);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    if (paused) {
      resumeFromRef.current = progressRef.current;
      return;
    }

    let raf = 0;
    const origin = performance.now() - resumeFromRef.current * OPERATOR_DESK_REPLAY_MS;
    const tick = (now: number) => {
      const elapsed = now - origin;
      const looped = (elapsed % OPERATOR_DESK_REPLAY_MS) / OPERATOR_DESK_REPLAY_MS;
      setProgress(looped);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [paused, reduced]);

  return projectOperatorDeskFrame(progress);
}

function ClearanceRing({ rate, wins, losses }: { rate: number; wins: number; losses: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - rate / 100);
  return (
    <div className="od-ring" aria-label={`Clearance rate ${rate} percent DEMO`}>
      <svg viewBox="0 0 88 88" width="88" height="88" aria-hidden="true">
        <circle className="od-ring-track" cx="44" cy="44" r={r} />
        <circle
          className="od-ring-value"
          cx="44"
          cy="44"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <strong>{rate}%</strong>
      <div className="od-ring-meta">
        <span className="od-label">{OPERATOR_DESK_PREVIEW.clearanceLabel}</span>
        <span className="od-win">{wins}W</span>
        <span className="od-loss">{losses}L</span>
      </div>
    </div>
  );
}

function SessionChart({
  candles,
  hoursBack,
  clock,
}: {
  candles: OperatorDeskCandle[];
  hoursBack: number;
  clock: string;
}) {
  const w = 640;
  const h = 260;
  const padL = 44;
  const padR = 72;
  const padT = 18;
  const padB = 36;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const maxY = Math.max(...highs, hoursBack, 1) * 1.08;
  const minY = Math.min(...lows, 0);
  const spanY = Math.max(0.01, maxY - minY);
  const n = Math.max(1, candles.length);
  const gap = plotW / n;
  const bodyW = Math.max(3, Math.min(10, gap * 0.55));

  const yAt = (v: number) => padT + ((maxY - v) / spanY) * plotH;
  const xAt = (i: number) => padL + gap * i + gap / 2;

  const last = candles[candles.length - 1];
  const lastX = last ? xAt(candles.length - 1) : padL;
  const lastY = last ? yAt(last.close) : padT;
  const maxStamps = Math.max(...candles.map((c) => c.stamps), 1);

  const yTicks = [minY, minY + spanY * 0.5, maxY].map((v) => round1(v));

  return (
    <section className="od-panel od-chart" aria-label="Session hours-back history DEMO">
      <header className="od-panel-head">
        <div>
          <h2>{OPERATOR_DESK_PREVIEW.historyTitle}</h2>
          <p className="od-mono od-muted">{OPERATOR_DESK_PREVIEW.historyStarted}</p>
        </div>
        <p className="od-mono od-clock">{clock}</p>
      </header>

      <svg className="od-chart-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Hours-back session chart">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padL}
              x2={w - padR}
              y1={yAt(tick)}
              y2={yAt(tick)}
              className="od-grid"
            />
            <text x={8} y={yAt(tick) + 4} className="od-axis">
              {tick.toFixed(1)}h
            </text>
          </g>
        ))}

        {candles.map((c, i) => {
          const x = xAt(i);
          const up = c.close >= c.open;
          const yOpen = yAt(c.open);
          const yClose = yAt(c.close);
          const yHigh = yAt(c.high);
          const yLow = yAt(c.low);
          const top = Math.min(yOpen, yClose);
          const bodyH = Math.max(2, Math.abs(yClose - yOpen));
          const barH = (c.stamps / maxStamps) * 28;
          return (
            <g key={`${c.t}-${i}`}>
              <line x1={x} x2={x} y1={yHigh} y2={yLow} className={up ? 'od-wick-up' : 'od-wick-dn'} />
              <rect
                x={x - bodyW / 2}
                y={top}
                width={bodyW}
                height={bodyH}
                className={up ? 'od-body-up' : 'od-body-dn'}
                rx={1}
              />
              <rect
                x={x - bodyW / 2}
                y={h - padB + 4 - barH}
                width={bodyW}
                height={barH}
                className={up ? 'od-vol-up' : 'od-vol-dn'}
                rx={1}
              />
            </g>
          );
        })}

        {last ? (
          <>
            <line
              x1={lastX}
              x2={w - padR + 8}
              y1={lastY}
              y2={lastY}
              className="od-last-line"
            />
            <text x={w - padR + 12} y={lastY + 4} className="od-last-label">
              +{hoursBack.toFixed(2)}h
            </text>
          </>
        ) : null}
      </svg>
    </section>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function ActivityLog({ frame }: { frame: OperatorDeskFrame }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [frame.log.length, frame.elapsedSec]);

  return (
    <section className="od-panel od-log" aria-label="Activity log DEMO">
      <header className="od-panel-head">
        <h2>{OPERATOR_DESK_PREVIEW.logTitle}</h2>
        <p className="od-mono od-muted">{frame.resolved} RESOLVED</p>
      </header>
      <ul className="od-log-list" ref={listRef}>
        {frame.log.map((line) => (
          <li key={line.id}>
            <span className={`od-tag ${TAG_CLASS[line.tag]}`}>[{line.tag}]</span>
            <span className="od-log-text">{line.text}</span>
          </li>
        ))}
        {frame.log.length === 0 ? (
          <li className="od-log-empty">
            <span className="od-tag od-tag-wait">[WAIT]</span>
            <span className="od-log-text">session opening · DEMO</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export function OperatorDeskDemo() {
  const [paused, setPaused] = useState(false);
  const frame = useOperatorDeskReplay(paused);
  const c = OPERATOR_DESK_PREVIEW;
  const clock = formatOperatorSessionClock(frame.elapsedSec);

  return (
    <main className="od" style={THEME} data-status="DEMO">
      <a className="od-skip" href="#od-main">
        Skip to operator desk
      </a>

      <header className="od-top">
        <div className="od-brand">
          <p className="od-wordmark">{c.wordmark}</p>
          <p className="od-mode">{c.modeLabel}</p>
        </div>
        <div className="od-top-center">
          <span className="od-demo-pill">{c.statusDemo}</span>
          <p className="od-spine od-mono">{c.spine}</p>
        </div>
        <div className="od-live">
          <p className="od-live-row">
            <i aria-hidden="true" />
            <strong>{c.statusLabel}</strong>
          </p>
          <p className="od-mono od-tasks">{frame.tasks.toLocaleString('en-NZ')} TASKS</p>
        </div>
      </header>

      <p className="od-disclaimer" role="note">
        {c.disclaimer}
      </p>

      <div id="od-main" className="od-shell">
        <div className="od-metrics">
          <article className="od-card od-card-accent">
            <p className="od-label">{c.hoursBackLabel}</p>
            <p className="od-metric-value od-positive">+{frame.hoursBack.toFixed(2)}h</p>
            <p className="od-mono od-sub">{c.hoursBackSub}</p>
          </article>

          <article className="od-card">
            <p className="od-label">{c.evidenceLabel}</p>
            <p className="od-metric-value">{frame.evidenceReceipts}</p>
            <p className="od-mono od-sub">{c.evidenceSub}</p>
          </article>

          <article className="od-card">
            <p className="od-label">{c.waitCreditsLabel}</p>
            <p className="od-metric-value">${frame.waitCredits.toFixed(2)}</p>
            <p className="od-mono od-sub">{c.waitCreditsSub}</p>
          </article>

          <article className="od-card od-card-ring">
            <ClearanceRing rate={frame.approvalRate} wins={frame.wins} losses={frame.losses} />
            <p className="od-mono od-sub">{c.clearanceSub}</p>
          </article>
        </div>

        <div className="od-main-grid">
          <SessionChart candles={frame.candles} hoursBack={frame.hoursBack} clock={clock} />
          <ActivityLog frame={frame} />
        </div>

        <div className="od-sep" role="separator">
          <span>● {c.separator}</span>
        </div>

        <section className="od-panel od-brief" aria-label="Operator brief DEMO">
          <header className="od-panel-head">
            <h2>{c.briefTitle}</h2>
            <p className="od-mono od-muted">{c.briefMeta}</p>
          </header>
          <div className="od-brief-grid">
            {frame.brief.map((col) => (
              <article key={col.id} className={`od-brief-col od-tone-${col.tone}`}>
                <p className="od-brief-label">{col.label}</p>
                <h3>{col.headline}</h3>
                <p>{col.detail}</p>
                <p className="od-mono od-brief-meta">{col.meta}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="od-foot">
          <div className="od-controls">
            <button
              type="button"
              className="od-btn"
              onClick={() => setPaused((v) => !v)}
              aria-pressed={paused}
            >
              {paused ? 'Resume DEMO' : 'Pause DEMO'}
            </button>
            <Link href={c.ctaEvidenceHref} className="od-btn od-btn-primary">
              {c.ctaInspect}
            </Link>
            <Link href="/journeys" className="od-btn od-btn-ghost">
              All journeys
            </Link>
          </div>
          <p className="od-mono od-foot-note">
            assembl · Operator desk · independent concept · not live program data
          </p>
        </footer>
      </div>
    </main>
  );
}
