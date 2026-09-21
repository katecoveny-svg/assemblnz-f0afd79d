import { describe, expect, it } from 'vitest';
import { createSimulatedUtilityAdapter, defaultEnvelope, type Permit } from './adapter';

function prepared() {
  const adapter = createSimulatedUtilityAdapter();
  const plan = adapter.prepare(adapter.read('morning'), defaultEnvelope, 1000);
  const permit: Permit = { planId: plan.id, fingerprint: plan.fingerprint, account: plan.context.account, authority: 'simulate', expiresAt: 5000 };
  return { adapter, plan, permit };
}

describe('Flex simulated household authority', () => {
  it('fits the deadline and issues only simulated evidence', () => {
    const { adapter, plan, permit } = prepared();
    expect(plan.state).toBe('prepared');
    expect(plan.end).toBeLessThanOrEqual(6 * 60 + 45);
    const result = adapter.execute(plan, permit, defaultEnvelope, 2000);
    expect(result).toMatchObject({ status: 'simulated', externalActions: false, deliveredKwh: null, rewardNzd: null, permission: { reservePct: 35, heatingAskFirst: true } });
  });
  it.each([
    { authority: 'execute' }, { account: 'another-household' }, { planId: 'other-plan' },
    { fingerprint: 'changed' }, { expiresAt: 2000 }, { expiresAt: NaN },
  ])('rejects approval outside this exact current simulation: %j', (change) => {
    const { adapter, plan, permit } = prepared();
    expect(() => adapter.execute(plan, { ...permit, ...change } as Permit, defaultEnvelope, 2000)).toThrow('approval');
  });
  it('requires approval even when a plan is feasible', () => {
    const { adapter, plan } = prepared();
    expect(() => adapter.execute(plan, undefined as unknown as Permit, defaultEnvelope, 2000)).toThrow('approval');
  });
  it('rejects changed boundaries and tampered schedules', () => {
    const { adapter, plan, permit } = prepared();
    expect(() => adapter.execute(plan, permit, { ...defaultEnvelope, reservePct: 50 }, 2000)).toThrow('boundaries changed');
    expect(() => adapter.execute({ ...plan, end: 120 }, permit, defaultEnvelope, 2000)).toThrow('plan has changed');
  });
  it('revokes an approved plan on override and cannot replay it', () => {
    const { adapter, plan, permit } = prepared();
    adapter.execute(plan, permit, defaultEnvelope, 2000);
    expect(adapter.override(plan, 2500).status).toBe('overridden');
    expect(() => adapter.execute(plan, permit, defaultEnvelope, 3000)).toThrow('overridden');
  });
  it('returns one immutable receipt on replay', () => {
    const { adapter, plan, permit } = prepared();
    const first = adapter.execute(plan, permit, defaultEnvelope, 2000);
    const copy = structuredClone(first);
    first.summary = 'mutated';
    expect(adapter.execute(plan, permit, defaultEnvelope, 3000)).toEqual(copy);
  });
  it.each(['shortfall', 'reserve'] as const)('blocks infeasible %s plans', (scenario) => {
    const { adapter } = prepared();
    const envelope = { ...defaultEnvelope, reservePct: scenario === 'reserve' ? 90 : 35 };
    const plan = adapter.prepare(adapter.read(scenario === 'shortfall' ? 'shortfall' : 'morning'), envelope, 1000);
    const permit: Permit = { planId: plan.id, fingerprint: plan.fingerprint, account: plan.context.account, authority: 'simulate', expiresAt: 5000 };
    expect(plan.state).toBe('needs_review');
    expect(() => adapter.execute(plan, permit, envelope, 2000)).toThrow('human review');
  });
  it('accepts solar and storm boundaries without claiming grid participation', () => {
    const { adapter } = prepared();
    expect(adapter.prepare(adapter.read('solar'), { ...defaultEnvelope, readyBy: '15:00' }).state).toBe('prepared');
    expect(adapter.prepare(adapter.read('storm'), { ...defaultEnvelope, reservePct: 60 }).state).toBe('prepared');
  });
  it('uses no charging when the target is already met', () => {
    const { adapter } = prepared();
    const envelope = { ...defaultEnvelope, targetPct: 40, readyBy: '00:30' };
    const plan = adapter.prepare(adapter.read('morning'), envelope, 1000);
    expect(plan.energyKwh).toBe(0);
    expect(plan.state).toBe('prepared');
    expect(adapter.execute(plan, { planId: plan.id, fingerprint: plan.fingerprint, account: plan.context.account, authority: 'simulate', expiresAt: 5000 }, envelope, 2000).summary).toContain('No charging scheduled');
  });
  it('rejects invalid boundaries and altered device fixtures', () => {
    const { adapter } = prepared();
    expect(() => adapter.prepare(adapter.read('morning'), { ...defaultEnvelope, readyBy: '25:00' })).toThrow();
    expect(() => adapter.prepare({ ...adapter.read('morning'), chargerKw: 100 }, defaultEnvelope)).toThrow('supplied simulated');
    expect(() => adapter.prepare(adapter.read('morning'), { ...defaultEnvelope, heatingAskFirst: false } as never)).toThrow();
  });
});
