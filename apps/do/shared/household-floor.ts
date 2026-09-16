/**
 * Household Floor — installable / runnable DO with specialist seats.
 *
 * Status boards: needs_you | working | done
 * Hard gates: drafts-only messaging; never send/pay/book/submit without OK.
 * Schedules produce board items via tick (v0: durable-job-style tick API, not full cron).
 */

import type { AgentStatus } from './types';
import {
  applyDoPersonalisation,
  type DoPersonalisation,
} from './do-personalisation';

export const HOUSEHOLD_SEAT_IDS = [
  'SCHOOL',
  'PACK',
  'KITCHEN',
  'MONEY',
  'TRAVEL',
  'WEATHER',
  'BINS',
  'BUS',
  'DESK',
] as const;

export type HouseholdSeatId = (typeof HOUSEHOLD_SEAT_IDS)[number];

export type HouseholdVisibility = 'public_template' | 'owner_private';

export type HouseholdPersonRole =
  | 'owner'
  | 'co_parent'
  | 'child'
  | 'pet'
  | 'other';

export type HouseholdPerson = {
  id: string;
  displayName: string;
  role: HouseholdPersonRole;
  notes?: string;
  /** Age band or year level — never invent grades/medical. */
  yearLabel?: string;
  schoolPortal?: string;
};

export type HouseholdHome = {
  id: string;
  label: string;
  addressLine: string;
  /** When this home is active (human-readable). */
  whenActive: string;
  bins?: {
    rubbish: string;
    recycling: string;
    foodScraps?: string;
    day: string;
  };
};

export type HouseholdSeat = {
  id: HouseholdSeatId;
  title: string;
  summary: string;
  /** Sources this seat may read with consent (browser seat / paste / photo). */
  sources: string[];
  canDoWithoutAsking: string[];
  mustAskBefore: string[];
  never: string[];
  /** Prefer owner-browser seat over paste-forever. */
  browserSeatPreferred: boolean;
  learnPlaybookHint?: string;
};

export type HouseholdScheduleHook = {
  id: string;
  title: string;
  /** Cron-like human description; v0 tick matches by id + local NZ time windows. */
  when: string;
  /** IANA zone — Pacific/Auckland for NZ households. */
  timezone: 'Pacific/Auckland';
  /** Days: 0=Sun … 6=Sat, or 'daily'. */
  days: number[] | 'daily';
  /** Local HH:mm */
  localTime: string;
  seatIds: HouseholdSeatId[];
  boardOrder: string[];
  produces: AgentStatus;
};

export type HouseholdBoardItem = {
  id: string;
  seatId: HouseholdSeatId;
  title: string;
  summary: string;
  status: AgentStatus;
  scheduleId?: string;
  createdAt: string;
  updatedAt: string;
  /** Draft text waiting for owner approve — never auto-sent. */
  draft?: string;
  needsYouReason?: string;
  receiptIds: string[];
};

export type HouseholdFloorReceipt = {
  id: string;
  kind: 'board_tick' | 'browser_seat' | 'draft_prepared' | 'needs_you' | 'note';
  title: string;
  summary: string;
  createdAt: string;
  evidence: Record<string, unknown>;
};

export type HouseholdFloorContext = {
  timezone: 'Pacific/Auckland';
  people: HouseholdPerson[];
  homes: HouseholdHome[];
  custodyNote: string;
  schoolPortals: Array<{ label: string; host: string; childId: string; mode: 'read_only' }>;
  kitchenMode: 'fridge_photo';
  messaging: 'drafts_only';
  hardGates: string[];
};

export type HouseholdFloorTemplate = {
  id: string;
  visibility: HouseholdVisibility;
  name: string;
  summary: string;
  /** Share tonight? Only public_template should be offered extensively. */
  shareable: boolean;
  context: HouseholdFloorContext;
  seats: HouseholdSeat[];
  schedules: HouseholdScheduleHook[];
  dailyBoardOrder: string[];
};

export type HouseholdFloorInstance = {
  id: string;
  templateId: string;
  visibility: HouseholdVisibility;
  personalisation: DoPersonalisation;
  context: HouseholdFloorContext;
  seats: HouseholdSeat[];
  schedules: HouseholdScheduleHook[];
  dailyBoardOrder: string[];
  board: HouseholdBoardItem[];
  receipts: HouseholdFloorReceipt[];
  /** Per-DO browser seat session key (not a shared anonymous scrape). */
  browserSeatSessionKey: string;
  installedAt: string;
  updatedAt: string;
  lastTickAt?: string;
};

