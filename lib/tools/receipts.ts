import { randomBytes } from 'node:crypto';

import type { ToolEnvironment, ToolReceipt } from './types';
import type { ToolStore } from './store';

export function newReceiptId(): string {
  return `rct_${randomBytes(10).toString('hex')}`;
}

export async function writeToolReceipt(
  store: ToolStore,
  input: {
    keyId: string;
    toolSlug: string;
    environment: ToolEnvironment;
    status: ToolReceipt['status'];
    unitCostCents: number;
    requestSummary: Record<string, unknown>;
    responseSummary: Record<string, unknown>;
  },
): Promise<ToolReceipt> {
  const receipt: ToolReceipt = {
    id: newReceiptId(),
    keyId: input.keyId,
    toolSlug: input.toolSlug,
    environment: input.environment,
    status: input.status,
    unitCostCents: input.unitCostCents,
    requestSummary: input.requestSummary,
    responseSummary: input.responseSummary,
    createdAt: new Date().toISOString(),
  };
  await store.writeReceipt(receipt);
  return receipt;
}
