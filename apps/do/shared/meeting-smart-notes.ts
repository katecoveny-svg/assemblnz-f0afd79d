/**
 * Meeting DO — Granola-inspired smart notes helpers.
 * Pipeline: Capture → Whisper-class STT → agent notes → review (drafts only).
 */

export const MEETING_SMART_NOTES_HEADINGS = [
  'Meeting notes',
  'Attendees',
  'Decisions / outcomes',
  'Action items',
  'Open questions',
  'Suggested specialist DO',
  'Follow-up email draft',
] as const;

export type MeetingSmartNotesHeading = (typeof MEETING_SMART_NOTES_HEADINGS)[number];

export type MeetingSmartNotesSection = {
  heading: string;
  body: string;
};

const HEADING_PATTERN = new RegExp(
  `^(${MEETING_SMART_NOTES_HEADINGS.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`,
  'i',
);

/** Split a smart-notes draft into labelled sections for the review surface. */
export function parseMeetingSmartNotes(text: string): MeetingSmartNotesSection[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const sections: MeetingSmartNotesSection[] = [];
  let current: MeetingSmartNotesSection | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim().replace(/^#{1,6}\s+/, '').replace(/^\*\*(.*?)\*\*:?$/, '$1').replace(/:$/, '');
    if (HEADING_PATTERN.test(trimmed)) {
      if (current) sections.push({ ...current, body: current.body.trim() });
      const canonical =
        MEETING_SMART_NOTES_HEADINGS.find((h) => h.toLowerCase() === trimmed.toLowerCase()) ?? trimmed;
      current = { heading: canonical, body: '' };
      continue;
    }
    if (!current) {
      current = { heading: 'Meeting notes', body: line };
      continue;
    }
    current.body = current.body ? `${current.body}\n${line}` : line;
  }

  if (current) sections.push({ ...current, body: current.body.trim() });
  return sections.filter((s) => s.heading || s.body);
}

export const MEETING_SMART_NOTES_BRIEF =
  'Produce Granola-style smart meeting notes from this transcript. Include attendees when named or diarised. Keep owners and dates only when stated. Drafts only — never send.';

export type DeepgramUtterance = {
  speaker?: number | string;
  transcript?: string;
};

export type DeepgramWord = {
  word?: string;
  speaker?: number | string;
  punctuated_word?: string;
};

/**
 * Prefer utterance diarisation; fall back to plain transcript.
 * Speaker labels stay as Speaker N — never invent real names.
 */
export function formatDeepgramTranscript(payload: {
  transcript?: string;
  utterances?: DeepgramUtterance[];
  words?: DeepgramWord[];
}): { transcript: string; speakers: string[] } {
  const utterances = Array.isArray(payload.utterances) ? payload.utterances : [];
  if (utterances.length > 0) {
    const lines: string[] = [];
    const speakers = new Set<string>();
    for (const u of utterances) {
      const text = typeof u.transcript === 'string' ? u.transcript.trim() : '';
      if (!text) continue;
      const label =
        u.speaker === undefined || u.speaker === null
          ? 'Speaker'
          : `Speaker ${u.speaker}`;
      speakers.add(label);
      lines.push(`${label}: ${text}`);
    }
    if (lines.length) {
      return { transcript: lines.join('\n'), speakers: [...speakers] };
    }
  }

  const words = Array.isArray(payload.words) ? payload.words : [];
  if (words.some((w) => w.speaker !== undefined && w.speaker !== null)) {
    const lines: string[] = [];
    const speakers = new Set<string>();
    let current: number | string | undefined;
    let buffer: string[] = [];
    const flush = () => {
      if (!buffer.length) return;
      const label = current === undefined || current === null ? 'Speaker' : `Speaker ${current}`;
      speakers.add(label);
      lines.push(`${label}: ${buffer.join(' ').trim()}`);
      buffer = [];
    };
    for (const w of words) {
      const token = (w.punctuated_word || w.word || '').trim();
      if (!token) continue;
      if (w.speaker !== current) {
        flush();
        current = w.speaker;
      }
      buffer.push(token);
    }
    flush();
    if (lines.length) {
      return { transcript: lines.join('\n'), speakers: [...speakers] };
    }
  }

  const transcript = typeof payload.transcript === 'string' ? payload.transcript.trim() : '';
  return { transcript, speakers: [] };
}
