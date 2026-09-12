/**
 * Operator desk DEMO — Assembl loyalty / Evidence command craft.
 *
 * Craft inspiration: live session desk (header · climbing metrics · clearance
 * ring · history chart · mono activity log · auto brief). Content is
 * Assembl-only: wait→earn, Evidence receipts, approvals, NZ agents.
 * Zero crypto, wallets, Fomo, Jupiter, or fund movement.
 *
 * Locks:
 * - status is always DEMO
 * - Homepage `/` and One NZ private gate untouched
 * - No mana/kete · no bare "AI"
 * - Carrier owns currency; assembl owns evidence
 */

import { ASSEMBL_CANON } from '@/lib/loyalty/one-nz';

export const OPERATOR_DESK_SCHEMA_VERSION = 'v0' as const;

export type OperatorDeskStatus = 'DEMO';

export type OperatorDeskLogTag =
  | 'WAIT'
  | 'EARN'
  | 'EVIDENCE'
  | 'APPROVE'
  | 'AGENT'
  | 'NZ';

export interface OperatorDeskCandle {
  /** Session minute index (0 → SESSION_MINUTES). */
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Volume of evidence stamps in that bucket (DEMO). */
  stamps: number;
}

export interface OperatorDeskLogEvent {
  id: string;
  /** Minute into the 7h DEMO session when this line appears. */
  atMinute: number;
  tag: OperatorDeskLogTag;
  text: string;
}

export interface OperatorDeskBriefColumn {
  id: 'momentum' | 'volume' | 'risk';
  label: string;
  tone: 'heather' | 'mulberry' | 'plum';
  headline: string;
  detail: string;
  meta: string;
}

export interface OperatorDeskFrame {
  /** Elapsed DEMO session seconds (0 → SESSION_SECONDS). */
  elapsedSec: number;
  hoursBack: number;
  evidenceReceipts: number;
  waitCredits: number;
  approvalRate: number;
  wins: number;
  losses: number;
  tasks: number;
  resolved: number;
  candles: OperatorDeskCandle[];
  log: OperatorDeskLogEvent[];
  brief: OperatorDeskBriefColumn[];
}

/** 7-hour DEMO session compressed into a short live replay. */
export const OPERATOR_DESK_SESSION_HOURS = 7;
export const OPERATOR_DESK_SESSION_MINUTES = OPERATOR_DESK_SESSION_HOURS * 60;
export const OPERATOR_DESK_SESSION_SECONDS = OPERATOR_DESK_SESSION_MINUTES * 60;

/** Wall-clock length of one full DEMO replay loop. */
export const OPERATOR_DESK_REPLAY_MS = 48_000;

export const OPERATOR_DESK_PREVIEW = {
  metaTitle: 'Operator desk DEMO · assembl',
  metaDescription:
    'DEMO assembl Operator desk — wait→earn, Evidence receipts, approvals and agents on a live session craft. Sample numbers only.',
  wordmark: 'OPERATOR · LIVE',
  modeLabel: 'loyalty mode',
  statusLabel: 'LIVE',
  statusDemo: 'status · DEMO',
  disclaimer:
    'DEMO session replay. Numbers are sample wait→earn and Evidence craft — not live credits, not money moved, not a trading desk. Carrier owns currency; assembl owns evidence.',
  hoursBackLabel: 'HOURS BACK',
  hoursBackSub: 'DEMO · operator time returned',
  evidenceLabel: 'EVIDENCE RECEIPTS',
  evidenceSub: 'started at 0 · DEMO stamps',
  waitCreditsLabel: 'WAIT CREDITS',
  waitCreditsSub: '$0 live · sample adjacency',
  clearanceLabel: 'CLEARANCE',
  clearanceSub: 'approval / earn conversion · DEMO',
  historyTitle: 'SESSION HISTORY',
  historyStarted: 'started at 0.0h',
  logTitle: 'ACTIVITY LOG',
  separator: 'FREE WAIT · NO FIXED TARGET',
  briefTitle: 'OPERATOR BRIEF',
  briefMeta: 'AUTO-GENERATED · DEMO',
  ctaInspect: 'Inspect Evidence DEMO',
  ctaEvidenceHref: '/journeys/evidence-receipt',
  spine: 'port_2fa · wait→earn · Evidence',
} as const;

