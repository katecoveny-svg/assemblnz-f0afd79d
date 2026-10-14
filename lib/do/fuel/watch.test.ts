import { describe, expect, it } from 'vitest';
import { fuelAdvice, fuelWatchAsk, type FuelObservation } from './watch';

const now = new Date('2026-10-14T00:00:00Z');
const obs = (date: string, price: number, source: FuelObservation['source'] = 'mbie_weekly'): FuelObservation => ({ date, price, source, label: source === 'station' ? 'Station I saw' : 'MBIE weekly average' });
const tank = { fuel: '91' as const, tankLitres: 50, litresLeft: 25, weeklyLitres: 30, targetPrice: null };

describe('fuel watch', () => {
  it('fills now when fuel is nearly out, whatever the price', () => {
    const advice = fuelAdvice({ ...tank, litresLeft: 6 }, [obs('2026-10-13', 2.95)], now);
    expect(advice.action).toBe('fill-now');
    expect(advice.daysOfFuel).toBe(1.4);
    expect(advice.reason).toContain('running out costs more');
  });
  it('fills when the price is at or below the recent median, with the fill cost and difference', () => {
    const history = [obs('2026-09-01', 2.95), obs('2026-09-08', 2.99), obs('2026-09-15', 2.97), obs('2026-10-13', 2.85)];
    const advice = fuelAdvice(tank, history, now);
    expect(advice).toMatchObject({ action: 'fill-now', recentMedian: 2.97, trend: 'falling', weeklyCost: 85.5, fillCost: 71.25, fillDifference: -3 });
    expect(advice.reason).toContain('recent median of $2.97');
  });
  it('tops up when prices are rising above the benchmark, and waits when they are falling', () => {
    const rising = fuelAdvice({ ...tank, targetPrice: 2.8 }, [obs('2026-09-29', 2.85), obs('2026-10-06', 2.9), obs('2026-10-13', 2.99)], now);
    expect(rising.action).toBe('top-up');
    expect(rising.trend).toBe('rising');
    const falling = fuelAdvice({ ...tank, targetPrice: 2.8 }, [obs('2026-09-29', 3.05), obs('2026-10-06', 2.99), obs('2026-10-13', 2.9)], now);
    expect(falling.action).toBe('wait');
    expect(falling.reason).toContain('prices have been falling');
  });
  it('is honest with no price, ignores future-dated observations, and keeps the tank consistent', () => {
    expect(fuelAdvice(tank, [], now).action).toBe('no-price');
    expect(fuelAdvice(tank, [obs('2026-11-01', 1.5)], now).action).toBe('no-price');
    expect(() => fuelAdvice({ ...tank, litresLeft: 60 }, [], now)).toThrow();
  });
  it('writes a watch request without an address or plate and never buys', () => {
    const ask = fuelWatchAsk({ fuel: 'diesel', targetPrice: 2.4 }, 'Auckland');
    expect(ask).toContain('Watch Diesel prices around Auckland each morning');
    expect(ask).toContain('My target is $2.40 a litre');
    expect(ask).toContain('Do not buy anything.');
    expect(fuelWatchAsk({ fuel: '95', targetPrice: null }, null)).toContain('below the recent median');
  });
});
