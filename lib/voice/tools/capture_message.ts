/**
 * capture_message — voicemail-style fallback.
 *
 * Used when a warm transfer fails or the call lands after hours: the agent
 * takes a message and writes it to kete_session.notes, and the session is
 * marked 'voicemail' so the receipt records a message-only call (no booking,
 * no recording obligation beyond the message itself).
 */
import { upsertSession } from '@/lib/voice/clients/supabase';

export interface CaptureMessageInput {
  call_sid: string;
  message: string;
  caller_number?: string;
}

export function formatMessageNote(message: string, at: string): string {
  return `[voicemail ${at}] ${message.trim()}`;
}

export async function captureMessage(input: CaptureMessageInput): Promise<{ ok: true }> {
  const note = formatMessageNote(input.message, new Date().toISOString());
  await upsertSession({
    call_sid: input.call_sid,
    status: 'voicemail',
    notes: note,
    // Only set the caller number when we actually have one — never overwrite a
    // known number with null.
    ...(input.caller_number ? { caller_number: input.caller_number } : {}),
    ended_at: new Date().toISOString(),
  });
  return { ok: true };
}
