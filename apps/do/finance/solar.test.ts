import { describe, expect, it } from 'vitest';
import { SOLAR_ASSUMPTIONS_VERSION, SOLAR_COST_PATHS, solarOutlook } from './solar';

describe('household solar outlook', () => {
  it('estimates usage from spend, sizes a system, and reports ranges with versioned assumptions', () => {
    const outlook = solarOutlook({ monthlyCents: 22450, region: 'Auckland' });
    expect(outlook.version).toBe(SOLAR_ASSUMPTIONS_VERSION);
    expect(outlook.kwhSource).toBe('estimated-from-spend');
    expect(outlook.annualKwh).toBe(6180);
    expect(outlook.systemKw).toBeGreaterThanOrEqual(3);
    expect(outlook.capex.low).toBeLessThan(outlook.capex.high);
    expect(outlook.annualSaving.low).toBeLessThan(outlook.annualSaving.high);
    expect(outlook.paybackYears!.low).toBeLessThan(outlook.paybackYears!.high);
    expect(outlook.worthAQuote).toBe(true);
    expect(outlook.assumptions.some(line => line.includes('for Auckland'))).toBe(true);
    expect(JSON.stringify(outlook)).not.toMatch(/guarantee|will save/i);
  });
  it('uses billed kWh when known and caps the system size', () => {
    const outlook = solarOutlook({ monthlyCents: 60000, region: 'Otago', annualKwh: 20000 });
    expect(outlook.kwhSource).toBe('bills');
    expect(outlook.systemKw).toBe(8);
    expect(outlook.annualGenerationKwh).toBe(9600);
  });
  it('is honest about a small household and an unknown region', () => {
    const outlook = solarOutlook({ monthlyCents: 6000, region: 'Mars' });
    expect(outlook.annualKwh).toBeLessThan(3000);
    expect(outlook.worthAQuote).toBe(false);
    expect(outlook.systemKw).toBe(3);
    expect(outlook.reasons[0]).toContain('under about 3,000 kWh');
    expect(outlook.assumptions[1]).toContain('national default');
  });
  it('is deterministic', () => {
    expect(solarOutlook({ monthlyCents: 18000, region: 'Wellington' })).toEqual(solarOutlook({ monthlyCents: 18000, region: 'Wellington' }));
  });
  it('lists public cost paths with https sources and no promises', () => {
    for (const path of SOLAR_COST_PATHS) {
      expect(path.url.startsWith('https://')).toBe(true);
      expect(path.note).not.toMatch(/guaranteed|free money/i);
    }
  });
});
