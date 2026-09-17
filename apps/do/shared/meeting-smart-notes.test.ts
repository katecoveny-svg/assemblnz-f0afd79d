import { describe, expect, it } from 'vitest';
import {
  MEETING_SMART_NOTES_HEADINGS,
  formatDeepgramTranscript,
  parseMeetingSmartNotes,
} from './meeting-smart-notes';

describe('Meeting smart notes parser', () => {
  it('splits Granola-style sections by canonical headings including Attendees', () => {
    const text = [
      'Meeting notes',
      'Discussed Q3 launch timing.',
      '',
      'Attendees',
      'Alex, Jordan',
      '',
      'Decisions / outcomes',
      'Ship soft launch on 1 Oct.',
      '',
      'Action items',
      'Draft invite · Owner: Alex · Due: Friday',
      '',
      'Open questions',
      'Budget not confirmed.',
      '',
      'Suggested specialist DO',
      'Meeting DO — follow-up notes (draft)',
      '',
      'Follow-up email draft',
      'Subject: Soft launch',
      'Thanks for today…',
    ].join('\n');

    const sections = parseMeetingSmartNotes(text);
    expect(sections.map((s) => s.heading)).toEqual([...MEETING_SMART_NOTES_HEADINGS]);
    expect(sections[0].body).toContain('Q3 launch');
    expect(sections[1].body).toContain('Alex');
    expect(sections[3].body).toContain('Owner: Alex');
    expect(sections[6].body).toContain('Subject:');
  });

  it('falls back to a single notes block when headings are missing', () => {
    const sections = parseMeetingSmartNotes('Raw pasted paragraph only.');
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe('Meeting notes');
    expect(sections[0].body).toBe('Raw pasted paragraph only.');
  });
});

describe('formatDeepgramTranscript', () => {
  it('formats utterance diarisation as Speaker lines', () => {
    const result = formatDeepgramTranscript({
      transcript: 'ignored when utterances present',
      utterances: [
        { speaker: 0, transcript: 'Shall we ship Friday?' },
        { speaker: 1, transcript: 'Yes — Riley owns the invite.' },
      ],
    });
    expect(result.transcript).toBe(
      'Speaker 0: Shall we ship Friday?\nSpeaker 1: Yes — Riley owns the invite.',
    );
    expect(result.speakers).toEqual(['Speaker 0', 'Speaker 1']);
  });

  it('falls back to plain transcript when no diarisation', () => {
    const result = formatDeepgramTranscript({
      transcript: 'Alex will prepare the draft.',
    });
    expect(result).toEqual({
      transcript: 'Alex will prepare the draft.',
      speakers: [],
    });
  });
});
