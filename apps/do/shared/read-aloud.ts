/** Prefer on-device English voices; never silently send private drafts to remote TTS. */
export function localDoReadoutVoice<T extends { localService: boolean; lang: string }>(voices: T[]): T | undefined {
  const local = voices.filter(voice => voice.localService && /^en(?:[-_]|$)/i.test(voice.lang));
  return local.find(voice => /^en[-_]NZ$/i.test(voice.lang)) ?? local.find(voice => /^en[-_]GB$/i.test(voice.lang)) ?? local[0];
}
