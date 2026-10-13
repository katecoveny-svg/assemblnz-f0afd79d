import { fixtureCartAdapter } from '../../../apps/do/browser/fixture-adapter';
import { executeReviewedCart, proposalDigest, type Approval, type AuthorityStore } from '../../../apps/do/browser/executor';
import type { CartProposal } from '../../../apps/do/browser/contract';
const scope = { connectionId: '11111111-1111-4111-8111-111111111111', tabId: 1, documentId: 'fixture-document', origin: 'http://127.0.0.1:4198' as const, navigationRevision: 0 };
const adapter = fixtureCartAdapter(document, scope);
const root = document.querySelector<HTMLElement>('main')!;
root.querySelectorAll<HTMLButtonElement>('button').forEach(button => button.onclick = () => {
  const row = button.parentElement!;
  row.querySelector('output')!.value = row.querySelector('input')!.value;
  root.dataset.revision = String(Number(root.dataset.revision) + 1);
});
let proposal: CartProposal; let approval: Approval | null = null;
// Session-only fixture authority. It is deliberately neither a production adapter
// nor a durability claim; browser actions API cannot bind this store.
const claimed = new Set<string>();
const store: AuthorityStore = {
  getApproval: async () => approval,
  isConnected: async () => true,
  claim: async (_owner, id) => { if (claimed.has(id)) return false; claimed.add(id); return true; },
  finish: async (_owner, value) => { document.getElementById('receipt')!.textContent = JSON.stringify(value, null, 2); },
};
const prepare = document.querySelector<HTMLButtonElement>('#prepare')!;
const approve = document.querySelector<HTMLButtonElement>('#approve')!;
const execute = document.querySelector<HTMLButtonElement>('#execute')!;
prepare.onclick = async () => {
  approval = null; execute.disabled = true;
  const observed = await adapter.observe();
  proposal = { protocol: 'do.cart.v1', actionId: crypto.randomUUID(), revision: 1, scope, observedRevision: observed.revision,
    items: observed.items.map(i => ({ ...i, available: true, targetQuantity: i.productId === 'oats' ? 2 : 1 })), expiresAt: Date.now() + 60000 };
  document.getElementById('review')!.textContent = JSON.stringify(proposal, null, 2); approve.disabled = false;
};
approve.onclick = async () => {
  approval = { id: crypto.randomUUID(), ownerId: 'fixture-owner', actionId: proposal.actionId, revision: proposal.revision, digest: await proposalDigest(proposal), scope, expiresAt: proposal.expiresAt, revoked: false };
  execute.disabled = false; approve.disabled = true;
};
execute.onclick = async () => {
  execute.disabled = true;
  try { await executeReviewedCart({ ownerId: 'fixture-owner', approvalId: approval!.id, proposal }, store, adapter); }
  catch (error) { document.getElementById('receipt')!.textContent = error instanceof Error ? error.message : 'Stopped'; }
  finally { execute.disabled = false; }
};
