import { createHash, randomBytes } from 'node:crypto';

import { detectEnvironment, keyPrefixForDisplay } from './sandbox';
import type { ToolKeyRecord } from './types';

export const DEFAULT_TEST_DAILY_CAP_CENTS = 100; // $1.00
export const DEFAULT_LIVE_DAILY_CAP_CENTS = 500; // $5.00
export const DEFAULT_UNIT_COST_CENTS = 1; // $0.01

export function hashToolKey(rawKey: string): string {
  return createHash('sha256').update(rawKey.trim(), 'utf8').digest('hex');
}

export function newToolKeyId(): string {
  return `atk_${randomBytes(8).toString('hex')}`;
}

export function issueToolKey(opts: {
  environment: 'sandbox' | 'live';
  label?: string;
  dailyCapCents?: number;
  unitCostCents?: number;
  /** Optional fixed raw key (for seeded env keys). Otherwise generated. */
  rawKey?: string;
}): { rawKey: string; record: ToolKeyRecord } {
  const prefix = opts.environment === 'sandbox' ? 'test_' : 'live_';
  const rawKey =
    opts.rawKey?.trim() ??
    `${prefix}${randomBytes(18).toString('base64url')}`;

  if (opts.environment === 'sandbox' && !rawKey.startsWith('test_')) {
    throw new Error('Sandbox keys must start with test_');
  }
  if (opts.environment === 'live' && rawKey.startsWith('test_')) {
    throw new Error('Live keys must not start with test_');
  }

  const now = new Date().toISOString();
  const record: ToolKeyRecord = {
    id: newToolKeyId(),
    keyHash: hashToolKey(rawKey),
    keyPrefix: keyPrefixForDisplay(rawKey),
    label: opts.label ?? (opts.environment === 'sandbox' ? 'sandbox' : 'live'),
    environment: detectEnvironment(rawKey),
    dailyCapCents:
      opts.dailyCapCents ??
      (opts.environment === 'sandbox'
        ? DEFAULT_TEST_DAILY_CAP_CENTS
        : DEFAULT_LIVE_DAILY_CAP_CENTS),
    unitCostCents: opts.unitCostCents ?? DEFAULT_UNIT_COST_CENTS,
    createdAt: now,
    revokedAt: null,
  };

  return { rawKey, record };
}

/** Deterministic id for open test keys so receipts stay groupable per secret. */
export function ephemeralSandboxKeyId(rawKey: string): string {
  const hash = hashToolKey(rawKey).slice(0, 16);
  return `atk_test_${hash}`;
}
