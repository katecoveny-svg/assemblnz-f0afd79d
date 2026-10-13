import { DO_VOICE_MODELS, DO_VOICE_PROMPT_VERSION } from './gemini-live';
import { DO_VOICE_VOICES } from './voice-options';

/** Closed metadata only. Never accept messages, transcripts, audio, tokens or user IDs. */
export type VoiceDiagnostic = {
  build: string; model: string; voice: string; promptVersion: string;
  lifecycle: 'issued' | 'listening' | 'ended';
};
export function voiceDiagnostic(model: string, voice: string, lifecycle: VoiceDiagnostic['lifecycle']): VoiceDiagnostic {
  return {
    build: /^[a-f0-9]{40}$/i.test(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '') ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA! : 'local',
    model: Object.values(DO_VOICE_MODELS).includes(model as typeof DO_VOICE_MODELS.standard) ? model : 'unknown',
    voice: DO_VOICE_VOICES.includes(voice as (typeof DO_VOICE_VOICES)[number]) ? voice : 'unknown',
    promptVersion: DO_VOICE_PROMPT_VERSION,
    lifecycle,
  };
}
