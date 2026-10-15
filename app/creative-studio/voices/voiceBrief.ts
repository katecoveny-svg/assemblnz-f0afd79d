export const voiceBrief = {
  base: 'New Zealand accent: authentic Kiwi. An original female voice in her 30s from Auckland, with natural relaxed cadence, light upward inflection without exaggeration, clear enunciation, warmth and friendliness. No American twang. Place this style description before the script.',
  neutral: 'Neutral explainer / editorial voiceover: use the base voice. Clean studio-quality audio, no background music. Keep the user’s spoken script in a separate field.',
  casual: 'Casual / social: an original Auckland female voice in her 20s–30s, conversational like talking to a mate. Slight phrase-end vocal fry; sparse natural “yeah” or “okay”; upbeat and relatable. These are delivery cues, not permission to insert words into the approved script.',
  recurring: 'Consistent recurring character: an original warm, grounded Auckland New Zealand female voice. Aim for consistent timbre and pace across outputs. Reuse an approved voice or reference when the chosen provider supports it, with separate permission for any reference. This describes a generic character, not a clone of Kate or another person.',
  tips: 'Put the accent and style description before the script. In follow-ups, request the same voice and refer to an approved prior video when supported. Aim for a neutral, subtle, modern urban Auckland delivery, not a caricature: less “Flight of the Conchords”.',
  optional: 'Optional, off by default: light Māori English influence and natural pronunciation of Māori place-names, flora and fauna. Include only after explicit selection and pronunciation review. This is not a claim that the current engine supports te reo Māori synthesis.',
  review: 'Accent and recurring identity are desired outcomes, not prompt guarantees. Listen to each output for NZ accent, natural cadence, script fidelity and consistency. Meta API compatibility and reference reuse are unverified; do not assume the same prompt works unchanged through an API.',
  editorial: 'Transcript correction pending clarification: “Kate-style early 40s … slightly” was followed by “Sorry, that was a mistake”; it is excluded from the usable voice direction. “Consistent, Camera and pace” appears ambiguous; consistent timbre and pace is the generic recurring-character goal supplied in this brief. No personal voice clone, training or recording upload is authorised.',
};
export type VoiceBriefKey = keyof typeof voiceBrief;
export function formatVoiceBrief(fields: Record<VoiceBriefKey, string>, script: string) {
  return Object.entries(fields).map(([key, value]) => `${key.toUpperCase()}\n${value}`).join('\n\n') + '\n\nSEPARATE USER SCRIPT\n' + script;
}
