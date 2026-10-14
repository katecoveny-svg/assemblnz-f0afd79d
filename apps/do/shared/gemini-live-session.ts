/** Browser-session-only text. Nothing here persists or activates work. */
export type DoVoiceTranscriptEntry = { who: string; text: string };
export const DO_VOICE_TRANSCRIPT_LIMIT = 80_000;
export const DO_VOICE_REVIEW_LIMIT = 6_000;

export function appendVoiceTranscript(
  entries: DoVoiceTranscriptEntry[],
  who: string,
  text: string,
): DoVoiceTranscriptEntry[] {
  if (!text) return entries;
  // End an abnormal session rather than silently dropping earlier conversation.
  if (entries.reduce((size, entry) => size + entry.text.length, 0) + text.length > DO_VOICE_TRANSCRIPT_LIMIT)
    throw new Error("The transcript limit was reached. Your microphone is off. Review the conversation below.");
  const next = [...entries];
  const previous = next.at(-1);
  if (previous?.who === who) next[next.length - 1] = { who, text: previous.text + text };
  else next.push({ who, text });
  return next;
}

export function voiceTranscriptForReview(entries: DoVoiceTranscriptEntry[]) {
  const text = entries.map((entry) => `${entry.who}: ${entry.text}`).join("\n\n");
  return { text: text.slice(-DO_VOICE_REVIEW_LIMIT), shortened: text.length > DO_VOICE_REVIEW_LIMIT };
}