export const OPERATOR_DESK_ACTIVITY: OperatorDeskLogEvent[] = [
  { id: 'l01', atMinute: 2, tag: 'WAIT', text: 'port_2fa open · YES window ≤2h · auth path clear' },
  { id: 'l02', atMinute: 5, tag: 'WAIT', text: 'hold queue 14 · 3 waits eligible for earn adjacency' },
  { id: 'l03', atMinute: 8, tag: 'AGENT', text: 'draft brief ready · named human Sam · desk' },
  { id: 'l04', atMinute: 12, tag: 'EVIDENCE', text: 'stamp $0.45 · receipt er-demo-port2fa-001 · DEMO' },
  { id: 'l05', atMinute: 18, tag: 'APPROVE', text: 'human yes · earn held pending carrier credit path' },
  { id: 'l06', atMinute: 24, tag: 'NZ', text: 'source check · Commerce Commission wait guidance cited' },
  { id: 'l07', atMinute: 31, tag: 'EARN', text: 'adjacency logged · not a live balance move' },
  { id: 'l08', atMinute: 38, tag: 'WAIT', text: 'activation hold 00:04:12 · earn timer started' },
  { id: 'l09', atMinute: 45, tag: 'AGENT', text: 'prepared checklist · missing KYC field flagged' },
  { id: 'l10', atMinute: 52, tag: 'EVIDENCE', text: 'stamp $0.45 · receipt er-demo-port2fa-002 · DEMO' },
  { id: 'l11', atMinute: 61, tag: 'APPROVE', text: 'clearance 1/1 · operator Mira · loyalty desk' },
  { id: 'l12', atMinute: 70, tag: 'NZ', text: 'Privacy Act IPP 3A notice shown on opt-in' },
  { id: 'l13', atMinute: 82, tag: 'WAIT', text: 'sponsored wait slot · sample brand · reversible' },
  { id: 'l14', atMinute: 95, tag: 'EARN', text: 'wait credit +0.45 DEMO · carrier owns currency' },
  { id: 'l15', atMinute: 108, tag: 'EVIDENCE', text: 'audit anchor locked · context_hash demo…a3f2' },
  { id: 'l16', atMinute: 120, tag: 'AGENT', text: 'rewrote member SMS · awaiting human send yes' },
  { id: 'l17', atMinute: 135, tag: 'APPROVE', text: 'send blocked until named human confirms' },
  { id: 'l18', atMinute: 150, tag: 'WAIT', text: 'port_2fa renew · second window opened' },
  { id: 'l19', atMinute: 168, tag: 'EVIDENCE', text: 'stamp $0.45 · receipt er-demo-port2fa-003 · DEMO' },
  { id: 'l20', atMinute: 185, tag: 'NZ', text: 'program rules cited · no unsupervised send' },
  { id: 'l21', atMinute: 205, tag: 'EARN', text: 'conversion path clear · 2FA never slowed' },
  { id: 'l22', atMinute: 228, tag: 'AGENT', text: 'ops note: 4 waits need Mira before close of session' },
  { id: 'l23', atMinute: 250, tag: 'APPROVE', text: 'batch clearance 3W · 1 held for review' },
  { id: 'l24', atMinute: 275, tag: 'EVIDENCE', text: 'stamp $0.45 · receipt er-demo-port2fa-004 · DEMO' },
  { id: 'l25', atMinute: 300, tag: 'WAIT', text: 'hold-time earn · 00:11:40 into useful work' },
  { id: 'l26', atMinute: 320, tag: 'NZ', text: 'Fair Trading check pass · sample claim wording' },
  { id: 'l27', atMinute: 340, tag: 'EARN', text: 'hours-back tick +0.25h · operator desk DEMO' },
  { id: 'l28', atMinute: 355, tag: 'AGENT', text: 'Evidence folio assembled · ready for inspect' },
  { id: 'l29', atMinute: 370, tag: 'APPROVE', text: 'Mira yes · session brief published to desk' },
  { id: 'l30', atMinute: 390, tag: 'EVIDENCE', text: 'stamp $0.45 · receipt er-demo-port2fa-005 · DEMO' },
  { id: 'l31', atMinute: 405, tag: 'WAIT', text: 'queue drain · 2 waits still open' },
  { id: 'l32', atMinute: 415, tag: 'EARN', text: 'session credit total sample · not a live credit' },
];

/** Deterministic candle path — hours-back climbing across the 7h session. */
export function buildOperatorDeskCandles(): OperatorDeskCandle[] {
  const candles: OperatorDeskCandle[] = [];
  let close = 0.15;
  const buckets = 42;
  for (let i = 0; i < buckets; i++) {
    const t = Math.round((i / buckets) * OPERATOR_DESK_SESSION_MINUTES);
    const drift = 0.12 + (i / buckets) * 0.55 + Math.sin(i * 0.7) * 0.04;
    const open = close;
    const up = (i * 7 + 3) % 5 !== 0;
    const body = drift * (up ? 1 : -0.35);
    close = Math.max(0.05, open + body);
    const high = Math.max(open, close) + Math.abs(drift) * 0.15;
    const low = Math.min(open, close) - Math.abs(drift) * 0.1;
    const stamps = 1 + ((i * 3) % 5);
    candles.push({
      t,
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
      stamps,
    });
  }
  return candles;
}

export const OPERATOR_DESK_CANDLES = buildOperatorDeskCandles();

