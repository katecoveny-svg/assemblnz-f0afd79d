import { describe, it, expect } from 'vitest';
import { computeSlots } from '@/lib/voice/tools/check_availability';

// 2026-06-20 is a Saturday (12:00–22:30, last seating 21:30).
const SAT = '2026-06-20';
// 2026-06-22 is a Monday — Whetū is closed.
const MON = '2026-06-22';

describe('computeSlots — business hours + party constraints', () => {
  it('generates 30-min slots within Saturday hours', () => {
    const r = computeSlots({ date: SAT, party_size: 4 });
    expect(r.slots.length).toBeGreaterThan(0);
    expect(r.slots[0].label).toBe('12:00 pm');
    expect(r.slots.some((s) => s.label === '7:00 pm')).toBe(true);
    // Last seating is 21:30 (60 min before 22:30 close).
    expect(r.slots[r.slots.length - 1].label).toBe('9:30 pm');
  });

  it('returns no slots and a reason on a closed day', () => {
    const r = computeSlots({ date: MON, party_size: 2 });
    expect(r.slots).toHaveLength(0);
    expect(r.reason).toBe('closed_that_day');
  });

  it('routes oversized parties to a human (no self-serve slots)', () => {
    const r = computeSlots({ date: SAT, party_size: 12 });
    expect(r.slots).toHaveLength(0);
    expect(r.reason).toBe('party_too_large_transfer');
  });

  it('rejects a zero/negative party size', () => {
    const r = computeSlots({ date: SAT, party_size: 0 });
    expect(r.reason).toBe('party_too_small');
  });

  it('removes slots that clash with a busy interval', () => {
    const open = computeSlots({ date: SAT, party_size: 2 });
    const sevenPm = open.slots.find((s) => s.label === '7:00 pm')!;
    const withBusy = computeSlots({ date: SAT, party_size: 2 }, [
      { start: sevenPm.start, end: sevenPm.end },
    ]);
    expect(withBusy.slots.some((s) => s.label === '7:00 pm')).toBe(false);
    expect(withBusy.slots.length).toBe(open.slots.length - 1);
  });
});
