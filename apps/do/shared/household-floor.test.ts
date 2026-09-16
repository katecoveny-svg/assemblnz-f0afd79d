import { beforeEach, describe, expect, it } from 'vitest';

import {
  assertDraftsOnlyAction,
  boardByStatus,
  installHouseholdFloor,
  tickHouseholdFloor,
  whoIsWhereSummary,
} from './household-floor';
import {
  OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE,
  PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
  listShareableHouseholdFloorTemplates,
} from './household-floor-templates';
import { applyDoPersonalisation, normaliseAccentColor } from './do-personalisation';

describe('Household Floor', () => {
  it('ships a scrubbed public template without private addresses', () => {
    const shareable = listShareableHouseholdFloorTemplates();
    expect(shareable).toHaveLength(1);
    expect(shareable[0]?.id).toBe('public_household_floor');
    expect(PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.shareable).toBe(true);
    const blob = JSON.stringify(PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE);
    expect(blob).not.toMatch(/Geraldine|Kohimarama|Daldy|Sacred Heart|Baradene|Coveny/i);
    expect(PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.seats.map((seat) => seat.id)).toEqual([
      'SCHOOL', 'PACK', 'KITCHEN', 'MONEY', 'TRAVEL', 'WEATHER', 'BINS', 'BUS', 'DESK',
    ]);
  });

  it('keeps owner-private seed non-shareable with full seat parity', () => {
    expect(OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE.shareable).toBe(false);
    expect(OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE.visibility).toBe('owner_private');
    expect(OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE.seats).toHaveLength(9);
    expect(OWNER_PRIVATE_HOUSEHOLD_FLOOR_TEMPLATE.schedules.map((schedule) => schedule.id)).toContain('evening-board');
  });

  it('installs with personalisation and a per-DO browser seat key', () => {
    const floor = installHouseholdFloor({
      template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
      personalisation: { displayName: 'Avery Floor', accentColor: '#916A70', avatarMark: '✶' },
      id: '11111111-1111-4111-8111-111111111111',
      now: '2026-09-16T07:00:00.000Z',
    });
    expect(floor.personalisation.displayName).toBe('Avery Floor');
    expect(floor.personalisation.accentColor).toBe('#916A70');
    expect(floor.browserSeatSessionKey).toBe('do-browser-seat:11111111-1111-4111-8111-111111111111');
    expect(floor.receipts[0]?.evidence.executionClaimed).toBe(false);
  });

  it('ticks evening board into Needs you without claiming sends', () => {
    const floor = installHouseholdFloor({
      template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
      id: '22222222-2222-4222-8222-222222222222',
      now: '2026-09-16T07:00:00.000Z',
    });
    const result = tickHouseholdFloor({
      floor,
      forceScheduleId: 'evening-board',
      now: '2026-09-16T07:30:00.000Z',
    });
    expect(result.created.length).toBeGreaterThan(3);
    const boards = boardByStatus(result.floor.board);
    expect(boards.needs_you.length).toBeGreaterThan(0);
    expect(result.receipt.evidence.executionClaimed).toBe(false);
    expect(result.receipt.summary).toMatch(/No messages sent/i);
  });

  it('refuses drafts-only violations and summarises who-is-where', () => {
    expect(() => assertDraftsOnlyAction('send this to the teacher')).toThrow(/send/i);
    expect(() => assertDraftsOnlyAction('prepare a draft summary')).not.toThrow();
    const summary = whoIsWhereSummary(PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE.context);
    expect(summary).toMatch(/Quinn/);
    expect(normaliseAccentColor('nope')).toBe('#240B21');
    expect(applyDoPersonalisation({ displayName: '  Maple Desk  ' }).displayName).toBe('Maple Desk');
  });
});

describe('Household Floor idempotent tick', () => {
  let floor = installHouseholdFloor({
    template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
    id: '33333333-3333-4333-8333-333333333333',
    now: '2026-09-16T08:00:00.000Z',
  });

  beforeEach(() => {
    floor = installHouseholdFloor({
      template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
      id: '33333333-3333-4333-8333-333333333333',
      now: '2026-09-16T08:00:00.000Z',
    });
  });

  it('does not duplicate the same day schedule items', () => {
    const first = tickHouseholdFloor({ floor, forceScheduleId: 'morning-bus', now: '2026-09-16T19:00:00.000Z' });
    const second = tickHouseholdFloor({
      floor: first.floor,
      forceScheduleId: 'morning-bus',
      now: '2026-09-16T19:05:00.000Z',
    });
    expect(second.created).toHaveLength(0);
    expect(second.floor.board.length).toBe(first.floor.board.length);
  });
});