export const OPERATOR_DESK_BRIEF_END: OperatorDeskBriefColumn[] = [
  {
    id: 'momentum',
    label: 'MOMENTUM',
    tone: 'heather',
    headline: 'Clearance strong — 5 of last 7 waits approved',
    detail: 'port_2fa spine holding. Auth path stayed clear across the DEMO session.',
    meta: '7-SESSION WINDOW · DEMO',
  },
  {
    id: 'volume',
    label: 'VOLUME',
    tone: 'mulberry',
    headline: 'Evidence stamps up vs prior DEMO hour',
    detail: 'Sample receipts minted beside the wait. Carrier owns currency; assembl owns evidence.',
    meta: 'REALIZED STAMPS · DEMO',
  },
  {
    id: 'risk',
    label: 'RISK',
    tone: 'plum',
    headline: 'No unsupervised send. Not a money desk.',
    detail: 'Human yes required. NZ sources cited on opt-in and claim wording.',
    meta: 'SESSION · DEMO',
  },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function formatSessionClock(elapsedSec: number): string {
  const clamped = Math.max(0, Math.min(OPERATOR_DESK_SESSION_SECONDS, Math.floor(elapsedSec)));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatOperatorSessionClock(elapsedSec: number): string {
  return `${formatSessionClock(elapsedSec)} / ${OPERATOR_DESK_SESSION_HOURS}H`;
}

/**
 * Project the DEMO session to a frame at progress 0..1 through the replay.
 * Pure — safe for tests and SSR seed.
 */
export function projectOperatorDeskFrame(progress: number): OperatorDeskFrame {
  const p = Math.max(0, Math.min(1, progress));
  const elapsedSec = p * OPERATOR_DESK_SESSION_SECONDS;
  const elapsedMin = elapsedSec / 60;

  const candles = OPERATOR_DESK_CANDLES.filter((c) => c.t <= elapsedMin + 0.01);
  const activeCandles = candles.length > 0 ? candles : OPERATOR_DESK_CANDLES.slice(0, 1);
  const last = activeCandles[activeCandles.length - 1]!;

  const hoursBack = round2(lerp(0.2, last.close * 1.05 + 2.4, Math.min(1, p * 1.05)));
  const evidenceReceipts = Math.max(
    0,
    Math.floor(lerp(0, 48, p) + activeCandles.reduce((n, c) => n + c.stamps, 0) * 0.15),
  );
  const waitCredits = round2(evidenceReceipts * 0.45);
  const wins = Math.floor(lerp(2, 109, p));
  const losses = Math.floor(lerp(1, 22, p));
  const total = Math.max(1, wins + losses);
  const approvalRate = Math.round((wins / total) * 100);
  const tasks = Math.floor(lerp(40, 2398, p));
  const resolved = Math.floor(lerp(3, 131, p));

  const log = OPERATOR_DESK_ACTIVITY.filter((e) => e.atMinute <= elapsedMin).slice(-14);

  const brief: OperatorDeskBriefColumn[] = OPERATOR_DESK_BRIEF_END.map((col) => {
    if (p < 0.15) {
      return {
        ...col,
        headline: 'Session opening — DEMO replay assembling',
        detail: 'Wait→earn spine warming. Sample numbers only.',
        meta: `SESSION: ${formatSessionClock(elapsedSec)}`,
      };
    }
    if (col.id === 'volume') {
      return {
        ...col,
        meta: `REALIZED STAMPS: ${evidenceReceipts} · DEMO`,
      };
    }
    if (col.id === 'risk') {
      return {
        ...col,
        meta: `SESSION: ${formatSessionClock(elapsedSec)}`,
      };
    }
    return col;
  });

  return {
    elapsedSec,
    hoursBack,
    evidenceReceipts,
    waitCredits,
    approvalRate,
    wins,
    losses,
    tasks,
    resolved,
    candles: activeCandles,
    log,
    brief,
  };
}

export const OPERATOR_DESK_DEMO_DISCLAIMER = OPERATOR_DESK_PREVIEW.disclaimer;

/** Banned crypto / trading vocabulary — must never appear in desk copy. */
export const OPERATOR_DESK_BANNED_VOCAB = [
  'crypto',
  'bitcoin',
  'solana',
  'wallet',
  'fomo',
  'astra',
  'jupiter',
  'mempool',
  'snipe',
  'rug check',
  'token',
  'trading mode',
  'profit usd',
  'candlestick profit',
] as const;

export function operatorDeskCopyBlob(): string {
  return JSON.stringify({
    preview: OPERATOR_DESK_PREVIEW,
    activity: OPERATOR_DESK_ACTIVITY,
    brief: OPERATOR_DESK_BRIEF_END,
    status: 'DEMO' satisfies OperatorDeskStatus,
    schema: OPERATOR_DESK_SCHEMA_VERSION,
  }).toLowerCase();
}

export { ASSEMBL_CANON };
