import 'server-only';

import {
  DEFAULT_TEST_DAILY_CAP_CENTS,
  DEFAULT_UNIT_COST_CENTS,
  ephemeralSandboxKeyId,
  hashToolKey,
  issueToolKey,
} from './keys';
import { detectEnvironment, keyPrefixForDisplay } from './sandbox';
import type { ToolKeyRecord, ToolReceipt, ToolSpendDay } from './types';

export type ToolStore = {
  findKeyByHash(keyHash: string): Promise<ToolKeyRecord | null>;
  upsertKey(record: ToolKeyRecord): Promise<void>;
  getSpend(keyId: string, day: string): Promise<ToolSpendDay>;
  addSpend(keyId: string, day: string, cents: number): Promise<ToolSpendDay>;
  writeReceipt(receipt: ToolReceipt): Promise<void>;
  listReceipts(keyId: string, limit?: number): Promise<ToolReceipt[]>;
  getKeyById(id: string): Promise<ToolKeyRecord | null>;
};

declare global {
  // eslint-disable-next-line no-var
  var __assemblToolMemoryStore: MemoryToolStore | undefined;
}

class MemoryToolStore implements ToolStore {
  keys = new Map<string, ToolKeyRecord>();
  keysByHash = new Map<string, ToolKeyRecord>();
  spend = new Map<string, ToolSpendDay>();
  receipts: ToolReceipt[] = [];

  async findKeyByHash(keyHash: string) {
    return this.keysByHash.get(keyHash) ?? null;
  }

  async upsertKey(record: ToolKeyRecord) {
    this.keys.set(record.id, record);
    this.keysByHash.set(record.keyHash, record);
  }

  async getKeyById(id: string) {
    return this.keys.get(id) ?? null;
  }

  async getSpend(keyId: string, day: string): Promise<ToolSpendDay> {
    const k = `${keyId}:${day}`;
    return (
      this.spend.get(k) ?? {
        keyId,
        day,
        spentCents: 0,
        callCount: 0,
      }
    );
  }

  async addSpend(keyId: string, day: string, cents: number): Promise<ToolSpendDay> {
    const current = await this.getSpend(keyId, day);
    const next: ToolSpendDay = {
      keyId,
      day,
      spentCents: current.spentCents + cents,
      callCount: current.callCount + 1,
    };
    this.spend.set(`${keyId}:${day}`, next);
    return next;
  }

  async writeReceipt(receipt: ToolReceipt) {
    this.receipts.unshift(receipt);
    if (this.receipts.length > 5000) this.receipts.length = 5000;
  }

  async listReceipts(keyId: string, limit = 50) {
    return this.receipts.filter((r) => r.keyId === keyId).slice(0, limit);
  }
}

function memoryStore(): MemoryToolStore {
  if (!globalThis.__assemblToolMemoryStore) {
    globalThis.__assemblToolMemoryStore = new MemoryToolStore();
  }
  return globalThis.__assemblToolMemoryStore;
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

class SupabaseToolStore implements ToolStore {
  private async client() {
    const { getServiceClient } = await import('@/lib/supabase/service');
    return getServiceClient();
  }

  private mapKey(row: Record<string, unknown>): ToolKeyRecord {
    return {
      id: String(row.id),
      keyHash: String(row.key_hash),
      keyPrefix: String(row.key_prefix),
      label: String(row.label ?? ''),
      environment: row.environment === 'live' ? 'live' : 'sandbox',
      dailyCapCents: Number(row.daily_cap_cents ?? DEFAULT_TEST_DAILY_CAP_CENTS),
      unitCostCents: Number(row.unit_cost_cents ?? DEFAULT_UNIT_COST_CENTS),
      createdAt: String(row.created_at),
      revokedAt: row.revoked_at ? String(row.revoked_at) : null,
    };
  }

  async findKeyByHash(keyHash: string) {
    const sb = await this.client();
    const { data, error } = await sb
      .from('assembl_tool_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapKey(data as Record<string, unknown>);
  }

  async getKeyById(id: string) {
    const sb = await this.client();
    const { data, error } = await sb
      .from('assembl_tool_keys')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return this.mapKey(data as Record<string, unknown>);
  }

  async upsertKey(record: ToolKeyRecord) {
    const sb = await this.client();
    await sb.from('assembl_tool_keys').upsert(
      {
        id: record.id,
        key_hash: record.keyHash,
        key_prefix: record.keyPrefix,
        label: record.label,
        environment: record.environment,
        daily_cap_cents: record.dailyCapCents,
        unit_cost_cents: record.unitCostCents,
        created_at: record.createdAt,
        revoked_at: record.revokedAt,
      },
      { onConflict: 'id' },
    );
  }

  async getSpend(keyId: string, day: string): Promise<ToolSpendDay> {
    const sb = await this.client();
    const { data } = await sb
      .from('assembl_tool_spend')
      .select('*')
      .eq('key_id', keyId)
      .eq('day', day)
      .maybeSingle();
    if (!data) {
      return { keyId, day, spentCents: 0, callCount: 0 };
    }
    return {
      keyId,
      day,
      spentCents: Number((data as { spent_cents: number }).spent_cents),
      callCount: Number((data as { call_count: number }).call_count),
    };
  }

  async addSpend(keyId: string, day: string, cents: number): Promise<ToolSpendDay> {
    const current = await this.getSpend(keyId, day);
    const next: ToolSpendDay = {
      keyId,
      day,
      spentCents: current.spentCents + cents,
      callCount: current.callCount + 1,
    };
    const sb = await this.client();
    await sb.from('assembl_tool_spend').upsert(
      {
        key_id: keyId,
        day,
        spent_cents: next.spentCents,
        call_count: next.callCount,
      },
      { onConflict: 'key_id,day' },
    );
    return next;
  }

  async writeReceipt(receipt: ToolReceipt) {
    const sb = await this.client();
    await sb.from('assembl_tool_receipts').insert({
      id: receipt.id,
      key_id: receipt.keyId,
      tool_slug: receipt.toolSlug,
      environment: receipt.environment,
      status: receipt.status,
      unit_cost_cents: receipt.unitCostCents,
      request_summary: receipt.requestSummary,
      response_summary: receipt.responseSummary,
      created_at: receipt.createdAt,
    });
  }

  async listReceipts(keyId: string, limit = 50) {
    const sb = await this.client();
    const { data } = await sb
      .from('assembl_tool_receipts')
      .select('*')
      .eq('key_id', keyId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        keyId: String(r.key_id),
        toolSlug: String(r.tool_slug),
        environment: r.environment === 'live' ? 'live' : 'sandbox',
        status: r.status as ToolReceipt['status'],
        unitCostCents: Number(r.unit_cost_cents),
        requestSummary: (r.request_summary ?? {}) as Record<string, unknown>,
        responseSummary: (r.response_summary ?? {}) as Record<string, unknown>,
        createdAt: String(r.created_at),
      } satisfies ToolReceipt;
    });
  }
}

