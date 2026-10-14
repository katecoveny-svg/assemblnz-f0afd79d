import { describe, expect, it, vi } from 'vitest';
import { CONTINUITY_VERSION, CONTINUITY_RESULT_LIMIT, mutationSchema, newTask, taskSchema, type Save, type Change } from './contract';
import { FixtureRepository } from './repository';
import { DurableRepository, type ContinuityRpc } from './durable';
import { worksheetExecutor } from './executor';

const instant = '2026-10-02T01:00:00.000Z';
const owner = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const id = '10000000-0000-4000-8000-000000000001';
const input: Save = { action: 'save', id, scope: 'personal', request: 'Prepare the fictional picnic follow-up.',
  context: [{ id: '20000000-0000-4000-8000-000000000001', label: 'Selected note', text: 'Pickup is unconfirmed.', source: 'user_selected' }], consent: true, consentVersion: CONTINUITY_VERSION };
const change = (action: Change['action'], revision = 1): Change => ({ action, id, scope: 'personal', expectedRevision: revision });

describe('portable continuity fixture contract', () => {
  it('does not admit memory, authority, provider consent or fabricated success', () => {
    for (const extra of [{ ownerId: other }, { memoryRecords: ['private'] }, { status: 'needs_review' }, { result: 'sent' }, { providerConsent: true }, { authority: 'send' }])
      expect(mutationSchema.safeParse({ ...input, ...extra }).success).toBe(false);
    expect(mutationSchema.safeParse({ ...input, consent: false }).success).toBe(false);
    expect(mutationSchema.safeParse({ ...input, consentVersion: 'collection-only' }).success).toBe(false);
  });
  it('saves one ID, replays duplicate submission and rejects changed retries', async () => {
    const repo = new FixtureRepository();
    const first = await repo.save(owner, input, instant);
    expect(await repo.save(owner, input, '2026-10-02T03:00:00.000Z')).toEqual(first);
    expect(await repo.list(owner, 'personal', instant)).toHaveLength(1);
    await expect(repo.save(owner, { ...input, request: 'Changed request with same ID' }, instant)).rejects.toThrow('id_reused');
  });
  it('hides exact IDs across owners and scopes for reads and every mutation', async () => {
    const repo = new FixtureRepository(); await repo.save(owner, input, instant);
    expect(await repo.get(other, 'personal', id, instant)).toBeNull();
    expect(await repo.get(owner, 'work', id, instant)).toBeNull();
    for (const action of ['prepare', 'edit', 'cancel', 'revoke'] as const) {
      const mutation = { ...change(action), ...(action === 'edit' ? { result: 'changed' } : {}) };
      await expect(repo.change(other, mutation, instant)).rejects.toThrow('not_found');
      await expect(repo.change(owner, { ...mutation, scope: 'work' }, instant)).rejects.toThrow('not_found');
    }
    expect((await repo.get(owner, 'personal', id, instant))?.revision).toBe(1);
  });
  it('prepares once during concurrent duplicate clicks and replays completed results', async () => {
    const prepare = vi.fn(worksheetExecutor.prepare);
    const repo = new FixtureRepository(undefined, { id: 'worksheet-v1', prepare });
    await repo.save(owner, input, instant);
    const [a, b] = await Promise.all([repo.change(owner, change('prepare'), instant), repo.change(owner, change('prepare'), instant)]);
    expect(a).toEqual(b); expect(prepare).toHaveBeenCalledTimes(1);
    expect(a.result).toContain('no model called');
    expect(await repo.change(owner, change('prepare', 2), instant)).toEqual(a);
    expect(prepare).toHaveBeenCalledTimes(1);
  });
  it('revocation wins over in-flight preparation and clears context/result', async () => {
    let finish!: (value: string) => void;
    const repo = new FixtureRepository(undefined, { id: 'worksheet-v1', prepare: () => new Promise(resolve => { finish = resolve; }) });
    await repo.save(owner, input, instant);
    const pending = repo.change(owner, change('prepare'), instant);
    const stopped = await repo.change(owner, change('revoke'), instant);
    finish('Late result');
    await expect(pending).rejects.toThrow('conflict');
    expect(stopped.context).toEqual([]); expect(stopped.result).toBeNull();
    await expect(repo.change(owner, change('prepare', 2), instant)).rejects.toThrow('stopped');
  });
  it('supports cancel, prevents stale edits and withholds expired permission content', async () => {
    const repo = new FixtureRepository(); await repo.save(owner, input, instant);
    await repo.change(owner, change('prepare'), instant);
    await expect(repo.change(owner, { ...change('edit'), result: 'stale' }, instant)).rejects.toThrow('conflict');
    const edited = await repo.change(owner, { ...change('edit', 2), result: 'Editable follow-up' }, instant);
    expect(edited.result).toBe('Editable follow-up');
    await expect(repo.change(owner, change('prepare', 3), '2026-10-03T01:00:00.000Z')).rejects.toThrow('permission_expired');
    const expired = await repo.get(owner, 'personal', id, '2026-10-03T01:00:00.000Z');
    expect(expired?.context).toEqual([]); expect(expired?.result).toBeNull();
    const retained = await repo.get(owner, 'personal', id, '2026-10-09T01:00:00.000Z');
    expect(retained?.request).toBe('');
    expect((await repo.change(owner, change('cancel', 3), instant)).status).toBe('cancelled');
  });
  it('reopens a serialized fixture in a fresh session and preserves edits', async () => {
    const rows = new Map(); const phone = new FixtureRepository(rows);
    await phone.save(owner, input, instant); await phone.change(owner, change('prepare'), instant);
    await phone.change(owner, { ...change('edit', 2), result: 'Reviewed draft' }, instant);
    const serialized = JSON.stringify([...rows]);
    const desktop = new FixtureRepository(new Map(JSON.parse(serialized)));
    expect((await desktop.get(owner, 'personal', id, instant))?.result).toBe('Reviewed draft');
    expect(desktop.storage).toBe('fixture'); // Simulation is never labelled cross-device proof.
  });
  it('transport failure leaves waiting work resumable with the same ID', async () => {
    const prepare = vi.fn().mockRejectedValueOnce(new Error('offline')).mockImplementation(worksheetExecutor.prepare);
    const repo = new FixtureRepository(undefined, { id: 'worksheet-v1', prepare });
    await repo.save(owner, input, instant);
    await expect(repo.change(owner, change('prepare'), instant)).rejects.toThrow('offline');
    expect((await repo.get(owner, 'personal', id, instant))?.status).toBe('waiting');
    expect((await repo.change(owner, change('prepare'), instant)).status).toBe('needs_review');
    expect(await repo.list(owner, 'personal', instant)).toHaveLength(1);
  });
  it('prepares a valid maximum selected bundle within the result bound', async () => {
    const maximum = { ...input, request: 'r'.repeat(4000), context: [1, 2, 3].map(n => ({
      id: `20000000-0000-4000-8000-00000000000${n}`, label: 'l'.repeat(80), text: 't'.repeat(2000), source: 'user_selected' as const,
    })) };
    const repo = new FixtureRepository(); await repo.save(owner, maximum, instant);
    const prepared = await repo.change(owner, change('prepare'), instant);
    expect(prepared.result!.length).toBeGreaterThan(10000);
    expect(prepared.result!.length).toBeLessThan(CONTINUITY_RESULT_LIMIT);
    expect(taskSchema.safeParse(prepared).success).toBe(true);
  });
  it('enforces owner count quotas across both scopes without blocking replay', async () => {
    const repo = new FixtureRepository();
    for (let n = 1; n <= 40; n++) await repo.save(owner, { ...input, id: `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`, scope: n % 2 ? 'personal' : 'work' }, instant);
    await expect(repo.save(owner, { ...input, id: '10000000-0000-4000-8000-000000000041' }, instant)).rejects.toThrow('quota_exhausted');
    expect((await repo.save(owner, input, instant)).revision).toBe(1);
    await expect(repo.save(other, { ...input, id: '10000000-0000-4000-8000-000000000041' }, instant)).resolves.toBeDefined();
  });
  it('rejects non-string context IDs and never renews a 90-day-old save', async () => {
    expect(mutationSchema.safeParse({ ...input, context: [{ ...input.context[0], id: 123 }] }).success).toBe(false);
    const repo = new FixtureRepository(); const original = await repo.save(owner, input, instant);
    const replay = await repo.save(owner, input, '2027-02-01T00:00:00.000Z');
    expect(replay.status).toBe('expired'); expect(replay.consentUntil).toBe(original.consentUntil);
    expect(replay.request).toBe('');
  });
});
describe('durable owner adapter', () => {
  it('never sends a client owner, clock or fabricated result to save', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: newTask(owner, input, instant), error: null });
    const repo = new DurableRepository({ rpc }, owner);
    await repo.save(owner, input, instant);
    expect(rpc).toHaveBeenCalledWith('do_continuity_mutate', { p_input: input });
    await expect(repo.save(other, input, instant)).rejects.toThrow('not_found');
    expect(rpc).toHaveBeenCalledTimes(1);
  });
  it.each([null, {}, { ...newTask(owner, input, instant), ownerId: other }, { ...newTask(owner, input, instant), scope: 'work' }])('fails closed on malformed/mismatched save data', async data => {
    const repo = new DurableRepository({ rpc: vi.fn().mockResolvedValue({ data, error: null }) }, owner);
    await expect(repo.save(owner, input, instant)).rejects.toThrow('storage_unavailable');
  });
  it('never substitutes memory on storage failure and retries the exact save', async () => {
    const rpc = vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'relation missing' } })
      .mockResolvedValue({ data: newTask(owner, input, instant), error: null });
    const repo = new DurableRepository({ rpc } as ContinuityRpc, owner);
    await expect(repo.save(owner, input, instant)).rejects.toThrow('storage_unavailable');
    await repo.save(owner, input, instant);
    expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);
  });
  it('reads only the verified scope and propagates revision conflicts', async () => {
    const rpc = vi.fn().mockResolvedValueOnce({ data: [], error: null }).mockResolvedValue({ data: null, error: { message: 'continuity_conflict' } });
    const repo = new DurableRepository({ rpc }, owner);
    expect(await repo.get(owner, 'work', id, instant)).toBeNull();
    expect(rpc).toHaveBeenCalledWith('do_continuity_read', { p_scope: 'work', p_id: id });
    await expect(repo.change(owner, change('prepare'), instant)).rejects.toThrow('conflict');
  });
});
