import { z } from 'zod';

/** Shared by every input channel. Neither a model nor a client supplies the owner. */
export const browserScope = z.object({
  connectionId: z.string().uuid(),
  tabId: z.number().int().positive(),
  documentId: z.string().min(1).max(100),
  origin: z.enum(['https://www.woolworths.co.nz', 'http://127.0.0.1:4198']),
  navigationRevision: z.number().int().nonnegative(),
}).strict();
export const retailerContext = z.object({
  retailer: z.literal('woolworths_nz'),
  // Opaque non-credential bindings from the trusted native adapter, never a name/email/token.
  accountBinding: z.string().regex(/^[a-f0-9]{64}$/),
  storeId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  cartId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  complete: z.literal(true),
}).strict();
export const retailerProduct = z.object({
  sku: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  variant: z.string().min(1).max(120), packSize: z.string().min(1).max(80),
  saleUnit: z.literal('each'), restricted: z.literal(false),
}).strict();
export const cartItem = z.object({
  productId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  name: z.string().min(1).max(160),
  retailerProduct: retailerProduct.optional(),
  unitPriceCents: z.number().int().nonnegative().max(100000),
  available: z.boolean(),
  quantity: z.number().int().min(0).max(99),
}).strict();
export const cartObservation = z.object({
  scope: browserScope,
  revision: z.string().min(1).max(100),
  observedAt: z.number().int().nonnegative(),
  currency: z.literal('NZD'),
  retailerContext: retailerContext.optional(),
  items: z.array(cartItem).max(100),
}).strict().refine(v => new Set(v.items.map(i => i.productId)).size === v.items.length, 'Duplicate products');
export const cartProposal = z.object({
  protocol: z.literal('do.cart.v1'),
  actionId: z.string().uuid(),
  revision: z.number().int().positive(),
  scope: browserScope,
  observedRevision: z.string().min(1).max(100),
  retailerContext: retailerContext.optional(),
  // Explicit target quantities, never ambiguous repeated "add" operations.
  items: z.array(cartItem.extend({ available: z.literal(true), targetQuantity: z.number().int().min(1).max(20) }).strict()).min(1).max(20),
  expiresAt: z.number().int().positive(),
}).strict().refine(v => new Set(v.items.map(i => i.productId)).size === v.items.length, 'Duplicate products');
export const browserActionRequest = z.discriminatedUnion('action', [
  z.object({ action: z.literal('prepare'), proposal: cartProposal }).strict(),
  z.object({ action: z.literal('approve'), actionId: z.string().uuid(), revision: z.number().int().positive(), digest: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ action: z.literal('execute'), actionId: z.string().uuid(), approvalId: z.string().uuid() }).strict(),
  z.object({ action: z.literal('revoke'), connectionId: z.string().uuid() }).strict(),
]);
export type BrowserScope = z.infer<typeof browserScope>;
export type CartObservation = z.infer<typeof cartObservation>;
export type CartProposal = z.infer<typeof cartProposal>;
export type ItemReceipt = {
  productId: string; retailerProduct?: z.infer<typeof retailerProduct>; requestedQuantity: number; beforeQuantity: number;
  observedQuantity: number | null; beforeRevision: string | null; afterRevision: string | null; status: 'verified' | 'uncertain' | 'not_attempted';
};
export type CartReceipt = {
  actionId: string; revision: number; digest: string; scope: BrowserScope; finishedAt: number;
  mode: 'controlled_fixture' | 'retailer_dom'; retailerExecuted: boolean;
  retailerContext?: z.infer<typeof retailerContext>;
  status: 'verified' | 'stopped'; items: ItemReceipt[];
};
