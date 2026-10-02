/** Prefer on-device English voices; never silently send private drafts to remote TTS. */
export function localDoReadoutVoice<T extends { localService: boolean; lang: string }>(voices: T[]): T | undefined {
  const local = voices.filter(voice => voice.localService && /^en(?:[-_]|$)/i.test(voice.lang));
  return local.find(voice => /^en[-_]NZ$/i.test(voice.lang)) ?? local.find(voice => /^en[-_]GB$/i.test(voice.lang)) ?? local[0];
}

export const DO_READOUT_VOICE_KEY = "assembl:do:readout-voice:v1";
export const DO_PRONUNCIATION_SAMPLE = "Kia ora, your appointment in Whangārei is at half past two. Take the Northern Motorway from Auckland.";
export type DoDeviceVoice = { localService: boolean; lang: string; name: string; voiceURI: string };
/** Locale metadata is not a listening/pronunciation certification. */
export function localDoReadoutVoices<T extends DoDeviceVoice>(voices: T[]): T[] {
  const seen = new Set<string>();
  return voices.filter(voice => {
    if (!voice.localService || !/^en(?:[-_]|$)/i.test(voice.lang) || !voice.voiceURI || seen.has(voice.voiceURI)) return false;
    seen.add(voice.voiceURI); return true;
  });
}
export function doReadoutVoiceIdentity(voice: DoDeviceVoice): string {
  return JSON.stringify([voice.voiceURI, voice.lang, voice.name]);
}
export function selectedDoReadoutVoice<T extends DoDeviceVoice>(voices: T[], selected: string): T | undefined {
  const local = localDoReadoutVoices(voices);
  // Never substitute another accent after an explicit device-voice selection.
  return selected ? local.find(voice => doReadoutVoiceIdentity(voice) === selected) : localDoReadoutVoice(local);
}
export function doReadoutVoiceLabel(voice: DoDeviceVoice): string {
  return `${voice.name} · ${voice.lang}${/^en[-_]NZ$/i.test(voice.lang) ? " · NZ locale, not listening-verified" : ""}`;
}
