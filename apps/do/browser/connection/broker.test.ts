import { describe, it, expect, vi } from 'vitest';
import { ConnectionBroker, type ConnectionHost } from './broker';
import { connectionCommand, connectionSnapshot, FIXTURE_URL } from './protocol';
import type { BrowserScope } from '../contract';
const ownerA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const target = { tabId: 4, documentId: 'fixture-doc', url: FIXTURE_URL };
const workspace = { tabId: 8, documentId: 'do-doc', url: 'http://localhost:3000/do/personal' };
async function setup() {
  let owner: string | null = ownerA, now = 1000, revision = '1', current = true, quantity = 0;
  const read = vi.fn(async (scope: BrowserScope) => ({ scope, revision, observedAt: now, currency: 'NZD' as const, items: [{ productId: 'oats', name: 'Fictional oats', quantity, available: true, unitPriceCents: 350 }] }));
  const edit = vi.fn(async (_scope: BrowserScope, _revision: string, _id: string, value: number) => { quantity = value; revision += '+'; });
  const host: ConnectionHost = { owner: async () => owner, current: async () => current, adapter: (_tab, scope) => ({ mode: 'controlled_fixture', observe: () => read(scope), setQuantity: edit }) };
  const broker = new ConnectionBroker(host, () => now);
  const status = await broker.connect(target, workspace);
  if (!status.connected) throw new Error('fixture setup');
  const command = (action: string, extra = {}) => broker.command(workspace, { action, ...(action === 'status' ? {} : { connectionId: status.connectionId }), ...extra });
  const prepare = async () => { await broker.allowReadInCompanion(status.connectionId); await command('observe'); return command('prepare', { brief: 'Reviewed from text or voice', quantities: [{ productId: 'oats', quantity: 2 }] }); };
  return { broker, host, status, command, prepare, read, edit, setOwner: (v: string | null) => { owner = v; }, expire: () => { now += 120001; }, navigate: () => { current = false; }, quantity: () => quantity };
}
describe('temporary companion connection', () => {
  it('connects without reading and only companion approval mutates', async () => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId); expect(f.read).not.toHaveBeenCalled();
    const prepared = await f.prepare(); expect(f.edit).not.toHaveBeenCalled();
    if (!prepared.connected || !prepared.digest) throw new Error('review missing');
    const result = await f.broker.approveInCompanion(prepared.connectionId, prepared.digest);
    expect(result.connected && result.receipt?.status).toBe('verified'); expect(f.quantity()).toBe(2);
    expect(connectionSnapshot.safeParse(result).success).toBe(true);
    await expect(f.broker.approveInCompanion(prepared.connectionId, prepared.digest)).rejects.toThrow();
    expect(f.edit).toHaveBeenCalledTimes(1);
  });
  it.each(['guest', 'other-owner', 'expiry', 'navigation', 'cancel'])('revokes %s before effect', async reason => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId); const prepared = await f.prepare();
    if (!prepared.connected || !prepared.digest) throw new Error('review missing');
    if (reason === 'guest') f.setOwner(null);
    if (reason === 'other-owner') f.setOwner('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    if (reason === 'expiry') f.expire();
    if (reason === 'navigation') f.navigate();
    if (reason === 'cancel') await f.command('cancel');
    await expect(f.broker.approveInCompanion(prepared.connectionId, prepared.digest)).rejects.toThrow();
    expect(f.edit).not.toHaveBeenCalled(); expect((await f.broker.companionStatus()).connected).toBe(false);
  });
  it('rejects wrong tab, document, stale connection and arbitrary page execute', async () => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId);
    await expect(f.broker.command({ ...workspace, documentId: 'new-doc' }, { action: 'status' })).rejects.toThrow();
    await expect(f.broker.command(workspace, { action: 'observe', connectionId: crypto.randomUUID() })).rejects.toThrow();
    for (const action of ['execute', 'approve', 'checkout', 'evaluate']) expect(connectionCommand.safeParse({ action, code: 'evil' }).success).toBe(false);
    expect(f.read).not.toHaveBeenCalled();
  });
  it('rejects unsupported storefronts and anonymous ownership', async () => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId);
    await expect(f.broker.connect({ ...target, url: 'https://www.woolworths.co.nz' }, workspace)).rejects.toThrow();
    f.setOwner('guest'); await expect(f.broker.connect(target, workspace)).rejects.toThrow();
  });
  it('cancellation during observation prevents storing the result or making edits', async () => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId); f.read.mockImplementationOnce(async scope => { f.broker.revoke(); return { scope, revision: '1', observedAt: 1000, currency: 'NZD', items: [] }; });
    await expect(f.command('observe')).rejects.toThrow(); expect(f.broker.snapshot().connected).toBe(false); expect(f.edit).not.toHaveBeenCalled();
  });
  it('cancellation during connection cannot resurrect authority', async () => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId); f.host.owner = async () => { f.broker.revoke(); return ownerA; };
    await expect(f.broker.connect(target, workspace)).rejects.toThrow('cancelled');
    expect(f.broker.snapshot().connected).toBe(false);
  });
  it('owner changes clear companion preview, and old cancel cannot revoke a new connection', async () => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId); await f.prepare(); const next = await f.broker.connect(target, workspace);
    await expect(f.command('cancel')).rejects.toThrow('Connection changed'); expect(f.broker.snapshot().connected).toBe(true);
    f.setOwner(null); expect((await f.broker.companionStatus()).connected).toBe(false); expect(next.connected).toBe(true);
  });
  it('worker restart has no connection, persisted permit or replay', async () => {
    const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId); await f.prepare(); const restarted = new ConnectionBroker(f.host);
    expect(restarted.snapshot().connected).toBe(false); await expect(restarted.command(workspace, { action: 'status' })).rejects.toThrow();
  });
});
it('identity verification failure clears an existing companion preview', async () => {
  const f = await setup(); await f.broker.allowReadInCompanion(f.status.connectionId); await f.prepare();
  f.host.owner = async () => { throw new Error('offline'); };
  expect((await f.broker.companionStatus()).connected).toBe(false);
  expect(f.edit).not.toHaveBeenCalled();
});
it('page cannot grant a read; companion approval is required and reconnect drops it', async () => {
  const f = await setup();
  await expect(f.command('observe')).rejects.toThrow('companion'); expect(f.read).not.toHaveBeenCalled();
  await expect(f.command('allow-read')).rejects.toThrow(); expect(f.read).not.toHaveBeenCalled();
  await f.broker.allowReadInCompanion(f.status.connectionId); await f.command('observe'); expect(f.read).toHaveBeenCalledTimes(1);
  const next = await f.broker.connect(target, workspace); if (!next.connected) throw new Error('missing connection');
  expect(next.readGranted).toBe(false);
  await expect(f.broker.command(workspace, {action:'observe',connectionId:next.connectionId})).rejects.toThrow('companion');
});
