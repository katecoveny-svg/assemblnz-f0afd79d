/**
 * Shared domain types for the Manaaki phase-1 voice agent (Aria).
 *
 * One agent (`aria.manaaki@demo`), one demo customer (`whetu`), one NZ DID.
 * These types are the contract between the pure tool logic (lib/voice/tools),
 * the HTTP surface (app/api/voice/*), the receipt builder (lib/voice/receipts)
 * and the Kahu dashboard (components/kahu).
 */

export type CallStatus =
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'transferred'
  | 'voicemail'
  | 'failed';

export type ConsentMethod = 'speech' | 'dtmf' | 'inferred';

/** One row of public.kete_session. */
export interface KeteSession {
  id: string;
  call_sid: string;
  agent_id: string;
  customer_id: string;
  caller_number: string | null;
  status: CallStatus;
  started_at: string;
  ended_at: string | null;
  transcript_uri: string | null;
  recording_uri: string | null;
  notes: string | null;
  tool_calls: ToolCallRecord[];
  created_at: string;
  updated_at: string;
}

/** One row of public.consent_log. */
export interface ConsentRecord {
  id: string;
  call_sid: string;
  ts: string;
  prompt_text: string;
  response_text: string;
  consent_granted: boolean;
  captured_method: ConsentMethod;
  created_at: string;
}

/**
 * Classify a free-text consent reply. Ambiguous replies must NOT be treated
 * as consent — the agent re-asks (clarification turn) rather than recording.
 */
export type ConsentVerdict = 'granted' | 'declined' | 'ambiguous';

// ---------------------------------------------------------------------------
// Booking tool I/O
// ---------------------------------------------------------------------------

export interface AvailabilityQuery {
  /** ISO date, e.g. "2026-06-20". */
  date: string;
  party_size: number;
}

/** A bookable slot, e.g. { start: "2026-06-20T19:00:00+12:00", label: "7:00 pm" }. */
export interface Slot {
  start: string;
  end: string;
  label: string;
}

export interface AvailabilityResult {
  date: string;
  party_size: number;
  slots: Slot[];
  /** Set when the date/party is outside policy (closed day, party too large). */
  reason?: string;
}

export interface BookingRequest {
  name: string;
  mobile: string;
  /** ISO date. */
  date: string;
  /** "HH:mm" 24h local, e.g. "19:00". */
  time: string;
  party_size: number;
  notes?: string;
}

export interface BookingResult {
  booking_id: string;
  /** True when an identical caller+time booking already existed (idempotent). */
  duplicate: boolean;
  start: string;
  end: string;
}

export interface SmsResult {
  sid: string;
  to: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Tool-call audit trail — every server-tool invocation Aria makes is logged
// and folded into the Mana Receipt payload.
// ---------------------------------------------------------------------------

export interface ToolCallRecord {
  tool: string;
  args: Record<string, unknown>;
  /** Redacted/summarised result — never raw PII beyond what the receipt needs. */
  result_summary: string;
  ok: boolean;
  ts: string;
}

// ---------------------------------------------------------------------------
// Mana Receipt payload (voice phase-1 hash-chain ledger).
//
// This is the canonical JSON that gets hashed. Keep it stable: anything added
// here changes the hash, so additions are append-only and versioned via
// schema_version. The richer Ed25519 ledger lives in lib/evidence/types.ts.
// ---------------------------------------------------------------------------

export interface VoiceReceiptPayload {
  schema_version: 'voice-1';
  agent: string;
  agent_version: string;
  customer_id: string;
  call_sid: string;
  caller_number_masked: string;
  started_at: string;
  ended_at: string;
  status: CallStatus;
  consent: {
    granted: boolean;
    prompt_text: string;
    response_text: string;
    captured_method: ConsentMethod;
    ts: string;
  } | null;
  booking: {
    booking_id: string;
    date: string;
    time: string;
    party_size: number;
  } | null;
  sms_sent: boolean;
  transferred: boolean;
  tool_calls: ToolCallRecord[];
  /** Privacy Act 2020 IPP coverage stamped at receipt time. */
  privacy: {
    retention_class: string;
    ipps_satisfied: string[];
  };
}

/** A fully-built, hash-chained receipt ready to persist to public.mana_receipt. */
export interface VoiceManaReceipt {
  call_sid: string;
  payload: VoiceReceiptPayload;
  /** sha256 of the canonical payload JSON. */
  sha256: string;
  /** previous receipt's chain_hash (seed = 64 zeros for #1). */
  prev_hash: string;
  /** sha256(prev_hash || sha256). */
  chain_hash: string;
}
