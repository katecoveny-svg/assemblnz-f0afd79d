/** Explicit in-page copy into Ask DO; no save or provider authority. */
export const ASSISTANT_NOTE_EVENT = 'assembl:do-assistant-note';
export type AssistantNoteResult = { accepted: true; text: string } | { accepted: false; message: string };
export type AssistantNoteOffer = { text: string; purpose?: 'starter'; result?: AssistantNoteResult };
export function reviewAssistantNote(text: unknown, editor: { message: string; context: string; working: boolean; hasResult: boolean }): AssistantNoteResult {
  if (typeof text !== 'string' || !text.trim()) return { accepted: false, message: 'Add a note first.' };
  if (text.length > 4000) return { accepted: false, message: 'Ask DO accepts up to 4,000 characters. Shorten this note or keep using the checklist. Your original note is still here.' };
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) return { accepted: false, message: 'Remove control characters before copying this note. Your original note is still here.' };
  if (editor.working || editor.message.trim() || editor.context.trim() || editor.hasResult) return { accepted: false, message: 'Ask DO already contains work. Finish or clear that conversation before copying this note. Your original note is still here.' };
  return { accepted: true, text };
}

/** A click adds editable text; retain any current draft and never grant provider consent. */
export function reviewStarterPrompt(text: unknown, editor: { message: string; working: boolean }): AssistantNoteResult {
  if (editor.working) return { accepted: false, message: 'Wait for this reply before adding another thought. Your draft is still here.' };
  if (typeof text !== 'string' || !text.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) return { accepted: false, message: 'This starting thought could not be added.' };
  const next = editor.message.trim() ? `${editor.message}\n\n${text}` : text;
  if (next.length > 4000) return { accepted: false, message: 'Your draft is nearly full. Make some room before adding this thought; nothing has changed.' };
  return { accepted: true, text: next };
}
export function offerStarterPrompt(text: string): AssistantNoteResult {
  const offer: AssistantNoteOffer = { text, purpose: 'starter' };
  window.dispatchEvent(new CustomEvent(ASSISTANT_NOTE_EVENT, { detail: offer }));
  return offer.result ?? { accepted: false, message: 'The writing surface is not ready yet. Try this thought again in a moment.' };
}
