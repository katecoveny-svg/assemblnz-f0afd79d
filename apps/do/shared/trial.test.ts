import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ rows: new Map<string, { id: string; anon_id: string; agent_slug: string }>(), fail: false }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => ({ from: () => ({
  insert: async (row: { id: string; anon_id: string; agent_slug: string }) => {
    await Promise.resolve();
    if (state.fail) return { error: { code: '08006' } };
    const key = row.anon_id + row.agent_slug;
    if (state.rows.has(key)) return { error: { code: '23505' } };
    state.rows.set(key, row); return { error: null };
  },
  delete: () => ({ eq: (_: string, id: string) => ({ eq: async (_: string, anon: string) => { for (const [key,row] of state.rows) if(row.id === id && row.anon_id === anon) state.rows.delete(key); } }) }),
  select: () => ({ eq: (_: string, anon: string) => ({ in: async (_: string, slots: string[]) => ({ count: [...state.rows.values()].filter(r => r.anon_id === anon && slots.includes(r.agent_slug)).length, error: state.fail ? { code: '08006' } : null }) }) }),
}) }) }));
import { doAnonTrialLimit, readDoTrial, reserveDoTrial } from './trial';
beforeEach(() => {
  state.rows.clear();
  state.fail = false;
  vi.unstubAllEnvs();
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only-secret');
});
describe('DO shared trial', () => {
  it('admits exactly three of twenty simultaneous calls', async () => {
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => reserveDoTrial('192.0.2.1')));
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(3);
    expect(await readDoTrial('192.0.2.1')).toEqual({
      limit: 3,
      remaining: 0,
      bypassed: false,
      mode: 'anon_sandbox',
    });
    expect([...state.rows.values()].every(r => !r.anon_id.includes('192.0.2.1'))).toBe(true);
  });
  it('releases only the failed reservation and permits one retry', async () => {
    const a = await reserveDoTrial('192.0.2.1'); await reserveDoTrial('192.0.2.1'); await reserveDoTrial('192.0.2.1');
    await a.release(); await a.release();
    expect((await readDoTrial('192.0.2.1')).remaining).toBe(1);
    await reserveDoTrial('192.0.2.1');
    await expect(reserveDoTrial('192.0.2.1')).rejects.toMatchObject({ code: 'trial_exhausted' });
  });
  it('does not grant unlimited generation when storage fails', async () => {
    state.fail = true;
    await expect(reserveDoTrial('192.0.2.1')).rejects.toMatchObject({ code: 'trial_unavailable' });
    await expect(readDoTrial('192.0.2.1')).rejects.toMatchObject({ code: 'trial_unavailable' });
  });
  it('keeps networks separate and refuses unknown identities', async () => {
    await reserveDoTrial('192.0.2.1');
    expect((await readDoTrial('192.0.2.2')).remaining).toBe(3);
    await expect(reserveDoTrial('unknown')).rejects.toMatchObject({ code: 'trial_unavailable' });
  });

  it('bypasses the network quota for signed-in DO owners', async () => {
    await reserveDoTrial('192.0.2.1');
    await reserveDoTrial('192.0.2.1');
    await reserveDoTrial('192.0.2.1');
    await expect(reserveDoTrial('192.0.2.1')).rejects.toMatchObject({ code: 'trial_exhausted' });
    const bypass = await reserveDoTrial('192.0.2.1', { signedInOwnerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
    expect(bypass.bypassed).toBe(true);
    expect(await readDoTrial('192.0.2.1', { signedInOwnerId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })).toMatchObject({
      bypassed: true,
      remaining: null,
      mode: 'signed_in_unlimited',
    });
  });

  it('honours DO_TRIAL_LIMIT for anonymous sandbox only', async () => {
    vi.stubEnv('DO_TRIAL_LIMIT', '1');
    expect(doAnonTrialLimit()).toBe(1);
    await reserveDoTrial('192.0.2.1');
    await expect(reserveDoTrial('192.0.2.1')).rejects.toMatchObject({ code: 'trial_exhausted' });
    expect(await readDoTrial('192.0.2.1')).toMatchObject({ limit: 1, remaining: 0, mode: 'anon_sandbox' });
    const bypass = await reserveDoTrial('192.0.2.1', { signedInOwnerId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' });
    expect(bypass.bypassed).toBe(true);
  });

  it('falls back to 3 when DO_TRIAL_LIMIT is invalid', () => {
    vi.stubEnv('DO_TRIAL_LIMIT', '0');
    expect(doAnonTrialLimit()).toBe(3);
    vi.stubEnv('DO_TRIAL_LIMIT', '99');
    expect(doAnonTrialLimit()).toBe(3);
    vi.stubEnv('DO_TRIAL_LIMIT', 'nope');
    expect(doAnonTrialLimit()).toBe(3);
  });
});
