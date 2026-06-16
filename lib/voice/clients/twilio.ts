/**
 * Thin Twilio REST client — SMS send + TwiML builders.
 *
 * No SDK dependency: we hit the REST API with fetch + Basic auth so the voice
 * module stays dependency-light and trivially mockable in tests (inject
 * `fetchImpl`). TwiML builders are pure string functions — no network — so the
 * telephony routes and their tests share one source of truth for the markup.
 */

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export function twilioConfigFromEnv(): TwilioConfig {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_NZ_DID;
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NZ_DID must be set');
  }
  return { accountSid, authToken, fromNumber };
}

type FetchImpl = typeof fetch;

/** Send an SMS. Returns the Twilio message SID. */
export async function sendSms(
  cfg: TwilioConfig,
  to: string,
  body: string,
  fetchImpl: FetchImpl = fetch,
): Promise<{ sid: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
  const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString('base64');
  const form = new URLSearchParams({ To: to, From: cfg.fromNumber, Body: body });

  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!res.ok) {
    throw new Error(`Twilio SMS failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { sid: string };
  return { sid: json.sid };
}

// ---------------------------------------------------------------------------
// TwiML builders (pure)
// ---------------------------------------------------------------------------

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Inbound TwiML: bridge the live call into ElevenLabs Agents over a
 * bidirectional Media Stream. `<Connect><Stream>` blocks until the websocket
 * closes, which is exactly the all-in handoff we want for the agent call.
 */
export function inboundTwiml(streamWssUrl: string): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
    '<Connect>' +
    `<Stream url="${xmlEscape(streamWssUrl)}" />` +
    '</Connect>' +
    '</Response>'
  );
}

/** Warm-transfer TwiML: announce, then <Dial> the human handoff number. */
export function transferTwiml(transferTo: string, announce?: string): string {
  const say = announce
    ? `<Say voice="Polly.Aria-Neural">${xmlEscape(announce)}</Say>`
    : '';
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
    say +
    `<Dial>${xmlEscape(transferTo)}</Dial>` +
    '</Response>'
  );
}

/** Voicemail fallback TwiML: prompt, record, hang up. */
export function voicemailTwiml(prompt: string, recordingCallbackUrl: string): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
    `<Say voice="Polly.Aria-Neural">${xmlEscape(prompt)}</Say>` +
    `<Record maxLength="120" playBeep="true" recordingStatusCallback="${xmlEscape(recordingCallbackUrl)}" />` +
    '<Hangup/>' +
    '</Response>'
  );
}
