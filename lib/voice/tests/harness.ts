/**
 * In-memory test harness — a fake of lib/voice/clients/supabase backed by maps.
 *
 * Used by the integration tests via:
 *   vi.mock('@/lib/voice/clients/supabase', async () =>
 *     (await import('./harness')).supabaseMock);
 *
 * This also sidesteps the `import 'server-only'` in the real client (which
 * throws under vitest). Call `resetStore()` in beforeEach.
 */
import type {
  KeteSession,
  ConsentRecord,
  ToolCallRecord,
  VoiceManaReceipt,
} from '@/lib/voice/types';

interface Store {
  sessions: Map<string, KeteSession>;
  consents: ConsentRecord[];
  receipts: VoiceManaReceipt[];
}

export const store: Store = {
  sessions: new Map(),
  consents: [],
  receipts: [],
};

export function resetStore(): void {
  store.sessions = new Map();
  store.consents = [];
  store.receipts = [];
}

function nowIso(): string {
  return new Date().toISOString();
}

function blankSession(call_sid: string): KeteSession {
  return {
    id: `sess_${call_sid}`,
    call_sid,
    agent_id: 'aroha.manaaki@demo',
    customer_id: 'whetu',
    caller_number: null,
    status: 'ringing',
    started_at: nowIso(),
    ended_at: null,
    transcript_uri: null,
    recording_uri: null,
    notes: null,
    tool_calls: [],
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}

async function upsertSession(partial: Partial<KeteSession> & { call_sid: string }): Promise<void> {
  const existing = store.sessions.get(partial.call_sid) ?? blankSession(partial.call_sid);
  store.sessions.set(partial.call_sid, { ...existing, ...partial, updated_at: nowIso() });
}

async function getSession(callSid: string): Promise<KeteSession | null> {
  return store.sessions.get(callSid) ?? null;
}

async function appendToolCall(callSid: string, record: ToolCallRecord): Promise<void> {
  const s = store.sessions.get(callSid) ?? blankSession(callSid);
  s.tool_calls = [...s.tool_calls, record];
  store.sessions.set(callSid, s);
}

async function insertConsent(
  row: Omit<ConsentRecord, 'id' | 'ts' | 'created_at'> & { ts?: string },
): Promise<void> {
  store.consents.push({
    id: `c_${store.consents.length}`,
    ts: row.ts ?? nowIso(),
    created_at: nowIso(),
    ...row,
  } as ConsentRecord);
}

async function getConsent(callSid: string): Promise<ConsentRecord | null> {
  const rows = store.consents.filter((c) => c.call_sid === callSid);
  return rows.length ? rows[rows.length - 1] : null;
}

async function latestChainHash(genesis: string): Promise<string> {
  return store.receipts.length ? store.receipts[store.receipts.length - 1].chain_hash : genesis;
}

async function insertReceipt(receipt: VoiceManaReceipt): Promise<void> {
  store.receipts.push(receipt);
}

function voiceDb() {
  // Minimal stub; integration tests don't touch storage/query builders.
  return {} as unknown;
}

/** The module namespace the tests substitute for the real supabase client. */
export const supabaseMock = {
  upsertSession,
  getSession,
  appendToolCall,
  insertConsent,
  getConsent,
  latestChainHash,
  insertReceipt,
  voiceDb,
};
