import { describe, expect, it } from 'vitest';
import { reviewAssistantNote, reviewStarterPrompt } from './editor-note';
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

describe('editable task starters', () => {
  it('fills an empty message and appends without losing existing whitespace or work', () => {
    expect(reviewStarterPrompt('Help me plan a trip. ', empty)).toEqual({ accepted: true, text: 'Help me plan a trip. ' });
    expect(reviewStarterPrompt('Next thought', { message: 'My whānau note\n  ', working: false })).toEqual({ accepted: true, text: 'My whānau note\n  \n\nNext thought' });
  });
  it('does not modify busy or full drafts and rejects invalid text', () => {
    expect(reviewStarterPrompt('Next', { message: 'Keep', working: true }).accepted).toBe(false);
    expect(reviewStarterPrompt('Next', { message: 'a'.repeat(3997), working: false }).accepted).toBe(false);
    for (const text of ['', null, 'bad\u0000text']) expect(reviewStarterPrompt(text, empty).accepted).toBe(false);
  });
});
