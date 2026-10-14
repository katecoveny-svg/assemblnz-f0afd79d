import { z } from 'zod';
import { cartProposal, type CartProposal, type CartReceipt } from '../contract';
import { proposalDigest, type AuthorityStore } from '../executor';
const hex = z.string().regex(/^[a-f0-9]{64}$/);
const metaSchema = z.object({ epoch: z.string().uuid(), boot: z.string().uuid(), version: z.literal(1) }).strict();
const recordSchema = z.object({
  key: hex, owner: hex, context: hex, scope: hex, digest: hex,
  revision: z.number().int().positive(), expiresAt: z.number().int().positive(),
  boot: z.string().uuid(), state: z.enum(['claimed', 'verified', 'uncertain', 'reconciled']),
  items: z.array(z.object({ sku: z.string().max(80), before: z.number().int(), target: z.number().int() }).strict()).min(1).max(20),
  receiptDigest: hex.optional(), reconciliationDigest: hex.optional(),
}).strict();
type RecordValue = z.infer<typeof recordSchema>;
const lockSchema = z.object({ key: hex }).strict();
async function hash(value: unknown) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))), b => b.toString(16).padStart(2, '0')).join('');
}
function open(factory: IDBFactory, name: string, create: boolean): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = factory.open(name, 1);
    r.onupgradeneeded = () => {
      if (!create) { r.transaction!.abort(); return; }
      r.result.createObjectStore('state'); r.result.createObjectStore('claims', { keyPath: 'key' });
    };
    r.onerror = () => reject(new Error('Journal unavailable; explicit setup required'));
    r.onblocked = () => reject(new Error('Journal blocked'));
    r.onsuccess = () => { r.result.onversionchange = () => r.result.close(); resolve(r.result); };
  });
}
/** No DOM effect may occur until this transaction's oncomplete has fired. */
function transaction<T>(db: IDBDatabase, run: (state: IDBObjectStore, claims: IDBObjectStore, done: (value: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['state', 'claims'], 'readwrite', { durability: 'strict' });
    let result: T, error: unknown;
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(error || new Error('Journal transaction failed'));
    tx.onerror = () => { /* onabort rejects; never acknowledge an uncommitted write. */ };
    const safe = (fn: () => void) => { try { fn(); } catch (e) { error = e; tx.abort(); } };
    // Wrap request callbacks as well as synchronous setup so malformed state aborts.
    const state = tx.objectStore('state'), claims = tx.objectStore('claims');
    const proxy = (store: IDBObjectStore) => new Proxy(store, { get(target, prop) {
      const value = Reflect.get(target, prop, target);
      if (prop !== 'get') return typeof value === 'function' ? value.bind(target) : value;
      return (key: IDBValidKey) => {
        const request = target.get(key);
        return new Proxy(request, { get: (r, p) => Reflect.get(r, p, r), set(r, p, v) { if (p === 'onsuccess') { r.onsuccess = () => safe(v); return true; } return Reflect.set(r, p, v, r); } });
      };
    } });
    safe(() => run(proxy(state), proxy(claims), value => { result = value; }));
  });
}
/** Staged extension-origin persistence primitive. Not imported by the worker or
 * any page relay. One global mutation lock deliberately bounds the local pilot. */