export const HOUSEHOLD_HARD_GATES: readonly string[] = [
  'Drafts-only messaging: kids and co-parent drafts need owner approve before anything leaves the DO.',
  'School portals are read-only unless the owner explicitly asks for a submit.',
  'Never invent fixtures, grades, medical notes or absences.',
  'Never send, pay, book, submit forms, or message teachers without an explicit OK.',
  'Browser / screen see requires consent per domain or session — dragging a widget alone does not share the screen.',
  'No child tracking or always-on location.',
] as const;

export const DEFAULT_DAILY_BOARD_ORDER: string[] = [
  'Who is where tonight',
  'School notices & bags',
  'Weather & bus',
  'Bins / kitchen',
  'Money touchpoints (draft only)',
  'Travel / tomorrow logistics',
  'Desk wrap — Needs you',
];

export function seatById(seats: HouseholdSeat[], id: HouseholdSeatId): HouseholdSeat | undefined {
  return seats.find((seat) => seat.id === id);
}

export function boardByStatus(board: HouseholdBoardItem[]): Record<AgentStatus, HouseholdBoardItem[]> {
  return {
    needs_you: board.filter((item) => item.status === 'needs_you'),
    working: board.filter((item) => item.status === 'working'),
    done: board.filter((item) => item.status === 'done'),
  };
}

export function createBrowserSeatSessionKey(floorId: string): string {
  return `do-browser-seat:${floorId}`;
}

export type InstallHouseholdFloorInput = {
  template: HouseholdFloorTemplate;
  personalisation?: Partial<DoPersonalisation>;
  id?: string;
  now?: string;
};

export function installHouseholdFloor(input: InstallHouseholdFloorInput): HouseholdFloorInstance {
  const now = input.now ?? new Date().toISOString();
  const id = input.id ?? crypto.randomUUID();
  const personalisation = applyDoPersonalisation(input.personalisation, {
    displayName: input.template.name,
    accentColor: '#240B21',
    avatarMark: '⌂',
  });

  return {
    id,
    templateId: input.template.id,
    visibility: input.template.visibility,
    personalisation,
    context: structuredClone(input.template.context),
    seats: structuredClone(input.template.seats),
    schedules: structuredClone(input.template.schedules),
    dailyBoardOrder: [...input.template.dailyBoardOrder],
    board: [],
    receipts: [
      {
        id: crypto.randomUUID(),
        kind: 'note',
        title: 'Household Floor installed',
        summary: input.template.shareable
          ? 'Public template installed on this device. Place the DO, install the browser seat extension, then run the evening board.'
          : 'Owner-private seed installed. Do not share this instance publicly — it carries personal household context.',
        createdAt: now,
        evidence: {
          templateId: input.template.id,
          visibility: input.template.visibility,
          shareable: input.template.shareable,
          executionClaimed: false,
        },
      },
    ],
    browserSeatSessionKey: createBrowserSeatSessionKey(id),
    installedAt: now,
    updatedAt: now,
  };
}

/** Map local NZ wall time into which schedule hooks are due in a tick window. */
export function schedulesDueAt(
  schedules: HouseholdScheduleHook[],
  at: Date,
): HouseholdScheduleHook[] {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(at);

  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  const localTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const day = dayMap[weekday] ?? at.getUTCDay();

  return schedules.filter((schedule) => {
    if (schedule.timezone !== 'Pacific/Auckland') return false;
    if (schedule.days !== 'daily' && !schedule.days.includes(day)) return false;
    // v0: match exact HH:mm or allow a ±30m evening-board window for 19:30.
    if (schedule.localTime === localTime) return true;
    if (schedule.id === 'evening-board' && localTime >= '19:00' && localTime <= '20:00') return true;
    if (schedule.id === 'morning-bus' && localTime >= '06:45' && localTime <= '07:30') return true;
    return false;
  });
}

function boardItemId(scheduleId: string, seatId: HouseholdSeatId, dayKey: string): string {
  return `${scheduleId}:${seatId}:${dayKey}`;
}

function aucklandDayKey(at: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}

export type TickHouseholdFloorInput = {
  floor: HouseholdFloorInstance;
  /** Force a named board even outside the clock window (manual “run evening board”). */
  forceScheduleId?: string;
  now?: string | Date;
};

export type TickHouseholdFloorResult = {
  floor: HouseholdFloorInstance;
  created: HouseholdBoardItem[];
  receipt: HouseholdFloorReceipt;
};

/**
 * Produce Needs you / Working / Done items from schedule hooks.
 * Does not send messages, submit portals, or claim live scrapes without receipts.
 */
