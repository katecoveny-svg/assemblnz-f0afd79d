/**
 * assembl agent-paid tools — shared primitives.
 *
 * Creates: key issue/validate, sandbox detector, daily spend cap, receipt writer.
 * First consumer: nz-who-runs-it. Next: nz-trade-finder.
 */

export { extractToolApiKey } from './auth';
export { assertUnderDailyCap, recordSuccessfulSpend, utcDay } from './cap';
export { ToolHttpError, toolErrorResponse } from './errors';
export { invokePaidTool } from './invoke';
export {
  DEFAULT_LIVE_DAILY_CAP_CENTS,
  DEFAULT_TEST_DAILY_CAP_CENTS,
  DEFAULT_UNIT_COST_CENTS,
  ephemeralSandboxKeyId,
  hashToolKey,
  issueToolKey,
  newToolKeyId,
} from './keys';
export { newReceiptId, writeToolReceipt } from './receipts';
export { detectEnvironment, isSandboxKey, keyPrefixForDisplay } from './sandbox';
export {
  _resetToolStoreForTests,
  ensureDemoSandboxKey,
  getToolStore,
  resolveToolKey,
} from './store';
export type {
  ToolEnvironment,
  ToolErrorBody,
  ToolErrorCode,
  ToolKeyRecord,
  ToolReceipt,
  ToolSpendDay,
} from './types';
export { AGENT_PAID_TOOLS, getToolRegistryEntry } from './registry';
export type { ToolRegistryEntry } from './registry';
