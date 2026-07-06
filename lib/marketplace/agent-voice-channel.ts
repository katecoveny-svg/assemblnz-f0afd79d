/**
 * Voice as a channel, not a silo — display/config shape for voice-ready
 * agents. The real voice pipeline (Aria, lib/voice/*) exists behind
 * NEXT_PUBLIC_VOICE_AGENT_ENABLED and is off by default; phone numbers come
 * from provider setup during a pilot. Nothing here may claim a live phone
 * agent: `mode` starts at 'demo' and only moves to 'live' when a real number
 * answers with the recording notice in place.
 */

export type VoiceProvider =
  | 'manual'
  | 'openai_realtime'
  | 'elevenlabs'
  | 'vapi'
  | 'retell'
  | 'twilio'
  | 'tnz'
  | 'livekit'
  | 'custom';

export type VoiceChannelConfig = {
  enabled: boolean;
  provider: VoiceProvider;
  mode: 'demo' | 'configured' | 'live';
  phoneNumber?: string;
  voiceName?: string;
  handoffMode: 'summary_only' | 'warm_transfer' | 'callback_request';
  recordingNoticeRequired: boolean;
  humanReviewRequired: boolean;
};

/** Default shown in the Studio for voice-ready agents — honest starting state. */
export const DEFAULT_VOICE_CHANNEL: VoiceChannelConfig = {
  enabled: false,
  provider: 'manual',
  mode: 'demo',
  handoffMode: 'summary_only',
  recordingNoticeRequired: true,
  humanReviewRequired: true,
};

/** What a voice-ready agent can honestly promise on chrome. */
export const VOICE_READY_COPY =
  'can answer, qualify, summarise and hand off — phone-ready with provider setup; usage costs approved before launch.';
