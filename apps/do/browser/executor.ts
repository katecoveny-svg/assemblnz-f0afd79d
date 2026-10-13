import { cartObservation, cartProposal, type BrowserScope, type CartObservation, type CartProposal, type CartReceipt, type ItemReceipt } from './contract';

export type Approval = {
  id: string; ownerId: string; actionId: string; revision: number; digest: string;
  scope: BrowserScope; expiresAt: number; revoked: boolean;
};
/** Production implementation must authenticate owner, perform atomic durable claims,
 * and retain in-flight tombstones on crash. No process-memory fallback is allowed.
 * claim keys by owner + actionId (not caller-chosen retry IDs). A revision cannot
 * grant a second execution of an already claimed action. */
export interface AuthorityStore {
  getApproval(ownerId: string, approvalId: string): Promise<Approval | null>;
  isConnected(ownerId: string, scope: BrowserScope): Promise<boolean>;
  claim(ownerId: string, actionId: string): Promise<boolean>;
  finish(ownerId: string, receipt: CartReceipt): Promise<void>;
}
export interface CartAdapter {
  mode: 'controlled_fixture';
  observe(): Promise<CartObservation>;
  /** Static adapter implementation, never JS/selectors supplied by a model. Must
   * recheck document and revision immediately before its one bounded DOM action. */
  setQuantity(scope: BrowserScope, expectedRevision: string, productId: string, quantity: number): Promise<void>;
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export async function proposalDigest(input: CartProposal): Promise<string> {
  const value = cartProposal.parse(input); // fixed schema order, reject unknown fields
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
function checkObservation(value: CartObservation, proposal: CartProposal, now: number) {
  if (!same(value.scope, proposal.scope) || now - value.observedAt > 30000 || value.observedAt > now) throw new Error('Scope or observation expired');
}
export async function executeReviewedCart(input: {
  /** Supplied by verified server session / paired channel, never request JSON. */
  ownerId: string; approvalId: string; proposal: CartProposal;
}, store: AuthorityStore, adapter: CartAdapter, now = () => Date.now()): Promise<CartReceipt> {
  const proposal = cartProposal.parse(input.proposal);
  // This slice intentionally cannot run against a live retailer, even if given a permit.
  if (adapter.mode !== 'controlled_fixture' || proposal.scope.origin !== 'http://127.0.0.1:4198') throw new Error('Live retailer adapter unavailable');
  const digest = await proposalDigest(proposal);
  async function authority() {
    const a = await store.getApproval(input.ownerId, input.approvalId);
    if (!input.ownerId || !a || a.id !== input.approvalId || a.ownerId !== input.ownerId || a.revoked || a.expiresAt <= now() || proposal.expiresAt <= now() || proposal.expiresAt > now() + 300000
      || a.actionId !== proposal.actionId || a.revision !== proposal.revision || a.digest !== digest || !same(a.scope, proposal.scope)
      || !await store.isConnected(input.ownerId, proposal.scope)) throw new Error('Approval or connection unavailable');
  }
  await authority();
  let observed = cartObservation.parse(await adapter.observe());
  checkObservation(observed, proposal, now());
  if (observed.revision !== proposal.observedRevision) throw new Error('Review changed');
  for (const item of proposal.items) {
    const actual = observed.items.find(i => i.productId === item.productId);
    const { targetQuantity: _target, ...reviewed } = item;
    if (!actual || !same(actual, reviewed)) throw new Error('Product changed');
  }
  // Claim before the first effect; loss of a receipt never authorises replay.
  if (!await store.claim(input.ownerId, proposal.actionId)) throw new Error('Already claimed; reconcile observed cart before a new review');
  const receipts: ItemReceipt[] = proposal.items.map(i => ({ productId: i.productId, requestedQuantity: i.targetQuantity, beforeQuantity: i.quantity, observedQuantity: null, beforeRevision: null, afterRevision: null, status: 'not_attempted' }));
  let stopped = false;
  for (let index = 0; index < proposal.items.length; index++) {
    const item = proposal.items[index];
    try {
      await authority();
      const before = cartObservation.parse(await adapter.observe());
      checkObservation(before, proposal, now());
      if (!same(before.items, observed.items) || before.revision !== observed.revision) throw new Error('Cart changed');
      // Observation can yield while consent expires or the connection is revoked.
      await authority();
      receipts[index].beforeRevision = before.revision;
      receipts[index].status = 'uncertain'; // includes click applied but response lost
      await adapter.setQuantity(proposal.scope, before.revision, item.productId, item.targetQuantity);
      const after = cartObservation.parse(await adapter.observe());
      checkObservation(after, proposal, now());
      await authority(); // navigation/revocation during click must never claim verified
      const expected = before.items.map(i => i.productId === item.productId ? { ...i, quantity: item.targetQuantity } : i);
      const actual = after.items.find(i => i.productId === item.productId);
      receipts[index].afterRevision = after.revision;
      receipts[index].observedQuantity = actual?.quantity ?? null;
      if (!same(after.items, expected)) throw new Error('Cart result not verified');
      receipts[index].status = 'verified';
      observed = after;
    } catch { stopped = true; break; }
  }
  const receipt: CartReceipt = { actionId: proposal.actionId, revision: proposal.revision, digest, scope: proposal.scope, finishedAt: now(), mode: 'controlled_fixture', retailerExecuted: false, status: stopped ? 'stopped' : 'verified', items: receipts };
  await store.finish(input.ownerId, receipt); // failure remains claimed, never retry mutation
  return receipt;
}
