/** Explicit in-page copy into Ask DO; no save or provider authority. */
export const ASSISTANT_NOTE_EVENT = 'assembl:do-assistant-note';
export type AssistantNoteResult = { accepted: true; text: string } | { accepted: false; message: string };
export type AssistantNoteOffer = { text: string; result?: AssistantNoteResult };
export function reviewAssistantNote(text: unknown, editor: { message: string; context: string; working: boolean; hasResult: boolean }): AssistantNoteResult {
  if (typeof text !== 'string' || !text.trim()) return { accepted: false, message: 'Add a note first.' };
  if (text.length > 4000) return { accepted: false, message: 'Ask DO accepts up to 4,000 characters. Shorten this note or keep using the checklist. Your original note is still here.' };
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) return { accepted: false, message: 'Remove control characters before copying this note. Your original note is still here.' };
  if (editor.working || editor.message.trim() || editor.context.trim() || editor.hasResult) return { accepted: false, message: 'Ask DO already contains work. Finish or clear that conversation before copying this note. Your original note is still here.' };
  return { accepted: true, text };
}
