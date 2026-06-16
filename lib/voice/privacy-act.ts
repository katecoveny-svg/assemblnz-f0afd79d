/**
 * Privacy Act 2020 (NZ) — Information Privacy Principle mapping for the voice
 * agent. Imported by the receipt builder to stamp which IPPs each call
 * satisfied, and read by docs/voice/PRIVACY-ACT-2020-MAPPING.md generation.
 *
 * This is a mapping of HOW the build satisfies each principle, not legal
 * advice. The Day-10 nz-privacy-act-2020 skill audit verifies it.
 */

export type RetentionClass = 'call-with-recording' | 'call-no-recording' | 'message-only';

export interface IppCoverage {
  ipp: string;
  title: string;
  how: string;
}

/** The IPPs the voice flow actively engages, and how. */
export const IPP_MAPPING: IppCoverage[] = [
  {
    ipp: 'IPP 1',
    title: 'Purpose of collection',
    how: 'Aria only collects name, mobile, party size, and booking notes — the minimum to make and confirm a reservation. Purpose stated in the opening line.',
  },
  {
    ipp: 'IPP 2',
    title: 'Source of information',
    how: 'Collected directly from the caller during the call; no third-party enrichment.',
  },
  {
    ipp: 'IPP 3',
    title: 'Collection from subject — notification',
    how: 'Recording notice + purpose are spoken before any recording. consent_log stores the verbatim exchange. Decline → no recording, warm transfer.',
  },
  {
    ipp: 'IPP 4',
    title: 'Manner of collection',
    how: 'No deceptive or unfair means; the agent identifies itself as an AI booking assistant for Whetū up front.',
  },
  {
    ipp: 'IPP 5',
    title: 'Storage and security',
    how: 'Transcript/recording URIs and PII live in Supabase under RLS, service-role only. Caller number is masked in the receipt payload.',
  },
  {
    ipp: 'IPP 6',
    title: 'Access to personal information',
    how: 'A caller can request their booking record; the Mana Receipt for their call is the portable copy of what was held and decided.',
  },
  {
    ipp: 'IPP 9',
    title: 'Retention',
    how: 'Retention classes below bound how long recordings/transcripts are kept. Message-only and consent-declined calls hold no recording.',
  },
  {
    ipp: 'IPP 10',
    title: 'Limits on use',
    how: 'Data is used only to fulfil and confirm the booking (calendar event + SMS). No marketing, no secondary use.',
  },
  {
    ipp: 'IPP 11',
    title: 'Limits on disclosure',
    how: 'Disclosed only to the demo restaurant (calendar) and the caller (SMS). No onward sharing.',
  },
  {
    ipp: 'IPP 12',
    title: 'Disclosure outside NZ',
    how: 'Twilio Media Streams terminate in AU1 and ElevenLabs processes audio offshore; this is disclosed in policy and bounded to call handling. Phase 2 to assess data-residency options.',
  },
  {
    ipp: 'IPP 13',
    title: 'Unique identifiers',
    how: 'No government or unique identifiers are collected. call_sid is a Twilio-internal id, not a personal identifier.',
  },
];

/** Decide the retention class for a finished call. */
export function retentionClass(opts: {
  consentGranted: boolean;
  status: string;
}): RetentionClass {
  if (opts.status === 'voicemail') return 'message-only';
  return opts.consentGranted ? 'call-with-recording' : 'call-no-recording';
}

/** Which IPPs to stamp on the receipt for a given retention class. */
export function ippsSatisfied(_class: RetentionClass): string[] {
  // All engaged IPPs apply to every class; recording-specific ones (3, 5, 9)
  // are still satisfied even when consent is declined (we prove we asked and
  // honoured the answer).
  return IPP_MAPPING.map((m) => m.ipp);
}

/** Mask a phone number to last 3 digits for the receipt payload. */
export function maskNumber(num: string | null | undefined): string {
  if (!num) return 'unknown';
  const digits = num.replace(/\D/g, '');
  if (digits.length <= 3) return '***';
  return '*'.repeat(Math.max(0, digits.length - 3)) + digits.slice(-3);
}