export class LocalMutationJournal {
  private constructor(private db: IDBDatabase, private epoch: string, private boot: string) {}
  /** Call only from a separately reviewed explicit setup/reset flow. Existing
   * journals are never silently reset, including after schema/storage failure. */
  static async initialize(factory: IDBFactory, name: string, epoch: string) {
    z.string().uuid().parse(epoch);
    const db = await open(factory, name, true);
    try { await transaction(db, (state, _claims, done) => {
      const r = state.get('meta'); r.onsuccess = () => {
        if (r.result !== undefined) throw new Error('Journal already initialized');
        state.add({ epoch, boot: crypto.randomUUID(), version: 1 }, 'meta'); done(undefined);
      };
    }); } finally { db.close(); }
  }
  /** Start once per worker lifetime. Restart fences every prior worker handle;
   * task approvals stay in memory and are never restored from this journal. */
  static async start(factory: IDBFactory, name: string, epoch: string) {
    const db = await open(factory, name, false), boot = crypto.randomUUID();
    try { await transaction(db, (state, _claims, done) => {
      const r = state.get('meta'); r.onsuccess = () => {
        const meta = metaSchema.parse(r.result);
        if (meta.epoch !== epoch) throw new Error('Journal installation changed');
        state.put({ ...meta, boot }, 'meta'); done(undefined);
      };
    }); return new LocalMutationJournal(db, epoch, boot); } catch (e) { db.close(); throw e; }
  }
  close() { this.db.close(); }
  private async bindings(owner: string, raw: CartProposal) {
    if (!owner || owner.length > 200) throw new Error('Verified owner required');
    const p = cartProposal.parse(raw);
    if (!p.retailerContext) throw new Error('Verified retailer context required');
    return { key: await hash([this.epoch, owner, p.actionId]), owner: await hash([this.epoch, owner]), context: await hash([this.epoch, p.retailerContext]), scope: await hash(p.scope), digest: await proposalDigest(p), revision: p.revision, expiresAt: p.expiresAt };
  }
  private run<T>(fn: (state: IDBObjectStore, claims: IDBObjectStore, done: (v: T) => void) => void) {
    return transaction<T>(this.db, (state, claims, done) => {
      const r = state.get('meta'); r.onsuccess = () => {
        const meta = metaSchema.parse(r.result);
        if (meta.epoch !== this.epoch || meta.boot !== this.boot) throw new Error('Journal session invalidated');
        fn(state, claims, done);
      };
    });
  }
  async current() { return this.run<boolean>((_s, _c, done) => done(true)); }
  async claim(owner: string, proposal: CartProposal, now: () => number) {
    const binding = await this.bindings(owner, proposal);
    if (binding.expiresAt <= now() || binding.expiresAt > now() + 300000) throw new Error('Claim expired');
    return this.run<boolean>((state, claims, done) => {
      const r = state.get('lock'); r.onsuccess = () => {
        if (r.result !== undefined) { lockSchema.parse(r.result); done(false); return; }
        const existing = claims.get(binding.key); existing.onsuccess = () => {
          if (existing.result !== undefined) { recordSchema.parse(existing.result); done(false); return; }
          if (binding.expiresAt <= now()) throw new Error('Claim expired');
          claims.add({ ...binding, boot: this.boot, state: 'claimed', items: proposal.items.map(i => ({ sku: i.productId, before: i.quantity, target: i.targetQuantity })) });
          state.add({ key: binding.key }, 'lock'); done(true);
        };
      };
    });
  }
  async finish(owner: string, proposal: CartProposal, receipt: CartReceipt) {
    const binding = await this.bindings(owner, proposal), receiptDigest = await hash(receipt);
    if (receipt.actionId !== proposal.actionId || receipt.revision !== binding.revision || receipt.digest !== binding.digest || await hash(receipt.scope) !== binding.scope || await hash([this.epoch, receipt.retailerContext]) !== binding.context) throw new Error('Receipt binding mismatch');
    const verified = receipt.status === 'verified' && receipt.items.length === proposal.items.length && receipt.items.every((r, i) => r.status === 'verified' && r.productId === proposal.items[i].productId && r.beforeQuantity === proposal.items[i].quantity && r.requestedQuantity === proposal.items[i].targetQuantity && r.observedQuantity === r.requestedQuantity);
    return this.run((state, claims, done) => {
      const l = state.get('lock'); l.onsuccess = () => {
        if (lockSchema.parse(l.result).key !== binding.key) throw new Error('Claim lock mismatch');
        const r = claims.get(binding.key); r.onsuccess = () => {
          const record = recordSchema.parse(r.result);
          if (record.boot !== this.boot || record.state !== 'claimed' || record.digest !== binding.digest || record.scope !== binding.scope || record.context !== binding.context || record.owner !== binding.owner) throw new Error('Claim mismatch');
          claims.put({ ...record, state: verified ? 'verified' : 'uncertain', receiptDigest });
          if (verified) state.delete('lock'); done(undefined);
        };
      };
    });
  }
  async pending(owner: string) {
    const ownerHash = await hash([this.epoch, owner]);
    return this.run<RecordValue | null>((state, claims, done) => {
      const l = state.get('lock'); l.onsuccess = () => {
        if (l.result === undefined) { done(null); return; }
        const key = lockSchema.parse(l.result).key;
        const r = claims.get(key); r.onsuccess = () => { const record = recordSchema.parse(r.result); if (record.owner !== ownerHash) throw new Error('Recovery owner changed'); done(record); };
      };
    });
  }
  /** Only trusted extension recovery UI may call this after a new approved read
   * and explicit human reconciliation. This records acknowledgement, NOT success.
   * No page message endpoint, automatic equality reconciliation or retry exists. */
  async reconcileAfterRestart(owner: string, key: string, context: NonNullable<CartProposal['retailerContext']>, reviewedObservationDigest: string, confirm: () => Promise<boolean>) {
    hex.parse(reviewedObservationDigest);
    hex.parse(key);
    const ownerHash = await hash([this.epoch, owner]), contextHash = await hash([this.epoch, context]);
    if (!await confirm()) throw new Error('Explicit reconciliation required');
    return this.run((state, claims, done) => {
      const l = state.get('lock'); l.onsuccess = () => {
        if (lockSchema.parse(l.result).key !== key) throw new Error('Recovery lock mismatch');
        const r = claims.get(key); r.onsuccess = () => {
          const record: RecordValue = recordSchema.parse(r.result);
          if (record.boot === this.boot || !['claimed', 'uncertain'].includes(record.state) || record.owner !== ownerHash || record.context !== contextHash) throw new Error('Recovery binding mismatch');
          claims.put({ ...record, state: 'reconciled', reconciliationDigest: reviewedObservationDigest });
          state.delete('lock'); done(undefined);
        };
      };
    });
  }
}
/** Adapter for the existing executor contract. Authority is always freshly
 * checked by the caller's native session implementation, never stored here. */
export function withLocalJournal(journal: LocalMutationJournal, authority: Pick<AuthorityStore, 'getApproval' | 'isConnected'>, owner: string, raw: CartProposal, now = () => Date.now()): AuthorityStore {
  const proposal = cartProposal.parse(raw);
  return {
    getApproval: async (who, id) => { if (who !== owner) return null; await journal.current(); return authority.getApproval(who, id); },
    isConnected: async (who, scope) => who === owner && await journal.current() && await authority.isConnected(who, scope),
    claim: async (who, action) => { if (who !== owner || action !== proposal.actionId || !await authority.isConnected(who, proposal.scope)) return false; return journal.claim(who, proposal, now); },
    finish: async (who, receipt) => { if (who !== owner) throw new Error('Owner changed'); await journal.finish(who, proposal, receipt); },
  };
}
