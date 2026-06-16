/**
 * send_sms — send the booking confirmation text to the caller's mobile.
 *
 * `renderConfirmation` is pure (template + interpolation) so the copy is
 * testable and matches the template in whetu-policies.md. The template uses
 * plain, warm NZ-English and stays within ~1–2 SMS segments.
 */
import type { BookingRequest, SmsResult } from '@/lib/voice/types';
import { humanTime } from '@/lib/voice/tools/time';
import { sendSms as twilioSend, twilioConfigFromEnv } from '@/lib/voice/clients/twilio';

const RESTAURANT = 'Whetū';

function humanDate(dateYmd: string): string {
  // "2026-06-20" -> "Fri 20 Jun"
  const d = new Date(`${dateYmd}T12:00:00Z`);
  return d.toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** Build the confirmation SMS body. Pure. */
export function renderConfirmation(req: Pick<BookingRequest, 'name' | 'date' | 'time' | 'party_size'>): string {
  const when = `${humanDate(req.date)} at ${humanTime(req.time)}`;
  const guests = req.party_size === 1 ? '1 guest' : `${req.party_size} guests`;
  return (
    `Kia ora ${req.name}, your table at ${RESTAURANT} is booked: ${when}, ${guests}. ` +
    `Need to change it? Just reply or call us back. Ngā mihi.`
  );
}

/** Send the confirmation SMS via Twilio. */
export async function sendConfirmationSms(
  to: string,
  req: Pick<BookingRequest, 'name' | 'date' | 'time' | 'party_size'>,
): Promise<SmsResult> {
  const body = renderConfirmation(req);
  const cfg = twilioConfigFromEnv();
  const { sid } = await twilioSend(cfg, to, body);
  return { sid, to, body };
}
