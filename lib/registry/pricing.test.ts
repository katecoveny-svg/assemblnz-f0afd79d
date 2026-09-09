import { describe, expect, it } from 'vitest';
import {
  PRICE_INSTALL,
  PRICE_OUTCOME,
  PRICE_RUNNING,
  PRICE_TEAM,
  PRICING_NOTE,
  PRICING_TIERS,
  pricingPlainLines,
  tierForBundle,
} from '@/lib/registry/pricing';

describe('lib/registry/pricing — public commercial ladder', () => {
  it('matches live /pricing amounts and GST exclusive note', () => {
    expect(PRICE_INSTALL).toBe('$1,500');
    expect(PRICE_RUNNING).toBe('$250');
    expect(PRICE_TEAM).toBe('$800');
    expect(PRICE_OUTCOME).toBe('talk to us');
    expect(PRICING_NOTE).toBe('All prices NZD, GST exclusive.');
  });

  it('exposes install / keep it running / team / outcome only', () => {
    expect(PRICING_TIERS.map((tier) => tier.name)).toEqual([
      'install',
      'keep it running',
      'team',
      'outcome',
    ]);
  });

  it('pricingPlainLines quotes the live ladder for Ask assembl', () => {
    const lines = pricingPlainLines().join(' | ');
    expect(lines).toContain('$1,500');
    expect(lines).toContain('$250');
    expect(lines).toContain('$800');
    expect(lines).toContain('talk to us');
    expect(lines).not.toMatch(/\$9\.99/);
    expect(lines).not.toMatch(/\$49/);
    expect(lines).not.toMatch(/\$199/);
    expect(lines).not.toMatch(/from \$5,000/);
  });

  it('does not revive the retired marketplace seat ladder via tierForBundle', () => {
    const line = tierForBundle('hearth');
    expect(line).toContain('$1,500');
    expect(line).toContain('$250');
    expect(line).not.toMatch(/\$9\.99/);
    expect(line).not.toMatch(/\$49/);
    expect(line).not.toMatch(/\$199/);
  });
});
