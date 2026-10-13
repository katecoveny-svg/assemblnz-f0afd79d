/** Curated Gemini Live voices. Provider descriptions checked 13 October 2026.
 * https://ai.google.dev/gemini-api/docs/live-api/capabilities#change-voice-and-language
 * https://ai.google.dev/gemini-api/docs/speech-generation#voice-options
 * https://docs.cloud.google.com/text-to-speech/docs/gemini-tts#voice_options
 * Keep this list aligned with do_personal_profiles.voice_name's existing constraint.
 */
export const DO_VOICE_VOICES = ["Kore", "Aoede", "Puck", "Charon"] as const;
export const DEFAULT_DO_VOICE = "Kore";
export const DO_VOICE_LABELS = {
  Kore: "Kore · female · firm (default)",
  Aoede: "Aoede · female · breezy",
  Puck: "Puck · male · upbeat",
  Charon: "Charon · male · informative",
} satisfies Record<(typeof DO_VOICE_VOICES)[number], string>;
