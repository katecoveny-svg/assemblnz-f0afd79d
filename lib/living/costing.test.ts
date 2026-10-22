import { describe, expect, it } from 'vitest';
import { estimate, shelfPrice } from './costing';
import costModel from '../../tools/living-cad/launch/cost-model.json';

describe('costing', () => {
  it('rounds to shelf prices', () => {
    expect(shelfPrice(12.2)).toBe(12.5);
    expect(shelfPrice(41.2)).toBe(42);
    expect(shelfPrice(61)).toBe(65);
  });

  it('agrees with the python cost model for a catalogue item sold alone', () => {
    const row = (costModel as { rows: { handle: string; cost_alone_nzd: number; print_hours: number }[] }).rows.find((r) => r.handle === 'al-board-4x4')!;
    const e = estimate([{ id: 'grid-board-4x4', qty: 1 }, { id: 'grid-anchor-washer', qty: 4 }]);
    expect(Math.abs(e.costNzd - row.cost_alone_nzd)).toBeLessThan(0.05);
    expect(Math.abs(e.printHours - row.print_hours)).toBeLessThan(0.06);
  });

  it('gives an empty build no cost and no days', () => {
    const e = estimate([]);
    expect(e.costNzd).toBe(0);
    expect(e.days.ready).toBe(0);
  });

  it('merges copies of the same file into one job', () => {
    const one = estimate([{ id: 'grid-turn-key', qty: 2 }]);
    const two = estimate([{ id: 'grid-turn-key', qty: 1 }, { id: 'grid-turn-key', qty: 1 }]);
    expect(two.jobs).toBe(1);
    expect(two.costNzd).toBe(one.costNzd);
  });

  it('names a file it does not know', () => {
    expect(estimate([{ id: 'nope', qty: 1 }]).unknown).toEqual(['nope']);
  });
});