export function tickHouseholdFloor(input: TickHouseholdFloorInput): TickHouseholdFloorResult {
  const at = input.now instanceof Date ? input.now : new Date(input.now ?? Date.now());
  const nowIso = at.toISOString();
  const dayKey = aucklandDayKey(at);
  const due = input.forceScheduleId
    ? input.floor.schedules.filter((schedule) => schedule.id === input.forceScheduleId)
    : schedulesDueAt(input.floor.schedules, at);

  const created: HouseholdBoardItem[] = [];
  const board = [...input.floor.board];

  for (const schedule of due) {
    for (const seatId of schedule.seatIds) {
      const seat = seatById(input.floor.seats, seatId);
      if (!seat) continue;
      const id = boardItemId(schedule.id, seatId, dayKey);
      if (board.some((item) => item.id === id)) continue;

      const needsBrowser = seat.browserSeatPreferred;
      const status: AgentStatus = schedule.produces === 'done'
        ? 'done'
        : needsBrowser || schedule.produces === 'needs_you'
          ? 'needs_you'
          : 'working';

      const item: HouseholdBoardItem = {
        id,
        seatId,
        title: `${schedule.title} · ${seat.title}`,
        summary: needsBrowser
          ? `${seat.summary} Open the owner-browser seat (consent required) or paste a reviewed capture.`
          : seat.summary,
        status,
        scheduleId: schedule.id,
        createdAt: nowIso,
        updatedAt: nowIso,
        needsYouReason: status === 'needs_you'
          ? (needsBrowser
            ? 'Browser seat or reviewed capture needed before this seat can finish.'
            : 'Owner review required — drafts only until you approve.')
          : undefined,
        draft: seat.id === 'DESK' || seat.id === 'SCHOOL'
          ? `Draft for ${seat.title}: summarise notices and propose next steps. Do not send.`
          : undefined,
        receiptIds: [],
      };
      board.unshift(item);
      created.push(item);
    }
  }

  // Advance working items that already have browser receipts toward done (still no send).
  const updatedBoard = board.map((item) => {
    if (item.status !== 'working') return item;
    if (item.receiptIds.length === 0) return item;
    return {
      ...item,
      status: 'needs_you' as const,
      needsYouReason: 'Capture reviewed — approve the draft or mark done. Nothing has been sent.',
      updatedAt: nowIso,
    };
  });

  const receipt: HouseholdFloorReceipt = {
    id: crypto.randomUUID(),
    kind: 'board_tick',
    title: input.forceScheduleId ? `Manual board · ${input.forceScheduleId}` : 'Schedule tick',
    summary: created.length
      ? `Opened ${created.length} seat item(s). Needs you / Working / Done updated. No messages sent.`
      : due.length
        ? 'Schedules matched; board items already open for today.'
        : 'No schedule due in this window. Use Run evening board to force the 19:30 board.',
    createdAt: nowIso,
    evidence: {
      forceScheduleId: input.forceScheduleId ?? null,
      dueScheduleIds: due.map((schedule) => schedule.id),
      createdIds: created.map((item) => item.id),
      executionClaimed: false,
      aucklandDay: dayKey,
    },
  };

  return {
    floor: {
      ...input.floor,
      board: updatedBoard,
      receipts: [receipt, ...input.floor.receipts].slice(0, 40),
      lastTickAt: nowIso,
      updatedAt: nowIso,
    },
    created,
    receipt,
  };
}

export function attachBrowserSeatReceipt(
  floor: HouseholdFloorInstance,
  input: {
    boardItemId?: string;
    receipt: HouseholdFloorReceipt;
    now?: string;
  },
): HouseholdFloorInstance {
  const now = input.now ?? new Date().toISOString();
  const board = floor.board.map((item) => {
    if (input.boardItemId && item.id !== input.boardItemId) return item;
    if (!input.boardItemId && item.status !== 'needs_you' && item.status !== 'working') return item;
    if (input.boardItemId || item.seatId === 'SCHOOL' || item.seatId === 'BINS' || item.seatId === 'BUS') {
      return {
        ...item,
        status: 'needs_you' as const,
        needsYouReason: 'Browser seat capture attached. Review before any draft leave-the-DO action.',
        receiptIds: [input.receipt.id, ...item.receiptIds],
        updatedAt: now,
      };
    }
    return item;
  });

  return {
    ...floor,
    board,
    receipts: [input.receipt, ...floor.receipts].slice(0, 40),
    updatedAt: now,
  };
}

export function assertDraftsOnlyAction(action: string): void {
  const lowered = action.toLowerCase();
  for (const verb of ['send', 'pay', 'book', 'submit', 'purchase', 'transfer']) {
    if (new RegExp(`\\b${verb}\\b`).test(lowered)) {
      throw new Error(`Household Floor refuses "${verb}" without explicit owner approval. Drafts only.`);
    }
  }
}

export function whoIsWhereSummary(context: HouseholdFloorContext): string {
  const kids = context.people.filter((person) => person.role === 'child').map((person) => person.displayName);
  const homes = context.homes.map((home) => `${home.label}: ${home.whenActive}`).join(' · ');
  return `${context.custodyNote} Kids in seed: ${kids.join(', ') || 'none'}. Homes — ${homes}`;
}
