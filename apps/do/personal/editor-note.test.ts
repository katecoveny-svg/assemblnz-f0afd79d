import { describe, expect, it } from 'vitest';
import { reviewAssistantNote } from './editor-note';
const empty = { message: '', context: '', working: false, hasResult: false };
describe('explicit editor note copy', () => {
  it('preserves exact text including macrons, whitespace and line breaks', () => {
    const text = '  Fictional whānau pitch\nKeep as a draft.  ';
    expect(reviewAssistantNote(text, empty)).toEqual({ accepted: true, text });
  });
  it('does not overwrite a message, added notes, running work or a result', () => {
    for (const editor of [{ ...empty, message: 'Newer edit' }, { ...empty, context: 'Existing notes' }, { ...empty, working: true }, { ...empty, hasResult: true }]) {
      expect(reviewAssistantNote('Fictional pitch', editor).accepted).toBe(false);
    }
  });
  it('rejects blank, malformed and oversized input without truncating', () => {
    for (const text of [null, '', '  ', 'bad\u0000text', '😀'.repeat(2001)]) expect(reviewAssistantNote(text, empty).accepted).toBe(false);
    expect(reviewAssistantNote('😀'.repeat(2000), empty).accepted).toBe(true);
  });
});
