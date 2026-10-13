import { z } from 'zod';
import { cartObservation, cartProposal, browserScope } from '../contract';

export const CONNECTION_PROTOCOL = 'do.browser.connection.v1';
export const FIXTURE_URL = 'http://127.0.0.1:4198/cart-fixture.html';
export const TASK_LIFETIME_MS = 120_000;
export const connectionCommand = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }).strict(),
  z.object({ action: z.literal('observe'), connectionId: z.string().uuid() }).strict(),
  z.object({ action: z.literal('prepare'), connectionId: z.string().uuid(), brief: z.string().trim().min(1).max(6000), quantities: z.array(z.object({ productId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/), quantity: z.number().int().min(1).max(20) }).strict()).min(1).max(20) }).strict(),
  z.object({ action: z.literal('cancel'), connectionId: z.string().uuid() }).strict(),
]);
export type ConnectionCommand = z.infer<typeof connectionCommand>;
export type TabIdentity = { tabId: number; documentId: string; url: string };
export function isWorkspaceUrl(value: string) {
  try { const url = new URL(value); return ['https://www.assembl.co.nz', 'http://localhost:3000', 'http://127.0.0.1:3000'].includes(url.origin) && ['/do', '/do/personal', '/do/household'].includes(url.pathname) && !url.username && !url.password; } catch { return false; }
}
export function isFixtureUrl(value: string) { return value === FIXTURE_URL; }

const receipt = z.object({ actionId: z.string().uuid(), revision: z.number(), digest: z.string().regex(/^[a-f0-9]{64}$/), scope: browserScope, finishedAt: z.number(), mode: z.literal('controlled_fixture'), retailerExecuted: z.literal(false), status: z.enum(['verified', 'stopped']), items: z.array(z.object({ productId: z.string().max(80), requestedQuantity: z.number(), beforeQuantity: z.number(), observedQuantity: z.number().nullable(), beforeRevision: z.string().nullable(), afterRevision: z.string().nullable(), status: z.enum(['verified', 'uncertain', 'not_attempted']) })).max(20) });
export const connectionSnapshot = z.discriminatedUnion('connected', [
  z.object({ protocol: z.literal(CONNECTION_PROTOCOL), connected: z.literal(false), mode: z.literal('synthetic_storefront'), remote: z.literal(false), reason: z.string().max(300) }),
  z.object({ protocol: z.literal(CONNECTION_PROTOCOL), connected: z.literal(true), mode: z.literal('synthetic_storefront'), remote: z.literal(false), connectionId: z.string().uuid(), owner: z.string().uuid(), target: z.object({ tabId: z.number().int().positive(), documentId: z.string().max(100), url: z.literal(FIXTURE_URL) }), expiresAt: z.number(), busy: z.boolean(), observation: cartObservation.nullable(), proposal: cartProposal.nullable(), digest: z.string().nullable(), brief: z.string().max(6000), receipt: receipt.nullable(), reason: z.string().max(300) }),
]);
