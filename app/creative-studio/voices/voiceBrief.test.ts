import { describe, expect, it } from 'vitest';
import { formatVoiceBrief, voiceBrief } from './voiceBrief';
describe('Auckland voice brief', () => {
  it('exports all editable guidance before a separate untouched script', () => {
    const script = 'Hello, Auckland.';
    const edited = { ...voiceBrief, casual: 'My reviewed casual direction.' };
    const output = formatVoiceBrief(edited, script);
    for (const value of Object.values(edited)) expect(output).toContain(value);
    expect(output.endsWith('SEPARATE USER SCRIPT\n' + script)).toBe(true);
    expect(output.indexOf(edited.base)).toBeLessThan(output.indexOf('SEPARATE USER SCRIPT'));
  });
  it('keeps corrected identity, optional influence and unverified guarantees out of base direction', () => {
    expect(voiceBrief.base).not.toContain('Kate');
    expect(voiceBrief.base).not.toContain('Māori');
    expect(voiceBrief.optional).toContain('off by default');
    expect(voiceBrief.editorial).toContain('Sorry, that was a mistake');
    expect(voiceBrief.review).toContain('unverified');
  });
});
