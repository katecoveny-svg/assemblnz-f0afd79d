import { cartObservation, cartProposal, type BrowserScope, type CartObservation, type CartProposal, type CartReceipt } from '../contract';
import { executeReviewedCart, proposalDigest, type Approval, type CartAdapter, type AuthorityStore } from '../executor';
import { LocalMutationJournal, withLocalJournal } from '../journal/local';
import { CONNECTION_PROTOCOL, connectionCommand, isFixtureUrl, isWorkspaceUrl, TASK_LIFETIME_MS, type TabIdentity } from './protocol';

export interface ConnectionHost {
  /** Trusted isolated companion code reads only the first-party identity endpoint. */
  owner(workspace: TabIdentity): Promise<string | null>;
  current(tab: TabIdentity): Promise<boolean>;
  /** Required by the shipping MV3 host; absent only in legacy synthetic hosts. */
  journal?(): Promise<LocalMutationJournal>;
  adapter(target: TabIdentity, scope: BrowserScope): CartAdapter;
}
type Task = {
  id: string; owner: string; target: TabIdentity; workspace: TabIdentity; scope: BrowserScope;
  expiresAt: number; readGranted: boolean; revoked: boolean; busy: boolean; claims: Set<string>;
  observation: CartObservation | null; proposal: CartProposal | null; digest: string | null;
  brief: string; approval: Approval | null; receipt: CartReceipt | null;
};
export type ConnectionSnapshot = ReturnType<ConnectionBroker['snapshot']>;
/** Ephemeral task authority in the companion worker. Worker restart loses the whole
 * connection; nothing replays or reconnects. Not remote pairing or durable storage. */