let _store: ToolStore | null = null;

/**
 * Prefer Supabase when service-role env is present (production path).
 * Otherwise use process-memory (preview / local). Documented in ENVIRONMENT.md.
 */
export function getToolStore(): ToolStore {
  if (_store) return _store;
  _store = supabaseConfigured() ? new SupabaseToolStore() : memoryStore();
  return _store;
}

/** Test helper — force memory store. */
export function _resetToolStoreForTests(): void {
  _store = memoryStore();
  globalThis.__assemblToolMemoryStore = new MemoryToolStore();
  _store = globalThis.__assemblToolMemoryStore;
}

async function seedFromEnv(store: ToolStore): Promise<void> {
  const seededKeys = process.env.ASSEMBL_TOOL_SEED_KEYS?.trim();
  if (!seededKeys) return;
  // Format: id:rawKey:capCents,id:rawKey:capCents
  for (const part of seededKeys.split(',')) {
    const [id, rawKey, cap] = part.split(':').map((s) => s.trim());
    if (!id || !rawKey) continue;
    await store.upsertKey({
      id,
      keyHash: hashToolKey(rawKey),
      keyPrefix: keyPrefixForDisplay(rawKey),
      label: 'seeded',
      environment: detectEnvironment(rawKey),
      dailyCapCents: Number(cap) || DEFAULT_TEST_DAILY_CAP_CENTS,
      unitCostCents: DEFAULT_UNIT_COST_CENTS,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    });
  }
}

let seeded = false;

export async function resolveToolKey(rawKey: string): Promise<ToolKeyRecord> {
  const store = getToolStore();
  if (!seeded) {
    await seedFromEnv(store);
    seeded = true;
  }

  const keyHash = hashToolKey(rawKey);
  const existing = await store.findKeyByHash(keyHash);
  if (existing) return existing;

  const env = detectEnvironment(rawKey);

  // Open sandbox keys: any test_* key works without prior registration.
  // Production live keys must be issued/seeded.
  if (env === 'sandbox') {
    const allowOpen =
      process.env.ASSEMBL_TOOLS_ALLOW_OPEN_TEST_KEYS !== 'false';
    if (!allowOpen) {
      const { ToolHttpError } = await import('./errors');
      throw new ToolHttpError({
        status: 401,
        code: 'invalid_api_key',
        message: 'Unknown sandbox key.',
        fix: 'Use a seeded test key from ASSEMBL_TOOL_SEED_KEYS, or set ASSEMBL_TOOLS_ALLOW_OPEN_TEST_KEYS=true.',
      });
    }
    const record: ToolKeyRecord = {
      id: ephemeralSandboxKeyId(rawKey),
      keyHash,
      keyPrefix: keyPrefixForDisplay(rawKey),
      label: 'open-sandbox',
      environment: 'sandbox',
      dailyCapCents: DEFAULT_TEST_DAILY_CAP_CENTS,
      unitCostCents: DEFAULT_UNIT_COST_CENTS,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    };
    await store.upsertKey(record);
    return record;
  }

  const { ToolHttpError } = await import('./errors');
  throw new ToolHttpError({
    status: 401,
    code: 'invalid_api_key',
    message: 'Unknown or unregistered live API key.',
    fix: 'Issue a live key into assembl_tool_keys (or ASSEMBL_TOOL_SEED_KEYS). For sandbox, use a key starting with test_.',
  });
}

export async function ensureDemoSandboxKey(): Promise<{
  rawKey: string;
  record: ToolKeyRecord;
}> {
  const store = getToolStore();
  const rawKey =
    process.env.ASSEMBL_TOOL_DEMO_TEST_KEY?.trim() ||
    'test_assembl_demo_nz_who_runs_it';
  const existing = await store.findKeyByHash(hashToolKey(rawKey));
  if (existing) return { rawKey, record: existing };
  const issued = issueToolKey({
    environment: 'sandbox',
    label: 'docs-demo',
    rawKey,
  });
  // Stable id for the well-known demo key
  issued.record.id = ephemeralSandboxKeyId(rawKey);
  await store.upsertKey(issued.record);
  return issued;
}
