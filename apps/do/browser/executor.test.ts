import { describe, it, expect, vi } from 'vitest';
import { browserActionRequest, type CartObservation, type CartProposal } from './contract';
import { executeReviewedCart, proposalDigest, type Approval, type AuthorityStore, type CartAdapter } from './executor';
import { browserActionCapability } from './capability';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
async function fixture() {
  let tick = 1000;
  const scope = { connectionId: '11111111-1111-4111-8111-111111111111', tabId: 8, documentId: 'doc1', origin: 'http://127.0.0.1:4198' as const, navigationRevision: 0 };
  const state: CartObservation = { scope, observedAt: tick, revision: 'r1', currency: 'NZD', items: [
    { productId: 'oats', name: 'Oats', unitPriceCents: 350, available: true, quantity: 0 },
    { productId: 'milk', name: 'Milk', unitPriceCents: 480, available: true, quantity: 0 },
  ] };
  const proposal: CartProposal = { protocol: 'do.cart.v1', actionId: '22222222-2222-4222-8222-222222222222', revision: 1, scope: { ...scope }, observedRevision: 'r1', items: state.items.map(i => ({ ...i, available: true, targetQuantity: 2 })), expiresAt: 6000 };
  const approval: Approval = { id: '33333333-3333-4333-8333-333333333333', ownerId: 'owner', actionId: proposal.actionId, revision: 1, digest: await proposalDigest(proposal), scope: { ...scope }, expiresAt: 5000, revoked: false };
  const claims = new Set<string>();
  const store: AuthorityStore = {
    getApproval: vi.fn(async (owner, id) => owner === 'owner' && id === approval.id ? approval : null),
    isConnected: vi.fn(async () => true),
    claim: vi.fn(async (owner, id) => { const key = owner + id; if (claims.has(key)) return false; claims.add(key); return true; }),
    finish: vi.fn(async () => {}),
  };
  const adapter: CartAdapter = { mode: 'controlled_fixture', observe: vi.fn(async () => structuredClone(state)), setQuantity: vi.fn(async (_scope, _rev, id, quantity) => { state.items.find(i => i.productId === id)!.quantity = quantity; state.revision += '+'; }) };
  const run = () => executeReviewedCart({ ownerId: 'owner', approvalId: approval.id, proposal }, store, adapter, () => tick);
  return { state, proposal, approval, store, adapter, run, tick: (v: number) => { tick = v; } };
}
describe('reviewed cart foundation', () => {
  it('verifies each observed result and refuses replay', async () => {
    const f = await fixture(); const receipt = await f.run();
    expect(receipt.status).toBe('verified'); expect(receipt.retailerExecuted).toBe(false);
    expect(receipt.items.map(i => [i.status, i.observedQuantity])).toEqual([['verified', 2], ['verified', 2]]);
    // Restore the observed review to demonstrate claim protection independent of stale state.
    f.state.items.forEach(i => i.quantity = 0); f.state.revision = 'r1';
    await expect(f.run()).rejects.toThrow('Already claimed'); expect(f.adapter.setQuantity).toHaveBeenCalledTimes(2);
  });
  it('only one concurrent invocation claims a review', async () => {
    const f = await fixture(); const results = await Promise.allSettled([f.run(), f.run()]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1); expect(f.adapter.setQuantity).toHaveBeenCalledTimes(2);
  });
  it.each(['owner', 'expired', 'revoked', 'offline', 'revision', 'quantity', 'price', 'domain', 'tab', 'navigation', 'stale', 'duplicate', 'injection'])('rejects %s before effects', async kind => {
    const f = await fixture();
    if (kind === 'owner') f.approval.ownerId = 'other';
    if (kind === 'expired') f.tick(5000);
    if (kind === 'revoked') f.approval.revoked = true;
    if (kind === 'offline') f.store.isConnected = async () => false;
    if (kind === 'revision') f.proposal.revision++;
    if (kind === 'quantity') f.proposal.items[0].targetQuantity++;
    if (kind === 'price') f.state.items[0].unitPriceCents++;
    if (kind === 'domain') f.proposal.scope.origin = 'https://www.woolworths.co.nz';
    if (kind === 'tab') f.state.scope.tabId++;
    if (kind === 'navigation') f.state.scope.documentId = 'doc2';
    if (kind === 'stale') f.state.revision = 'r2';
    if (kind === 'duplicate') f.proposal.items.push(f.proposal.items[0]);
    if (kind === 'injection') Object.assign(f.proposal, { javascript: 'fetch(document.cookie)' });
    await expect(f.run()).rejects.toThrow(); expect(f.adapter.setQuantity).not.toHaveBeenCalled();
  });
  it('marks click with lost acknowledgement uncertain and stops remaining items', async () => {
    const f = await fixture(); f.adapter.setQuantity = vi.fn(async () => { f.state.items[0].quantity = 2; throw new Error('lost response'); });
    const r = await f.run(); expect(r.status).toBe('stopped'); expect(r.items.map(i => i.status)).toEqual(['uncertain', 'not_attempted']);
    expect(f.adapter.setQuantity).toHaveBeenCalledTimes(1);
  });
  it('stops on revocation during the first click without a false verified receipt', async () => {
    const f = await fixture(); f.adapter.setQuantity = vi.fn(async () => { f.state.items[0].quantity = 2; f.approval.revoked = true; });
    expect((await f.run()).items.map(i => i.status)).toEqual(['uncertain', 'not_attempted']);
  });
  it('does not retry if receipt persistence fails after effects', async () => {
    const f = await fixture(); f.store.finish = vi.fn(async () => { throw new Error('store unavailable'); });
    await expect(f.run()).rejects.toThrow('store unavailable');
    f.state.items.forEach(i => i.quantity = 0); f.state.revision = 'r1';
    await expect(f.run()).rejects.toThrow('Already claimed'); expect(f.adapter.setQuantity).toHaveBeenCalledTimes(2);
  });
  it('stops if the page changes unrelated products or fails to change target', async () => {
    const f = await fixture(); f.adapter.setQuantity = vi.fn(async () => { f.state.items[1].quantity = 10; });
    expect((await f.run()).items.map(i => i.status)).toEqual(['uncertain', 'not_attempted']);
  });
  it('denies checkout, arbitrary JS and client-supplied ownership', () => {
    for (const payload of [{ action: 'checkout' }, { action: 'evaluate', code: 'x' }, { action: 'revoke', connectionId: '11111111-1111-4111-8111-111111111111', ownerId: 'victim' }]) expect(browserActionRequest.safeParse(payload).success).toBe(false);
  });
  it('extension and authenticated API share truthful unavailable status', () => {
    const context = {} as { DoBrowserCapability: unknown }; runInNewContext(readFileSync('apps/do/extension/browser-capability.js', 'utf8'), context);
    expect(context.DoBrowserCapability).toEqual(browserActionCapability()); expect(browserActionCapability().canMutateCart).toBe(false);
  });
});
it('navigation during an effect produces uncertainty and stops the batch', async () => {
  const f = await fixture(); f.adapter.setQuantity = vi.fn(async () => { f.state.items[0].quantity = 2; f.state.scope.documentId = 'new-document'; });
  expect((await f.run()).items.map(i => i.status)).toEqual(['uncertain', 'not_attempted']); expect(f.adapter.setQuantity).toHaveBeenCalledTimes(1);
});
it('a different approval ID and excessive validity cannot grant execution', async () => {
  const f = await fixture(); f.approval.id = '44444444-4444-4444-8444-444444444444';
  // Store returning an unrelated approval must be rejected even if its content matches.
  f.store.getApproval = async () => ({ ...f.approval, id: '33333333-3333-4333-8333-333333333333' });
  await expect(f.run()).rejects.toThrow();
  f.store.getApproval = async () => f.approval; f.proposal.expiresAt = 999999;
  f.approval.digest = await proposalDigest(f.proposal); await expect(f.run()).rejects.toThrow();
  expect(f.adapter.setQuantity).not.toHaveBeenCalled();
});

it.each(['revoked', 'expired', 'offline'])('stops before effects when %s during observation', async kind => {
  const f = await fixture(); let observations = 0;
  f.adapter.observe = vi.fn(async () => {
    if (++observations === 2) {
      if (kind === 'revoked') f.approval.revoked = true;
      if (kind === 'expired') f.tick(5000);
      if (kind === 'offline') f.store.isConnected = async () => false;
    }
    return structuredClone(f.state);
  });
  const receipt = await f.run();
  expect(receipt.status).toBe('stopped');
  expect(receipt.items.map(i => i.status)).toEqual(['not_attempted', 'not_attempted']);
  expect(f.adapter.setQuantity).not.toHaveBeenCalled();
});

it('checks expiry after the asynchronous connection lookup immediately before effects', async () => {
  const f = await fixture(); let connections = 0;
  f.store.isConnected = vi.fn(async () => {
    if (++connections === 3) f.tick(5000);
    return true;
  });
  expect((await f.run()).items.map(i => i.status)).toEqual(['not_attempted', 'not_attempted']);
  expect(f.adapter.setQuantity).not.toHaveBeenCalled();
});