export class ConnectionBroker {
  private task: Task | null = null;
  private generation = 0;
  private connecting: { generation: number; tabs: number[] } | null = null;
  private executing = false;
  private recovery: {task:Task;key:string;digest:string;items:{sku:string;before:number;target:number;current:number|null}[]} | null = null;
  constructor(private host: ConnectionHost, private now = () => Date.now()) {}
  revoke() { this.generation++; this.recovery = null; if (this.task) { this.task.revoked = true; this.task.observation = null; this.task.proposal = null; this.task.approval = null; this.task.receipt = null; this.task.brief = ''; } this.task = null; }
  revokeTab(tabId: number) { if (this.connecting?.tabs.includes(tabId) || (this.task && [this.task.target.tabId, this.task.workspace.tabId].includes(tabId))) this.revoke(); }
  snapshot() {
    const t = this.task;
    if (!t || t.revoked || t.expiresAt <= this.now()) return { protocol: CONNECTION_PROTOCOL, connected: false as const, mode: 'synthetic_storefront' as const, remote: false as const, reason: 'No current companion task connection.' };
    return { protocol: CONNECTION_PROTOCOL, connected: true as const, mode: 'synthetic_storefront' as const, remote: false as const,
      connectionId: t.id, owner: t.owner, target: t.target, expiresAt: t.expiresAt, readGranted: t.readGranted, busy: t.busy,
      observation: t.observation, proposal: t.proposal, digest: t.digest, brief: t.brief, receipt: t.receipt, recovery: this.recovery?.task === t ? {digest:this.recovery.digest,items:this.recovery.items} : null,
      reason: 'Only this fictional storefront tab is connected. No real retailer access.' };
  }
  async connect(target: TabIdentity, workspace: TabIdentity) {
    this.revoke();
    if (this.executing) throw new Error('Wait for the dispatched action to settle before reconnecting.');
    const generation = this.generation;
    const check = () => { if (generation !== this.generation) throw new Error('Connection cancelled.'); };
    if (!isFixtureUrl(target.url) || !isWorkspaceUrl(workspace.url) || target.tabId === workspace.tabId) throw new Error('Supported storefront and Personal DO tab required.');
    this.connecting = { generation, tabs: [target.tabId, workspace.tabId] };
    try {
      const owner = await this.host.owner(workspace);check();
      if (!owner || owner === 'guest' || !await this.host.current(target) || !await this.host.current(workspace)) throw new Error('Sign in to Personal DO, then reconnect these tabs.');
      check();
      const finalOwner = await this.host.owner(workspace);check();
      if (finalOwner !== owner) throw new Error('Owner changed during connection.');
      const id = crypto.randomUUID();
      this.task = { id, owner, target, workspace, scope: { connectionId: id, tabId: target.tabId, documentId: target.documentId, origin: 'http://127.0.0.1:4198', navigationRevision: 0 }, expiresAt: this.now() + TASK_LIFETIME_MS, readGranted: false, revoked: false, busy: false, claims: new Set(), observation: null, proposal: null, digest: null, brief: '', approval: null, receipt: null };
      return this.snapshot();
    } finally { if (this.connecting?.generation === generation) this.connecting = null; }
  }
  async allowReadInCompanion(connectionId: string) {
    const t = this.task;
    if (!t || t.id !== connectionId) throw new Error('Connection changed.');
    await this.guard(t);
    t.readGranted = true;
    return this.snapshot();
  }
  async companionStatus() {
    if (this.task) { try { await this.guard(this.task); } catch { /* Guard revoked it. */ } }
    return this.snapshot();
  }
  private async guard(t: Task) {
    let owner: string | null, current: boolean;
    try { owner = await this.host.owner(t.workspace); current = await this.host.current(t.target) && await this.host.current(t.workspace);
      if (owner !== await this.host.owner(t.workspace)) owner = null; }
    catch { if (this.task === t) this.revoke(); throw new Error('Identity or tab verification unavailable. Reconnect explicitly.'); }
    if (this.task !== t || t.revoked || t.expiresAt <= this.now() || owner !== t.owner || !current) {
      if (this.task === t) this.revoke();
      throw new Error('Connection expired, account changed or tab moved. Reconnect and review again.');
    }
  }
  async command(workspace: TabIdentity, raw: unknown) {
    const command = connectionCommand.parse(raw);
    const t = this.task;
    if (!t || t.workspace.tabId !== workspace.tabId || t.workspace.documentId !== workspace.documentId || t.workspace.url !== workspace.url) throw new Error('This Personal DO tab is not connected.');
    if (command.action !== 'status' && command.connectionId !== t.id) throw new Error('Connection changed.');
    if (command.action === 'cancel') { this.revoke(); return this.snapshot(); }
    await this.guard(t);
    if (command.action === 'status') return this.snapshot();
    if (t.busy) throw new Error('A review or action is already in progress.');
    t.busy = true; this.recovery = null;
    try {
      if (command.action === 'observe') {
        if (!t.readGranted) throw new Error('Approve the bounded product/cart read in the companion first.');
        // Grant was issued by the extension-owned UI, not this page command.
        const observation = cartObservation.parse(await this.host.adapter(t.target, t.scope).observe());
        await this.guard(t);
        if (JSON.stringify(observation.scope) !== JSON.stringify(t.scope)) throw new Error('Tab scope changed.');
        t.observation = observation; t.proposal = null; t.digest = null; t.approval = null; t.receipt = null;
      } else {
        if (!t.observation || this.now() - t.observation.observedAt > 30000) throw new Error('Read the current products again before reviewing.');
        if (new Set(command.quantities.map(i => i.productId)).size !== command.quantities.length) throw new Error('Duplicate products.');
        const proposal = cartProposal.parse({ protocol: 'do.cart.v1', actionId: crypto.randomUUID(), revision: 1, scope: t.scope,
          observedRevision: t.observation.revision, ...(t.observation.retailerContext ? { retailerContext: t.observation.retailerContext } : {}), expiresAt: t.expiresAt,
          items: command.quantities.map(q => ({ ...t.observation!.items.find(i => i.productId === q.productId), targetQuantity: q.quantity })) });
        const digest = await proposalDigest(proposal);
        await this.guard(t);
        t.proposal = proposal; t.digest = digest; t.brief = command.brief; t.approval = null; t.receipt = null;
      }
      return this.snapshot();
    } finally { t.busy = false; }
  }
  private live(t:Task) {
    if(this.task!==t||t.revoked||t.expiresAt<=this.now())throw new Error('Reconnect and review again.');
  }
  private async observationDigest(value:CartObservation) {
    const {observedAt:_time,scope:_scope,...facts}=value;
    const bytes=new TextEncoder().encode(JSON.stringify(facts));
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  }
  /** Companion-only recovery; page protocol intentionally has no recovery command. */
  async recoverInCompanion(connectionId:string,digest?:string) {
    const t=this.task;
    if(!t||t.id!==connectionId||t.busy||this.executing||!t.readGranted||!this.host.journal)throw new Error('Connect and approve a fresh read before recovery.');
    t.busy=true;
    try {
      await this.guard(t);const journal=await this.host.journal();await this.guard(t);
      const pending=await journal.pending(t.owner);await this.guard(t);
      if(!pending)throw new Error('No uncertain action needs recovery.');
      const observed=cartObservation.parse(await this.host.adapter(t.target,t.scope).observe());await this.guard(t);
      if(JSON.stringify(observed.scope)!==JSON.stringify(t.scope)||observed.observedAt>this.now()||this.now()-observed.observedAt>10000)throw new Error('Fresh cart read required.');
      const actual=await this.observationDigest(observed);await this.guard(t);
      if(digest!==undefined){
        const review=this.recovery;
        if(!review||review.task!==t||review.key!==pending.key||review.digest!==digest||actual!==digest)throw new Error('Recovery review changed. Read and review again.');
        await journal.reconcileAfterRestart(t.owner,pending.key,observed.retailerContext??{fixtureOrigin:'http://127.0.0.1:4198'},digest,async()=>{await this.guard(t);return true;},()=>this.live(t));
        await this.guard(t);this.recovery=null;t.observation=null;t.proposal=null;t.digest=null;t.approval=null;t.receipt=null;
      }else{
        this.recovery={task:t,key:pending.key,digest:actual,items:pending.items.map(i=>({...i,current:observed.items.find(p=>p.productId===i.sku)?.quantity??null}))};
        t.proposal=null;t.digest=null;t.approval=null;
      }
      return this.snapshot();
    }finally{t.busy=false;}
  }
  /** Only the extension-owned review UI may call this, never a page relay. */
  async approveInCompanion(connectionId: string, digest: string) {
    const t = this.task;
    if (!t || t.id !== connectionId || !t.proposal || t.digest !== digest || t.busy) throw new Error('Review changed or an action is running.');
    t.busy = true;
    this.executing = true; this.recovery = null;
    try {
      await this.guard(t);
      t.approval = { id: crypto.randomUUID(), ownerId: t.owner, actionId: t.proposal.actionId, revision: t.proposal.revision, digest, scope: t.scope, expiresAt: t.expiresAt, revoked: false };
      const journal = this.host.journal ? await this.host.journal() : null;
      await this.guard(t);
      const authority: AuthorityStore = {
        getApproval: async (owner, id) => { await this.guard(t); return owner === t.owner && t.approval?.id === id ? t.approval : null; },
        isConnected: async () => { try { await this.guard(t); return true; } catch { return false; } },
        claim: async (owner, actionId) => { if (this.task !== t || t.revoked || owner !== t.owner || t.claims.has(actionId)) return false; t.claims.add(actionId); return true; },
        finish: async (owner, receipt) => { if (this.task === t && !t.revoked && owner === t.owner) t.receipt = receipt; },
      };
      const store = journal ? withLocalJournal(journal, authority, t.owner, t.proposal!, this.now) : authority;
      const receipt = await executeReviewedCart({ownerId:t.owner,approvalId:t.approval!.id,proposal:t.proposal!},store,this.host.adapter(t.target,t.scope),this.now);
      await this.guard(t);
      t.receipt = receipt;
      return this.snapshot();
    } finally { t.busy = false; this.executing = false; }
  }
}
