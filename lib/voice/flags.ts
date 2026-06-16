/**
 * Voice-agent feature flag.
 *
 * The whole voice surface ships dark until Kate provisions Twilio + ElevenLabs.
 * Set NEXT_PUBLIC_VOICE_AGENT_ENABLED="true" in Vercel to bring Aria live —
 * no code change needed. Until then every voice API route short-circuits with
 * 503, so no calls, bookings, SMS, or receipts are processed. The Kahu
 * dashboard stays viewable (it only reads past receipts).
 */
export function isVoiceAgentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VOICE_AGENT_ENABLED === 'true';
}

/** 503 response used by the voice routes when the flag is off. */
export function voiceDisabledResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'voice_agent_disabled',
      message:
        'The voice agent is not yet live. Set NEXT_PUBLIC_VOICE_AGENT_ENABLED=true once Twilio + ElevenLabs are configured.',
    }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  );
}
