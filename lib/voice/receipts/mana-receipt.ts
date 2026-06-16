/**
 * Mana Receipt builder for voice calls — the "evidence pack" (a downloadable
 * bundle of what the agent did on a call). Customer-facing this is a receipt;
 * the cryptographic backbone is the tamper-evident hash chain.
 *
 * `buildPayload` and `buildReceipt` are pure so the hash-chain tests can drive
 * them deterministically. `finalizeReceipt` is the call the post-call webhook
 * makes: read the session + consent + tool log, build the receipt, chain it to
 * the previous one, and persist.
 */
import type {
  KeteSession,
  ConsentRecord,
  ToolCallRecord,
  VoiceReceiptPayload,
  VoiceManaReceipt,
} from '@/lib/voice/types';
import { AGENT_ID, AGENT_VERSION, CUSTOMER_ID } from '@/lib/voice/config';
import { hashPayload, chainHash, GENESIS_PREV_HASH } from '@/lib/voice/hashing';
import { retentionClass, ippsSatisfied, maskNumber } from '@/lib/voice/privacy-act';
import {
  getSession,
  getConsent,
  latestChainHash,
  insertReceipt,
} from '@/lib/voice/clients/supabase';

export interface BuildPayloadInput {
  session: Pick<
    KeteSession,
    'call_sid' | 'caller_number' | 'started_at' | 'ended_at' | 'status'
  >;
  consent: ConsentRecord | null;
  toolCalls: ToolCallRecord[];
  booking: VoiceReceiptPayload['booking'];
  smsSent: boolean;
  transferred: boolean;
}

/** Build the canonical receipt payload. Pure. */
export function buildPayload(input: BuildPayloadInput): VoiceReceiptPayload {
  const { session, consent, toolCalls, booking, smsSent, transferred } = input;
  const consentGranted = consent?.consent_granted ?? false;
  const rClass = retentionClass({ consentGranted, status: session.status });

  return {
    schema_version: 'voice-1',
    agent: AGENT_ID,
    agent_version: AGENT_VERSION,
    customer_id: CUSTOMER_ID,
    call_sid: session.call_sid,
    caller_number_masked: maskNumber(session.caller_number),
    started_at: session.started_at,
    ended_at: session.ended_at ?? session.started_at,
    status: session.status,
    consent: consent
      ? {
          granted: consent.consent_granted,
          prompt_text: consent.prompt_text,
          response_text: consent.response_text,
          captured_method: consent.captured_method,
          ts: consent.ts,
        }
      : null,
    booking,
    sms_sent: smsSent,
    transferred,
    tool_calls: toolCalls,
    privacy: {
      retention_class: rClass,
      ipps_satisfied: ippsSatisfied(rClass),
    },
  };
}

/**
 * Derive the call outcome (booking / SMS / transfer) from the tool-call log.
 * Pure — keeps finalize self-contained: the receipt reflects exactly what the
 * agent actually did, not what it intended. Booking args are expected on a
 * successful book_reservation call as { date, time, party_size } plus a
 * booking_id in result_summary or args.
 */
export function deriveCallOutcome(
  toolCalls: ToolCallRecord[],
  status: KeteSession['status'],
): { booking: VoiceReceiptPayload['booking']; smsSent: boolean; transferred: boolean } {
  let booking: VoiceReceiptPayload['booking'] = null;
  let smsSent = false;
  let transferred = status === 'transferred';

  for (const t of toolCalls) {
    if (t.tool === 'book_reservation' && t.ok) {
      const a = t.args as Record<string, unknown>;
      booking = {
        booking_id: String(a.booking_id ?? a.id ?? t.result_summary ?? ''),
        date: String(a.date ?? ''),
        time: String(a.time ?? ''),
        party_size: Number(a.party_size ?? 0),
      };
    }
    if (t.tool === 'send_sms' && t.ok) smsSent = true;
    if (t.tool === 'warm_transfer') transferred = true;
  }

  return { booking, smsSent, transferred };
}

/** Hash + chain a payload into a persistable receipt. Pure. */
export function buildReceipt(
  payload: VoiceReceiptPayload,
  prevHash: string,
): VoiceManaReceipt {
  const sha256 = hashPayload(payload);
  const chain_hash = chainHash(prevHash, sha256);
  return { call_sid: payload.call_sid, payload, sha256, prev_hash: prevHash, chain_hash };
}

/**
 * Finalise a call into a persisted, chained receipt. Reads the prior receipt's
 * chain_hash (seed = MANA_RECEIPT_PREV_HASH for #1) so the ledger stays
 * append-only and verifiable.
 */
export async function finalizeReceipt(
  callSid: string,
  pdfUri?: string,
): Promise<VoiceManaReceipt> {
  const session = await getSession(callSid);
  if (!session) throw new Error(`finalizeReceipt: no session for ${callSid}`);
  const consent = await getConsent(callSid);

  const toolCalls = session.tool_calls ?? [];
  const outcome = deriveCallOutcome(toolCalls, session.status);

  const payload = buildPayload({
    session,
    consent,
    toolCalls,
    booking: outcome.booking,
    smsSent: outcome.smsSent,
    transferred: outcome.transferred,
  });

  const seed = process.env.MANA_RECEIPT_PREV_HASH || GENESIS_PREV_HASH;
  const prevHash = await latestChainHash(seed);
  const receipt = buildReceipt(payload, prevHash);

  await insertReceipt(receipt, pdfUri);
  return receipt;
}
