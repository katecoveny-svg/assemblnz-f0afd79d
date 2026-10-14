import { z } from 'zod';
import { cartObservation, cartProposal, retailerContext, retailerProduct, type BrowserScope, type CartObservation, type CartProposal } from '../contract';
import type { CartAdapter } from '../executor';
import { proposalDigest } from '../executor';
import { requireWoolworthsRelease } from './gate';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const product = retailerProduct.extend({ name: z.string().min(1).max(160), unitPriceCents: z.number().int().positive().max(100000), available: z.boolean(), quantity: z.number().int().min(0).max(99) }).strict();
export const retailerSnapshot = z.object({ scope: cartObservation.shape.scope, revision: z.string().min(1).max(100), observedAt: z.number().int().nonnegative(), currency: z.literal('NZD'), context: retailerContext, products: z.array(product).min(1).max(100) }).strict().refine(s => new Set(s.products.map(p => p.sku)).size === s.products.length, 'Duplicate or ambiguous SKU');
export type RetailerSnapshot = z.infer<typeof retailerSnapshot>;
/** Bounded native port; no URL navigation, evaluation, selector strings, credential,
 * checkout, submit or payment operation exists. Must run in the selected document.
 * The concrete Woolworths native DOM mapping is deliberately NOT guessed. */
export interface RetailerCartPort {
  readProductCartFields(): Promise<unknown>;
  /** Recheck complete cart revision/context + exact SKU facts immediately at effect.
   * Set TOTAL quantity, never blindly replay an increment. One attempt; no retries. */
  compareAndSetQuantity(command: { scope: BrowserScope; expectedRevision: string; context: RetailerSnapshot['context']; product: RetailerSnapshot['products'][number]; targetQuantity: number }): Promise<void>;
}
export type ReadGrant = { ownerId: string; scope: BrowserScope; expiresAt: number; revoked: boolean; fields: 'product_cart_only'; context: RetailerSnapshot['context'] };
export interface RetailerAuthority {
  /** Supplied by trusted extension-owned consent, not a page checkbox/message. */
  readGrant(ownerId: string, scope: BrowserScope): Promise<ReadGrant | null>;
  current(ownerId: string, scope: BrowserScope): Promise<boolean>;
}
function project(snapshot: RetailerSnapshot): CartObservation {
  return cartObservation.parse({ scope: snapshot.scope, revision: snapshot.revision, observedAt: snapshot.observedAt, currency: snapshot.currency, retailerContext: snapshot.context,
    items: snapshot.products.map(p => ({ productId: p.sku, name: p.name, unitPriceCents: p.unitPriceCents, available: p.available, quantity: p.quantity,
      retailerProduct: { sku: p.sku, variant: p.variant, packSize: p.packSize, saleUnit: p.saleUnit, restricted: p.restricted } })) });
}
/** Shared adapter logic exercised with captured/controlled fields. Production callers
 * must use createWoolworthsAdapter; fixture mode cannot operate on a retailer origin. */
export function createRetailerFixtureAdapter(ownerId: string, scope: BrowserScope, port: RetailerCartPort, authority: RetailerAuthority, now = () => Date.now()): CartAdapter {
  if (scope.origin !== 'http://127.0.0.1:4198') throw new Error('Controlled retailer fixture only');
  return buildAdapter('controlled_fixture', ownerId, scope, port, authority, now);
}
export function createWoolworthsAdapter(ownerId: string, scope: BrowserScope, port: RetailerCartPort, authority: RetailerAuthority, now = () => Date.now()): CartAdapter {
  requireWoolworthsRelease(); // Before any native read or write.
  if (scope.origin !== 'https://www.woolworths.co.nz') throw new Error('Unsupported retailer origin');
  return buildAdapter('retailer_dom', ownerId, scope, port, authority, now);
}
function buildAdapter(mode: CartAdapter['mode'], ownerId: string, scope: BrowserScope, port: RetailerCartPort, authority: RetailerAuthority, now: () => number): CartAdapter {
  let lastObserved: CartObservation | null = null;
  async function grant() {
    if (mode === 'retailer_dom') requireWoolworthsRelease();
    const current = await authority.current(ownerId, scope);
    const g = await authority.readGrant(ownerId, scope);
    if (!ownerId || !current || !g || g.ownerId !== ownerId || !same(g.scope, scope) || g.revoked || g.fields !== 'product_cart_only' || g.expiresAt <= now() || g.expiresAt > now() + 120000) throw new Error('Extension-owned read authority unavailable');
    return g;
  }
  async function read() {
    const g = await grant();
    const s = retailerSnapshot.parse(await port.readProductCartFields());
    const refreshed = await grant();
    if (!same(s.scope, scope) || !same(s.context, g.context) || !same(s.context, refreshed.context) || s.observedAt > now() || now() - s.observedAt > 10000) throw new Error('Retailer observation changed or expired');
    return s;
  }
  return { mode, observe: async () => { lastObserved = project(await read()); return structuredClone(lastObserved); }, async setQuantity(expectedScope, expectedRevision, sku, quantity) {
    if (!same(expectedScope, scope) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Invalid quantity scope');
    const s = await read();
    if (!lastObserved || !same(project(s).items, lastObserved.items) || !same(s.context, lastObserved.retailerContext)) throw new Error('Product facts changed before effect');
    const p = s.products.find(p => p.sku === sku);
    if (s.revision !== expectedRevision || !p?.available) throw new Error('Product/cart changed');
    // Pilot supports adding to a reviewed total only. No removals or substitutions.
    if (quantity <= p.quantity) throw new Error('No approved addition remains');
    await grant();
    await port.compareAndSetQuantity({ scope, expectedRevision, context: s.context, product: p, targetQuantity: quantity });
    // The shared executor performs fresh whole-cart readback and authority checks.
  } };
}
export const supermarketIntent = z.object({ kind: z.literal('add_product'), sku: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/), variant: z.string().min(1).max(120), packSize: z.string().min(1).max(80), quantityToAdd: z.number().int().min(1).max(20) }).strict();
/** Identical entry for reviewed voice/text; channel never conveys consent. */
export async function prepareSupermarketAddition(raw: unknown, adapter: CartAdapter, expiresAt: number, now = () => Date.now()): Promise<{ proposal: CartProposal; digest: string }> {
  const intent = supermarketIntent.parse(raw);
  const observed = cartObservation.parse(await adapter.observe());
  const product = observed.items.find(p => p.productId === intent.sku);
  if (!observed.retailerContext || !product?.available || !product.retailerProduct || product.retailerProduct.variant !== intent.variant || product.retailerProduct.packSize !== intent.packSize || observed.observedAt > now() || now() - observed.observedAt > 10000 || expiresAt <= now() || expiresAt > now() + 120000) throw new Error('Exact reviewed SKU/variant and fresh cart required');
  const proposal = cartProposal.parse({ protocol: 'do.cart.v1', actionId: crypto.randomUUID(), revision: 1, scope: observed.scope, observedRevision: observed.revision, retailerContext: observed.retailerContext, items: [{ ...product, targetQuantity: product.quantity + intent.quantityToAdd }], expiresAt });
  return { proposal, digest: await proposalDigest(proposal) };
}
