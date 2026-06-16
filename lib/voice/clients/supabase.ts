/**
 * Supabase access for the voice module — service-role only.
 *
 * Reuses the canonical service client (lib/supabase/service.ts) and adds typed
 * helpers for the three voice tables so the tools, webhooks and receipt builder
 * don't each re-type the row shapes. Server-only; never reaches the browser.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import type {
  KeteSession,
  ConsentRecord,
  VoiceManaReceipt,
  ToolCallRecord,
} from '@/lib/voice/types';

export function voiceDb() {
  return getServiceClient();
}

export async function upsertSession(
  partial: Partial<KeteSession> & { call_sid: string },
): Promise<void> {
  const db = voiceDb();
  const { error } = await db
    .from('kete_session')
    .upsert({ ...partial, updated_at: new Date().toISOString() }, { onConflict: 'call_sid' });
  if (error) throw new Error(`upsertSession: ${error.message}`);
}

export async function getSession(callSid: string): Promise<KeteSession | null> {
  const db = voiceDb();
  const { data, error } = await db
    .from('kete_session')
    .select('*')
    .eq('call_sid', callSid)
    .maybeSingle();
  if (error) throw new Error(`getSession: ${error.message}`);
  return (data as KeteSession) ?? null;
}

/**
 * Append a tool-call record to the session's log. Read-modify-write is safe
 * here because tool calls within one phone call are sequential (the agent
 * awaits each tool result before the next), so there's no intra-call race.
 */
export async function appendToolCall(callSid: string, record: ToolCallRecord): Promise<void> {
  const db = voiceDb();
  const session = await getSession(callSid);
  const next = [...(session?.tool_calls ?? []), record];
  const { error } = await db
    .from('kete_session')
    .update({ tool_calls: next, updated_at: new Date().toISOString() })
    .eq('call_sid', callSid);
  if (error) throw new Error(`appendToolCall: ${error.message}`);
}

export async function insertConsent(
  row: Omit<ConsentRecord, 'id' | 'ts' | 'created_at'> & { ts?: string },
): Promise<void> {
  const db = voiceDb();
  const { error } = await db.from('consent_log').insert(row);
  if (error) throw new Error(`insertConsent: ${error.message}`);
}

export async function getConsent(callSid: string): Promise<ConsentRecord | null> {
  const db = voiceDb();
  const { data, error } = await db
    .from('consent_log')
    .select('*')
    .eq('call_sid', callSid)
    .order('ts', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getConsent: ${error.message}`);
  return (data as ConsentRecord) ?? null;
}

/** Read the most recent receipt's chain_hash to seed the next link. */
export async function latestChainHash(genesis: string): Promise<string> {
  const db = voiceDb();
  const { data, error } = await db
    .from('mana_receipt')
    .select('chain_hash')
    .order('receipt_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`latestChainHash: ${error.message}`);
  return (data as { chain_hash: string } | null)?.chain_hash ?? genesis;
}

export async function insertReceipt(receipt: VoiceManaReceipt, pdfUri?: string): Promise<void> {
  const db = voiceDb();
  const { error } = await db.from('mana_receipt').insert({
    call_sid: receipt.call_sid,
    payload_json: receipt.payload,
    sha256: receipt.sha256,
    prev_hash: receipt.prev_hash,
    chain_hash: receipt.chain_hash,
    pdf_uri: pdfUri ?? null,
  });
  if (error) throw new Error(`insertReceipt: ${error.message}`);
}
