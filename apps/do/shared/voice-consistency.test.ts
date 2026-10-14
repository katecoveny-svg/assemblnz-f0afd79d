import { expect, it } from 'vitest';
import { doVoiceConfig, DO_VOICE_MODELS } from './gemini-live';
import { DO_VOICE_VOICES } from './voice-options';
import { voiceDiagnostic } from './voice-diagnostics';
it('keeps every saved voice fixed across mode configuration with NZ delivery instructions', () => {
  for (const voice of DO_VOICE_VOICES) for (const mode of ['standard', 'extended'] as const) {
    const config = doVoiceConfig(mode, voice);
    expect(config.speechConfig?.voiceConfig?.prebuiltVoiceConfig?.voiceName).toBe(voice);
    expect(config.systemInstruction).toContain('lists, numbers, product names and summaries after tool results');
    expect(config.systemInstruction).toContain('Never imitate an accent');
    expect(config.systemInstruction).toContain('Do not claim your accent is guaranteed');
  }
});
it('diagnostics only expose a closed metadata projection, rejecting arbitrary model and voice values', () => {
  expect(voiceDiagnostic('private text', 'secret', 'ended')).toEqual({ build: 'local', model: 'unknown', voice: 'unknown', promptVersion: 'do-nz-en-v2', lifecycle: 'ended' });
  expect(voiceDiagnostic(DO_VOICE_MODELS.standard, 'Aoede', 'issued').voice).toBe('Aoede');
});
